import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/server';
import { generateEnergizingScript } from '@/lib/ai/energizing-script-generator';
import { logAPIUsage } from '@/lib/ai/cost-tracking';
import {
  buildPlanFromQuestionnaire,
  buildMappedDataFromQuestionnaire,
  type LabQuestionnaire,
  type MixResult,
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
      activeMix,
    } = body as {
      labQuestionnaire: LabQuestionnaire;
      voiceType?: string;
      scriptMethod?: string;
      customSystemPrompt?: string;
      userId: string;
      activeMix?: MixResult;
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
    // Apply stage 1 interpretation override from mix if active
    const stage1Override = activeMix?.changes?.stage1_interpretation;
    const labQData = buildMappedDataFromQuestionnaire(labQuestionnaire, scriptMethod, stage1Override);
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
    // Apply stage 2 plan override from mix if active
    const planOverride = activeMix?.changes?.stage2_plan;
    const labPlan = buildPlanFromQuestionnaire(labQuestionnaire, userId, questionnaireData.id, planOverride);

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
    // Stage 3: manual customSystemPrompt takes priority over mix stage3_prompt
    const finalSystemPrompt = customSystemPrompt || activeMix?.changes?.stage3_prompt;

    console.log('[script-lab/generate] Generating script...', {
      persona: labQuestionnaire.persona.name,
      archetype: labQuestionnaire.persona.archetype,
      sessionLength,
      voiceType,
      hasScriptMethod: !!scriptMethod,
      hasCustomPrompt: !!customSystemPrompt,
      activeMix: activeMix?.changesId || null,
    });

    const { script: energizingScript, aiResponse: scriptAiResponse } = await generateEnergizingScript(
      labPlan,
      labQData,
      voiceType,
      finalSystemPrompt,
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
          mix_changes_id: activeMix?.changesId || null,
        },
        generation_cost_cents: Math.round(scriptAiResponse.costCents),
      })
      .select()
      .single();

    if (meditationError) {
      console.error('[script-lab/generate] Meditation error:', meditationError);
      return NextResponse.json({ error: 'Failed to save meditation', details: meditationError.message }, { status: 500 });
    }

    // If a mix was active, append this meditationId to the mix log entry
    if (activeMix?.changesId && meditationData.id) {
      const { data: mixRow } = await adminClient
        .from('lab_mix_log')
        .select('meditation_ids')
        .eq('changes_id', activeMix.changesId)
        .single();

      if (mixRow) {
        const currentIds: string[] = mixRow.meditation_ids || [];
        if (!currentIds.includes(meditationData.id)) {
          await adminClient
            .from('lab_mix_log')
            .update({ meditation_ids: [...currentIds, meditationData.id] })
            .eq('changes_id', activeMix.changesId);
        }
      }
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
