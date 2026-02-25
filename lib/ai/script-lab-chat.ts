/**
 * Script Lab Chat — Builder helpers and system prompt
 *
 * Synthesizes plan + questionnaire data from a brief context string
 * (no AI call). Used by the Script Lab to bypass the full questionnaire pipeline.
 */

import type { MeditationPlan, MeditationPlanComponent } from './plan-generator';
import type { MappedQuestionnaireData } from '../questionnaire/response-mapper';
import type { UserType } from '../questionnaire/questions';

// ─── Keyword inference helpers ────────────────────────────────────────────────

/** Infer the UserType from freeform context string keywords */
function inferUserType(ctx: string): UserType {
  const c = ctx.toLowerCase();
  if (/\b(athlete|player|game|match|race|sport|coach|team|compete|tournament|bout|lift|gym)\b/.test(c)) return 'athlete';
  if (/\b(sales|close|closing|quota|pipeline|prospect|crm|cold call|deal)\b/.test(c)) return 'sales';
  if (/\b(executive|ceo|cto|vp|board|leadership|lead|manage|team lead|manager)\b/.test(c)) return 'executive';
  if (/\b(creative|design|artist|writer|compose|music|direct|screenplay|film|art)\b/.test(c)) return 'creative';
  if (/\b(engineer|developer|code|debug|technical|software|architect|data|ml|ai)\b/.test(c)) return 'technical';
  if (/\b(student|exam|study|class|college|university|grade|test|thesis|dissertation)\b/.test(c)) return 'student';
  // default: entrepreneur (founders, pitch, launch, investor, startup, etc.)
  return 'entrepreneur';
}

/** Infer mental state from context string */
function inferMentalState(ctx: string): string {
  const c = ctx.toLowerCase();
  if (/\b(scared|fear|terrif|panic)\b/.test(c)) return 'anxious';
  if (/\b(nervous|anxious|anxiety|worry|worried)\b/.test(c)) return 'nervous';
  if (/\b(doubt|imposter|not good enough|fraud)\b/.test(c)) return 'imposter';
  if (/\b(overwhelm|too much|stress|drowning)\b/.test(c)) return 'overwhelmed';
  if (/\b(tired|exhaust|burn.?out|drained|fatigue)\b/.test(c)) return 'burned_out';
  if (/\b(lost|unclear|unfocus|distract|scatter)\b/.test(c)) return 'unfocused';
  if (/\b(angry|frustrat|pissed|furious)\b/.test(c)) return 'frustrated';
  if (/\b(determined|ready|fired up|amped|pump)\b/.test(c)) return 'determined';
  return 'nervous';
}

/** Infer challenge type from context string */
function inferChallengeType(ctx: string, userType: UserType): string {
  const c = ctx.toLowerCase();
  if (/\b(pitch|investor|vc|fund|funding|raise)\b/.test(c)) return 'pitch';
  if (/\b(launch|release|go.?live|product|ship)\b/.test(c)) return 'launch';
  if (/\b(present|presentation|speech|talk|keynote|demo)\b/.test(c)) return 'presentation';
  if (/\b(negotiat|contract|deal)\b/.test(c)) return 'negotiation';
  if (/\b(interview|job|hiring)\b/.test(c)) return 'interview';
  if (/\b(game|match|compete|tournament|bout)\b/.test(c)) return 'game_match';
  if (/\b(exam|test|quiz)\b/.test(c)) return 'exam';
  if (/\b(close|closing|quota|pipeline)\b/.test(c)) return 'closing_call';
  if (/\b(board|board meeting)\b/.test(c)) return 'board_presentation';
  if (/\b(deadline|crunch|due)\b/.test(c)) return 'deadline';
  if (/\b(crisis|fire|emergency|urgent)\b/.test(c)) return 'crisis';
  // fallback by user type
  const fallbacks: Record<UserType, string> = {
    entrepreneur: 'pitch', sales: 'closing_call', athlete: 'game_match',
    executive: 'board_presentation', creative: 'presentation',
    technical: 'deep_work', student: 'exam',
  };
  return fallbacks[userType] || 'pitch';
}

