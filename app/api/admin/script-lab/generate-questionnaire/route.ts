import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { generateText, DEFAULT_MODEL } from '@/lib/ai/claude';
import { buildQuestionnaireGeneratorPrompt, type LabQuestionnaire } from '@/lib/ai/script-lab-chat';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => ({}));
    const { seed, previousPersonas = [] } = body as {
      seed?: string;
      previousPersonas?: string[];
    };

    const systemPrompt = buildQuestionnaireGeneratorPrompt();

    // Build user message with variety hints
    let userMessage = 'Generate a new test persona and intake questionnaire.';
    if (previousPersonas.length > 0) {
      userMessage += `\n\nAvoid repeating these archetypes/names already used this session: ${previousPersonas.join(', ')}. Pick a different archetype and situation.`;
    }
    if (seed) {
      userMessage += `\n\nDirection hint: ${seed}`;
    }

    const aiResponse = await generateText(userMessage, {
      model: DEFAULT_MODEL,
      systemPrompt,
      maxTokens: 2000,
      temperature: 0.9, // High temperature for variety
    });

    // Parse JSON response
    let questionnaire: LabQuestionnaire;
    try {
      const raw = aiResponse.content.trim();
      // Strip markdown code fences if present
      const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(jsonStr);

      // Validate shape
      if (!parsed.persona?.name || !parsed.questions?.length) {
        throw new Error('Invalid questionnaire structure');
      }

      questionnaire = {
        ...parsed,
        generatedAt: new Date().toISOString(),
      };
    } catch (parseError) {
      console.error('[generate-questionnaire] Parse error:', parseError);
      console.error('[generate-questionnaire] Raw content:', aiResponse.content.substring(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse questionnaire JSON', details: String(parseError) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      questionnaire,
      costCents: aiResponse.costCents,
    });
  } catch (error) {
    console.error('[generate-questionnaire] Error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
