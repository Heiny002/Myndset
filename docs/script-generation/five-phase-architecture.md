# Self-Rally Arc: 5-Beat Script Architecture

**Canonical reference for Myndset's energizing script structure.**
This is the single source of truth for the 5-beat model used across script generators, prompts, and QA checklists.

> **Architecture shift (2026-02):** Replaced group-speech 5-phase model with Self-Rally Arc. Myndset users listen ALONE — the architecture now follows mirror-speech psychology (see [psychology-and-rhetoric.md](./psychology-and-rhetoric.md) and [MirrorSpeechAnatomy.md](../../MirrorSpeechAnatomy.md)).

---

## Overview

Every energizing script follows a 5-beat Self-Rally Arc derived from research on self-speech psychology, mirror scenes in film, and the neurochemistry of internal motivation. The arc is designed for a single person listening alone — not a crowd, not a team.

The core principle: **A group motivational speech says "You are not alone, and together we are powerful." A self-rally speech says "I am alone, and I must become enough."**

---

## The Five Beats

### Beat 1: THE SPIRAL (10-15% of script)

**Purpose:** Enter the listener's actual darkness. Name what they're feeling before they can.

- Describe their internal state as if reading their mind
- Raw acknowledgment of the specific fear, doubt, or spiral
- Pattern interruption through radical honesty
- The listener must feel genuinely SEEN before they'll trust the turn

**Pronoun:** First-person adjacent — "I know what's happening right now..." / "That voice saying..." / "Right now, there's a part of you..."
**Neurochemical:** Cortisol (captures attention through recognition)
**Word allocation:** ~12% of total target words

---

### Beat 2: THE CONFRONTATION (10-15% of script)

**Purpose:** Break the spiral. Call out the lie. Force a choice.

- Antithesis: juxtapose who they ARE vs. how they're ACTING
- Rhetorical questions to self: "Is THIS who you are?"
- The uncomfortable truth delivered with love
- This is the hinge — the moment doubt becomes fuel

**Pronoun:** Shift to direct second-person — "You know better than this." / "Is that who you are?"
**Neurochemical:** Cortisol peak → turn (the pattern-break moment)
**Word allocation:** ~12% of total target words

---

### Beat 3: THE REFRAME (20-25% of script)

**Purpose:** Cognitive restructuring. Rebuild identity from the ashes of the confrontation.

- Identity reframing using the listener's own words (identity statement, values)
- Evidence stacking: past wins as proof of capability
- Connect current challenge to core values
- Thread intrinsic motivation: Autonomy ("YOUR choice"), Mastery ("you earned this"), Purpose ("who you are")

**Pronoun:** Second-person intimate — "You are someone who..." / weave their identity statement
**Neurochemical:** Oxytocin (trust, bonding with new self-concept)
**Word allocation:** ~23% of total target words

---

### Beat 4: THE FUEL (20-25% of script)

**Purpose:** Vivid sensory peak. The "goosebump moment." Paint their victory so real they taste it.

- Sensory-rich visualization matched to their visualization style (visual/feeling/words/mixed)
- Obsessive repetition building to crescendo
- Memory fragments from their past success
- Future pacing in present tense — make the future feel like a memory they're recalling
- The Callback: reference Beat 1's fear, now transformed into fuel

**Pronoun:** Second-person + name if available — most intimate, most vivid
**Neurochemical:** Dopamine (reward anticipation, peak emotional payoff)
**Word allocation:** ~23% of total target words

---

### Beat 5: THE LOCK-IN (10-15% of script)

**Purpose:** Crystallize decision into physical action. The body remembers what the mind forgets.

- Physical cue activation (their chosen cue: breath, fist clench, posture, etc.)
- Single clear action — ONE thing they do, not think
- Countdown or trigger moment
- The "promise to self" — if they provided one, use it
- End with something they DO, not something they feel

**Pronoun:** Imperative commands — direct, short, undeniable. "Stand up." / "Take that breath." / "Go."
**Neurochemical:** Norepinephrine (action readiness, commitment)
**Word allocation:** ~12% of total target words

---

## Pronoun Architecture (CRITICAL)

The pronoun arc IS the emotional arc. Never break it.

| Beat | Pronoun Mode | Example |
|------|-------------|---------|
| The Spiral | First-person adjacent | "I know that voice. I know what it's saying right now." |
| The Confrontation | Direct second-person | "You know better. Is that who you are?" |
| The Reframe | Second-person intimate | "You are someone who fights. You've proven that." |
| The Fuel | Second-person + name | "You walk in there and they see someone unstoppable." |
| The Lock-In | Imperative | "Stand up. Breathe. Go." |

**NEVER use:** "we," "us," "together," or any collective/tribal language. The listener is alone.

---

## Duration Scaling

| Session Length | Total Words (170 WPM) | Spiral | Confrontation | Reframe | Fuel | Lock-In |
|---------------|----------------------|--------|---------------|---------|------|---------|
| 1 min (ultra) | ~170 words | ~20 | ~25 | ~40 | ~45 | ~30 |
| 3 min (quick) | ~510 words | ~60 | ~60 | ~115 | ~115 | ~60 |
| 6 min (standard) | ~1020 words | ~120 | ~120 | ~235 | ~235 | ~120 |
| 12 min (deep) | ~2040 words | ~245 | ~245 | ~470 | ~470 | ~245 |

**Speaking pace:** 160-180 words per minute (activation pace, not meditation pace).

---

## Ultra-Quick Adaptation (1 minute)

Compress all 5 beats into rapid-fire delivery:

1. **The Spiral** (~20 words): Name their darkness NOW — no warm-up
2. **The Confrontation** (~25 words): Break the lie, force the choice
3. **The Reframe** (~40 words): Rebuild identity with their own words
4. **The Fuel** (~45 words): Paint the win — vivid, inevitable
5. **The Lock-In** (~30 words): ONE physical action, zero ambiguity

No transitions. Start at maximum intensity. Every word counts.

---

## Questionnaire Data → Beat Mapping

The questionnaire captures deeply personal data. Each field maps to a specific beat:

| Questionnaire Field | Maps To Beat | How To Use |
|-------------------|-------------|------------|
| `innerCritic` | Spiral + Confrontation | Name this voice in Beat 1, confront it in Beat 2 |
| `mentalState` | Spiral | Contextualize the opening darkness |
| `stakes` | Spiral + Confrontation | Amplify urgency |
| `identityStatement` | Reframe | Weave as core identity rebuild |
| `pastSuccess` | Fuel | Vivid sensory flashback |
| `victoryVision` | Fuel | Paint this scene, present tense |
| `visualizationStyle` | Fuel | Guide sensory approach (visual/feeling/words) |
| `motivationSource` | Reframe + Fuel | Thread through identity and visualization |
| `physicalCue` | Lock-In | End with this physical action |
| `accountability` | Lock-In | The promise to self |

---

## Related Files

- [psychology-and-rhetoric.md](./psychology-and-rhetoric.md) — Research foundation (self-speech psychology)
- [script-example.md](./script-example.md) — Annotated 5-minute self-rally example
- [quality-checklist.md](./quality-checklist.md) — QA validation criteria
- [MirrorSpeechAnatomy.md](../../MirrorSpeechAnatomy.md) — Original mirror-speech research
