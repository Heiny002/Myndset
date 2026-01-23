/**
 * Clean Test Data
 *
 * Removes all dummy test data from the database
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

async function cleanTestData() {
  console.log('🧹 Cleaning test data...\n');

  // Delete test users (ones created by seed script)
  const testEmails = [
    'alex.executive@test.com',
    'sarah.athlete@test.com',
    'mike.founder@test.com',
  ];

  for (const email of testEmails) {
    console.log(`Deleting user: ${email}`);

    // Get user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === email);

    if (user) {
      // Delete user (this will cascade delete questionnaires, plans, etc via RLS)
      await supabase.auth.admin.deleteUser(user.id);
      console.log(`  ✓ Deleted ${email}`);
    } else {
      console.log(`  ⊘ User not found: ${email}`);
    }
  }

  console.log('\n✅ Test data cleaned!');
}

cleanTestData()
  .catch((err) => {
    console.error('💥 Error:', err);
    process.exit(1);
  })
  .then(() => process.exit(0));
