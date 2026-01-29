/**
 * Meditation Component Knowledge Base
 *
 * This file contains the structured knowledge base of evidence-based meditation
 * techniques, components, and frameworks used by Claude AI to generate
 * personalized meditation scripts for Myndset users.
 *
 * Key Features:
 * - Evidence-based meditation components with neuroscience mechanisms
 * - Performance-focused messaging frameworks
 * - Session structure templates for different durations
 * - Hypnotic language patterns for deep engagement
 * - Component selection based on user goals and resistance patterns
 */

// ============================================================================
// CORE MEDITATION COMPONENTS
// ============================================================================

export interface MeditationComponent {
  id: string;
  name: string;
  function: string;
  neuroscienceMechanism: string;
  evidenceLevel: 'high' | 'medium' | 'emerging';
  bestFor: string[];
  durationMinutes: number;
  scriptGuidelines: string;
}

export const MEDITATION_COMPONENTS: MeditationComponent[] = [
  {
    id: 'breath_awareness',
    name: 'Breath Awareness',
    function: 'Anchor attention to present moment, reduce mind-wandering',
    neuroscienceMechanism: 'Activates parasympathetic nervous system, strengthens prefrontal cortex attention networks',
    evidenceLevel: 'high',
    bestFor: ['focus', 'anxiety', 'overthinking', 'beginner'],
    durationMinutes: 2,
    scriptGuidelines: 'Guide user to observe natural breathing without controlling it. Use counting (4-7-8 pattern) for structure. Performance frame: "Each breath sharpens your competitive edge."',
  },
  {
    id: 'body_scan',
    name: 'Progressive Body Scan',
    function: 'Release physical tension, develop interoceptive awareness',
    neuroscienceMechanism: 'Enhances insular cortex activity (body awareness), reduces default mode network activation',
    evidenceLevel: 'high',
    bestFor: ['stress', 'pressure', 'burnout', 'sleep'],
    durationMinutes: 5,
    scriptGuidelines: 'Move attention systematically from toes to head. Acknowledge tension without judgment. Performance frame: "Your body is your most valuable asset—optimize it."',
  },
  {
    id: 'visualization',
    name: 'Mental Rehearsal Visualization',
    function: 'Prime neural pathways for peak performance, build confidence',
    neuroscienceMechanism: 'Activates motor cortex and mirror neuron systems similar to actual performance',
    evidenceLevel: 'high',
    bestFor: ['confidence', 'performance_prep', 'athletes', 'presentations'],
    durationMinutes: 4,
    scriptGuidelines: 'Guide vivid, first-person mental rehearsal of successful performance. Include sensory details. Performance frame: "Champions visualize victory before it happens."',
  },
  {
    id: 'loving_kindness',
    name: 'Strategic Compassion (Metta)',
    function: 'Reduce self-criticism, enhance social connection, combat imposter syndrome',
    neuroscienceMechanism: 'Increases activity in empathy circuits (temporal-parietal junction), reduces amygdala reactivity',
    evidenceLevel: 'high',
    bestFor: ['imposter_syndrome', 'confidence', 'relationships', 'burnout'],
    durationMinutes: 5,
    scriptGuidelines: 'Start with self-compassion, extend to others. Reframe as strategic advantage. Performance frame: "Self-compassion is not weakness—it is sustainable high performance."',
  },
  {
    id: 'open_monitoring',
    name: 'Open Awareness',
    function: 'Enhance creativity, develop cognitive flexibility, reduce judgment',
    neuroscienceMechanism: 'Strengthens executive attention, reduces habitual thought patterns',
    evidenceLevel: 'medium',
    bestFor: ['creativity', 'flexibility', 'innovation', 'entrepreneurs'],
    durationMinutes: 6,
    scriptGuidelines: 'Guide non-judgmental observation of thoughts/sensations as they arise. No anchoring object. Performance frame: "Innovation requires seeing beyond existing patterns."',
  },
  {
    id: 'mantra_repetition',
    name: 'Performance Mantra',
    function: 'Interrupt rumination, build mental resilience, prime desired state',
    neuroscienceMechanism: 'Disrupts default mode network, creates new associative memory networks',
    evidenceLevel: 'medium',
    bestFor: ['anxiety', 'overthinking', 'confidence', 'focus'],
    durationMinutes: 3,
    scriptGuidelines: 'Provide personalized mantra tied to user goal (e.g., "I am unstoppable"). Repeat with conviction. Performance frame: "Elite performers control their internal dialogue."',
  },
  {
    id: 'energy_activation',
    name: 'Energy Mobilization',
    function: 'Convert nervous energy into focused drive, optimal arousal',
    neuroscienceMechanism: 'Balances sympathetic/parasympathetic tone, optimizes cortisol/adrenaline',
    evidenceLevel: 'emerging',
    bestFor: ['energy', 'motivation', 'pre_performance', 'sales'],
    durationMinutes: 4,
    scriptGuidelines: 'Guide breathwork to elevate energy (rapid breathing), then channel it. Performance frame: "Pressure is fuel. Channel it."',
  },
  {
    id: 'cognitive_defusion',
    name: 'Thought Labeling',
    function: 'Create distance from unhelpful thoughts, reduce overthinking',
    neuroscienceMechanism: 'Activates prefrontal cortex metacognitive monitoring, reduces thought fusion',
    evidenceLevel: 'high',
    bestFor: ['overthinking', 'anxiety', 'procrastination', 'executives'],
    durationMinutes: 4,
    scriptGuidelines: 'Guide labeling thoughts as "planning thought," "worry thought," etc. Watch them pass. Performance frame: "You are not your thoughts. You are the thinker."',
  },
];

