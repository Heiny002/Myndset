# Energizing Script System

## Overview

Myndset now features **two script generation modes**:

1. **Energizing (PRIMARY MODE)** - High-energy motivational scripts for activation and immediate action
2. **Calming (BACKUP MODE)** - Traditional meditative scripts for relaxation and contemplation

By default, all scripts are generated in **energizing mode** unless explicitly requested otherwise.

## Energizing Mode (Default)

### Purpose
Transform meditation from passive relaxation into **active performance activation**. These are not calming meditations—they are motivational speeches designed to create immediate action.

### Inspiration
Based on comprehensive research documented in `ComponentsOfAnEnergizingSpeech.md`, drawing from:
- Locker room halftime speeches
- Political rally speeches before Election Day
- Pre-competition activation sessions
- Motivational speeches that create immediate action

### Key Characteristics

#### 1. **Faster Pacing**
- **160-180 words/minute** (vs 140-160 for calming)
- Shorter pauses to maintain momentum
- Higher speaking rate (1.1x speed) for urgency

#### 2. **Psychological Architecture**
The energizing script follows a proven 5-phase structure:

**Phase 1: Opening Urgency (10-15%)**
- Establish temporal immediacy ("Right now", "This moment")
- Create honest acknowledgment of stakes
- Brief vulnerability for authenticity

**Phase 2: Identity Activation (20-25%)**
- Heavy use of "we/us/together" language
- Establish collective identity
- Create unquestioning affiliation

**Phase 3: Dissonance Creation (20-25%)**
- Highlight gap between claimed identity and current performance
- Remove external justifications
- Make inconsistency psychologically uncomfortable

**Phase 4: Vivid Future Imagery (20-25%)**
- Concrete, first-person mental rehearsal
- Multi-sensory success visualization
- Present tense for imminent outcomes

**Phase 5: Call to Action (10-15%)**
- One specific, immediate, achievable behavior
- Remove all ambiguity
- End with powerful conviction

#### 3. **Rhetorical Devices**

**Strategic Repetition (Anaphora)**
```
We're going to show them what we're made of...
We're going to outlast them when they're ready to quit...
We're going to turn pressure into performance...
```

**Concrete Imagery**
- Sensory details (visual, kinesthetic, auditory)
- First-person perspective
- Specific scenarios, not abstract concepts

**Simplicity**
- 1-3 core themes maximum
- Crystal-clear messaging
- No complex explanations

**Vulnerability → Conviction**
- Brief acknowledgment of difficulty
- Immediate pivot to capability

#### 4. **ElevenLabs Voice Guidance**

The energizing scripts include embedded markers for intense delivery:

- `**(build intensity)**` - Momentum-building sections
- `**(confident conviction)**` - Statements of certainty
- `**(direct challenge)**` - Dissonance/gap-highlighting
- `**(vivid imagery)**` - Visualization sections
- `**(urgent command)**` - Call-to-action
- `**(rising energy)**` - Anaphora/repetition sequences

**Voice Settings:**
- **Stability**: 0.4 (lower for dynamic, intense delivery)
- **Similarity Boost**: 0.75 (maintain character with intensity)
- **Speaking Rate**: 1.1x (10% faster for urgency)
- **Emphasis**: Strong emphasis on action words and present-tense commands

### Example Energizing Opening

```
Right now, in this moment, you're making a choice. **(build intensity)**

Not tomorrow. Not later. RIGHT NOW.

And here's what we know about people like us... **(confident conviction)**
We show up when it matters. We refuse to settle. We turn pressure into fuel.

But let me ask you something... **(direct challenge)**
You've been saying you want this. You've been planning, preparing, waiting for the right moment.

The right moment? It's THIS moment.
```

## Calming Mode (Backup)

### Purpose
For users who specifically need traditional meditative, contemplative sessions focused on relaxation and inner stillness.

### When to Use
- Explicitly requested by user
- Sleep preparation
- Deep relaxation needs
- Trauma-sensitive contexts

