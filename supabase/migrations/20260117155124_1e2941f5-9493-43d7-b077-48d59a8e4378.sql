-- Create potential_partners table for automated discovery
CREATE TABLE IF NOT EXISTS public.potential_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  website TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  description TEXT,
  score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'new',
  source TEXT,
  discovered_at TIMESTAMPTZ DEFAULT now(),
  last_verified_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_name, category)
);

-- Create discovery_logs table for tracking discovery runs
CREATE TABLE IF NOT EXISTS public.discovery_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind TEXT NOT NULL,
  source TEXT,
  partners_found INTEGER DEFAULT 0,
  users_found INTEGER DEFAULT 0,
  error TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create potential_users table for automated user discovery
CREATE TABLE IF NOT EXISTS public.potential_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,
  linkedin_url TEXT,
  source TEXT,
  score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'new',
  interests TEXT[],
  estimated_net_worth TEXT,
  discovered_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.potential_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.potential_users ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (service role can bypass RLS)
CREATE POLICY "Admins can manage potential_partners" ON public.potential_partners
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage discovery_logs" ON public.discovery_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage potential_users" ON public.potential_users
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_potential_partners_category ON public.potential_partners(category);
CREATE INDEX IF NOT EXISTS idx_potential_partners_status ON public.potential_partners(status);
CREATE INDEX IF NOT EXISTS idx_potential_partners_score ON public.potential_partners(score DESC);
CREATE INDEX IF NOT EXISTS idx_potential_users_status ON public.potential_users(status);
CREATE INDEX IF NOT EXISTS idx_potential_users_score ON public.potential_users(score DESC);
CREATE INDEX IF NOT EXISTS idx_discovery_logs_kind ON public.discovery_logs(kind);
CREATE INDEX IF NOT EXISTS idx_discovery_logs_created ON public.discovery_logs(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_potential_partners_updated_at
  BEFORE UPDATE ON public.potential_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_potential_users_updated_at
  BEFORE UPDATE ON public.potential_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();