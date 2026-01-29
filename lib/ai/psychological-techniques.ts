/**
 * Psychological Techniques Database
 *
 * This module provides TypeScript interfaces and loader functions for the
 * comprehensive psychological techniques database used in AI-generated meditation scripts.
 *
 * The database contains 30-50 evidence-based techniques from motivational psychology,
 * sports performance, hypnosis, NLP, and cognitive psychology - all optimized for
 * audio-driven, high-energy performance meditation.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

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
 * Implementation protocol for script generation
 */
export interface ImplementationProtocol {
  /** How to introduce and frame the technique */
  setup: string;

  /** Main steps of the technique (detailed instructions) */
  coreProcess: string;

  /** Specific phrases and sentence structures to use */
  languagePatterns: string[];

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

  /** Example showing technique in practice */
  scriptExample: ScriptExample;

  // ==================== RELATIONSHIPS ====================

  /** IDs of synergistic techniques */
  combinesWellWith: string[];

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
// DATABASE LOADING
// ============================================================================

/**
 * Cached database instance to avoid repeated file reads
 */
let cachedDatabase: TechniquesDatabase | null = null;

/**
 * Load the complete techniques database from JSON file.
 * Results are cached in memory for performance.
 *
 * @returns Complete techniques database
 * @throws Error if database file cannot be read or parsed
 */
export function loadTechniquesDatabase(): PsychologicalTechnique[] {
  if (cachedDatabase) {
    return cachedDatabase.techniques;
  }

  try {
    const dbPath = join(process.cwd(), 'lib', 'ai', 'psychological-techniques-db.json');
    const fileContents = readFileSync(dbPath, 'utf-8');
    cachedDatabase = JSON.parse(fileContents);

    if (!cachedDatabase || !cachedDatabase.techniques) {
      throw new Error('Invalid database structure: missing techniques array');
    }

    return cachedDatabase.techniques;
  } catch (error) {
    console.error('Failed to load psychological techniques database:', error);
    throw new Error(`Database load failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Force reload of the database (clears cache).
 * Useful for development/testing when database file is updated.
 */
export function reloadDatabase(): void {
  cachedDatabase = null;
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
export function getTechniqueById(id: string): PsychologicalTechnique | undefined {
  const techniques = loadTechniquesDatabase();
  return techniques.find(t => t.id === id);
}

/**
 * Get all techniques in a specific domain
 *
 * @param domain - Domain to filter by
 * @returns Array of matching techniques
 */
export function getTechniquesByDomain(domain: TechniqueDomain): PsychologicalTechnique[] {
  const techniques = loadTechniquesDatabase();
  return techniques.filter(t => t.domain === domain);
}

/**
 * Get all techniques with a specific tag
 *
 * @param tag - Tag to search for
 * @returns Array of techniques containing the tag
 */
export function getTechniquesByTag(tag: string): PsychologicalTechnique[] {
  const techniques = loadTechniquesDatabase();
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
export function searchTechniques(query: SearchQuery): PsychologicalTechnique[] {
  let results = loadTechniquesDatabase();

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
export function getDatabaseStats() {
  const techniques = loadTechniquesDatabase();

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
    if (!protocol.languagePatterns || protocol.languagePatterns.length === 0) {
      errors.push('Implementation protocol must include language patterns');
    }
  }

  // Script example validation
  if (!technique.scriptExample) {
    errors.push('Missing required field: scriptExample');
  } else {
    if (!technique.scriptExample.excerpt || !technique.scriptExample.context) {
      errors.push('Script example missing required fields');
    }
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
export function validateDatabase() {
  const techniques = loadTechniquesDatabase();
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
    technique.combinesWellWith.forEach(id => {
      if (!ids.includes(id)) {
        report.warnings.push(`${technique.id}: combinesWellWith references non-existent technique "${id}"`);
      }
    });
    technique.contradictsWithout.forEach(id => {
      if (!ids.includes(id)) {
        report.warnings.push(`${technique.id}: contradictsWithout references non-existent technique "${id}"`);
      }
    });
  });

  return report;
}
