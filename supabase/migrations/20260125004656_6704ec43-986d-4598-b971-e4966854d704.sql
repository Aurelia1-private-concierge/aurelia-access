-- Create notification outbox table for reliable delivery
CREATE TABLE public.notification_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  partner_ref TEXT NOT NULL,
  event_summary JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'retrying')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;

-- Index for efficient queue processing
CREATE INDEX idx_notification_outbox_status_retry ON public.notification_outbox(status, next_retry_at) WHERE status IN ('pending', 'retrying');

-- RLS policies
CREATE POLICY "Admins can manage notification outbox"
ON public.notification_outbox FOR ALL
USING (has_role(auth.uid(), 'admin'::text));

CREATE POLICY "Partners can view their own notifications"
ON public.notification_outbox FOR SELECT
USING (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()));

-- Updated timestamp trigger
CREATE TRIGGER update_notification_outbox_updated_at
BEFORE UPDATE ON public.notification_outbox
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.notification_outbox IS 'Outbox queue for reliable partner event notification delivery with retry support';