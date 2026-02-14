/**
 * Psychological Techniques Database
 *
 * This module provides TypeScript interfaces and loader functions for the
 * comprehensive psychological techniques database used in AI-generated meditation scripts.
 *
 * The database contains 30-50 evidence-based techniques from motivational psychology,
 * sports performance, hypnosis, NLP, and cognitive psychology - all optimized for
 * audio-driven, high-energy performance meditation.
 *
 * Data source: Supabase `psychological_techniques` table, with JSON file fallback.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Database } from '@/types/database';
import type { PsychologicalTechniqueRow } from '@/types/database';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Domain categories for psychological techniques
 */
export enum TechniqueDomain {
  MOTIVATION = 'motivational',
  HYPNOSIS = 'hypnosis',
  NLP = 'nlp',
  SPORTS_PSYCHOLOGY = 'sports_performance',
  COGNITIVE = 'cognitive',
  PERSUASION = 'persuasion'
}

/**
 * Evidence strength levels based on research quality and quantity
 */
export type EvidenceLevel = 'strong' | 'moderate' | 'emerging' | 'limited';

/**
 * Implementation speed categories
 */
export type ImplementationSpeed = 'instant' | 'quick' | 'moderate';

/**
 * Psychological intensity levels
 */
export type IntensityLevel = 'low' | 'medium' | 'high';

/**
 * Performance focus rating (1-5, where 5 is highest energy/activation)
 */
export type PerformanceFocus = 1 | 2 | 3 | 4 | 5;

/**
 * Academic source citation
 */
export interface AcademicSource {
  /** Primary authors (e.g., "Bandura, A.") */
  authors: string;

  /** Publication year */
  year: number;

  /** Full paper or book title */
  title: string;

  /** Journal name or publisher (optional) */
  journal?: string;

  /** DOI or accessible URL (optional but encouraged) */
  url?: string;

  /** 1-2 sentence summary of key findings */
  keyFindings: string;

  /** Effect size if available (e.g., "d = 0.75", "r = .45", "medium effect") */
  effectSize?: string;
}

/**
 * Categorized language patterns for script generation (v2 enriched format)
 */
export interface CategorizedLanguagePatterns {
  openingHooks: string[];
  coreProcess: string[];
  deepeningIntensifiers: string[];
  transitionBridges: string[];
  closingAnchors: string[];
}

/**
 * Implementation protocol for script generation
 */
export interface ImplementationProtocol {
  /** How to introduce and frame the technique */
  setup: string;

  /** Main steps of the technique (detailed instructions) */
  coreProcess: string;

  /** Categorized phrases and sentence structures (v2: object, v1 fallback: string[]) */
  languagePatterns: CategorizedLanguagePatterns | string[];

  /** Pacing, tone, emphasis, and delivery guidance */
  deliveryNotes: string;
}

/**
 * Script example demonstrating the technique
 */
export interface ScriptExample {
  /** 2-4 sentence excerpt showing technique in action */
  excerpt: string;

  /** When in the session this would be used */
  context: string;

  /** Typical duration of this section */
  duration: string;

  /** Intensity level of this example */
  intensity?: string;

  /** Techniques used in this example */
  techniquesUsed?: string[];

  /** Pronoun strategy used */
  pronounStrategy?: string;
}

/**
 * Self-speech / mirror speech adaptation metadata
 */
export interface SelfSpeechAdaptation {
  pronounStrategy: string;
  mirrorCompatible: boolean;
  internalMonologueStyle: string;
  confrontationLevel: string;
  emotionalEntryPoint: string;
  transformationTarget: string;
  adaptationNotes: string;
}

/**
 * Rhetorical device mapping
 */
export interface RhetoricalDevice {
  device: string;
  application: string;
  example: string;
}

/**
 * User context example for a specific archetype
 */
export interface UserContextExample {
  scenario: string;
  scriptExcerpt: string;
  keyAdaptations: string[];
}

/**
 * Emotional arc mapping for darkness-to-light structure
 */
export interface EmotionalArc {
  startingState: string;
  buildPhase: string;
  peakMoment: string;
  resolutionState: string;
  darknessToLightMapping: string;
}

/**
 * Creative inspiration from performance traditions
 */
export interface CreativeInspiration {
  source: string;
  insight: string;
  applicationNote: string;
}

