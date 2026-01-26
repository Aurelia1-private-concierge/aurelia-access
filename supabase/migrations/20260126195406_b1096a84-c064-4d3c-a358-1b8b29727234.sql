-- Create table for campaign budgets and ad spend tracking
CREATE TABLE public.social_ad_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.social_campaigns(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  budget_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  daily_limit NUMERIC(12,2),
  alert_threshold NUMERIC(3,2) DEFAULT 0.80, -- Alert when 80% spent
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for ad spend transactions/history
CREATE TABLE public.social_ad_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES public.social_ad_budgets(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  transaction_type TEXT NOT NULL, -- 'spend', 'refund', 'adjustment'
  description TEXT,
  platform_transaction_id TEXT, -- External platform reference
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for platform ad account connections
CREATE TABLE public.social_ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'meta', 'linkedin', 'twitter'
  account_id TEXT NOT NULL, -- Platform's account ID
  account_name TEXT,
  access_token_encrypted TEXT, -- Store encrypted
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  account_status TEXT DEFAULT 'pending', -- pending, active, expired, revoked
  permissions JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform, account_id)
);

-- Create table for ROI metrics
CREATE TABLE public.social_ad_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES public.social_ad_budgets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions BIGINT DEFAULT 0,
  spend NUMERIC(12,2) DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  cpm NUMERIC(10,4), -- Cost per 1000 impressions
  cpc NUMERIC(10,4), -- Cost per click
  cpa NUMERIC(10,4), -- Cost per acquisition
  roas NUMERIC(10,4), -- Return on ad spend
  platform TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(budget_id, date, platform)
);

-- Enable RLS
ALTER TABLE public.social_ad_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_ad_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_ad_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only for now
CREATE POLICY "Admins can manage ad budgets" ON public.social_ad_budgets
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage ad transactions" ON public.social_ad_transactions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.social_ad_budgets b 
    WHERE b.id = budget_id 
    AND public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Users can manage own ad accounts" ON public.social_ad_accounts
FOR ALL USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view ad metrics" ON public.social_ad_metrics
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_social_ad_budgets_updated_at
BEFORE UPDATE ON public.social_ad_budgets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_ad_accounts_updated_at
BEFORE UPDATE ON public.social_ad_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check budget alerts
CREATE OR REPLACE FUNCTION public.check_budget_alert(p_budget_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_budget RECORD;
  v_percentage NUMERIC;
  v_alert BOOLEAN := false;
  v_message TEXT := '';
BEGIN
  SELECT * INTO v_budget FROM public.social_ad_budgets WHERE id = p_budget_id;
  
  IF v_budget IS NULL THEN
    RETURN jsonb_build_object('error', 'Budget not found');
  END IF;
  
  IF v_budget.budget_amount > 0 THEN
    v_percentage := v_budget.spent_amount / v_budget.budget_amount;
    
    IF v_percentage >= 1 THEN
      v_alert := true;
      v_message := 'Budget exhausted';
    ELSIF v_percentage >= v_budget.alert_threshold THEN
      v_alert := true;
      v_message := format('Budget at %s%% of limit', round(v_percentage * 100));
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'alert', v_alert,
    'percentage', round(v_percentage * 100, 2),
    'message', v_message,
    'spent', v_budget.spent_amount,
    'budget', v_budget.budget_amount,
    'remaining', v_budget.budget_amount - v_budget.spent_amount
  );
END;
$$;