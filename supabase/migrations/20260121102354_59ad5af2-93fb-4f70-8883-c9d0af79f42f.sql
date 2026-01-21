-- Health events table for tracking self-healing and manual fix history
CREATE TABLE public.health_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('self_heal', 'manual_fix', 'outage', 'recovery', 'alert')),
  component TEXT NOT NULL CHECK (component IN ('database', 'network', 'auth', 'dns', 'ssl', 'cdn', 'seo', 'edge_functions')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'pending')),
  details JSONB DEFAULT '{}',
  duration_ms INTEGER,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for time-range queries
CREATE INDEX idx_health_events_created ON public.health_events(created_at DESC);
CREATE INDEX idx_health_events_component ON public.health_events(component, created_at DESC);

-- Publication health logs table for storing diagnostic results
CREATE TABLE public.publication_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  overall_status TEXT NOT NULL CHECK (overall_status IN ('healthy', 'warning', 'critical', 'unknown')),
  checks JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  triggered_by TEXT DEFAULT 'scheduled' CHECK (triggered_by IN ('scheduled', 'manual', 'auto')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for domain and time queries
CREATE INDEX idx_publication_health_domain ON public.publication_health_logs(domain, created_at DESC);

-- Enable RLS
ALTER TABLE public.health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_health_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read/write all health events
CREATE POLICY "Admins can manage health events"
ON public.health_events
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- System can insert health events (for edge functions)
CREATE POLICY "System can insert health events"
ON public.health_events
FOR INSERT
WITH CHECK (true);

-- Admins can read/write publication health logs
CREATE POLICY "Admins can manage publication health logs"
ON public.publication_health_logs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- System can insert publication health logs
CREATE POLICY "System can insert publication health logs"
ON public.publication_health_logs
FOR INSERT
WITH CHECK (true);

-- Enable realtime for health events (admins can subscribe)
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.publication_health_logs;