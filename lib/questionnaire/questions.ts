/**
 * Dynamic Questionnaire System for High-Energy Motivational Scripts
 *
 * This questionnaire is designed for users in IMMEDIATE, DIRE NEED of motivation.
 * We don't waste time with meditation history or preferences - we get straight
 * to the heart of what they're facing and what they need RIGHT NOW.
 *
 * Structure:
 * - Q1: Performance Arena (determines user type)
 * - Q2: Open-ended immediate need
 * - Q3-Q8: Dynamic questions based on user type and Q2 response
 * - Tier 2: Optional deeper personalization questions
 */

export type QuestionType = 'single-select' | 'multi-select' | 'slider' | 'text';
export type UserType = 'athlete' | 'entrepreneur' | 'sales' | 'executive' | 'creative' | 'technical' | 'student';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  tier: 1 | 2;
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
  userTypes?: UserType[]; // If specified, only show for these user types
  conditional?: {
    dependsOn: string;
    showWhen: string[] | ((value: string | string[]) => boolean);
  };
}

// =============================================================================
// UNIVERSAL QUESTIONS (All User Types)
// =============================================================================

export const UNIVERSAL_QUESTIONS: Question[] = [
  // Q1: Performance Arena - FIRST QUESTION
  {
    id: 'performance_arena',
    tier: 1,
    question: 'What best describes your performance arena?',
    subtext: "We'll tailor your activation to speak directly to your world",
    type: 'single-select',
    options: [
      {
        value: 'athlete',
        label: 'Athlete / Competitor',
        description: 'Physical or mental competition, sports, fitness',
      },
      {
        value: 'entrepreneur',
        label: 'Entrepreneur / Founder',
        description: 'Building something, wearing many hats, high stakes',
      },
      {
        value: 'sales',
        label: 'Sales / Business Development',
        description: 'Client-facing, closing deals, hitting targets',
      },
      {
        value: 'executive',
        label: 'Executive / Leader',
        description: 'Managing teams, high-stakes decisions, vision-setting',
      },
      {
        value: 'creative',
        label: 'Creative Professional',
        description: 'Design, writing, content, art, performance',
      },
      {
        value: 'technical',
        label: 'Technical / Analytical',
        description: 'Engineering, finance, research, problem-solving',
      },
      {
        value: 'student',
        label: 'Student / Academic',
        description: 'Exams, research, skill development, career transition',
      },
    ],
    required: true,
  },

  // Q2: The Immediate Situation (Open-ended) - SECOND QUESTION
  {
    id: 'immediate_situation',
    tier: 1,
    question: "What's happening right now that you need to be ready for?",
    subtext: "Be specific. What event, challenge, or moment is coming up that you need to CRUSH?",
    type: 'text',
    required: true,
    validation: {
      minLength: 20,
      maxLength: 500,
    },
  },

  // Q3: Time Urgency - THIRD QUESTION
  {
    id: 'time_urgency',
    tier: 1,
    question: 'When do you need to perform?',
    subtext: 'This shapes the urgency and energy of your activation',
    type: 'single-select',
    options: [
      {
        value: 'minutes',
        label: 'Within the next hour',
        description: "It's happening NOW - I need immediate activation",
      },
      {
        value: 'today',
        label: 'Later today',
        description: "I'm preparing for something coming up today",
      },
      {
        value: 'tomorrow',
        label: 'Tomorrow',
        description: 'I want to go in fully prepared and charged',
      },
      {
        value: 'this_week',
        label: 'This week',
        description: "Building my mental state for what's coming",
      },
      {
        value: 'ongoing',
        label: 'Ongoing challenge',
        description: "I'm in the middle of a sustained push",
      },
    ],
    required: true,
  },
];

// =============================================================================
// ATHLETE / COMPETITOR QUESTIONS
// =============================================================================

