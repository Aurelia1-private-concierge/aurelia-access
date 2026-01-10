-- Create notification_settings table for user preferences
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  daily_digest_enabled BOOLEAN NOT NULL DEFAULT true,
  digest_time TIME NOT NULL DEFAULT '09:00:00',
  alert_types TEXT[] NOT NULL DEFAULT ARRAY['service_update', 'new_offer', 'request_status'],
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_notification_settings UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view own notification settings"
ON public.notification_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own notification settings"
ON public.notification_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own notification settings"
ON public.notification_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create sent_notifications log table
CREATE TABLE public.sent_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sent_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can view all sent notifications
CREATE POLICY "Admins can view all sent notifications"
ON public.sent_notifications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own notifications
CREATE POLICY "Users can view own sent notifications"
ON public.sent_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Add updated_at trigger for notification_settings
CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_notification_settings_user_id ON public.notification_settings(user_id);
CREATE INDEX idx_sent_notifications_user_id ON public.sent_notifications(user_id);
CREATE INDEX idx_sent_notifications_status ON public.sent_notifications(status);