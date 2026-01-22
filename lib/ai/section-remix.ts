import { sendMessage, ClaudeAPIError } from './claude';
import { logAPIUsage } from './cost-tracking';

/**
 * Meditation Script Section Remix
 *
 * Regenerates a specific section of a meditation script based on user feedback.
 * Maintains the overall meditation structure while updating the requested section.
 */

export interface RemixSectionParams {
  originalScript: string;
  sectionToRemix: string;
  remixInstructions: string;
  meditationContext: {
    title: string;
    goal: string;
    techniques: string[];
    sessionLength: number;
  };
}

export interface RemixSectionResult {
  newSection: string;
  fullScriptWithNewSection: string;
  changeExplanation: string;
  wordCount: number;
}

/**
 * Regenerate a specific section of a meditation script
 */
export async function remixScriptSection(params: RemixSectionParams): Promise<RemixSectionResult> {
  const { originalScript, sectionToRemix, remixInstructions, meditationContext } = params;

  // Validate inputs
  if (!originalScript || originalScript.length < 100) {
    throw new ClaudeAPIError('Original script must be at least 100 characters', 400, { type: 'INVALID_INPUT' });
  }

  if (!sectionToRemix || sectionToRemix.length < 20) {
    throw new ClaudeAPIError('Section to remix must be at least 20 characters', 400, { type: 'INVALID_INPUT' });
  }

  if (!remixInstructions || remixInstructions.length < 10) {
    throw new ClaudeAPIError('Remix instructions must be at least 10 characters', 400, { type: 'INVALID_INPUT' });
  }

  // Check that the section exists in the original script
  if (!originalScript.includes(sectionToRemix)) {
    throw new ClaudeAPIError(
      'Selected section not found in original script',
      404,
      { type: 'SECTION_NOT_FOUND' }
    );
  }

  const systemPrompt = `You are a meditation script editor specializing in performance-focused meditation for ambitious professionals.

Your task is to regenerate a specific section of a meditation script based on user feedback, while maintaining:
- The overall meditation structure and flow
- The performance-focused messaging tone
- Smooth transitions with surrounding content
- Appropriate pacing (~145 words per minute when spoken)

CRITICAL GUIDELINES:
1. ONLY modify the specified section - do not change other parts of the script
2. Maintain the same approximate length as the original section
3. Ensure smooth transitions with the content before and after the section
4. Keep the performance-focused, boardroom-not-yoga-studio tone
5. Use hypnotic language patterns where appropriate
6. Write for spoken delivery (contractions, natural rhythm)

Return your response as JSON with this structure:
{
  "newSection": "The regenerated section text (word-for-word script)",
  "fullScriptWithNewSection": "The complete meditation script with the new section integrated",
  "changeExplanation": "Brief explanation of what changed and why",
  "wordCount": <number of words in the new section>
}`;

  const userPrompt = `Original Meditation Script:
${originalScript}

---

Section to Regenerate:
${sectionToRemix}

---

User's Remix Instructions:
${remixInstructions}

---

Meditation Context:
- Title: ${meditationContext.title}
- Goal: ${meditationContext.goal}
- Techniques: ${meditationContext.techniques.join(', ')}
- Session Length: ${meditationContext.sessionLength} minutes

Please regenerate the specified section according to the user's instructions while maintaining the meditation's overall structure and flow.`;

  try {
    const response = await sendMessage(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt,
        maxTokens: 4096,
        temperature: 0.8,
      }
    );

    // Parse JSON response
    let result: RemixSectionResult;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const content = response.content;
      const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/) || content.match(/(\{[\s\S]*?\})/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      result = JSON.parse(jsonMatch[1]);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', response.content);
      throw new ClaudeAPIError(
        'Failed to parse section remix response',
        500,
        { type: 'PARSE_ERROR', originalError: parseError }
      );
    }

    // Validate response structure
    if (
      !result.newSection ||
      !result.fullScriptWithNewSection ||
      !result.changeExplanation ||
      typeof result.wordCount !== 'number'
    ) {
      throw new ClaudeAPIError('Invalid section remix response structure', 500, { type: 'INVALID_RESPONSE' });
    }

    // Log API usage for cost tracking
    await logAPIUsage({
      userId: 'system', // Will be overridden by the API route with actual user ID
      service: 'claude',
      operation: 'section-remix',
      model: response.model,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      costCents: 0, // Will be calculated by logAPIUsage
    });

    return result;
  } catch (error) {
    if (error instanceof ClaudeAPIError) {
      throw error;
    }
    throw new ClaudeAPIError('Failed to remix section', 500, { type: 'UNKNOWN_ERROR', originalError: error });
  }
}

/**
 * Calculate remix usage for a user in the current billing cycle
 */
export async function getRemixUsageForUser(
  userId: string,
  supabase: any
): Promise<{ used: number; limit: number; tier: string }> {
  // Get user's current tier (from users table or subscription table)
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  const tier = userData?.subscription_tier || 'free';

  // Define tier limits
  const tierLimits: Record<string, number> = {
    free: 2, // 1-2 remixes
    basic: 10, // 10/month
    premium: 45, // 30-45/month
  };

  // Get current billing cycle start date
  const now = new Date();
  const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Count remixes in current billing cycle
  const { count } = await supabase
    .from('meditation_remixes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', cycleStart.toISOString());

  return {
    used: count || 0,
    limit: tierLimits[tier] || tierLimits.free,
    tier,
  };
}

/**
 * Check if user can perform a remix
 */
export async function canUserRemix(userId: string, supabase: any): Promise<boolean> {
  const usage = await getRemixUsageForUser(userId, supabase);
  return usage.used < usage.limit;
}
