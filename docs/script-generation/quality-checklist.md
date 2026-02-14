# Energizing Script Quality Checklist

**Use this checklist to validate every generated energizing script before approval.**

---

## Script Structure Validation

- [ ] Contains all 5 psychological phases (see [five-phase-architecture.md](./five-phase-architecture.md))
- [ ] Phase proportions roughly match targets (10-15% / 20-25% / 20-25% / 20-25% / 10-15%)
- [ ] Word count within 5% of target (session minutes x 170 WPM)
- [ ] No section feels significantly longer or shorter than intended

---

## Good Energizing Script

- [ ] Feels like a coach's pep talk, not a bedtime meditation
- [ ] Makes you want to take action NOW
- [ ] Uses "we/us/together" language heavily (identity activation)
- [ ] Has concrete, sensory imagery you can visualize (not abstract concepts)
- [ ] Ends with ONE crystal-clear next step
- [ ] Maintains high energy throughout (no energy dips)
- [ ] Uses present tense ("You ARE ready", not "You will be ready")
- [ ] Contains 3+ anaphora sequences (strategic repetition)
- [ ] Includes brief vulnerability before pivoting to conviction

---

## Bad Energizing Script (Reject If)

- [ ] Feels calming, relaxing, or contemplative
- [ ] Uses calming language: "allow yourself", "gently notice", "surrender"
- [ ] Has long pauses for contemplation or reflection
- [ ] Uses abstract concepts without concrete sensory details
- [ ] Has vague or multiple action steps at the end
- [ ] Uses passive, soft, or conditional language ("you might", "you can")
- [ ] Repeats exact phrases/structures across different meditations (template feel)
- [ ] Uses generic imagery not specific to the user's context

---

## ElevenLabs Formatting Validation

- [ ] Audio tags use ONLY square brackets: `[excited]`, `[intense]`, `[confident]`, `[determined]`, `[passionate]`
- [ ] Audio tags used sparingly (5-8 times per script maximum)
- [ ] NO old-style markers: `**(build intensity)**` (these get spoken aloud!)
- [ ] NO SSML break tags: `<break time="X.Xs" />` (not supported by eleven_v3)
- [ ] NO ellipses: `...` or `.....` (create inconsistent pauses)
- [ ] Pauses use punctuation only: commas, em-dashes, periods, paragraph breaks

---

## Pacing Validation

| Metric | Energizing | Calming (backup) |
|--------|-----------|------------------|
| Words per minute | 160-180 | 140-160 |
| Speaking rate | 1.1x | 0.95x |
| Pause style | Brief (momentum) | Extended (contemplation) |
| ElevenLabs stability | 0.0 (Creative) | 1.0 (Robust) |

---

## Testing Protocol

### Quick Validation (2 minutes)
1. Read the opening — does it create urgency immediately?
2. Search for "we" and "us" — does collective language appear in Phase 2?
3. Check the ending — is there ONE clear, specific action?
4. Count word count — within 5% of target?

### Full Validation (5 minutes)
1. Read the complete script aloud at ~170 WPM
2. Verify all 5 phases are present and properly proportioned
3. Check imagery is specific to user's context (not generic)
4. Verify ElevenLabs formatting is correct
5. Confirm script doesn't repeat structures from recent meditations

### Expected User Response
After listening, the user should feel:
- **Energized** (not calm or relaxed)
- **Ready to act** (not contemplative)
- **Clear on next step** (not overwhelmed with options)
- **Urgent** (not patient or at peace)

If the user feels calm or relaxed, the script needs more intensity.

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Script feels too calm | Verify energizing generator is being called, not calming |
| Pacing too slow | Check word count matches ~170 WPM target |
| Markers spoken aloud | Replace `**(markers)**` with `[audio tags]` |
| No urgency | Strengthen Phase 1 opening with temporal immediacy |
| Generic imagery | Rewrite Phase 4 with user-specific sensory details |
| Multiple action steps | Reduce Phase 5 to ONE singular next step |

---

## Related Files

- [five-phase-architecture.md](./five-phase-architecture.md) — Phase structure reference
- [script-example.md](./script-example.md) — Annotated 5-minute example
- [psychology-and-rhetoric.md](./psychology-and-rhetoric.md) — Research foundation
- [../voice-audio/elevenlabs-guide.md](../voice-audio/elevenlabs-guide.md) — Voice formatting guide
