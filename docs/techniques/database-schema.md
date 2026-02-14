# Psychological Techniques Database Schema

**Version**: 1.0.0
**Last Updated**: 2026-01-28
**Status**: Production (Tier 1 techniques complete)

---

## Storage & Migration Notes

The psychological techniques data is now stored in **Supabase** in the `psychological_techniques` table. Key details:

- **Supabase table**: `psychological_techniques` (migration: `007_psychological_techniques.sql`)
- **JSON fallback**: `lib/ai/psychological-techniques-db.json` serves as a fallback when Supabase is unavailable
- **TypeScript interfaces**: Remain unchanged in `lib/ai/psychological-techniques.ts`
- **Seed data**: Run `npm run seed-techniques` to populate the Supabase table from the JSON source

---

## Overview

The Psychological Techniques Database is a comprehensive, evidence-based collection of psychological interventions optimized for audio-driven, high-energy performance meditation scripts. The database currently contains **8 Tier 1 gold-standard techniques** with plans to expand to 45+ techniques.

## Database Structure

### File Location
```
/lib/ai/psychological-techniques-db.json
```

### Container Schema

```typescript
interface TechniquesDatabase {
  version: string;              // Semantic version (e.g., "1.0.0")
  lastUpdated: string;          // ISO 8601 timestamp
  totalTechniques: number;      // Count of techniques in database
  description: string;          // Database description
  techniques: PsychologicalTechnique[];  // Array of technique objects
}
```

## PsychologicalTechnique Schema

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (snake_case, e.g., "anchoring_nlp") |
| `name` | string | Yes | Display name (e.g., "Anchoring (NLP)") |
| `domain` | TechniqueDomain | Yes | Category: motivational, hypnosis, nlp, sports_performance, cognitive, persuasion |
| `tags` | string[] | Yes | Searchable keywords (5-10 per technique) |
| `audioCompatible` | boolean | Yes | Must be `true` for all selected techniques |
| `performanceFocus` | 1-5 | Yes | Energy/activation rating (5 = highest) |

### Description Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | 2-3 sentence summary of what technique is and does |
| `psychologicalMechanism` | string | Yes | How/why it works (neuroscience/psychology explanation) |

### Evidence Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `evidenceLevel` | EvidenceLevel | Yes | "strong", "moderate", "emerging", or "limited" |
| `academicSources` | AcademicSource[] | Yes | Minimum 1 source, ideally 2-3 |

### Implementation Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `whenToUse` | string[] | Yes | 3-6 scenarios where technique is appropriate |
| `whenNotToUse` | string[] | Yes | 2-6 contraindications and cautions |
| `durationMinutes` | number | Yes | Typical time required (1-30 minutes) |
| `intensityLevel` | IntensityLevel | Yes | "low", "medium", or "high" psychological intensity |

### Script Generation Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `implementationProtocol` | ImplementationProtocol | Yes | Detailed setup, process, patterns, delivery notes |
| `scriptExample` | ScriptExample | Yes | 2-4 sentence audio excerpt demonstrating technique |

### Relationship Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `combinesWellWith` | string[] | Optional | IDs of synergistic techniques (empty array initially) |
| `contradictsWithout` | string[] | Optional | IDs of incompatible techniques (empty array initially) |

### Metadata Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targetAudience` | string[] | Yes | ["entrepreneurs", "athletes", "executives", "sales", "performers"] |
| `bestFor` | string[] | Yes | User goals: ["confidence", "focus", "energy", "calm_alertness", etc.] |
| `implementationSpeed` | ImplementationSpeed | Yes | "instant" (<1min), "quick" (<5min), "moderate" (<10min) |
| `createdAt` | string | Yes | ISO 8601 timestamp |
| `updatedAt` | string | Yes | ISO 8601 timestamp |
| `version` | number | Yes | Version number (starts at 1) |

## Nested Object Schemas

### AcademicSource

```typescript
interface AcademicSource {
  authors: string;       // "Bandura, A." or "Multiple researchers"
  year: number;          // Publication year
  title: string;         // Full paper/book title
  journal?: string;      // Journal name or publisher (optional)
  url?: string;          // DOI or accessible URL (optional but encouraged)
  keyFindings: string;   // 1-2 sentence summary
  effectSize?: string;   // "d = 0.75", "r = .45", "medium effect", etc. (optional)
}
```

**Validation Rules**:
- At least 1 academic source required per technique
- `authors`, `year`, `title`, and `keyFindings` are mandatory
- `url` strongly encouraged for accessibility
- `effectSize` optional but valuable when available

### ImplementationProtocol

```typescript
interface ImplementationProtocol {
  setup: string;           // How to introduce/frame the technique
  coreProcess: string;     // Main steps (detailed, actionable)
  languagePatterns: string[];  // 5-10 specific phrases
  deliveryNotes: string;   // Pacing, tone, emphasis guidance
}
```

**Validation Rules**:
- All four fields are required
- `languagePatterns` must contain at least 3 patterns
- `coreProcess` should be step-by-step (use numbered lists)
- `deliveryNotes` should include tone, pacing, duration, volume guidance

### ScriptExample

```typescript
interface ScriptExample {
  excerpt: string;   // 2-4 sentence audio script excerpt
  context: string;   // When in session this would be used
  duration: string;  // "30 seconds", "2 minutes", "5-8 minutes"
}
```

