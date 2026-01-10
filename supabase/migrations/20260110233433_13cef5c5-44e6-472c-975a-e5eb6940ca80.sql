-- Trial Applications & Management
CREATE TABLE public.trial_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  referral_source TEXT,
  annual_income_range TEXT,
  interests TEXT[],
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'converted', 'expired')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  trial_starts_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.trial_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own trial applications"
ON public.trial_applications FOR SELECT
USING (user_id = auth.uid());

-- Users can create their own applications
CREATE POLICY "Users can create trial applications"
ON public.trial_applications FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admins can manage all applications
CREATE POLICY "Admins can manage trial applications"
ON public.trial_applications FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX idx_trial_applications_user ON public.trial_applications(user_id);
CREATE INDEX idx_trial_applications_status ON public.trial_applications(status);
CREATE INDEX idx_trial_applications_email ON public.trial_applications(email);

-- Function to check if user has active trial
CREATE OR REPLACE FUNCTION public.has_active_trial(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trial_applications
    WHERE user_id = p_user_id
      AND status = 'approved'
      AND trial_starts_at <= now()
      AND trial_ends_at > now()
  )
$$;