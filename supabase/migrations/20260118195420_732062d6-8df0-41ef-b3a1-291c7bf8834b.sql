-- =============================================
-- SECURITY FIX: Remove overly permissive SELECT policies
-- Drop policies that grant access to 'public' role (unauthenticated)
-- Keep only authenticated policies
-- =============================================

-- Profiles: Drop public role SELECT policy (keep authenticated one)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Boardroom sessions: Drop public role SELECT policy (keep authenticated one)
DROP POLICY IF EXISTS "Users can view sessions they host or are invited to" ON public.boardroom_sessions;

-- Launch signups: Drop duplicate public role SELECT policy (keep authenticated one)
DROP POLICY IF EXISTS "Only admins can read launch signups" ON public.launch_signups;

-- Wearable connections: Drop public role SELECT policy (keep authenticated one)
DROP POLICY IF EXISTS "Users can view their own wearable connections" ON public.wearable_connections;

-- Partners: Drop duplicate public role SELECT policies (keep the proper ones)
DROP POLICY IF EXISTS "Users can view own partner record" ON public.partners;

-- Boardroom participants: Tighten to require authentication
DROP POLICY IF EXISTS "Users can view participants of sessions they have access to" ON public.boardroom_participants;

CREATE POLICY "Authenticated users can view participants of their sessions"
ON public.boardroom_participants FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM boardroom_sessions s
  WHERE s.id = boardroom_participants.session_id
  AND (s.host_id = auth.uid() OR auth.jwt()->>'email' = ANY(s.participant_emails))
));