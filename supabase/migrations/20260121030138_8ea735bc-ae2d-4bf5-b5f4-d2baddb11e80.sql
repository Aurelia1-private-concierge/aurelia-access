-- Add last_triggered_at column to track webhook delivery
ALTER TABLE public.webhook_endpoints 
ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMP WITH TIME ZONE;

-- Add comment for clarity
COMMENT ON COLUMN public.webhook_endpoints.last_triggered_at IS 'Timestamp of the last successful webhook delivery';