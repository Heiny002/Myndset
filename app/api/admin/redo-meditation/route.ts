import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';
import {
  generateMeditationScript,
  regenerateScript,
  ScriptStyle,
} from '@/lib/ai/script-generator';
import { mapQuestionnaireResponses } from '@/lib/questionnaire/response-mapper';

/**
 * POST /api/admin/redo-meditation
 *
 * Allows admin to regenerate a completed meditation with a new mode (energizing/calming).
 * Archives the current version before generating the new one.
 *
 * Body:
 * - meditationId: UUID of the meditation to redo
 * - mode: 'energizing' | 'calming' (new script style)
 * - feedback?: Optional feedback for regeneration
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { meditationId, mode, feedback } = await request.json();

    if (!meditationId) {
      return NextResponse.json(
        { error: 'meditationId is required' },
        { status: 400 }
      );
    }

    if (!mode || !['energizing', 'calming'].includes(mode)) {
      return NextResponse.json(
        { error: 'mode must be either "energizing" or "calming"' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Fetch the meditation
    const { data: meditation, error: meditationError } = await adminClient
      .from('meditations')
      .select('*, meditation_plans(*)')
      .eq('id', meditationId)
      .single();

    if (meditationError || !meditation) {
      return NextResponse.json(
        { error: 'Meditation not found' },
        { status: 404 }
      );
    }

    // 2. Archive the current version using the database function
    const { data: archiveResult, error: archiveError } = await adminClient.rpc(
      'archive_meditation_version',
      { p_meditation_id: meditationId }
    );

    if (archiveError) {
      console.error('Error archiving meditation version:', archiveError);

      // Provide detailed error for debugging
      let errorMessage = 'Failed to archive current version';
      if (archiveError.message?.includes('could not be found') || archiveError.code === '42883') {
        errorMessage = 'Database migration not applied. Please run the migration in Supabase SQL Editor.';
      } else if (archiveError.message) {
        errorMessage = `Archive failed: ${archiveError.message}`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: archiveError.message,
          hint: 'See APPLY_MIGRATION_INSTRUCTIONS.md for step-by-step guide',
          migrationUrl: 'https://supabase.com/dashboard/project/crhduxupcvfbvchslbcn/sql/new'
        },
        { status: 500 }
      );
    }

    console.log('[redo-meditation] Archived version:', archiveResult);

    // 3. Generate new script with the specified mode
    const plan = meditation.meditation_plans;
    if (!plan) {
      return NextResponse.json(
        { error: 'Meditation plan not found' },
        { status: 404 }
      );
    }

    // Fetch questionnaire data for proper duration and context
    let mappedQuestionnaire;
    try {
      const { data: questionnaireData } = await adminClient
        .from('questionnaire_responses')
        .select('*')
        .eq('id', plan.questionnaire_response_id)
        .single();

      if (questionnaireData) {
        const responses = questionnaireData.responses as Record<string, any>;
        if (responses) {
          mappedQuestionnaire = mapQuestionnaireResponses(responses);
        }
      }
    } catch (e) {
      console.warn('[redo-meditation] Could not fetch questionnaire data:', e);
    }

    let newScript;

    try {
      // Always generate a fresh script with the new mode
      const scriptResult = await generateMeditationScript(
        plan.plan_data as any,
        mappedQuestionnaire,
        mode as ScriptStyle
      );

      newScript = scriptResult.script;
    } catch (scriptError) {
      console.error('Error generating new script:', scriptError);
      return NextResponse.json(
        {
          error: 'Failed to generate new script',
          details: scriptError instanceof Error ? scriptError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Validate script content before update
    if (!newScript?.scriptText) {
      console.error('[redo-meditation] Script text is missing:', newScript);
      return NextResponse.json(
        { error: 'Generated script is empty or invalid' },
        { status: 500 }
      );
    }

    // 4. Update the meditation with new script (audio will be null, needs regeneration)
    const scriptMetadata = {
      status: 'pending_approval',
      version: ((meditation.techniques as any)?.version || 1) + 1,
      scriptStyle: mode,
      model: newScript.metadata.model,
      inputTokens: newScript.metadata.inputTokens,
      outputTokens: newScript.metadata.outputTokens,
      costCents: newScript.metadata.costCents,
      generatedAt: newScript.metadata.generatedAt,
      redo_from_mode: (meditation.techniques as any)?.scriptStyle || 'unknown',
      redo_feedback: feedback || null,
    };

    // Ensure cost is an integer for the database
    const costCentsInt = Math.round(newScript.metadata.costCents || 0);

    console.log('[redo-meditation] Updating meditation with:', {
      meditationId,
      scriptTextLength: newScript.scriptText?.length,
      mode,
      costCents: costCentsInt,
    });

    const { data: updatedMeditation, error: updateError } = await adminClient
      .from('meditations')
      .update({
        script_text: newScript.scriptText,
        audio_url: null, // Clear audio URL - needs to be regenerated
        audio_duration_seconds: null,
        voice_id: null,
        techniques: scriptMetadata as any,
        generation_cost_cents: costCentsInt,
        // updated_at is handled by database trigger
      })
      .eq('id', meditationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating meditation:', updateError);
      return NextResponse.json(
        {
          error: 'Failed to update meditation with new script',
          details: updateError.message,
          hint: updateError.hint,
          code: updateError.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      meditation: updatedMeditation,
      archivedVersionId: archiveResult,
      message: `Meditation regenerated with ${mode} mode. Previous version archived. Audio needs to be regenerated.`,
    });
  } catch (error) {
    console.error('Error in redo-meditation:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to redo meditation' },
      { status: 500 }
    );
  }
}
