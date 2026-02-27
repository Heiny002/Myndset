/**
 * Script Lab Chat — Builder helpers, questionnaire type, and system prompts
 *
 * Supports AI-generated test questionnaires that feed into the script
 * generator pipeline. The questionnaire format is intentionally flexible
 * so we can test both input design and output quality simultaneously.
 */

import type { MeditationPlan, MeditationPlanComponent } from './plan-generator';
import type { MappedQuestionnaireData } from '../questionnaire/response-mapper';
import type { UserType } from '../questionnaire/questions';

// ─── Lab Questionnaire Types ──────────────────────────────────────────────────

export type QuestionCategory =
  | 'immediate_situation'
  | 'mental_state'
  | 'somatic'
  | 'identity'
  | 'fear'
  | 'past_success'
  | 'stakes'
  | 'time_pressure'
  | 'physical'
  | 'commitment';

export interface LabQuestion {
  id: string;
  question: string;
  answer: string;
  category: QuestionCategory;
}

export interface LabQuestionnaire {
  persona: {
    name: string;
    archetype: UserType;
    background: string;
  };
  sessionLength: 'ultra_quick' | 'quick';
  questions: LabQuestion[];
  generatedAt: string;
}

// ─── Questionnaire Generator Prompt ──────────────────────────────────────────

/**
 * Returns the system prompt for the questionnaire generator AI.
 * Designed to produce varied, strategically useful test personas.
 */
export function buildQuestionnaireGeneratorPrompt(): string {
  return `You are a test data generator for Myndset — a performance psychology audio platform.

Your job: generate a realistic test persona and a strategic intake questionnaire to test script generation quality.

# Goals

This questionnaire serves two purposes simultaneously:
1. **Test the script output** — does the generated script actually help this person?
2. **Test the questionnaire design** — are these the RIGHT questions to ask for maximum script quality?

Vary your approach across iterations. Sometimes prioritize emotional depth. Sometimes somatic detail. Sometimes identity-level work. Sometimes stark situational facts. Sometimes narrative arc.

# Output Format

Respond with ONLY valid JSON in this exact structure:

{
  "persona": {
    "name": "First Last",
    "archetype": "entrepreneur|athlete|sales|executive|creative|technical|student",
    "background": "2-3 sentence specific background — include age, profession, specific current context"
  },
  "sessionLength": "ultra_quick|quick",
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "answer": "...",
      "category": "immediate_situation|mental_state|somatic|identity|fear|past_success|stakes|time_pressure|physical|commitment"
    }
  ]
}

# Rules

- Exactly 10 questions
- Cover at least 7 different categories across the 10 questions
- Answers must be SPECIFIC and VIVID — not "I'm nervous" but "My hands are shaking and I keep running the worst-case slide deck in my head"
- The persona must have a clear, high-stakes performance moment happening SOON (within the hour)
- sessionLength: use "ultra_quick" when the moment is imminent (under 5 min away), "quick" otherwise
- DO NOT repeat the same question structures across iterations — vary the framing radically

# Category Definitions

- immediate_situation: What is happening RIGHT NOW in the external world
- mental_state: Current internal emotional/psychological experience
- somatic: Where is the fear/pressure felt physically in the body
- identity: Who do they need to BE — the identity they're reaching for
- fear: The specific thought or voice that is blocking them
- past_success: A real memory of performing well under similar pressure
- stakes: What is ACTUALLY at risk — concrete consequences
- time_pressure: Exactly how long until the moment of performance
- physical: Current body state — energy, sleep, physical preparation
- commitment: What they are willing to do differently, their promise to themselves

Output ONLY valid JSON. No text before or after.`;
}

// ─── Mix Types ────────────────────────────────────────────────────────────────

export interface MixPlanComponent {
  componentId: string;
  componentName: string;
  rationale: string;
  durationMinutes: number;
  evidenceLevel: string;
}

export interface MixPlanOverride {
  approachDescription: string;
  components: MixPlanComponent[];
  phases: Array<{ name: string; durationMinutes: number }>;
}

export interface MixChanges {
  stage1_interpretation?: string;
  stage2_plan?: MixPlanOverride;
  stage3_prompt?: string;
}

export interface MixResult {
  changesId: string;
  description: string;
  rationale: string;
  intensity: 'moderate' | 'radical' | 'experimental';
  changedStages: Array<'stage1' | 'stage2' | 'stage3'>;
  changes: MixChanges;
}

