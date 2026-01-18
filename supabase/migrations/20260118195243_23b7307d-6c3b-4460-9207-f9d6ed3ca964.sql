-- =============================================
-- SECURITY FIX: Tighten RLS policies on sensitive tables
-- (Analytics views are secured via their base tables)
-- =============================================

-- 5. Tighten profiles table - users can only read their own profile
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 6. Tighten calendar_events - only owner and admins can see events
DROP POLICY IF EXISTS "Users can view calendar events" ON public.calendar_events;

CREATE POLICY "Users can view own calendar events"
ON public.calendar_events FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 7. Tighten audit_logs - admin only
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Tighten login_devices - users can only see their own devices
DROP POLICY IF EXISTS "Users can view login devices" ON public.login_devices;

CREATE POLICY "Users can view own login devices"
ON public.login_devices FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 9. Tighten wellness_data - users can only see their own health data
DROP POLICY IF EXISTS "Users can view wellness data" ON public.wellness_data;

CREATE POLICY "Users can view own wellness data"
ON public.wellness_data FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 10. Tighten wearable_connections - users can only see their own connections
DROP POLICY IF EXISTS "Users can view wearable connections" ON public.wearable_connections;

CREATE POLICY "Users can view own wearable connections base"
ON public.wearable_connections FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 11. Tighten service_requests - only client, assigned partner, and admins
DROP POLICY IF EXISTS "Users can view service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Clients can view own service requests" ON public.service_requests;

CREATE POLICY "Users can view own or assigned service requests"
ON public.service_requests FOR SELECT
TO authenticated
USING (
  client_id = auth.uid() 
  OR partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 12. Tighten concierge_fees - only client and admins
DROP POLICY IF EXISTS "Users can view concierge fees" ON public.concierge_fees;

CREATE POLICY "Clients can view own concierge fees"
ON public.concierge_fees FOR SELECT
TO authenticated
USING (client_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 13. Tighten partner_commissions - only partner and admins
DROP POLICY IF EXISTS "Partners can view commissions" ON public.partner_commissions;

CREATE POLICY "Partners can view own commissions"
ON public.partner_commissions FOR SELECT
TO authenticated
USING (
  partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- 14. Tighten secure_messages - only sender or recipient
DROP POLICY IF EXISTS "Users can view secure messages" ON public.secure_messages;

CREATE POLICY "Users can view own secure messages"
ON public.secure_messages FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- 15. Tighten boardroom_sessions - only host and participants
DROP POLICY IF EXISTS "Users can view boardroom sessions" ON public.boardroom_sessions;

CREATE POLICY "Users can view own boardroom sessions"
ON public.boardroom_sessions FOR SELECT
TO authenticated
USING (
  host_id = auth.uid() 
  OR auth.jwt()->>'email' = ANY(participant_emails)
  OR public.has_role(auth.uid(), 'admin')
);

-- 16. Tighten client_notes - only admins
DROP POLICY IF EXISTS "Users can view client notes" ON public.client_notes;

CREATE POLICY "Admins can view client notes"
ON public.client_notes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));