### Key Characteristics
- **140-160 words/minute** (slower pacing)
- Longer pauses for contemplation
- Gentler language ("allow yourself", "notice")
- Internal focus rather than action orientation
- **Voice Settings:**
  - Stability: 0.75 (higher for calm, steady delivery)
  - Speaking Rate: 0.95x (slightly slower)
  - Emphasis: Gentle, soothing tone

## Implementation

### File Structure

```
lib/ai/
├── script-generator.ts              # Unified router (delegates to specific generators)
├── energizing-script-generator.ts   # PRIMARY: High-energy motivational scripts
└── [existing files remain]
```

### Usage

```typescript
import { generateMeditationScript } from '@/lib/ai/script-generator';

// Default: Energizing mode
const { script, aiResponse } = await generateMeditationScript(plan, questionnaire);

// Explicit: Calming mode
const { script, aiResponse } = await generateMeditationScript(
  plan,
  questionnaire,
  'calming'
);
```

### Database Schema

Scripts now store additional metadata:

```typescript
{
  // ... existing fields
  scriptStyle: 'energizing' | 'calming',
  elevenLabsGuidance: {
    style: string,
    stability: number,
    similarityBoost: number,
    speakingRate: string,
    emphasis: string[]
  }
}
```

## Science Behind Energizing Speeches

The energizing mode is grounded in neuroscience and psychology research:

### Neurochemical Activation
- **Urgency triggers dopamine/adrenaline** release in prefrontal cortex
- **Temporal immediacy** overrides cognitive control for immediate action
- **Arousal amplifies** processing of high-priority stimuli

### Cognitive Mechanisms
- **Cognitive dissonance** creates uncomfortable gap demanding resolution
- **Social identity activation** harnesses group motivation
- **Concrete imagery** allows mental rehearsal of success

### Emotional Dynamics
- **Fear + clear action path** = mobilization (not paralysis)
- **Anger at obstacles** = action motivation
- **Pride and hope** = persistence and effort

For full research details, see: `ComponentsOfAnEnergizingSpeech.md`

## Testing & Validation

### Expected Outcomes

**Energizing Scripts Should:**
- ✅ Use present tense and urgent language throughout
- ✅ Include 3-4 anaphora repetition sequences
- ✅ Create vivid, first-person imagery
- ✅ End with one specific, immediate action
- ✅ Maintain high energy (no long pauses)
- ✅ Use "we/us" language heavily
- ✅ Include ElevenLabs intensity markers

**Energizing Scripts Should NOT:**
- ❌ Use calming phrases like "allow yourself" or "gently notice"
- ❌ Have long contemplative pauses
- ❌ Be abstract or vague
- ❌ Focus on relaxation or settling
- ❌ Give multiple action steps (keep singular focus)

### Manual Review Checklist

When reviewing generated energizing scripts:

1. **Energy Level**: Does it feel activating, not calming?
2. **Urgency**: Is temporal immediacy established early?
3. **Identity**: Heavy use of collective "we/us" language?
4. **Concrete**: Specific imagery vs abstract concepts?
5. **Action**: Clear, singular call to action at end?
6. **Pacing**: ~170 words/min, shorter pauses?
7. **Markers**: ElevenLabs guidance markers included?

## Migration Notes

### Existing Scripts
- All existing scripts default to `scriptStyle: 'energizing'`
- Can be regenerated in calming mode if needed
- Database field is nullable (backward compatible)

### API Changes
- `generateMeditationScript()` now accepts optional `scriptStyle` parameter
- Default is `'energizing'` unless explicitly overridden
- No breaking changes to existing API calls

## Future Enhancements

### Potential Additions
1. **Hybrid Mode**: Blend calming and energizing elements
2. **Intensity Levels**: Energizing-light, energizing-medium, energizing-intense
3. **Context Detection**: Auto-select mode based on time of day, user state
4. **Voice Cloning**: Train on actual motivational speakers
5. **A/B Testing**: Compare user outcomes between modes

## References

- `ComponentsOfAnEnergizingSpeech.md` - Full research on energizing speech psychology
- `lib/ai/energizing-script-generator.ts` - Implementation details
- `lib/ai/script-generator.ts` - Router logic and unified interface
