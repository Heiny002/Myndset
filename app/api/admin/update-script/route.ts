import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    const supabase = await createClient();

    // Calculate new metrics
    const wordCount = scriptText.split(/\s+/).filter(Boolean).length;
    const estimatedDurationSeconds = Math.round((wordCount / 145) * 60);

    // Fetch existing script to preserve metadata
    const { data: existingScript } = await supabase
      .from('meditations')
      .select('techniques')
      .eq('id', scriptId)
      .single();

    const metadata = (existingScript?.techniques as any) || {};

    // Update script
    const { data, error } = await supabase
      .from('meditations')
      .update({
        script_text: scriptText,
        audio_duration_seconds: estimatedDurationSeconds,
        techniques: {
          ...metadata,
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
