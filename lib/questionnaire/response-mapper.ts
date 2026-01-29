/**
 * Response Mapper
 *
 * Maps the new dynamic questionnaire responses to the format expected by
 * the plan generator and energizing script generator.
 */

import type { QuestionnaireResponses, UserType } from './questions';

export interface MappedQuestionnaireData {
  // Core identifiers
  userType: UserType;

  // Universal fields
  immediateSituation: string;
  timeUrgency: 'minutes' | 'today' | 'tomorrow' | 'this_week' | 'ongoing';
  sessionLength: 'ultra_quick' | 'quick' | 'standard' | 'deep';

  // Mapped to legacy fields for plan generator compatibility
  primaryGoal: string;
  currentChallenge: string;
  experienceLevel: string;
  skepticismLevel: number;
  performanceContext: string;
  preferredTime: string;
  specificOutcome: string;

  // Type-specific context
  challengeType: string;
  stakes: string;
  mentalState: string;
  physicalState?: string;
  energyLevel?: string;
  currentNeed: string;

  // Tier 2 deep personalization (optional)
  pastSuccess?: string;
  innerCritic?: string;
  motivationSource?: string;
  physicalCue?: string;
  visualizationStyle?: string;
  identityStatement?: string;
  victoryVision?: string;
  accountability?: string;

  // Raw responses for full context
  rawResponses: QuestionnaireResponses;
}

/**
 * Map new questionnaire responses to the format expected by the AI generators
 */
export function mapQuestionnaireResponses(responses: QuestionnaireResponses): MappedQuestionnaireData {
  const userType = (responses.performance_arena as UserType) || 'entrepreneur';
  const sessionLength = (responses.session_length as 'ultra_quick' | 'quick' | 'standard' | 'deep') || 'standard';

  // Extract immediate situation as the core context
  const immediateSituation = (responses.immediate_situation as string) || '';
  const timeUrgency = (responses.time_urgency as MappedQuestionnaireData['timeUrgency']) || 'today';

  // Map user-type-specific fields
  const { challengeType, stakes, mentalState, physicalState, energyLevel, currentNeed } =
    extractTypeSpecificFields(userType, responses);

  // Map to legacy fields for backward compatibility with plan generator
  const performanceContext = mapPerformanceContext(userType);
  const primaryGoal = derivePrimaryGoal(userType, challengeType, currentNeed);
  const currentChallenge = deriveCurrentChallenge(mentalState, immediateSituation);
  const specificOutcome = immediateSituation;

  // Map time urgency to preferred time
  const preferredTime = mapTimeUrgencyToPreferredTime(timeUrgency);

  // For energizing speeches, default to ready experience level
  const experienceLevel = 'experienced';

  // Default skepticism level - users seeking activation aren't skeptical
  const skepticismLevel = 2;

  // Extract Tier 2 fields if present
  const tier2 = extractTier2Fields(responses);

  return {
    userType,
    immediateSituation,
    timeUrgency,
    sessionLength,
    primaryGoal,
    currentChallenge,
    experienceLevel,
    skepticismLevel,
    performanceContext,
    preferredTime,
    specificOutcome,
    challengeType,
    stakes,
    mentalState,
    physicalState,
    energyLevel,
    currentNeed,
    ...tier2,
    rawResponses: responses,
  };
}

/**
 * Extract user-type-specific fields from responses
 */
