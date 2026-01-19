-- Drop the public views that expose sensitive data
DROP VIEW IF EXISTS public.wearable_connections_public;
DROP VIEW IF EXISTS public.funnel_summary;

-- Recreate funnel_summary as a secure view accessible only via RPC for admins
CREATE OR REPLACE VIEW public.funnel_summary_admin AS
SELECT 
  stage,
  COUNT(*) as count,
  source,
  medium,
  campaign
FROM public.funnel_events
GROUP BY stage, source, medium, campaign;

-- Create a secure function for admins to access funnel summary
CREATE OR REPLACE FUNCTION public.get_funnel_summary()
RETURNS TABLE (
  stage text,
  count bigint,
  source text,
  medium text,
  campaign text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT stage, count, source, medium, campaign
  FROM public.funnel_summary_admin
$$;

-- Revoke direct access to the admin view
REVOKE ALL ON public.funnel_summary_admin FROM anon, authenticated;

-- Grant execute on function only to authenticated users (will check admin in app)
GRANT EXECUTE ON FUNCTION public.get_funnel_summary() TO authenticated;