import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import { generateMeditationPlanFromQuestionnaire } from '@/lib/ai/plan-generator';
import { logAPIUsage } from '@/lib/ai/cost-tracking';

export async function POST(request: NextRequest) {
  try {
    console.log('[generate-plan] Starting plan generation...');
    console.log('[generate-plan] ENV check - ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);
    console.log('[generate-plan] ENV check - length:', process.env.ANTHROPIC_API_KEY?.length || 0);

    // Verify admin access
    await requireAdmin();
    console.log('[generate-plan] Admin access verified');

    const { questionnaireId } = await request.json();
    console.log('[generate-plan] Questionnaire ID:', questionnaireId);

    if (!questionnaireId) {
      return NextResponse.json(
        { error: 'questionnaireId is required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    console.log('[generate-plan] Admin client created');

    // Fetch questionnaire (use admin client to bypass RLS)
    console.log('[generate-plan] Fetching questionnaire...');
    const { data: questionnaire, error: questionnaireError } = await adminClient
      .from('questionnaire_responses')
      .select('*')
      .eq('id', questionnaireId)
      .single();

    if (questionnaireError || !questionnaire) {
      console.error('[generate-plan] Questionnaire not found:', questionnaireError);
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      );
    }

    console.log('[generate-plan] Questionnaire found:', questionnaire.id);

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
    console.log('[generate-plan] Starting AI generation...');
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
    console.error('[generate-plan] ERROR:', error);
    console.error('[generate-plan] Error stack:', error instanceof Error ? error.stack : 'No stack');

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Return detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate meditation plan: ${errorMessage}` },
      { status: 500 }
    );
  }
}
