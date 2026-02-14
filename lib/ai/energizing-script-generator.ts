/**
 * Energizing Script Generator
 *
 * Generates high-energy motivational scripts based on the psychological components
 * of energizing speeches (locker room speeches, rally cries, pre-performance activation).
 *
 * This is the PRIMARY mode for Myndset - high energy, motivating, activating.
 * Based on research: docs/script-generation/psychology-and-rhetoric.md
 *
 * UPDATED: Now uses V2 psychological techniques database with implementation protocols
 */

import { generateText, ClaudeResponse } from './claude';
import { MeditationPlan } from './plan-generator';
import { getTechniqueById } from './meditation-knowledge-base-v2';

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
- **Temporal Immediacy**: Anchor to the present moment in varied ways (this moment, this second, right now, today—don't repeat the same phrase)
- **Urgency Triggers**: Create time pressure that overrides cognitive control through deadline language, scarcity framing, or consequence highlighting
- **Dopamine Activation**: Frame immediate opportunity that demands action—not someday, not after preparation, NOW
- **Present Tense**: Use declarative statements ("You ARE doing this," "This IS happening," "You WILL dominate") not conditional ("you can," "you might")

Principle: Establish that THIS moment is the critical inflection point. Negate alternatives (tomorrow won't work, waiting is failure, delay is impossible) using fresh language each time.

## 2. IDENTITY ACTIVATION (20-25% of script)
- **Collective Language**: Use "we," "us," "together" to create tribal belonging (but vary sentence structure and reference points)
- **In-Group Identity**: Evoke the tribe they belong to through their values, not through repeated parallel structures ("We are the ones who X, We are the ones who Y")
- **Shared Values**: Reference what ambitious, high-performing people believe and do—invoke their self-concept
- **Common Ground**: Build on what listeners know they're capable of, especially in moments of pressure or adversity

Principle: Create tribal identity and shared values without template-like repetition. Each meditation should have a unique voice reflecting that specific user's context.

## 3. COGNITIVE DISSONANCE (20-25% of script)
- **Gap Highlighting**: Show the distance between their self-concept (who they know they are) and current performance using language specific to their context
- **Remove Excuses**: Acknowledge the real challenges they face, then make external justifications irrelevant through reframing
- **Uncomfortable Truth**: Surface the contradiction between their values and current action—but find fresh ways to articulate this tension
- **Force Internal Resolution**: Make the cognitive gap so compelling they must choose: will they be consistent with their identity RIGHT NOW?

Principle: Create psychological tension unique to the user's situation. Don't use the same dissonance language across meditations.

## 4. VIVID FUTURE IMAGERY (20-25% of script)
- **Concrete Sensory Details**: Use specific, relevant sensory language based on the user's actual context (not generic "feel the weight, see their faces")
- **First-Person Mental Rehearsal**: Transport them INTO the success moment—make them experience it, not imagine it from outside
- **Present Tense for Imminent Future**: Use present tense to collapse the psychological distance ("You ARE walking in," "You ARE feeling," "You ARE hearing")
- **Multiple Senses**: Engage visual, kinesthetic, and auditory imagination in ways relevant to their specific performance context

Principle: Paint success using vivid details specific to THEIR goal, not generic performance imagery.

## 5. IMMEDIATE CALL TO ACTION (10-15% of script)
- **One Clear Behavior**: Don't give 10 instructions—focus on ONE specific, achievable next action
- **Remove Ambiguity**: Make the next step crystal clear and specific to their situation
- **Achievable and Immediate**: The action happens now or within minutes, not someday
- **Singular Focus**: Channel all their energy toward ONE priority—eliminate competing demands

Principle: End with a specific action command unique to the user's goal and context. Make it impossible to misinterpret.

# Rhetorical Devices - USE THESE LIBERALLY

## Strategic Repetition (Anaphora)
Use 3-4 repetitions for building intensity—but vary the structure and content. Anaphora creates rhythm and power through repeated starting phrases, but these should be tailored to the user's context. Examples of the TECHNIQUE (not templates to copy):
- "We're going to [action] when they expect us to [opposite]..."
- "We're going to [action] while they're still [inaction]..."
- "We're going to [action] because we [core value]..."

The specific words should change based on the meditation's purpose.

## Concrete Imagery
NO abstract concepts. ONLY vivid, sensory language:
- ❌ "You'll achieve your goals"
- ✅ "You'll walk out of that meeting knowing you dominated every second"

## Simplicity and Clarity
- 1-3 core themes MAXIMUM
- Short, punchy sentences mixed with powerful longer ones
- No complex concepts—pure clarity that cuts through doubt

## Vulnerability → Conviction Structure
Brief acknowledgment of fear/difficulty → IMMEDIATE pivot to capability. This structure creates authenticity by not pretending obstacles don't exist, then reframes them as evidence of readiness. The specific emotional acknowledgment should match the user's actual situation, not follow a template.

# Voice and Tone

- **Confident, Authoritative**: You KNOW they can do this
- **Intense, Not Loud**: Conviction beats volume
- **Direct Address**: "You" language throughout
- **Urgent, Not Frantic**: Controlled intensity
- **Belief-Radiating**: Your certainty becomes their certainty

# Pacing and Rhythm

- **Speaking Pace**: 160-180 words per minute (FASTER than meditation)
- **Short Pauses**: Use em-dashes (—) or commas for brief moments
- **Strategic Longer Pauses**: Use periods, paragraph breaks, or double line breaks
- **Momentum**: Keep energy building, avoid long silence
- **Paragraph Breaks**: Create natural pauses between sections
- **DO NOT USE**: SSML break tags like <break time="X.Xs" /> - NOT supported by eleven_v3
- **DO NOT USE**: Ellipses ("..." or ".....") - they create inconsistent pauses

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

## Pauses (use punctuation, NOT SSML):
- Brief pause: Use comma (,) or em-dash (—)
- Short pause: Use period (.)
- Medium pause: Use paragraph break (double line break)
- Strategic pause: Use paragraph break with white space
- DO NOT use SSML <break> tags - eleven_v3 does NOT support them
- DO NOT use "..." or "....." - these are spoken or create inconsistent pauses

## Usage Guidelines:
- Use audio tags SPARINGLY (5-8 times per script maximum)
- Place them at KEY psychological moments only—moments where psychological intensity shifts or decisions crystallize
- Reserve [intense] for moments of greatest urgency or conviction
- Reserve [excited] for moments of victory or positive forward momentum
- NEVER use parentheses or asterisks - they will be spoken aloud
- NO GENERIC EXAMPLES - Write fresh language specific to each meditation's context

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
❌ DO NOT copy exact phrases or structures from examples—examples show TECHNIQUES, not templates
❌ DO NOT repeat the same opening urgency language across different meditations
❌ DO NOT use generic identity activation statements—make them specific to the user's actual context
❌ DO NOT use boilerplate imagery—create vivid details tailored to their specific performance goal

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

CRITICAL: Use ONLY these ElevenLabs v3-approved formats:
- Audio tags in square brackets: [excited], [intense], [confident], [determined], [passionate]
- Punctuation for pauses: commas, em-dashes (—), periods, paragraph breaks
- NO SSML break tags like <break time="X.Xs" /> - eleven_v3 does NOT support them
- NO ellipses, NO asterisks, NO parentheses for directions

Start with the first words they'll hear. End with the last words before they take action.

Remember: This is a SMELLING-SALT SPEECH. Your job is to create unshakeable conviction that extraordinary effort, right now, will produce the desired outcome. Convert hesitation into immediate, focused, maximal action.`;
}

/**
 * Build the user message for energizing script generation
 */
async function buildEnergizingUserMessage(
  plan: MeditationPlan,
  questionnaire?: { specificOutcome?: string }
): Promise<string> {
  // Get full technique details from V2 database with implementation protocols
  const techniqueResults = await Promise.all(plan.components
    .map(async (c) => {
      const tech = await getTechniqueById(c.componentId);
      if (!tech) {
        return `- ${c.componentName}: ${c.rationale} (${c.durationMinutes} min)`;
      }

      // Handle both v1 (string[]) and v2 (categorized object) languagePatterns
      const lp = tech.implementationProtocol?.languagePatterns;
      let patternsBlock = '';
      if (lp && !Array.isArray(lp)) {
        // v2 categorized format
        const sections = [
          { label: 'Opening Hooks', items: lp.openingHooks },
          { label: 'Core Process', items: lp.coreProcess },
          { label: 'Intensifiers', items: lp.deepeningIntensifiers },
          { label: 'Transitions', items: lp.transitionBridges },
          { label: 'Closing Anchors', items: lp.closingAnchors },
        ];
        patternsBlock = sections
          .filter(s => s.items?.length)
          .map(s => `    ${s.label}: ${s.items.slice(0, 3).map(p => `"${p}"`).join(', ')}`)
          .join('\n');
      } else if (Array.isArray(lp)) {
        // v1 flat array fallback
        patternsBlock = lp.slice(0, 5).map((p, i) => `    ${i + 1}. "${p}"`).join('\n');
      }

      // Get best script example
      const examples = (tech as any).scriptExamples || [];
      const bestExample = examples[0] || (tech as any).scriptExample;
      const scriptExcerpt = bestExample?.excerpt || '';

      const academicSource = tech.academicSources?.[0];

      // Build self-speech adaptation guidance
      const selfSpeech = (tech as any).selfSpeechAdaptation;
      const selfSpeechBlock = selfSpeech ? `
  Self-Speech Adaptation:
    Pronoun Strategy: ${selfSpeech.pronounStrategy} | Style: ${selfSpeech.internalMonologueStyle}
    Confrontation: ${selfSpeech.confrontationLevel} | Entry: ${selfSpeech.emotionalEntryPoint} → ${selfSpeech.transformationTarget}` : '';

      // Build emotional arc guidance
      const arc = (tech as any).emotionalArc;
      const arcBlock = arc ? `
  Emotional Arc: ${arc.startingState?.substring(0, 60)}... → ${arc.peakMoment?.substring(0, 60)}... → ${arc.resolutionState?.substring(0, 60)}...` : '';

      // Build voice delivery notes
      const voice = (tech as any).voiceDeliveryNotes;
      const voiceBlock = voice ? `
  Voice Delivery: ${voice.paceGuidance?.substring(0, 100)}...
    Emphasis Words: ${(voice.emphasisWords || []).slice(0, 6).join(', ')}` : '';

      // Build rhetorical devices
      const devices = (tech as any).rhetoricalDevices;
      const devicesBlock = devices?.length ? `
  Rhetorical Devices: ${devices.slice(0, 3).map((d: any) => `${d.device} (${d.application})`).join('; ')}` : '';

      // Build user context example if audience type matches
      const userExamples = (tech as any).userContextExamples;
      let contextBlock = '';
      if (userExamples) {
        const audienceType = plan.messagingFramework.audienceType.toLowerCase();
        const matchKey = Object.keys(userExamples).find(k => audienceType.includes(k));
        if (matchKey && userExamples[matchKey]) {
          const ex = userExamples[matchKey];
          contextBlock = `
  Archetype Example (${matchKey}): "${ex.scriptExcerpt?.substring(0, 150)}..."`;
        }
      }

      // Creative inspirations
      const inspirations = (tech as any).creativeInspirations;
      const inspirationBlock = inspirations?.length ? `
  Creative Inspiration: ${inspirations[0].source} — ${inspirations[0].insight?.substring(0, 80)}` : '';

      return `- **${tech.name}** (${c.durationMinutes} min)
  Rationale: ${c.rationale}
  Evidence: ${tech.evidenceLevel} ${academicSource ? `(${Array.isArray(academicSource.authors) ? academicSource.authors[0] : academicSource.authors}, ${academicSource.year})` : ''}

  Implementation Guidance:
  ${tech.implementationProtocol?.setup || 'Use for performance enhancement'}
  ${tech.implementationProtocol?.coreProcess || ''}

  Proven Language Patterns:
${patternsBlock}
${selfSpeechBlock}${arcBlock}${devicesBlock}${voiceBlock}${inspirationBlock}${contextBlock}

${scriptExcerpt ? `  Practitioner Example:\n  "${scriptExcerpt.length > 200 ? scriptExcerpt.substring(0, 200) + '...' : scriptExcerpt}"\n` : ''}`;
    }));
  const techniqueDetails = techniqueResults.join('\n\n');

  const targetWords = Math.round(plan.sessionStructure.totalMinutes * 170); // 170 words/min for energizing pace

  const isUltraQuick = plan.sessionStructure.totalMinutes === 1;

  return `Write a complete ENERGIZING, HIGH-ENERGY motivational script based on this plan.

# Script Parameters

**Total Duration**: ${plan.sessionStructure.totalMinutes} minutes (STRICT - do not exceed)
**Target Word Count**: ${targetWords} words (STRICT RANGE: ${Math.round(targetWords * 0.95)}-${Math.round(targetWords * 1.05)} words maximum)
**Speaking Pace**: 160-180 words/minute (FASTER than meditation)
**Energy Level**: HIGH - This is activation, not relaxation
**Style**: ${isUltraQuick ? 'Ultra-punchy smelling salts moment / Instant fire / Zero fluff' : 'Locker room speech / Rally cry / Pre-performance activation'}

CRITICAL: Your script MUST be between ${Math.round(targetWords * 0.95)}-${Math.round(targetWords * 1.05)} words to fit the ${plan.sessionStructure.totalMinutes}-minute duration.${isUltraQuick ? '\n\n⚡ ULTRA-SHORT FORMAT: This is a 1-minute activation. NO warm-up, NO gradual build. Hit them IMMEDIATELY with maximum intensity. Every single word must pack a punch. Think: explosive one-liners, rapid-fire declarations, instant activation. NO filler words, NO transitions, PURE ENERGY.' : ''}

# User Context

**Key Values**: ${plan.messagingFramework.keyValues.join(', ')}
**Audience Type**: ${plan.messagingFramework.audienceType}
**Overall Goal**: ${plan.overallRationale}
${questionnaire?.specificOutcome ? `**User's Specific Outcome**: "${questionnaire.specificOutcome}"` : ''}

# Psychological Techniques to Implement (V2 Database)

${techniqueDetails}

# Your Mission

Write a ${plan.sessionStructure.totalMinutes}-minute energizing script (~${targetWords} words) that:

1. **ACTIVATES, NOT CALMS** - This is high-energy motivation
2. **Creates urgency** - "Right now", "This moment" language
3. **Uses collective identity** - Heavy "we/us/together" framing
4. **Builds dissonance** - Highlights gap between potential and current state
5. **Paints vivid success** - Concrete, sensory imagery of achievement
6. **Demands action** - Crystal clear next step
7. **LEVERAGES PROVEN LANGUAGE PATTERNS** - Use the implementation protocols from each technique above

${isUltraQuick ? `Focus on RAPID IMPACT - compress all 5 elements into ultra-concise statements:
- Immediate Urgency (~20 words): Hit them NOW, establish this exact moment matters
- Identity Trigger (~40 words): "You're the kind of person who..." - activate their identity
- Gap Awareness (~40 words): Show the distance between who they are and where they're at
- Victory Vision (~40 words): Paint the win in vivid detail, make it feel inevitable
- Action Command (~30 words): ONE clear instruction, zero ambiguity, maximum force` : `Follow the 5-phase structure (adapt times proportionally):
- Opening Urgency (${Math.round(plan.sessionStructure.totalMinutes * 0.12)} min / ~${Math.round(targetWords * 0.12)} words)
- Identity Activation (${Math.round(plan.sessionStructure.totalMinutes * 0.23)} min / ~${Math.round(targetWords * 0.23)} words)
- Dissonance Creation (${Math.round(plan.sessionStructure.totalMinutes * 0.23)} min / ~${Math.round(targetWords * 0.23)} words)
- Vivid Future Imagery (${Math.round(plan.sessionStructure.totalMinutes * 0.23)} min / ~${Math.round(targetWords * 0.23)} words)
- Call to Action (${Math.round(plan.sessionStructure.totalMinutes * 0.12)} min / ~${Math.round(targetWords * 0.12)} words)`}

Use ElevenLabs v3 audio tags sparingly (5-8 times max): [excited], [intense], [confident], [determined], [passionate]

Use punctuation for pauses: commas and em-dashes (—) for brief pauses, periods and paragraph breaks for longer pauses.

IMPORTANT: DO NOT use SSML <break> tags - eleven_v3 does NOT support them.

## WORD COUNT REQUIREMENT

You MUST deliver a script between ${Math.round(targetWords * 0.95)}-${Math.round(targetWords * 1.05)} words.
This is critical for proper timing. If your script is too long, it will exceed the ${plan.sessionStructure.totalMinutes}-minute limit when spoken.

${isUltraQuick ? `🔥 ULTRA-SHORT CHECKLIST:
- Total word count: 161-178 words (STRICT)
- NO warm-up, NO "let's begin" - START AT MAXIMUM INTENSITY
- Every sentence = impact statement or action trigger
- NO explanations, NO elaborations, NO filler
- Think: punchy one-liners, declarations, commands
- End with ONE crystal-clear action instruction

` : ''}Write the complete energizing script now. Make it POWERFUL. Make it ACTIVATING. Make it impossible to ignore.${isUltraQuick ? ' Make every single word COUNT.' : ' Stay within the word count range.'}`;
}

/**
 * Generate an energizing script from an approved plan
 */
export async function generateEnergizingScript(
  plan: MeditationPlan,
  questionnaire?: { specificOutcome?: string }
): Promise<{ script: EnergizingScript; aiResponse: ClaudeResponse }> {
  const systemPrompt = buildEnergizingSystemPrompt();
  const userMessage = await buildEnergizingUserMessage(plan, questionnaire);

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

  const userMessage = `${await buildEnergizingUserMessage(plan, questionnaire)}

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
