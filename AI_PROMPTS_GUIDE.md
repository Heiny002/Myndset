# Anthropic API System Prompts Guide

This document shows you where all the Claude (Anthropic API) system prompts are located and how to customize them.

## Overview

Myndset uses Claude (Anthropic API) at **3 key stages**:

1. **Plan Generation** - Questionnaire → Meditation Plan
2. **Script Generation** - Plan → Full Meditation Script
3. **Section Remix** - User requests script modifications

---

## 1. Plan Generation Prompt

**File:** `lib/ai/plan-generator.ts`

**Function:** `generateMeditationPlanFromQuestionnaire()`

**What it does:** Takes user's questionnaire responses and generates a meditation plan with:
- Meditation components (breathing, visualization, etc.)
- Session structure (intro, main practice, closing)
- Messaging framework (tone, language, approach)
- Overall rationale

**Key sections to edit:**

```typescript
// Line ~50-100: The main system prompt
const systemPrompt = `You are an expert meditation designer...`;

// Line ~120-180: The structured prompt with questionnaire data
const prompt = `Create a meditation plan based on:
Goal: ${questionnaire.primaryGoal}
Challenge: ${questionnaire.currentChallenge}
...`;
```

**Customization tips:**
- Change meditation components offered (add sound baths, mantra, etc.)
- Adjust tone (more/less formal, more/less spiritual)
- Add new selection criteria based on questionnaire
- Modify session structure format

---

## 2. Script Generation Prompt

**File:** `lib/ai/script-generator.ts`

**Function:** `generateMeditationScript()`

**What it does:** Takes the approved plan and generates full 2000-3000 word meditation script

**Key sections to edit:**

```typescript
// Line ~40-90: Main system prompt
const systemPrompt = `You are a world-class meditation script writer...`;

// Line ~100-200: Script structure instructions
const prompt = `Write a complete meditation script with:
- Welcoming introduction
- Guided practice following this structure:
  ${sessionStructure}
- Components to include:
  ${components}
...`;
```

**Customization tips:**
- Adjust script length (currently 2000-3000 words)
- Change narrative voice (first person, second person)
- Add/remove script sections
- Modify pacing instructions
- Change language complexity level

**Word count guidance:**
- 10 minutes ≈ 1800-2200 words
- 15 minutes ≈ 2700-3300 words
- 20 minutes ≈ 3600-4400 words

---

## 3. Section Remix Prompt

**File:** `lib/ai/section-remix.ts`

**Function:** `remixScriptSection()`

**What it does:** User selects a section and requests changes (make it shorter, change metaphor, etc.)

**Key sections to edit:**

```typescript
// Line ~30-70: System prompt for remixing
const systemPrompt = `You are an expert at refining meditation scripts...`;

// Line ~80-120: Remix instructions
const prompt = `Original section:
${sectionToRemix}

User's requested changes:
${remixInstructions}

Rewrite this section incorporating the changes...`;
```

**Customization tips:**
- Add constraints (max length, maintain keywords)
- Change how aggressively it interprets user feedback
- Add validation for certain types of changes
- Preserve specific phrases or structures

---

## 4. Shared Knowledge Base

**File:** `lib/ai/meditation-knowledge-base.ts`

**What it does:** Provides reference information about meditation techniques that all prompts can use

**Contents:**
- Technique descriptions (box breathing, body scan, etc.)
- Evidence-based benefits
- Contraindications and best practices
- Performance-oriented framing

**How to use:** Import into your prompt files:
```typescript
import { MEDITATION_TECHNIQUES } from './meditation-knowledge-base';

// Include in prompt
const prompt = `Available techniques:
${MEDITATION_TECHNIQUES}

Create a plan using these...`;
```

---

## Prompt Engineering Best Practices

### 1. Be Specific About Output Format
```typescript
// Good
const prompt = `Generate a JSON object with:
{
  "components": ["component1", "component2"],
  "sessionStructure": {...},
  "messagingFramework": {...}
}`;

// Bad
const prompt = `Create a meditation plan`;
```

### 2. Provide Clear Constraints
```typescript
// Good
const prompt = `Write a meditation script:
- Length: 2000-2200 words
- Tone: Direct, non-spiritual
- No metaphors about nature or chakras`;

// Bad
const prompt = `Write a meditation`;
```

