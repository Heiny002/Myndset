import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { regenerateMeditationPlan } from '@/lib/ai/plan-generator';
import { logAPIUsage } from '@/lib/ai/cost-tracking';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { planId, feedback } = await request.json();

    if (!planId || !feedback) {
      return NextResponse.json(
        { error: 'planId and feedback are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch existing plan
    const { data: existingPlan, error: planError } = await supabase
      .from('meditation_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Fetch questionnaire
    const { data: questionnaire, error: questionnaireError } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('id', existingPlan.questionnaire_response_id)
      .single();

    if (questionnaireError || !questionnaire) {
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      );
    }

    // Convert existing plan to format expected by regeneration function
    const planData = existingPlan.plan_data as any;
    const originalPlan = {
      userId: existingPlan.user_id,
      questionnaireId: existingPlan.questionnaire_response_id,
      components: planData.components,
      sessionStructure: planData.sessionStructure,
      messagingFramework: planData.messagingFramework,
      overallRationale: planData.overallRationale,
      status: existingPlan.status,
      metadata: {
        generatedAt: existingPlan.created_at,
        model: planData.metadata?.model || 'claude-sonnet-4-20250514',
        inputTokens: planData.metadata?.input_tokens || 0,
        outputTokens: planData.metadata?.output_tokens || 0,
        costCents: planData.metadata?.cost_cents || 0,
      },
    };

    // Regenerate plan with feedback
    const responses = questionnaire.responses as Record<string, any>;
    const { plan: newPlan, aiResponse } = await regenerateMeditationPlan(
      originalPlan,
      {
        id: questionnaire.id,
        userId: questionnaire.user_id,
        primaryGoal: responses.primaryGoal,
        currentChallenge: responses.currentChallenge,
        sessionLength: responses.sessionLength,
        experienceLevel: responses.experienceLevel,
        skepticismLevel: responses.skepticismLevel,
        performanceContext: responses.performanceContext,
        preferredTime: responses.preferredTime,
        specificOutcome: responses.specificOutcome,
        tier: questionnaire.tier || 1,
        responses,
        createdAt: questionnaire.created_at,
      },
      feedback
    );

    // Update plan in database
    const { data: updatedPlan, error: updateError } = await supabase
      .from('meditation_plans')
      .update({
        plan_data: {
          components: newPlan.components,
          sessionStructure: newPlan.sessionStructure,
          messagingFramework: newPlan.messagingFramework,
          overallRationale: newPlan.overallRationale,
          metadata: {
            input_tokens: newPlan.metadata.inputTokens,
            output_tokens: newPlan.metadata.outputTokens,
            cost_cents: newPlan.metadata.costCents,
            model: newPlan.metadata.model,
            generated_at: newPlan.metadata.generatedAt,
            regeneration_feedback: feedback,
          },
        } as any,
        status: 'pending_approval',
      })
      .eq('id', planId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating plan:', updateError);
      return NextResponse.json(
        { error: 'Failed to update meditation plan' },
        { status: 500 }
      );
    }

    // Log API usage
    await logAPIUsage({
      userId: existingPlan.user_id,
      service: 'claude',
      operation: 'regenerate_meditation_plan',
      model: aiResponse.model,
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      costCents: aiResponse.costCents,
      metadata: {
        planId,
        feedback,
      },
    });

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
    });
  } catch (error) {
    console.error('Error regenerating plan:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to regenerate meditation plan' },
      { status: 500 }
    );
  }
}
