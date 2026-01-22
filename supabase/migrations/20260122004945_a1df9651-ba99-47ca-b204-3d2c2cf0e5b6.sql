-- Add tracking link support to service requests
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS tracking_link TEXT,
ADD COLUMN IF NOT EXISTS tracking_link_label TEXT DEFAULT 'Live Location',
ADD COLUMN IF NOT EXISTS tracking_link_added_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS tracking_link_expires_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN public.service_requests.tracking_link IS 'External tracking URL (Google Maps, fleet tracker) shared by driver/partner';
COMMENT ON COLUMN public.service_requests.tracking_link_label IS 'Display label for the tracking link';
COMMENT ON COLUMN public.service_requests.tracking_link_added_at IS 'When the tracking link was added';
COMMENT ON COLUMN public.service_requests.tracking_link_expires_at IS 'Optional expiry time for the tracking link';