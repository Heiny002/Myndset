/**
 * Check Database Status
 *
 * Shows counts of questionnaires, plans, and meditations
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkStatus() {
  console.log('📊 Database Status Check\n');

  // Get all questionnaires
  const { data: questionnaires } = await supabase
    .from('questionnaire_responses')
    .select('id, user_id, responses, created_at')
    .order('created_at', { ascending: false });

  // Get all plans
  const { data: plans } = await supabase
    .from('meditation_plans')
    .select('id, questionnaire_response_id, status, created_at')
    .order('created_at', { ascending: false });

  // Get all meditations
  const { data: meditations } = await supabase
    .from('meditations')
    .select('id, user_id, created_at')
    .order('created_at', { ascending: false });

  console.log(`📝 Total Questionnaires: ${questionnaires?.length || 0}`);
  console.log(`📋 Total Plans: ${plans?.length || 0}`);
  console.log(`🎵 Total Meditations: ${meditations?.length || 0}\n`);

  // Show questionnaires with their status
  console.log('📝 Questionnaire Details:\n');
  questionnaires?.forEach((q: any) => {
    const hasPlan = plans?.some(p => p.questionnaire_response_id === q.id);
    const goal = q.responses?.primaryGoal || 'Unknown goal';
    const status = hasPlan ? '✅ Has Plan' : '⏳ Pending';
    const date = new Date(q.created_at).toLocaleString();

    console.log(`  ${status} - "${goal}"`);
    console.log(`    ID: ${q.id.slice(0, 8)}`);
    console.log(`    Created: ${date}`);
    console.log('');
  });

  // Show pending count (what admin sees)
  const pendingCount = questionnaires?.filter(
    q => !plans?.some(p => p.questionnaire_response_id === q.id)
  ).length || 0;

  console.log(`\n🎯 Pending Questionnaires (shown on /admin): ${pendingCount}`);

  if (plans && plans.length > 0) {
    console.log('\n📋 Plans:');
    plans.forEach((p: any) => {
      console.log(`  - ${p.status} (${p.id.slice(0, 8)})`);
    });
  }

  if (pendingCount === 0 && questionnaires && questionnaires.length > 0) {
    console.log('\n⚠️  All questionnaires have plans! To see pending items:');
    console.log('  1. Submit a new questionnaire as a test user');
    console.log('  2. OR delete existing plans to make questionnaires "pending" again');
  }
}

checkStatus()
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  })
  .then(() => process.exit(0));
