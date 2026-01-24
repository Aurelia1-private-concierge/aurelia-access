

# Automation Expansion Plan: Visitor Acquisition & User Conversion

## Overview
This plan introduces **8 new automation systems** designed to increase organic traffic, improve conversion rates, and maximize user retention through intelligent triggers and behavioral personalization.

---

## 1. Exit-Intent Popup System
**Purpose**: Capture abandoning visitors before they leave

### Technical Scope
- Create `src/components/ExitIntentPopup.tsx` with mouse-leave detection
- Trigger on cursor moving toward browser close/back button
- Offer high-value incentive (exclusive content, VIP waitlist bump, discount code)
- Store dismissal state in localStorage to avoid repeated popups
- Track conversion via `funnel_events` table

### Behavior Rules
- 5-second page delay before enabling
- Maximum 1 popup per session
- Different offers for different pages (waitlist vs. services)

---

## 2. AI-Powered Content Generator for SEO
**Purpose**: Auto-generate blog posts and landing pages for long-tail keywords

### Technical Scope
- Create `supabase/functions/generate-seo-content/index.ts` using Lovable AI (Gemini/GPT)
- Admin panel: `src/components/admin/ContentGeneratorPanel.tsx`
- Generate meta descriptions, titles, and full blog articles
- Target keywords from your existing `SEO_KEYWORDS` config
- Schedule content creation via N8N workflow

### Output
- New blog posts stored in `blog_posts` table
- Auto-publish or queue for review

---

## 3. Smart Lead Scoring & Segmentation Engine
**Purpose**: Prioritize high-intent visitors with personalized follow-ups

### Technical Scope
- Enhance `src/lib/lead-scoring.ts` with behavioral signals:
  - Pages visited (services, pricing, membership)
  - Time on site
  - Scroll depth
  - Return visits
  - UTM source quality
- Create `LeadScoreIndicator` component for admin CRM
- Trigger N8N workflows when score exceeds threshold

### Scoring Matrix
| Action | Points |
|--------|--------|
| Visit pricing page | +15 |
| View 3+ services | +10 |
| Return visitor | +20 |
| From LinkedIn UTM | +25 |
| Scroll >75% on landing | +5 |

---

## 4. Viral Referral Share Widgets
**Purpose**: Make sharing frictionless across channels

### Technical Scope
- Create `src/components/referral/ViralShareWidget.tsx`
- Pre-filled messages for:
  - WhatsApp, Twitter/X, LinkedIn, Email, SMS
  - Copy-to-clipboard with tracking
- Embed on `/waitlist`, `/dashboard`, and post-signup confirmation
- Track shares in `referral_shares` table

### Gamification
- Show "Share progress" bar toward rewards
- Real-time counter of referral signups

---

## 5. Automated Retargeting Pixel Manager
**Purpose**: Centralized pixel management for paid acquisition

### Technical Scope
- Create `src/components/admin/PixelManager.tsx`
- Support for:
  - Meta (Facebook) Pixel
  - Google Ads conversion tracking
  - LinkedIn Insight Tag
  - TikTok Pixel
- Dynamic event firing based on page/action
- Store pixel IDs in `app_settings` table

### Events Tracked
- Page view, lead signup, trial application, membership interest

---

## 6. Behavioral Email Triggers
**Purpose**: Send contextual emails based on user actions

### Technical Scope
- Create `supabase/functions/behavioral-email-trigger/index.ts`
- Trigger scenarios:
  - Abandoned trial application (started but didn't submit)
  - Viewed pricing 3x without signing up
  - Downloaded media kit but no contact
  - Inactive for 14 days after signup
- Uses Resend API (already configured)

### Email Templates
- Add to `src/lib/email-nurture-config.ts`:
  - `abandoned_trial`
  - `pricing_reminder`
  - `media_kit_followup`
  - `reactivation_14d`

---

## 7. Live Chat / Concierge Widget
**Purpose**: Instant engagement for high-value prospects

### Technical Scope
- Create `src/components/LiveChatWidget.tsx`
- Options:
  - **Option A**: Integrate with Orla AI (existing AI concierge)
  - **Option B**: Connect to Intercom/Crisp via connector
- Show proactively after 30 seconds on key pages
- Collect email before chat (if not logged in)
- Route to N8N for CRM sync

---

## 8. Automated A/B Testing Pipeline
**Purpose**: Continuously optimize landing pages

### Technical Scope
- Enhance `src/components/admin/ABTestingPanel.tsx`
- Auto-rotate headline/CTA variants
- Track conversions per variant in `ab_test_results` table
- Statistical significance calculator
- Winner auto-promotion via N8N trigger

### Test Candidates
- Hero headline variations
- CTA button text/color
- Social proof placement
- Pricing display format

---

## Database Migrations Required

```text
1. exit_intent_conversions - Track popup interactions
2. lead_scores - Store calculated scores per visitor/user
3. referral_shares - Log share actions and channels
4. ab_test_results - Variant performance data
5. behavioral_triggers - Queue for triggered emails
```

---

## N8N Workflow Additions

| Workflow | Trigger | Action |
|----------|---------|--------|
| High Lead Score Alert | Score > 80 | Slack + Email to sales |
| Abandoned Trial | No submit after 2h | Send rescue email |
| Content Published | New blog post | Social auto-post |
| Viral Share Reward | 5 shares in 24h | Credit user account |

---

## Implementation Priority

1. **Exit-Intent Popup** - Immediate impact, low effort
2. **Behavioral Email Triggers** - Leverages existing Resend setup
3. **Viral Referral Widgets** - Amplifies existing referral program
4. **Smart Lead Scoring** - Improves sales efficiency
5. **Content Generator** - Long-term SEO growth
6. **Retargeting Pixels** - Paid acquisition optimization
7. **Live Chat Widget** - Engagement boost
8. **A/B Testing Pipeline** - Continuous optimization

---

## Technical Considerations

- All new components will use existing patterns (Framer Motion, Radix UI, Tailwind)
- Edge functions will follow CORS and rate-limiting standards
- Admin panels integrate into existing `/admin` tab structure
- All tracking respects GDPR with consent checks

