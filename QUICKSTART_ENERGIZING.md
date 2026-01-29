# Energizing Scripts - Quick Start Guide

## TL;DR

**Myndset now generates HIGH-ENERGY motivational scripts by default.** Think locker room speeches, not bedtime meditations.

## What Changed?

### Before
- Scripts were calming, meditative, relaxing
- Focused on settling, breathing, internal stillness
- Slow pacing with long pauses

### After (Now)
- Scripts are **energizing, motivational, activating**
- Focused on urgency, action, immediate performance
- Fast pacing with brief pauses
- Uses psychological principles from rally speeches

## How to Use

### Generate Energizing Script (Default)
```typescript
import { generateMeditationScript } from '@/lib/ai/script-generator';

const { script, aiResponse } = await generateMeditationScript(plan, questionnaire);
// Automatically generates energizing script
```

### Generate Calming Script (Backup Mode)
```typescript
const { script, aiResponse } = await generateMeditationScript(
  plan,
  questionnaire,
  'calming'  // Explicitly request calming mode
);
```

## Script Output

### Energizing Script Contains:
- ✅ **Urgency markers**: "RIGHT NOW", "THIS MOMENT"
- ✅ **Collective identity**: "We are the ones who..."
- ✅ **Strategic repetition**: 3-4 anaphora sequences
- ✅ **Vivid imagery**: Concrete sensory details
- ✅ **Clear action**: One specific next step
- ✅ **Voice markers**: `**(build intensity)**`, etc.

### Script Structure (5 Phases):
1. **Opening Urgency** (10-15%) - "Right now, in this moment..."
2. **Identity Activation** (20-25%) - "We are the ones who..."
3. **Dissonance Creation** (20-25%) - "But saying isn't doing..."
4. **Vivid Future** (20-25%) - "Picture yourself three hours from now..."
5. **Call to Action** (10-15%) - "When this ends, you're going to..."

## Voice Direction Markers

Scripts include these markers for ElevenLabs:

| Marker | Use Case |
|--------|----------|
| `**(build intensity)**` | Before momentum-building sections |
| `**(confident conviction)**` | Statements of certainty |
| `**(direct challenge)**` | Gap highlighting |
| `**(vivid imagery)**` | Visualization sequences |
| `**(urgent command)**` | Call to action |
| `**(rising energy)**` | Anaphora repetition |

**Processing markers:**
```typescript
// Option 1: Strip markers before TTS
const cleanScript = scriptText.replace(/\*\*\([^)]+\)\*\*/g, '');

// Option 2: Use them to adjust voice settings per segment
```

## ElevenLabs Settings

### Energizing Mode
```json
{
  "stability": 0.4,
  "similarity_boost": 0.75,
  "speaking_rate": "1.1x"
}
```

### Calming Mode
```json
{
  "stability": 0.75,
  "similarity_boost": 0.75,
  "speaking_rate": "0.95x"
}
```

## Database Fields

Scripts are saved with:
```typescript
{
  // ... existing fields
  techniques: {
    script_style: 'energizing' | 'calming',
    eleven_labs_guidance: {
      style: string,
      stability: number,
      similarityBoost: number,
      speakingRate: string,
      emphasis: string[]
    }
  }
}
```

## Quality Check

### ✅ Good Energizing Script:
- Feels like a coach's pep talk
- Makes you want to take action NOW
- Uses "we/us" language heavily
- Has concrete imagery you can visualize
- Ends with crystal-clear next step

### ❌ Bad Energizing Script:
- Feels calming or relaxing
- Uses "allow yourself" or "gently notice"
- Has long pauses for contemplation
- Abstract concepts without concrete details
- Vague or multiple action steps

## Common Issues

**Issue**: Script feels too calm
- ✅ Check that `scriptStyle !== 'calming'`
- ✅ Verify energizing generator is being called
- ✅ Increase ElevenLabs volume on emphasis words

**Issue**: Markers not working
- ✅ Verify regex: `/\*\*\([^)]+\)\*\*/g`
- ✅ Strip markers OR convert to SSML
- ✅ Don't send raw markers to TTS

**Issue**: Wrong pacing
- ✅ Energizing should be ~170 WPM
- ✅ Use 1.1x speaking rate
- ✅ Check pause lengths (brief, not long)

## Example Script Snippet

```
Right now, in this moment, you're making a choice. **(build intensity)**

Not tomorrow. Not later. RIGHT NOW.

We are the ones who show up when it matters. **(rising energy)**
We are the ones who refuse to settle.
We are the ones who turn pressure into performance.

You've been saying you want this. But saying isn't doing. **(direct challenge)**

The gap between those two things? That gap closes RIGHT NOW...

Picture yourself three hours from now. **(vivid imagery)**
You've CRUSHED it. See the look on your face—pure confidence.

When this ends, you stand up, and you attack the next 60 minutes. **(urgent command)**

No hesitation. Pure action.

You've got this. Now GO.
```

## Documentation Files

| File | Purpose |
|------|---------|
| `ENERGIZING_SCRIPTS.md` | Complete documentation |
| `ELEVENLABS_VOICE_GUIDANCE.md` | Audio integration guide |
| `ENERGIZING_SCRIPT_EXAMPLE.md` | Full 5-minute example |
| `IMPLEMENTATION_SUMMARY.md` | Technical summary |
| `ComponentsOfAnEnergizingSpeech.md` | Research foundation |

## Testing

### Quick Test
1. Generate a script (defaults to energizing)
2. Check for urgency language ("RIGHT NOW")
3. Check for collective identity ("we are...")
4. Check for concrete imagery (sensory details)
5. Check for clear action at end

### Expected User Response
- Feels **energized** (not calm)
- Wants to **take action** (not rest)
- Has **clear next step** (not contemplation)
- Experiences **urgency** (not patience)

## Support

- **Technical questions**: Check `IMPLEMENTATION_SUMMARY.md`
- **Voice delivery**: Check `ELEVENLABS_VOICE_GUIDANCE.md`
- **Psychology/research**: Check `ComponentsOfAnEnergizingSpeech.md`
- **Full example**: Check `ENERGIZING_SCRIPT_EXAMPLE.md`

---

## Bottom Line

**Default = Energizing**. This is now the primary mode for Myndset.

Calming mode exists only for users who explicitly need traditional meditation.

The goal: Transform users from passive to **activated**, from hesitant to **committed**, from planning to **executing**.

Not a meditation app. A **performance activation platform**.
