

# UHNWI Social Media Advertising System

## Overview
This plan creates a comprehensive **Multi-Platform Social Advertising Suite** to automatically promote Aurelia across all UHNWI (Ultra High Net Worth Individual) social media platforms. The system will leverage existing infrastructure while adding true automated posting capabilities via platform APIs and n8n integration.

## Current State Analysis
Your project already has:
- **Social Scheduler** (`SocialScheduler.tsx`) - Manual post scheduling to database
- **Automated Posting UI** (`AutomatedPosting.tsx`) - Automation rules interface (UI only)
- **Marketing Packages** (`marketing-packages.ts`) - UHNW networks and social strategy definitions
- **Ad Creatives Gallery** (`AdCreatives.tsx`) - Ready-to-use ad assets
- **N8N Automation Hub** - Workflow integration infrastructure
- **n8n-proxy Edge Function** - Server-side proxy for n8n webhooks

**Gap identified**: The current system schedules posts to a database but lacks actual API integration to publish them automatically.

---

## Target Platforms

### Primary UHNWI Platforms
| Platform | Audience | Integration Method |
|----------|----------|-------------------|
| **LinkedIn** | C-Suite, Family Offices, PE/VC | LinkedIn Marketing API |
| **X (Twitter)** | Tech executives, Crypto wealth | Twitter API v2 |
| **Instagram** | Lifestyle affluents, Luxury enthusiasts | Meta Graph API |
| **Facebook** | Private groups, Wealth networks | Meta Graph API |
| **Reddit** | r/fatFIRE, r/UHNWI, r/HENRYfinance | Reddit API |
| **Threads** | Emerging affluent network | Meta Threads API |

### Niche UHNWI Communities (Content Distribution)
- Tiger 21 newsletters
- YPO chapter communications
- Family Office Exchange updates
- Campden Wealth forums

---

## Architecture

```text
+-------------------+     +------------------------+     +------------------+
|                   |     |                        |     |                  |
|  Admin Dashboard  +---->+  social_campaigns      +---->+  Edge Function   |
|  (Schedule Posts) |     |  social_posts          |     |  social-publish  |
|                   |     |  social_accounts       |     |                  |
+-------------------+     +------------------------+     +--------+---------+
                                                                  |
                          +---------------------------------------+
                          |
          +---------------+---------------+---------------+
          |               |               |               |
    +-----v-----+   +-----v-----+   +-----v-----+   +-----v-----+
    | LinkedIn  |   |  Twitter  |   |   Meta    |   |  Reddit   |
    |    API    |   |   API v2  |   | Graph API |   |    API    |
    +-----------+   +-----------+   +-----------+   +-----------+
```

---

## Implementation Components

### 1. Database Schema Extensions

**New Tables:**
- `social_accounts` - Store connected platform credentials (encrypted)
- `social_campaigns` - Multi-platform advertising campaigns
- `social_post_analytics` - Track engagement metrics per post
- `social_content_library` - Reusable content templates for UHNWI messaging

**Schema Updates:**
- Add `platform_post_id` to `social_posts` for tracking published posts
- Add `engagement_metrics` JSONB column for likes/shares/comments

### 2. Edge Functions (Backend Publishing)

**`social-publish/index.ts`**
- Unified publishing endpoint for all platforms
- Platform-specific adapters for API differences
- Rate limiting and retry logic
- Webhook callback for n8n integration

**`social-scheduler-cron/index.ts`**
- Scheduled function (every 5 minutes)
- Queries `social_posts` for due items
- Triggers `social-publish` for each pending post
- Updates post status and captures `platform_post_id`

**Platform Adapters:**
- `twitter-adapter.ts` - X/Twitter API v2 posting
- `linkedin-adapter.ts` - LinkedIn Share API
- `meta-adapter.ts` - Instagram/Facebook/Threads
- `reddit-adapter.ts` - Reddit submission API

### 3. Admin Dashboard Enhancement

**New "Social Advertising" Tab** (`SocialAdvertisingDashboard.tsx`)
- Platform connection management (OAuth flows)
- Unified content calendar view
- Campaign builder with UHNWI targeting presets
- Real-time engagement analytics
- AI content generator for platform-specific messaging

**Components:**
- `PlatformConnector.tsx` - OAuth integration UI
- `CampaignBuilder.tsx` - Multi-platform campaign creation
- `ContentCalendar.tsx` - Visual post scheduling
- `EngagementMetrics.tsx` - Cross-platform analytics
- `UHNWIAudienceSelector.tsx` - Pre-defined targeting profiles

### 4. AI-Powered Content Optimization

**`generate-social-content/index.ts`** Edge Function
- Generate platform-optimized variations of base content
- Adapt tone for each platform's UHNWI audience
- Suggest optimal posting times based on engagement data
- A/B test headline variations