// ─── Mix Generator Prompt ─────────────────────────────────────────────────────

export function buildMixGeneratorPrompt(
  questionnaire: LabQuestionnaire,
  previousMixes: Array<{ changesId: string; description: string; intensity: string }>,
): string {
  const totalMinutes = questionnaire.sessionLength === 'ultra_quick' ? 2 : 4;

  const qBlock = `**${questionnaire.persona.name}** (${questionnaire.persona.archetype})
${questionnaire.persona.background}

Key answers:
${questionnaire.questions.map((q) => `  [${q.category}] ${q.answer.substring(0, 120)}`).join('\n')}`;

  const prevBlock =
    previousMixes.length > 0
      ? `\nPreviously tried this session — go in a DIFFERENT direction:\n${previousMixes.map((m) => `  ${m.changesId} [${m.intensity}]: ${m.description}`).join('\n')}\n`
      : '';

  return `You are a pipeline architect for Myndset — a performance psychology audio platform.

The standard 3-stage script generation pipeline:

== STAGE 1: QUESTIONNAIRE INTERPRETATION ==
All 10 Q&A answers serialized equally into an "immediateSituation" context block.
Standard weighting: mental_state + immediate_situation dominate. Other categories support.
The block is passed verbatim to the script generator as primary persona context.

== STAGE 2: GENERATION PLAN ==
Hardcoded Self-Rally Arc technique stack:
  Ultra-quick (2min): Identity-Based Self-Talk (1m) + Physiological Activation Cue (1m)
  Quick (4min): Cognitive Reappraisal (1m) + Identity-Based Self-Talk (2m) + Implementation Intentions (1m)
Approach: "Direct confrontation arc — spiral to lock-in via identity-based self-speech"

== STAGE 3: SCRIPT GENERATION ==
Self-Rally Arc format:
  1. Pattern interrupt (grab attention fast)
  2. Reality confrontation (brutal truth about current state)
  3. Identity reframe (who they actually are, not who fear says they are)
  4. Evidence lock (past success, proof of capability)
  5. Commitment anchor (physical cue + verbal declaration)
Style: Second-person self-address ("You don't get to quit here"). Aggressive, direct, no fluff.

== CURRENT PERSONA ==
${qBlock}
${prevBlock}
== YOUR JOB ==
Override 1, 2, or all 3 stages. Radically vary intensity across iterations.

Intensity levels:
  moderate — tweak emphasis/weighting within the same paradigm
  radical — different psychological model or structural arc entirely
  experimental — intentionally break conventions, test extreme hypotheses

Directions to consider:
Stage 1: Weight somatic answers 3x over mental state; build from body not mind
Stage 1: Focus exclusively on the fear answer; start from the darkest point
Stage 1: Reframe all answers as third-person observer narration
Stage 2: Acceptance & Commitment Therapy (defusion, values clarification, not confrontation)
Stage 2: Narrative therapy (story reauthoring — the protagonist rewrites the plot)
Stage 2: Stoic philosophy (memento mori, premeditatio malorum, amor fati)
Stage 2: Somatic activation first (body state → breath → posture → THEN mental frame)
Stage 3: Military briefing structure (situation / mission / execution / commander's intent)
Stage 3: Hemingway dialogue style (terse declaratives, zero psychology jargon)
Stage 3: Tonal inversion (soft, accepting, compassionate — opposite of current aggression)
Stage 3: Scientific frame (probabilistic thinking, base rates, expected value calculus)
Stage 3: Theatrical monologue addressed TO the fear, not to the listener
Stage 3: Three-act story — listener as protagonist, fear as antagonist, moment as climax
Stage 3: Pure sensory/physical anchoring — no abstract concepts, only body states and actions

Output ONLY valid JSON:
{
  "changesId": "MIX-XXXX",
  "description": "1-2 sentence description of changes made",
  "rationale": "What hypothesis does this test? What might it reveal?",
  "intensity": "moderate|radical|experimental",
  "changedStages": ["stage1"],
  "changes": {
    "stage1_interpretation": "Optional. 2-4 sentences specifying how to weight/prioritize/reframe the Q&A differently from standard.",
    "stage2_plan": {
      "approachDescription": "New approach description replacing Self-Rally Arc framing",
      "components": [
        {
          "componentId": "snake_case_id",
          "componentName": "Technique name",
          "rationale": "What this does psychologically and why it fits this persona",
          "durationMinutes": 1,
          "evidenceLevel": "strong|moderate|experimental"
        }
      ],
      "phases": [
        { "name": "Phase name", "durationMinutes": ${totalMinutes} }
      ]
    },
    "stage3_prompt": "Optional. Complete replacement system prompt. Must be fully self-contained — generator uses ONLY this, not the standard Self-Rally Arc instructions."
  }
}

Total durationMinutes across all phases must equal ${totalMinutes}.
Output ONLY JSON. No text before or after.`;
}

