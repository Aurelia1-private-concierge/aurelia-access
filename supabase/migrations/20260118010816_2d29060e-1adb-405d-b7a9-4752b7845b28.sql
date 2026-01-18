-- Phase 2: Create secure wearable connections view (hides tokens)
CREATE OR REPLACE VIEW public.wearable_connections_public
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  provider,
  device_name,
  expires_at,
  last_sync_at,
  sync_enabled,
  created_at,
  updated_at
FROM public.wearable_connections;

-- Grant access to the view
GRANT SELECT ON public.wearable_connections_public TO authenticated;

-- Phase 3: Recreate funnel_summary view with security_invoker
DROP VIEW IF EXISTS public.funnel_summary;
CREATE VIEW public.funnel_summary
WITH (security_invoker = true) AS
SELECT 
  source,
  medium,
  campaign,
  count(DISTINCT CASE WHEN stage = 'landing' THEN session_id ELSE NULL END) AS landing_count,
  count(DISTINCT CASE WHEN stage = 'signup_started' THEN session_id ELSE NULL END) AS signup_started_count,
  count(DISTINCT CASE WHEN stage = 'signup_completed' THEN session_id ELSE NULL END) AS signup_completed_count,
  count(DISTINCT CASE WHEN stage = 'onboarding_started' THEN session_id ELSE NULL END) AS onboarding_started_count,
  count(DISTINCT CASE WHEN stage = 'onboarding_completed' THEN session_id ELSE NULL END) AS onboarding_completed_count,
  count(DISTINCT CASE WHEN stage = 'trial_started' THEN session_id ELSE NULL END) AS trial_started_count,
  count(DISTINCT CASE WHEN stage = 'converted' THEN session_id ELSE NULL END) AS converted_count,
  date_trunc('day', min(created_at)) AS first_event_date,
  date_trunc('day', max(created_at)) AS last_event_date
FROM funnel_events
GROUP BY source, medium, campaign;

-- Grant view access to admins only
GRANT SELECT ON public.funnel_summary TO authenticated;