/**
 * Meditation Plan Generator
 *
 * Step 1 of the two-step AI generation workflow.
 * Analyzes user questionnaire responses and generates a structured meditation plan
 * that requires admin approval before proceeding to script generation.
 */

import { generateText, ClaudeResponse } from './claude';
import {
  generateMeditationPlan,
  UserProfile,
  MeditationComponent,
  SessionStructure,
  MessagingFramework,
} from './meditation-knowledge-base';

export interface QuestionnaireResponse {
  id: string;
  userId: string;
  primaryGoal: string;
  currentChallenge: string;
  sessionLength: 'quick' | 'standard' | 'deep';
  experienceLevel: string;
  skepticismLevel: number;
  performanceContext: string;
  preferredTime: string;
  specificOutcome?: string;
  tier: number;
  responses?: Record<string, unknown>;
  createdAt: string;
}

export interface MeditationPlanComponent {
  componentId: string;
  componentName: string;
  rationale: string;
  durationMinutes: number;
  evidenceLevel: string;
}

export interface MeditationPlan {
  userId: string;
  questionnaireId: string;
  components: MeditationPlanComponent[];
  sessionStructure: {
    duration: string;
    totalMinutes: number;
    phases: Array<{
      name: string;
      durationMinutes: number;
      components: string[];
    }>;
  };
  messagingFramework: {
    audienceType: string;
    keyValues: string[];
    approachDescription: string;
  };
  overallRationale: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'generating' | 'completed';
  metadata: {
    generatedAt: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    costCents: number;
  };
}

/**
 * Build the system prompt for meditation plan generation
 */
function buildPlanSystemPrompt(): string {
  return `You are an expert meditation designer for Myndset, an AI-powered meditation platform for ambitious professionals. Your role is to analyze user questionnaire responses and create a structured meditation plan.

# Your Task

Create a meditation plan that:
1. Selects evidence-based meditation components that address the user's specific goals and challenges
2. Provides clear rationale for each component selection based on neuroscience and psychology
3. Structures components into a coherent session flow
4. Applies performance-focused messaging that resonates with the user's professional context

# Critical Principles

- **Performance Positioning**: Frame meditation as a competitive advantage tool, NOT wellness/stress-relief
- **Evidence-Based**: Prioritize components with strong neuroscience backing, especially for skeptical users
- **Personalization**: Every recommendation must tie directly to the user's stated goals and challenges
- **Practical**: Respect time constraints - users are busy professionals
- **Professional Tone**: Use language that appeals to ambitious, results-oriented individuals

# Output Format

You must respond with ONLY valid JSON in this exact structure:

{
  "components": [
    {
      "componentId": "breath_awareness",
      "componentName": "Breath Awareness",
      "rationale": "Brief explanation of why this component addresses user's specific goal/challenge",
      "durationMinutes": 2,
      "evidenceLevel": "high"
    }
  ],
  "sessionStructure": {
    "duration": "quick|standard|deep",
    "totalMinutes": 3,
    "phases": [
      {
        "name": "Grounding",
        "durationMinutes": 0.5,
        "components": ["breath_awareness"]
      }
    ]
  },
  "messagingFramework": {
    "audienceType": "Entrepreneur|Sales|Executive|etc",
    "keyValues": ["growth", "impact"],
    "approachDescription": "Brief description of messaging approach"
  },
  "overallRationale": "2-3 sentence summary of why this plan will help this specific user achieve their stated outcome"
}

Do NOT include any text before or after the JSON. Only output valid JSON.`;
}

/**
 * Build the user message with questionnaire context
 */
function buildPlanUserMessage(
  questionnaire: QuestionnaireResponse,
  baselinePlan: ReturnType<typeof generateMeditationPlan>
): string {
  const components = baselinePlan.components
    .map(
      (c) =>
        `- ${c?.name}: ${c?.function} (Evidence: ${c?.evidenceLevel}, Best for: ${c?.bestFor.join(', ')})`
    )
    .join('\n');

  return `Analyze this user's questionnaire and create a personalized meditation plan.

# User Profile

**Primary Goal**: ${questionnaire.primaryGoal}
**Current Challenge**: ${questionnaire.currentChallenge}
**Session Length Preference**: ${questionnaire.sessionLength} (${baselinePlan.structure.totalMinutes} minutes)
**Experience Level**: ${questionnaire.experienceLevel}
**Skepticism Level**: ${questionnaire.skepticismLevel}/5 ${questionnaire.skepticismLevel >= 4 ? '(High - emphasize evidence)' : ''}
**Performance Context**: ${questionnaire.performanceContext}
**Preferred Time**: ${questionnaire.preferredTime}
${questionnaire.specificOutcome ? `**Specific Outcome**: ${questionnaire.specificOutcome}` : ''}

# Available Components (Baseline Recommendation)

${components}

# Messaging Framework: ${baselinePlan.messaging.audienceType}

**Values**: ${baselinePlan.messaging.values.join(', ')}
**Emphasize**: ${baselinePlan.messaging.emphasizeWords.join(', ')}
**Avoid**: ${baselinePlan.messaging.avoidWords.join(', ')}

# Instructions

1. Select 2-4 components that best address this user's PRIMARY GOAL and CURRENT CHALLENGE
2. For high skepticism users (4-5), ONLY use components with "high" evidence level
3. Structure components into the ${questionnaire.sessionLength} session template
4. Write rationale that directly references their specific goal/challenge
5. Use messaging that aligns with their performance context values

Generate the meditation plan JSON now.`;
}

