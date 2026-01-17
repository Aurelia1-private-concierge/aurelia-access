-- Create visitor_logs table for tracking website visitors
CREATE TABLE public.visitor_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  session_id TEXT,
  referrer TEXT,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_visitor_logs_timestamp ON public.visitor_logs (timestamp);
CREATE INDEX idx_visitor_logs_visit_date ON public.visitor_logs (visit_date);
CREATE INDEX idx_visitor_logs_ip_date ON public.visitor_logs (ip_address, visit_date);
CREATE INDEX idx_visitor_logs_path ON public.visitor_logs (path);

-- Enable RLS but allow public inserts (tracking should work for all visitors)
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (track visits)
CREATE POLICY "Anyone can track visits"
ON public.visitor_logs
FOR INSERT
WITH CHECK (true);

-- Only allow reading via edge functions (service role)
CREATE POLICY "Service role can read visitor logs"
ON public.visitor_logs
FOR SELECT
USING (false);

-- Add comment
COMMENT ON TABLE public.visitor_logs IS 'Tracks website visitor hits for analytics';