export const ATHLETE_QUESTIONS: Question[] = [
  // Q4: Competition Type
  {
    id: 'athlete_competition_type',
    tier: 1,
    question: 'What type of competition are you preparing for?',
    subtext: 'This helps us match the intensity to your challenge',
    type: 'single-select',
    options: [
      {
        value: 'game_match',
        label: 'Game or Match',
        description: 'Team or individual competition against opponents',
      },
      {
        value: 'race',
        label: 'Race or Timed Event',
        description: 'Running, cycling, swimming, or other endurance',
      },
      {
        value: 'lift_pr',
        label: 'PR Attempt / Max Effort',
        description: 'Powerlifting, CrossFit, or pushing your limits',
      },
      {
        value: 'tryout',
        label: 'Tryout or Evaluation',
        description: 'Being assessed, making the team, proving yourself',
      },
      {
        value: 'training',
        label: 'Intense Training Session',
        description: 'Practice, drill, or workout you need to dominate',
      },
      {
        value: 'comeback',
        label: 'Comeback / Recovery Challenge',
        description: 'Returning from injury or setback',
      },
    ],
    required: true,
    userTypes: ['athlete'],
  },

  // Q5: What's at Stake
  {
    id: 'athlete_stakes',
    tier: 1,
    question: "What's really at stake for you?",
    subtext: 'The deeper the stakes, the more powerful your activation',
    type: 'single-select',
    options: [
      {
        value: 'championship',
        label: 'Championship / Title',
        description: 'This is for all the marbles',
      },
      {
        value: 'qualifying',
        label: 'Qualifying / Advancement',
        description: 'Moving to the next level',
      },
      {
        value: 'proving',
        label: 'Proving Doubters Wrong',
        description: "Showing everyone what you're made of",
      },
      {
        value: 'personal_best',
        label: 'Breaking My Own Limits',
        description: 'This is between you and your potential',
      },
      {
        value: 'team',
        label: "My Team's Counting on Me",
        description: "Others are depending on your performance",
      },
      {
        value: 'redemption',
        label: 'Redemption',
        description: 'Making up for a past failure',
      },
    ],
    required: true,
    userTypes: ['athlete'],
  },

  // Q6: Current Mental State
  {
    id: 'athlete_mental_state',
    tier: 1,
    question: 'How are you feeling RIGHT NOW about this?',
    subtext: "Be honest - we'll meet you where you are",
    type: 'single-select',
    options: [
      {
        value: 'nervous',
        label: 'Nervous / Anxious',
        description: 'The butterflies are intense',
      },
      {
        value: 'flat',
        label: 'Flat / Low Energy',
        description: "Not feeling the fire I need",
      },
      {
        value: 'doubting',
        label: 'Doubting Myself',
        description: 'Questioning if I can do this',
      },
      {
        value: 'unfocused',
        label: 'Distracted / Unfocused',
        description: "Mind is everywhere except where it needs to be",
      },
      {
        value: 'angry',
        label: 'Frustrated / Angry',
        description: 'Need to channel this energy productively',
      },
      {
        value: 'ready',
        label: 'Ready but Need More',
        description: "I'm in a good place, but want that extra edge",
      },
    ],
    required: true,
    userTypes: ['athlete'],
  },

  // Q7: Physical State
  {
    id: 'athlete_physical_state',
    tier: 1,
    question: 'How does your body feel?',
    subtext: 'Mind and body are connected - this matters',
    type: 'single-select',
    options: [
      {
        value: 'fresh',
        label: 'Fresh and Ready',
        description: 'Well-rested, recovered, prepared',
      },
      {
        value: 'warmed_up',
        label: 'Warmed Up',
        description: 'Already activated and loose',
      },
      {
        value: 'tired',
        label: 'Tired but Willing',
        description: 'Fatigue is there but mind can push through',
      },
      {
        value: 'sore',
        label: 'Sore / Banged Up',
        description: 'Dealing with aches but ready to fight',
      },
      {
        value: 'recovering',
        label: 'Recovering from Injury',
        description: 'Coming back, need mental edge to compensate',
      },
    ],
    required: true,
    userTypes: ['athlete'],
  },

  // Q8: Session Length
  {
    id: 'session_length',
    tier: 1,
    question: 'How long do you have for this activation?',
    subtext: 'We\'ll pack maximum power into your available time',
    type: 'single-select',
    options: [
      {
        value: 'ultra_quick',
        label: '1 minute',
        description: 'Ultra-short punchy motivation - immediate fire',
      },
      {
        value: 'quick',
        label: '2-3 minutes',
        description: 'Quick hit of energy - straight to the point',
      },
      {
        value: 'standard',
        label: '5-7 minutes',
        description: 'Full activation with time to build',
      },
      {
        value: 'deep',
        label: '10-15 minutes',
        description: 'Complete mental preparation',
      },
    ],
    required: true,
  },
];

// =============================================================================
// ENTREPRENEUR / FOUNDER QUESTIONS
// =============================================================================

