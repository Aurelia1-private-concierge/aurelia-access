-- Create partner waitlist table for capturing interest
CREATE TABLE public.partner_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  company_name TEXT,
  interest_type TEXT NOT NULL CHECK (interest_type IN ('partner', 'member')),
  category_preferences TEXT[],
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to join the waitlist (public insert)
CREATE POLICY "Anyone can join partner waitlist" 
ON public.partner_waitlist 
FOR INSERT 
WITH CHECK (true);

-- Only admins can read waitlist entries
CREATE POLICY "Admins can read partner waitlist" 
ON public.partner_waitlist 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Admins can delete entries
CREATE POLICY "Admins can delete partner waitlist entries" 
ON public.partner_waitlist 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);