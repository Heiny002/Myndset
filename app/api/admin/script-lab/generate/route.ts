import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/server';
import { generateEnergizingScript } from '@/lib/ai/energizing-script-generator';
import { logAPIUsage } from '@/lib/ai/cost-tracking';
import { buildLabMeditationPlan, buildLabQuestionnaireData } from '@/lib/ai/script-lab-chat';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { contextString, sessionLength, voiceType = 'default', approach, userId } = body;

    if (!contextString || !sessionLength || !userId) {
      return NextResponse.json({ error: 'Missing required fields: contextString, sessionLength, userId' }, { status: 400 });
    }

    if (!['ultra_quick', 'quick'].includes(sessionLength)) {
      return NextResponse.json({ error: 'sessionLength must be ultra_quick or quick' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Step 1: Build plan + questionnaire data (no AI call)
    const labQuestionnaire = buildLabQuestionnaireData(contextString, sessionLength, approach);

    // Step 2: Insert questionnaire_responses record
    const { data: questionnaireData, error: questionnaireError } = await adminClient
      .from('questionnaire_responses')
      .insert({
        user_id: userId,
        tier: 1,
        responses: { ...labQuestionnaire.rawResponses, lab: true },
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (questionnaireError) {
      console.error('[script-lab/generate] Questionnaire error:', questionnaireError);
      return NextResponse.json({ error: 'Failed to save questionnaire', details: questionnaireError.message }, { status: 500 });
    }

    const labPlan = buildLabMeditationPlan(contextString, sessionLength, userId, questionnaireData.id);

    // Step 3: Insert meditation_plans record (pre-approved)
    const { data: planData, error: planError } = await adminClient
      .from('meditation_plans')
      .insert({
        user_id: userId,
        questionnaire_response_id: questionnaireData.id,
        plan_data: labPlan as any,
        status: 'approved',
      })
      .select()
      .single();

    if (planError) {
      console.error('[script-lab/generate] Plan error:', planError);
      return NextResponse.json({ error: 'Failed to save plan', details: planError.message }, { status: 500 });
    }

    // Step 4: Generate script (single AI call)
    console.log('[script-lab/generate] Generating script...');
    const { script: energizingScript, aiResponse: scriptAiResponse } = await generateEnergizingScript(
      labPlan,
      labQuestionnaire,
      voiceType,
    );

    const scriptText = energizingScript.scriptText;
    const wordCount = energizingScript.wordCount;
    const durationSeconds = energizingScript.estimatedDurationSeconds;

    // Step 5: Insert meditations record (status: approved so generate-audio works immediately)
    const { data: meditationData, error: meditationError } = await adminClient
      .from('meditations')
      .insert({
        user_id: userId,
        meditation_plan_id: planData.id,
        title: `Lab: ${contextString.substring(0, 60)}`,
        description: `Script Lab generation — ${sessionLength} — ${voiceType}`,
        script_text: scriptText,
        session_length: sessionLength,
        techniques: {
          status: 'approved',
          is_lab: true,
          word_count: wordCount,
          duration_seconds: durationSeconds,
          version: 1,
          tokens_used: scriptAiResponse.inputTokens + scriptAiResponse.outputTokens,
          cost_cents: scriptAiResponse.costCents,
          model: scriptAiResponse.model || 'claude-sonnet-4-5',
          generated_at: new Date().toISOString(),
          script_type: 'energizing',
          user_type: labQuestionnaire.userType,
          context_string: contextString,
          approach: approach || null,
          voice_type: voiceType,
          elevenlabs_guidance: energizingScript.elevenLabsGuidance,
        },
        generation_cost_cents: Math.round(scriptAiResponse.costCents),
      })
      .select()
      .single();

    if (meditationError) {
      console.error('[script-lab/generate] Meditation error:', meditationError);
      return NextResponse.json({ error: 'Failed to save meditation', details: meditationError.message }, { status: 500 });
    }

    // Log usage
    await logAPIUsage({
      userId,
      service: 'claude',
      operation: 'lab_script_generation',
      inputTokens: scriptAiResponse.inputTokens,
      outputTokens: scriptAiResponse.outputTokens,
      costCents: scriptAiResponse.costCents,
    });

    return NextResponse.json({
      success: true,
      meditationId: meditationData.id,
      scriptText,
      wordCount,
      durationSeconds,
      costCents: scriptAiResponse.costCents,
    });
  } catch (error) {
    console.error('[script-lab/generate] Error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
