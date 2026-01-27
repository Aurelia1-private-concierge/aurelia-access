
# Security Hardening & Audit Remediation Plan

## Executive Summary
This plan addresses four critical security and operational items flagged in the Global Audit Dashboard:
1. **16 Permissive RLS Policies** - Review and tighten INSERT/UPDATE policies with `USING(true)` or `WITH CHECK(true)`
2. **Contact Form Rate Limiting** - Already implemented, but needs enhancement for the Contact page
3. **CAPTCHA Protection for Trial Applications** - Add Cloudflare Turnstile to high-risk forms
4. **Edge Function Monitoring & Backup Verification** - Implement cold start tracking and backup health checks

---

## Phase 1: RLS Policy Analysis & Remediation

### Current State
16 tables have permissive policies flagged by the linter. After analysis, they fall into three categories:

### Category A: Intentionally Public Analytics (Keep As-Is with Documentation)
These tables are designed for anonymous visitor tracking and analytics. The `INSERT` with `WITH CHECK(true)` is intentional:

| Table | Policy | Justification |
|-------|--------|---------------|
| `ab_test_assignments` | Anyone can create assignments | Anonymous A/B test tracking |
| `attribution_events` | Anyone can insert attribution events | Marketing attribution |
| `exit_intent_conversions` | Anyone can insert conversions | Conversion tracking |
| `lead_scores` | Anyone can insert/update | Anonymous lead scoring |
| `performance_metrics` | Anyone can insert | Client-side performance data |
| `uptime_checks` | Service can insert | Automated health checks |

**Action**: Update security findings to mark these as intentional with `ignore = true` and documented reason.

### Category B: Service Role Only (Restrict to Service Role)
These tables should only be writable by backend functions using service role:

| Table | Current Policy | Fix |
|-------|----------------|-----|
| `prismatic_api_logs` | Service role can insert | Restrict to `auth.jwt()->>'role' = 'service_role'` |
| `proactive_notification_queue` | System can insert | Restrict to service role only |
| `vip_alerts` | System can insert | Restrict to service role only |
| `sms_conversations` | Service role can insert | Restrict to service role only |

### Category C: Authenticated with Validation (Tighten Policies)
These tables need user identification or additional validation:

| Table | Current Policy | New Policy |
|-------|----------------|------------|
| `concierge_requests` | Anyone can create | Require `auth.uid()` or rate limit by IP |
| `partner_applications` | Anyone can submit | Require `auth.uid()` and tie to user |
| `partner_waitlist` | Anyone can join | Keep public but add rate limiting |
| `referral_shares` | Anyone can insert | Require valid referral_code exists |

---

## Phase 2: Contact Form Rate Limiting Enhancement

### Current Implementation
- `ContactSection.tsx` (homepage): Uses `checkRateLimit()` with fingerprint + email
- `Contact.tsx` (dedicated page): **Missing rate limiting** - needs to be added

### Enhancement Plan
Add rate limiting to `Contact.tsx` using the existing infrastructure:

```text
File: src/pages/Contact.tsx

1. Import rate limiting utilities:
   - import { checkRateLimit, generateFingerprint } from "@/lib/rate-limit"

2. Add rate check before form submission:
   - Generate identifier: `${generateFingerprint()}_${email}`
   - Call checkRateLimit() with action_type "contact_form"
   - Block submission if rate limited

3. Show user-friendly error message on rate limit
```

---

## Phase 3: CAPTCHA Protection for Trial Applications

### Implementation: Cloudflare Turnstile
Turnstile is the recommended invisible CAPTCHA that protects forms without user friction.

### Required Changes

#### 3.1 Add Turnstile Secret to Edge Functions
```text
Secret: TURNSTILE_SECRET_KEY
Purpose: Server-side verification of Turnstile tokens
```

#### 3.2 Create Verification Edge Function
```text
File: supabase/functions/verify-turnstile/index.ts

- Accepts turnstile token from client
- Calls Cloudflare's /siteverify endpoint
- Returns success/failure
- Logs failed verifications for monitoring
```

#### 3.3 Update Trial Application Form
```text
File: src/pages/TrialApplication.tsx

1. Add Turnstile widget component
2. Capture token on form submission
3. Verify token before database insert
4. Show error if verification fails
```

#### 3.4 Create Reusable Turnstile Component
```text
File: src/components/security/TurnstileWidget.tsx

- Invisible mode by default
- Callback for token capture
- Error handling for blocked requests
- Loading state management
```

---

## Phase 4: Edge Function Monitoring

### 4.1 Cold Start Tracking
Enhance the existing `health-check` function to track and store cold start times:

