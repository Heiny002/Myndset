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

    // Large pool of varied scenario seeds — one is picked randomly on every call
    // to break the model out of default patterns
    const SCENARIO_SEEDS = [
      'A female athlete in a combat or strength sport (wrestling, boxing, powerlifting, judo)',
      'A healthcare worker (nurse, paramedic, ER tech, surgical tech) before an intense shift or case',
      'A blue-collar tradesperson (electrician, plumber, welder, carpenter, ironworker) before a high-stakes job',
      'A food service worker (chef, line cook, restaurant manager) before a big service',
      'A teacher, coach, or school administrator before a difficult confrontation or performance',
      'A young female athlete (swimmer, gymnast, track, volleyball) before a competition',
      'A service industry worker (retail, ticket agent, customer service) before an overwhelming shift',
      'A legal or medical professional before a high-pressure procedure or hearing',
      'A parent or caregiver stepping back into a demanding situation after time away',
      'A performing artist (musician, actor, dancer, comedian) before going on stage',
      'A first responder (firefighter, police officer, EMT) before a call or shift',
      'A competitive high school or college athlete before a game or meet',
      'A military or ROTC member before a performance evaluation or physical test',
      'A door-to-door or field salesperson before a crucial pitch or after a cold streak',
      'A graduate student, resident, or trainee before a high-stakes evaluation',
      'A small business owner before a critical moment (opening day, big client, bank meeting)',
      'A manual laborer (construction foreman, warehouse worker, delivery driver) with a high-pressure quota or deadline',
      'A skilled-trades apprentice being evaluated for the first time on the job site',
      'A competitive gamer or esports player before a ranked or tournament match',
      'A social worker, counselor, or mental health worker before a difficult case or session',
    ];

    const randomSeed = SCENARIO_SEEDS[Math.floor(Math.random() * SCENARIO_SEEDS.length)];

    // Build user message with variety hints
    let userMessage = `Generate a new test persona and intake questionnaire.\n\nScenario direction: ${seed || randomSeed}`;
    if (previousPersonas.length > 0) {
      userMessage += `\n\nPersonas already used — pick something DIFFERENT in profession, gender, and name:\n${previousPersonas.join('\n')}`;
    }
    userMessage += '\n\nIMPORTANT: Do not generate a male entrepreneur or executive. Vary the name ethnicity and gender from the above list.';

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
