/**
 * Apply meditation_versions migration directly
 *
 * Run with: npx tsx scripts/apply-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('📦 Applying meditation_versions migration...\n');

  // Read the migration file
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/004_meditation_versions.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('📄 Read migration file:', migrationPath);
  console.log('📏 SQL length:', migrationSQL.length, 'characters\n');

  // Split into individual statements (rough split by semicolon at end of line)
  const statements = migrationSQL
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

  console.log('📊 Found', statements.length, 'SQL statements to execute\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\n/g, ' ');

    console.log(`${i + 1}/${statements.length} Executing: ${preview}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        console.error('❌ Error:', error.message);
        errorCount++;
      } else {
        console.log('✅ Success');
        successCount++;
      }
    } catch (err) {
      console.error('❌ Exception:', err);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log('  ✅ Successful:', successCount);
  console.log('  ❌ Failed:', errorCount);

  if (errorCount > 0) {
    console.log('\n⚠️  Some statements failed. You may need to apply the migration manually.');
    console.log('   Go to: https://supabase.com/dashboard/project/crhduxupcvfbvchslbcn/sql/new');
    console.log('   Copy/paste: scripts/apply-meditation-versions-migration.sql\n');
  } else {
    console.log('\n✨ Migration applied successfully!\n');

    // Test the migration
    console.log('🧪 Testing migration...');
    const { error: testError } = await supabase
      .from('meditation_versions')
      .select('id')
      .limit(0);

    if (testError) {
      console.error('❌ Test failed:', testError.message);
    } else {
      console.log('✅ Table meditation_versions is accessible!\n');
    }
  }
}

applyMigration().catch(console.error);