function extractTypeSpecificFields(userType: UserType, responses: QuestionnaireResponses): {
  challengeType: string;
  stakes: string;
  mentalState: string;
  physicalState?: string;
  energyLevel?: string;
  currentNeed: string;
} {
  switch (userType) {
    case 'athlete':
      return {
        challengeType: (responses.athlete_competition_type as string) || '',
        stakes: (responses.athlete_stakes as string) || '',
        mentalState: (responses.athlete_mental_state as string) || '',
        physicalState: (responses.athlete_physical_state as string) || '',
        currentNeed: deriveAthleteNeed(responses.athlete_mental_state as string),
      };

    case 'entrepreneur':
      return {
        challengeType: (responses.entrepreneur_challenge_type as string) || '',
        stakes: (responses.entrepreneur_stakes as string) || '',
        mentalState: (responses.entrepreneur_mental_state as string) || '',
        energyLevel: (responses.entrepreneur_energy as string) || '',
        currentNeed: deriveEntrepreneurNeed(responses.entrepreneur_mental_state as string),
      };

    case 'sales':
      return {
        challengeType: (responses.sales_situation as string) || '',
        stakes: (responses.sales_stakes as string) || '',
        mentalState: (responses.sales_mental_state as string) || '',
        currentNeed: (responses.sales_need as string) || '',
      };

    case 'executive':
      return {
        challengeType: (responses.executive_challenge as string) || '',
        stakes: (responses.executive_stakes as string) || '',
        mentalState: (responses.executive_mental_state as string) || '',
        currentNeed: (responses.executive_need as string) || '',
      };

    case 'creative':
      return {
        challengeType: (responses.creative_challenge as string) || '',
        stakes: (responses.creative_stakes as string) || '',
        mentalState: (responses.creative_mental_state as string) || '',
        currentNeed: (responses.creative_need as string) || '',
      };

    case 'technical':
      return {
        challengeType: (responses.technical_challenge as string) || '',
        stakes: (responses.technical_stakes as string) || '',
        mentalState: (responses.technical_mental_state as string) || '',
        currentNeed: (responses.technical_need as string) || '',
      };

    case 'student':
      return {
        challengeType: (responses.student_challenge as string) || '',
        stakes: (responses.student_stakes as string) || '',
        mentalState: (responses.student_mental_state as string) || '',
        currentNeed: (responses.student_need as string) || '',
      };

    default:
      return {
        challengeType: '',
        stakes: '',
        mentalState: '',
        currentNeed: 'energy',
      };
  }
}

/**
 * Map user type to performance context for legacy compatibility
 */
function mapPerformanceContext(userType: UserType): string {
  const contextMap: Record<UserType, string> = {
    athlete: 'athlete',
    entrepreneur: 'entrepreneur',
    sales: 'sales',
    executive: 'executive',
    creative: 'creative',
    technical: 'technical',
    student: 'student',
  };
  return contextMap[userType] || 'entrepreneur';
}

/**
 * Derive primary goal from user type and challenge type
 */
function derivePrimaryGoal(userType: UserType, challengeType: string, currentNeed: string): string {
  // Map the challenge type and need to a primary goal statement
  const goalParts = [];

  if (currentNeed) {
    const needLabels: Record<string, string> = {
      confidence: 'Unshakeable confidence',
      energy: 'High energy activation',
      focus: 'Laser focus',
      resilience: 'Mental resilience',
      killer_instinct: 'Competitive fire',
      flow: 'Deep flow state',
      courage: 'Creative courage',
      clarity: 'Mental clarity',
      persistence: 'Persistent determination',
      creativity: 'Creative problem-solving',
      calm: 'Calm under pressure',
      motivation: 'Powerful motivation',
      authority: 'Commanding authority',
      inspiration: 'Inspiring presence',
      decisiveness: 'Decisive action',
      empathy: 'Empathetic strength',
    };
    goalParts.push(needLabels[currentNeed] || currentNeed);
  }

  if (challengeType) {
    const challengeLabels: Record<string, string> = {
      game_match: 'for competition',
      race: 'for race performance',
      lift_pr: 'for max effort',
      tryout: 'for evaluation',
      training: 'for training',
      comeback: 'for comeback',
      pitch: 'for investor pitch',
      launch: 'for product launch',
      crisis: 'for crisis management',
      grind: 'for sustained push',
      closing_call: 'for closing deals',
      discovery: 'for first impressions',
      demo: 'for demonstrations',
      negotiation: 'for negotiations',
      cold_outreach: 'for outreach',
      quarter_end: 'for end of quarter',
      board_presentation: 'for board presentation',
      difficult_conversation: 'for difficult conversations',
      team_rally: 'for team leadership',
      strategic_decision: 'for critical decisions',
      crisis_leadership: 'for crisis leadership',
      deadline: 'for deadline delivery',
      blank_page: 'for starting fresh',
      presentation: 'for presenting work',
      revision: 'for major revision',
      breakthrough: 'for creative breakthrough',
      sustained_output: 'for sustained output',
      complex_problem: 'for problem-solving',
      deep_work: 'for deep work',
      debugging: 'for debugging',
      review: 'for code review',
      exam: 'for exam performance',
      study_session: 'for intense study',
      interview: 'for interview',
      skill_development: 'for skill development',
    };
    goalParts.push(challengeLabels[challengeType] || '');
  }

  return goalParts.filter(Boolean).join(' ') || 'Peak performance activation';
}

