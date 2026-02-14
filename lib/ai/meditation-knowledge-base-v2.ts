/**
 * Enhanced Meditation Knowledge Base V2
 *
 * This version integrates the comprehensive psychological techniques database
 * with the existing meditation components, providing AI generators with access
 * to 8+ evidence-based techniques with full academic backing, implementation
 * protocols, and practitioner-proven language patterns.
 *
 * @version 2.0.0
 * @date 2026-01-28
 */

import {
  loadTechniquesDatabase,
  getTechniqueById,
  searchTechniques,
  PsychologicalTechnique,
  TechniqueDomain,
  type SearchQuery
} from './psychological-techniques';

// ============================================================================
// USER PROFILE TYPES (from plan-generator)
// ============================================================================

export interface UserProfile {
  primaryGoal: string;
  currentChallenge: string;
  sessionLength: number; // minutes
  experienceLevel: string;
  skepticismLevel: string;
  performanceContext: string;
  preferredTime?: string;
  specificOutcome?: string;
}

// ============================================================================
// ENHANCED COMPONENT SELECTION
// ============================================================================

/**
 * Calculate match score between technique and user profile.
 * Higher scores indicate better fit.
 *
 * Scoring breakdown:
 * - Performance focus alignment: 0-50 points
 * - Goal alignment: 0-30 points
 * - Duration fit: 0-20 points
 * - Evidence preference: 0-20 points
 * - Target audience match: 0-10 points
 *
 * Maximum possible score: 130 points
 */
function calculateMatchScore(
  technique: PsychologicalTechnique,
  profile: UserProfile
): number {
  let score = 0;

  // Performance focus alignment (0-50 points)
  // Higher performance focus = better for high-energy meditation
  score += technique.performanceFocus * 10;

  // Goal alignment (0-30 points)
  // Primary goal match is critical
  if (technique.bestFor.includes(profile.primaryGoal.toLowerCase())) {
    score += 30;
  }

  // Duration fit (0-20 points)
  // Technique should fit within session length
  if (technique.durationMinutes <= profile.sessionLength) {
    score += 20;
  } else {
    // Penalize techniques that are too long
    const overflow = technique.durationMinutes - profile.sessionLength;
    score += Math.max(0, 20 - (overflow * 2));
  }

  // Evidence preference (0-20 points)
  // Skeptical users need strong evidence
  const evidenceScore = {
    'strong': 20,
    'moderate': 15,
    'emerging': 10,
    'limited': 5
  };

  if (profile.skepticismLevel === 'high' && technique.evidenceLevel === 'strong') {
    score += evidenceScore[technique.evidenceLevel];
  } else if (profile.skepticismLevel === 'medium') {
    score += evidenceScore[technique.evidenceLevel] || 0;
  } else {
    // Low skepticism - any evidence level is fine
    score += (evidenceScore[technique.evidenceLevel] || 0) * 0.5;
  }

  // Target audience match (0-10 points)
  const contextMapping: Record<string, string[]> = {
    'entrepreneur': ['entrepreneurs', 'executives'],
    'sales': ['sales', 'performers'],
    'athlete': ['athletes', 'performers'],
    'executive': ['executives', 'entrepreneurs'],
    'creative': ['entrepreneurs', 'performers'],
  };

  const audienceKeywords = contextMapping[profile.performanceContext.toLowerCase()] || [];
  if (audienceKeywords.some(keyword => technique.targetAudience.includes(keyword))) {
    score += 10;
  }

  return score;
}

/**
 * Select optimal psychological techniques for user profile.
 * Returns 3-5 technique IDs ranked by match score.
 *
 * Selection process:
 * 1. Load all techniques from database
 * 2. Filter by audio compatibility (should all be true)
 * 3. Search for techniques matching user goals
 * 4. Score and rank candidates
 * 5. Return top 3-5 IDs
 *
 * @param profile - User questionnaire profile
 * @returns Array of 3-5 technique IDs, highest scoring first
 */
