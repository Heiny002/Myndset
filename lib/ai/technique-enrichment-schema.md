# Technique Enrichment Schema v2.1

## Purpose
This schema defines all new and deepened fields for the psychological techniques database.
Each technique should be enriched to give an AI script generator everything it needs to
implement the technique masterfully in a personalized motivational speech.

## Context: Myndset Use Case
- User is ALONE listening to a generated audio script
- Scripts are personalized motivational speeches (NOT group addresses)
- The mirror speech / self-speech model applies: the listener is being spoken TO as an individual
- Scripts use second-person ("you") primarily, with the user's name woven in
- The goal is ACTIVATION and TRANSFORMATION, not relaxation

---

## EXISTING FIELDS TO DEEPEN

### `languagePatterns` (expand from 6-8 to 15-25 patterns)
Organize into subcategories:
```json
"languagePatterns": {
  "openingHooks": [
    "Pattern that grabs attention and establishes the technique..."
  ],
  "coreProcess": [
    "Patterns used during the main implementation of the technique..."
  ],
  "deepeningIntensifiers": [
    "Patterns that increase emotional/psychological intensity..."
  ],
  "transitionBridges": [
    "Patterns for moving from this technique to the next..."
  ],
  "closingAnchors": [
    "Patterns that lock in the technique's effect..."
  ]
}
```

### `scriptExamples` (expand from 1 to 3-5 examples)
```json
"scriptExamples": [
  {
    "context": "Pre-sales-call activation for business professional",
    "intensity": "high",
    "duration": "90 seconds",
    "excerpt": "Full script excerpt showing this technique in action...",
    "techniquesUsed": ["primary technique + any combined techniques"],
    "pronounStrategy": "second_person_direct"
  },
  {
    "context": "Pre-competition activation for athlete",
    "intensity": "peak",
    "duration": "2 minutes",
    "excerpt": "...",
    "techniquesUsed": [],
    "pronounStrategy": "pronoun_shift_arc"
  }
]
```

### `academicSources` (add 1-2 more where available)
Keep existing, add newer research where it strengthens the evidence.

---

## NEW FIELDS

### `selfSpeechAdaptation`
Metadata for adapting this technique to the self-speech / mirror speech context.
Based on research from Kross (distanced self-talk), Vygotsky (internalized speech),
and the Mirror Speech Anatomy document.

```json
"selfSpeechAdaptation": {
  "pronounStrategy": "second_person_distancing",
  // Options: "first_person_immersed" | "second_person_distancing" | "third_person_detached" | "pronoun_shift_arc"
  // Which pronoun approach works best for this technique when listener is alone

  "mirrorCompatible": true,
  // Whether this technique works in a mirror-scene style delivery

  "internalMonologueStyle": "deliberate_self_talk",
  // Options: "deliberate_self_talk" | "stream_of_consciousness" | "coached_voice" | "inner_commander"
  // What style of internal voice this technique channels

  "confrontationLevel": "moderate",
  // Options: "gentle" | "moderate" | "direct" | "fierce"
  // How confrontational the self-speech can/should be

  "emotionalEntryPoint": "doubt",
  // The emotional state the listener is likely in when this technique begins
  // Examples: "doubt", "fear", "stagnation", "overwhelm", "frustration", "numbness"

  "transformationTarget": "determined_action",
  // The emotional state the listener should reach after this technique
  // Examples: "determined_action", "calm_confidence", "fierce_clarity", "joyful_energy", "quiet_resolve"

  "adaptationNotes": "When delivered to a solo listener, this technique should..."
  // Specific guidance for how to modify group-speech patterns for individual delivery
}
```

### `rhetoricalDevices`
Which rhetorical devices pair best with this technique, with specific application notes.

```json
"rhetoricalDevices": [
  {
    "device": "anaphora",
    "application": "How this specific technique benefits from anaphora",
    "example": "A concrete example using this technique with anaphora"
  },
  {
    "device": "antithesis",
    "application": "...",
    "example": "..."
  }
]
// Common devices: anaphora, antithesis, tricolon, epistrophe, anadiplosis,
// rhetorical_question, metaphor, imperative_commands, pronoun_shift,
// memory_fragment, physical_punctuation, strategic_silence
```

