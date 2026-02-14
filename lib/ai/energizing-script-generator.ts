/**
 * Energizing Script Generator — Self-Rally Arc Architecture
 *
 * Generates deeply personalized self-speech scripts for solo listeners.
 * Based on MirrorSpeechAnatomy.md research: cortisol → oxytocin → dopamine arc.
 *
 * Pronoun architecture: I (first-person adjacent) → You → Name (imperative)
 * Five beats: Spiral → Confrontation → Reframe → Fuel → Lock-In
 *
 * UPDATED: Full questionnaire context (innerCritic, pastSuccess, victoryVision, etc.)
 * UPDATED: Enriched technique fields (selfSpeechAdaptation, emotionalArc, voiceDeliveryNotes)
 */

import { generateText, ClaudeResponse } from './claude';
import { MeditationPlan } from './plan-generator';
import { getTechniqueById } from './meditation-knowledge-base-v2';
import { MappedQuestionnaireData } from '../questionnaire/response-mapper';

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

/** Self-Rally beat names, mapped to script position */
type SelfRallyBeat = 'spiral' | 'confrontation' | 'reframe' | 'fuel' | 'lock_in';

/**
 * Build the system prompt — Self-Rally Arc Architecture
 */
function buildEnergizingSystemPrompt(): string {
  return `You are writing a deeply personal self-rally speech for ONE person listening ALONE. This is not a group speech. There is no crowd, no team, no "we." This is the voice inside the mirror — the version of them that refuses to lose.

# Core Identity

You are the listener's fiercest internal ally. Not a therapist. Not a meditation guide. A mirror that speaks back with absolute conviction. Your job: take someone spiraling in doubt and walk them out the other side ready to dominate.

# Self-Rally Arc (5 Beats)

Every script follows this neurochemical sequence. Each beat serves a specific biological and psychological function.

## Beat 1: THE SPIRAL (10-15%)
**Function**: Enter the listener's actual darkness. Name what they're feeling before they can.
**Neurochemical**: Cortisol (captures attention through recognition)
**Pronoun**: First-person adjacent — describe their internal state as if reading their mind. Use "I know" / "Right now" / "That voice" framing.
**Techniques**: Raw acknowledgment, pattern interruption through radical honesty, naming the specific fear.
**Key**: Do NOT rush past this. The listener must feel genuinely SEEN before they'll trust the turn.

## Beat 2: THE CONFRONTATION (10-15%)
**Function**: Break the spiral. Call out the lie. Force a choice.
**Neurochemical**: Cortisol peak → turn (the pattern-break moment)
**Pronoun**: Shift to second-person — "You" becomes direct, unflinching.
**Techniques**: Antithesis (juxtapose who they are vs. how they're acting), rhetorical questions ("Is THIS who you are?"), the uncomfortable truth delivered with love.
**Key**: This is the hinge. The moment doubt becomes fuel. Make it sharp.

## Beat 3: THE REFRAME (20-25%)
**Function**: Cognitive restructuring. Rebuild identity from the ashes of the confrontation.
**Neurochemical**: Oxytocin (trust, bonding with new self-concept)
**Pronoun**: Second-person dominant — "You are someone who..." / weave in their identity statement.
**Techniques**: Identity reframing, evidence stacking (past wins as proof), rewriting the narrative, connecting current challenge to core values.
**Key**: This is where the listener's own words get woven in — their identity statement, their values, their past success. Make it THEIRS.

## Beat 4: THE FUEL (20-25%)
**Function**: Vivid sensory peak. The "goosebump moment." Paint their victory so real they taste it.
**Neurochemical**: Dopamine (reward anticipation, peak emotional payoff)
**Pronoun**: Second-person + name if available — "You walk in there and..." / most intimate, most vivid.
**Techniques**: Sensory-rich visualization (match their visualization style), obsessive repetition building to crescendo, memory fragments from their past success, future pacing in present tense.
**Key**: This is the emotional climax. Use their victory vision. Make the future feel like a memory they're recalling.

## Beat 5: THE LOCK-IN (10-15%)
**Function**: Crystallize decision into physical action. The body remembers what the mind forgets.
**Neurochemical**: Norepinephrine (action readiness, commitment)
**Pronoun**: Imperative commands — direct, short, undeniable.
**Techniques**: Physical cue activation, single clear action, countdown or trigger, the "promise to self" moment.
**Key**: End with something they DO, not something they think. A breath, a fist clench, a step forward. The body seals the deal.

# Pronoun Architecture (CRITICAL — Never Break)

- **NEVER** use "we," "us," "together," or any collective/tribal language
- Beat 1: First-person adjacent ("I know what's happening right now..." / "That voice saying...")
- Beat 2: Direct second-person ("You know better than this." / "Is that who you are?")
- Beat 3-4: Second-person intimate ("You are the person who..." / "You've done this before...")
- Beat 5: Imperative ("Stand up." / "Take that breath." / "Go.")

# Self-Speech Rhetorical Devices

Use these liberally — they are the native language of internal monologue:

- **Obsessive Repetition**: Hammer a phrase 3-5 times with escalating intensity. "You've done this. You've done harder than this. You've done the impossible version of this."
- **Antithesis**: Juxtapose weakness and strength in the same breath. "They see someone nervous. You ARE someone dangerous."
- **Rhetorical Questions to Self**: "When has playing it safe EVER been who you are?"
- **Memory Fragments**: Short, vivid flashes from their past. "Remember that Tuesday. Remember how they looked at you after."
- **Physical Punctuation**: Commands that break mental loops. "Drop your shoulders. Unclench your jaw. Now breathe."
- **The Callback**: Reference something from Beat 1 in Beat 4-5, transformed. The fear becomes the fuel.

# Intrinsic Motivation Framework (Daniel Pink)

Thread these through Beats 3-4:
- **Autonomy**: "This is YOUR choice. Nobody else gets to decide this for you."
- **Mastery**: "You didn't get here by accident. Every rep, every failure, every late night — it built THIS."
- **Purpose**: "This matters because of who you are, not what they think."

# ElevenLabs Voice Direction

Audio tags in SQUARE BRACKETS — not spoken aloud, they direct the AI voice:
- [intense] — urgency, conviction (use in Confrontation and Fuel)
- [confident] — unwavering certainty (use in Reframe)
- [determined] — call-to-action energy (use in Lock-In)
- [passionate] — emotional crescendos (use in Fuel peak)
- [excited] — positive forward momentum (use in Fuel)

Rules:
- Use 5-8 tags per script maximum, at KEY psychological shift moments only
- NEVER use parentheses or asterisks — they will be spoken aloud
- Pauses: commas and em-dashes (—) for brief, periods for short, paragraph breaks for medium
- DO NOT use SSML break tags — eleven_v3 does NOT support them
- DO NOT use ellipses ("..." or ".....") — inconsistent pauses
- Speaking pace: 160-180 words/minute (activation pace, not meditation pace)

# Output Format

Write ONLY the script text with ElevenLabs formatting. No titles, headings, section labels, meta-commentary, or explanations. Start with the first words they hear. End with the last words before they act.`;
}