export const ENTREPRENEUR_QUESTIONS: Question[] = [
  // Q4: Challenge Type
  {
    id: 'entrepreneur_challenge_type',
    tier: 1,
    question: 'What type of challenge are you facing?',
    subtext: 'Every founder\'s battle is different',
    type: 'single-select',
    options: [
      {
        value: 'pitch',
        label: 'Investor Pitch / Fundraising',
        description: 'Presenting to VCs, angels, or potential backers',
      },
      {
        value: 'launch',
        label: 'Product Launch / Go Live',
        description: 'Releasing something into the world',
      },
      {
        value: 'sales',
        label: 'Critical Sales Call / Demo',
        description: 'Make or break customer conversation',
      },
      {
        value: 'team',
        label: 'Team Leadership Moment',
        description: 'Rally the troops, make tough calls, inspire',
      },
      {
        value: 'crisis',
        label: 'Crisis / Firefighting',
        description: 'Things are on fire and you need to lead through it',
      },
      {
        value: 'grind',
        label: 'The Grind',
        description: 'Need to push through another brutal stretch',
      },
    ],
    required: true,
    userTypes: ['entrepreneur'],
  },

  // Q5: What's at Stake
  {
    id: 'entrepreneur_stakes',
    tier: 1,
    question: "What's riding on this?",
    subtext: 'The truth about what this moment means',
    type: 'single-select',
    options: [
      {
        value: 'runway',
        label: 'Company Survival',
        description: 'Runway, funding, keeping the lights on',
      },
      {
        value: 'growth',
        label: 'Major Growth Opportunity',
        description: 'This could change everything',
      },
      {
        value: 'reputation',
        label: 'My Reputation',
        description: 'Personal credibility is on the line',
      },
      {
        value: 'team_jobs',
        label: 'My Team\'s Livelihoods',
        description: 'People are counting on me',
      },
      {
        value: 'dream',
        label: 'Years of Work',
        description: 'Everything I\'ve built could pay off',
      },
      {
        value: 'proving',
        label: 'Proving It Can Work',
        description: 'Validating the vision against doubters',
      },
    ],
    required: true,
    userTypes: ['entrepreneur'],
  },

  // Q6: Current Mental State
  {
    id: 'entrepreneur_mental_state',
    tier: 1,
    question: 'What\'s your mental state right now?',
    subtext: "Founders carry heavy loads - we'll meet you where you are",
    type: 'single-select',
    options: [
      {
        value: 'overwhelmed',
        label: 'Overwhelmed',
        description: 'Too many things, too little time',
      },
      {
        value: 'imposter',
        label: 'Imposter Syndrome',
        description: 'Questioning if I belong here',
      },
      {
        value: 'burned_out',
        label: 'Running on Empty',
        description: 'Exhausted but need to show up',
      },
      {
        value: 'anxious',
        label: 'Anxious / Stressed',
        description: 'The pressure is getting to me',
      },
      {
        value: 'frustrated',
        label: 'Frustrated',
        description: 'Things aren\'t going as planned',
      },
      {
        value: 'determined',
        label: 'Determined but Need Fuel',
        description: 'I know what I need to do, help me do it',
      },
    ],
    required: true,
    userTypes: ['entrepreneur'],
  },

  // Q7: Energy Level
  {
    id: 'entrepreneur_energy',
    tier: 1,
    question: 'How\'s your energy level?',
    subtext: 'Honest assessment helps us calibrate',
    type: 'single-select',
    options: [
      {
        value: 'high',
        label: 'High - Just Need Direction',
        description: 'Energy is there, need to channel it',
      },
      {
        value: 'moderate',
        label: 'Moderate - Need a Boost',
        description: 'Could use more fire',
      },
      {
        value: 'low',
        label: 'Low - Need Major Activation',
        description: 'Running on fumes, need to dig deep',
      },
      {
        value: 'scattered',
        label: 'Scattered - Need Focus',
        description: 'Energy is there but unfocused',
      },
    ],
    required: true,
    userTypes: ['entrepreneur'],
  },

  // Q8: Session Length
  {
    id: 'session_length',
    tier: 1,
    question: 'How long do you have for this activation?',
    subtext: 'We\'ll pack maximum power into your available time',
    type: 'single-select',
    options: [
      {
        value: 'ultra_quick',
        label: '1 minute',
        description: 'Ultra-short punchy motivation - immediate fire',
      },
      {
        value: 'quick',
        label: '2-3 minutes',
        description: 'Quick hit of energy - straight to the point',
      },
      {
        value: 'standard',
        label: '5-7 minutes',
        description: 'Full activation with time to build',
      },
      {
        value: 'deep',
        label: '10-15 minutes',
        description: 'Complete mental preparation',
      },
    ],
    required: true,
  },
];

// =============================================================================
// SALES / BUSINESS DEVELOPMENT QUESTIONS
// =============================================================================

export const SALES_QUESTIONS: Question[] = [
  // Q4: Sales Situation
  {
    id: 'sales_situation',
    tier: 1,
    question: 'What are you facing?',
    subtext: 'Every sales moment is different',
    type: 'single-select',
    options: [
      {
        value: 'closing_call',
        label: 'Closing Call / Final Meeting',
        description: 'This is where the deal gets done',
      },
      {
        value: 'discovery',
        label: 'Discovery / First Meeting',
        description: 'Need to make a killer first impression',
      },
      {
        value: 'demo',
        label: 'Product Demo',
        description: 'Showing what we\'ve got',
      },
      {
        value: 'negotiation',
        label: 'Tough Negotiation',
        description: 'Stakes are high, pushback is real',
      },
      {
        value: 'cold_outreach',
        label: 'Cold Outreach Blitz',
        description: 'Need to attack the phones/emails with energy',
      },
      {
        value: 'quarter_end',
        label: 'End of Quarter Push',
        description: 'Numbers need to happen',
      },
    ],
    required: true,
    userTypes: ['sales'],
  },

  // Q5: What's at Stake
  {
    id: 'sales_stakes',
    tier: 1,
    question: "What's riding on this?",
    subtext: 'Let\'s be real about what this means',
    type: 'single-select',
    options: [
      {
        value: 'quota',
        label: 'Making Quota',
        description: 'This determines my success this period',
      },
      {
        value: 'whale',
        label: 'Landing a Whale',
        description: 'This is a career-making deal',
      },
      {
        value: 'reputation',
        label: 'My Reputation',
        description: 'Proving myself to leadership',
      },
      {
        value: 'income',
        label: 'Commission / Income',
        description: 'This affects my livelihood',
      },
      {
        value: 'competition',
        label: 'Beating Competition',
        description: 'We\'re up against a competitor and I need to win',
      },
      {
        value: 'promotion',
        label: 'Career Advancement',
        description: 'This could lead to the next level',
      },
    ],
    required: true,
    userTypes: ['sales'],
  },

  // Q6: Current Mental State
  {
    id: 'sales_mental_state',
    tier: 1,
    question: 'How are you feeling about this?',
    subtext: 'Honest self-assessment leads to real results',
    type: 'single-select',
    options: [
      {
        value: 'nervous',
        label: 'Nervous',
        description: 'High stakes are getting to me',
      },
      {
        value: 'rejection_fatigue',
        label: 'Rejection Fatigue',
        description: 'Been hearing "no" too much',
      },
      {
        value: 'unmotivated',
        label: 'Lost My Edge',
        description: 'Need to find that killer instinct again',
      },
      {
        value: 'intimidated',
        label: 'Intimidated',
        description: 'This prospect/deal feels bigger than me',
      },
      {
        value: 'frustrated',
        label: 'Frustrated',
        description: 'Deals aren\'t closing like they should',
      },
      {
        value: 'ready',
        label: 'Ready - Need That Extra Edge',
        description: 'Feeling good but want to be unstoppable',
      },
    ],
    required: true,
    userTypes: ['sales'],
  },

  // Q7: What You Need
  {
    id: 'sales_need',
    tier: 1,
    question: 'What do you need most right now?',
    subtext: 'This shapes your activation',
    type: 'single-select',
    options: [
      {
        value: 'confidence',
        label: 'Unshakeable Confidence',
        description: 'Walk in knowing I\'m the best option',
      },
      {
        value: 'energy',
        label: 'High Energy',
        description: 'Fire and enthusiasm that\'s contagious',
      },
      {
        value: 'focus',
        label: 'Laser Focus',
        description: 'No distractions, fully present',
      },
      {
        value: 'resilience',
        label: 'Resilience',
        description: 'Ability to push through rejection',
      },
      {
        value: 'killer_instinct',
        label: 'Killer Instinct',
        description: 'That competitive fire to close',
      },
    ],
    required: true,
    userTypes: ['sales'],
  },

  // Q8: Session Length
  {
    id: 'session_length',
    tier: 1,
    question: 'How long do you have for this activation?',
    subtext: 'We\'ll pack maximum power into your available time',
    type: 'single-select',
    options: [
      {
        value: 'ultra_quick',
        label: '1 minute',
        description: 'Ultra-short punchy motivation - immediate fire',
      },
      {
        value: 'quick',
        label: '2-3 minutes',
        description: 'Quick hit of energy - straight to the point',
      },
      {
        value: 'standard',
        label: '5-7 minutes',
        description: 'Full activation with time to build',
      },
      {
        value: 'deep',
        label: '10-15 minutes',
        description: 'Complete mental preparation',
      },
    ],
    required: true,
  },
];

