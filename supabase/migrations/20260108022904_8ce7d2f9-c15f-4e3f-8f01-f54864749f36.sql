-- Fix: Unrestricted notification insertion policy
-- Drop the overly permissive policy that allows any user to insert notifications for any user_id
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a proper policy that only allows users to insert notifications for themselves
-- If system/admin needs to insert notifications, use Edge Functions with service role
CREATE POLICY "Users can insert their own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);