### 3. Use Examples (Few-Shot Learning)
```typescript
const prompt = `Example of good messaging:
"This practice will sharpen your focus for the boardroom"

Example of bad messaging:
"Connect with your inner divine light"

Now write a script following the good example...`;
```

### 4. Reference User Context
```typescript
// Use questionnaire data
const prompt = `User is a ${questionnaire.performanceContext}
Skepticism level: ${questionnaire.skepticismLevel}/5
Experience: ${questionnaire.experienceLevel}

Tailor the script to this user...`;
```

---

## Testing Your Changes

### 1. Quick Test (Console)
```typescript
// Add to your prompt file
console.log('PROMPT BEING SENT:', prompt);

// Run and check logs
npm run dev
# Visit admin, generate plan
# Check terminal for full prompt
```

### 2. Test with Dummy Data
```bash
# Create test questionnaire
npx tsx scripts/seed-test-data.ts

# Generate plan through admin UI
# Review output quality
```

### 3. A/B Test Prompts
```typescript
// Save original prompt
const originalPrompt = `...`;

// Try new version
const newPrompt = `...`;

// Use based on feature flag
const prompt = process.env.USE_NEW_PROMPT === 'true'
  ? newPrompt
  : originalPrompt;
```

---

## Common Customizations

### Make Scripts More Concise
```typescript
// In script-generator.ts
const prompt = `Write a meditation script:
- Length: 1500-1800 words (shorter than usual)
- Direct, punchy sentences
- Remove all filler words
...`;
```

### Add Business-Specific Language
```typescript
// In plan-generator.ts
const systemPrompt = `You are an expert meditation designer
specializing in Fortune 500 executives and venture capitalists.

Use language from:
- McKinsey reports
- Harvard Business Review
- Startup culture

Avoid:
- New age terminology
- Spiritual references
- Wellness industry jargon`;
```

### Increase Athletic Focus
```typescript
// In meditation-knowledge-base.ts
export const ATHLETIC_TECHNIQUES = `
- Pre-game visualization (5 min)
- Competition anxiety management (3 min)
- Flow state activation (7 min)
- Post-performance recovery (5 min)
`;

// Reference in prompts
const prompt = `User is an athlete.
Use these athletic-specific techniques:
${ATHLETIC_TECHNIQUES}`;
```

---

## Model Configuration

**File:** `lib/ai/claude.ts`

**Current model:** `claude-3-5-sonnet-20241022`

**To change model:**
```typescript
// Line ~15
const model = 'claude-3-5-sonnet-20241022'; // Current
// Options:
// - 'claude-3-5-sonnet-20241022' (Best quality, recommended)
// - 'claude-3-haiku-20240307' (Faster, cheaper)
// - 'claude-opus-4-20250514' (Highest quality, slower)
```

**Parameters:**
```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,        // Increase for longer scripts
  temperature: 0.7,        // 0.0 = deterministic, 1.0 = creative
  system: systemPrompt,    // Your instructions
  messages: [...]
});
```

---

## Prompt Files Quick Reference

| File | Purpose | Key Function |
|------|---------|--------------|
| `lib/ai/plan-generator.ts` | Questionnaire → Plan | `generateMeditationPlanFromQuestionnaire()` |
| `lib/ai/script-generator.ts` | Plan → Full Script | `generateMeditationScript()` |
| `lib/ai/section-remix.ts` | Modify script sections | `remixScriptSection()` |
| `lib/ai/meditation-knowledge-base.ts` | Technique reference | `MEDITATION_TECHNIQUES` |
| `lib/ai/claude.ts` | API client setup | `callClaude()` |

---

## Need Help?

**To see actual prompts being used:**
1. Add `console.log()` in the prompt file
2. Run `npm run dev`
3. Trigger generation through admin UI
4. Check terminal output

**To test changes quickly:**
1. Modify prompt file
2. Restart dev server
3. Use dummy questionnaires (see `scripts/seed-test-data.ts`)
4. Compare outputs

**To version control prompts:**
```bash
# Before making changes
git diff lib/ai/plan-generator.ts

# Save a version
cp lib/ai/plan-generator.ts lib/ai/plan-generator.ts.backup
```
