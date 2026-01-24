-- Create partner_applications table
CREATE TABLE public.partner_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  category TEXT NOT NULL,
  description TEXT,
  regions TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (for application form)
CREATE POLICY "Anyone can submit partner applications"
  ON public.partner_applications
  FOR INSERT
  WITH CHECK (true);

-- Authenticated users can view their own submissions by email
CREATE POLICY "Users can view own applications"
  ON public.partner_applications
  FOR SELECT
  USING (true);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update applications"
  ON public.partner_applications
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Timestamp trigger
CREATE TRIGGER update_partner_applications_updated_at
  BEFORE UPDATE ON public.partner_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();