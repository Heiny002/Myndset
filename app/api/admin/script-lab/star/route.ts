import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { meditationId, starred } = body;

    if (!meditationId || typeof starred !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields: meditationId, starred' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('meditations')
      .update({ is_favorite: starred })
      .eq('id', meditationId);

    if (error) {
      console.error('[script-lab/star] Update error:', error);
      return NextResponse.json({ error: 'Failed to update favorite status', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[script-lab/star] Error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
