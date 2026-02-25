import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/server';
import { generateEnergizingScript } from '@/lib/ai/energizing-script-generator';
import { logAPIUsage } from '@/lib/ai/cost-tracking';
import {
  buildPlanFromQuestionnaire,
  buildMappedDataFromQuestionnaire,
  type LabQuestionnaire,
} from '@/lib/ai/script-lab-chat';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      labQuestionnaire,
      voiceType = 'default',
      scriptMethod,
      customSystemPrompt,
      userId,
    } = body as {
      labQuestionnaire: LabQuestionnaire;
      voiceType?: string;
      scriptMethod?: string;
      customSystemPrompt?: string;
      userId: string;
    };

    if (!labQuestionnaire || !userId) {
      return NextResponse.json({ error: 'Missing required fields: labQuestionnaire, userId' }, { status: 400 });
    }

    const sessionLength = labQuestionnaire.sessionLength;
    if (!['ultra_quick', 'quick'].includes(sessionLength)) {
      return NextResponse.json({ error: 'Invalid sessionLength in questionnaire' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Step 1: Build mapped questionnaire data (no AI)
    const labQData = buildMappedDataFromQuestionnaire(labQuestionnaire, scriptMethod);

    // Step 2: Insert questionnaire_responses record
    const { data: questionnaireData, error: questionnaireError } = await adminClient
      .from('questionnaire_responses')
      .insert({
        user_id: userId,
        tier: 1,
        responses: {
          ...labQuestionnaire,
          lab: true,
          script_method: scriptMethod || null,
          has_custom_prompt: !!customSystemPrompt,
        } as any,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (questionnaireError) {
      console.error('[script-lab/generate] Questionnaire error:', questionnaireError);
      return NextResponse.json({ error: 'Failed to save questionnaire', details: questionnaireError.message }, { status: 500 });
    }

    // Step 3: Build plan (no AI)
    const labPlan = buildPlanFromQuestionnaire(labQuestionnaire, userId, questionnaireData.id);

    // Step 4: Insert meditation_plans record (pre-approved)
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

    // Step 5: Generate script (single AI call)
    console.log('[script-lab/generate] Generating script...', {
      persona: labQuestionnaire.persona.name,
      archetype: labQuestionnaire.persona.archetype,
      sessionLength,
      voiceType,
      hasScriptMethod: !!scriptMethod,
      hasCustomPrompt: !!customSystemPrompt,
    });

    const { script: energizingScript, aiResponse: scriptAiResponse } = await generateEnergizingScript(
      labPlan,
      labQData,
      voiceType,
      customSystemPrompt,
    );

    const scriptText = energizingScript.scriptText;
    const wordCount = energizingScript.wordCount;
    const durationSeconds = energizingScript.estimatedDurationSeconds;

    // Step 6: Insert meditations record (status: approved — audio can be generated immediately)
    const { data: meditationData, error: meditationError } = await adminClient
      .from('meditations')
      .insert({
        user_id: userId,
        meditation_plan_id: planData.id,
        title: `Lab: ${labQuestionnaire.persona.name} — ${labQuestionnaire.persona.archetype}`,
        description: labQuestionnaire.persona.background.substring(0, 200),
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
          user_type: labQuestionnaire.persona.archetype,
          persona_name: labQuestionnaire.persona.name,
          script_method: scriptMethod || null,
          has_custom_prompt: !!customSystemPrompt,
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