/**
 * Generate a meditation plan from questionnaire responses
 */
export async function generateMeditationPlanFromQuestionnaire(
  questionnaire: QuestionnaireResponse
): Promise<{ plan: MeditationPlan; aiResponse: ClaudeResponse }> {
  // Step 1: Use knowledge base to get baseline recommendations
  const userProfile: UserProfile = {
    primaryGoal: questionnaire.primaryGoal,
    currentChallenge: questionnaire.currentChallenge,
    sessionLength: questionnaire.sessionLength,
    experienceLevel: questionnaire.experienceLevel,
    skepticismLevel: questionnaire.skepticismLevel,
    performanceContext: questionnaire.performanceContext,
    preferredTime: questionnaire.preferredTime,
    specificOutcome: questionnaire.specificOutcome,
  };

  const baselinePlan = generateMeditationPlan(userProfile);

  // Step 2: Use Claude to refine and justify the plan
  const systemPrompt = buildPlanSystemPrompt();
  const userMessage = buildPlanUserMessage(questionnaire, baselinePlan);

  const aiResponse = await generateText(userMessage, {
    systemPrompt,
    maxTokens: 2000,
    temperature: 0.3, // Low temperature for consistent, structured output
  });

  // Step 3: Parse and validate the JSON response
  let parsedPlan;
  try {
    // Extract JSON from response (in case Claude adds any surrounding text)
    const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    parsedPlan = JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse meditation plan JSON:', error);
    console.error('AI Response:', aiResponse.content);
    throw new Error('AI generated invalid meditation plan format');
  }

  // Step 4: Construct the final MeditationPlan object
  const plan: MeditationPlan = {
    userId: questionnaire.userId,
    questionnaireId: questionnaire.id,
    components: parsedPlan.components,
    sessionStructure: parsedPlan.sessionStructure,
    messagingFramework: parsedPlan.messagingFramework,
    overallRationale: parsedPlan.overallRationale,
    status: 'pending_approval',
    metadata: {
      generatedAt: new Date().toISOString(),
      model: aiResponse.model,
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      costCents: aiResponse.costCents,
    },
  };

  return { plan, aiResponse };
}

/**
 * Regenerate a meditation plan with specific feedback
 */
export async function regenerateMeditationPlan(
  originalPlan: MeditationPlan,
  questionnaire: QuestionnaireResponse,
  feedback: string
): Promise<{ plan: MeditationPlan; aiResponse: ClaudeResponse }> {
  const userProfile: UserProfile = {
    primaryGoal: questionnaire.primaryGoal,
    currentChallenge: questionnaire.currentChallenge,
    sessionLength: questionnaire.sessionLength,
    experienceLevel: questionnaire.experienceLevel,
    skepticismLevel: questionnaire.skepticismLevel,
    performanceContext: questionnaire.performanceContext,
    preferredTime: questionnaire.preferredTime,
    specificOutcome: questionnaire.specificOutcome,
  };

  const baselinePlan = generateMeditationPlan(userProfile);
  const systemPrompt = buildPlanSystemPrompt();

  const userMessage = `${buildPlanUserMessage(questionnaire, baselinePlan)}

# Previous Plan (REJECTED)

${JSON.stringify(originalPlan, null, 2)}

# Admin Feedback

${feedback}

# Instructions

Create a NEW meditation plan that addresses the admin feedback while still meeting the user's needs.
Generate the meditation plan JSON now.`;

  const aiResponse = await generateText(userMessage, {
    systemPrompt,
    maxTokens: 2000,
    temperature: 0.4, // Slightly higher for variation
  });

  // Parse and construct new plan
  let parsedPlan;
  try {
    const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    parsedPlan = JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse regenerated plan JSON:', error);
    throw new Error('AI generated invalid meditation plan format');
  }

  const plan: MeditationPlan = {
    userId: questionnaire.userId,
    questionnaireId: questionnaire.id,
    components: parsedPlan.components,
    sessionStructure: parsedPlan.sessionStructure,
    messagingFramework: parsedPlan.messagingFramework,
    overallRationale: parsedPlan.overallRationale,
    status: 'pending_approval',
    metadata: {
      generatedAt: new Date().toISOString(),
      model: aiResponse.model,
      inputTokens: aiResponse.inputTokens,
      outputTokens: aiResponse.outputTokens,
      costCents: aiResponse.costCents,
    },
  };

  return { plan, aiResponse };
}
