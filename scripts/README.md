# Admin Test Data Setup

## Quick Start

### 1. Install tsx (TypeScript runner)
```bash
npm install --save-dev tsx
```

### 2. Set up environment variables
Make sure your `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important:** `SUPABASE_SERVICE_ROLE_KEY` is different from `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Get it from:
- Supabase Dashboard → Project Settings → API → service_role key (keep it secret!)

### 3. Run the seed script
```bash
npx tsx scripts/seed-test-data.ts
```

## What This Creates

### Dummy Users
- `alex.executive@test.com` - Corporate executive
- `sarah.athlete@test.com` - Professional athlete
- `mike.founder@test.com` - Startup founder

**All passwords:** `TestPassword123!`

### Questionnaire Responses
Each user gets 1-2 questionnaires with realistic responses covering:
- High-stakes business deals
- Athletic performance
- Entrepreneurial stress
- Creative problem-solving
- Public speaking

## Testing the Admin Workflow

After running the seed script:

1. **Login as admin** at `/auth/login`
2. **Visit** `/admin` dashboard
3. **See pending questionnaires** (should show 3-5)
4. **Click "Generate Plan"** on any questionnaire
5. **Review full responses** (no longer blank!)
6. **Click "Generate Meditation Plan"** (calls Claude API)
7. **Review AI plan** with components, structure, messaging
8. **Click "Approve & Generate Script"** (calls Claude again)
9. **Review full script** (2000+ words)
10. **Click "Approve & Generate Audio"** (calls ElevenLabs)
11. **Meditation delivered** to user dashboard!

## Troubleshooting

### "Missing environment variables"
- Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Restart your dev server after adding env vars

### "User already exists"
- Script will skip and continue
- You can manually delete users from Supabase Dashboard → Authentication → Users

### "Permission denied"
- Make sure you're using the `service_role` key, not the `anon` key
- The service role key bypasses RLS policies

## Cleanup

To remove test data:
```sql
-- Delete questionnaires by test users
DELETE FROM questionnaire_responses
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%@test.com'
);

-- Delete test users (Supabase Dashboard → Authentication → Users)
```