/**
 * Derive current challenge from mental state and situation
 */
function deriveCurrentChallenge(mentalState: string, immediateSituation: string): string {
  const stateLabels: Record<string, string> = {
    nervous: 'Managing pre-performance nerves',
    flat: 'Overcoming low energy',
    doubting: 'Silencing self-doubt',
    unfocused: 'Regaining focus',
    angry: 'Channeling frustration',
    ready: 'Maximizing readiness',
    overwhelmed: 'Managing overwhelm',
    imposter: 'Overcoming imposter syndrome',
    burned_out: 'Pushing through exhaustion',
    anxious: 'Managing anxiety',
    frustrated: 'Channeling frustration',
    determined: 'Fueling determination',
    rejection_fatigue: 'Overcoming rejection fatigue',
    unmotivated: 'Reigniting motivation',
    intimidated: 'Building confidence',
    isolated: 'Finding inner strength',
    uncertain: 'Building certainty',
    fatigued: 'Pushing through fatigue',
    pressured: 'Thriving under pressure',
    focused: 'Amplifying focus',
    perfectionism: 'Breaking perfectionism paralysis',
    self_doubt: 'Silencing self-doubt',
    fear_judgment: 'Overcoming fear of judgment',
    burnout: 'Reigniting creative fire',
    distraction: 'Eliminating distractions',
    pressure: 'Handling pressure',
    scattered: 'Consolidating focus',
    procrastinating: 'Breaking procrastination',
    unprepared: 'Building confidence despite preparation gaps',
  };

  const challengeFromState = stateLabels[mentalState] || '';

  // Combine with situation for full context
  if (immediateSituation && challengeFromState) {
    return `${challengeFromState} - ${immediateSituation}`;
  }

  return challengeFromState || immediateSituation || 'Achieving peak performance state';
}

/**
 * Map time urgency to preferred time for legacy compatibility
 */
function mapTimeUrgencyToPreferredTime(timeUrgency: string): string {
  const timeMap: Record<string, string> = {
    minutes: 'morning', // Immediate need, likely morning of event
    today: 'morning',
    tomorrow: 'evening', // Preparing night before
    this_week: 'morning',
    ongoing: 'morning',
  };
  return timeMap[timeUrgency] || 'morning';
}

/**
 * Derive athlete need from mental state
 */
function deriveAthleteNeed(mentalState: string): string {
  const needMap: Record<string, string> = {
    nervous: 'confidence',
    flat: 'energy',
    doubting: 'confidence',
    unfocused: 'focus',
    angry: 'focus',
    ready: 'energy',
  };
  return needMap[mentalState] || 'energy';
}

/**
 * Derive entrepreneur need from mental state
 */
function deriveEntrepreneurNeed(mentalState: string): string {
  const needMap: Record<string, string> = {
    overwhelmed: 'focus',
    imposter: 'confidence',
    burned_out: 'energy',
    anxious: 'confidence',
    frustrated: 'resilience',
    determined: 'energy',
  };
  return needMap[mentalState] || 'energy';
}

