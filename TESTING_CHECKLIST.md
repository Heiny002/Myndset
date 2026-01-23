# Myndset E2E Testing Checklist

Comprehensive testing guide for US-028: End-to-end testing of complete user journey.

## Pre-Testing Setup

- [ ] Stripe test mode enabled
- [ ] Resend API configured (test emails go to verified addresses)
- [ ] Database migrations applied (all 3 migrations)
- [ ] Admin user created in `admin_users` table
- [ ] Test cards ready:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
  - Requires auth: `4000 0025 0000 3155`

---

## 1. New User Journey (Free Tier)

### Landing Page
- [ ] Page loads correctly at `/`
- [ ] "Get Started" CTA visible and clickable
- [ ] Navigation responsive on mobile
- [ ] Pricing information displays correctly

### Questionnaire Flow
- [ ] Navigate to `/questionnaire`
- [ ] All 8 questions render properly
- [ ] Form validation works (required fields)
- [ ] Progress indicator updates
- [ ] Submit button disabled until all answered
- [ ] Submit redirects to completion page

### Authentication
- [ ] Completion page shows "Create Account" prompt
- [ ] Click signup redirects to `/auth/signup`
- [ ] Email/password signup works
- [ ] Email confirmation sent (check inbox)
- [ ] Confirm email with link
- [ ] Redirect to dashboard after confirmation

### Dashboard (Free Tier)
- [ ] Welcome message for new users
- [ ] "Create New Meditation" card visible
- [ ] Usage stats show 0/1 meditations, 0/2 remixes
- [ ] Settings link in navigation
- [ ] Pending questionnaire status appears
- [ ] No meditations in library yet (empty state)

---

## 2. Admin Workflow

### Admin Login
- [ ] Navigate to `/auth/login`
- [ ] Login with admin credentials (whitelisted password)
- [ ] Redirect to `/admin` dashboard

### Questionnaire Review
- [ ] See submitted questionnaire in queue
- [ ] Click "Review" → navigate to `/admin/questionnaire/[id]`
- [ ] Questionnaire responses display correctly
- [ ] "Generate Plan" button works
- [ ] AI generates meditation plan (check Claude API call)
- [ ] Plan preview shows components, structure, messaging

### Plan Approval
- [ ] Review generated plan
- [ ] "Approve" button enabled
- [ ] Click approve → navigate to plan review page
- [ ] Plan marked as `approved` status
- [ ] "Generate Script" button appears

### Script Generation
- [ ] Click "Generate Script"
- [ ] AI generates full meditation script
- [ ] Script preview shows complete text
- [ ] "Approve" button enabled
- [ ] Click approve

### Audio Generation
- [ ] "Generate Audio" button appears
- [ ] Click to start ElevenLabs generation
- [ ] Progress indicator shows
- [ ] Audio file generates successfully
- [ ] Audio preview player works
- [ ] Can play/pause/seek audio
- [ ] "Deliver to User" button appears
- [ ] Click deliver → meditation status = `completed`

---

## 3. User Receives Meditation

### Dashboard Update
- [ ] Logout from admin, login as test user
- [ ] Navigate to `/dashboard`
- [ ] New meditation appears in library
- [ ] Meditation card shows title, duration
- [ ] Click meditation → navigate to `/dashboard/meditation/[id]`

### Meditation Player
- [ ] Full script text displays
- [ ] Audio player loads
- [ ] Play button works
- [ ] Pause/seek controls work
- [ ] Download button works (if implemented)
- [ ] "Remix Section" button visible
- [ ] Back to dashboard link works

---

## 4. Remix Feature (Free Tier Limits)

### First Remix (Within Limit)
- [ ] Select text in script (20+ characters)
- [ ] "Remix Section" modal opens
- [ ] Selected text shows in modal
- [ ] Enter remix instructions
- [ ] Usage shows 0/2 remixes
- [ ] Submit remix
- [ ] AI generates new section
- [ ] Script updates with changes
- [ ] Audio regenerates (optional checkbox)
- [ ] Usage updates to 1/2 remixes