/**
 * Build enriched technique block for a single plan component
 */
async function buildTechniqueBlock(
  component: MeditationPlan['components'][0],
  audienceType: string
): Promise<string> {
  const tech = await getTechniqueById(component.componentId);
  if (!tech) {
    return `- ${component.componentName}: ${component.rationale} (${component.durationMinutes} min)`;
  }

  // Core identity
  const descriptionLine = (tech as any).description
    ? `  What It Is: ${(tech as any).description.split('.').slice(0, 2).join('.')}.`
    : '';
  const mechanismLine = (tech as any).psychologicalMechanism
    ? `  Mechanism: ${(tech as any).psychologicalMechanism.split('.')[0]}.`
    : '';

  // Implementation guidance
  const implBlock = [
    tech.implementationProtocol?.setup || '',
    tech.implementationProtocol?.coreProcess || '',
    tech.implementationProtocol?.deliveryNotes || '',
  ].filter(Boolean).join('\n  ');

  // Language patterns
  const lp = tech.implementationProtocol?.languagePatterns;
  let patternsBlock = '';
  if (lp && !Array.isArray(lp)) {
    const sections = [
      { label: 'Opening Hooks', items: lp.openingHooks },
      { label: 'Core Process', items: lp.coreProcess },
      { label: 'Intensifiers', items: lp.deepeningIntensifiers },
      { label: 'Transitions', items: lp.transitionBridges },
      { label: 'Closing Anchors', items: lp.closingAnchors },
    ];
    patternsBlock = sections
      .filter(s => s.items?.length)
      .map(s => `    ${s.label}: ${s.items.slice(0, 3).map((p: string) => `"${p}"`).join(', ')}`)
      .join('\n');
  } else if (Array.isArray(lp)) {
    patternsBlock = lp.slice(0, 5).map((p: string, i: number) => `    ${i + 1}. "${p}"`).join('\n');
  }

  // Self-speech adaptation (full — richest guidance field)
  const selfSpeech = (tech as any).selfSpeechAdaptation;
  const selfSpeechBlock = selfSpeech ? `
  Self-Speech Adaptation:
    Pronoun Strategy: ${selfSpeech.pronounStrategy} | Style: ${selfSpeech.internalMonologueStyle}
    Confrontation: ${selfSpeech.confrontationLevel} | Entry: ${selfSpeech.emotionalEntryPoint} → ${selfSpeech.transformationTarget}
    Guidance: ${selfSpeech.adaptationNotes || ''}` : '';

  // Emotional arc (full — includes beat mapping)
  const arc = (tech as any).emotionalArc;
  const arcBlock = arc ? `
  Emotional Arc:
    Start: ${arc.startingState || ''}
    Build: ${arc.buildPhase || ''}
    Peak: ${arc.peakMoment || ''}
    Resolution: ${arc.resolutionState || ''}
    Maps To Beat: ${arc.darknessToLightMapping || ''}` : '';

  // Voice delivery notes (full — toneShifts, breathPoints, elevenLabsTags)
  const voice = (tech as any).voiceDeliveryNotes;
  let voiceBlock = '';
  if (voice) {
    const parts = [`  Voice Delivery: ${voice.paceGuidance || ''}`];
    if (voice.toneShifts?.length) {
      parts.push(`    Tone Shifts: ${voice.toneShifts.join(' | ')}`);
    }
    if (voice.emphasisWords?.length) {
      parts.push(`    Emphasis Words: ${voice.emphasisWords.join(', ')}`);
    }
    if (voice.breathPoints?.length) {
      parts.push(`    Breath Points: ${voice.breathPoints.join(' | ')}`);
    }
    if (voice.elevenLabsTags?.length) {
      parts.push(`    ElevenLabs Tags: ${voice.elevenLabsTags.join(', ')}`);
    }
    voiceBlock = '\n' + parts.join('\n');
  }

  // Rhetorical devices (with examples)
  const devices = (tech as any).rhetoricalDevices;
  const devicesBlock = devices?.length ? `
  Rhetorical Devices: ${devices.slice(0, 3).map((d: any) =>
    `${d.device} — ${d.application}${d.example ? ` (e.g. "${d.example}")` : ''}`
  ).join('; ')}` : '';

  // Script examples — archetype-matched, full excerpt
  const examples = (tech as any).scriptExamples || [];
  const bestExample = examples[0] || (tech as any).scriptExample;
  const scriptExcerpt = bestExample?.excerpt || '';

  // User context examples — match audienceType, full excerpt + keyAdaptations
  const userExamples = (tech as any).userContextExamples;
  let contextBlock = '';
  if (userExamples) {
    const matchKey = Object.keys(userExamples).find(k => audienceType.toLowerCase().includes(k));
    if (matchKey && userExamples[matchKey]) {
      const ex = userExamples[matchKey];
      contextBlock = `
  Archetype Example (${matchKey}): "${ex.scriptExcerpt || ''}"`;
      if (ex.keyAdaptations) {
        contextBlock += `\n    Key Adaptations: ${ex.keyAdaptations}`;
      }
    }
  }

  // Creative inspirations (full insight + applicationNote)
  const inspirations = (tech as any).creativeInspirations;
  const inspirationBlock = inspirations?.length ? `
  Creative Inspiration: ${inspirations[0].source} — ${inspirations[0].insight || ''}${inspirations[0].applicationNote ? ` | Application: ${inspirations[0].applicationNote}` : ''}` : '';

  const academicSource = tech.academicSources?.[0];

  return `- **${tech.name}** (${component.durationMinutes} min)
  Rationale: ${component.rationale}
  Evidence: ${tech.evidenceLevel} ${academicSource ? `(${Array.isArray(academicSource.authors) ? academicSource.authors[0] : academicSource.authors}, ${academicSource.year})` : ''}
${descriptionLine ? `\n${descriptionLine}` : ''}
${mechanismLine ? `${mechanismLine}` : ''}

  Implementation:
  ${implBlock}

  Language Patterns:
${patternsBlock}
${selfSpeechBlock}${arcBlock}${devicesBlock}${voiceBlock}${inspirationBlock}${contextBlock}

${scriptExcerpt ? `  Practitioner Example:\n  "${scriptExcerpt}"\n` : ''}`;
}

