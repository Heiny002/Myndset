import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { generateText, ORCHESTRATOR_MODEL } from '@/lib/ai/claude';
import { createAdminClient } from '@/lib/supabase/server';
import { logAPIUsage } from '@/lib/ai/cost-tracking';
import {
  buildMixGeneratorPrompt,
  type LabQuestionnaire,
  type MixResult,
} from '@/lib/ai/script-lab-chat';

// ─── POST: Generate a new mix ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { questionnaire, previousMixes = [] } = body as {
      questionnaire: LabQuestionnaire;
      previousMixes?: Array<{ changesId: string; description: string; intensity: string }>;
    };

    if (!questionnaire) {
      return NextResponse.json({ error: 'Missing questionnaire' }, { status: 400 });
    }

    const prompt = buildMixGeneratorPrompt(questionnaire, previousMixes);

    const aiResponse = await generateText(
      'Generate a creative pipeline variation for this questionnaire.',
      {
        model: ORCHESTRATOR_MODEL,
        systemPrompt: prompt,
        maxTokens: 3000,
        temperature: 0.9,
      },
    );

    // Parse JSON response
    let mix: MixResult;
    try {
      const raw = aiResponse.content.trim().replace(/^```json?\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(raw);

      if (!parsed.changesId || !parsed.changes || !parsed.intensity) {
        throw new Error('Invalid mix structure');
      }
      // Ensure changesId starts with MIX-
      if (!parsed.changesId.startsWith('MIX-')) {
        parsed.changesId = `MIX-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
      }
      mix = parsed as MixResult;
    } catch (parseError) {
      console.error('[mix] Parse error:', parseError);
      console.error('[mix] Raw:', aiResponse.content.substring(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse mix JSON', details: String(parseError) },
        { status: 500 },
      );
    }

    // Save to DB
    const adminClient = createAdminClient();
    const { error: insertError } = await adminClient.from('lab_mix_log').insert({
      changes_id: mix.changesId,
      description: mix.description,
      rationale: mix.rationale || null,
      intensity: mix.intensity,
      changed_stages: mix.changedStages,
      changes: mix.changes as any,
      meditation_ids: [],
      starred: false,
    });

    if (insertError) {
      // Duplicate changesId — regenerate with a unique suffix and retry
      if (insertError.code === '23505') {
        mix.changesId = `MIX-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
        await adminClient.from('lab_mix_log').insert({
          changes_id: mix.changesId,
          description: mix.description,
          rationale: mix.rationale || null,
          intensity: mix.intensity,
          changed_stages: mix.changedStages,
          changes: mix.changes as any,
          meditation_ids: [],
          starred: false,
        });
      } else {
        console.error('[mix] DB insert error:', insertError);
        // Non-fatal — still return the mix even if logging fails
      }
    }

    // Log API usage
    const adminId = 'admin';
    await logAPIUsage({
      userId: adminId,
      service: 'claude',
      operation: 'lab_mix_generation',
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      costCents: aiResponse.costCents,
    }).catch(() => {});

    return NextResponse.json({ success: true, mix, costCents: aiResponse.costCents });
  } catch (error) {
    console.error('[mix] Error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}

// ─── GET: Fetch mix log (most recent 50) ─────────────────────────────────────

export async function GET() {
  try {
    await requireAdmin();

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('lab_mix_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch mix log', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, mixLog: data || [] });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PATCH: Update star status or append a meditationId ──────────────────────

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { changesId, starred, meditationId } = body as {
      changesId: string;
      starred?: boolean;
      meditationId?: string;
    };

    if (!changesId) {
      return NextResponse.json({ error: 'Missing changesId' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    if (typeof starred === 'boolean') {
      const { error } = await adminClient
        .from('lab_mix_log')
        .update({ starred })
        .eq('changes_id', changesId);

      if (error) {
        return NextResponse.json({ error: 'Failed to update star', details: error.message }, { status: 500 });
      }
    }

    if (meditationId) {
      // Append meditationId to the array (avoid duplicates)
      const { data: existing } = await adminClient
        .from('lab_mix_log')
        .select('meditation_ids')
        .eq('changes_id', changesId)
        .single();

      if (existing) {
        const currentIds: string[] = existing.meditation_ids || [];
        if (!currentIds.includes(meditationId)) {
          await adminClient
            .from('lab_mix_log')
            .update({ meditation_ids: [...currentIds, meditationId] })
            .eq('changes_id', changesId);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
