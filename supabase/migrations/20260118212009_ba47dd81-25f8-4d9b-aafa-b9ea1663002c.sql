-- Create table for scheduled scrape jobs
CREATE TABLE IF NOT EXISTS public.scheduled_scrape_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  extraction_type TEXT,
  extraction_schema JSONB,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('hourly', 'daily', 'weekly', 'monthly')),
  webhook_url TEXT,
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  last_result JSONB,
  is_active BOOLEAN DEFAULT true,
  run_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_scrape_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own jobs
CREATE POLICY "Users can view their own scheduled jobs"
  ON public.scheduled_scrape_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own jobs
CREATE POLICY "Users can create their own scheduled jobs"
  ON public.scheduled_scrape_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own jobs
CREATE POLICY "Users can update their own scheduled jobs"
  ON public.scheduled_scrape_jobs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own jobs
CREATE POLICY "Users can delete their own scheduled jobs"
  ON public.scheduled_scrape_jobs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for efficient job scheduling queries
CREATE INDEX idx_scheduled_jobs_next_run ON public.scheduled_scrape_jobs (next_run_at) WHERE is_active = true;
CREATE INDEX idx_scheduled_jobs_user ON public.scheduled_scrape_jobs (user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_scheduled_jobs_updated_at
  BEFORE UPDATE ON public.scheduled_scrape_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for storing scrape results history
CREATE TABLE IF NOT EXISTS public.scrape_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.scheduled_scrape_jobs(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  extraction_type TEXT,
  raw_data JSONB,
  extracted_data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for scrape results
ALTER TABLE public.scrape_results ENABLE ROW LEVEL SECURITY;

-- Users can only see their own results
CREATE POLICY "Users can view their own scrape results"
  ON public.scrape_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own results
CREATE POLICY "Users can create their own scrape results"
  ON public.scrape_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own results
CREATE POLICY "Users can delete their own scrape results"
  ON public.scrape_results
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX idx_scrape_results_user ON public.scrape_results (user_id);
CREATE INDEX idx_scrape_results_job ON public.scrape_results (job_id);
CREATE INDEX idx_scrape_results_created ON public.scrape_results (created_at DESC);