### Second Remix (At Limit)
- [ ] Perform another remix
- [ ] Usage updates to 2/2 remixes
- [ ] Remix completes successfully

### Third Remix (Over Limit)
- [ ] Try to remix again
- [ ] Upgrade modal appears
- [ ] Modal shows "2/2 remixes used"
- [ ] "Upgrade to Basic" CTA visible
- [ ] Click upgrade → redirects to `/pricing`

---

## 5. Subscription Flow (Basic Tier)

### Pricing Page
- [ ] All 3 tiers display (Free, Basic, Premium)
- [ ] Monthly/Annual toggle works
- [ ] Prices update correctly
- [ ] Feature comparison clear
- [ ] "Choose Basic" CTA works

### Stripe Checkout
- [ ] Redirects to Stripe Checkout
- [ ] Pre-filled email correct
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] Redirects to `/pricing?success=true`
- [ ] Success banner shows

### Webhook Processing
- [ ] Check logs: `checkout.session.completed` received
- [ ] Check logs: Event logged in `stripe_webhook_events`
- [ ] User tier updated to `basic` in database
- [ ] Limits updated: 10 meditations, 10 remixes

### Dashboard After Upgrade
- [ ] Navigate to `/dashboard`
- [ ] Usage stats show basic limits (10/10)
- [ ] Can create new meditation
- [ ] Can use remix feature

---

## 6. Settings Page

### Navigation
- [ ] Click "Settings" in dashboard nav
- [ ] Navigate to `/settings`
- [ ] Page loads correctly

### Subscription Section
- [ ] Current tier badge shows "BASIC"
- [ ] Plan features list correct
- [ ] Usage stats accurate
- [ ] Next billing date shown
- [ ] "Upgrade to Premium" button visible
- [ ] "Manage Billing & Invoices" button visible
- [ ] "Cancel Subscription" button visible

### Billing Portal
- [ ] Click "Manage Billing & Invoices"
- [ ] Redirects to Stripe Customer Portal
- [ ] Can view invoices
- [ ] Can update payment method
- [ ] Return to settings works

### Cancel Subscription
- [ ] Click "Cancel Subscription"
- [ ] Confirmation modal appears
- [ ] Shows features kept until period end
- [ ] Click "Yes, Cancel"
- [ ] Subscription marked `cancel_at_period_end`
- [ ] Still has access until period ends

---

## 7. Premium Tier Testing

### Upgrade to Premium
- [ ] Navigate to `/pricing`
- [ ] Click "Choose Premium"
- [ ] Complete Stripe checkout
- [ ] Webhook updates tier to `premium`
- [ ] Limits: 45 meditations, 45 remixes
- [ ] Settings shows Premium badge

---

## 8. Limit Enforcement Testing

### Meditation Generation Limits

**Free Tier (1 meditation):**
- [ ] Generate 1 meditation successfully
- [ ] Try to create 2nd meditation
- [ ] "Create New Meditation" shows usage 1/1
- [ ] Click triggers upgrade modal
- [ ] Modal shows "1/1 meditations used"
- [ ] Upgrade CTA works

**Basic Tier (10 meditations):**
- [ ] Generate 10 meditations successfully
- [ ] Try to create 11th
- [ ] Upgrade modal appears
- [ ] Suggests Premium tier

**Premium Tier (45 meditations):**
- [ ] Can generate up to 45
- [ ] 46th triggers upgrade modal
- [ ] Modal suggests annual plan or contact sales

### Remix Limits
- [ ] Same flow for remix limits
- [ ] Free: 2, Basic: 10, Premium: 45
- [ ] Upgrade modals appear at limits

---

## 9. Payment Failure Scenarios

### Failed Payment
- [ ] Use declining card in checkout: `4000 0000 0000 0002`
- [ ] Payment fails at Stripe
- [ ] Error message shows to user
- [ ] User remains on current tier
- [ ] No charge applied

