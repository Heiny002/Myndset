/**
 * Seed Test Data Script
 *
 * Creates dummy users and questionnaire responses for testing the admin workflow
 *
 * Run with: npx tsx scripts/seed-test-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DUMMY_USERS = [
  {
    email: 'alex.executive@test.com',
    password: 'TestPassword123!',
    fullName: 'Alex Executive',
  },
  {
    email: 'sarah.athlete@test.com',
    password: 'TestPassword123!',
    fullName: 'Sarah Athlete',
  },
  {
    email: 'mike.founder@test.com',
    password: 'TestPassword123!',
    fullName: 'Mike Founder',
  },
];

const QUESTIONNAIRE_TEMPLATES = [
  {
    primaryGoal: 'Sharpen focus for high-stakes deals',
    currentChallenge: 'Staying calm under pressure during negotiations',
    sessionLength: 'quick',
    experienceLevel: 'Beginner - never meditated before',
    skepticismLevel: 3,
    performanceContext: 'Corporate executive closing multi-million dollar deals',
    preferredTime: 'Morning, before work',
    specificOutcome: 'Want to feel calm and focused during board meetings',
  },
  {
    primaryGoal: 'Improve athletic performance',
    currentChallenge: 'Pre-game anxiety and overthinking',
    sessionLength: 'standard',
    experienceLevel: 'Intermediate - meditated a few times',
    skepticismLevel: 2,
    performanceContext: 'Professional athlete preparing for competitions',
    preferredTime: 'Evening, after training',
    specificOutcome: 'Enter flow state more easily during games',
  },
  {
    primaryGoal: 'Reduce entrepreneurial stress',
    currentChallenge: 'Managing overwhelm from running a startup',
    sessionLength: 'deep',
    experienceLevel: 'Advanced - regular practice',
    skepticismLevel: 4,
    performanceContext: 'Startup founder juggling multiple responsibilities',
    preferredTime: 'Midday, during lunch break',
    specificOutcome: 'Better decision-making under uncertainty',
  },
  {
    primaryGoal: 'Enhance creative problem-solving',
    currentChallenge: 'Mental fatigue and creative blocks',
    sessionLength: 'quick',
    experienceLevel: 'Beginner - never meditated before',
    skepticismLevel: 5,
    performanceContext: 'Software engineer tackling complex technical challenges',
    preferredTime: 'Afternoon, mid-workday',
    specificOutcome: 'More innovative solutions to technical problems',
  },
  {
    primaryGoal: 'Prepare for public speaking',
    currentChallenge: 'Stage fright and nervous energy before presentations',
    sessionLength: 'standard',
    experienceLevel: 'Intermediate - meditated a few times',
    skepticismLevel: 1,
    performanceContext: 'Sales leader presenting to large audiences',
    preferredTime: 'Morning, before presentations',
    specificOutcome: 'Confidence and presence during keynote speeches',
  },
];

async function seedData() {
  console.log('🌱 Starting seed process...\n');

  // Create dummy users
  console.log('👥 Creating dummy users...');
  const createdUsers: { email: string; id: string }[] = [];

  for (const user of DUMMY_USERS) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`  ⚠️  User ${user.email} already exists, skipping...`);
          // Try to get existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers.users.find(u => u.email === user.email);
          if (existingUser) {
            createdUsers.push({ email: user.email, id: existingUser.id });
          }
        } else {
          console.error(`  ❌ Error creating ${user.email}:`, error.message);
        }
      } else if (data.user) {
        console.log(`  ✅ Created user: ${user.email} (${data.user.id})`);
        createdUsers.push({ email: user.email, id: data.user.id });
      }
    } catch (err) {
      console.error(`  ❌ Failed to create ${user.email}:`, err);
    }
  }

  console.log(`\n📝 Creating questionnaire responses for ${createdUsers.length} users...\n`);

  // Create questionnaire responses
  let questionnaireCount = 0;
  for (const user of createdUsers) {
    // Create 1-2 questionnaires per user
    const numQuestionnaires = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < numQuestionnaires; i++) {
      const template = QUESTIONNAIRE_TEMPLATES[questionnaireCount % QUESTIONNAIRE_TEMPLATES.length];

      try {
        const { data, error } = await supabase
          .from('questionnaire_responses')
          .insert({
            user_id: user.id,
            tier: 1,
            responses: template,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error(`  ❌ Error creating questionnaire for ${user.email}:`, error.message);
        } else {
          console.log(`  ✅ Created questionnaire for ${user.email}: "${template.primaryGoal}"`);
          questionnaireCount++;
        }
      } catch (err) {
        console.error(`  ❌ Failed to create questionnaire for ${user.email}:`, err);
      }
    }
  }

  console.log(`\n✨ Seed complete!`);
  console.log(`📊 Summary:`);
  console.log(`  - Users created/verified: ${createdUsers.length}`);
  console.log(`  - Questionnaires created: ${questionnaireCount}`);
  console.log(`\n🔐 Test user credentials (all use password: TestPassword123!):`);
  createdUsers.forEach(user => {
    console.log(`  - ${user.email}`);
  });
  console.log(`\n🎯 Next steps:`);
  console.log(`  1. Visit /admin dashboard`);
  console.log(`  2. Click "Generate Plan" on any questionnaire`);
  console.log(`  3. Review AI-generated plan`);
  console.log(`  4. Approve and generate script`);
  console.log(`  5. Generate audio with ElevenLabs\n`);
}

seedData()
  .catch((err) => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
