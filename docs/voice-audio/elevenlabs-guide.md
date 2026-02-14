# ElevenLabs Voice Guidance - Correct Formatting (Updated 2026-01-28)

## CRITICAL UPDATE: Now Using Eleven v3 (Updated 2026-01-28)

**PROBLEM IDENTIFIED**:
1. Scripts were using `**(build intensity)**` style markers which ElevenLabs **speaks out loud**
2. Audio tags like `[excited]`, `[intense]` are ONLY supported by eleven_v3 (NOT v2.5)

**SOLUTION**:
- Switched from `eleven_turbo_v2_5` to `eleven_v3` for audio tag support
- Audio tags now work: `[excited]`, `[intense]`, `[confident]`, `[determined]`, `[passionate]`
- **TRADE-OFF**: eleven_v3 does NOT support SSML `<break>` tags - must use punctuation instead

---

## Correct ElevenLabs Formatting

### 1. Audio Tags (Emotional Direction)
Use **square brackets** for emotional cues that are NOT spoken:

```
[excited]     - High-energy, passionate delivery
[intense]     - Building urgency and conviction
[confident]   - Declarative, unwavering statements
[determined]  - Call-to-action moments
[passionate]  - Emotional crescendos
[gentle]      - Soft, soothing tone (for calming scripts)
[whispers]    - Quiet, intimate delivery
[sarcastic]   - Sarcastic tone
[calm]        - Calm, measured delivery
[soothing]    - Comforting, nurturing tone
```

**Usage Guidelines:**
- Use sparingly (5-8 times per script maximum)
- Place at KEY psychological moments only
- Audio tags affect the following phrase/sentence

### 2. Pausing (Using Punctuation)
Use **punctuation** for pause control (eleven_v3 does NOT support SSML break tags):

```
,            - Brief pause (comma)
—            - Short pause (em-dash)
.            - Medium pause (period)
Paragraph    - Longer pause (paragraph break with white space)
```

**Important:**
- **eleven_v3 does NOT support SSML `<break>` tags**
- Use natural punctuation: commas, periods, em-dashes, paragraph breaks
- Sentence structure and paragraph breaks create natural pacing
- DO NOT use SSML tags like `<break time="X.Xs" />` - they will be spoken aloud

### 3. What NOT to Use

**WRONG** - These will be spoken aloud:
```
**(build intensity)**
**(confident conviction)**
(pause here)
[NOTE: speak slowly]
**build intensity**
```

**WRONG** - SSML breaks (not supported):
```
<break time="1.0s" />     (NOT supported by eleven_v3)
...                       (unpredictable pause or may be spoken)
.....                     (unpredictable pause or may be spoken)
```

**RIGHT** - Use audio tags and punctuation:
```
[intense] Right now, in this moment—you're making a choice.
```

---

## Examples

### Energizing Script Example (CORRECT FORMAT - eleven_v3)
```
Right now, in this moment, you're standing at the edge of greatness. [intense] Not tomorrow. Not next week. RIGHT NOW.

This practice isn't just another Tuesday afternoon. This is your championship audition.

You know what separates the ones who make it from the ones who don't? [confident] It's not talent. It's not luck. It's the willingness to act when every cell in your body wants to hesitate.

[passionate] We're the ones who show up when it matters. We're the ones who refuse to settle. We're the ones who turn pressure into performance.

[determined] When this ends, you're going to stand up and attack the next 60 minutes like your life depends on it. No hesitation. No second-guessing. Pure action.
```

### Energizing Script Example (OLD/WRONG FORMAT - DO NOT USE)
```
Right now, in this moment, you're standing at the edge of greatness. **(build intensity)** Not tomorrow. Not next week. RIGHT NOW.... This practice isn't just another Tuesday afternoon.

You know what separates the ones who make it from the ones who don't? **(confident conviction)** It's not talent..... It's the willingness to act.
```

### Calming Script Example (CORRECT FORMAT - eleven_v3)
```
[gentle] Take a moment to settle in. Allow your body to find comfort in this space.

Notice the natural rhythm of your breath. There's nowhere else you need to be right now.

[calm] With each exhale, you're releasing what no longer serves you. And with each inhale, you're inviting in clarity and peace.

[soothing] You are exactly where you need to be. Everything is unfolding as it should.
```

---

## Model Compatibility

| Model | SSML Breaks | Audio Tags | Phoneme Tags |
|-------|-------------|------------|--------------|
| eleven_turbo_v2_5 | Yes | **NO** | No |
| eleven_flash_v2 | Yes | **NO** | Yes |
| eleven_multilingual_v2 | Yes | **NO** | Yes |
| eleven_v3 | **NO** | **YES** | No |

**Myndset is NOW using:** `eleven_v3` (supports audio tags, NOT SSML breaks)

**Key Change:** Audio tags like `[excited]`, `[intense]`, `[confident]` are ONLY available in eleven_v3. We switched from v2.5 to v3 to enable emotional direction through audio tags.

---

## Voice Settings

### IMPORTANT: eleven_v3 Stability Values
Eleven v3 requires stability to be **exactly** one of these values:
- `0.0` = **Creative** (dynamic, varied delivery - best for energizing)
- `0.5` = **Natural** (balanced delivery - best for professional/default)
- `1.0` = **Robust** (consistent, steady delivery - best for calming)