// ============================================================================
// HYPNOTIC LANGUAGE PATTERNS
// ============================================================================

export const HYPNOTIC_PATTERNS = {
  presuppositions: [
    'As you continue to breathe...',
    'The more you relax, the sharper your focus becomes...',
    'You might notice, or you might not notice...',
    'With each exhale, releasing what no longer serves you...',
  ],
  embedded_commands: [
    'And you can [DESIRED STATE]...',
    'Allow yourself to [ACTION]...',
    'Notice how easily you [OUTCOME]...',
  ],
  temporal_binding: [
    'Before you finish this meditation, you\'ll have [BENEFIT]...',
    'By the time you open your eyes, you\'ll feel [STATE]...',
  ],
  pacing_and_leading: [
    'You\'re breathing... your heart is beating... and you\'re becoming more focused.',
    'You hear my voice... you feel the surface beneath you... and you\'re entering a state of deep clarity.',
  ],
};

// ============================================================================
// PERFORMANCE MESSAGING FRAMEWORKS
// ============================================================================

export interface MessagingFramework {
  audienceType: string;
  values: string[];
  languagePatterns: string[];
  avoidWords: string[];
  emphasizeWords: string[];
}

export const MESSAGING_FRAMEWORKS: Record<string, MessagingFramework> = {
  entrepreneur: {
    audienceType: 'Entrepreneurs',
    values: ['autonomy', 'growth', 'innovation', 'impact'],
    languagePatterns: [
      'Every decision you make shapes your trajectory.',
      'Elite founders optimize their mental state like they optimize their business.',
      'Your next breakthrough requires clarity you can only access with a calm mind.',
    ],
    avoidWords: ['relax', 'peaceful', 'surrender', 'flow'],
    emphasizeWords: ['optimize', 'sharpen', 'calibrate', 'advantage', 'edge'],
  },
  sales: {
    audienceType: 'Sales Professionals',
    values: ['performance', 'persuasion', 'resilience', 'winning'],
    languagePatterns: [
      'Top performers control their state before every high-stakes conversation.',
      'Your ability to read people improves when you\'re centered.',
      'Rejection is data. Meditation is the reset button between calls.',
    ],
    avoidWords: ['calm', 'gentle', 'soft'],
    emphasizeWords: ['confidence', 'presence', 'resilience', 'close', 'win'],
  },
  executive: {
    audienceType: 'Executives and Leaders',
    values: ['decision-making', 'leadership', 'strategic thinking', 'composure'],
    languagePatterns: [
      'The best leaders make decisions from clarity, not reactivity.',
      'Your team reads your energy. Set the tone intentionally.',
      'Strategic thinking requires the cognitive space meditation creates.',
    ],
    avoidWords: ['escape', 'retreat', 'avoid'],
    emphasizeWords: ['strategic', 'clarity', 'composure', 'leadership', 'decisive'],
  },
  athlete: {
    audienceType: 'Athletes and Competitors',
    values: ['performance', 'discipline', 'edge', 'victory'],
    languagePatterns: [
      'Champions train their minds as rigorously as their bodies.',
      'The mental game separates good from great.',
      'Pressure is a privilege—meditation helps you leverage it.',
    ],
    avoidWords: ['rest', 'passive', 'easy'],
    emphasizeWords: ['train', 'competitive edge', 'performance', 'discipline', 'champion'],
  },
  creative: {
    audienceType: 'Creatives and Innovators',
    values: ['innovation', 'originality', 'breakthrough', 'vision'],
    languagePatterns: [
      'Your best ideas emerge from spaciousness, not hustle.',
      'Meditation clears the noise so your vision can surface.',
      'Creative blocks dissolve when you stop forcing and start allowing.',
    ],
    avoidWords: ['rigid', 'structured', 'controlled'],
    emphasizeWords: ['vision', 'breakthrough', 'innovation', 'insight', 'original'],
  },
  technical: {
    audienceType: 'Engineers and Technical Professionals',
    values: ['problem-solving', 'optimization', 'systems thinking', 'precision'],
    languagePatterns: [
      'Meditation is debugging your operating system.',
      'Complex problems require cognitive bandwidth meditation creates.',
      'Your brain performs better when you manage its resources intentionally.',
    ],
    avoidWords: ['mystical', 'spiritual', 'woo-woo'],
    emphasizeWords: ['optimize', 'bandwidth', 'system', 'precision', 'debug'],
  },
};

