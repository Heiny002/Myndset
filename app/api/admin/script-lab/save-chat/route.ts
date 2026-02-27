import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      sessionId,
      userId,
      messages,
      meditationId,
      questionnaire,
      sessionLength,
      scriptMethod,
      customPromptUsed,
    } = body;

    if (!userId || !messages) {
      return NextResponse.json({ error: 'Missing required fields: userId, messages' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    if (sessionId) {
      // Update existing session
      const { error } = await adminClient
        .from('lab_chat_sessions')
        .update({
          messages,
          meditation_id: meditationId || null,
          script_method: scriptMethod || null,
          custom_prompt_used: !!customPromptUsed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        console.error('[save-chat] Update error:', error);
        return NextResponse.json({ error: 'Failed to update chat session', details: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, sessionId });
    } else {
      // Create new session
      const { data, error } = await adminClient
        .from('lab_chat_sessions')
        .insert({
          user_id: userId,
          meditation_id: meditationId || null,
          messages,
          questionnaire: questionnaire || null,
          session_length: sessionLength || null,
          script_method: scriptMethod || null,
          custom_prompt_used: !!customPromptUsed,
        })
        .select('id')
        .single();

      if (error) {
        console.error('[save-chat] Insert error:', error);
        return NextResponse.json({ error: 'Failed to create chat session', details: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, sessionId: data.id });
    }
  } catch (error) {
    console.error('[save-chat] Error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
