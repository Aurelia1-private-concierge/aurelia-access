-- Add webhook_url and automation fields to contact_submissions for tracking
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS lead_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_response_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_notified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS webhook_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS processed_at timestamp with time zone;

-- Create contact_automation_logs table to track all automation events
CREATE TABLE IF NOT EXISTS public.contact_automation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  automation_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  details jsonb,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create webhook_endpoints table to store n8n/Slack/CRM webhook URLs
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  url text NOT NULL,
  endpoint_type text NOT NULL, -- 'n8n', 'slack', 'crm', 'custom'
  events text[] NOT NULL DEFAULT ARRAY['contact_form'], -- which events trigger this webhook
  headers jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for automation logs
CREATE POLICY "Admins can view automation logs"
  ON public.contact_automation_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service can insert automation logs"
  ON public.contact_automation_logs FOR INSERT
  WITH CHECK (true);

-- Admin-only policies for webhook endpoints
CREATE POLICY "Admins can manage webhook endpoints"
  ON public.webhook_endpoints FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service can read active webhooks"
  ON public.webhook_endpoints FOR SELECT
  USING (is_active = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_logs_contact_id ON public.contact_automation_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_type ON public.contact_automation_logs(automation_type);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_active ON public.webhook_endpoints(is_active) WHERE is_active = true;