// ============================================================================
// SESSION STRUCTURE TEMPLATES
// ============================================================================

export interface SessionStructure {
  duration: 'ultra_quick' | 'quick' | 'standard' | 'deep';
  totalMinutes: number;
  phases: SessionPhase[];
}

export interface SessionPhase {
  name: string;
  durationMinutes: number;
  purpose: string;
  techniques: string[];
}

export const SESSION_STRUCTURES: Record<string, SessionStructure> = {
  ultra_quick: {
    duration: 'ultra_quick',
    totalMinutes: 1,
    phases: [
      {
        name: 'Immediate Activation',
        durationMinutes: 1,
        purpose: 'Rapid energy boost and focus - no fluff, pure activation',
        techniques: ['breath_awareness', 'mantra_repetition', 'energy_activation'],
      },
    ],
  },
  quick: {
    duration: 'quick',
    totalMinutes: 3,
    phases: [
      {
        name: 'Grounding',
        durationMinutes: 0.5,
        purpose: 'Transition from external to internal focus',
        techniques: ['breath_awareness', 'mantra_repetition'],
      },
      {
        name: 'Core Practice',
        durationMinutes: 2,
        purpose: 'Address primary user goal',
        techniques: ['breath_awareness', 'visualization', 'mantra_repetition'],
      },
      {
        name: 'Integration',
        durationMinutes: 0.5,
        purpose: 'Anchor insights, prepare to re-engage',
        techniques: ['intention_setting'],
      },
    ],
  },
  standard: {
    duration: 'standard',
    totalMinutes: 8,
    phases: [
      {
        name: 'Settling',
        durationMinutes: 1,
        purpose: 'Transition from doing to being',
        techniques: ['breath_awareness', 'body_scan'],
      },
      {
        name: 'Deepening',
        durationMinutes: 2,
        purpose: 'Develop sustained attention',
        techniques: ['breath_awareness', 'body_scan', 'cognitive_defusion'],
      },
      {
        name: 'Core Practice',
        durationMinutes: 4,
        purpose: 'Address primary and secondary user goals',
        techniques: ['visualization', 'loving_kindness', 'open_monitoring', 'energy_activation'],
      },
      {
        name: 'Integration',
        durationMinutes: 1,
        purpose: 'Solidify experience, set intention',
        techniques: ['intention_setting', 'gratitude'],
      },
    ],
  },
  deep: {
    duration: 'deep',
    totalMinutes: 20,
    phases: [
      {
        name: 'Settling',
        durationMinutes: 2,
        purpose: 'Full transition from external demands',
        techniques: ['breath_awareness', 'body_scan'],
      },
      {
        name: 'Deepening',
        durationMinutes: 4,
        purpose: 'Cultivate deep focus and presence',
        techniques: ['body_scan', 'breath_awareness', 'mantra_repetition'],
      },
      {
        name: 'Exploration',
        durationMinutes: 3,
        purpose: 'Address resistance patterns, limiting beliefs',
        techniques: ['cognitive_defusion', 'loving_kindness', 'open_monitoring'],
      },
      {
        name: 'Core Practice',
        durationMinutes: 8,
        purpose: 'Deep work on primary goal with multiple techniques',
        techniques: ['visualization', 'loving_kindness', 'energy_activation', 'open_monitoring'],
      },
      {
        name: 'Integration',
        durationMinutes: 3,
        purpose: 'Consolidate insights, anchor transformation',
        techniques: ['intention_setting', 'gratitude', 'visualization'],
      },
    ],
  },
};

