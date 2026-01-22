// Tier 1: 8 Essential Questions for Performance-Focused Meditation Personalization
// These questions capture the core information needed for AI to generate personalized meditation plans

export type QuestionType = 'single-select' | 'multi-select' | 'slider' | 'text';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  tier: 1 | 2 | 3;
  question: string;
  subtext?: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export const TIER_1_QUESTIONS: Question[] = [
  {
    id: 'primary_goal',
    tier: 1,
    question: 'What do you want to achieve with meditation?',
    subtext: 'Select the outcome that matters most to your performance',
    type: 'single-select',
    options: [
      {
        value: 'focus',
        label: 'Sharper Focus',
        description: 'Cut through distractions and maintain deep concentration',
      },
      {
        value: 'stress_performance',
        label: 'Perform Under Pressure',
        description: 'Stay calm and decisive in high-stakes situations',
      },
      {
        value: 'energy',
        label: 'Sustainable Energy',
        description: 'Maintain peak mental energy throughout the day',
      },
      {
        value: 'sleep',
        label: 'Better Recovery',
        description: 'Fall asleep faster and wake up sharper',
      },
      {
        value: 'confidence',
        label: 'Unshakeable Confidence',
        description: 'Eliminate self-doubt and perform with certainty',
      },
      {
        value: 'creativity',
        label: 'Creative Breakthroughs',
        description: 'Access innovative thinking and problem-solving',
      },
    ],
    required: true,
  },
  {
    id: 'current_challenge',
    tier: 1,
    question: "What's your biggest mental challenge right now?",
    subtext: 'Be honest - this helps us target the right techniques',
    type: 'single-select',
    options: [
      {
        value: 'overthinking',
        label: 'Racing Thoughts',
        description: "Can't quiet the mental chatter",
      },
      {
        value: 'anxiety',
        label: 'Anxiety Before Big Moments',
        description: 'Nerves before presentations, meetings, or competitions',
      },
      {
        value: 'procrastination',
        label: 'Procrastination',
        description: 'Difficulty starting or finishing important work',
      },
      {
        value: 'burnout',
        label: 'Mental Fatigue',
        description: 'Running on empty, feeling depleted',
      },
      {
        value: 'imposter',
        label: 'Self-Doubt',
        description: 'Questioning your abilities despite your track record',
      },
      {
        value: 'distraction',
        label: 'Constant Distraction',
        description: 'Unable to maintain attention on what matters',
      },
    ],
    required: true,
  },
  {
    id: 'session_length',
    tier: 1,
    question: 'How much time can you commit to meditation?',
    subtext: 'Consistency beats duration - pick what you can actually do',
    type: 'single-select',
    options: [
      {
        value: 'quick',
        label: '2-5 minutes',
        description: 'Quick reset between tasks or meetings',
      },
      {
        value: 'standard',
        label: '5-10 minutes',
        description: 'Solid practice for daily optimization',
      },
      {
        value: 'deep',
        label: '15-30 minutes',
        description: 'Deep work on mental conditioning',
      },
    ],
    required: true,
  },
  {
    id: 'experience_level',
    tier: 1,
    question: "What's your experience with meditation?",
    subtext: "We'll calibrate the guidance to your level",
    type: 'single-select',
    options: [
      {
        value: 'never',
        label: 'Complete Beginner',
        description: "Never tried it or couldn't make it stick",
      },
      {
        value: 'tried',
        label: 'Tried a Few Times',
        description: "Done some guided sessions but it didn't click",
      },
      {
        value: 'occasional',
        label: 'Occasional Practice',
        description: 'Meditate sometimes but not consistently',
      },
      {
        value: 'regular',
        label: 'Regular Practitioner',
        description: 'Have an established practice, looking to level up',
      },
    ],
    required: true,
  },
  {
    id: 'skepticism_level',
    tier: 1,
    question: 'How skeptical are you about meditation?',
    subtext: "No judgment - this helps us speak your language",
    type: 'single-select',
    options: [
      {
        value: 'very_skeptical',
        label: 'Very Skeptical',
        description: 'Need hard evidence and no woo-woo',
      },
      {
        value: 'somewhat_skeptical',
        label: 'Somewhat Skeptical',
        description: 'Open-minded but want practical results',
      },
      {
        value: 'neutral',
        label: 'Neutral',
        description: 'Willing to try it if it works',
      },
      {
        value: 'believer',
        label: 'Already Convinced',
        description: 'Know meditation works, just need the right approach',
      },
    ],
    required: true,
  },
  {
    id: 'performance_context',
    tier: 1,
    question: 'What best describes your performance arena?',
    subtext: "We'll tailor examples and language to your world",
    type: 'single-select',
    options: [
      {
        value: 'entrepreneur',
        label: 'Entrepreneur / Founder',
        description: 'Building something, wearing many hats',
      },
      {
        value: 'sales',
        label: 'Sales / Business Development',
        description: 'Client-facing, closing deals',
      },
      {
        value: 'executive',
        label: 'Executive / Leader',
        description: 'Managing teams, high-stakes decisions',
      },
      {
        value: 'athlete',
        label: 'Athlete / Competitor',
        description: 'Physical or mental competition',
      },
      {
        value: 'creative',
        label: 'Creative Professional',
        description: 'Design, writing, content, art',
      },
      {
        value: 'technical',
        label: 'Technical / Analytical',
        description: 'Engineering, finance, research',
      },
      {
        value: 'student',
        label: 'Student / Learner',
        description: 'Academics, exams, skill development',
      },
    ],
    required: true,
  },
  {
    id: 'preferred_time',
    tier: 1,
    question: 'When would you most likely meditate?',
    subtext: "We'll design your session for this context",
    type: 'single-select',
    options: [
      {
        value: 'morning',
        label: 'Morning Kickoff',
        description: 'Start the day with intention and energy',
      },
      {
        value: 'pre_performance',
        label: 'Before Important Moments',
        description: 'Prime yourself before big meetings or events',
      },
      {
        value: 'midday',
        label: 'Midday Reset',
        description: 'Recharge and refocus in the afternoon',
      },
      {
        value: 'evening',
        label: 'Evening Wind-Down',
        description: 'Decompress and prepare for quality sleep',
      },
      {
        value: 'flexible',
        label: 'Whenever Needed',
        description: 'On-demand based on my state',
      },
    ],
    required: true,
  },
  {
    id: 'specific_outcome',
    tier: 1,
    question: 'Describe a specific situation where you want to perform better',
    subtext: 'Example: "Stay calm during investor pitches" or "Focus during 4-hour deep work blocks"',
    type: 'text',
    required: true,
    validation: {
      minLength: 10,
      maxLength: 500,
    },
  },
];

// Helper function to get questions by tier
export function getQuestionsByTier(tier: 1 | 2 | 3): Question[] {
  switch (tier) {
    case 1:
      return TIER_1_QUESTIONS;
    case 2:
      // TODO: Implement Tier 2 questions (US-009)
      return [];
    case 3:
      // TODO: Implement Tier 3 questions (US-009)
      return [];
    default:
      return [];
  }
}

// Type for questionnaire responses
export interface QuestionnaireResponses {
  [questionId: string]: string | string[];
}