```text
Changes to: supabase/functions/health-check/index.ts

1. Add timing for edge function invocations
2. Distinguish between warm and cold starts
3. Store response times in uptime_checks with metadata:
   - is_cold_start: boolean
   - boot_time_ms: number
   - execution_time_ms: number

4. Alert if cold start exceeds threshold (e.g., 2000ms)
```

### 4.2 Edge Function Performance Table
```text
New table: edge_function_metrics

Columns:
- id (uuid, primary key)
- function_name (text)
- invoked_at (timestamptz)
- response_time_ms (integer)
- is_cold_start (boolean)
- status (text: success, error, timeout)
- created_at (timestamptz)
```

### 4.3 Dashboard Integration
Add edge function metrics to the Global Audit Dashboard:
- Average cold start time
- Cold start frequency
- Slowest functions (user-facing)

---

## Phase 5: Automated Backup Verification

### 5.1 Database Backup Check
Supabase automatically creates daily backups. We'll add verification:

```text
New scheduled task in: supabase/functions/scheduled-tasks/index.ts

Task type: "backup_verification"

Actions:
1. Query pg_stat_archiver for last successful archive
2. Verify backup timestamp is within 24 hours
3. Store result in health_events table
4. Alert if backup is stale (> 24h)
```

### 5.2 Storage Backup Verification
Check that critical storage buckets are accessible:

```text
Checks:
- List files in avatars bucket
- List files in consignments bucket
- Verify bucket policies are intact
- Log results to health_events
```

### 5.3 Backup Health Dashboard Widget
Add backup status to Admin System Health tab:
- Last successful backup timestamp
- Backup size trend
- Restoration test status (manual)

---

## Technical Implementation Details

### Database Migration Required
```sql
-- 1. Tighten service-role-only policies
DROP POLICY IF EXISTS "Service role can insert API logs" ON public.prismatic_api_logs;
CREATE POLICY "Service role only" ON public.prismatic_api_logs
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert notifications" ON public.proactive_notification_queue;
CREATE POLICY "Service role only" ON public.proactive_notification_queue
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert VIP alerts" ON public.vip_alerts;
CREATE POLICY "Service role only" ON public.vip_alerts
  FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert SMS" ON public.sms_conversations;
CREATE POLICY "Service role only" ON public.sms_conversations
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 2. Add referral validation
DROP POLICY IF EXISTS "Anyone can insert referral shares" ON public.referral_shares;
CREATE POLICY "Authenticated users with valid referral" ON public.referral_shares
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM referral_codes WHERE code = referral_code)
  );

-- 3. Create edge function metrics table
CREATE TABLE IF NOT EXISTS public.edge_function_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  invoked_at timestamptz NOT NULL DEFAULT now(),
  response_time_ms integer NOT NULL,
  is_cold_start boolean DEFAULT false,
  status text NOT NULL DEFAULT 'success',
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for performance queries
CREATE INDEX idx_edge_metrics_function ON public.edge_function_metrics(function_name, invoked_at DESC);

-- RLS: Service role only for inserts, admins can read
ALTER TABLE public.edge_function_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert metrics" ON public.edge_function_metrics
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Admins can view metrics" ON public.edge_function_metrics
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

### Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/verify-turnstile/index.ts` | CAPTCHA token verification |
| `src/components/security/TurnstileWidget.tsx` | Reusable CAPTCHA component |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/Contact.tsx` | Add rate limiting (lines 43-60) |
| `src/pages/TrialApplication.tsx` | Add Turnstile CAPTCHA |
| `supabase/functions/health-check/index.ts` | Add cold start tracking |
| `supabase/functions/scheduled-tasks/index.ts` | Add backup verification task |
| `supabase/config.toml` | Add verify-turnstile function config |

---

## Implementation Priority

| Phase | Priority | Complexity | Impact |
|-------|----------|------------|--------|
| 1. RLS Policy Fixes | High | Low | Security |
| 2. Contact Form Rate Limit | High | Low | Abuse Prevention |
| 3. CAPTCHA for Trials | Medium | Medium | Spam Prevention |
| 4. Edge Function Monitoring | Medium | Medium | Observability |
| 5. Backup Verification | Low | Low | Disaster Recovery |

---

## Success Criteria

1. Database linter shows only intentionally-public policies (documented)
2. Contact page rejects submissions after 5 attempts in 60 minutes
3. Trial applications require valid Turnstile token
4. Edge function cold starts are tracked and alertable
5. Backup age is verified daily and alerts if stale

---

## Security Findings Updates
After implementation, update the security findings to:
- Mark intentional analytics policies as "ignored" with documented reason
- Delete resolved RLS policy findings
- Add new finding for any tables that remain permissive