// ============================================================================
// COMPONENT SELECTION ALGORITHM
// ============================================================================

export interface UserProfile {
  primaryGoal: string;
  currentChallenge: string;
  sessionLength: 'ultra_quick' | 'quick' | 'standard' | 'deep';
  experienceLevel: string;
  skepticismLevel: number; // 1-5
  performanceContext: string;
  preferredTime: string;
  specificOutcome?: string;
}

/**
 * Select appropriate meditation components based on user profile
 * This algorithm maps user goals and challenges to evidence-based techniques
 */
export function selectComponents(profile: UserProfile): string[] {
  const selected: Set<string> = new Set();

  // Always include breath awareness for beginners
  if (profile.experienceLevel === 'beginner' || profile.experienceLevel === 'tried_few_times') {
    selected.add('breath_awareness');
  }

  // Map primary goals to components
  const goalMapping: Record<string, string[]> = {
    focus: ['breath_awareness', 'cognitive_defusion'],
    pressure: ['energy_activation', 'visualization', 'body_scan'],
    energy: ['energy_activation', 'mantra_repetition'],
    sleep: ['body_scan', 'breath_awareness'],
    confidence: ['visualization', 'loving_kindness', 'mantra_repetition'],
    creativity: ['open_monitoring', 'visualization'],
  };

  const goalComponents = goalMapping[profile.primaryGoal] || ['breath_awareness'];
  goalComponents.forEach((c) => selected.add(c));

  // Map challenges to components
  const challengeMapping: Record<string, string[]> = {
    overthinking: ['cognitive_defusion', 'breath_awareness'],
    anxiety: ['breath_awareness', 'body_scan', 'mantra_repetition'],
    procrastination: ['visualization', 'energy_activation'],
    burnout: ['body_scan', 'loving_kindness'],
    imposter: ['loving_kindness', 'cognitive_defusion'],
    distraction: ['breath_awareness', 'cognitive_defusion'],
  };

  const challengeComponents = challengeMapping[profile.currentChallenge] || [];
  challengeComponents.forEach((c) => selected.add(c));

  // Adjust for skepticism level (high skepticism = more evidence-based)
  if (profile.skepticismLevel >= 4) {
    // Remove emerging evidence components for skeptics
    selected.delete('energy_activation');
    // Ensure high-evidence components are included
    selected.add('breath_awareness');
    selected.add('body_scan');
  }

  return Array.from(selected);
}

/**
 * Get messaging framework for user's performance context
 */
export function getMessagingFramework(context: string): MessagingFramework {
  const mapping: Record<string, string> = {
    entrepreneur: 'entrepreneur',
    sales: 'sales',
    executive: 'executive',
    athlete: 'athlete',
    creative: 'creative',
    technical: 'technical',
    student: 'technical', // Students respond well to optimization framing
  };

  const key = mapping[context] || 'entrepreneur';
  return MESSAGING_FRAMEWORKS[key];
}

/**
 * Generate a complete meditation plan structure
 */
export function generateMeditationPlan(profile: UserProfile) {
  const components = selectComponents(profile);
  const structure = SESSION_STRUCTURES[profile.sessionLength];
  const messaging = getMessagingFramework(profile.performanceContext);

  return {
    components: components.map((id) =>
      MEDITATION_COMPONENTS.find((c) => c.id === id)
    ).filter(Boolean),
    structure,
    messaging,
    estimatedDuration: structure.totalMinutes,
  };
}