/** Infer what the user needs from context string + mental state */
function inferCurrentNeed(ctx: string, mentalState: string): string {
  const c = ctx.toLowerCase();
  if (/\b(confident|confidence)\b/.test(c)) return 'confidence';
  if (/\b(focus|clarity|clear)\b/.test(c)) return 'focus';
  if (/\b(energy|energi|fired|pump)\b/.test(c)) return 'energy';
  if (/\b(calm|ground|center|breath)\b/.test(c)) return 'calm';
  if (/\b(courag|brave|bold)\b/.test(c)) return 'courage';
  // derive from mental state
  const stateNeedMap: Record<string, string> = {
    anxious: 'confidence', nervous: 'confidence', imposter: 'confidence',
    overwhelmed: 'focus', burned_out: 'energy', unfocused: 'focus',
    frustrated: 'resilience', determined: 'energy',
  };
  return stateNeedMap[mentalState] || 'confidence';
}

/** Infer stakes from context string */
function inferStakes(ctx: string): string {
  const c = ctx.toLowerCase();
  if (/\b(million|funding|raise|series|seed)\b/.test(c)) return 'major funding event';
  if (/\b(career|job|fired|promotion|layoff)\b/.test(c)) return 'career-defining moment';
  if (/\b(championship|finals|playoffs|gold)\b/.test(c)) return 'championship performance';
  if (/\b(client|account|enterprise|contract)\b/.test(c)) return 'major client opportunity';
  return 'high-stakes performance';
}

// ─── Hardcoded high-performance technique stack ───────────────────────────────

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
  // quick (4 min)
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

// ─── Exported builders ────────────────────────────────────────────────────────

/**
 * Build a MeditationPlan from a brief context string — no AI call.
 * Uses hardcoded high-performance technique stack.
 */
