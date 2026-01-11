-- Create table for tracking user login devices and sessions
CREATE TABLE public.login_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  location TEXT,
  is_trusted BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  login_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_login_devices_user_id ON public.login_devices(user_id);
CREATE INDEX idx_login_devices_fingerprint ON public.login_devices(device_fingerprint);
CREATE UNIQUE INDEX idx_login_devices_user_device ON public.login_devices(user_id, device_fingerprint);

-- Enable RLS
ALTER TABLE public.login_devices ENABLE ROW LEVEL SECURITY;

-- Users can view their own devices
CREATE POLICY "Users can view their own devices"
ON public.login_devices
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own devices (e.g., mark as trusted)
CREATE POLICY "Users can update their own devices"
ON public.login_devices
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own devices
CREATE POLICY "Users can delete their own devices"
ON public.login_devices
FOR DELETE
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own device records
CREATE POLICY "Users can insert their own devices"
ON public.login_devices
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create table for login notifications/alerts
CREATE TABLE public.login_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL, -- 'new_device', 'new_location', 'suspicious_activity', 'breach_detected'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  device_id UUID REFERENCES public.login_devices(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_login_alerts_user_id ON public.login_alerts(user_id);
CREATE INDEX idx_login_alerts_created_at ON public.login_alerts(created_at DESC);

-- Enable RLS
ALTER TABLE public.login_alerts ENABLE ROW LEVEL SECURITY;

-- Users can view their own alerts
CREATE POLICY "Users can view their own alerts"
ON public.login_alerts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own alerts (mark as read)
CREATE POLICY "Users can update their own alerts"
ON public.login_alerts
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own alerts
CREATE POLICY "Users can delete their own alerts"
ON public.login_alerts
FOR DELETE
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own alerts
CREATE POLICY "Users can insert their own alerts"
ON public.login_alerts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at on login_devices
CREATE TRIGGER update_login_devices_updated_at
BEFORE UPDATE ON public.login_devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();