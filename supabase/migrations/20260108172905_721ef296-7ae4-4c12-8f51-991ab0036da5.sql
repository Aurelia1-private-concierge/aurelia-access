-- Create launch_signups table for collecting email and SMS notification signups
CREATE TABLE public.launch_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  country_code TEXT DEFAULT '+1',
  notification_preference TEXT DEFAULT 'email' CHECK (notification_preference IN ('email', 'sms', 'both')),
  source TEXT DEFAULT 'maintenance_page',
  verified BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.launch_signups ENABLE ROW LEVEL SECURITY;

-- Public can signup (anonymous inserts)
CREATE POLICY "Anyone can sign up for launch alerts"
  ON public.launch_signups FOR INSERT
  WITH CHECK (true);

-- Only admins can read all signups
CREATE POLICY "Admins can view all signups"
  ON public.launch_signups FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can update (mark as notified)
CREATE POLICY "Admins can update signups"
  ON public.launch_signups FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete signups
CREATE POLICY "Admins can delete signups"
  ON public.launch_signups FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_launch_signups_updated_at
  BEFORE UPDATE ON public.launch_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();