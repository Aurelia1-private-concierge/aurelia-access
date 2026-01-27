-- Create household type enum
CREATE TYPE public.household_type AS ENUM ('family', 'enterprise');

-- Create household member role enum
CREATE TYPE public.household_role AS ENUM ('owner', 'admin', 'member', 'dependent');

-- Create household member status enum
CREATE TYPE public.household_member_status AS ENUM ('active', 'pending', 'suspended');

-- Create households table for family/enterprise management
CREATE TABLE public.households (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type household_type NOT NULL DEFAULT 'family',
  primary_member_id UUID NOT NULL,
  subscription_id TEXT,
  credit_pool_enabled BOOLEAN NOT NULL DEFAULT false,
  total_pool_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create household members table
CREATE TABLE public.household_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role household_role NOT NULL DEFAULT 'member',
  permissions JSONB NOT NULL DEFAULT '{"can_request_services": true, "can_accept_bids": false, "can_view_billing": false, "can_manage_members": false, "can_use_pool_credits": true, "service_categories": "all"}'::jsonb,
  spending_limit NUMERIC,
  invited_by UUID,
  invited_email TEXT,
  joined_at TIMESTAMP WITH TIME ZONE,
  status household_member_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(household_id, user_id)
);

-- Create house partners table (pre-vetted vendors you manage directly)
CREATE TABLE public.house_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  category TEXT NOT NULL,
  subcategories TEXT[] DEFAULT '{}',
  description TEXT,
  service_regions TEXT[] DEFAULT '{}',
  contact_notes TEXT,
  pricing_tier TEXT DEFAULT 'standard',
  rating NUMERIC DEFAULT 5.0,
  is_preferred BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create house partner service history (track what they've done)
CREATE TABLE public.house_partner_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_partner_id UUID NOT NULL REFERENCES public.house_partners(id) ON DELETE CASCADE,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
  service_description TEXT NOT NULL,
  client_id UUID,
  amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'completed',
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_partner_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for households
CREATE POLICY "Users can view their own households"
  ON public.households FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = households.id
      AND household_members.user_id = auth.uid()
      AND household_members.status = 'active'
    )
  );

CREATE POLICY "Primary members can update their household"
  ON public.households FOR UPDATE
  USING (primary_member_id = auth.uid());

CREATE POLICY "Users can create households"
  ON public.households FOR INSERT
  WITH CHECK (primary_member_id = auth.uid());

-- RLS Policies for household members
CREATE POLICY "Household members can view their household members"
  ON public.household_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = auth.uid()
      AND hm.status = 'active'
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Household admins can manage members"
  ON public.household_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = auth.uid()
      AND hm.role IN ('owner', 'admin')
      AND hm.status = 'active'
    )
  );

CREATE POLICY "Users can update their own membership"
  ON public.household_members FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for house partners (admin only)
CREATE POLICY "Admins can manage house partners"
  ON public.house_partners FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active house partners"
  ON public.house_partners FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- RLS Policies for house partner services
CREATE POLICY "Admins can manage house partner services"
  ON public.house_partner_services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view services for their requests"
  ON public.house_partner_services FOR SELECT
  USING (client_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_household_members_updated_at
  BEFORE UPDATE ON public.household_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_house_partners_updated_at
  BEFORE UPDATE ON public.house_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_household_members_user ON public.household_members(user_id);
CREATE INDEX idx_household_members_household ON public.household_members(household_id);
CREATE INDEX idx_house_partners_category ON public.house_partners(category);
CREATE INDEX idx_house_partners_active ON public.house_partners(is_active);