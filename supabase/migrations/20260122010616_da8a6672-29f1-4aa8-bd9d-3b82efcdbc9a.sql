-- Create pricing_rules table for dynamic pricing configuration
CREATE TABLE public.pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  base_credits INTEGER NOT NULL DEFAULT 1,
  partner_price_tiers JSONB DEFAULT '{"tiers": [{"min_price": 0, "max_price": 10000, "credit_adjustment": 0}, {"min_price": 10001, "max_price": 50000, "credit_adjustment": 2}, {"min_price": 50001, "max_price": 100000, "credit_adjustment": 5}, {"min_price": 100001, "max_price": null, "credit_adjustment": 10}]}'::jsonb,
  priority_multipliers JSONB DEFAULT '{"standard": 1, "priority": 1.5, "urgent": 2, "immediate": 3}'::jsonb,
  budget_multipliers JSONB DEFAULT '{"thresholds": [{"min": 0, "max": 50000, "multiplier": 1}, {"min": 50001, "max": 100000, "multiplier": 1.25}, {"min": 100001, "max": null, "multiplier": 1.5}]}'::jsonb,
  time_multipliers JSONB DEFAULT '{"peak_season": 1.25, "last_minute": 1.5, "advance_booking": 0.9}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  effective_to TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pricing_history table for audit trail
CREATE TABLE public.pricing_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pricing_rule_id UUID REFERENCES public.pricing_rules(id) ON DELETE SET NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('create', 'update', 'delete')),
  previous_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create currency_rates_cache table
CREATE TABLE public.currency_rates_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base_currency TEXT NOT NULL,
  rates JSONB NOT NULL DEFAULT '{}'::jsonb,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  UNIQUE(base_currency)
);

-- Enable RLS
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_rates_cache ENABLE ROW LEVEL SECURITY;

-- Pricing rules: admins can manage (using user_roles table)
CREATE POLICY "Admins can manage pricing rules" ON public.pricing_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authenticated users can view active pricing rules" ON public.pricing_rules
  FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- Pricing history: admins only
CREATE POLICY "Admins can view pricing history" ON public.pricing_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert pricing history" ON public.pricing_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Currency cache: public read, authenticated write
CREATE POLICY "Anyone can read currency rates" ON public.currency_rates_cache
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage currency cache" ON public.currency_rates_cache
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at on pricing_rules
CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON public.pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default pricing rules from current SERVICE_CREDIT_COSTS
INSERT INTO public.pricing_rules (category, base_credits) VALUES
  ('private_aviation', 3),
  ('yacht_charter', 3),
  ('real_estate', 2),
  ('collectibles', 2),
  ('events_access', 2),
  ('security', 2),
  ('wellness', 1),
  ('travel', 1),
  ('dining', 1),
  ('chauffeur', 1),
  ('shopping', 1);