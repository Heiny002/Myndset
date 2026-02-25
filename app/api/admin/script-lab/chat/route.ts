import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { streamMessage } from '@/lib/ai/claude';
import { buildScriptLabSystemPrompt } from '@/lib/ai/script-lab-chat';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { messages, currentScript, contextString, sessionLength } = body;

    if (!messages || !contextString || !sessionLength) {
      return NextResponse.json({ error: 'Missing required fields: messages, contextString, sessionLength' }, { status: 400 });
    }

    const systemPrompt = buildScriptLabSystemPrompt(currentScript || '', contextString, sessionLength);

    const stream = streamMessage(messages, {
      maxTokens: 4096,
      temperature: 0.7,
      systemPrompt,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[script-lab/chat] Error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
