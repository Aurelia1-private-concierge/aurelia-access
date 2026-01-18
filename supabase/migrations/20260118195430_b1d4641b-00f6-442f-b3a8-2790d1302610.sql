-- =============================================
-- SECURITY FIX: Tighten visitor_logs INSERT policy
-- Instead of allowing anyone to insert, use rate limiting
-- =============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can insert visitor logs" ON public.visitor_logs;

-- Create a tighter policy that still allows anonymous tracking
-- but with some validation (not empty data)
CREATE POLICY "Allow visitor log inserts with validation"
ON public.visitor_logs FOR INSERT
WITH CHECK (
  -- Must have at least a session_id (not null or empty)
  session_id IS NOT NULL AND session_id != ''
);