/**
 * Extract Tier 2 deep personalization fields
 */
function extractTier2Fields(responses: QuestionnaireResponses): Partial<MappedQuestionnaireData> {
  return {
    pastSuccess: responses.past_success as string | undefined,
    innerCritic: responses.inner_critic as string | undefined,
    motivationSource: responses.motivation_source as string | undefined,
    physicalCue: responses.physical_cue as string | undefined,
    visualizationStyle: responses.visualization_style as string | undefined,
    identityStatement: responses.identity_statement as string | undefined,
    victoryVision: responses.victory_vision as string | undefined,
    accountability: responses.accountability as string | undefined,
  };
}

/**
 * Build context string for AI prompt from mapped data
 */
export function buildContextForAI(mapped: MappedQuestionnaireData): string {
  const userTypeLabels: Record<UserType, string> = {
    athlete: 'Athlete/Competitor',
    entrepreneur: 'Entrepreneur/Founder',
    sales: 'Sales Professional',
    executive: 'Executive/Leader',
    creative: 'Creative Professional',
    technical: 'Technical/Analytical',
    student: 'Student/Academic',
  };

  const timeLabels: Record<string, string> = {
    minutes: 'within the next hour (IMMEDIATE)',
    today: 'later today',
    tomorrow: 'tomorrow',
    this_week: 'this week',
    ongoing: 'ongoing challenge',
  };

  let context = `# User Profile

**Performance Arena**: ${userTypeLabels[mapped.userType]}
**Immediate Situation**: ${mapped.immediateSituation}
**Time Until Performance**: ${timeLabels[mapped.timeUrgency] || mapped.timeUrgency}
**What's at Stake**: ${mapped.stakes}
**Current Mental State**: ${mapped.mentalState}
**What They Need**: ${mapped.currentNeed}`;

  if (mapped.physicalState) {
    context += `\n**Physical State**: ${mapped.physicalState}`;
  }

  if (mapped.energyLevel) {
    context += `\n**Energy Level**: ${mapped.energyLevel}`;
  }

  // Add Tier 2 context if available
  if (mapped.pastSuccess) {
    context += `\n\n# Deep Personalization (Tier 2)

**Peak Performance Memory**: ${mapped.pastSuccess}`;
  }

  if (mapped.innerCritic) {
    context += `\n**Inner Critic Voice**: "${mapped.innerCritic}" (address and silence this)`;
  }

  if (mapped.motivationSource) {
    context += `\n**Motivation Source**: ${mapped.motivationSource}`;
  }

  if (mapped.identityStatement) {
    context += `\n**Identity Statement**: "I am someone who ${mapped.identityStatement}"`;
  }

  if (mapped.victoryVision) {
    context += `\n**Victory Vision**: ${mapped.victoryVision}`;
  }

  if (mapped.accountability) {
    context += `\n**Promise to Self**: ${mapped.accountability}`;
  }

  if (mapped.physicalCue) {
    const cueLabels: Record<string, string> = {
      breath: 'deep, powerful breathing',
      movement: 'physical movement/shaking out',
      posture: 'power posture/standing tall',
      hands: 'clapping/fist clench',
      voice: 'vocalization/self-talk',
    };
    context += `\n**Physical Activation Cue**: ${cueLabels[mapped.physicalCue] || mapped.physicalCue}`;
  }

  if (mapped.visualizationStyle) {
    const vizLabels: Record<string, string> = {
      visual: 'vivid visual imagery',
      feeling: 'body sensations and feelings',
      words: 'internal dialogue and sounds',
      mixed: 'multi-sensory (visual + feeling + audio)',
    };
    context += `\n**Visualization Style**: ${vizLabels[mapped.visualizationStyle] || mapped.visualizationStyle}`;
  }

  return context;
}