/**
 * Build technique flow map — transition language between adjacent techniques
 */
function buildTechniqueFlowMap(
  components: MeditationPlan['components'][],
  techniqueData: Map<string, any>
): string {
  if (components.length < 2) return '';

  const transitions: string[] = [];
  for (let i = 0; i < components.length - 1; i++) {
    const currentId = (components[i] as any).componentId;
    const nextId = (components[i + 1] as any).componentId;
    const currentTech = techniqueData.get(currentId);
    if (!currentTech) continue;

    const combos = currentTech.combinesWellWith || [];
    const match = combos.find((c: any) => c.id === nextId);
    if (match) {
      transitions.push(
        `${currentTech.name} → ${match.name}: "${match.transitionLanguage || ''}" (${match.combinedEffect || ''})`
      );
    }
  }

  if (!transitions.length) return '';

  return `\n# Technique Transitions (use these to bridge smoothly)\n\n${transitions.join('\n')}\n`;
}

/**
 * Build questionnaire context block for the user message
 */
function buildQuestionnaireContext(q: MappedQuestionnaireData): string {
  let ctx = `# User Context (from questionnaire)

**Performance Arena**: ${q.userType}
**Immediate Situation**: ${q.immediateSituation || q.specificOutcome}
**Time Urgency**: ${q.timeUrgency}
**What's at Stake**: ${q.stakes}
**Mental State**: ${q.mentalState}
**What They Need**: ${q.currentNeed}
**Challenge Type**: ${q.challengeType}`;

  if (q.physicalState) ctx += `\n**Physical State**: ${q.physicalState}`;
  if (q.energyLevel) ctx += `\n**Energy Level**: ${q.energyLevel}`;

  // Tier 2 deep personalization — mapped to specific beats
  const tier2Parts: string[] = [];

  if (q.innerCritic) {
    tier2Parts.push(`**Inner Critic Voice** [USE IN BEAT 1-2: name this voice in The Spiral, confront it in The Confrontation]: "${q.innerCritic}"`);
  }
  if (q.pastSuccess) {
    tier2Parts.push(`**Peak Performance Memory** [USE IN BEAT 4: weave this memory into The Fuel as vivid sensory flashback]: ${q.pastSuccess}`);
  }
  if (q.victoryVision) {
    tier2Parts.push(`**Victory Vision** [USE IN BEAT 4: paint this scene in The Fuel, present tense, multi-sensory]: ${q.victoryVision}`);
  }
  if (q.identityStatement) {
    tier2Parts.push(`**Identity Statement** [USE IN BEAT 3: weave into The Reframe as core identity]: "I am someone who ${q.identityStatement}"`);
  }
  if (q.motivationSource) {
    tier2Parts.push(`**Motivation Source** [USE IN BEAT 3-4]: ${q.motivationSource}`);
  }
  if (q.physicalCue) {
    const cueLabels: Record<string, string> = {
      breath: 'deep, powerful breathing',
      movement: 'physical movement/shaking out',
      posture: 'power posture/standing tall',
      hands: 'clapping/fist clench',
      voice: 'vocalization/self-talk',
    };
    tier2Parts.push(`**Physical Activation Cue** [USE IN BEAT 5: end The Lock-In with this action]: ${cueLabels[q.physicalCue] || q.physicalCue}`);
  }
  if (q.visualizationStyle) {
    const vizLabels: Record<string, string> = {
      visual: 'vivid visual imagery (they SEE their success)',
      feeling: 'body sensations and feelings (they FEEL it in their body)',
      words: 'internal dialogue and sounds (they HEAR the words)',
      mixed: 'multi-sensory (visual + feeling + audio)',
    };
    tier2Parts.push(`**Visualization Style** [GUIDES BEAT 4 sensory approach]: ${vizLabels[q.visualizationStyle] || q.visualizationStyle}`);
  }
  if (q.accountability) {
    tier2Parts.push(`**Promise to Self** [USE IN BEAT 5]: ${q.accountability}`);
  }

  if (tier2Parts.length) {
    ctx += `\n\n# Deep Personalization (use these — the user provided them)\n\n${tier2Parts.join('\n')}`;
  }

  return ctx;
}

