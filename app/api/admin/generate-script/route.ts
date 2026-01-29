import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { generateMeditationScript } from '@/lib/ai/script-generator';
import { logAPIUsage } from '@/lib/ai/cost-tracking';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Fetch approved plan (use admin client to bypass RLS)
    const { data: plan, error: planError } = await adminClient
      .from('meditation_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check plan is approved
    if (plan.status !== 'approved') {
      return NextResponse.json(
        { error: 'Plan must be approved before generating script' },
        { status: 400 }
      );
    }

    // Check if script already exists (use admin client to bypass RLS)
    const { data: existingScript } = await adminClient
      .from('meditations')
      .select('id')
      .eq('meditation_plan_id', planId)
      .single();

    if (existingScript) {
      return NextResponse.json(
        {
          error: 'Script already exists for this plan',
          scriptId: existingScript.id,
        },
        { status: 400 }
      );
    }

    // Fetch questionnaire for specific outcome (use admin client to bypass RLS)
    const { data: questionnaire } = await adminClient
      .from('questionnaire_responses')
      .select('*')
      .eq('id', plan.questionnaire_response_id)
      .single();

    // Convert plan to format expected by script generator
    const planData = plan.plan_data as any;
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

    // Generate script
    const questionnaireResponses = questionnaire?.responses as Record<string, any>;
    const { script, aiResponse } = await generateMeditationScript(
      meditationPlan,
      questionnaireResponses?.specificOutcome
        ? { specificOutcome: questionnaireResponses.specificOutcome }
        : undefined
    );

    // Save script to database (use admin client to bypass RLS)
    const { data: savedScript, error: saveError } = await adminClient
      .from('meditations')
      .insert([
        {
          user_id: plan.user_id,
          meditation_plan_id: planId,
          title: `${script.scriptStyle === 'energizing' ? 'Energizing' : 'Calming'} Session for ${planData.messagingFramework.audienceType}`,
          description: planData.overallRationale,
          script_text: script.scriptText,
          audio_duration_seconds: Math.round(script.estimatedDurationSeconds),
          generation_cost_cents: Math.round(aiResponse.costCents),
          techniques: {
            status: 'pending_approval',
            word_count: script.wordCount,
            estimated_duration_seconds: script.estimatedDurationSeconds,
            version: script.version,
            script_style: script.scriptStyle || 'energizing',
            eleven_labs_guidance: script.elevenLabsGuidance,
            input_tokens: aiResponse.inputTokens,
            output_tokens: aiResponse.outputTokens,
            cost_cents: aiResponse.costCents,
            model: aiResponse.model,
            generated_at: new Date().toISOString(),
          } as any,
        },
      ])
      .select()
      .single();

    if (saveError) {
      console.error('Error saving script:', saveError);
      return NextResponse.json(
        { error: 'Failed to save meditation script' },
        { status: 500 }
      );
    }

    // Log API usage
    await logAPIUsage({
      userId: plan.user_id,
      service: 'claude',
      operation: 'generate_meditation_script',
      model: aiResponse.model,
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      costCents: aiResponse.costCents,
      metadata: {
        planId,
        scriptId: savedScript.id,
        wordCount: script.wordCount,
      },
    });

    return NextResponse.json({
      success: true,
      scriptId: savedScript.id,
      script: savedScript,
    });
  } catch (error) {
    console.error('Error generating script:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to generate meditation script' },
      { status: 500 }
    );
  }
}
