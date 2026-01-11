-- Create user behavior tracking table for analytics
CREATE TABLE public.user_behavior_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  event_type TEXT NOT NULL,
  page_path TEXT NOT NULL,
  element_id TEXT,
  element_class TEXT,
  element_text TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  scroll_depth INTEGER,
  time_on_page INTEGER,
  referrer TEXT,
  user_agent TEXT,
  ip_country TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_user_behavior_session ON public.user_behavior_events(session_id);
CREATE INDEX idx_user_behavior_page ON public.user_behavior_events(page_path);
CREATE INDEX idx_user_behavior_type ON public.user_behavior_events(event_type);
CREATE INDEX idx_user_behavior_created ON public.user_behavior_events(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_behavior_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (anonymous tracking)
CREATE POLICY "Anyone can insert behavior events"
ON public.user_behavior_events
FOR INSERT
WITH CHECK (true);

-- Only admins can view behavior events
CREATE POLICY "Admins can view all behavior events"
ON public.user_behavior_events
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add realtime for live dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_behavior_events;

-- Create heatmap aggregation view
CREATE OR REPLACE VIEW public.page_heatmap_data AS
SELECT 
  page_path,
  element_id,
  element_class,
  COUNT(*) as click_count,
  DATE_TRUNC('hour', created_at) as hour
FROM public.user_behavior_events
WHERE event_type = 'click' AND element_id IS NOT NULL
GROUP BY page_path, element_id, element_class, DATE_TRUNC('hour', created_at);

-- Create session aggregation view
CREATE OR REPLACE VIEW public.session_summary AS
SELECT 
  session_id,
  user_id,
  MIN(created_at) as session_start,
  MAX(created_at) as session_end,
  COUNT(DISTINCT page_path) as pages_visited,
  COUNT(*) as total_events,
  MAX(scroll_depth) as max_scroll_depth,
  MAX(time_on_page) as total_time,
  referrer
FROM public.user_behavior_events
GROUP BY session_id, user_id, referrer;