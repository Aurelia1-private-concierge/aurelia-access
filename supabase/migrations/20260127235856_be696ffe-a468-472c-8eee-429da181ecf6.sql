-- =====================================================
-- SECURITY HARDENING: RLS Policy Tightening & Metrics Table
-- =====================================================

-- 1. Tighten service-role-only policies for backend-only tables

-- prismatic_api_logs: Only backend functions should write
DROP POLICY IF EXISTS "Service role can insert API logs" ON public.prismatic_api_logs;
CREATE POLICY "Service role can insert API logs" 
  ON public.prismatic_api_logs 
  FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- proactive_notification_queue: Only backend functions should write  
DROP POLICY IF EXISTS "System can insert notifications" ON public.proactive_notification_queue;
CREATE POLICY "Service role can insert notifications" 
  ON public.proactive_notification_queue 
  FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- vip_alerts: Only triggers/backend should write (already has trigger-based insert)
DROP POLICY IF EXISTS "System can insert VIP alerts" ON public.vip_alerts;
CREATE POLICY "Service role can insert VIP alerts" 
  ON public.vip_alerts 
  FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- sms_conversations: Only backend functions should write
DROP POLICY IF EXISTS "Service role can insert SMS" ON public.sms_conversations;
CREATE POLICY "Service role can insert SMS conversations" 
  ON public.sms_conversations 
  FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- 2. Tighten referral_shares - require auth and valid referral_code from referrals table
DROP POLICY IF EXISTS "Anyone can insert referral shares" ON public.referral_shares;
CREATE POLICY "Authenticated users can insert referral shares" 
  ON public.referral_shares 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    referral_code IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.referrals WHERE referral_code = referral_shares.referral_code)
  );

-- 3. Create edge function metrics table for cold start tracking
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

-- Add comment for documentation
COMMENT ON TABLE public.edge_function_metrics IS 'Tracks edge function performance including cold starts for monitoring';

-- Index for performance queries by function and time
CREATE INDEX IF NOT EXISTS idx_edge_metrics_function_time 
  ON public.edge_function_metrics(function_name, invoked_at DESC);

-- Index for cold start analysis  
CREATE INDEX IF NOT EXISTS idx_edge_metrics_cold_starts 
  ON public.edge_function_metrics(is_cold_start, invoked_at DESC) 
  WHERE is_cold_start = true;

-- Enable RLS
ALTER TABLE public.edge_function_metrics ENABLE ROW LEVEL SECURITY;

-- Service role can insert metrics (from edge functions)
CREATE POLICY "Service role can insert metrics" 
  ON public.edge_function_metrics 
  FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Admins can view all metrics
CREATE POLICY "Admins can view metrics" 
  ON public.edge_function_metrics 
  FOR SELECT 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Create backup verification logs table
CREATE TABLE IF NOT EXISTS public.backup_verification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_type text NOT NULL,
  status text NOT NULL DEFAULT 'success',
  details jsonb,
  verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.backup_verification_logs IS 'Tracks automated backup verification results';

CREATE INDEX IF NOT EXISTS idx_backup_logs_time 
  ON public.backup_verification_logs(verified_at DESC);

ALTER TABLE public.backup_verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert backup logs" 
  ON public.backup_verification_logs 
  FOR INSERT 
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Admins can view backup logs" 
  ON public.backup_verification_logs 
  FOR SELECT 
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));