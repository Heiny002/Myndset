# How to Apply the Meditation Versions Migration

The "Failed to archive current version" error occurs because the database migration hasn't been applied yet.

## Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
Go to: **https://supabase.com/dashboard/project/crhduxupcvfbvchslbcn/sql/new**

### Step 2: Copy the Migration SQL
Open the file `scripts/apply-meditation-versions-migration.sql` in your editor and copy ALL the contents.

### Step 3: Paste and Run
1. Paste the entire SQL into the Supabase SQL Editor
2. Click **"Run"** (or press Cmd+Enter / Ctrl+Enter)
3. Wait for it to complete (should take 2-3 seconds)

### Step 4: Verify
Run this command to test:
```bash
npx tsx scripts/test-migration.ts
```

You should see:
```
✨ All tests passed! Migration is complete.
```

---

## What This Migration Creates

1. **`meditation_versions` table** - Stores old versions when you redo meditations
2. **`archive_meditation_version()` function** - Archives current version before redo
3. **`set_meditation_version_live()` function** - Restores old versions
4. **Security policies (RLS)** - Users can only see their own versions, admins see all

---

## Troubleshooting

### If you get permission errors:
- Make sure you're logged into Supabase as the project owner
- Try running the SQL in the SQL Editor, not via API

### If the table already exists:
- The migration is safe to run multiple times
- It uses `CREATE TABLE IF NOT EXISTS` and `DROP ... IF EXISTS`

### If you still get errors:
- Check the Supabase dashboard logs
- Look for specific error messages
- Share the error details

---

## After Migration Works

Once the migration is applied, you can:

1. Go to **Admin Dashboard** → **Manage Meditations**
2. Click **"Redo Meditation"** on any completed meditation
3. Select a new mode (energizing or calming)
4. The previous version is automatically archived
5. View version history by clicking **"View Versions"**

The feature will work immediately after applying the migration! 🎉
