# ElevenLabs Voice Guidance - Correct Formatting (Updated 2026-01-28)

## ⚠️ CRITICAL UPDATE: Formatting Fixed

**PROBLEM IDENTIFIED**: Scripts were using `**(build intensity)**` style markers which ElevenLabs **speaks out loud** instead of treating as voice direction.

**SOLUTION**: Use ElevenLabs' approved formatting with square brackets and SSML tags.

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

### 2. SSML Break Tags (Pausing)
Use **SSML break tags** for precise pause control:

```
<break time="0.8s" />   - Brief pause (0.8 seconds)
<break time="1.5s" />   - Short pause (1.5 seconds)
<break time="2.5s" />   - Strategic longer pause (2.5 seconds)
<break time="3.0s" />   - Extended pause (3 seconds max)
```

**Important:**
- Maximum duration: 3 seconds
- Supported by v2/v2.5 models (eleven_turbo_v2_5, eleven_flash_v2)
- **v3 models do NOT support SSML breaks** - use audio tags and punctuation instead

### 3. What NOT to Use

❌ **WRONG** - These will be spoken aloud:
```
**(build intensity)**
**(confident conviction)**
(pause here)
[NOTE: speak slowly]
**build intensity**
```

❌ **WRONG** - Inconsistent pausing:
```
...          (unpredictable pause or may be spoken)
.....        (unpredictable pause or may be spoken)
```

✅ **RIGHT** - Use audio tags and SSML:
```
[intense] Right now, in this moment <break time="1.0s" /> you're making a choice.
```

---

## Examples

### Energizing Script Example (CORRECT FORMAT)
```
Right now, in this moment, you're standing at the edge of greatness. [intense] Not tomorrow. Not next week. RIGHT NOW. <break time="1.0s" /> This practice isn't just another Tuesday afternoon. This is your championship audition.

You know what separates the ones who make it from the ones who don't? [confident] It's not talent. It's not luck. <break time="0.8s" /> It's the willingness to act when every cell in your body wants to hesitate.

[passionate] We're the ones who show up when it matters. We're the ones who refuse to settle. We're the ones who turn pressure into performance.

<break time="2.0s" />

[determined] When this ends, you're going to stand up and attack the next 60 minutes like your life depends on it. No hesitation. No second-guessing. Pure action.
```

### Energizing Script Example (OLD/WRONG FORMAT - DO NOT USE)
```
Right now, in this moment, you're standing at the edge of greatness. **(build intensity)** Not tomorrow. Not next week. RIGHT NOW.... This practice isn't just another Tuesday afternoon.

You know what separates the ones who make it from the ones who don't? **(confident conviction)** It's not talent..... It's the willingness to act.
```

### Calming Script Example (CORRECT FORMAT)
```
[gentle] Take a moment to settle in. <break time="2.0s" /> Allow your body to find comfort in this space. Notice the natural rhythm of your breath. <break time="1.5s" /> There's nowhere else you need to be right now.

[calm] With each exhale, you're releasing what no longer serves you. <break time="2.0s" /> And with each inhale, you're inviting in clarity and peace.

[soothing] You are exactly where you need to be. <break time="3.0s" /> Everything is unfolding as it should.
```

---

## Model Compatibility

| Model | SSML Breaks | Audio Tags | Phoneme Tags |
|-------|-------------|------------|--------------|
| eleven_turbo_v2_5 | ✅ Yes | ✅ Yes | ❌ No |
| eleven_flash_v2 | ✅ Yes | ✅ Yes | ✅ Yes |
| eleven_multilingual_v2 | ✅ Yes | ✅ Yes | ✅ Yes |
| eleven_turbo_v3 | ❌ **NO** | ✅ Yes | ❌ No |

**Myndset is using:** `eleven_turbo_v2_5` (supports both SSML breaks and audio tags)

---

## Voice Settings

### Energizing Mode (Primary/Default)

**Purpose**: High-energy motivational delivery for performance activation

**Voice Settings:**
```json
{
  "style": "energizing_motivational",
  "stability": 0.4,
  "similarity_boost": 0.75,
  "speaking_rate": "1.1x"
}
```

**Characteristics:**
- **Lower stability (0.4)**: Allows dynamic, varied delivery with intensity shifts
- **Higher speaking rate (1.1x)**: Creates urgency and momentum
- **Strong emphasis**: Action words, present-tense commands, repetitive phrases

**Audio Tags to Use:**
- [excited] - For high-energy moments
- [intense] - For building urgency
- [confident] - For declarative statements
- [determined] - For call-to-action
- [passionate] - For emotional crescendos

**Pause Guidelines:**
- Brief pauses: <break time="0.8s" />
- Strategic pauses: <break time="2.0s" />
- Phase transitions: <break time="2.5s" />

---

### Calming Mode (Backup)

**Purpose**: Traditional meditative delivery for relaxation and contemplation

**Voice Settings:**
```json
{
  "style": "calming_meditative",
  "stability": 0.75,
  "similarity_boost": 0.75,
  "speaking_rate": "0.95x"
}
```

**Characteristics:**
- **Higher stability (0.75)**: Calm, steady, consistent delivery
- **Slower speaking rate (0.95x)**: Creates space for contemplation
- **Gentle emphasis**: Soft, soothing tone throughout

**Audio Tags to Use:**
- [gentle] - For soft delivery
- [calm] - For steady, measured tone
- [soothing] - For comforting moments
- [whispers] - For intimate, quiet sections (use very sparingly)

**Pause Guidelines:**
- Short contemplative pauses: <break time="1.5s" />
- Longer reflection pauses: <break time="3.0s" />
- Major transitions: Paragraph breaks + <break time="3.0s" />

---

## Implementation Guide

### Script Pre-Processing (for old scripts)

If you have existing scripts with the old `**(marker)**` format, clean them before sending to ElevenLabs:

```javascript
// Remove old-style markers
const cleanScript = scriptText
  .replace(/\*\*\([^)]+\)\*\*/g, '')  // Remove **(markers)**
  .replace(/\.{3,}/g, '<break time="1.5s" />')  // Convert ellipses to SSML
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

  // Check for ellipses
  if (scriptText.includes('...')) {
    warnings.push('Contains ellipses - use <break time="X.Xs" /> instead');
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
4. `ELEVENLABS_VOICE_GUIDANCE.md` - This documentation (updated)