/**
 * Meditation Script Generator
 *
 * Step 2 of the two-step AI generation workflow.
 * Takes an approved meditation plan and generates the full meditation script text
 * that will be converted to audio via ElevenLabs.
 */

import { generateText, ClaudeResponse } from './claude';
import { MeditationPlan } from './plan-generator';
import {
  HYPNOTIC_PATTERNS,
  SESSION_STRUCTURES,
  MEDITATION_COMPONENTS,
} from './meditation-knowledge-base';

export interface MeditationScript {
  id?: string;
  meditationPlanId: string;
  userId: string;
  scriptText: string;
  wordCount: number;
  estimatedDurationSeconds: number;
  status: 'pending_approval' | 'approved' | 'generating_audio';
  version: number;
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
- Include natural pauses: "..." = 1-2 second pause, "....." = 3-5 second pause
- Use paragraph breaks for longer pauses (5-10 seconds)

# Output Format

Write ONLY the meditation script text. Do NOT include:
- Titles, headings, or labels
- Bracketed instructions like [pause here]
- Meta-commentary about the script

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
6. Use "..." for short pauses (1-2 sec), "....." for longer pauses (3-5 sec)
7. Write for spoken delivery - natural, conversational, but professional

Write the complete meditation script now. Start with the first words the user will hear.`;
}

/**
 * Generate a meditation script from an approved plan
 */
export async function generateMeditationScript(
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