/**
 * Voice delivery guidance for audio synthesis
 */
export interface VoiceDeliveryNotes {
  paceGuidance: string;
  toneShifts: string[];
  emphasisWords: string[];
  breathPoints: string[];
  elevenLabsTags: string[];
}

/**
 * Enriched combinesWellWith entry with synergy rationale
 */
export interface TechniqueCombination {
  id: string;
  name: string;
  synergy: string;
  sequencePosition: 'before' | 'after' | 'either';
  combinedEffect: string;
  transitionLanguage: string;
}

/**
 * Complete psychological technique entry
 */
export interface PsychologicalTechnique {
  // ==================== IDENTIFICATION ====================

  /** Unique identifier (snake_case) */
  id: string;

  /** Display name */
  name: string;

  /** Domain category */
  domain: TechniqueDomain;

  // ==================== CLASSIFICATION ====================

  /** Searchable tags */
  tags: string[];

  /** Must be true for all selected techniques */
  audioCompatible: boolean;

  /** Performance/energy orientation (1-5, where 5=highest) */
  performanceFocus: PerformanceFocus;

  // ==================== CORE DESCRIPTION ====================

  /** 2-3 sentences: what it is and what it accomplishes */
  description: string;

  /** How/why it works (neuroscience/psychology explanation) */
  psychologicalMechanism: string;

  // ==================== EVIDENCE & RESEARCH ====================

  /** Strength of academic backing */
  evidenceLevel: EvidenceLevel;

  /** At least 1 required, more is better */
  academicSources: AcademicSource[];

  // ==================== IMPLEMENTATION GUIDELINES ====================

  /** Scenarios where this technique is appropriate */
  whenToUse: string[];

  /** Contraindications and cautions */
  whenNotToUse: string[];

  /** Typical time required in minutes */
  durationMinutes: number;

  /** Psychological intensity of the technique */
  intensityLevel: IntensityLevel;

  // ==================== SCRIPT GENERATION CONTEXT ====================

  /** Detailed implementation instructions */
  implementationProtocol: ImplementationProtocol;

  /** Example showing technique in practice (v1 single, v2 array) */
  scriptExample?: ScriptExample;

  /** Multiple script examples across archetypes (v2 enriched) */
  scriptExamples?: ScriptExample[];

  // ==================== V2 ENRICHMENT FIELDS ====================

  /** Mirror speech / self-speech adaptation metadata */
  selfSpeechAdaptation?: SelfSpeechAdaptation;

  /** Rhetorical devices mapped to this technique */
  rhetoricalDevices?: RhetoricalDevice[];

  /** Context-specific examples for 6 user archetypes */
  userContextExamples?: Record<string, UserContextExample>;

  /** Emotional arc mapping (darkness-to-light structure) */
  emotionalArc?: EmotionalArc;

  /** Creative inspirations from performance traditions */
  creativeInspirations?: CreativeInspiration[];

  /** Voice delivery guidance for audio synthesis */
  voiceDeliveryNotes?: VoiceDeliveryNotes;

  // ==================== RELATIONSHIPS ====================

  /** Synergistic techniques (v2: TechniqueCombination[], v1 fallback: string[]) */
  combinesWellWith: TechniqueCombination[] | string[];

  /** IDs of incompatible techniques */
  contradictsWithout: string[];

  // ==================== METADATA ====================

  /** Target user types */
  targetAudience: string[];

  /** User goals this technique addresses */
  bestFor: string[];

  /** Speed of implementation */
  implementationSpeed: ImplementationSpeed;

  /** ISO timestamp */
  createdAt: string;

  /** ISO timestamp */
  updatedAt: string;

  /** Version number */
  version: number;
}

/**
 * Database container structure
 */
export interface TechniquesDatabase {
  version: string;
  lastUpdated: string;
  totalTechniques: number;
  techniques: PsychologicalTechnique[];
}

// ============================================================================
// SUPABASE CLIENT (lightweight, no cookie dependency)
// ============================================================================

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ============================================================================
// DATABASE LOADING
// ============================================================================

/**
 * In-memory cache with TTL
 */
