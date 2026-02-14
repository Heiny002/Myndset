/**
 * Script Generator (Unified Router)
 *
 * Step 2 of the two-step AI generation workflow.
 * Routes to either energizing (PRIMARY) or calming (BACKUP) script generators.
 *
 * DEFAULT MODE: Energizing/Motivational (high-energy activation)
 * BACKUP MODE: Calming/Meditative (relaxation and contemplation)
 *
 * UPDATED: Now uses V2 psychological techniques database for enhanced implementation guidance
 */

import { generateText, ClaudeResponse } from './claude';
import { MeditationPlan } from './plan-generator';
import {
  HYPNOTIC_PATTERNS,
  SESSION_STRUCTURES,
  MEDITATION_COMPONENTS,
} from './meditation-knowledge-base';
import {
  getTechniqueById,
  SessionStructure,
  MessagingFramework,
} from './meditation-knowledge-base-v2';
import {
  generateEnergizingScript,
  regenerateEnergizingScript,
  regenerateEnergizingSection,
  EnergizingScript,
} from './energizing-script-generator';
import { MappedQuestionnaireData } from '../questionnaire/response-mapper';

export type ScriptStyle = 'energizing' | 'calming';

export interface MeditationScript {
  id?: string;
  meditationPlanId: string;
  userId: string;
  scriptText: string;
  wordCount: number;
  estimatedDurationSeconds: number;
  status: 'pending_approval' | 'approved' | 'generating_audio';
  version: number;
  scriptStyle?: ScriptStyle; // Track which generator was used
  elevenLabsGuidance?: {
    style: string;
    stability: number;
    similarityBoost: number;
    speakingRate: string;
    emphasis: string[];
  };
  metadata: {
    generatedAt: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    costCents: number;
  };
}

/**
 * Build the system prompt for script generation
 */
function buildScriptSystemPrompt(): string {
  return `You are an expert meditation script writer for Myndset, creating guided meditation audio scripts for ambitious professionals.

# Your Role

Write a complete, word-for-word meditation script that will be narrated by a professional voice and listened to by the user. This is NOT a description or outline - it's the actual script text.

# Critical Principles

1. **Performance Positioning**: Frame meditation as performance optimization, NOT stress relief
2. **Direct Address**: Write in second person ("you"), as if speaking directly to the user
3. **Hypnotic Language**: Use presuppositions, embedded commands, pacing and leading
4. **Evidence-Based Framing**: For skeptical users, reference neuroscience briefly
5. **Natural Flow**: Write for spoken delivery - use natural pauses, rhythm, cadence
6. **Professional Tone**: Confident, authoritative, but not patronizing
7. **Exact Duration**: Script must match the specified duration precisely

# Hypnotic Language Patterns to Use

**Presuppositions**: "As you continue to breathe, your focus sharpens..."
**Embedded Commands**: "Allow yourself to notice..."
**Temporal Binding**: "By the end of this session, you'll feel..."
**Pacing and Leading**: Match current state, then guide to desired state

# Structural Guidelines

1. **Opening (10% of time)**: Set context, establish credibility, create buy-in
2. **Settling (15-20%)**: Transition from external to internal focus
3. **Core Practice (60-70%)**: Execute the meditation techniques from the plan
4. **Integration (10-15%)**: Anchor insights, prepare to re-engage

# Pacing Guidelines

- Average speaking pace: 140-160 words per minute
- Use punctuation for pauses: periods, commas, em-dashes (—), and paragraph breaks
- Use paragraph breaks for natural breath points and longer pauses
- DO NOT use SSML break tags like <break time="X.Xs" /> - eleven_v3 does NOT support them
- DO NOT use ellipses ("..." or ".....") - they create inconsistent pauses

# Output Format

Write ONLY the meditation script text. Do NOT include:
- Titles, headings, or labels
- Meta-commentary about the script
- Parenthetical directions in asterisks or parentheses - these will be SPOKEN ALOUD

You MAY include (sparingly):
- ElevenLabs v3 audio tags in square brackets: [whispers], [gentle], [calm], [soothing]
- Use punctuation and paragraph breaks for pausing (NO SSML break tags)

Start with the first words the user will hear. End with the last words before silence.`;
}

/**
 * Build the user message with plan context
 */
