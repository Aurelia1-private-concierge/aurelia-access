-- Fix funnel_summary view to use SECURITY INVOKER mode
-- This ensures the view respects the calling user's RLS policies
-- instead of bypassing them with SECURITY DEFINER mode

-- Drop the existing view
DROP VIEW IF EXISTS public.funnel_summary;

-- Recreate the view with security_invoker = true
CREATE OR REPLACE VIEW public.funnel_summary 
WITH (security_invoker = true)
AS
SELECT 
  source,
  medium,
  campaign,
  count(DISTINCT CASE WHEN stage = 'landing'::text THEN session_id ELSE NULL::text END) AS landing_count,
  count(DISTINCT CASE WHEN stage = 'signup_started'::text THEN session_id ELSE NULL::text END) AS signup_started_count,
  count(DISTINCT CASE WHEN stage = 'signup_completed'::text THEN session_id ELSE NULL::text END) AS signup_completed_count,
  count(DISTINCT CASE WHEN stage = 'onboarding_started'::text THEN session_id ELSE NULL::text END) AS onboarding_started_count,
  count(DISTINCT CASE WHEN stage = 'onboarding_completed'::text THEN session_id ELSE NULL::text END) AS onboarding_completed_count,
  count(DISTINCT CASE WHEN stage = 'trial_started'::text THEN session_id ELSE NULL::text END) AS trial_started_count,
  count(DISTINCT CASE WHEN stage = 'converted'::text THEN session_id ELSE NULL::text END) AS converted_count,
  date_trunc('day'::text, min(created_at)) AS first_event_date,
  date_trunc('day'::text, max(created_at)) AS last_event_date
FROM public.funnel_events
GROUP BY source, medium, campaign;

-- Grant SELECT to authenticated users (they still need to pass RLS on funnel_events)
GRANT SELECT ON public.funnel_summary TO authenticated;

-- Add comment explaining the security model
COMMENT ON VIEW public.funnel_summary IS 'Aggregated funnel analytics. Uses security_invoker=true so only admins (who have SELECT access on funnel_events via RLS) can query this view.';