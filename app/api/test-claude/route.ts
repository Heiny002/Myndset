import { NextResponse } from 'next/server';
import { generateText, ClaudeAPIError, CLAUDE_MODELS } from '@/lib/ai/claude';

// Test endpoint to verify Claude API connection
// This should only be accessible in development
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    // Send a simple test message
    const response = await generateText(
      'Say "Hello from Myndset!" in exactly those words, nothing more.',
      {
        model: CLAUDE_MODELS.HAIKU, // Use Haiku for cheaper testing
        maxTokens: 50,
        temperature: 0,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Claude API connection successful!',
      response: {
        content: response.content,
        model: response.model,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        costCents: response.costCents,
        stopReason: response.stopReason,
      },
    });
  } catch (error) {
    console.error('Claude API test failed:', error);

    if (error instanceof ClaudeAPIError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          status: error.status,
          details: error.details,
          hint: error.isAuthenticationError()
            ? 'Check that ANTHROPIC_API_KEY is set correctly in .env.local'
            : error.isRateLimited()
              ? 'Rate limited - wait a moment and try again'
              : undefined,
        },
        { status: error.status }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
