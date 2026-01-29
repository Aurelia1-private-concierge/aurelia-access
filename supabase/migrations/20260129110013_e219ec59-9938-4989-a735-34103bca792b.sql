-- AI Specialists Directory
CREATE TABLE public.ai_specialists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  capabilities TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}',
  model TEXT NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  system_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  avg_response_time_ms INTEGER,
  total_queries INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 100.00,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Query Logs for tracking and analytics
CREATE TABLE public.ai_query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID REFERENCES public.ai_specialists(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query_type TEXT NOT NULL, -- 'database', 'insights', 'chat'
  query_text TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  response_text TEXT,
  tokens_used INTEGER,
  response_time_ms INTEGER,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Insights for automated analysis
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL, -- 'anomaly', 'trend', 'recommendation', 'alert'
  category TEXT NOT NULL, -- 'members', 'requests', 'partners', 'revenue'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'info', -- info, warning, critical
  is_read BOOLEAN DEFAULT false,
  is_actionable BOOLEAN DEFAULT true,
  action_taken BOOLEAN DEFAULT false,
  action_notes TEXT,
  generated_by UUID REFERENCES public.ai_specialists(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- DB Schema Cache for AI context
CREATE TABLE public.db_schema_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL UNIQUE,
  schema_json JSONB NOT NULL,
  row_count INTEGER,
  sample_data JSONB,
  last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_schema_cache ENABLE ROW LEVEL SECURITY;

-- Admin-only policies using has_role function
CREATE POLICY "Admins can manage AI specialists"
ON public.ai_specialists FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view query logs"
ON public.ai_query_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert query logs"
ON public.ai_query_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage insights"
ON public.ai_insights FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage schema cache"
ON public.db_schema_cache FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_ai_specialists_updated_at
BEFORE UPDATE ON public.ai_specialists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_db_schema_cache_updated_at
BEFORE UPDATE ON public.db_schema_cache
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update specialist stats
CREATE OR REPLACE FUNCTION public.update_specialist_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.specialist_id IS NOT NULL THEN
    UPDATE public.ai_specialists
    SET 
      total_queries = total_queries + 1,
      avg_response_time_ms = (
        SELECT AVG(response_time_ms)::INTEGER 
        FROM public.ai_query_logs 
        WHERE specialist_id = NEW.specialist_id 
        AND status = 'completed'
      ),
      success_rate = (
        SELECT (COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0) * 100)
        FROM public.ai_query_logs 
        WHERE specialist_id = NEW.specialist_id
      )
    WHERE id = NEW.specialist_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_specialist_stats_trigger
AFTER INSERT OR UPDATE ON public.ai_query_logs
FOR EACH ROW EXECUTE FUNCTION public.update_specialist_stats();