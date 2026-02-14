# Myndset Documentation

Navigation map for all project documentation. Start here to find what you need.

---

## What to Read First

| If you're... | Start with |
|-------------|------------|
| Building or modifying script generation | [Script Generation](#script-generation) |
| Working on audio/voice synthesis | [Voice & Audio](#voice--audio) |
| Adding new psychological techniques | [Techniques](#techniques) |
| Getting oriented with the codebase | [Developer](#developer) |

---

## Script Generation

How Myndset generates high-energy motivational scripts.

| Document | Description |
|----------|-------------|
| [psychology-and-rhetoric.md](./script-generation/psychology-and-rhetoric.md) | Research foundation — 46KB of psychology, neuroscience, and rhetorical analysis behind energizing speeches |
| [five-phase-architecture.md](./script-generation/five-phase-architecture.md) | Canonical reference for the 5-phase script structure (Opening Urgency → Identity Activation → Dissonance Creation → Vivid Future Imagery → Call to Action) |
| [script-example.md](./script-generation/script-example.md) | Full annotated 5-minute energizing script example with metadata |
| [quality-checklist.md](./script-generation/quality-checklist.md) | QA validation checklist for reviewing generated scripts |

---

## Voice & Audio

ElevenLabs integration and voice delivery guidance.

| Document | Description |
|----------|-------------|
| [elevenlabs-guide.md](./voice-audio/elevenlabs-guide.md) | Complete ElevenLabs v3 formatting guide — audio tags, pause control, voice settings, model compatibility |

---

## Techniques

Psychological techniques database — the evidence-based interventions used in meditation scripts.

| Document | Description |
|----------|-------------|
| [overview.md](./techniques/overview.md) | Project overview — current status, stats, tier system, integration guide, roadmap |
| [database-schema.md](./techniques/database-schema.md) | Technical schema documentation — table structure, field types, validation rules, query patterns |
| [research/](./techniques/research/) | 46 detailed research files (~1MB total) — one per technique |

### Research Notes — Tier 1 (Gold Standard)

| File | Technique | Domain | Evidence |
|------|-----------|--------|----------|
| [mental-imagery.md](./techniques/research/mental-imagery.md) | Mental Imagery/Visualization | Sports Performance | Strong |
| [positive-self-talk.md](./techniques/research/positive-self-talk.md) | Positive Self-Talk | Sports Performance | Strong |
| [mastery-experiences.md](./techniques/research/mastery-experiences.md) | Mastery Experiences | Motivational | Strong |
| [psycap-development.md](./techniques/research/psycap-development.md) | PsyCap Development (HERO) | Motivational | Strong |
| [anchoring-nlp.md](./techniques/research/anchoring-nlp.md) | Anchoring (NLP) | NLP | Moderate |
| [circle-of-excellence.md](./techniques/research/circle-of-excellence.md) | Circle of Excellence | NLP | Emerging |
| [post-hypnotic-suggestion.md](./techniques/research/post-hypnotic-suggestion.md) | Post-Hypnotic Suggestion | Hypnosis | Moderate |
| [embedded-commands.md](./techniques/research/embedded-commands.md) | Embedded Commands | Hypnosis | Emerging |

### Research Notes — Tier 2

| File | Technique | Domain | Evidence |
|------|-----------|--------|----------|
| [performance-cues-trigger-words.md](./techniques/research/performance-cues-trigger-words.md) | Performance Cues & Trigger Words | Sports Performance | Strong |
| [centering-technique.md](./techniques/research/centering-technique.md) | Centering Technique | Sports Performance | Strong |
| [arousal-regulation.md](./techniques/research/arousal-regulation.md) | Arousal Regulation | Sports Performance | Strong |
| [resource-anchoring.md](./techniques/research/resource-anchoring.md) | Resource Anchoring | NLP | Emerging |
| [stacking-anchors.md](./techniques/research/stacking-anchors.md) | Stacking Anchors | NLP | Emerging |
| [mental-rehearsal-hypnotic.md](./techniques/research/mental-rehearsal-hypnotic.md) | Mental Rehearsal (Hypnotic) | Hypnosis | Moderate |
| [dave-elman-induction.md](./techniques/research/dave-elman-induction.md) | Dave Elman Induction | Hypnosis | Moderate |
| [pacing-and-leading.md](./techniques/research/pacing-and-leading.md) | Pacing and Leading | Hypnosis | Moderate |

### Research Notes — Tier 3

| File | Technique | Domain | Evidence |
|------|-----------|--------|----------|
| [progressive-muscle-relaxation.md](./techniques/research/progressive-muscle-relaxation.md) | Progressive Muscle Relaxation | Sports Performance | Strong |
| [thought-stopping.md](./techniques/research/thought-stopping.md) | Thought Stopping | Sports Performance | Moderate |
| [cognitive-reframing.md](./techniques/research/cognitive-reframing.md) | Cognitive Reframing | Cognitive | Strong |
| [values-clarification.md](./techniques/research/values-clarification.md) | Values Clarification | Cognitive | Strong |
| [safe-place-visualization.md](./techniques/research/safe-place-visualization.md) | Safe Place Visualization | Hypnosis | Moderate |
| [autogenic-training.md](./techniques/research/autogenic-training.md) | Autogenic Training | Hypnosis | Strong |

### Research Notes — Tier 4

| File | Technique | Domain | Evidence |
|------|-----------|--------|----------|
| [pre-performance-routines.md](./techniques/research/pre-performance-routines.md) | Pre-Performance Routines | Sports Performance | Strong |
| [swish-pattern.md](./techniques/research/swish-pattern.md) | Swish Pattern | NLP | Emerging |
| [new-behavior-generator.md](./techniques/research/new-behavior-generator.md) | New Behavior Generator | NLP | Moderate |
| [perceptual-positions.md](./techniques/research/perceptual-positions.md) | Perceptual Positions | NLP | Moderate |
| [submodalities-work.md](./techniques/research/submodalities-work.md) | Submodalities Work | NLP | Emerging |
| [future-pacing.md](./techniques/research/future-pacing.md) | Future Pacing | NLP | Moderate |
| [progressive-relaxation-induction.md](./techniques/research/progressive-relaxation-induction.md) | Progressive Relaxation Induction | Hypnosis | Moderate |
| [arm-levitation-induction.md](./techniques/research/arm-levitation-induction.md) | Arm Levitation Induction | Hypnosis | Moderate |
| [confusion-technique.md](./techniques/research/confusion-technique.md) | Confusion Technique | Hypnosis | Moderate |
| [naturalistic-trance-induction.md](./techniques/research/naturalistic-trance-induction.md) | Naturalistic Trance Induction | Hypnosis | Moderate |
| [betty-erickson-321.md](./techniques/research/betty-erickson-321.md) | Betty Erickson 3-2-1 | Hypnosis | Moderate |
| [countdown-breathing.md](./techniques/research/countdown-breathing.md) | Countdown Breathing | Hypnosis | Moderate |

### Research Notes — Tier 5

| File | Technique | Domain | Evidence |
|------|-----------|--------|----------|
| [strategy-elicitation.md](./techniques/research/strategy-elicitation.md) | Strategy Elicitation & Installation | NLP | Emerging |
| [fractionation.md](./techniques/research/fractionation.md) | Fractionation | Hypnosis | Moderate |
| [staircase-deepener.md](./techniques/research/staircase-deepener.md) | Staircase Deepener | Hypnosis | Moderate |
| [metaphor-storytelling.md](./techniques/research/metaphor-storytelling.md) | Metaphor & Storytelling | Hypnosis | Moderate |
| [verbal-persuasion.md](./techniques/research/verbal-persuasion.md) | Verbal Persuasion | Motivational | Strong |
| [implementation-intentions.md](./techniques/research/implementation-intentions.md) | Implementation Intentions | Motivational | Strong |
| [mental-contrasting.md](./techniques/research/mental-contrasting.md) | Mental Contrasting (WOOP) | Motivational | Strong |
| [growth-mindset-cultivation.md](./techniques/research/growth-mindset-cultivation.md) | Growth Mindset Cultivation | Motivational | Moderate |
| [attribution-retraining.md](./techniques/research/attribution-retraining.md) | Attribution Retraining | Motivational | Strong |
| [explanatory-style-modification.md](./techniques/research/explanatory-style-modification.md) | Explanatory Style Modification | Motivational | Strong |
| [best-possible-self.md](./techniques/research/best-possible-self.md) | Best Possible Self | Motivational | Strong |
| [meaning-making.md](./techniques/research/meaning-making.md) | Meaning-Making | Cognitive | Strong |

---

## Developer

Implementation guides and technical reference for the Myndset codebase.

| Document | Description |
|----------|-------------|
| [ai-prompts-guide.md](./developer/ai-prompts-guide.md) | Where all Claude system prompts live and how to customize them |
| [implementation-summary.md](./developer/implementation-summary.md) | Energizing script generator implementation details — files, features, testing |
| [redo-feature.md](./developer/redo-feature.md) | Meditation redo/versioning feature — database schema, API routes, admin UI |

---

## Key Code Files

| File | Purpose |
|------|---------|
| `lib/ai/psychological-techniques.ts` | Technique database loader (Supabase + JSON fallback) |
| `lib/ai/psychological-techniques-db.json` | JSON fallback database (46 techniques) |
| `lib/ai/meditation-knowledge-base-v2.ts` | Enhanced selection algorithm and plan generation |
| `lib/ai/energizing-script-generator.ts` | Primary script generator (energizing mode) |
| `lib/ai/script-generator.ts` | Unified router (energizing/calming) |
| `lib/ai/plan-generator.ts` | Questionnaire → meditation plan |
| `lib/ai/voice-synthesis.ts` | ElevenLabs TTS integration |
| `types/database.ts` | Supabase table type definitions |
| `supabase/migrations/007_psychological_techniques.sql` | Techniques table migration |

---

## Files Kept in Root

These files remain in the project root (not in `docs/`):

- `CLAUDE.md` — Claude Code instructions
- `README.md` — Project README
- `QUICK_START_ADMIN.md` — Admin quick start
- `TESTING_CHECKLIST.md` — Testing procedures
- `BROWSER_CACHE_FIX.md` — Browser cache troubleshooting
- `V2_INTEGRATION_COMPLETE.md` — V2 integration status
- `technique-selection.json` — 45 prioritized techniques for future expansion
