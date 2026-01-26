-- Add delivery tracking columns to partner_messages
ALTER TABLE public.partner_messages 
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'in_app' CHECK (delivery_method IN ('in_app', 'email', 'both')),
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_clicked_at TIMESTAMP WITH TIME ZONE;

-- Create index for delivery status queries
CREATE INDEX IF NOT EXISTS idx_partner_messages_delivery_status ON public.partner_messages(delivery_status);
CREATE INDEX IF NOT EXISTS idx_partner_messages_delivered_at ON public.partner_messages(delivered_at);

-- Add delivery tracking to notification_outbox as well
ALTER TABLE public.notification_outbox
ADD COLUMN IF NOT EXISTS delivery_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'webhook';

-- Create a view for message delivery analytics
CREATE OR REPLACE VIEW public.partner_message_delivery_stats AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  delivery_status,
  delivery_method,
  COUNT(*) as message_count,
  COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as delivered_count,
  COUNT(CASE WHEN email_opened_at IS NOT NULL THEN 1 END) as opened_count,
  AVG(EXTRACT(EPOCH FROM (delivered_at - created_at))) as avg_delivery_seconds
FROM public.partner_messages
GROUP BY DATE_TRUNC('day', created_at), delivery_status, delivery_method;