export function buildLabMeditationPlan(
  contextString: string,
  sessionLength: 'ultra_quick' | 'quick',
  userId: string,
  questionnaireId: string,
): MeditationPlan {
  const userType = inferUserType(contextString);
  const components = buildLabComponents(sessionLength);
  const sessionStructure = buildSessionStructure(sessionLength);

  const audienceMap: Record<UserType, string> = {
    entrepreneur: 'Entrepreneur/Founder',
    sales: 'Sales Professional',
    athlete: 'Athlete/Competitor',
    executive: 'Executive/Leader',
    creative: 'Creative Professional',
    technical: 'Technical/Analytical',
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

  return {
    userId,
    questionnaireId,
    components,
    sessionStructure,
    messagingFramework: {
      audienceType: audienceMap[userType],
      keyValues: keyValuesMap[userType],
      approachDescription: `Direct confrontation arc for ${audienceMap[userType].toLowerCase()} — spiral to lock-in via identity-based self-speech`,
    },
    overallRationale: `Rapid activation script for: ${contextString}. Bypasses passive coping to install peak-performance identity state in under ${sessionLength === 'ultra_quick' ? '2' : '4'} minutes.`,
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
 * Build MappedQuestionnaireData from a brief context string — no AI call.
 * Keyword-infers all fields. If approach is provided, it's appended to immediateSituation.
 */
export function buildLabQuestionnaireData(
  contextString: string,
  sessionLength: 'ultra_quick' | 'quick',
  approach?: string,
): MappedQuestionnaireData {
  const userType = inferUserType(contextString);
  const mentalState = inferMentalState(contextString);
  const challengeType = inferChallengeType(contextString, userType);
  const currentNeed = inferCurrentNeed(contextString, mentalState);
  const stakes = inferStakes(contextString);

  const timeUrgency: MappedQuestionnaireData['timeUrgency'] = 'minutes';

  const immediateSituation = approach
    ? `${contextString}\n\n[APPROACH OVERRIDE]: ${approach}`
    : contextString;

  const performanceContextMap: Record<UserType, string> = {
    entrepreneur: 'entrepreneur', sales: 'sales', athlete: 'athlete',
    executive: 'executive', creative: 'creative', technical: 'technical', student: 'student',
  };

  const needToPrimaryGoal: Record<string, string> = {
    confidence: 'Unshakeable confidence', focus: 'Laser focus',
    energy: 'High energy activation', calm: 'Calm under pressure',
    courage: 'Creative courage', resilience: 'Mental resilience',
  };

  return {
    userType,
    immediateSituation,
    timeUrgency,
    sessionLength,
    primaryGoal: needToPrimaryGoal[currentNeed] || 'Peak performance activation',
    currentChallenge: `${mentalState} — ${contextString}`,
    experienceLevel: 'experienced',
    skepticismLevel: 2,
    performanceContext: performanceContextMap[userType],
    preferredTime: 'morning',
    specificOutcome: contextString,
    challengeType,
    stakes,
    mentalState,
    currentNeed,
    rawResponses: {
      performance_arena: userType,
      session_length: sessionLength,
      immediate_situation: immediateSituation,
      time_urgency: timeUrgency,
      lab: 'true',
    },
  };
}

/**
 * Build the system prompt for the Script Lab AI consultant.
 * Receives the current script + context so it can discuss, critique, and generate variants.
 */
export function buildScriptLabSystemPrompt(
  currentScript: string,
  contextString: string,
  sessionLength: 'ultra_quick' | 'quick',
): string {
  const durationLabel = sessionLength === 'ultra_quick' ? '~2 minutes (ultra-quick)' : '~4 minutes (quick)';

  return `You are an elite script consultant for Myndset — a performance-psychology audio platform that writes self-rally speeches for solo listeners.

# Your Role

You are Jim's creative partner for iterating on activation scripts. You:
- Analyze script structure, rhetoric, and psychological mechanics at a craft level
- Identify what's working, what's landing flat, and why
- Propose alternatives — line-by-line edits OR complete structural rethinks
- Understand the Self-Rally Arc (Spiral → Confrontation → Reframe → Fuel → Lock-In)
- Know when to suggest a radical structural departure from the arc

# Current Context

**Situation:** ${contextString}
**Target Duration:** ${durationLabel}

# Current Script

${currentScript ? `\`\`\`\n${currentScript}\n\`\`\`` : '(No script generated yet — help Jim think through approach before generating)'}

# Output Formats

## When proposing a new full script variant:
Wrap it in [SCRIPT] tags so Jim can load it with one click:
\`\`\`
[SCRIPT]
<full script text here>
[/SCRIPT]
\`\`\`

## When proposing a structural approach change:
Wrap it in [APPROACH] tags so Jim can inject it as a generation override:
\`\`\`
[APPROACH]
<description of the new approach — be specific: what structure, what arc, what technique stack, what tone>
[/APPROACH]
\`\`\`

Use [APPROACH] when you want to propose a fundamentally different generation strategy (e.g., ignore the Self-Rally Arc and write as a theatrical mirror scene, base it on Hemingway dialogue patterns, open with body before mind, try whisper-to-roar arc, etc.).

# Consulting Principles

- Be direct. This is not a brainstorming session — Jim needs clear, decisive craft opinions.
- When you critique, be specific about the mechanism: what is the line doing psychologically and why is it failing?
- When you write script variants, match the target duration precisely. Ultra-quick = ~120 words. Quick = ~280 words.
- Second-person ("you", "your") is the dominant pronoun architecture for self-rally speeches.
- Never soften feedback. Jim is here to make the script better, not to feel good about a mediocre draft.
- If asked about a highlighted selection, focus your analysis on that specific section before widening.`;
}