// =============================================================================
// EXECUTIVE / LEADER QUESTIONS
// =============================================================================

export const EXECUTIVE_QUESTIONS: Question[] = [
  // Q4: Leadership Challenge
  {
    id: 'executive_challenge',
    tier: 1,
    question: 'What leadership moment are you facing?',
    subtext: 'Leaders face unique pressures',
    type: 'single-select',
    options: [
      {
        value: 'board_presentation',
        label: 'Board Meeting / Stakeholder Presentation',
        description: 'High-stakes presentation to decision-makers',
      },
      {
        value: 'difficult_conversation',
        label: 'Difficult Conversation',
        description: 'Delivering hard news, conflict, tough feedback',
      },
      {
        value: 'team_rally',
        label: 'Rallying the Team',
        description: 'Inspiring others through a challenging time',
      },
      {
        value: 'strategic_decision',
        label: 'Critical Decision',
        description: 'Need to make a high-stakes call',
      },
      {
        value: 'crisis_leadership',
        label: 'Crisis Leadership',
        description: 'Guiding through uncertainty or emergency',
      },
      {
        value: 'performance_review',
        label: 'Major Meeting / Review',
        description: 'Performance discussion or evaluation',
      },
    ],
    required: true,
    userTypes: ['executive'],
  },

  // Q5: What's at Stake
  {
    id: 'executive_stakes',
    tier: 1,
    question: "What's at stake?",
    subtext: 'Leaders carry the weight of many',
    type: 'single-select',
    options: [
      {
        value: 'company_direction',
        label: 'Company Direction',
        description: 'This shapes where we go',
      },
      {
        value: 'team_morale',
        label: 'Team Morale & Trust',
        description: 'How I show up affects everyone',
      },
      {
        value: 'personal_credibility',
        label: 'My Credibility',
        description: 'My reputation as a leader',
      },
      {
        value: 'major_outcome',
        label: 'Major Business Outcome',
        description: 'Revenue, growth, survival implications',
      },
      {
        value: 'culture',
        label: 'Culture & Values',
        description: 'Setting the standard for how we operate',
      },
      {
        value: 'career',
        label: 'Career Trajectory',
        description: 'This could define my path',
      },
    ],
    required: true,
    userTypes: ['executive'],
  },

  // Q6: Current Mental State
  {
    id: 'executive_mental_state',
    tier: 1,
    question: 'What\'s your mental state right now?',
    subtext: 'Even leaders need support',
    type: 'single-select',
    options: [
      {
        value: 'isolated',
        label: 'Lonely at the Top',
        description: 'Carrying weight without support',
      },
      {
        value: 'overwhelmed',
        label: 'Overwhelmed',
        description: 'Too many competing demands',
      },
      {
        value: 'uncertain',
        label: 'Uncertain',
        description: 'Second-guessing my decisions',
      },
      {
        value: 'fatigued',
        label: 'Leadership Fatigue',
        description: 'Tired of being the one with answers',
      },
      {
        value: 'pressured',
        label: 'Under Pressure',
        description: 'Stakes are high and I feel it',
      },
      {
        value: 'focused',
        label: 'Focused - Need Reinforcement',
        description: 'Clear on what to do, need the fire',
      },
    ],
    required: true,
    userTypes: ['executive'],
  },

  // Q7: What You Need
  {
    id: 'executive_need',
    tier: 1,
    question: 'What do you need to project?',
    subtext: 'How you show up shapes everything',
    type: 'single-select',
    options: [
      {
        value: 'authority',
        label: 'Calm Authority',
        description: 'Unshakeable command presence',
      },
      {
        value: 'inspiration',
        label: 'Inspiration',
        description: 'Move others to action',
      },
      {
        value: 'decisiveness',
        label: 'Decisiveness',
        description: 'Confidence in every decision',
      },
      {
        value: 'empathy',
        label: 'Empathetic Strength',
        description: 'Be human while being strong',
      },
      {
        value: 'clarity',
        label: 'Strategic Clarity',
        description: 'See through complexity',
      },
    ],
    required: true,
    userTypes: ['executive'],
  },

  // Q8: Session Length
  {
    id: 'session_length',
    tier: 1,
    question: 'How long do you have for this activation?',
    subtext: 'We\'ll pack maximum power into your available time',
    type: 'single-select',
    options: [
      {
        value: 'ultra_quick',
        label: '1 minute',
        description: 'Ultra-short punchy motivation - immediate fire',
      },
      {
        value: 'quick',
        label: '2-3 minutes',
        description: 'Quick hit of energy - straight to the point',
      },
      {
        value: 'standard',
        label: '5-7 minutes',
        description: 'Full activation with time to build',
      },
      {
        value: 'deep',
        label: '10-15 minutes',
        description: 'Complete mental preparation',
      },
    ],
    required: true,
  },
];