**Content Templates:**
- LinkedIn: Thought leadership, industry insights
- Twitter/X: Quick insights, luxury news commentary
- Instagram: Lifestyle imagery captions
- Reddit: Community-appropriate r/fatFIRE messaging
- Facebook: Long-form exclusive access narratives

### 5. N8N Workflow Integration

**Pre-built Workflows:**
- `social_post_scheduled` - Trigger when new post is scheduled
- `social_post_published` - Log successful publications
- `social_engagement_alert` - Notify on high engagement
- `social_content_approved` - Trigger multi-platform distribution

---

## Required API Credentials (Secrets)

| Secret Name | Platform | Purpose |
|-------------|----------|---------|
| `TWITTER_CONSUMER_KEY` | X/Twitter | App authentication |
| `TWITTER_CONSUMER_SECRET` | X/Twitter | App authentication |
| `TWITTER_ACCESS_TOKEN` | X/Twitter | User posting access |
| `TWITTER_ACCESS_TOKEN_SECRET` | X/Twitter | User posting access |
| `LINKEDIN_CLIENT_ID` | LinkedIn | OAuth app |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn | OAuth app |
| `META_APP_ID` | Instagram/Facebook | Graph API access |
| `META_APP_SECRET` | Instagram/Facebook | Graph API access |
| `REDDIT_CLIENT_ID` | Reddit | App authentication |
| `REDDIT_CLIENT_SECRET` | Reddit | App authentication |

---

## Pre-Built Campaign Templates

### 1. "Beyond Ordinary" Launch Campaign
- 30-day multi-platform rollout
- Staggered content across LinkedIn, Instagram, X
- Targeting: C-Suite, Family Office principals
- Budget allocation recommendations

### 2. "The Circle" Community Promotion
- Highlight exclusive member benefits
- Reddit r/fatFIRE native advertising
- LinkedIn thought leadership series

### 3. "Prescience" AI Feature Showcase
- Tech-focused messaging for crypto/tech wealth
- Twitter threads, LinkedIn articles
- Instagram Stories showcasing the AI interface

### 4. Partner Spotlight Series
- Rotating content featuring vetted partners
- Cross-platform distribution with tracking links

---

## Targeting Presets (From Existing Config)

**LinkedIn:**
- C-Suite titles, Company size 500+
- Industries: Finance, Tech, Legal, Healthcare
- Seniority: Director and above
- Interests: Luxury travel, Private aviation, Fine wine

**Instagram:**
- Interests: Luxury, Travel, Yachts, Private jets
- Behaviors: Frequent travelers, Luxury purchasers
- Location: Major financial centers

**Reddit:**
- r/fatFIRE (10M+ net worth discussions)
- r/HENRYfinance (High Earners)
- r/ExpatFIRE (International UHNW)

---

## Files to Create

1. `supabase/migrations/[timestamp]_social_advertising_schema.sql`
2. `supabase/functions/social-publish/index.ts`
3. `supabase/functions/social-scheduler-cron/index.ts`
4. `supabase/functions/generate-social-content/index.ts`
5. `src/components/admin/SocialAdvertisingDashboard.tsx`
6. `src/components/admin/social/PlatformConnector.tsx`
7. `src/components/admin/social/CampaignBuilder.tsx`
8. `src/components/admin/social/ContentCalendar.tsx`
9. `src/components/admin/social/EngagementMetrics.tsx`
10. `src/components/admin/social/UHNWIAudienceSelector.tsx`
11. `src/hooks/useSocialAdvertising.ts`
12. `src/lib/social-adapters/twitter.ts`
13. `src/lib/social-adapters/linkedin.ts`
14. `src/lib/social-adapters/meta.ts`
15. `src/lib/social-adapters/reddit.ts`

---

## Files to Modify

1. `src/pages/Admin.tsx` - Add "Social Advertising" tab
2. `supabase/config.toml` - Register new Edge Functions
3. `src/lib/marketing-packages.ts` - Add campaign automation hooks

---

## Implementation Phases

### Phase 1: Foundation
- Database schema for social accounts and campaigns
- Admin UI for platform connection management
- Basic post scheduling enhancement

### Phase 2: Publishing Engine
- Edge function for multi-platform publishing
- Twitter API integration (existing code patterns available)
- Scheduled cron for automatic posting

### Phase 3: Full Platform Support
- LinkedIn, Meta (Instagram/Facebook), Reddit adapters
- Cross-platform campaign builder
- Analytics integration

### Phase 4: AI Optimization
- Content generation for platform-specific messaging
- Optimal timing suggestions
- Engagement prediction

---

## Security Considerations

- All API credentials stored as Supabase secrets
- OAuth tokens encrypted in `social_accounts` table
- Rate limiting per platform to avoid API bans
- Admin-only access via existing RLS patterns

