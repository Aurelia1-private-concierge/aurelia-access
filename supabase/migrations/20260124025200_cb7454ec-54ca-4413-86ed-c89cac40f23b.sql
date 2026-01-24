-- Create testimonials table for dynamic testimonials
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  title TEXT,
  location TEXT,
  member_since TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create backlink_opportunities table
CREATE TABLE public.backlink_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  domain_authority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  type TEXT,
  priority TEXT DEFAULT 'medium',
  notes TEXT,
  contacted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_sources table for outreach
CREATE TABLE public.lead_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT,
  leads_found INTEGER DEFAULT 0,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;

-- Public read for testimonials (shown on public pages)
CREATE POLICY "Testimonials are publicly readable" 
ON public.testimonials FOR SELECT USING (status = 'active');

-- Admin full access for testimonials
CREATE POLICY "Admins can manage testimonials" 
ON public.testimonials FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin access for backlinks
CREATE POLICY "Admins can view backlink opportunities" 
ON public.backlink_opportunities FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage backlink opportunities" 
ON public.backlink_opportunities FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admin access for lead sources
CREATE POLICY "Admins can view lead sources" 
ON public.lead_sources FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can manage lead sources" 
ON public.lead_sources FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Insert initial testimonials data
INSERT INTO public.testimonials (quote, author, title, location, member_since, image_url, is_featured, display_order) VALUES
('Aurelia secured a private viewing of a Basquiat before it went to auction. No other service could have made that happen.', 'Alexandra M.', 'Art Collector', 'Geneva', '2021', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face', true, 1),
('When my flight was cancelled in Tokyo, they had a private jet ready within 90 minutes. That level of response is unprecedented.', 'James K.', 'Tech Executive', 'Singapore', '2020', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', true, 2),
('The discretion is absolute. In my position, that is not a luxury—it is a necessity. Aurelia understands this implicitly.', 'Victoria S.', 'Family Office Principal', 'London', '2019', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face', true, 3);

-- Insert initial backlink opportunities
INSERT INTO public.backlink_opportunities (category, name, url, domain_authority, status, type, priority) VALUES
('Luxury Publications', 'Robb Report', 'robbreport.com', 78, 'pending', 'Guest Post', 'high'),
('Luxury Publications', 'Luxury Daily', 'luxurydaily.com', 65, 'pending', 'Press Release', 'high'),
('Business & Finance', 'Forbes', 'forbes.com', 95, 'pending', 'Contributor', 'high'),
('Business & Finance', 'Bloomberg', 'bloomberg.com', 93, 'pending', 'Interview', 'high'),
('Travel & Lifestyle', 'Condé Nast Traveler', 'cntraveler.com', 88, 'pending', 'Feature', 'medium'),
('Tech & AI', 'TechCrunch', 'techcrunch.com', 94, 'pending', 'Startup Feature', 'medium'),
('Directories', 'LinkedIn Company', 'linkedin.com', 98, 'active', 'Company Page', 'low');

-- Insert initial lead sources
INSERT INTO public.lead_sources (name, source_type, category, url, leads_found, is_active) VALUES
('Private Jet Card Comparison', 'directory', 'private_aviation', 'https://privatejetcardcomparison.com', 156, true),
('Yachting Pages Directory', 'directory', 'yacht_charter', 'https://yachtingpages.com', 89, true),
('Luxury Real Estate Brokers', 'linkedin', 'real_estate', NULL, 234, true),
('UHNW Family Office Network', 'referral', 'concierge', NULL, 45, true),
('Forbes Luxury Council', 'directory', 'events', 'https://councils.forbes.com/luxury', 67, false),
('Google Maps - Private Security', 'google', 'security', NULL, 112, true);

-- Create triggers for updated_at
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_backlink_opportunities_updated_at
BEFORE UPDATE ON public.backlink_opportunities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_sources_updated_at
BEFORE UPDATE ON public.lead_sources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();