/**
 * Build the user message for energizing script generation
 */
async function buildEnergizingUserMessage(
  plan: MeditationPlan,
  questionnaire?: MappedQuestionnaireData
): Promise<string> {
  // Build enriched technique blocks
  const audienceType = plan.messagingFramework.audienceType;
  const techniqueData = new Map<string, any>();

  const techniqueBlocks = await Promise.all(
    plan.components.map(async (c) => {
      const tech = await getTechniqueById(c.componentId);
      if (tech) techniqueData.set(c.componentId, tech);
      return buildTechniqueBlock(c, audienceType);
    })
  );

  // Build technique flow map for transitions
  const flowMap = buildTechniqueFlowMap(
    plan.components as any,
    techniqueData
  );

  // Use questionnaire sessionLength as authoritative duration when available
  // (plan AI sometimes ignores the duration constraint)
  const sessionLengthMinutes: Record<string, number> = {
    ultra_quick: 1,
    quick: 3,
    standard: 6,
    deep: 12,
  };
  const effectiveMinutes = questionnaire?.sessionLength
    ? sessionLengthMinutes[questionnaire.sessionLength] ?? plan.sessionStructure.totalMinutes
    : plan.sessionStructure.totalMinutes;

  const targetWords = Math.round(effectiveMinutes * 170);
  const isUltraQuick = effectiveMinutes <= 1;

  // Build questionnaire context
  const questionnaireBlock = questionnaire
    ? buildQuestionnaireContext(questionnaire)
    : `# User Context\n\n**Key Values**: ${plan.messagingFramework.keyValues.join(', ')}\n**Audience Type**: ${audienceType}\n**Overall Goal**: ${plan.overallRationale}`;

  return `Write a complete SELF-RALLY speech based on this plan. This person listens ALONE.

# Script Parameters

**Total Duration**: ${effectiveMinutes} minutes (STRICT)
**Target Word Count**: ${targetWords} words (STRICT RANGE: ${Math.round(targetWords * 0.95)}-${Math.round(targetWords * 1.05)} words)
**Energy Level**: HIGH — activation, not relaxation
${isUltraQuick ? '**Style**: Ultra-punchy smelling salts / Instant fire / Zero fluff' : '**Style**: Mirror speech / Self-rally / The voice that refuses to let you lose'}

CRITICAL: Script MUST be ${Math.round(targetWords * 0.95)}-${Math.round(targetWords * 1.05)} words for the ${effectiveMinutes}-minute duration.${isUltraQuick ? '\n\nULTRA-SHORT: 1-minute activation. NO warm-up. Hit IMMEDIATELY with maximum intensity. Every word must punch. Compress all 5 beats into rapid-fire delivery.' : ''}

${questionnaireBlock}

**Key Values**: ${plan.messagingFramework.keyValues.join(', ')}
**Overall Goal**: ${plan.overallRationale}

# Psychological Techniques to Implement

${techniqueBlocks.join('\n\n')}
${flowMap}
# Your Mission

Write a ${effectiveMinutes}-minute self-rally speech (~${targetWords} words) following the 5-beat Self-Rally Arc:

${isUltraQuick ? `Compress all beats into ultra-concise statements:
- The Spiral (~20 words): Name their darkness NOW
- The Confrontation (~25 words): Break the lie, force the choice
- The Reframe (~40 words): Rebuild identity with their own words
- The Fuel (~45 words): Paint the win — vivid, inevitable
- The Lock-In (~30 words): ONE physical action, zero ambiguity` : `- The Spiral (${Math.round(targetWords * 0.12)} words): Enter their darkness, name what they feel
- The Confrontation (${Math.round(targetWords * 0.12)} words): Break the spiral, call out the lie
- The Reframe (${Math.round(targetWords * 0.23)} words): Rebuild identity, stack evidence, weave their words
- The Fuel (${Math.round(targetWords * 0.23)} words): Vivid sensory peak, goosebump moment, victory made real
- The Lock-In (${Math.round(targetWords * 0.12)} words): Physical action, decision crystallized, GO`}

REMEMBER:
- NEVER use "we/us/together" — this person is ALONE
- Use their questionnaire data — it's deeply personal, honor it
- Follow the pronoun arc: first-person adjacent → second-person → imperative
- Use The Callback: reference Beat 1's fear in Beat 4-5, transformed

Write the complete self-rally speech now.${isUltraQuick ? ' Every word COUNTS.' : ''}`;
}