**Validation Rules**:
- All three fields required
- `excerpt` should be 2-4 sentences demonstrating technique in spoken form
- `context` describes placement in meditation session
- `duration` describes typical length of this section

## Enum Definitions

### TechniqueDomain

```typescript
enum TechniqueDomain {
  MOTIVATION = 'motivational',
  HYPNOSIS = 'hypnosis',
  NLP = 'nlp',
  SPORTS_PSYCHOLOGY = 'sports_performance',
  COGNITIVE = 'cognitive',
  PERSUASION = 'persuasion'
}
```

### EvidenceLevel

```typescript
type EvidenceLevel = 'strong' | 'moderate' | 'emerging' | 'limited';
```

**Criteria**:
- **Strong**: Meta-analyses, multiple RCTs, robust neuroscience, widely cited foundational theories (Bandura, Feltz & Landers, Luthans)
- **Moderate**: Several empirical studies, established clinical use, peer-reviewed research (post-hypnotic suggestions, anchoring)
- **Emerging**: Preliminary research, practitioner validation, theoretical support (Circle of Excellence, embedded commands)
- **Limited**: Primarily clinical case studies, minimal controlled research

### ImplementationSpeed

```typescript
type ImplementationSpeed = 'instant' | 'quick' | 'moderate';
```

- **Instant**: < 1 minute (positive self-talk, performance cues)
- **Quick**: 1-5 minutes (anchoring, centering technique)
- **Moderate**: 5-10 minutes (PsyCap development, mental imagery)

### IntensityLevel

```typescript
type IntensityLevel = 'low' | 'medium' | 'high';
```

- **Low**: Minimal psychological intensity, suitable for beginners (positive self-talk, mastery experiences recall)
- **Medium**: Moderate engagement, requires some focus (anchoring, visualization, post-hypnotic suggestion)
- **High**: Deep engagement, significant cognitive/emotional resources required (age regression - NOT included in current database)

## Validation Rules

### Required Field Validation

All techniques must have:
1. Unique `id` (no duplicates)
2. Non-empty `name`, `description`, `psychologicalMechanism`
3. At least 1 `academicSource` with complete citation
4. At least 1 `whenToUse` scenario
5. At least 1 `whenNotToUse` contraindication
6. At least 1 `bestFor` goal
7. At least 1 `targetAudience` type
8. Complete `implementationProtocol` with all sub-fields
9. Complete `scriptExample` with all sub-fields

### Data Quality Standards

- **Description**: 2-3 complete sentences, not fragments
- **Language Patterns**: 5-10 specific phrases, not generic
- **Script Example**: Demonstrates technique clearly, 2-4 sentences
- **Duration**: Realistic (1-30 minutes)
- **Performance Focus**: Justified by technique nature (anchoring = 4-5, relaxation = 2-3)
- **Academic Sources**: Proper citations with accessible URLs when possible

### Cross-Reference Validation

- All IDs in `combinesWellWith` must exist in database
- All IDs in `contradictsWithout` must exist in database
- No technique can be in both `combinesWellWith` AND `contradictsWithout` for same ID

## Query Patterns

### Basic Queries

```typescript
// Get single technique
const technique = getTechniqueById('anchoring_nlp');

// Get by domain
const nlpTechniques = getTechniquesByDomain(TechniqueDomain.NLP);

// Get by tag
const stateManagement = getTechniquesByTag('state_management');
```

### Advanced Search

```typescript
// Search with multiple criteria
const results = searchTechniques({
  bestFor: ['confidence'],
  domain: TechniqueDomain.SPORTS_PSYCHOLOGY,
  minEvidenceLevel: 'moderate',
  maxDuration: 10,
  minPerformanceFocus: 4,
  targetAudience: ['athletes', 'entrepreneurs']
});
```

## Database Statistics (Current)

```json
{
  "totalTechniques": 8,
  "byDomain": {
    "motivational": 2,
    "hypnosis": 2,
    "nlp": 2,
    "sportsPerformance": 2,
    "cognitive": 0,
    "persuasion": 0
  },
  "byEvidenceLevel": {
    "strong": 4,
    "moderate": 2,
    "emerging": 2,
    "limited": 0
  },
  "byPerformanceFocus": {
    "highest": 3,
    "high": 4,
    "medium": 1,
    "low": 0
  },
  "averageDuration": 11.6
}
```

## Version History

### v1.0.0 (2026-01-28)
- Initial release with 8 Tier 1 gold-standard techniques
- Complete schema with all validation rules
- TypeScript interface definitions
- Query and search functions implemented

### Planned: v1.1.0
- Add remaining 37 Tier 2 and Tier 3 techniques (45 total)
- Populate `combinesWellWith` and `contradictsWithout` relationships
- Enhanced search algorithms

### Planned: v2.0.0
- Admin UI for technique management
- Technique effectiveness tracking
- A/B testing infrastructure
- PostgreSQL migration option

## Usage Examples

See `/lib/ai/meditation-knowledge-base-v2.ts` for integration examples with plan and script generators.

## Copyright & Fair Use

All script excerpts are brief quotes (< 100 words) for educational/research purposes under fair use doctrine. Original academic sources are cited with URLs where available. Practitioner script examples are either:
1. Original creations based on research
2. Brief excerpts properly attributed
3. Synthesized from multiple public domain sources

---

**Maintained by**: Myndset Development Team
**Last Schema Update**: 2026-01-28
**Questions**: See `/docs/CONTRIBUTING.md` for guidance on adding new techniques