let cachedTechniques: PsychologicalTechnique[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Map a Supabase row (snake_case) to the app-level PsychologicalTechnique interface (camelCase)
 */
function mapRowToTechnique(row: PsychologicalTechniqueRow): PsychologicalTechnique {
  return {
    id: row.id,
    name: row.name,
    domain: row.domain as TechniqueDomain,
    tags: row.tags,
    audioCompatible: row.audio_compatible,
    performanceFocus: row.performance_focus as PerformanceFocus,
    description: row.description,
    psychologicalMechanism: row.psychological_mechanism,
    evidenceLevel: row.evidence_level as EvidenceLevel,
    academicSources: row.academic_sources as unknown as AcademicSource[],
    whenToUse: row.when_to_use,
    whenNotToUse: row.when_not_to_use,
    durationMinutes: row.duration_minutes,
    intensityLevel: row.intensity_level as IntensityLevel,
    implementationProtocol: row.implementation_protocol as unknown as ImplementationProtocol,
    scriptExample: row.script_example as unknown as ScriptExample,
    combinesWellWith: row.combines_well_with ?? [],
    contradictsWithout: row.contradicts_without ?? [],
    targetAudience: row.target_audience,
    bestFor: row.best_for,
    implementationSpeed: row.implementation_speed as ImplementationSpeed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version,
  };
}

/**
 * Fallback: load techniques from local JSON file (synchronous)
 */
function loadFromJson(): PsychologicalTechnique[] {
  const dbPath = join(process.cwd(), 'lib', 'ai', 'psychological-techniques-db.json');
  const fileContents = readFileSync(dbPath, 'utf-8');
  const db: TechniquesDatabase = JSON.parse(fileContents);
  if (!db || !db.techniques) {
    throw new Error('Invalid database structure: missing techniques array');
  }
  return db.techniques;
}

/**
 * Load the complete techniques database.
 * Tries Supabase first, falls back to local JSON file.
 * Results are cached in memory with a 5-minute TTL.
 *
 * @returns Array of all techniques
 */
export async function loadTechniquesDatabase(): Promise<PsychologicalTechnique[]> {
  // Return from cache if still valid
  if (cachedTechniques && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedTechniques;
  }

  // Try Supabase first
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('psychological_techniques')
        .select('*')
        .order('id');

      if (!error && data && data.length > 0) {
        cachedTechniques = data.map(mapRowToTechnique);
        cacheTimestamp = Date.now();
        return cachedTechniques;
      }
      // If Supabase returned empty or errored, fall through to JSON
      if (error) {
        console.warn('Supabase techniques query failed, using JSON fallback:', error.message);
      }
    }
  } catch (err) {
    console.warn('Supabase unavailable, using JSON fallback:', err instanceof Error ? err.message : String(err));
  }

  // Fallback to JSON file
  try {
    cachedTechniques = loadFromJson();
    cacheTimestamp = Date.now();
    return cachedTechniques;
  } catch (error) {
    console.error('Failed to load psychological techniques database:', error);
    throw new Error(`Database load failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Force reload of the database (clears cache).
 * Useful for development/testing when database is updated.
 */
export function reloadDatabase(): void {
  cachedTechniques = null;
  cacheTimestamp = 0;
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get a single technique by its ID
 *
 * @param id - Unique technique identifier
 * @returns Technique object if found, undefined otherwise
 */
export async function getTechniqueById(id: string): Promise<PsychologicalTechnique | undefined> {
  const techniques = await loadTechniquesDatabase();
  return techniques.find(t => t.id === id);
}

/**
 * Get all techniques in a specific domain
 *
 * @param domain - Domain to filter by
 * @returns Array of matching techniques
 */
export async function getTechniquesByDomain(domain: TechniqueDomain): Promise<PsychologicalTechnique[]> {
  const techniques = await loadTechniquesDatabase();
  return techniques.filter(t => t.domain === domain);
}

/**
 * Get all techniques with a specific tag
 *
 * @param tag - Tag to search for
 * @returns Array of techniques containing the tag
 */
export async function getTechniquesByTag(tag: string): Promise<PsychologicalTechnique[]> {
  const techniques = await loadTechniquesDatabase();
  return techniques.filter(t => t.tags.includes(tag));
}

/**
 * Search query parameters
 */
export interface SearchQuery {
  /** Filter by user goals (OR logic - matches any) */
  bestFor?: string[];

  /** Filter by domain */
  domain?: TechniqueDomain;

  /** Filter by tags (OR logic - matches any) */
  tags?: string[];

  /** Minimum evidence level (strong > moderate > emerging > limited) */
  minEvidenceLevel?: EvidenceLevel;

  /** Maximum duration in minutes */
  maxDuration?: number;

  /** Minimum performance focus rating */
  minPerformanceFocus?: PerformanceFocus;

  /** Target audience (OR logic - matches any) */
  targetAudience?: string[];

  /** Implementation speed filter */
  implementationSpeed?: ImplementationSpeed;
}

/**
 * Evidence level hierarchy for comparison
 */
const EVIDENCE_LEVELS: Record<EvidenceLevel, number> = {
  'strong': 4,
  'moderate': 3,
  'emerging': 2,
  'limited': 1
};

/**
 * Search techniques with multiple filter criteria.
 * All filters are applied with AND logic, except arrays which use OR.
 *
 * @param query - Search parameters
 * @returns Array of matching techniques
 */
export async function searchTechniques(query: SearchQuery): Promise<PsychologicalTechnique[]> {
  let results = await loadTechniquesDatabase();

  // Filter by domain
  if (query.domain) {
    results = results.filter(t => t.domain === query.domain);
  }

  // Filter by user goals (OR logic)
  if (query.bestFor && query.bestFor.length > 0) {
    results = results.filter(t =>
      query.bestFor!.some(goal => t.bestFor.includes(goal))
    );
  }

  // Filter by tags (OR logic)
  if (query.tags && query.tags.length > 0) {
    results = results.filter(t =>
      query.tags!.some(tag => t.tags.includes(tag))
    );
  }

  // Filter by minimum evidence level
  if (query.minEvidenceLevel) {
    const minLevel = EVIDENCE_LEVELS[query.minEvidenceLevel];
    results = results.filter(t =>
      EVIDENCE_LEVELS[t.evidenceLevel] >= minLevel
    );
  }

  // Filter by maximum duration
  if (query.maxDuration !== undefined) {
    results = results.filter(t => t.durationMinutes <= query.maxDuration!);
  }

  // Filter by minimum performance focus
  if (query.minPerformanceFocus !== undefined) {
    results = results.filter(t => t.performanceFocus >= query.minPerformanceFocus!);
  }

  // Filter by target audience (OR logic)
  if (query.targetAudience && query.targetAudience.length > 0) {
    results = results.filter(t =>
      query.targetAudience!.some(audience => t.targetAudience.includes(audience))
    );
  }

  // Filter by implementation speed
  if (query.implementationSpeed) {
    results = results.filter(t => t.implementationSpeed === query.implementationSpeed);
  }

  return results;
}

/**
 * Get summary statistics about the database
 *
 * @returns Database statistics
 */
export async function getDatabaseStats() {
  const techniques = await loadTechniquesDatabase();

  return {
    totalTechniques: techniques.length,
    byDomain: {
      motivational: techniques.filter(t => t.domain === TechniqueDomain.MOTIVATION).length,
      hypnosis: techniques.filter(t => t.domain === TechniqueDomain.HYPNOSIS).length,
      nlp: techniques.filter(t => t.domain === TechniqueDomain.NLP).length,
      sportsPerformance: techniques.filter(t => t.domain === TechniqueDomain.SPORTS_PSYCHOLOGY).length,
      cognitive: techniques.filter(t => t.domain === TechniqueDomain.COGNITIVE).length,
      persuasion: techniques.filter(t => t.domain === TechniqueDomain.PERSUASION).length,
    },
    byEvidenceLevel: {
      strong: techniques.filter(t => t.evidenceLevel === 'strong').length,
      moderate: techniques.filter(t => t.evidenceLevel === 'moderate').length,
      emerging: techniques.filter(t => t.evidenceLevel === 'emerging').length,
      limited: techniques.filter(t => t.evidenceLevel === 'limited').length,
    },
    byPerformanceFocus: {
      highest: techniques.filter(t => t.performanceFocus === 5).length,
      high: techniques.filter(t => t.performanceFocus === 4).length,
      medium: techniques.filter(t => t.performanceFocus === 3).length,
      low: techniques.filter(t => t.performanceFocus <= 2).length,
    },
    averageDuration: Math.round(
      techniques.reduce((sum, t) => sum + t.durationMinutes, 0) / techniques.length
    ),
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that a technique has all required fields populated
 *
 * @param technique - Technique to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateTechnique(technique: PsychologicalTechnique): string[] {
  const errors: string[] = [];

  // Required string fields
  if (!technique.id || technique.id.trim() === '') {
    errors.push('Missing required field: id');
  }
  if (!technique.name || technique.name.trim() === '') {
    errors.push('Missing required field: name');
  }
  if (!technique.description || technique.description.trim() === '') {
    errors.push('Missing required field: description');
  }
  if (!technique.psychologicalMechanism || technique.psychologicalMechanism.trim() === '') {
    errors.push('Missing required field: psychologicalMechanism');
  }

  // Academic sources validation
  if (!technique.academicSources || technique.academicSources.length === 0) {
    errors.push('At least one academic source is required');
  } else {
    technique.academicSources.forEach((source, index) => {
      if (!source.authors || !source.title || !source.keyFindings) {
        errors.push(`Academic source ${index + 1} missing required fields`);
      }
    });
  }

  // Implementation protocol validation
  if (!technique.implementationProtocol) {
    errors.push('Missing required field: implementationProtocol');
  } else {
    const protocol = technique.implementationProtocol;
    if (!protocol.setup || !protocol.coreProcess || !protocol.deliveryNotes) {
      errors.push('Implementation protocol missing required sub-fields');
    }
    // languagePatterns can be string[] (v1) or CategorizedLanguagePatterns (v2)
    if (!protocol.languagePatterns) {
      errors.push('Implementation protocol must include language patterns');
    } else if (Array.isArray(protocol.languagePatterns) && protocol.languagePatterns.length === 0) {
      errors.push('Implementation protocol must include language patterns');
    }
  }

  // Script example validation (v2 uses scriptExamples array)
  const hasScriptExample = technique.scriptExample?.excerpt;
  const hasScriptExamples = technique.scriptExamples && technique.scriptExamples.length > 0;
  if (!hasScriptExample && !hasScriptExamples) {
    errors.push('Missing required field: scriptExample or scriptExamples');
  }

  // Array validations
  if (!technique.whenToUse || technique.whenToUse.length === 0) {
    errors.push('At least one whenToUse scenario is required');
  }
  if (!technique.bestFor || technique.bestFor.length === 0) {
    errors.push('At least one bestFor goal is required');
  }
  if (!technique.targetAudience || technique.targetAudience.length === 0) {
    errors.push('At least one targetAudience is required');
  }

  // Numeric validations
  if (technique.durationMinutes <= 0 || technique.durationMinutes > 30) {
    errors.push('Duration must be between 1 and 30 minutes');
  }
  if (technique.performanceFocus < 1 || technique.performanceFocus > 5) {
    errors.push('Performance focus must be between 1 and 5');
  }

  return errors;
}

/**
 * Validate the entire database structure
 *
 * @returns Validation report with errors and warnings
 */
export async function validateDatabase() {
  const techniques = await loadTechniquesDatabase();
  const report = {
    totalTechniques: techniques.length,
    valid: [] as string[],
    invalid: [] as { id: string; errors: string[] }[],
    warnings: [] as string[],
  };

  // Check for duplicate IDs
  const ids = techniques.map(t => t.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    report.warnings.push(`Duplicate IDs found: ${duplicateIds.join(', ')}`);
  }

  // Validate each technique
  techniques.forEach(technique => {
    const errors = validateTechnique(technique);
    if (errors.length === 0) {
      report.valid.push(technique.id);
    } else {
      report.invalid.push({ id: technique.id, errors });
    }
  });

  // Check for broken cross-references
  techniques.forEach(technique => {
    const cww = technique.combinesWellWith || [];
    cww.forEach((entry) => {
      const refId = typeof entry === 'string' ? entry : entry.id;
      if (!ids.includes(refId)) {
        report.warnings.push(`${technique.id}: combinesWellWith references non-existent technique "${refId}"`);
      }
    });
    (technique.contradictsWithout || []).forEach(id => {
      if (!ids.includes(id)) {
        report.warnings.push(`${technique.id}: contradictsWithout references non-existent technique "${id}"`);
      }
    });
  });

  return report;
}
