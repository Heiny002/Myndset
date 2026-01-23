import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { generateMeditationPlanFromQuestionnaire } from '@/lib/ai/plan-generator';
import { logAPIUsage } from '@/lib/ai/cost-tracking';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { questionnaireId } = await request.json();

    if (!questionnaireId) {
      return NextResponse.json(
        { error: 'questionnaireId is required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Fetch questionnaire (use admin client to bypass RLS)
    const { data: questionnaire, error: questionnaireError } = await adminClient
      .from('questionnaire_responses')
      .select('*')
      .eq('id', questionnaireId)
      .single();

    if (questionnaireError || !questionnaire) {
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      );
    }

    // Check if plan already exists (use admin client to bypass RLS)
    const { data: existingPlan } = await adminClient
      .from('meditation_plans')
      .select('id')
      .eq('questionnaire_response_id', questionnaireId)
      .single();

    if (existingPlan) {
      return NextResponse.json(
        { error: 'Plan already exists for this questionnaire', planId: existingPlan.id },
        { status: 400 }
      );
    }

    // Generate meditation plan using AI
    const responses = questionnaire.responses as Record<string, any>;
    const { plan, aiResponse } = await generateMeditationPlanFromQuestionnaire({
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
    });

    // Save plan to database (use admin client to bypass RLS)
    const { data: savedPlan, error: saveError } = await adminClient
      .from('meditation_plans')
      .insert([
        {
          user_id: plan.userId,
          questionnaire_response_id: plan.questionnaireId,
          plan_data: {
            components: plan.components,
            sessionStructure: plan.sessionStructure,
            messagingFramework: plan.messagingFramework,
            overallRationale: plan.overallRationale,
            metadata: {
              input_tokens: plan.metadata.inputTokens,
              output_tokens: plan.metadata.outputTokens,
              cost_cents: plan.metadata.costCents,
              model: plan.metadata.model,
              generated_at: plan.metadata.generatedAt,
            },
          } as any,
          status: plan.status,
        },
      ])
      .select()
      .single();

    if (saveError) {
      console.error('Error saving plan:', saveError);
      return NextResponse.json(
        { error: 'Failed to save meditation plan' },
        { status: 500 }
      );
    }

    // Log API usage for cost tracking
    await logAPIUsage({
      userId: plan.userId,
      service: 'claude',
      operation: 'generate_meditation_plan',
      model: aiResponse.model,
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      costCents: aiResponse.costCents,
      metadata: {
        questionnaireId,
        planId: savedPlan.id,
      },
    });

    return NextResponse.json({
      success: true,
      planId: savedPlan.id,
      plan: savedPlan,
    });
  } catch (error) {
    console.error('Error generating plan:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to generate meditation plan' },
      { status: 500 }
    );
  }
}