export async function selectOptimalTechniques(profile: UserProfile): Promise<string[]> {
  const techniques = await loadTechniquesDatabase();

  // Build search query from profile
  const searchQuery: SearchQuery = {
    bestFor: [profile.primaryGoal.toLowerCase()],
    maxDuration: profile.sessionLength,
    minPerformanceFocus: 3, // Myndset is performance-focused platform
  };

  // Add evidence filter for highly skeptical users
  if (profile.skepticismLevel === 'high') {
    searchQuery.minEvidenceLevel = 'moderate';
  }

  // Get candidate techniques
  let candidates = await searchTechniques(searchQuery);

  // If search is too restrictive, broaden it
  if (candidates.length < 5) {
    candidates = techniques.filter(t =>
      t.performanceFocus >= 3 &&
      t.durationMinutes <= profile.sessionLength
    );
  }

  // Score and rank candidates
  const scoredTechniques = candidates.map(technique => ({
    technique,
    score: calculateMatchScore(technique, profile)
  }));

  // Sort by score (highest first)
  scoredTechniques.sort((a, b) => b.score - a.score);

  // Return top 3-5 technique IDs
  const selectedCount = Math.min(5, Math.max(3, scoredTechniques.length));
  return scoredTechniques
    .slice(0, selectedCount)
    .map(item => item.technique.id);
}

/**
 * Get full technique details for selected IDs.
 * Used by plan and script generators to access implementation protocols.
 *
 * @param techniqueIds - Array of technique IDs
 * @returns Array of full technique objects
 */
export async function getTechniqueDetails(techniqueIds: string[]): Promise<PsychologicalTechnique[]> {
  const results = await Promise.all(techniqueIds.map(id => getTechniqueById(id)));
  return results.filter((t): t is PsychologicalTechnique => t !== undefined);
}

// ============================================================================
// BACKWARD COMPATIBILITY WITH V1 COMPONENTS
// ============================================================================

/**
 * Legacy meditation component interface (V1)
 * Maintained for backward compatibility with existing meditation_plans
 */
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

/**
 * Convert psychological technique to legacy component format
 * Allows old meditation plans to still render
 */
function techniqueToLegacyComponent(technique: PsychologicalTechnique): MeditationComponent {
  return {
    id: technique.id,
    name: technique.name,
    function: technique.description,
    neuroscienceMechanism: technique.psychologicalMechanism,
    evidenceLevel: technique.evidenceLevel === 'strong' ? 'high' :
                   technique.evidenceLevel === 'moderate' ? 'medium' : 'emerging',
    bestFor: technique.bestFor,
    durationMinutes: technique.durationMinutes,
    scriptGuidelines: technique.implementationProtocol.coreProcess
  };
}

/**
 * Get legacy components (V1 compatibility)
 * Returns all techniques in old component format
 */
export async function getLegacyComponents(): Promise<MeditationComponent[]> {
  const techniques = await loadTechniquesDatabase();
  return techniques.map(techniqueToLegacyComponent);
}

// ============================================================================
// SESSION STRUCTURE TEMPLATES (unchanged from V1)
// ============================================================================

export interface SessionStructure {
  name: string;
  totalMinutes: number;
  phases: {
    name: string;
    durationMinutes: number;
    purpose: string;
    components: string[];
  }[];
}

