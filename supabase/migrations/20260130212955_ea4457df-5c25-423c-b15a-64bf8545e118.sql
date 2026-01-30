-- Create affiliate_sales table for tracking partner referrals
CREATE TABLE public.affiliate_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_code TEXT NOT NULL,
  experience_name TEXT NOT NULL,
  partner_company TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  preferred_category TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'sold', 'declined')),
  sale_amount NUMERIC,
  commission_rate NUMERIC DEFAULT 6,
  commission_amount NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for lead capture (public form)
CREATE POLICY "Anyone can submit affiliate leads"
ON public.affiliate_sales
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view/update affiliate sales
CREATE POLICY "Admins can view all affiliate sales"
ON public.affiliate_sales
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update affiliate sales"
ON public.affiliate_sales
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_affiliate_sales_updated_at
BEFORE UPDATE ON public.affiliate_sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_affiliate_sales_code ON public.affiliate_sales(affiliate_code);
CREATE INDEX idx_affiliate_sales_status ON public.affiliate_sales(status);