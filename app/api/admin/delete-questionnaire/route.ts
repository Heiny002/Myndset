import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    const { questionnaireId } = await request.json();

    if (!questionnaireId) {
      return NextResponse.json(
        { error: 'questionnaireId is required' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Check if questionnaire exists
    const { data: questionnaire, error: fetchError } = await adminClient
      .from('questionnaire_responses')
      .select('id')
      .eq('id', questionnaireId)
      .single();

    if (fetchError || !questionnaire) {
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      );
    }

    // Delete questionnaire (cascade deletes plans and meditations via RLS)
    const { error: deleteError } = await adminClient
      .from('questionnaire_responses')
      .delete()
      .eq('id', questionnaireId);

    if (deleteError) {
      console.error('Error deleting questionnaire:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete questionnaire' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, questionnaireId });
  } catch (error) {
    console.error('Error in delete-questionnaire:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
