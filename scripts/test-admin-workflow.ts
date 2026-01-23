/**
 * Test Admin Workflow
 *
 * Tests the complete workflow:
 * 1. Fetch questionnaire as admin
 * 2. Verify we can access questionnaires from other users
 * 3. Check all admin page queries work
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testWorkflow() {
  console.log('🧪 Testing Admin Workflow\n');

  // Step 1: Get all questionnaires
  console.log('Step 1: Fetching all questionnaires (as admin would see)...');
  const { data: questionnaires, error: qError } = await adminClient
    .from('questionnaire_responses')
    .select('*')
    .order('created_at', { ascending: false });

  if (qError) {
    console.error('❌ Failed to fetch questionnaires:', qError);
    process.exit(1);
  }

  console.log(`✅ Found ${questionnaires?.length || 0} questionnaires\n`);

  if (!questionnaires || questionnaires.length === 0) {
    console.error('❌ No questionnaires found. Run seed-test-data.ts first.');
    process.exit(1);
  }

  // Step 2: Pick a questionnaire with data
  const testQ = questionnaires.find(
    (q: any) => q.responses?.primaryGoal && q.responses?.primaryGoal !== 'Unknown goal'
  );

  if (!testQ) {
    console.error('❌ No questionnaires with data found.');
    process.exit(1);
  }

  console.log(`Step 2: Testing with questionnaire "${testQ.responses?.primaryGoal}"`);
  console.log(`  ID: ${testQ.id}`);
  console.log(`  User ID: ${testQ.user_id}`);
  console.log(`  Has complete responses: ${!!testQ.responses?.primaryGoal}\n`);

  // Step 3: Fetch single questionnaire (simulates questionnaire detail page)
  console.log('Step 3: Fetching single questionnaire (detail page simulation)...');
  const { data: singleQ, error: singleError } = await adminClient
    .from('questionnaire_responses')
    .select('*')
    .eq('id', testQ.id)
    .single();

  if (singleError || !singleQ) {
    console.error('❌ Failed to fetch single questionnaire:', singleError);
    process.exit(1);
  }

  console.log(`✅ Successfully fetched questionnaire detail`);
  console.log(`  Primary Goal: ${singleQ.responses?.primaryGoal}`);
  console.log(`  Challenge: ${singleQ.responses?.currentChallenge}`);
  console.log(`  Session Length: ${singleQ.responses?.sessionLength}\n`);

  // Step 4: Check all required fields are present
  console.log('Step 4: Validating questionnaire data completeness...');
  const requiredFields = [
    'primaryGoal',
    'currentChallenge',
    'sessionLength',
    'experienceLevel',
    'skepticismLevel',
    'performanceContext',
    'preferredTime',
  ];

  const missingFields = requiredFields.filter(
    (field) => !singleQ.responses?.[field]
  );

  if (missingFields.length > 0) {
    console.error(`❌ Missing fields: ${missingFields.join(', ')}`);
    process.exit(1);
  }

  console.log('✅ All required fields present\n');

  // Step 5: Check if plan exists
  console.log('Step 5: Checking for existing plan...');
  const { data: existingPlan } = await adminClient
    .from('meditation_plans')
    .select('*')
    .eq('questionnaire_response_id', testQ.id)
    .single();

  if (existingPlan) {
    console.log(`⚠️  Plan already exists (ID: ${existingPlan.id})`);
    console.log('   This questionnaire has already been processed.');
  } else {
    console.log('✅ No existing plan - ready for plan generation');
  }

  console.log('\n🎉 All workflow checks passed!');
  console.log('\n📋 Next steps:');
  console.log('  1. Visit http://localhost:3000/admin');
  console.log('  2. Click "Generate Plan" on any questionnaire');
  console.log(`  3. Or directly visit: http://localhost:3000/admin/questionnaire/${testQ.id}`);
  console.log('  4. Click "Generate Meditation Plan" button');
  console.log('  5. Review the AI-generated plan');
  console.log('  6. Click "Approve Plan"');
  console.log('  7. Click "Generate Meditation Script"');
  console.log('  8. Review and approve script');
  console.log('  9. Click "Generate Audio" to create final meditation');
}

testWorkflow()
  .catch((err) => {
    console.error('💥 Test failed:', err);
    process.exit(1);
  })
  .then(() => process.exit(0));
