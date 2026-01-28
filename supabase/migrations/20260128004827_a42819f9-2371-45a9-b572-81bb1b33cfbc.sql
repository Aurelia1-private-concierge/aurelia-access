-- =============================================================
-- PRIVACY ENHANCEMENT: IP Anonymization & Data Retention
-- Addresses: ip_anonymization_needed (INFO level)
-- Implements GDPR/CCPA best practices for privacy compliance
-- =============================================================

-- 1. Create IP anonymization function
-- Masks the last octet of IPv4 addresses and last 4 groups of IPv6
CREATE OR REPLACE FUNCTION public.anonymize_ip(ip text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  parts text[];
BEGIN
  -- Return NULL if input is NULL or empty
  IF ip IS NULL OR ip = '' THEN
    RETURN ip;
  END IF;
  
  -- IPv4: 192.168.1.100 → 192.168.1.0
  IF ip ~ '^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$' THEN
    parts := string_to_array(ip, '.');
    parts[4] := '0';
    RETURN array_to_string(parts, '.');
  END IF;
  
  -- IPv6: Mask last 4 groups (last 64 bits)
  IF ip ~ ':' THEN
    RETURN regexp_replace(ip, ':[^:]+:[^:]+:[^:]+:[^:]+$', '::0');
  END IF;
  
  -- Unknown format, return as-is (might be 'unknown' or other placeholder)
  RETURN ip;
END;
$$;

-- 2. Create trigger function to anonymize IPs on insert
CREATE OR REPLACE FUNCTION public.anonymize_visitor_ip()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.ip_address IS NOT NULL THEN
    NEW.ip_address := public.anonymize_ip(NEW.ip_address);
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS trigger_anonymize_visitor_ip ON public.visitor_logs;

CREATE TRIGGER trigger_anonymize_visitor_ip
BEFORE INSERT ON public.visitor_logs
FOR EACH ROW
EXECUTE FUNCTION public.anonymize_visitor_ip();

-- 4. Anonymize existing IP data in visitor_logs (retroactive GDPR compliance)
UPDATE public.visitor_logs
SET ip_address = public.anonymize_ip(ip_address)
WHERE ip_address IS NOT NULL 
  AND ip_address != 'unknown'
  AND ip_address !~ '\.0$'; -- Skip already anonymized IPs

-- 5. Create data retention cleanup function (90-day retention policy)
CREATE OR REPLACE FUNCTION public.cleanup_old_visitor_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.visitor_logs
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE LOG 'cleanup_old_visitor_logs: Deleted % records older than 90 days', deleted_count;
  
  RETURN deleted_count;
END;
$$;

-- 6. Also apply to funnel_events table (used by visitor-tracking edge function)
-- Create trigger function for funnel_events
CREATE OR REPLACE FUNCTION public.anonymize_funnel_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Session IDs are already anonymized (random strings), no IP stored here
  -- This trigger is a placeholder for future PII protection if needed
  RETURN NEW;
END;
$$;

-- 7. Create cleanup function for funnel_events (90-day retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_funnel_events()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.funnel_events
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE LOG 'cleanup_old_funnel_events: Deleted % records older than 90 days', deleted_count;
  
  RETURN deleted_count;
END;
$$;

-- 8. Create cleanup function for user_behavior_events (90-day retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_behavior_events()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.user_behavior_events
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE LOG 'cleanup_old_behavior_events: Deleted % records older than 90 days', deleted_count;
  
  RETURN deleted_count;
END;
$$;

-- 9. Create master cleanup function that runs all retention policies
CREATE OR REPLACE FUNCTION public.run_data_retention_cleanup()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  visitor_deleted integer;
  funnel_deleted integer;
  behavior_deleted integer;
BEGIN
  visitor_deleted := public.cleanup_old_visitor_logs();
  funnel_deleted := public.cleanup_old_funnel_events();
  behavior_deleted := public.cleanup_old_behavior_events();
  
  RETURN jsonb_build_object(
    'visitor_logs_deleted', visitor_deleted,
    'funnel_events_deleted', funnel_deleted,
    'behavior_events_deleted', behavior_deleted,
    'executed_at', NOW()
  );
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION public.anonymize_ip(text) IS 'Anonymizes IP addresses by masking the last octet (IPv4) or last 4 groups (IPv6) for GDPR/CCPA compliance';
COMMENT ON FUNCTION public.anonymize_visitor_ip() IS 'Trigger function that anonymizes IP addresses before insert into visitor_logs';
COMMENT ON FUNCTION public.cleanup_old_visitor_logs() IS 'Removes visitor log entries older than 90 days as per data retention policy';
COMMENT ON FUNCTION public.run_data_retention_cleanup() IS 'Master function to run all data retention cleanup policies - call periodically via cron or edge function';