// ─── Map AI questionnaire → MeditationPlan + MappedQuestionnaireData ─────────

function getAnswerByCategory(questions: LabQuestion[], category: QuestionCategory): string {
  return questions.find((q) => q.category === category)?.answer || '';
}

/** Build hardcoded high-performance component stack from session length */
function buildLabComponents(sessionLength: 'ultra_quick' | 'quick'): MeditationPlanComponent[] {
  if (sessionLength === 'ultra_quick') {
    return [
      {
        componentId: 'self_talk_reframing',
        componentName: 'Identity-Based Self-Talk',
        rationale: 'Rapid identity shift via second-person self-address — replaces doubt narrative with peak-state identity',
        durationMinutes: 1,
        evidenceLevel: 'strong',
      },
      {
        componentId: 'energy_activation',
        componentName: 'Physiological Activation Cue',
        rationale: 'Physical anchor seals the mental state shift — converts internal conviction into body-ready action',
        durationMinutes: 1,
        evidenceLevel: 'strong',
      },
    ];
  }
  return [
    {
      componentId: 'cognitive_reappraisal',
      componentName: 'Cognitive Reappraisal',
      rationale: 'Reframes threat-state arousal as performance-enhancing excitement via frontal lobe override',
      durationMinutes: 1,
      evidenceLevel: 'strong',
    },
    {
      componentId: 'self_talk_reframing',
      componentName: 'Identity-Based Self-Talk',
      rationale: 'Second-person confrontation collapses the gap between current state and peak-performance identity',
      durationMinutes: 2,
      evidenceLevel: 'strong',
    },
    {
      componentId: 'implementation_intentions',
      componentName: 'Implementation Intentions',
      rationale: 'If-then trigger crystallizes readiness into a single executable action — closes the loop',
      durationMinutes: 1,
      evidenceLevel: 'strong',
    },
  ];
}

function buildSessionStructure(sessionLength: 'ultra_quick' | 'quick') {
  if (sessionLength === 'ultra_quick') {
    return {
      duration: 'ultra_quick',
      totalMinutes: 2,
      phases: [
        { name: 'Instant Activation', durationMinutes: 2, components: ['self_talk_reframing', 'energy_activation'] },
      ],
    };
  }
  return {
    duration: 'quick',
    totalMinutes: 4,
    phases: [
      { name: 'Rapid Centering', durationMinutes: 1, components: ['cognitive_reappraisal'] },
      { name: 'Core Activation', durationMinutes: 3, components: ['self_talk_reframing', 'implementation_intentions'] },
    ],
  };
}

/**
 * Build MeditationPlan from an AI-generated questionnaire — no AI call.
 * If planOverride is provided (from a mix), use its components/structure instead of defaults.
 */