// =============================================================================
// CREATIVE PROFESSIONAL QUESTIONS
// =============================================================================

export const CREATIVE_QUESTIONS: Question[] = [
  // Q4: Creative Challenge
  {
    id: 'creative_challenge',
    tier: 1,
    question: 'What creative challenge are you facing?',
    subtext: 'Every creative battle is unique',
    type: 'single-select',
    options: [
      {
        value: 'deadline',
        label: 'Deadline Delivery',
        description: 'Need to produce under time pressure',
      },
      {
        value: 'blank_page',
        label: 'Starting Something New',
        description: 'The blank page/canvas stares back',
      },
      {
        value: 'presentation',
        label: 'Presenting My Work',
        description: 'Pitching, performing, or showcasing',
      },
      {
        value: 'revision',
        label: 'Major Revision',
        description: 'Reworking something that isn\'t right',
      },
      {
        value: 'breakthrough',
        label: 'Need a Breakthrough',
        description: 'Stuck and need a creative leap',
      },
      {
        value: 'sustained_output',
        label: 'Sustained Creative Output',
        description: 'Need to produce consistently',
      },
    ],
    required: true,
    userTypes: ['creative'],
  },

  // Q5: What's at Stake
  {
    id: 'creative_stakes',
    tier: 1,
    question: "What's at stake?",
    subtext: 'Creative work always has stakes',
    type: 'single-select',
    options: [
      {
        value: 'client_deadline',
        label: 'Client/Customer Deadline',
        description: 'Someone\'s counting on delivery',
      },
      {
        value: 'reputation',
        label: 'My Reputation',
        description: 'This work represents who I am',
      },
      {
        value: 'opportunity',
        label: 'Career Opportunity',
        description: 'This could open doors',
      },
      {
        value: 'income',
        label: 'Income/Livelihood',
        description: 'Financial stakes are real',
      },
      {
        value: 'personal_standard',
        label: 'My Own Standards',
        description: 'I need this to be great for me',
      },
      {
        value: 'team',
        label: 'Team/Collaboration',
        description: 'Others are depending on my contribution',
      },
    ],
    required: true,
    userTypes: ['creative'],
  },

  // Q6: Current Mental State
  {
    id: 'creative_mental_state',
    tier: 1,
    question: 'What\'s blocking you right now?',
    subtext: 'Name the obstacle to overcome it',
    type: 'single-select',
    options: [
      {
        value: 'perfectionism',
        label: 'Perfectionism Paralysis',
        description: 'Nothing seems good enough to start',
      },
      {
        value: 'self_doubt',
        label: 'Self-Doubt',
        description: 'Questioning my ability or ideas',
      },
      {
        value: 'fear_judgment',
        label: 'Fear of Judgment',
        description: 'Worried about how it will be received',
      },
      {
        value: 'burnout',
        label: 'Creative Burnout',
        description: 'The well feels dry',
      },
      {
        value: 'distraction',
        label: 'Distraction',
        description: 'Can\'t get into the flow state',
      },
      {
        value: 'pressure',
        label: 'Pressure Anxiety',
        description: 'Stakes are making it hard to create',
      },
    ],
    required: true,
    userTypes: ['creative'],
  },

  // Q7: What You Need
  {
    id: 'creative_need',
    tier: 1,
    question: 'What do you need to access?',
    subtext: 'Your creative state',
    type: 'single-select',
    options: [
      {
        value: 'flow',
        label: 'Deep Flow State',
        description: 'Total immersion in the work',
      },
      {
        value: 'courage',
        label: 'Creative Courage',
        description: 'Boldness to try and fail',
      },
      {
        value: 'confidence',
        label: 'Confidence in My Vision',
        description: 'Trust my creative instincts',
      },
      {
        value: 'energy',
        label: 'Creative Energy',
        description: 'The fire to produce',
      },
      {
        value: 'focus',
        label: 'Laser Focus',
        description: 'Block out everything else',
      },
    ],
    required: true,
    userTypes: ['creative'],
  },

  // Q8: Session Length
  {
    id: 'session_length',
    tier: 1,
    question: 'How long do you have for this activation?',
    subtext: 'We\'ll pack maximum power into your available time',
    type: 'single-select',
    options: [
      {
        value: 'ultra_quick',
        label: '1 minute',
        description: 'Ultra-short punchy motivation - immediate fire',
      },
      {
        value: 'quick',
        label: '2-3 minutes',
        description: 'Quick hit of energy - straight to the point',
      },
      {
        value: 'standard',
        label: '5-7 minutes',
        description: 'Full activation with time to build',
      },
      {
        value: 'deep',
        label: '10-15 minutes',
        description: 'Complete mental preparation',
      },
    ],
    required: true,
  },
];

