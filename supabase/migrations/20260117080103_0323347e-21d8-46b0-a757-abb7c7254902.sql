-- Impact projects catalog (available projects to invest in)
CREATE TABLE public.impact_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'environment', 'education', 'healthcare', 'community'
  region TEXT NOT NULL,
  target_amount NUMERIC DEFAULT 0,
  current_amount NUMERIC DEFAULT 0,
  carbon_offset_tons NUMERIC DEFAULT 0,
  people_helped INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
  image_url TEXT,
  partner_name TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Member impact investments (linking users to projects)
CREATE TABLE public.impact_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.impact_projects(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  carbon_offset_tons NUMERIC DEFAULT 0,
  people_impacted INTEGER DEFAULT 0,
  investment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'pending'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.impact_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_investments ENABLE ROW LEVEL SECURITY;

-- Impact projects are viewable by all authenticated users
CREATE POLICY "Anyone can view active impact projects"
  ON public.impact_projects FOR SELECT
  USING (status = 'active' OR auth.uid() IS NOT NULL);

-- Admins can manage projects
CREATE POLICY "Admins can manage impact projects"
  ON public.impact_projects FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own investments
CREATE POLICY "Users can view their own investments"
  ON public.impact_investments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own investments
CREATE POLICY "Users can create their own investments"
  ON public.impact_investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own investments
CREATE POLICY "Users can update their own investments"
  ON public.impact_investments FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can manage all investments
CREATE POLICY "Admins can manage all investments"
  ON public.impact_investments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_impact_projects_updated_at
  BEFORE UPDATE ON public.impact_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_impact_investments_updated_at
  BEFORE UPDATE ON public.impact_investments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed some initial projects
INSERT INTO public.impact_projects (title, description, category, region, target_amount, current_amount, carbon_offset_tons, people_helped, partner_name, status) VALUES
('Clean Water Initiative', 'Providing clean drinking water to rural communities through sustainable well systems and water purification technology.', 'community', 'East Africa', 500000, 325000, 0, 12500, 'Water.org', 'active'),
('Renewable Energy Access', 'Installing solar microgrids in remote villages to provide sustainable electricity access.', 'environment', 'Southeast Asia', 750000, 480000, 1850, 8200, 'SolarAid', 'active'),
('Education Access Program', 'Building schools and providing educational resources to underserved communities.', 'education', 'South America', 400000, 280000, 0, 4500, 'Room to Read', 'active'),
('Rainforest Conservation', 'Protecting critical rainforest ecosystems and supporting indigenous communities.', 'environment', 'Amazon Basin', 1000000, 620000, 45000, 2800, 'Rainforest Alliance', 'active'),
('Healthcare Mobile Clinics', 'Deploying mobile healthcare units to remote regions lacking medical infrastructure.', 'healthcare', 'Sub-Saharan Africa', 600000, 410000, 0, 18000, 'Doctors Without Borders', 'active');