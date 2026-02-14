import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { scriptId, scriptText } = await request.json();

    if (!scriptId || !scriptText) {
      return NextResponse.json(
        { error: 'scriptId and scriptText are required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Calculate new metrics
    const wordCount = scriptText.split(/\s+/).filter(Boolean).length;
    const estimatedDurationSeconds = Math.round((wordCount / 145) * 60);

    // Fetch existing script to preserve metadata
    const { data: existingScript } = await adminClient
      .from('meditations')
      .select('techniques')
      .eq('id', scriptId)
      .single();

    const metadata = (existingScript?.techniques as any) || {};
    const wasApproved = metadata.status === 'approved';

    // Fetch full record to check for audio_url if was approved
    let audioUrl: string | null = null;
    if (wasApproved) {
      const { data: fullRecord } = await adminClient
        .from('meditations')
        .select('audio_url, user_id')
        .eq('id', scriptId)
        .single();

      if (fullRecord?.audio_url) {
        audioUrl = fullRecord.audio_url;
        // Delete old audio file
        const oldFileName = `${fullRecord.user_id}/${scriptId}.mp3`;
        await adminClient.storage
          .from('meditation-audio')
          .remove([oldFileName]);
      }
    }

    // Update script (reset status to pending_approval and clear audio if was approved)
    const { data, error } = await adminClient
      .from('meditations')
      .update({
        script_text: scriptText,
        audio_duration_seconds: estimatedDurationSeconds,
        ...(wasApproved ? { audio_url: null, voice_id: null } : {}),
        techniques: {
          ...metadata,
          status: 'pending_approval',
          word_count: wordCount,
          estimated_duration_seconds: estimatedDurationSeconds,
          last_edited: new Date().toISOString(),
        } as any,
      })
      .eq('id', scriptId)
      .select()
      .single();

    if (error) {
      console.error('Error updating script:', error);
      return NextResponse.json(
        { error: 'Failed to update script' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, script: data });
  } catch (error) {
    console.error('Error updating script:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to update script' }, { status: 500 });
  }
}
