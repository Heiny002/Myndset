/**
 * Test script to verify meditation_versions migration
 *
 * Run with: npx tsx scripts/test-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMigration() {
  console.log('🔍 Testing meditation_versions migration...\n');

  // Test 1: Check if table exists
  console.log('1️⃣ Checking if meditation_versions table exists...');
  const { data: tables, error: tableError } = await supabase
    .from('meditation_versions')
    .select('id')
    .limit(0);

  if (tableError) {
    if (tableError.message.includes('does not exist')) {
      console.error('❌ Table meditation_versions does not exist!');
      console.log('\n📋 To fix this, run the migration:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/crhduxupcvfbvchslbcn/sql');
      console.log('   2. Copy/paste the contents of: scripts/apply-meditation-versions-migration.sql');
      console.log('   3. Click "Run"\n');
      return;
    }
    console.error('❌ Error checking table:', tableError);
    return;
  }
  console.log('✅ Table exists!\n');

  // Test 2: Check if RPC functions exist
  console.log('2️⃣ Testing archive_meditation_version function...');
  const { data: archiveTest, error: archiveError } = await supabase.rpc(
    'archive_meditation_version',
    { p_meditation_id: '00000000-0000-0000-0000-000000000000' } // Fake ID to test function exists
  );

  if (archiveError) {
    if (archiveError.message.includes('could not be found')) {
      console.error('❌ Function archive_meditation_version does not exist!');
      console.log('   Please run the migration SQL script.\n');
      return;
    }
    // Error is expected (meditation not found) - function exists!
    if (archiveError.message.includes('Meditation not found')) {
      console.log('✅ Function exists and works correctly!\n');
    } else {
      console.error('❌ Unexpected error:', archiveError);
      return;
    }
  }

  // Test 3: Check if set_meditation_version_live exists
  console.log('3️⃣ Testing set_meditation_version_live function...');
  const { error: restoreError } = await supabase.rpc(
    'set_meditation_version_live',
    { p_version_id: '00000000-0000-0000-0000-000000000000' } // Fake ID to test function exists
  );

  if (restoreError) {
    if (restoreError.message.includes('could not be found')) {
      console.error('❌ Function set_meditation_version_live does not exist!');
      console.log('   Please run the migration SQL script.\n');
      return;
    }
    // Error is expected (version not found) - function exists!
    if (restoreError.message.includes('Version not found')) {
      console.log('✅ Function exists and works correctly!\n');
    } else {
      console.error('❌ Unexpected error:', restoreError);
      return;
    }
  }

  console.log('✨ All tests passed! Migration is complete.\n');
  console.log('You can now use the meditation redo feature at:');
  console.log('   https://trymyndset.com/admin/meditations\n');
}

testMigration().catch(console.error);
