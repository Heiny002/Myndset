# Admin Quick Start Guide

## 🚀 Setup Test Data (5 minutes)

### 1. Install TypeScript runner
```bash
npm install --save-dev tsx
```

### 2. Add service role key to `.env.local`
```bash
# Get from: Supabase Dashboard → Project Settings → API → service_role
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Run seed script
```bash
npx tsx scripts/seed-test-data.ts
```

**This creates:**
- ✅ 3 dummy users (alex.executive@, sarah.athlete@, mike.founder@)
- ✅ 3-5 realistic questionnaire responses
- ✅ All with password: `TestPassword123!`

---

## 🎯 Test the Admin Workflow

### Step 1: Login
1. Go to `/auth/login`
2. Use your admin credentials
3. Should redirect to `/admin`

### Step 2: View Pending Questionnaires
- See **"Pending Questionnaires"** card (should show 3-5)
- Each shows:
  - User's primary goal
  - Challenge
  - Duration preference
  - "Generate Plan" button (bright green)

### Step 3: Generate Meditation Plan
1. Click **"Generate Plan"** on any questionnaire
2. Navigate to questionnaire detail page
3. Review all responses (no longer blank!)
4. Click **"Generate Meditation Plan"** button
5. ⏳ Wait 30-60 seconds (Claude API processes)
6. ✅ Auto-redirects to plan review

### Step 4: Review AI-Generated Plan
You'll see:
- **Components**: Breathing, visualization, etc.
- **Session Structure**: Intro, main practice, closing
- **Messaging Framework**: Tone and language approach
- **Rationale**: Why these choices

**Two buttons:**
- 🟢 **"Approve Plan"** → Proceeds to script
- 🟠 **"Regenerate"** → Try again with feedback

### Step 5: Approve & Generate Script
1. Click **"Approve Plan"**
2. New button appears: **"Generate Meditation Script"**
3. Click it
4. ⏳ Wait 60-90 seconds (Claude generates 2000+ words)
5. ✅ Redirects to script review

### Step 6: Review Full Script
- See complete meditation script (2000-3000 words)
- Estimated duration shown
- Click **"Approve & Generate Audio"**
- 🎙️ ElevenLabs generates voice (2-3 minutes)
- ✅ Meditation delivered to user!

---

## 📝 Where the AI Prompts Are

All Claude (Anthropic API) prompts are in `lib/ai/`:

| File | What It Generates | Time |
|------|------------------|------|
| `plan-generator.ts` | Meditation Plan | 30-60s |
| `script-generator.ts` | Full Script (2000+ words) | 60-90s |
| `section-remix.ts` | Modified sections | 20-30s |

**To edit prompts:**
1. Open the file
2. Find the `systemPrompt` variable
3. Modify instructions
4. Restart dev server
5. Test with dummy questionnaires

**Full guide:** See `AI_PROMPTS_GUIDE.md`

---

## 🔧 Troubleshooting

### "Generate Plan" button is hard to see
- ✅ **Fixed!** Button now uses primary color (bright green)
- Refresh your browser

### Questionnaire responses showing as blank
- ✅ **Fixed!** Run seed script to create proper test data
- Previous questionnaires may still be blank (delete them from Supabase)

### Seed script fails
```bash
# Check environment variables
cat .env.local | grep SUPABASE

# Should see:
# NEXT_PUBLIC_SUPABASE_URL=https://...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  (long key)

# If missing service role key:
# 1. Go to Supabase Dashboard
# 2. Project Settings → API
# 3. Copy "service_role" key (NOT anon key!)
# 4. Add to .env.local
```

### Claude API errors
```bash
# Check API key in .env.local
cat .env.local | grep ANTHROPIC

# Should see:
# ANTHROPIC_API_KEY=sk-ant-...

# Test API directly:
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'
```

---

## 🎨 Customize AI Output

### Make scripts shorter/longer
```typescript
// lib/ai/script-generator.ts, line ~120
const prompt = `Write a ${duration} meditation script:
- Word count: 1500-1800 words  // Change this
...`;
```

### Change tone (less spiritual, more business)
```typescript
// lib/ai/plan-generator.ts, line ~50
const systemPrompt = `You are an expert meditation designer
specializing in Fortune 500 executives.  // Add this

Use direct, results-focused language.
Avoid spiritual or New Age terminology.  // Add this
...`;
```

### See actual prompts being sent
```typescript
// Add to any prompt file
console.log('PROMPT:', prompt);

// Then check terminal when generating
npm run dev
# Generate plan in admin UI
# Check terminal for full prompt
```

---

## 📊 Test User Credentials

After running seed script, login as test users:

| Email | Password | Profile |
|-------|----------|---------|
| alex.executive@test.com | TestPassword123! | Corporate executive |
| sarah.athlete@test.com | TestPassword123! | Professional athlete |
| mike.founder@test.com | TestPassword123! | Startup founder |

**To test user experience:**
1. Logout from admin
2. Login as test user
3. Go to `/dashboard`
4. See their delivered meditation
5. Test audio player, remix feature

---

## 🧹 Cleanup Test Data

### Option 1: Database (safest)
```sql
-- In Supabase SQL Editor
DELETE FROM questionnaire_responses
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%@test.com'
);
```

### Option 2: UI
1. Supabase Dashboard → Authentication → Users
2. Find `@test.com` users
3. Delete manually

---

## 📚 More Resources

- **Full testing checklist:** `TESTING_CHECKLIST.md`
- **AI prompt guide:** `AI_PROMPTS_GUIDE.md`
- **Seed script details:** `scripts/README.md`
- **API documentation:** `lib/ai/` (inline comments)

---

## ✅ Quick Checks

Before testing admin workflow:
- [ ] Dev server running (`npm run dev`)
- [ ] Admin user exists in `admin_users` table
- [ ] Seed script completed successfully
- [ ] Can see pending questionnaires on `/admin`
- [ ] Environment variables set (Anthropic, ElevenLabs, Supabase)

**All set? Click "Generate Plan" and watch the magic happen! 🎉**
