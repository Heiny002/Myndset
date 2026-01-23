import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Update plan status to approved
    const { data, error } = await adminClient
      .from('meditation_plans')
      .update({ status: 'approved' })
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      console.error('Error approving plan:', error);
      return NextResponse.json({ error: 'Failed to approve plan' }, { status: 500 });
    }

    return NextResponse.json({ success: true, plan: data });
  } catch (error) {
    console.error('Error approving plan:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to approve plan' }, { status: 500 });
  }
}