/**
 * Detect which Self-Rally beat a section belongs to based on position
 */
function detectBeat(sectionText: string, fullScriptText: string): SelfRallyBeat {
  const sectionStart = fullScriptText.indexOf(sectionText);
  if (sectionStart === -1) return 'reframe'; // fallback to middle beat

  const position = sectionStart / fullScriptText.length;

  if (position < 0.15) return 'spiral';
  if (position < 0.28) return 'confrontation';
  if (position < 0.55) return 'reframe';
  if (position < 0.85) return 'fuel';
  return 'lock_in';
}

/** Beat-specific guidance for section regeneration */
const BEAT_GUIDANCE: Record<SelfRallyBeat, { pronoun: string; function: string; devices: string }> = {
  spiral: {
    pronoun: 'First-person adjacent — "I know..." / "That voice..." / "Right now..."',
    function: 'Enter their darkness. Name what they feel before they can. Make them feel SEEN.',
    devices: 'Raw acknowledgment, naming the specific fear, pattern interruption through radical honesty',
  },
  confrontation: {
    pronoun: 'Direct second-person — "You know better." / "Is that who you are?"',
    function: 'Break the spiral. Call out the lie. Force a choice between comfort and identity.',
    devices: 'Antithesis, rhetorical questions, uncomfortable truth delivered with love',
  },
  reframe: {
    pronoun: 'Second-person intimate — "You are someone who..." / weave their identity statement',
    function: 'Rebuild identity. Stack evidence from their past. Connect challenge to core values.',
    devices: 'Identity reframing, evidence stacking, narrative rewriting, intrinsic motivation (autonomy/mastery/purpose)',
  },
  fuel: {
    pronoun: 'Second-person + name — most intimate, most vivid',
    function: 'Vivid sensory peak. Paint their victory so real they taste it. The goosebump moment.',
    devices: 'Sensory visualization, obsessive repetition, memory fragments, future pacing in present tense, The Callback',
  },
  lock_in: {
    pronoun: 'Imperative commands — direct, short, undeniable',
    function: 'Crystallize decision into physical action. The body seals the deal.',
    devices: 'Physical cue activation, countdown/trigger, promise to self, single clear action',
  },
};