### Payment Requires Auth
- [ ] Use auth card: `4000 0025 0000 3155`
- [ ] 3D Secure modal appears
- [ ] Complete authentication
- [ ] Payment succeeds
- [ ] User upgraded

### Invoice Payment Failed (Webhook)
- [ ] Simulate failed renewal (Stripe dashboard)
- [ ] `invoice.payment_failed` webhook fires
- [ ] Email sent to user
- [ ] Email includes invoice URL
- [ ] Email shows retry date
- [ ] User not immediately downgraded

---

## 10. Email Testing

### Welcome Email (if implemented)
- [ ] New user receives welcome email
- [ ] Links work correctly
- [ ] Branding consistent

### Meditation Delivered Email (if implemented)
- [ ] User receives email when meditation ready
- [ ] Link to meditation works

### Payment Failed Email
- [ ] Triggered on invoice failure
- [ ] Subject: "Payment Issue with Your Myndset Subscription"
- [ ] Invoice URL included
- [ ] Retry date shown
- [ ] Links work

### Subscription Canceled Email
- [ ] Triggered on `subscription.deleted`
- [ ] Subject: "Your Myndset Subscription Has Been Canceled"
- [ ] Free tier limits stated
- [ ] Reactivation link works

---

## 11. Mobile Testing

### iOS Safari
- [ ] All pages render correctly
- [ ] Touch targets ≥ 44x44px
- [ ] Audio player works
- [ ] Forms use mobile keyboards
- [ ] No horizontal scroll
- [ ] PWA installable (Add to Home Screen)
- [ ] Installed app works offline (if SW implemented)

### Android Chrome
- [ ] Same tests as iOS
- [ ] PWA install banner appears
- [ ] Installed app works

### Responsive Breakpoints
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone X/11/12)
- [ ] 428px (iPhone Pro Max)
- [ ] 768px (iPad portrait)
- [ ] 1024px (iPad landscape)
- [ ] 1440px (desktop)

---

## 12. Security Testing

### Authentication
- [ ] Can't access `/dashboard` without login
- [ ] Can't access `/admin` without admin role
- [ ] Can't access other users' meditations
- [ ] Session expires correctly
- [ ] Logout works

### API Protection
- [ ] Can't call admin APIs without auth
- [ ] Can't modify other users' data
- [ ] Stripe webhook signature verified
- [ ] No CORS issues

---

## 13. Performance Testing

### Page Load Times
- [ ] Landing page < 2s (3G)
- [ ] Dashboard < 3s (3G)
- [ ] Meditation player < 2s (3G)

### Audio Loading
- [ ] Audio streams (doesn't download full file)
- [ ] Buffering smooth
- [ ] No playback stuttering

---

## 14. Edge Cases

### Empty States
- [ ] New user dashboard (no meditations)
- [ ] Admin dashboard (no pending items)
- [ ] No pending questionnaires

### Error States
- [ ] 404 page works
- [ ] API errors show user-friendly messages
- [ ] Network offline handling

### Data Edge Cases
- [ ] Very long meditation scripts
- [ ] Special characters in questionnaire responses
- [ ] Multiple browser tabs open
- [ ] Rapid clicking/double submits

---

## Bug Reporting Template

For each bug found, create a GitHub issue with:

```
Title: [Component] Brief description
Priority: Critical / High / Medium / Low
Environment: Development / Staging / Production
Browser: Chrome 120 / Safari 17 / etc.

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Console Errors:**
[Copy any errors from browser console]

**Additional Context:**
[User tier, device, etc.]
```

---

## Sign-Off Checklist

Before marking US-028 complete:
- [ ] All critical bugs resolved
- [ ] All high-priority bugs resolved or documented
- [ ] Medium/low bugs triaged
- [ ] Test results documented
- [ ] Screenshots captured
- [ ] Performance metrics recorded
- [ ] Mobile testing complete on real devices
- [ ] Email deliverability confirmed
- [ ] Stripe test mode working correctly
- [ ] Ready for production deployment