### `userContextExamples`
Specific implementation examples for different user archetypes.

```json
"userContextExamples": {
  "athlete": {
    "scenario": "A specific scenario where an athlete would benefit",
    "scriptExcerpt": "30-60 word excerpt showing the technique in this context",
    "keyAdaptations": "What changes about the technique for athletes"
  },
  "business": {
    "scenario": "...",
    "scriptExcerpt": "...",
    "keyAdaptations": "..."
  },
  "student": {
    "scenario": "...",
    "scriptExcerpt": "...",
    "keyAdaptations": "..."
  },
  "parent": {
    "scenario": "...",
    "scriptExcerpt": "...",
    "keyAdaptations": "..."
  },
  "firstResponder": {
    "scenario": "...",
    "scriptExcerpt": "...",
    "keyAdaptations": "..."
  },
  "creative": {
    "scenario": "...",
    "scriptExcerpt": "...",
    "keyAdaptations": "..."
  }
}
```

### `emotionalArc`
Maps this technique to the darkness-to-light emotional architecture.

```json
"emotionalArc": {
  "startingState": "The emotional state this technique addresses",
  "buildPhase": "How tension/energy builds during the technique",
  "peakMoment": "The climactic moment of transformation",
  "resolutionState": "Where the listener lands emotionally",
  "darknessToLightMapping": "Which beat of the 5-beat self-rally arc this technique maps to"
  // Options: "the_spiral" | "the_confrontation" | "the_reframe" | "the_fuel" | "the_lock_in"
}
```

### `creativeInspirations`
Patterns drawn from creative performance traditions beyond academic psychology.

```json
"creativeInspirations": [
  {
    "source": "spoken_word",
    "insight": "What spoken word/slam poetry teaches about delivering this technique",
    "applicationNote": "How to apply this insight in script generation"
  },
  {
    "source": "military_cadence",
    "insight": "...",
    "applicationNote": "..."
  }
]
// Sources: "spoken_word" | "poetry" | "military_cadence" | "revival_preaching" |
// "athletic_self_talk" | "film_speech" | "music_lyrics" | "theatrical_monologue" |
// "comedy_timing" | "drill_instructor"
```

### `voiceDeliveryNotes`
Specific guidance for how the AI voice (ElevenLabs) should deliver this technique.

```json
"voiceDeliveryNotes": {
  "paceGuidance": "Start slow and measured, accelerate through the core process, pause at the peak moment",
  "toneShifts": ["calm_authority → building_intensity → fierce_conviction → quiet_certainty"],
  "emphasisWords": ["Words that should receive vocal emphasis during this technique"],
  "breathPoints": ["Natural pause/breath locations within the technique"],
  "elevenLabsTags": ["[confident]", "[intense]"]
}
```

### `combinesWellWith` (ENRICHED FORMAT)
```json
"combinesWellWith": [
  {
    "id": "technique_id",
    "name": "Technique Name",
    "synergy": "Why these techniques work well together",
    "sequencePosition": "before",
    // Options: "before" | "after" | "interleaved" | "either"
    // Whether THIS technique should come before or after the combined technique
    "combinedEffect": "What the combination produces that neither achieves alone",
    "transitionLanguage": "Example of how to bridge from one technique to the other"
  }
]
```

---

## ENRICHMENT PRINCIPLES

1. **Write for the AI generator**: Every field should give Claude (the script generator)
   enough context to implement the technique without additional research.

2. **Be specific, not generic**: "Visualize success" is useless. "See yourself walking
   into the boardroom, feeling the cool door handle, hearing your voice project with
   authority" is useful.

3. **Honor the solo listener**: Every pattern, example, and note should assume the
   listener is alone, receiving a personalized speech. No crowd dynamics.

4. **Vary intensity**: Include patterns for different energy levels. Not every technique
   needs to be at peak intensity — some are most powerful when delivered quietly.

5. **Cross-pollinate creatively**: Draw from spoken word, poetry, military cadence,
   revival preaching, film speeches, music — find the creative DNA that makes each
   technique come alive as spoken performance.

6. **Think about transitions**: How does this technique hand off to the next? The
   `transitionBridges` patterns and `combinesWellWith.transitionLanguage` are critical
   for seamless scripts.