Any other values (like 0.4, 0.65, 0.75) will cause a 400 error.

### Energizing Mode (Primary/Default)

**Purpose**: High-energy motivational delivery for performance activation

**Voice Settings:**
```json
{
  "stability": 0.0,
  "similarity_boost": 0.75,
  "style": 0.25,
  "use_speaker_boost": true
}
```

**Characteristics:**
- **Creative stability (0.0)**: Allows dynamic, varied delivery with intensity shifts
- **Higher style (0.25)**: More expressive and engaging
- **Strong emphasis**: Action words, present-tense commands, repetitive phrases

**Audio Tags to Use:**
- [excited] - For high-energy moments
- [intense] - For building urgency
- [confident] - For declarative statements
- [determined] - For call-to-action
- [passionate] - For emotional crescendos

**Pause Guidelines:**
- Brief pauses: Use commas (,) or em-dashes (-)
- Strategic pauses: Use periods (.)
- Phase transitions: Use paragraph breaks with white space

#### Legacy Energizing Voice Settings (Pre-v3, Deprecated)

The following settings were used prior to the eleven_v3 migration and are preserved for reference only. These relied on the old `**(marker)**` format which is no longer supported:

- **Stability**: 0.4 (lower for dynamic, intense delivery)
- **Similarity Boost**: 0.75 (maintain character with intensity)
- **Speaking Rate**: 1.1x (10% faster for urgency)
- **Emphasis**: Strong emphasis on action words and present-tense commands

> **Note**: The stability value of `0.4` is not valid for eleven_v3 (which only accepts `0.0`, `0.5`, or `1.0`). The current production setting uses `0.0` (Creative) for energizing mode. The speaking rate parameter is not applicable to eleven_v3 API calls.

---

### Calming Mode (Backup)

**Purpose**: Traditional meditative delivery for relaxation and contemplation

**Voice Settings:**
```json
{
  "stability": 1.0,
  "similarity_boost": 0.75,
  "style": 0.0,
  "use_speaker_boost": true
}
```

**Characteristics:**
- **Robust stability (1.0)**: Calm, steady, consistent delivery
- **Lower style (0.0)**: Gentle, even tone throughout
- **Gentle emphasis**: Soft, soothing tone throughout

**Audio Tags to Use:**
- [gentle] - For soft delivery
- [calm] - For steady, measured tone
- [soothing] - For comforting moments
- [whispers] - For intimate, quiet sections (use very sparingly)

**Pause Guidelines:**
- Short contemplative pauses: Use periods (.) and commas (,)
- Longer reflection pauses: Use paragraph breaks
- Major transitions: Use paragraph breaks with white space

---

## Implementation Guide

### Script Pre-Processing (for old scripts)

If you have existing scripts with the old `**(marker)**` format or SSML breaks, clean them before sending to ElevenLabs:

```javascript
// Remove old-style markers and SSML breaks
const cleanScript = scriptText
  .replace(/\*\*\([^)]+\)\*\*/g, '')  // Remove **(markers)**
  .replace(/<break\s+time="[^"]+"\s*\/>/g, '')  // Remove SSML breaks (not supported by v3)
  .replace(/\.{3,}/g, '.')  // Convert ellipses to periods
  .trim();
```

### Validation

Before sending to ElevenLabs, validate:

```javascript
function validateScript(scriptText) {
  const warnings = [];

  // Check for old-style markers
  if (scriptText.match(/\*\*\([^)]+\)\*\*/)) {
    warnings.push('Contains **(markers)** that will be SPOKEN ALOUD');
  }

  // Check for SSML break tags (not supported by eleven_v3)
  if (scriptText.match(/<break\s+time="[^"]+"\s*\/>/)) {
    warnings.push('Contains SSML <break> tags - eleven_v3 does NOT support them');
  }

  // Check for ellipses
  if (scriptText.includes('...')) {
    warnings.push('Contains ellipses - use periods and commas instead');
  }

  // Check for excessive audio tags
  const audioTags = scriptText.match(/\[[a-z]+\]/gi) || [];
  if (audioTags.length > 10) {
    warnings.push(`Found ${audioTags.length} audio tags - consider using fewer (5-8 max)`);
  }

  return warnings;
}
```

---

## Migration Checklist

To update existing Myndset scripts:

- [x] Updated `lib/ai/energizing-script-generator.ts` with correct format
- [x] Updated `lib/ai/script-generator.ts` (calming mode) with correct format
- [x] Updated `lib/ai/voice-synthesis.ts` with validation warnings
- [ ] Regenerate all existing scripts with new formatting
- [ ] Test audio output with ElevenLabs API
- [ ] Update admin UI to show formatting warnings

---

## References

- [ElevenLabs Text-to-Speech Best Practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
- ElevenLabs model documentation for v2.5 features

---

## Files Updated

1. `lib/ai/energizing-script-generator.ts` - Core energizing script generation
2. `lib/ai/script-generator.ts` - Calming script generation
3. `lib/ai/voice-synthesis.ts` - Voice synthesis with validation
4. `ELEVENLABS_VOICE_GUIDANCE.md` - Original documentation (superseded by this guide)
