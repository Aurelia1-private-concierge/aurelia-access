-- =============================================
-- MONITORING & ENHANCED FEATURES TABLES
-- =============================================

-- 1. Uptime Monitoring Table
CREATE TABLE IF NOT EXISTS public.uptime_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unknown',
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_uptime_checks_checked_at ON public.uptime_checks(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_uptime_checks_endpoint ON public.uptime_checks(endpoint_name, checked_at DESC);

-- 2. Incident History Table
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'minor',
  status TEXT NOT NULL DEFAULT 'investigating',
  affected_services TEXT[],
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Performance Metrics Table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value_ms NUMERIC NOT NULL,
  metadata JSONB,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON public.performance_metrics(metric_type, created_at DESC);

-- 4. Error Tracking Table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component TEXT,
  function_name TEXT,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_type ON public.error_logs(error_type, created_at DESC);

-- 5. AI Conversation Memory Table
CREATE TABLE IF NOT EXISTS public.ai_conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  memory_type TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  confidence NUMERIC DEFAULT 1.0,
  source TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_memory_user ON public.ai_conversation_memory(user_id, memory_type);

-- 6. Proactive Notifications Queue
CREATE TABLE IF NOT EXISTS public.proactive_notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  trigger_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proactive_queue_user ON public.proactive_notification_queue(user_id, status);

-- 7. Partner Performance Scores Table
CREATE TABLE IF NOT EXISTS public.partner_performance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  score_type TEXT NOT NULL,
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  sample_size INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  breakdown JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_scores_partner ON public.partner_performance_scores(partner_id, created_at DESC);

-- 8. Scheduled MCP Tasks Table
CREATE TABLE IF NOT EXISTS public.scheduled_mcp_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name TEXT NOT NULL,
  task_type TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  last_result JSONB,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.uptime_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proactive_notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_performance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_mcp_tasks ENABLE ROW LEVEL SECURITY;

-- Uptime Checks
CREATE POLICY "Admins can manage uptime checks" ON public.uptime_checks FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Service can insert uptime checks" ON public.uptime_checks FOR INSERT WITH CHECK (TRUE);

-- Incidents
CREATE POLICY "Anyone can view incidents" ON public.incidents FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage incidents" ON public.incidents FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Performance Metrics
CREATE POLICY "Admins can view performance metrics" ON public.performance_metrics FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert performance metrics" ON public.performance_metrics FOR INSERT WITH CHECK (TRUE);

-- Error Logs
CREATE POLICY "Admins can manage error logs" ON public.error_logs FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert error logs" ON public.error_logs FOR INSERT WITH CHECK (TRUE);

-- AI Conversation Memory
CREATE POLICY "Users can manage their own AI memory" ON public.ai_conversation_memory FOR ALL USING (auth.uid() = user_id);

-- Proactive Notification Queue
CREATE POLICY "Users can view their notifications" ON public.proactive_notification_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all notifications" ON public.proactive_notification_queue FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert notifications" ON public.proactive_notification_queue FOR INSERT WITH CHECK (TRUE);

-- Partner Performance Scores
CREATE POLICY "Partners can view their own scores" ON public.partner_performance_scores FOR SELECT
USING (EXISTS (SELECT 1 FROM partners p WHERE p.id = partner_id AND p.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "System can manage scores" ON public.partner_performance_scores FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Scheduled MCP Tasks
CREATE POLICY "Admins can manage scheduled tasks" ON public.scheduled_mcp_tasks FOR ALL USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_memory_updated_at BEFORE UPDATE ON public.ai_conversation_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_scheduled_tasks_updated_at BEFORE UPDATE ON public.scheduled_mcp_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();