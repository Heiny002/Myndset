# Apply Ultra Quick Migration

Your database is missing the `ultra_quick` enum value for `session_length`.

## To Fix:

1. Go to your Supabase project dashboard
2. Navigate to: **SQL Editor**
3. Run this SQL command:

```sql
ALTER TYPE session_length ADD VALUE IF NOT EXISTS 'ultra_quick';
```

4. Click "Run" to execute

This adds the `ultra_quick` option (1-minute meditations) to the database enum.

## After applying:

- Restart your dev server
- The "ultra_quick" session length option will work in test meditations
- Audio generation should also work after this is applied

## Alternative using Supabase CLI:

If you have Supabase CLI configured, you can run:

```bash
npx supabase db push
```

But based on the error, you'll need to run the SQL manually in the dashboard.
