import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { scriptId } = await request.json();

    if (!scriptId) {
      return NextResponse.json({ error: 'scriptId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch existing script to get current metadata
    const { data: existingScript } = await supabase
      .from('meditations')
      .select('techniques')
      .eq('id', scriptId)
      .single();

    const currentMetadata = (existingScript?.techniques as any) || {};

    // Update script status to approved in techniques metadata
    const { data, error } = await supabase
      .from('meditations')
      .update({
        techniques: {
          ...currentMetadata,
          status: 'approved',
          approved_at: new Date().toISOString(),
        } as any,
      })
      .eq('id', scriptId)
      .select()
      .single();

    if (error) {
      console.error('Error approving script:', error);
      return NextResponse.json(
        { error: 'Failed to approve script' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, script: data });
  } catch (error) {
    console.error('Error approving script:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to approve script' },
      { status: 500 }
    );
  }
}
