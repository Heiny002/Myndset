import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function clearTestUsers() {
  console.log('🔍 Fetching all users...\n');

  // Get all users using admin API
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('❌ Error fetching users:', error.message);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('✓ No users found in the database');
    return;
  }

  console.log(`Found ${users.length} user(s):\n`);

  // List all users with their details
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log();
  });

  // Ask for confirmation
  console.log('⚠️  WARNING: This will delete ALL users and their associated data!');
  console.log('   Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log('🗑️  Deleting users...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      // Delete user using admin API
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error(`❌ Failed to delete ${user.email}: ${deleteError.message}`);
        errorCount++;
      } else {
        console.log(`✓ Deleted ${user.email}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Failed to delete ${user.email}:`, err);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✓ Successfully deleted: ${successCount}`);
  console.log(`   ✗ Failed: ${errorCount}`);
  console.log('\n✅ Done! You can now test with fresh email addresses.');
}

clearTestUsers().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