// =============================================================================
// TECHNICAL / ANALYTICAL QUESTIONS
// =============================================================================

export const TECHNICAL_QUESTIONS: Question[] = [
  // Q4: Technical Challenge
  {
    id: 'technical_challenge',
    tier: 1,
    question: 'What challenge are you facing?',
    subtext: 'Technical work requires peak mental state',
    type: 'single-select',
    options: [
      {
        value: 'complex_problem',
        label: 'Complex Problem to Solve',
        description: 'Need breakthrough thinking',
      },
      {
        value: 'deadline',
        label: 'Deadline Pressure',
        description: 'Have to deliver under time constraints',
      },
      {
        value: 'presentation',
        label: 'Technical Presentation',
        description: 'Explaining complex work to others',
      },
      {
        value: 'deep_work',
        label: 'Extended Deep Work',
        description: 'Need sustained focus for hours',
      },
      {
        value: 'debugging',
        label: 'Frustrating Bug/Issue',
        description: 'Something isn\'t working and it\'s maddening',
      },
      {
        value: 'review',
        label: 'Code Review / Evaluation',
        description: 'Work is being scrutinized',
      },
    ],
    required: true,
    userTypes: ['technical'],
  },

  // Q5: What's at Stake
  {
    id: 'technical_stakes',
    tier: 1,
    question: "What's riding on this?",
    subtext: 'Technical work has real consequences',
    type: 'single-select',
    options: [
      {
        value: 'production',
        label: 'Production / Live System',
        description: 'This affects real users or data',
      },
      {
        value: 'deadline',
        label: 'Critical Deadline',
        description: 'Missing this has consequences',
      },
      {
        value: 'reputation',
        label: 'My Technical Reputation',
        description: 'Others will judge my capability',
      },
      {
        value: 'team',
        label: 'Team Depending on Me',
        description: 'Others are blocked without my work',
      },
      {
        value: 'career',
        label: 'Career Implications',
        description: 'This could affect my trajectory',
      },
      {
        value: 'learning',
        label: 'Proving My Skills',
        description: 'This is a stretch that matters',
      },
    ],
    required: true,
    userTypes: ['technical'],
  },

  // Q6: Current Mental State
  {
    id: 'technical_mental_state',
    tier: 1,
    question: 'What\'s your current mental state?',
    subtext: 'Technical work requires the right mindset',
    type: 'single-select',
    options: [
      {
        value: 'scattered',
        label: 'Scattered',
        description: 'Too many tabs open, can\'t focus',
      },
      {
        value: 'frustrated',
        label: 'Frustrated',
        description: 'Stuck on something that should work',
      },
      {
        value: 'overwhelmed',
        label: 'Overwhelmed',
        description: 'Problem feels too big',
      },
      {
        value: 'imposter',
        label: 'Imposter Syndrome',
        description: 'Questioning if I\'m good enough',
      },
      {
        value: 'fatigued',
        label: 'Mental Fatigue',
        description: 'Brain is tired but work remains',
      },
      {
        value: 'ready',
        label: 'Ready - Need an Edge',
        description: 'Capable but want peak state',
      },
    ],
    required: true,
    userTypes: ['technical'],
  },

  // Q7: What You Need
  {
    id: 'technical_need',
    tier: 1,
    question: 'What do you need most?',
    subtext: 'Optimize your technical mind',
    type: 'single-select',
    options: [
      {
        value: 'focus',
        label: 'Deep Focus',
        description: 'Block out distractions completely',
      },
      {
        value: 'clarity',
        label: 'Mental Clarity',
        description: 'See the problem clearly',
      },
      {
        value: 'confidence',
        label: 'Technical Confidence',
        description: 'Trust my abilities',
      },
      {
        value: 'persistence',
        label: 'Persistence',
        description: 'Keep pushing through frustration',
      },
      {
        value: 'creativity',
        label: 'Creative Problem-Solving',
        description: 'Think outside the box',
      },
    ],
    required: true,
    userTypes: ['technical'],
  },

  // Q8: Session Length
  {
    id: 'session_length',
    tier: 1,
    question: 'How long do you have for this activation?',
    subtext: 'We\'ll pack maximum power into your available time',
    type: 'single-select',
    options: [
      {
        value: 'ultra_quick',
        label: '1 minute',
        description: 'Ultra-short punchy motivation - immediate fire',
      },
      {
        value: 'quick',
        label: '2-3 minutes',
        description: 'Quick hit of energy - straight to the point',
      },
      {
        value: 'standard',
        label: '5-7 minutes',
        description: 'Full activation with time to build',
      },
      {
        value: 'deep',
        label: '10-15 minutes',
        description: 'Complete mental preparation',
      },
    ],
    required: true,
  },
];