/**
 * Generate an energizing script from an approved plan
 */
export async function generateEnergizingScript(
  plan: MeditationPlan,
  questionnaire?: MappedQuestionnaireData
): Promise<{ script: EnergizingScript; aiResponse: ClaudeResponse }> {
  const systemPrompt = buildEnergizingSystemPrompt();
  const userMessage = await buildEnergizingUserMessage(plan, questionnaire);

  // Use questionnaire sessionLength as authoritative duration source
  const sessionLengthMinutes: Record<string, number> = {
    ultra_quick: 1, quick: 3, standard: 6, deep: 12,
  };
  const effectiveMinutes = questionnaire?.sessionLength
    ? sessionLengthMinutes[questionnaire.sessionLength] ?? plan.sessionStructure.totalMinutes
    : plan.sessionStructure.totalMinutes;
  const targetWords = Math.round(effectiveMinutes * 170);
  const maxTokens = Math.min(Math.round(targetWords * 1.5), 8000);

  const aiResponse = await generateText(userMessage, {
    systemPrompt,
    maxTokens,
    temperature: 0.8,
  });

  const scriptText = aiResponse.content.trim();
  const wordCount = scriptText.split(/\s+/).length;
  const estimatedDurationSeconds = Math.round((wordCount / 170) * 60);

  const script: EnergizingScript = {
    meditationPlanId: '',
    userId: plan.userId,
    scriptText,
    wordCount,
    estimatedDurationSeconds,
    status: 'pending_approval',
    version: 1,
    elevenLabsGuidance: {
      style: 'energizing_motivational',
      stability: 0.4,
      similarityBoost: 0.75,
      speakingRate: '1.1x',
      emphasis: [
        'Build intensity through the 5-beat arc',
        'Intimate conviction — speaking to ONE person, not a crowd',
        'Sharp tonal shift at The Confrontation',
        'Emotional crescendo through The Fuel',
        'Commanding authority in The Lock-In',
        'Brief pauses only — maintain momentum',
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
  questionnaire?: MappedQuestionnaireData
): Promise<{ script: EnergizingScript; aiResponse: ClaudeResponse }> {
  const systemPrompt = buildEnergizingSystemPrompt();

  const userMessage = `${await buildEnergizingUserMessage(plan, questionnaire)}

# Previous Script (REJECTED)

${originalScript.scriptText.substring(0, 500)}...
[${originalScript.wordCount} words, ${Math.round(originalScript.estimatedDurationSeconds / 60)} minutes estimated]

# Admin Feedback

${feedback}

# Instructions

Create a NEW self-rally speech that addresses the admin feedback while following the Self-Rally Arc. Make it MORE personal, MORE visceral, MORE impossible to ignore. Use the listener's questionnaire data deeply.

Write the complete script now.`;

  const targetWords = Math.round(plan.sessionStructure.totalMinutes * 170);
  const maxTokens = Math.min(Math.round(targetWords * 1.5), 8000);

  const aiResponse = await generateText(userMessage, {
    systemPrompt,
    maxTokens,
    temperature: 0.85,
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
 * Now with beat-awareness and questionnaire context
 */
export async function regenerateEnergizingSection(
  originalScript: EnergizingScript,
  plan: MeditationPlan,
  sectionText: string,
  userFeedback: string,
  questionnaire?: MappedQuestionnaireData
): Promise<string> {
  // Detect which beat this section belongs to
  const beat = detectBeat(sectionText, originalScript.scriptText);
  const beatGuide = BEAT_GUIDANCE[beat];

  // Get relevant technique data for context
  const techniqueNames = plan.components.map(c => c.componentName).join(', ');

  const systemPrompt = `You are rewriting a section of a self-rally speech based on user feedback. This section falls in the "${beat.replace('_', ' ').toUpperCase()}" beat.

# Beat Context
**Function**: ${beatGuide.function}
**Pronoun Approach**: ${beatGuide.pronoun}
**Devices to Use**: ${beatGuide.devices}

# Rules
- Maintain the Self-Rally Arc tone — intimate, fierce, personal
- NEVER use "we/us/together" — this person listens ALONE
- Keep the section roughly the same length
- Address the user's specific feedback
- Match the pronoun architecture for this beat
- Include appropriate ElevenLabs tags sparingly: [intense], [confident], [determined], [passionate], [excited]
- Use punctuation for pauses (commas, em-dashes, periods, paragraph breaks)

Output ONLY the rewritten section text, nothing else.`;

  let userMessage = `Rewrite this section of the self-rally speech based on user feedback.

# Original Section (Beat: ${beat.replace('_', ' ')})

${sectionText}

# User Feedback

${userFeedback}

# Context

${plan.sessionStructure.totalMinutes}-minute self-rally speech for a ${plan.messagingFramework.audienceType}.
Overall goal: ${plan.overallRationale}
Techniques used: ${techniqueNames}`;

  // Add questionnaire context if available
  if (questionnaire) {
    const relevantContext: string[] = [];
    if (beat === 'spiral' || beat === 'confrontation') {
      if (questionnaire.innerCritic) relevantContext.push(`Inner Critic Voice: "${questionnaire.innerCritic}"`);
      if (questionnaire.mentalState) relevantContext.push(`Mental State: ${questionnaire.mentalState}`);
    }
    if (beat === 'reframe') {
      if (questionnaire.identityStatement) relevantContext.push(`Identity: "I am someone who ${questionnaire.identityStatement}"`);
      if (questionnaire.pastSuccess) relevantContext.push(`Past Win: ${questionnaire.pastSuccess}`);
    }
    if (beat === 'fuel') {
      if (questionnaire.victoryVision) relevantContext.push(`Victory Vision: ${questionnaire.victoryVision}`);
      if (questionnaire.pastSuccess) relevantContext.push(`Past Win: ${questionnaire.pastSuccess}`);
      if (questionnaire.visualizationStyle) relevantContext.push(`Viz Style: ${questionnaire.visualizationStyle}`);
    }
    if (beat === 'lock_in') {
      if (questionnaire.physicalCue) relevantContext.push(`Physical Cue: ${questionnaire.physicalCue}`);
      if (questionnaire.accountability) relevantContext.push(`Promise: ${questionnaire.accountability}`);
    }
    if (relevantContext.length) {
      userMessage += `\n\nUser's Personal Data (use this):\n${relevantContext.join('\n')}`;
    }
  }

  userMessage += `\n\nRewrite the section now:`;

  const aiResponse = await generateText(userMessage, {
    systemPrompt,
    maxTokens: 1000,
    temperature: 0.85,
  });

  return aiResponse.content.trim();
}