export const SESSION_STRUCTURES: Record<string, SessionStructure> = {
  ultra_quick: {
    name: 'Ultra-Quick Activation',
    totalMinutes: 2,
    phases: [
      {
        name: 'Instant Activation',
        durationMinutes: 2,
        purpose: 'Single-beat rapid-fire self-rally — name the darkness, confront it, lock in with one physical action',
        components: ['breath_awareness', 'energy_activation']
      }
    ]
  },
  quick: {
    name: 'Quick Power Session',
    totalMinutes: 4,
    phases: [
      {
        name: 'Rapid Centering',
        durationMinutes: 1,
        purpose: 'Ground attention and set intention',
        components: ['breath_awareness']
      },
      {
        name: 'Core Activation',
        durationMinutes: 3,
        purpose: 'Deploy primary performance technique',
        components: ['visualization', 'mantra_repetition', 'energy_activation']
      }
    ]
  },
  standard: {
    name: 'Standard Performance Session',
    totalMinutes: 8,
    phases: [
      {
        name: 'Opening & Settling',
        durationMinutes: 2,
        purpose: 'Transition from external to internal focus',
        components: ['breath_awareness']
      },
      {
        name: 'Core Practice',
        durationMinutes: 5,
        purpose: 'Primary meditation technique deployment',
        components: ['visualization', 'body_scan', 'open_monitoring']
      },
      {
        name: 'Integration & Closure',
        durationMinutes: 1,
        purpose: 'Anchor insights and prepare for action',
        components: ['mantra_repetition', 'energy_activation']
      }
    ]
  },
  deep: {
    name: 'Deep Immersion Session',
    totalMinutes: 20,
    phases: [
      {
        name: 'Arrival & Settling',
        durationMinutes: 3,
        purpose: 'Deep relaxation and receptivity',
        components: ['breath_awareness', 'body_scan']
      },
      {
        name: 'Primary Practice',
        durationMinutes: 12,
        purpose: 'Extended work with main technique',
        components: ['visualization', 'loving_kindness', 'open_monitoring']
      },
      {
        name: 'Integration',
        durationMinutes: 3,
        purpose: 'Consolidate learnings and set intentions',
        components: ['mantra_repetition']
      },
      {
        name: 'Energizing Close',
        durationMinutes: 2,
        purpose: 'Return to active engagement',
        components: ['energy_activation']
      }
    ]
  }
};

/**
 * Get appropriate session structure template based on duration
 */
export function getSessionStructure(minutes: number): SessionStructure {
  if (minutes <= 2) return SESSION_STRUCTURES.ultra_quick;
  if (minutes <= 5) return SESSION_STRUCTURES.quick;
  if (minutes <= 12) return SESSION_STRUCTURES.standard;
  return SESSION_STRUCTURES.deep;
}

// ============================================================================
// HYPNOTIC LANGUAGE PATTERNS (unchanged from V1)
// ============================================================================

export const HYPNOTIC_PATTERNS = {
  presuppositions: [
    "As you continue to...",
    "The more you practice, the more naturally...",
    "You might begin to notice...",
    "When you're ready to...",
    "Soon you'll discover..."
  ],
  embedded_commands: [
    "You might find yourself feeling more [STATE]",
    "Notice how easily you can [ACTION]",
    "Allow yourself to [EXPERIENCE]",
    "Begin to recognize [INSIGHT]"
  ],
  temporal_binding: [
    "As you breathe in, confidence builds... as you breathe out, doubt releases",
    "With each passing moment, you feel more [STATE]",
    "The deeper you go, the more powerful you become"
  ],
  pacing_and_leading: [
    "You're sitting here... reading these words... and already your mind is beginning to..."
  ]
};

// ============================================================================
// MESSAGING FRAMEWORKS (unchanged from V1)
// ============================================================================

export interface MessagingFramework {
  archetype: string;
  values: string[];
  languagePatterns: string[];
  avoidWords: string[];
  keyWords: string[];
}