// =============================================================================
// STUDENT / ACADEMIC QUESTIONS
// =============================================================================

export const STUDENT_QUESTIONS: Question[] = [
  // Q4: Academic Challenge
  {
    id: 'student_challenge',
    tier: 1,
    question: 'What are you facing?',
    subtext: 'Academic challenges require mental preparation',
    type: 'single-select',
    options: [
      {
        value: 'exam',
        label: 'Exam / Test',
        description: 'High-stakes assessment',
      },
      {
        value: 'presentation',
        label: 'Presentation / Defense',
        description: 'Presenting work to others',
      },
      {
        value: 'deadline',
        label: 'Major Assignment Deadline',
        description: 'Paper, project, or deliverable due',
      },
      {
        value: 'study_session',
        label: 'Intense Study Session',
        description: 'Need to absorb and retain material',
      },
      {
        value: 'interview',
        label: 'Interview / Application',
        description: 'Job, grad school, or program interview',
      },
      {
        value: 'skill_development',
        label: 'Skill Development Push',
        description: 'Learning something difficult',
      },
    ],
    required: true,
    userTypes: ['student'],
  },

  // Q5: What's at Stake
  {
    id: 'student_stakes',
    tier: 1,
    question: "What's riding on this?",
    subtext: 'Academic stakes are real',
    type: 'single-select',
    options: [
      {
        value: 'grade',
        label: 'My Grade',
        description: 'This significantly affects my GPA',
      },
      {
        value: 'graduation',
        label: 'Graduation / Degree',
        description: 'This determines if I finish',
      },
      {
        value: 'career',
        label: 'Future Career',
        description: 'This affects my opportunities',
      },
      {
        value: 'scholarship',
        label: 'Scholarship / Funding',
        description: 'Financial support depends on this',
      },
      {
        value: 'reputation',
        label: 'Academic Reputation',
        description: 'Professors/peers will judge this',
      },
      {
        value: 'personal',
        label: 'Proving It to Myself',
        description: 'I need to know I can do this',
      },
    ],
    required: true,
    userTypes: ['student'],
  },

  // Q6: Current Mental State
  {
    id: 'student_mental_state',
    tier: 1,
    question: 'How are you feeling right now?',
    subtext: 'Honest assessment helps us help you',
    type: 'single-select',
    options: [
      {
        value: 'anxious',
        label: 'Test Anxiety',
        description: 'Nerves are getting the best of me',
      },
      {
        value: 'unprepared',
        label: 'Underprepared',
        description: 'Not as ready as I should be',
      },
      {
        value: 'overwhelmed',
        label: 'Overwhelmed',
        description: 'Too much material, too little time',
      },
      {
        value: 'procrastinating',
        label: 'Procrastinating',
        description: 'Can\'t get myself started',
      },
      {
        value: 'burned_out',
        label: 'Burned Out',
        description: 'Running on empty but have to perform',
      },
      {
        value: 'ready',
        label: 'Ready - Want Peak State',
        description: 'Prepared but want the mental edge',
      },
    ],
    required: true,
    userTypes: ['student'],
  },

  // Q7: What You Need
  {
    id: 'student_need',
    tier: 1,
    question: 'What do you need most?',
    subtext: 'Optimize your academic performance',
    type: 'single-select',
    options: [
      {
        value: 'confidence',
        label: 'Confidence',
        description: 'Trust what I know',
      },
      {
        value: 'focus',
        label: 'Focus',
        description: 'Block out distractions',
      },
      {
        value: 'calm',
        label: 'Calm Under Pressure',
        description: 'Control the nerves',
      },
      {
        value: 'energy',
        label: 'Energy',
        description: 'Power through fatigue',
      },
      {
        value: 'motivation',
        label: 'Motivation',
        description: 'Find the drive to push',
      },
    ],
    required: true,
    userTypes: ['student'],
  },

  // Q8: Session Length
  {
    id: 'session_length',
    tier: 1,
    question: 'How long do you have for this activation?',
    subtext: 'We\'ll pack maximum power into your available time',
    type: 'single-select',
    options: [
      {
        value: 'ultra_quick',
        label: '1 minute',
        description: 'Ultra-short punchy motivation - immediate fire',
      },
      {
        value: 'quick',
        label: '2-3 minutes',
        description: 'Quick hit of energy - straight to the point',
      },
      {
        value: 'standard',
        label: '5-7 minutes',
        description: 'Full activation with time to build',
      },
      {
        value: 'deep',
        label: '10-15 minutes',
        description: 'Complete mental preparation',
      },
    ],
    required: true,
  },
];

// =============================================================================
// TIER 2: DEEP PERSONALIZATION QUESTIONS (All User Types)
// =============================================================================

