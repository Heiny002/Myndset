import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { regenerateMeditationPlan } from '@/lib/ai/plan-generator';
import { logAPIUsage } from '@/lib/ai/cost-tracking';
import { mapQuestionnaireResponses } from '@/lib/questionnaire/response-mapper';

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

    const adminClient = createAdminClient();

    // Fetch existing plan
    const { data: existingPlan, error: planError } = await adminClient
      .from('meditation_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Fetch questionnaire
    const { data: questionnaire, error: questionnaireError } = await adminClient
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

    // Map questionnaire responses to the format expected by plan generator
    const mappedData = mapQuestionnaireResponses(responses);

    const { plan: newPlan, aiResponse } = await regenerateMeditationPlan(
      originalPlan,
      {
        id: questionnaire.id,
        userId: questionnaire.user_id,
        primaryGoal: mappedData.primaryGoal,
        currentChallenge: mappedData.currentChallenge,
        sessionLength: mappedData.sessionLength,
        experienceLevel: mappedData.experienceLevel,
        skepticismLevel: mappedData.skepticismLevel,
        performanceContext: mappedData.performanceContext,
        preferredTime: mappedData.preferredTime,
        specificOutcome: mappedData.specificOutcome,
        tier: questionnaire.tier || 1,
        responses,
        createdAt: questionnaire.created_at,
      },
      feedback
    );

    // Update plan in database
    const { data: updatedPlan, error: updateError } = await adminClient
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
