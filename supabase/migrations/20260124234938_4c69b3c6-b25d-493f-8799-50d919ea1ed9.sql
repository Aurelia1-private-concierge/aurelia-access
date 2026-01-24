-- Add VIP detection columns to existing lead_scores table
ALTER TABLE public.lead_scores 
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'cold',
  ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vip_detected_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS admin_notified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS orla_engaged BOOLEAN DEFAULT false;

-- VIP Alerts for admin dashboard
CREATE TABLE IF NOT EXISTS public.vip_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_score_id UUID REFERENCES public.lead_scores(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  email TEXT,
  score INTEGER NOT NULL,
  tier TEXT NOT NULL,
  signals JSONB DEFAULT '{}'::jsonb,
  alert_type TEXT NOT NULL DEFAULT 'high_intent',
  status TEXT NOT NULL DEFAULT 'new',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vip_alerts
ALTER TABLE public.vip_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vip_alerts  
CREATE POLICY "System can insert VIP alerts"
  ON public.vip_alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage VIP alerts"
  ON public.vip_alerts FOR ALL
  USING (has_role(auth.uid(), 'admin'::text));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_scores_score ON public.lead_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_lead_scores_tier ON public.lead_scores(tier);
CREATE INDEX IF NOT EXISTS idx_lead_scores_is_vip ON public.lead_scores(is_vip);
CREATE INDEX IF NOT EXISTS idx_vip_alerts_status ON public.vip_alerts(status);
CREATE INDEX IF NOT EXISTS idx_vip_alerts_created ON public.vip_alerts(created_at DESC);

-- Function to auto-create VIP alert when score crosses threshold
CREATE OR REPLACE FUNCTION public.check_vip_threshold()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If score >= 70 and not already marked as VIP
  IF NEW.score >= 70 AND (OLD.is_vip IS NULL OR OLD.is_vip = false) THEN
    NEW.is_vip := true;
    NEW.vip_detected_at := now();
    
    -- Create VIP alert
    INSERT INTO public.vip_alerts (lead_score_id, session_id, email, score, tier, signals, alert_type)
    VALUES (NEW.id, NEW.session_id, NEW.email, NEW.score, NEW.tier, NEW.signals, 
      CASE 
        WHEN NEW.score >= 90 THEN 'ultra_high_intent'
        WHEN NEW.score >= 80 THEN 'high_intent'
        ELSE 'qualified_lead'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for VIP detection
DROP TRIGGER IF EXISTS trigger_check_vip ON public.lead_scores;
CREATE TRIGGER trigger_check_vip
  BEFORE UPDATE ON public.lead_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.check_vip_threshold();