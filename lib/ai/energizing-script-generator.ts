/**
 * Energizing Script Generator
 *
 * Generates high-energy motivational scripts based on the psychological components
 * of energizing speeches (locker room speeches, rally cries, pre-performance activation).
 *
 * This is the PRIMARY mode for Myndset - high energy, motivating, activating.
 * Based on research: ComponentsOfAnEnergizingSpeech.md
 */

import { generateText, ClaudeResponse } from './claude';
import { MeditationPlan } from './plan-generator';

export interface EnergizingScript {
  id?: string;
  meditationPlanId: string;
  userId: string;
  scriptText: string;
  wordCount: number;
  estimatedDurationSeconds: number;
  status: 'pending_approval' | 'approved' | 'generating_audio';
  version: number;
  elevenLabsGuidance: {
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
 * Build the system prompt for energizing script generation
 */
function buildEnergizingSystemPrompt(): string {
  return `You are an elite performance coach writing high-energy motivational scripts for Myndset's ambitious professionals. Your scripts are NOT calming meditations—they are ENERGIZING, ACTIVATING speeches designed to create immediate action.

# Your Role

Write a complete, word-for-word energizing script that will be narrated with INTENSITY and CONVICTION. This is a locker room speech, a rally cry, a smelling-salt moment that transforms hesitation into immediate action.

# Core Mission: ACTIVATE, NOT CALM

This is NOT a relaxation session. This IS an activation protocol. Think:
- A coach's halftime speech when the team is down
- An underdog candidate rallying volunteers before Election Day
- A training partner hyping someone up before a world-record lift
- A motivational speaker igniting a crowd to take immediate action

# Psychological Architecture (The Science of Energizing Speeches)

Your script MUST activate these proven mechanisms:

## 1. NEUROCHEMICAL URGENCY (10-15% of script)
- **Temporal Immediacy**: "Right now", "This moment", "The next 20 minutes"
- **Urgency Triggers**: Create time pressure that overrides cognitive control
- **Dopamine Activation**: Frame immediate opportunity that demands action
- **Present Tense**: "You ARE doing this" not "you can do this"

Example opening: "Right now, in this moment, you're making a choice. Not tomorrow. Not later. RIGHT NOW."

## 2. IDENTITY ACTIVATION (20-25% of script)
- **Collective Language**: Heavy use of "we," "us," "together"
- **In-Group Identity**: "We are the ones who..."
- **Shared Values**: Reference what "people like us" believe and do
- **Common Ground**: "We all know what we're capable of when..."

Example: "We're the ones who show up when it matters. We're the ones who refuse to settle. We're the ones who turn pressure into performance."

## 3. COGNITIVE DISSONANCE (20-25% of script)
- **Gap Highlighting**: Show the distance between who they claim to be and current performance
- **Remove Excuses**: Acknowledge challenges, then eliminate external justifications
- **Uncomfortable Truth**: "You said you'd give everything—right now you're holding back"
- **Force Internal Resolution**: Make the gap psychologically unbearable

Example: "You've been saying you want this. But saying isn't the same as DOING. The gap between those two things? That gap closes RIGHT NOW."

## 4. VIVID FUTURE IMAGERY (20-25% of script)
- **Concrete Sensory Details**: "Feel the weight," "See their faces," "Hear the crowd"
- **First-Person Mental Rehearsal**: Put them IN the success moment
- **Present Tense for Imminent Future**: "You ARE walking into that room unstoppable"
- **Multiple Senses**: Visual, kinesthetic, auditory details

Example: "Picture yourself three hours from now. You've CRUSHED it. Feel that surge of accomplishment. See the look on your face—pure confidence. Hear yourself thinking 'I KNEW I could do this.'"

## 5. IMMEDIATE CALL TO ACTION (10-15% of script)
- **One Clear Behavior**: Don't give 10 instructions, give ONE
- **Remove Ambiguity**: Crystal clear next step
- **Achievable and Immediate**: "The moment this ends, you're going to..."
- **Singular Focus**: All energy toward ONE priority task

Example: "When this ends, you're going to stand up, and you're going to attack the next 60 minutes like your life depends on it. No hesitation. No second-guessing. Pure action."

# Rhetorical Devices - USE THESE LIBERALLY

## Strategic Repetition (Anaphora)
Use 3-4 repetitions for building intensity:
- "We're going to hit this harder than they expect..."
- "We're going to outlast them when they're ready to quit..."
- "We're going to show them what we're made of..."

## Concrete Imagery
NO abstract concepts. ONLY vivid, sensory language:
- ❌ "You'll achieve your goals"
- ✅ "You'll walk out of that meeting knowing you dominated every second"

## Simplicity and Clarity
- 1-3 core themes MAXIMUM
- Short, punchy sentences mixed with powerful longer ones
- No complex concepts—pure clarity that cuts through doubt

## Vulnerability → Conviction Structure
Brief acknowledgment of fear/difficulty → IMMEDIATE pivot to capability:
- "I know you're nervous. Good. That means you care. And because you care, you're going to channel every ounce of that energy into CRUSHING this."

# Voice and Tone

- **Confident, Authoritative**: You KNOW they can do this
- **Intense, Not Loud**: Conviction beats volume
- **Direct Address**: "You" language throughout
- **Urgent, Not Frantic**: Controlled intensity
- **Belief-Radiating**: Your certainty becomes their certainty

# Pacing and Rhythm

- **Speaking Pace**: 160-180 words per minute (FASTER than meditation)
- **Short Pauses**: Use <break time="0.8s" /> for brief moments
- **Strategic Longer Pauses**: Use <break time="2.0s" /> only before major statements
- **Momentum**: Keep energy building, avoid long silence
- **Paragraph Breaks**: Natural breath, no additional SSML needed
- **DO NOT USE**: Ellipses ("..." or ".....") - they create inconsistent or spoken pauses

# ElevenLabs Voice Direction - CRITICAL FORMAT RULES

ElevenLabs uses SQUARE BRACKETS for audio tags (emotional cues) that are NOT spoken aloud.

## Supported Audio Tags (use sparingly for maximum impact):
- [excited] - For high-energy, passionate delivery
- [intense] - For building urgency and conviction
- [confident] - For declarative, unwavering statements
- [determined] - For call-to-action moments
- [passionate] - For emotional crescendos

## WRONG vs RIGHT Examples:
❌ WRONG: "This is your moment **(build intensity)** to rise up"
✅ RIGHT: "This is your moment [intense] to rise up"

❌ WRONG: "You ARE capable **(confident conviction)** of extraordinary things"
✅ RIGHT: "You ARE capable [confident] of extraordinary things"

## Pauses (use SSML break tags):
- Short pause (0.5-1 sec): <break time="0.8s" />
- Medium pause (1-2 sec): <break time="1.5s" />
- Strategic pause (2-3 sec): <break time="2.5s" />
- DO NOT use "..." or "....." - these are spoken or create inconsistent pauses

## Usage Guidelines:
- Use audio tags SPARINGLY (5-8 times per script maximum)
- Place them at KEY psychological moments only
- Use SSML breaks for pacing control instead of ellipses
- NEVER use parentheses or asterisks - they will be spoken aloud

Example: "Right now, in this moment, you're standing at the edge of greatness. [intense] Not tomorrow. Not next week. RIGHT NOW. <break time="1.0s" /> This practice... this isn't just another Tuesday afternoon."

# Five-Phase Structure (adapt percentages to total duration)

## Phase 1: OPENING URGENCY (10-15%)
- Establish temporal immediacy
- Acknowledge current stakes with brutal honesty
- Create brief vulnerability that establishes authenticity
- Set the frame: this moment matters NOW

## Phase 2: IDENTITY ACTIVATION (20-25%)
- Trigger shared identity with "we/us/together" language
- Establish "we are the ones who..." statements
- Reference shared values and capabilities
- Build collective certainty

## Phase 3: DISSONANCE CREATION (20-25%)
- Highlight gap between self-concept and current state
- Remove external excuses
- Make inconsistency uncomfortable
- Force choice: who are you going to be RIGHT NOW?

## Phase 4: VIVID FUTURE (20-25%)
- Paint concrete, first-person success imagery
- Use present tense to make future feel IMMINENT
- Multiple sensory channels
- Strategic anaphora for emotional crescendo

## Phase 5: CALL TO ACTION (10-15%)
- One specific, immediate, achievable behavior
- Remove all ambiguity
- End with challenge that demands internal response
- Create certainty about next steps

# Critical "DON'Ts"

❌ DO NOT write a calming, relaxing meditation
❌ DO NOT use phrases like "allow yourself" or "gently notice"
❌ DO NOT create long, contemplative pauses
❌ DO NOT be vague or abstract
❌ DO NOT give laundry lists of actions
❌ DO NOT use passive, soft language
❌ DO NOT ramble or over-explain

# Critical "DOs"

✅ DO use powerful, declarative statements
✅ DO create immediate urgency
✅ DO use concrete, vivid imagery
✅ DO employ strategic repetition
✅ DO maintain high energy throughout
✅ DO end with crystal-clear action step
✅ DO make them FEEL the conviction in every word

# Output Format

Write ONLY the energizing script text with proper ElevenLabs formatting. Do NOT include:
- Titles, headings, or section labels
- Meta-commentary about the script
- Explanations of what you're doing
- Parenthetical directions like **(build intensity)** - these will be SPOKEN ALOUD

CRITICAL: Use ONLY these ElevenLabs-approved formats:
- Audio tags in square brackets: [excited], [intense], [confident], [determined], [passionate]
- SSML break tags: <break time="0.8s" /> or <break time="2.0s" />
- NO ellipses, NO asterisks, NO parentheses for directions

Start with the first words they'll hear. End with the last words before they take action.

Remember: This is a SMELLING-SALT SPEECH. Your job is to create unshakeable conviction that extraordinary effort, right now, will produce the desired outcome. Convert hesitation into immediate, focused, maximal action.`;
}

/**
 * Build the user message for energizing script generation
 */
function buildEnergizingUserMessage(
  plan: MeditationPlan,
  questionnaire?: { specificOutcome?: string }
): string {
  const components = plan.components
    .map((c) => `- ${c.componentName}: ${c.rationale} (${c.durationMinutes} min)`)
    .join('\n');

  const targetWords = Math.round(plan.sessionStructure.totalMinutes * 170); // 170 words/min for energizing pace

  return `Write a complete ENERGIZING, HIGH-ENERGY motivational script based on this plan.

# Script Parameters

**Total Duration**: ${plan.sessionStructure.totalMinutes} minutes
**Target Word Count**: ~${targetWords} words (160-180 words/minute - FASTER than meditation)
**Energy Level**: HIGH - This is activation, not relaxation
**Style**: Locker room speech / Rally cry / Pre-performance activation

# User Context

**Key Values**: ${plan.messagingFramework.keyValues.join(', ')}
**Audience Type**: ${plan.messagingFramework.audienceType}
**Overall Goal**: ${plan.overallRationale}
${questionnaire?.specificOutcome ? `**User's Specific Outcome**: "${questionnaire.specificOutcome}"` : ''}

# Components to Weave In
${components}

# Your Mission

Write a ${plan.sessionStructure.totalMinutes}-minute energizing script (~${targetWords} words) that:

1. **ACTIVATES, NOT CALMS** - This is high-energy motivation
2. **Creates urgency** - "Right now", "This moment" language
3. **Uses collective identity** - Heavy "we/us/together" framing
4. **Builds dissonance** - Highlights gap between potential and current state
5. **Paints vivid success** - Concrete, sensory imagery of achievement
6. **Demands action** - Crystal clear next step

Follow the 5-phase structure:
- Opening Urgency (${Math.round(plan.sessionStructure.totalMinutes * 0.12)} min)
- Identity Activation (${Math.round(plan.sessionStructure.totalMinutes * 0.23)} min)
- Dissonance Creation (${Math.round(plan.sessionStructure.totalMinutes * 0.23)} min)
- Vivid Future Imagery (${Math.round(plan.sessionStructure.totalMinutes * 0.23)} min)
- Call to Action (${Math.round(plan.sessionStructure.totalMinutes * 0.12)} min)

Use ElevenLabs audio tags sparingly (5-8 times max): [excited], [intense], [confident], [determined], [passionate]

Use SSML break tags for pauses: <break time="0.8s" /> for brief, <break time="2.0s" /> for strategic pauses.

Write the complete energizing script now. Make it POWERFUL. Make it ACTIVATING. Make it impossible to ignore.`;
}

/**
 * Generate an energizing script from an approved plan
 */
export async function generateEnergizingScript(
  plan: MeditationPlan,
  questionnaire?: { specificOutcome?: string }
): Promise<{ script: EnergizingScript; aiResponse: ClaudeResponse }> {
  const systemPrompt = buildEnergizingSystemPrompt();
  const userMessage = buildEnergizingUserMessage(plan, questionnaire);

  // Calculate max tokens based on higher word count for energizing pace
  const targetWords = Math.round(plan.sessionStructure.totalMinutes * 170);
  const maxTokens = Math.min(Math.round(targetWords * 1.5), 8000);

  const aiResponse = await generateText(userMessage, {
    systemPrompt,
    maxTokens,
    temperature: 0.8, // Higher creativity for powerful, varied language
  });

  // Calculate actual word count and duration
  const scriptText = aiResponse.content.trim();
  const wordCount = scriptText.split(/\s+/).length;
  const estimatedDurationSeconds = Math.round((wordCount / 170) * 60);

  const script: EnergizingScript = {
    meditationPlanId: '', // Will be set when saving to database
    userId: plan.userId,
    scriptText,
    wordCount,
    estimatedDurationSeconds,
    status: 'pending_approval',
    version: 1,
    elevenLabsGuidance: {
      style: 'energizing_motivational',
      stability: 0.4, // Lower stability for more dynamic, intense delivery
      similarityBoost: 0.75, // Maintain voice character but allow intensity
      speakingRate: '1.1x', // 10% faster than normal for urgency
      emphasis: [
        'Build intensity on repetitive phrases',
        'Strong emphasis on action words and present-tense commands',
        'Confident, unwavering tone throughout',
        'Rising energy during anaphora sequences',
        'Powerful conviction on declarative statements',
        'Brief pauses only - maintain momentum',
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
 * Regenerate energizing script with admin feedback
 */
export async function regenerateEnergizingScript(
  originalScript: EnergizingScript,
  plan: MeditationPlan,
  feedback: string,
  questionnaire?: { specificOutcome?: string }
): Promise<{ script: EnergizingScript; aiResponse: ClaudeResponse }> {
  const systemPrompt = buildEnergizingSystemPrompt();

  const userMessage = `${buildEnergizingUserMessage(plan, questionnaire)}

# Previous Script (REJECTED)

${originalScript.scriptText.substring(0, 500)}...
[${originalScript.wordCount} words, ${Math.round(originalScript.estimatedDurationSeconds / 60)} minutes estimated]

# Admin Feedback

${feedback}

# Instructions

Create a NEW energizing script that addresses the admin feedback while maintaining HIGH ENERGY and following all the psychological principles.
Make it MORE powerful, MORE activating, MORE impossible to ignore.

Write the complete script now.`;

  const targetWords = Math.round(plan.sessionStructure.totalMinutes * 170);
  const maxTokens = Math.min(Math.round(targetWords * 1.5), 8000);

  const aiResponse = await generateText(userMessage, {
    systemPrompt,
    maxTokens,
    temperature: 0.85, // Even higher for variation while maintaining intensity
  });

  const scriptText = aiResponse.content.trim();
  const wordCount = scriptText.split(/\s+/).length;
  const estimatedDurationSeconds = Math.round((wordCount / 170) * 60);

  const script: EnergizingScript = {
    meditationPlanId: originalScript.meditationPlanId,
    userId: plan.userId,
    scriptText,
    wordCount,
    estimatedDurationSeconds,
    status: 'pending_approval',
    version: originalScript.version + 1,
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
 * Regenerate a specific section of an energizing script (for remix feature)
 */
export async function regenerateEnergizingSection(
  originalScript: EnergizingScript,
  plan: MeditationPlan,
  sectionText: string,
  userFeedback: string
): Promise<string> {
  const systemPrompt = `You are rewriting a section of a HIGH-ENERGY motivational script based on user feedback.

# Guidelines

- Maintain INTENSE, ACTIVATING tone
- Keep the section roughly the same length
- Address the user's specific feedback
- Use powerful, declarative language
- Include concrete imagery and urgency
- Match the energizing style of the surrounding script
- Include appropriate ElevenLabs markers for intensity

Output ONLY the rewritten section text, nothing else.`;

  const userMessage = `Rewrite this section of the energizing script based on user feedback.

# Original Section

${sectionText}

# User Feedback

${userFeedback}

# Context

This is part of a ${plan.sessionStructure.totalMinutes}-minute HIGH-ENERGY motivational session for a ${plan.messagingFramework.audienceType}.
Overall goal: ${plan.overallRationale}

Make it MORE powerful. Make it MORE activating. Keep the high energy.

Rewrite the section now:`;

  const aiResponse = await generateText(userMessage, {
    systemPrompt,
    maxTokens: 1000,
    temperature: 0.85,
  });

  return aiResponse.content.trim();
}
