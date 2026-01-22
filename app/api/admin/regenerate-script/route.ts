import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { regenerateScript } from '@/lib/ai/script-generator';
import { logAPIUsage } from '@/lib/ai/cost-tracking';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { scriptId, feedback } = await request.json();

    if (!scriptId || !feedback) {
      return NextResponse.json(
        { error: 'scriptId and feedback are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch existing script
    const { data: existingScript, error: scriptError } = await supabase
      .from('meditations')
      .select('*')
      .eq('id', scriptId)
      .single();

    if (scriptError || !existingScript) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }

    // Fetch plan
    const { data: plan, error: planError } = await supabase
      .from('meditation_plans')
      .select('*')
      .eq('id', existingScript.meditation_plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Fetch questionnaire
    const { data: questionnaire } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('id', plan.questionnaire_response_id)
      .single();

    // Convert to format expected by regeneration function
    const planData = plan.plan_data as any;
    const scriptMetadata = (existingScript.techniques as any) || {};

    const meditationPlan = {
      userId: plan.user_id,
      questionnaireId: plan.questionnaire_response_id,
      components: planData.components,
      sessionStructure: planData.sessionStructure,
      messagingFramework: planData.messagingFramework,
      overallRationale: planData.overallRationale,
      status: plan.status,
      metadata: {
        generatedAt: planData.metadata?.generated_at || plan.created_at,
        model: planData.metadata?.model || 'claude-sonnet-4-20250514',
        inputTokens: planData.metadata?.input_tokens || 0,
        outputTokens: planData.metadata?.output_tokens || 0,
        costCents: planData.metadata?.cost_cents || 0,
      },
    };

    const originalScript = {
      meditationPlanId: existingScript.meditation_plan_id,
      userId: existingScript.user_id,
      scriptText: existingScript.script_text,
      wordCount: scriptMetadata?.word_count || 0,
      estimatedDurationSeconds: scriptMetadata?.estimated_duration_seconds || 0,
      status: scriptMetadata?.status || 'pending_approval',
      version: scriptMetadata?.version || 1,
      metadata: {
        generatedAt: scriptMetadata?.generated_at || existingScript.created_at,
        model: scriptMetadata?.model || 'claude-sonnet-4-20250514',
        inputTokens: scriptMetadata?.input_tokens || 0,
        outputTokens: scriptMetadata?.output_tokens || 0,
        costCents: scriptMetadata?.cost_cents || 0,
      },
    };

    // Regenerate script
    const questionnaireResponses = questionnaire?.responses as Record<string, any>;
    const { script: newScript, aiResponse } = await regenerateScript(
      originalScript,
      meditationPlan,
      feedback,
      questionnaireResponses?.specificOutcome
        ? { specificOutcome: questionnaireResponses.specificOutcome }
        : undefined
    );

    // Update script in database
    const { data: updatedScript, error: updateError } = await supabase
      .from('meditations')
      .update({
        script_text: newScript.scriptText,
        audio_duration_seconds: newScript.estimatedDurationSeconds,
        generation_cost_cents: aiResponse.costCents,
        techniques: {
          status: 'pending_approval',
          word_count: newScript.wordCount,
          estimated_duration_seconds: newScript.estimatedDurationSeconds,
          version: newScript.version,
          input_tokens: aiResponse.inputTokens,
          output_tokens: aiResponse.outputTokens,
          cost_cents: aiResponse.costCents,
          model: aiResponse.model,
          generated_at: new Date().toISOString(),
          regeneration_feedback: feedback,
        } as any,
      })
      .eq('id', scriptId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating script:', updateError);
      return NextResponse.json(
        { error: 'Failed to update meditation script' },
        { status: 500 }
      );
    }

    // Log API usage
    await logAPIUsage({
      userId: existingScript.user_id,
      service: 'claude',
      operation: 'regenerate_meditation_script',
      model: aiResponse.model,
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      costCents: aiResponse.costCents,
      metadata: {
        scriptId,
        feedback,
      },
    });

    return NextResponse.json({
      success: true,
      script: updatedScript,
    });
  } catch (error) {
    console.error('Error regenerating script:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to regenerate meditation script' },
      { status: 500 }
    );
  }
}
