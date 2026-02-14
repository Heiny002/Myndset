# Self-Rally Script Quality Checklist

**Use this checklist to validate every generated script before approval.**

> **Architecture shift (2026-02):** Updated from group-speech validation to Self-Rally Arc criteria. Key change: no "we/us/together" language, pronoun arc required, questionnaire data must be used.

---

## Script Structure Validation

- [ ] Contains all 5 Self-Rally beats (see [five-phase-architecture.md](./five-phase-architecture.md))
- [ ] Beat proportions roughly match targets: Spiral 10-15% / Confrontation 10-15% / Reframe 20-25% / Fuel 20-25% / Lock-In 10-15%
- [ ] Word count within 5% of target (session minutes x 170 WPM)
- [ ] No beat feels significantly longer or shorter than intended

---

## Pronoun Architecture (CRITICAL)

- [ ] Beat 1 (Spiral): First-person adjacent — "I know..." / "That voice..." / "Right now..."
- [ ] Beat 2 (Confrontation): Direct second-person — "You know better" / "Is that who you are?"
- [ ] Beat 3 (Reframe): Second-person intimate — "You are someone who..."
- [ ] Beat 4 (Fuel): Second-person + name (if available) — most intimate
- [ ] Beat 5 (Lock-In): Imperative commands — "Stand up." / "Breathe." / "Go."
- [ ] **ZERO instances** of "we," "us," "together," or collective/tribal language

---

## Good Self-Rally Script

- [ ] Feels like a fierce inner ally speaking directly to ONE person
- [ ] Makes you want to take action NOW
- [ ] Opens by NAMING the listener's specific darkness (not generic urgency)
- [ ] Has a clear confrontation moment — the hinge where doubt becomes fuel
- [ ] Rebuilds identity using the listener's own words (identity statement, values)
- [ ] Contains vivid, sensory imagery specific to their context and visualization style
- [ ] Uses The Callback — Beat 1's fear returns in Beat 4-5, transformed
- [ ] Ends with a PHYSICAL action (not a thought or feeling)
- [ ] Maintains intensity throughout — intimate conviction, not crowd energy
- [ ] Uses present tense for future pacing ("You ARE walking in..." not "You will walk in...")

---

## Questionnaire Data Usage

- [ ] `innerCritic` appears in Beat 1-2 (named in Spiral, confronted in Confrontation)
- [ ] `pastSuccess` woven into Beat 4 as vivid sensory flashback
- [ ] `victoryVision` painted in Beat 4 in present tense
- [ ] `identityStatement` threaded through Beat 3 as core identity
- [ ] `physicalCue` used in Beat 5 as the physical lock-in action
- [ ] `visualizationStyle` guides sensory approach in Beat 4
- [ ] If data isn't available, script still works — but if provided, it MUST be used

---

## Bad Self-Rally Script (Reject If)

- [ ] Uses "we/us/together" language (group-speech leftover)
- [ ] Feels like a coach addressing a team
- [ ] Uses calming language: "allow yourself," "gently notice," "surrender"
- [ ] Has long pauses for contemplation or reflection
- [ ] Opens with generic urgency instead of naming the listener's actual state
- [ ] Skips the confrontation — goes straight from acknowledgment to positivity
- [ ] Uses abstract concepts without concrete sensory details
- [ ] Has vague or multiple action steps at the end
- [ ] Uses passive, soft, or conditional language ("you might," "you can")
- [ ] Ignores questionnaire data that was provided
- [ ] Uses polished anaphora ("We are the ones who...") instead of self-speech devices

---

## Self-Speech Devices Check

- [ ] **Obsessive Repetition**: At least 1 instance of phrase hammered 3+ times with escalating intensity
- [ ] **Antithesis**: At least 1 juxtaposition of weakness/strength in same breath
- [ ] **Rhetorical Question to Self**: At least 1 question the listener asks themselves
- [ ] **Memory Fragment**: At least 1 vivid, specific flash from their past (if pastSuccess provided)
- [ ] **Physical Punctuation**: At least 1 body-command that breaks a mental loop
- [ ] **The Callback**: Fear/doubt from Beat 1 reappears in Beat 4-5, transformed

---

## ElevenLabs Formatting Validation

- [ ] Audio tags use ONLY square brackets: `[excited]`, `[intense]`, `[confident]`, `[determined]`, `[passionate]`
- [ ] Audio tags used sparingly (5-8 times per script maximum)
- [ ] Tags placed at KEY psychological shift moments (beat transitions, emotional peaks)
- [ ] NO old-style markers: `**(build intensity)**` (these get spoken aloud!)
- [ ] NO SSML break tags: `<break time="X.Xs" />` (not supported by eleven_v3)
- [ ] NO ellipses: `...` or `.....` (create inconsistent pauses)
- [ ] Pauses use punctuation only: commas, em-dashes (—), periods, paragraph breaks

---

## Pacing Validation

| Metric | Energizing | Calming (backup) |
|--------|-----------|------------------|
| Words per minute | 160-180 | 140-160 |
| Speaking rate | 1.1x | 0.95x |
| Pause style | Brief (momentum) | Extended (contemplation) |
| ElevenLabs stability | 0.4 (dynamic) | 0.75 (steady) |

---

## Testing Protocol

### Quick Validation (2 minutes)
1. Read the opening — does it name the listener's specific darkness?
2. Search for "we" and "us" — should find ZERO instances
3. Check the confrontation — is there a clear hinge moment?
4. Check the ending — is there a physical action (not just words)?
5. Count word count — within 5% of target?

### Full Validation (5 minutes)
1. Read the complete script aloud at ~170 WPM
2. Verify all 5 beats are present and properly proportioned
3. Track the pronoun arc — does it shift correctly through beats?
4. Verify questionnaire data is woven in (not just mentioned)
5. Check for The Callback — does Beat 1's fear return transformed?
6. Verify ElevenLabs formatting is correct

### Expected User Response
After listening, the user should feel:
- **Seen** — "That's exactly what I was feeling"
- **Confronted** — "Okay, that hit hard"
- **Rebuilt** — "Right, I AM that person"
- **Fired up** — "I can already see it happening"
- **Ready to move** — body wants to act, not sit

If the user feels calm, relaxed, or like they were listening to a generic pep talk, the script missed.

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Script uses "we/us" language | Rewrite with self-speech pronoun arc |
| No clear confrontation moment | Add Beat 2 with antithesis + rhetorical question |
| Generic opening urgency | Replace with specific naming of listener's inner state |
| Questionnaire data ignored | Map each field to its target beat (see architecture doc) |
| Ends with abstract motivation | Replace with physical action sequence |
| No Callback | Reference Beat 1's specific fear in Beat 4, now transformed |
| Pacing too slow | Check word count matches ~170 WPM target |
| Audio tags spoken aloud | Replace `**(markers)**` with `[audio tags]` |

---

## Related Files

- [five-phase-architecture.md](./five-phase-architecture.md) — Self-Rally Arc structure reference
- [script-example.md](./script-example.md) — Annotated 5-minute self-rally example
- [psychology-and-rhetoric.md](./psychology-and-rhetoric.md) — Research foundation
