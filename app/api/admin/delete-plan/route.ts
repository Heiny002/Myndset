import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Check if plan exists and get related meditation IDs for cleanup
    const { data: plan, error: fetchError } = await adminClient
      .from('meditation_plans')
      .select('id, user_id')
      .eq('id', planId)
      .single();

    if (fetchError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Get associated meditations to delete from storage
    const { data: meditations } = await adminClient
      .from('meditations')
      .select('id, audio_url')
      .eq('meditation_plan_id', planId);

    // Delete audio files from storage if they exist
    if (meditations && meditations.length > 0) {
      const audioFilesToDelete = meditations
        .filter((m) => m.audio_url)
        .map((m) => {
          // Extract filename from URL
          const urlParts = m.audio_url!.split('/');
          return urlParts[urlParts.length - 1];
        });

      if (audioFilesToDelete.length > 0) {
        await adminClient.storage
          .from('meditation-audio')
          .remove(audioFilesToDelete)
          .catch((err) => console.error('Error deleting audio files:', err));
      }
    }

    // Delete all meditation records (cascade deletes remixes via RLS)
    const { error: deleteMediaError } = await adminClient
      .from('meditations')
      .delete()
      .eq('meditation_plan_id', planId);

    if (deleteMediaError) {
      console.error('Error deleting meditations:', deleteMediaError);
      return NextResponse.json(
        { error: 'Failed to delete associated meditations' },
        { status: 500 }
      );
    }

    // Delete the plan
    const { error: deletePlanError } = await adminClient
      .from('meditation_plans')
      .delete()
      .eq('id', planId);

    if (deletePlanError) {
      console.error('Error deleting plan:', deletePlanError);
      return NextResponse.json(
        { error: 'Failed to delete meditation plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, planId });
  } catch (error) {
    console.error('Error in delete-plan:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
