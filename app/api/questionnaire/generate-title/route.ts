import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Anthropic } from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { questionnaire_id, responses } = await request.json();

    if (!questionnaire_id || !responses) {
      return NextResponse.json(
        { error: 'Missing questionnaire_id or responses' },
        { status: 400 }
      );
    }

    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract key information from responses for title generation
    const primaryGoal = responses.primary_goal || '';
    const challenge = responses.current_challenge || '';
    const context = responses.performance_context || '';
    const sessionLength = responses.session_length || '';

    // Create prompt for Claude to generate a concise, meaningful title
    const prompt = `Generate a concise, descriptive title for a personalized meditation questionnaire submission. The title should be no more than 60 characters and capture the essence of the user's goals and challenges.

User's Responses:
- Primary Goal: ${primaryGoal}
- Current Challenge: ${challenge}
- Performance Context: ${context}
- Preferred Session Length: ${sessionLength}

Generate ONLY the title, nothing else. Do not include quotes. Make it professional, specific, and focused on performance/achievement. Format: "Q[ID]: Title" where the ID is a shortened questionnaire ID (first 6 chars of the questionnaire ID will be replaced).`;

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const titleContent = message.content[0];
    if (titleContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let title = titleContent.text.trim();

    // Format the title with questionnaire ID if not already formatted
    if (!title.startsWith('Q')) {
      const shortId = questionnaire_id.substring(0, 6).toUpperCase();
      title = `Q${shortId}: ${title}`;
    }

    // Update the questionnaire_responses record with the generated title
    const { error: updateError } = await supabase
      .from('questionnaire_responses')
      .update({ title })
      .eq('id', questionnaire_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating questionnaire title:', updateError);
      return NextResponse.json(
        { error: 'Failed to save questionnaire title' },
        { status: 500 }
      );
    }

    return NextResponse.json({ title, questionnaire_id });
  } catch (error) {
    console.error('Error generating questionnaire title:', error);
    return NextResponse.json(
      { error: 'Failed to generate questionnaire title' },
      { status: 500 }
    );
  }
}