export const MESSAGING_FRAMEWORKS: Record<string, MessagingFramework> = {
  entrepreneur: {
    archetype: 'The Builder',
    values: ['growth', 'innovation', 'resilience', 'vision'],
    languagePatterns: [
      'Build sustainable competitive advantage through...',
      'Optimize your most valuable asset: your mind',
      'This is strategic mental infrastructure',
    ],
    avoidWords: ['relax', 'surrender', 'peace', 'stillness'],
    keyWords: ['execute', 'build', 'scale', 'optimize', 'leverage', 'compound']
  },
  sales: {
    archetype: 'The Closer',
    values: ['confidence', 'resilience', 'energy', 'connection'],
    languagePatterns: [
      'Master your state, master your outcomes',
      'Peak performance on demand',
      'Convert pressure into power',
    ],
    avoidWords: ['passive', 'gentle', 'soft'],
    keyWords: ['confidence', 'presence', 'conviction', 'certainty', 'momentum']
  },
  executive: {
    archetype: 'The Strategist',
    values: ['clarity', 'decision-making', 'leadership', 'composure'],
    languagePatterns: [
      'Leadership begins with self-leadership',
      'Clarity under pressure is your competitive edge',
      'Strategic mental conditioning',
    ],
    avoidWords: ['escape', 'avoid', 'retreat'],
    keyWords: ['clarity', 'strategic', 'decisive', 'composed', 'focused']
  },
  athlete: {
    archetype: 'The Warrior',
    values: ['performance', 'discipline', 'resilience', 'excellence'],
    languagePatterns: [
      'Champions train their minds as intensely as their bodies',
      'Mental toughness is trainable',
      'This is performance psychology in action',
    ],
    avoidWords: ['soft', 'gentle', 'passive'],
    keyWords: ['strong', 'powerful', 'ready', 'focused', 'unstoppable']
  },
  creative: {
    archetype: 'The Innovator',
    values: ['flow', 'insight', 'creativity', 'breakthrough'],
    languagePatterns: [
      'Access your most creative state',
      'Innovation requires an optimized nervous system',
      'Breakthroughs happen in specific mental states',
    ],
    avoidWords: ['rigid', 'structured', 'controlled'],
    keyWords: ['flow', 'insight', 'breakthrough', 'clarity', 'inspiration']
  },
  technical: {
    archetype: 'The Engineer',
    values: ['precision', 'optimization', 'systems', 'performance'],
    languagePatterns: [
      'Neuroscience-backed mental optimization',
      'Evidence-based cognitive enhancement',
      'This is systematic mental training',
    ],
    avoidWords: ['mystical', 'spiritual', 'woo-woo'],
    keyWords: ['optimize', 'system', 'precise', 'measured', 'effective']
  }
};

/**
 * Get appropriate messaging framework for user
 */
export function getMessagingFramework(performanceContext: string): MessagingFramework {
  const normalized = performanceContext.toLowerCase();
  return MESSAGING_FRAMEWORKS[normalized] || MESSAGING_FRAMEWORKS.entrepreneur;
}

// ============================================================================
// MEDITATION PLAN GENERATION (V2 - Enhanced)
// ============================================================================

export interface MeditationPlan {
  components: Array<{
    id: string;
    name: string;
    rationale: string;
    duration: number;
  }>;
  sessionStructure: SessionStructure;
  messagingFramework: MessagingFramework;
  totalDuration: number;
}

/**
 * Generate meditation plan using V2 psychological techniques database.
 * This is the main entry point for plan generation.
 *
 * @param profile - User questionnaire profile
 * @returns Complete meditation plan ready for AI refinement
 */
export async function generateMeditationPlan(profile: UserProfile): Promise<MeditationPlan> {
  // Select optimal techniques
  const techniqueIds = await selectOptimalTechniques(profile);
  const techniques = await getTechniqueDetails(techniqueIds);

  // Get session structure template
  const structure = getSessionStructure(profile.sessionLength);

  // Get messaging framework
  const messaging = getMessagingFramework(profile.performanceContext);

  // Build component list with rationale
  const components = techniques.map(technique => ({
    id: technique.id,
    name: technique.name,
    rationale: `Selected for ${profile.primaryGoal}: ${technique.description}`,
    duration: technique.durationMinutes
  }));

  // Calculate total duration
  const totalDuration = components.reduce((sum, c) => sum + c.duration, 0);

  return {
    components,
    sessionStructure: structure,
    messagingFramework: messaging,
    totalDuration
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Technique database access
  loadTechniquesDatabase,
  getTechniqueById,
  searchTechniques,

  // Types
  type PsychologicalTechnique,
  type SearchQuery,
  TechniqueDomain
};
