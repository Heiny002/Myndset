/**
 * Check Admin View
 *
 * Simulates what the admin page sees when fetching data
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role client (same as admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkAdminView() {
  console.log('🔍 Simulating Admin Page Query\n');

  // Fetch all questionnaire responses (same query as admin page)
  const { data: questionnaires, error: questionnairesError } = await supabase
    .from('questionnaire_responses')
    .select('*')
    .order('created_at', { ascending: false });

  if (questionnairesError) {
    console.error('❌ Error fetching questionnaires:', questionnairesError);
    return;
  }

  // Fetch all meditation plans
  const { data: plans, error: plansError } = await supabase
    .from('meditation_plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (plansError) {
    console.error('❌ Error fetching plans:', plansError);
    return;
  }

  console.log(`📝 Questionnaires fetched: ${questionnaires?.length || 0}`);
  console.log(`📋 Plans fetched: ${plans?.length || 0}\n`);

  // Calculate pending questionnaires (same logic as admin page line 59-61)
  const pendingQuestionnaires = questionnaires?.filter(
    (q) => !plans?.some((p) => p.questionnaire_response_id === q.id)
  ) || [];

  console.log(`⏳ Pending Questionnaires: ${pendingQuestionnaires.length}\n`);

  if (pendingQuestionnaires.length > 0) {
    console.log('Pending items:');
    pendingQuestionnaires.forEach((q: any) => {
      const goal = q.responses?.primaryGoal || 'Unknown goal';
      console.log(`  - "${goal}" (ID: ${q.id.slice(0, 8)})`);
    });
  }

  console.log('\n📊 Full questionnaire list:');
  questionnaires?.forEach((q: any) => {
    const hasPlan = plans?.some(p => p.questionnaire_response_id === q.id);
    const goal = q.responses?.primaryGoal || 'Unknown goal';
    const status = hasPlan ? '✅ Has Plan' : '⏳ Pending';
    console.log(`  ${status} - "${goal}" (ID: ${q.id.slice(0, 8)})`);
  });

  // Log raw responses to check data structure
  console.log('\n🔍 Sample questionnaire data:');
  if (questionnaires && questionnaires.length > 0) {
    const sample = questionnaires[0];
    console.log('ID:', sample.id);
    console.log('User ID:', sample.user_id);
    console.log('Tier:', sample.tier);
    console.log('Responses:', JSON.stringify(sample.responses, null, 2));
  }
}

checkAdminView()
  .catch(err => {
    console.error('💥 Error:', err);
    process.exit(1);
  })
  .then(() => process.exit(0));