export function buildPlanFromQuestionnaire(
  q: LabQuestionnaire,
  userId: string,
  questionnaireId: string,
  planOverride?: MixPlanOverride,
): MeditationPlan {
  const { archetype } = q.persona;

  const components: MeditationPlanComponent[] = planOverride
    ? planOverride.components.map((c) => ({
        componentId: c.componentId,
        componentName: c.componentName,
        rationale: c.rationale,
        durationMinutes: c.durationMinutes,
        evidenceLevel: c.evidenceLevel as MeditationPlanComponent['evidenceLevel'],
      }))
    : buildLabComponents(q.sessionLength);

  const sessionStructure = planOverride
    ? {
        duration: q.sessionLength,
        totalMinutes: q.sessionLength === 'ultra_quick' ? 2 : 4,
        phases: planOverride.phases.map((p, i) => ({
          name: p.name,
          durationMinutes: p.durationMinutes,
          components: [planOverride.components[i]?.componentId].filter(Boolean) as string[],
        })),
      }
    : buildSessionStructure(q.sessionLength);

  const audienceMap: Record<UserType, string> = {
    entrepreneur: 'Entrepreneur/Founder', sales: 'Sales Professional',
    athlete: 'Athlete/Competitor', executive: 'Executive/Leader',
    creative: 'Creative Professional', technical: 'Technical/Analytical',
    student: 'Student/Academic',
  };

  const keyValuesMap: Record<UserType, string[]> = {
    entrepreneur: ['growth', 'resilience', 'vision'],
    sales: ['confidence', 'momentum', 'conviction'],
    athlete: ['performance', 'discipline', 'excellence'],
    executive: ['clarity', 'decisiveness', 'authority'],
    creative: ['flow', 'courage', 'breakthrough'],
    technical: ['focus', 'precision', 'mastery'],
    student: ['persistence', 'confidence', 'clarity'],
  };

  const situationAnswer = getAnswerByCategory(q.questions, 'immediate_situation');
  const overallRationale = situationAnswer
    ? `Activation for ${q.persona.name}: ${situationAnswer.substring(0, 120)}`
    : `Activation script for ${audienceMap[archetype]} — ${q.sessionLength === 'ultra_quick' ? '2' : '4'} min`;

  return {
    userId,
    questionnaireId,
    components,
    sessionStructure,
    messagingFramework: {
      audienceType: audienceMap[archetype],
      keyValues: keyValuesMap[archetype],
      approachDescription: planOverride
        ? planOverride.approachDescription
        : `Direct confrontation arc for ${audienceMap[archetype].toLowerCase()} — spiral to lock-in via identity-based self-speech`,
    },
    overallRationale,
    status: 'approved',
    metadata: {
      generatedAt: new Date().toISOString(),
      model: 'lab-no-ai',
      inputTokens: 0,
      outputTokens: 0,
      costCents: 0,
    },
  };
}

/**
 * Build MappedQuestionnaireData from an AI-generated questionnaire.
 * If scriptMethod is provided, it's appended to immediateSituation as an override instruction.
 * If stage1Override is provided (from a mix), it's prepended as an interpretation instruction.
 */
export function buildMappedDataFromQuestionnaire(
  q: LabQuestionnaire,
  scriptMethod?: string,
  stage1Override?: string,
): MappedQuestionnaireData {
  const { archetype } = q.persona;

  // Serialize all Q&A into a rich context block for immediateSituation
  const qaContext = q.questions
    .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
    .join('\n\n');

  const personaHeader = `Persona: ${q.persona.name} — ${q.persona.background}`;
  const baseContext = scriptMethod
    ? `${personaHeader}\n\n${qaContext}\n\n[SCRIPT METHOD OVERRIDE]: ${scriptMethod}`
    : `${personaHeader}\n\n${qaContext}`;

  const immediateSituation = stage1Override
    ? `[INTERPRETATION OVERRIDE]: ${stage1Override}\n\n${baseContext}`
    : baseContext;

  // Extract specific fields from categorized answers
  const mentalStateAnswer = getAnswerByCategory(q.questions, 'mental_state');
  const stakesAnswer = getAnswerByCategory(q.questions, 'stakes');
  const fearAnswer = getAnswerByCategory(q.questions, 'fear');
  const pastSuccessAnswer = getAnswerByCategory(q.questions, 'past_success');
  const identityAnswer = getAnswerByCategory(q.questions, 'identity');
  const physicalAnswer = getAnswerByCategory(q.questions, 'physical');
  const somaticAnswer = getAnswerByCategory(q.questions, 'somatic');
  const commitmentAnswer = getAnswerByCategory(q.questions, 'commitment');

  const performanceContextMap: Record<UserType, string> = {
    entrepreneur: 'entrepreneur', sales: 'sales', athlete: 'athlete',
    executive: 'executive', creative: 'creative', technical: 'technical', student: 'student',
  };

  const needMap: Record<UserType, string> = {
    entrepreneur: 'confidence', sales: 'confidence', athlete: 'energy',
    executive: 'clarity', creative: 'courage', technical: 'focus', student: 'confidence',
  };

  const situationAnswer = getAnswerByCategory(q.questions, 'immediate_situation');

  return {
    userType: archetype,
    immediateSituation,
    timeUrgency: 'minutes',
    sessionLength: q.sessionLength,
    primaryGoal: 'Peak performance activation',
    currentChallenge: mentalStateAnswer || situationAnswer || 'High-stakes performance moment',
    experienceLevel: 'experienced',
    skepticismLevel: 2,
    performanceContext: performanceContextMap[archetype],
    preferredTime: 'morning',
    specificOutcome: situationAnswer || immediateSituation.substring(0, 200),
    challengeType: 'pitch',
    stakes: stakesAnswer || 'High-stakes performance',
    mentalState: mentalStateAnswer || 'nervous',
    physicalState: physicalAnswer || somaticAnswer || undefined,
    currentNeed: needMap[archetype] || 'confidence',

    // Tier 2 deep personalization — populated from categorized Q&A
    pastSuccess: pastSuccessAnswer || undefined,
    innerCritic: fearAnswer || undefined,
    identityStatement: identityAnswer || undefined,
    accountability: commitmentAnswer || undefined,

    rawResponses: {
      performance_arena: archetype,
      session_length: q.sessionLength,
      immediate_situation: immediateSituation,
      time_urgency: 'minutes',
      lab: 'true',
    },
  };
}

