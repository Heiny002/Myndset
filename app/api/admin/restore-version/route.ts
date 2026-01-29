import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

/**
 * POST /api/admin/restore-version
 *
 * Restores a historical meditation version as the current live version.
 * Archives the current version before restoration.
 *
 * Body:
 * - versionId: UUID of the version to restore
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { versionId } = await request.json();

    if (!versionId) {
      return NextResponse.json(
        { error: 'versionId is required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Call the database function to restore this version
    const { data: meditationId, error } = await adminClient.rpc(
      'set_meditation_version_live',
      { p_version_id: versionId }
    );

    if (error) {
      console.error('Error restoring version:', error);
      return NextResponse.json(
        { error: 'Failed to restore version', details: error.message },
        { status: 500 }
      );
    }

    console.log('[restore-version] Restored version:', versionId, 'for meditation:', meditationId);

    return NextResponse.json({
      success: true,
      meditationId,
      message: 'Version restored successfully',
    });
  } catch (error) {
    console.error('Error in restore-version:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to restore version' },
      { status: 500 }
    );
  }
}
