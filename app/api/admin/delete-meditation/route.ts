import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { meditationId } = await request.json();

    if (!meditationId) {
      return NextResponse.json(
        { error: 'meditationId is required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Check if meditation exists
    const { data: meditation, error: fetchError } = await adminClient
      .from('meditations')
      .select('id, audio_url')
      .eq('id', meditationId)
      .single();

    if (fetchError || !meditation) {
      return NextResponse.json(
        { error: 'Meditation not found' },
        { status: 404 }
      );
    }

    // Delete audio file from storage if it exists
    if (meditation.audio_url) {
      const urlParts = meditation.audio_url.split('/');
      const filename = urlParts[urlParts.length - 1];

      await adminClient.storage
        .from('meditation-audio')
        .remove([filename])
        .catch((err) => console.error('Error deleting audio file:', err));
    }

    // Delete all remixes associated with this meditation
    const { error: deleteRemixesError } = await adminClient
      .from('meditation_remixes')
      .delete()
      .eq('original_meditation_id', meditationId);

    if (deleteRemixesError) {
      console.error('Error deleting remixes:', deleteRemixesError);
      return NextResponse.json(
        { error: 'Failed to delete associated remixes' },
        { status: 500 }
      );
    }

    // Delete the meditation
    const { error: deleteError } = await adminClient
      .from('meditations')
      .delete()
      .eq('id', meditationId);

    if (deleteError) {
      console.error('Error deleting meditation:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete meditation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, meditationId });
  } catch (error) {
    console.error('Error in delete-meditation:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