// ─── Chat System Prompt ───────────────────────────────────────────────────────

/**
 * Build the AI consultant system prompt for the Script Lab chat.
 * Receives the current questionnaire and script so the AI has full context.
 */
export function buildScriptLabSystemPrompt(
  currentScript: string,
  questionnaire: LabQuestionnaire | null,
  sessionLength: 'ultra_quick' | 'quick',
): string {
  const durationLabel = sessionLength === 'ultra_quick' ? '~2 minutes (ultra-quick)' : '~4 minutes (quick)';

  const questionnaireBlock = questionnaire
    ? `# Current Test Persona

**Name:** ${questionnaire.persona.name}
**Archetype:** ${questionnaire.persona.archetype}
**Background:** ${questionnaire.persona.background}

**Questionnaire Responses:**
${questionnaire.questions.map((q) => `**${q.category}:** ${q.question}\n→ ${q.answer}`).join('\n\n')}`
    : '(No questionnaire generated yet)';

  return `You are an elite script consultant for Myndset — a performance-psychology audio platform that writes self-rally speeches for solo listeners.

# Your Role

You are Jim's creative partner for iterating on activation scripts AND the intake questionnaire design. You:
- Analyze script structure, rhetoric, and psychological mechanics at a craft level
- Identify what's working, what's landing flat, and why
- Propose new script variants, new structural approaches, OR entirely new questionnaire designs
- Think about both inputs (questionnaire quality) and outputs (script quality)
- Know when to suggest a radical structural departure from the current approach

# Current Context

**Target Duration:** ${durationLabel}

${questionnaireBlock}

# Current Script

${currentScript ? `\`\`\`\n${currentScript}\n\`\`\`` : '(No script generated yet)'}

---

# Output Formats

## New script variant:
\`\`\`
[SCRIPT]
<full script text here>
[/SCRIPT]
\`\`\`

## Structural approach override (injected as context into the next generation):
\`\`\`
[APPROACH]
<specific instruction — what structure, arc, technique stack, tone to use>
[/APPROACH]
\`\`\`

## Full system prompt replacement (replaces the Self-Rally Arc instructions entirely):
\`\`\`
[PROMPT]
<complete replacement system prompt for the script generator>
[/PROMPT]
\`\`\`

## New questionnaire variant (generates a fresh test persona + Q&A):
\`\`\`
[QUESTIONNAIRE]
{
  "persona": { "name": "...", "archetype": "...", "background": "..." },
  "sessionLength": "ultra_quick|quick",
  "questions": [
    { "id": "q1", "question": "...", "answer": "...", "category": "..." }
  ]
}
[/QUESTIONNAIRE]
\`\`\`

Use [QUESTIONNAIRE] when you want to propose a different persona or a different questionnaire design strategy. Include exactly 10 questions.

---

# Consulting Principles

- Be direct and specific — Jim needs decisive craft opinions, not brainstorming.
- When critiquing: name the psychological mechanism that's failing and why.
- When writing scripts: match duration precisely. Ultra-quick = ~120 words. Quick = ~280 words.
- When proposing questionnaire variants: explain WHY the new question design will produce better scripts.
- Never soften feedback.
- [APPROACH] = same pipeline, different instruction injected. [PROMPT] = new pipeline entirely. Use [PROMPT] for radical structural experiments.`;
}