export const TIER_2_QUESTIONS: Question[] = [
  // T2-1: Past Success - Universal
  {
    id: 'past_success',
    tier: 2,
    question: 'Describe a time when you performed at your absolute best under pressure',
    subtext: 'We\'ll anchor your activation to this peak state. What did it feel like?',
    type: 'text',
    required: true,
    validation: {
      minLength: 30,
      maxLength: 500,
    },
  },

  // T2-2: Inner Voice - Universal
  {
    id: 'inner_critic',
    tier: 2,
    question: 'What does the voice of self-doubt say to you?',
    subtext: 'Be specific - the exact words your inner critic uses. We\'ll help you silence it.',
    type: 'text',
    required: true,
    validation: {
      minLength: 10,
      maxLength: 300,
    },
  },

  // T2-3: Motivation Source - Universal
  {
    id: 'motivation_source',
    tier: 2,
    question: 'Who or what are you doing this for?',
    subtext: 'Beyond yourself - who are you making proud? What bigger purpose drives you?',
    type: 'text',
    required: true,
    validation: {
      minLength: 10,
      maxLength: 300,
    },
  },

  // T2-4: Physical Activation - Universal
  {
    id: 'physical_cue',
    tier: 2,
    question: 'What physical action helps you feel powerful?',
    subtext: 'Examples: clapping hands, deep breath, standing tall, clenching fist',
    type: 'single-select',
    options: [
      {
        value: 'breath',
        label: 'Deep, powerful breathing',
        description: 'Breath work to activate',
      },
      {
        value: 'movement',
        label: 'Physical movement / shaking out',
        description: 'Get the body moving',
      },
      {
        value: 'posture',
        label: 'Power posture / standing tall',
        description: 'Command the space',
      },
      {
        value: 'hands',
        label: 'Clapping / fist clench',
        description: 'Physical punctuation',
      },
      {
        value: 'voice',
        label: 'Vocalization / self-talk',
        description: 'Speaking power into existence',
      },
    ],
    required: true,
  },

  // T2-5: Visualization Style - Universal
  {
    id: 'visualization_style',
    tier: 2,
    question: 'How do you best visualize success?',
    subtext: 'We\'ll match our imagery to how your mind works',
    type: 'single-select',
    options: [
      {
        value: 'visual',
        label: 'I see vivid images',
        description: 'Pictures and scenes in my mind',
      },
      {
        value: 'feeling',
        label: 'I feel sensations in my body',
        description: 'Physical feelings of success',
      },
      {
        value: 'words',
        label: 'I hear words and sounds',
        description: 'Internal dialogue and audio',
      },
      {
        value: 'mixed',
        label: 'A mix of all three',
        description: 'Multi-sensory experience',
      },
    ],
    required: true,
  },

  // T2-6: Identity Statement - Universal
  {
    id: 'identity_statement',
    tier: 2,
    question: 'Complete this sentence: "I am someone who..."',
    subtext: 'How do you want to define yourself? We\'ll reinforce this identity.',
    type: 'text',
    required: true,
    validation: {
      minLength: 10,
      maxLength: 200,
    },
  },

  // T2-7: What Victory Looks Like - Universal
  {
    id: 'victory_vision',
    tier: 2,
    question: 'Describe what it will look and feel like when you crush this',
    subtext: 'Be specific. The moment of success. What do you see, hear, feel?',
    type: 'text',
    required: true,
    validation: {
      minLength: 30,
      maxLength: 500,
    },
  },

  // T2-8: Accountability - Universal
  {
    id: 'accountability',
    tier: 2,
    question: 'What promise are you making to yourself right now?',
    subtext: 'A specific commitment. We\'ll hold you to it.',
    type: 'text',
    required: true,
    validation: {
      minLength: 10,
      maxLength: 200,
    },
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get questions for a specific user type
 */
export function getQuestionsForUserType(userType: UserType): Question[] {
  const questionMap: Record<UserType, Question[]> = {
    athlete: ATHLETE_QUESTIONS,
    entrepreneur: ENTREPRENEUR_QUESTIONS,
    sales: SALES_QUESTIONS,
    executive: EXECUTIVE_QUESTIONS,
    creative: CREATIVE_QUESTIONS,
    technical: TECHNICAL_QUESTIONS,
    student: STUDENT_QUESTIONS,
  };

  return questionMap[userType] || [];
}

/**
 * Get all Tier 1 questions based on user type
 */
export function getTier1Questions(userType: UserType): Question[] {
  const universalQuestions = UNIVERSAL_QUESTIONS;
  const typeSpecificQuestions = getQuestionsForUserType(userType);

  return [...universalQuestions, ...typeSpecificQuestions];
}

/**
 * Get Tier 2 questions (same for all user types)
 */
export function getTier2Questions(): Question[] {
  return TIER_2_QUESTIONS;
}

/**
 * Get all questions for a user type up to a specific tier
 */
export function getAllQuestionsUpToTier(userType: UserType, maxTier: 1 | 2): Question[] {
  const tier1 = getTier1Questions(userType);

  if (maxTier === 1) {
    return tier1;
  }

  return [...tier1, ...getTier2Questions()];
}

/**
 * Calculate tier completion benefits
 */
export function getTierBenefits(): { tier1: string; tier2: string } {
  return {
    tier1: 'Your essential context - enough for a powerful, personalized activation',
    tier2: 'Deep personalization - we\'ll use your peak experiences, inner dialogue, and specific imagery for maximum impact',
  };
}

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

// For backward compatibility with existing code
export const TIER_1_QUESTIONS: Question[] = UNIVERSAL_QUESTIONS;
export const TIER_3_QUESTIONS: Question[] = []; // Deprecated - now using Tier 2 only

/**
 * @deprecated Use getTier1Questions(userType) instead
 */
export function getQuestionsByTier(tier: 1 | 2 | 3): Question[] {
  switch (tier) {
    case 1:
      return UNIVERSAL_QUESTIONS;
    case 2:
      return TIER_2_QUESTIONS;
    case 3:
      return []; // Deprecated
    default:
      return [];
  }
}

// Type for questionnaire responses
export interface QuestionnaireResponses {
  [questionId: string]: string | string[];
}
