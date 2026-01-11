-- Fix security definer views by dropping and recreating as security invoker
DROP VIEW IF EXISTS public.page_heatmap_data;
DROP VIEW IF EXISTS public.session_summary;

-- Recreate views with SECURITY INVOKER (default, but explicit)
CREATE VIEW public.page_heatmap_data 
WITH (security_invoker = true)
AS
SELECT 
  page_path,
  element_id,
  element_class,
  COUNT(*) as click_count,
  DATE_TRUNC('hour', created_at) as hour
FROM public.user_behavior_events
WHERE event_type = 'click' AND element_id IS NOT NULL
GROUP BY page_path, element_id, element_class, DATE_TRUNC('hour', created_at);

CREATE VIEW public.session_summary 
WITH (security_invoker = true)
AS
SELECT 
  session_id,
  user_id,
  MIN(created_at) as session_start,
  MAX(created_at) as session_end,
  COUNT(DISTINCT page_path) as pages_visited,
  COUNT(*) as total_events,
  MAX(scroll_depth) as max_scroll_depth,
  MAX(time_on_page) as total_time,
  referrer
FROM public.user_behavior_events
GROUP BY session_id, user_id, referrer;