function buildScriptUserMessage(plan: MeditationPlan, questionnaire?: { specificOutcome?: string }): string {
  const components = plan.components
    .map((c) => `- ${c.componentName}: ${c.rationale} (${c.durationMinutes} min)`)
    .join('\n');

  const phases = plan.sessionStructure.phases
    .map(
      (p) =>
        `- ${p.name} (${p.durationMinutes} min): ${p.components.join(', ')}`
    )
    .join('\n');

  const targetWords = Math.round(plan.sessionStructure.totalMinutes * 145); // 145 words/min average

  return `Write a complete meditation script based on this approved plan.

# Meditation Plan

**Total Duration**: ${plan.sessionStructure.totalMinutes} minutes
**Target Word Count**: ~${targetWords} words (140-160 words/minute)

**Components**:
${components}

**Session Structure**:
${phases}

**Messaging Approach**: ${plan.messagingFramework.audienceType}
**Key Values**: ${plan.messagingFramework.keyValues.join(', ')}
**Overall Rationale**: ${plan.overallRationale}

${questionnaire?.specificOutcome ? `**User's Specific Outcome**: "${questionnaire.specificOutcome}"` : ''}

# Component Details (for reference)

${plan.components
  .map((pc) => {
    const fullComponent = MEDITATION_COMPONENTS.find((c) => c.id === pc.componentId);
    return fullComponent
      ? `**${fullComponent.name}**
Function: ${fullComponent.function}
Script Guidelines: ${fullComponent.scriptGuidelines}`
      : '';
  })
  .join('\n\n')}

# Instructions

1. Write a complete, word-for-word script for ${plan.sessionStructure.totalMinutes} minutes (~${targetWords} words)
2. Follow the session structure phases in order
3. Use hypnotic language patterns naturally (not forced)
4. Match the ${plan.messagingFramework.audienceType} messaging style
5. Address the user's specific outcome if provided
6. Use punctuation for pauses: periods, commas, em-dashes (—), and paragraph breaks (NO SSML break tags)
7. Write for spoken delivery - natural, conversational, but professional
8. Use ElevenLabs v3 audio tags in square brackets sparingly for emotional tone: [gentle], [calm], [soothing]

Write the complete meditation script now. Start with the first words the user will hear.`;
}

/**
 * Generate a meditation script from an approved plan
 *
 * @param plan - The approved meditation plan
 * @param questionnaire - Optional questionnaire data with specific outcome
 * @param scriptStyle - 'energizing' (DEFAULT) or 'calming'
 */
export async function generateMeditationScript(
  plan: MeditationPlan,
  questionnaire?: MappedQuestionnaireData | { specificOutcome?: string; scriptStyle?: ScriptStyle },
  scriptStyle: ScriptStyle = 'energizing' // DEFAULT to energizing
): Promise<{ script: MeditationScript; aiResponse: ClaudeResponse }> {
  // Determine style from parameter or questionnaire, default to energizing
  const resolvedStyle = scriptStyle || (questionnaire as any)?.scriptStyle || 'energizing';

  // Route to appropriate generator
  if (resolvedStyle === 'energizing') {
    // Pass full MappedQuestionnaireData if available, otherwise pass as-is
    const { script: energizingScript, aiResponse } =
      await generateEnergizingScript(plan, questionnaire as MappedQuestionnaireData | undefined);

    // Convert EnergizingScript to MeditationScript format
    const script: MeditationScript = {
      ...energizingScript,
      scriptStyle: 'energizing',
    };

    return { script, aiResponse };
  } else {
    // Use calming generator (existing implementation below)
    return generateCalmingScript(plan, questionnaire as { specificOutcome?: string } | undefined);
  }
}

/**
 * Generate a CALMING meditation script (backup mode for users who specifically need it)
 */
async function generateCalmingScript(
  plan: MeditationPlan,
  questionnaire?: { specificOutcome?: string }
): Promise<{ script: MeditationScript; aiResponse: ClaudeResponse }> {
  const systemPrompt = buildScriptSystemPrompt();
  const userMessage = buildScriptUserMessage(plan, questionnaire);

  // Calculate max tokens based on target word count (roughly 1.3 tokens per word)
  const targetWords = Math.round(plan.sessionStructure.totalMinutes * 145);
  const maxTokens = Math.min(Math.round(targetWords * 1.5), 8000);

  const aiResponse = await generateText(userMessage, {
    systemPrompt,
    maxTokens,
    temperature: 0.7, // Higher creativity for natural script writing
  });

  // Calculate actual word count and duration
  const scriptText = aiResponse.content.trim();
  const wordCount = scriptText.split(/\s+/).length;
  const estimatedDurationSeconds = Math.round((wordCount / 145) * 60);

  const script: MeditationScript = {
    meditationPlanId: '', // Will be set when saving to database
    userId: plan.userId,
    scriptText,
    wordCount,
    estimatedDurationSeconds,
    status: 'pending_approval',
    version: 1,
    scriptStyle: 'calming',
    elevenLabsGuidance: {
      style: 'calming_meditative',
      stability: 0.75, // Higher stability for calm, steady delivery
      similarityBoost: 0.75,
      speakingRate: '0.95x', // Slightly slower for contemplation
      emphasis: [
        'Gentle, soothing tone throughout',
        'Slow, deliberate pacing',
        'Soft emphasis on breath and relaxation cues',
        'Use longer pauses for contemplation',
        'Steady, calming voice quality',
      ],
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      model: aiResponse.model,
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      costCents: aiResponse.costCents,
    },
  };

  return { script, aiResponse };
}

/**
 * Regenerate script with admin feedback
 */
export async function regenerateScript(
  originalScript: MeditationScript,
  plan: MeditationPlan,
  feedback: string,
  questionnaire?: MappedQuestionnaireData | { specificOutcome?: string }
): Promise<{ script: MeditationScript; aiResponse: ClaudeResponse }> {
  const scriptStyle = originalScript.scriptStyle || 'energizing';

  // Route to appropriate regenerator
  if (scriptStyle === 'energizing') {
    const energizingScript: EnergizingScript = {
      ...originalScript,
      elevenLabsGuidance: originalScript.elevenLabsGuidance || {
        style: 'energizing_motivational',
        stability: 0.4,
        similarityBoost: 0.75,
        speakingRate: '1.1x',
        emphasis: [],
      },
    };

    const { script: newScript, aiResponse } = await regenerateEnergizingScript(
      energizingScript,
      plan,
      feedback,
      questionnaire as MappedQuestionnaireData | undefined
    );

    return {
      script: { ...newScript, scriptStyle: 'energizing' },
      aiResponse,
    };
  } else {
    // Use calming regenerator
    return regenerateCalmingScript(originalScript, plan, feedback, questionnaire as { specificOutcome?: string } | undefined);
  }
}

/**
 * Regenerate CALMING script with admin feedback (backup mode)
 */
async function regenerateCalmingScript(
  originalScript: MeditationScript,
  plan: MeditationPlan,
  feedback: string,
  questionnaire?: { specificOutcome?: string }
): Promise<{ script: MeditationScript; aiResponse: ClaudeResponse }> {
  const systemPrompt = buildScriptSystemPrompt();

  const userMessage = `${buildScriptUserMessage(plan, questionnaire)}

# Previous Script (REJECTED)

${originalScript.scriptText.substring(0, 500)}...
[${originalScript.wordCount} words, ${Math.round(originalScript.estimatedDurationSeconds / 60)} minutes estimated]

# Admin Feedback

${feedback}

# Instructions

Create a NEW meditation script that addresses the admin feedback while following all the original requirements.
Write the complete meditation script now.`;

  const targetWords = Math.round(plan.sessionStructure.totalMinutes * 145);
  const maxTokens = Math.min(Math.round(targetWords * 1.5), 8000);

  const aiResponse = await generateText(userMessage, {
    systemPrompt,
    maxTokens,
    temperature: 0.75, // Slightly higher for variation
  });

  const scriptText = aiResponse.content.trim();
  const wordCount = scriptText.split(/\s+/).length;
  const estimatedDurationSeconds = Math.round((wordCount / 145) * 60);

  const script: MeditationScript = {
    meditationPlanId: originalScript.meditationPlanId,
    userId: plan.userId,
    scriptText,
    wordCount,
    estimatedDurationSeconds,
    status: 'pending_approval',
    version: originalScript.version + 1,
    scriptStyle: 'calming',
    elevenLabsGuidance: originalScript.elevenLabsGuidance,
    metadata: {
      generatedAt: new Date().toISOString(),
      model: aiResponse.model,
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      costCents: aiResponse.costCents,
    },
  };

  return { script, aiResponse };
}

/**
 * Regenerate a specific section of a script (for remix feature)
 */
export async function regenerateScriptSection(
  originalScript: MeditationScript,
  plan: MeditationPlan,
  sectionText: string,
  userFeedback: string,
  questionnaire?: MappedQuestionnaireData
): Promise<string> {
  const scriptStyle = originalScript.scriptStyle || 'energizing';

  // Route to appropriate section regenerator
  if (scriptStyle === 'energizing') {
    const energizingScript: EnergizingScript = {
      ...originalScript,
      elevenLabsGuidance: originalScript.elevenLabsGuidance || {
        style: 'energizing_motivational',
        stability: 0.4,
        similarityBoost: 0.75,
        speakingRate: '1.1x',
        emphasis: [],
      },
    };

    return regenerateEnergizingSection(
      energizingScript,
      plan,
      sectionText,
      userFeedback,
      questionnaire
    );
  } else {
    return regenerateCalmingSection(originalScript, plan, sectionText, userFeedback);
  }
}

/**
 * Regenerate a specific section of a CALMING script (backup mode)
 */
async function regenerateCalmingSection(
  originalScript: MeditationScript,
  plan: MeditationPlan,
  sectionText: string,
  userFeedback: string
): Promise<string> {
  const systemPrompt = `You are rewriting a section of a meditation script based on user feedback.

# Guidelines

- Maintain the same tone and style as the surrounding script
- Keep the section roughly the same length
- Address the user's specific feedback
- Use hypnotic language patterns naturally
- Match the performance-focused messaging style

Output ONLY the rewritten section text, nothing else.`;

  const userMessage = `Rewrite this section of the meditation script based on user feedback.

# Original Section

${sectionText}

# User Feedback

${userFeedback}

# Context

This is part of a ${plan.sessionStructure.totalMinutes}-minute meditation for a ${plan.messagingFramework.audienceType}.
Overall goal: ${plan.overallRationale}

Rewrite the section now:`;

  const aiResponse = await generateText(userMessage, {
    systemPrompt,
    maxTokens: 1000,
    temperature: 0.8,
  });

  return aiResponse.content.trim();
}
