-- Add partner performance and service columns for UHNWI matching

-- Service coverage
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS service_regions text[] DEFAULT '{}';

-- Performance metrics
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 5.0;

ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS response_rate numeric DEFAULT 100;

ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS total_bookings integer DEFAULT 0;

-- Budget range for matching
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS min_budget numeric DEFAULT 0;

ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS max_budget numeric DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.partners.service_regions IS 'Geographic regions this partner serves (e.g., Europe, Monaco, London)';
COMMENT ON COLUMN public.partners.rating IS 'Average client rating (1-5 scale)';
COMMENT ON COLUMN public.partners.response_rate IS 'Percentage of requests responded to (0-100)';
COMMENT ON COLUMN public.partners.total_bookings IS 'Total completed bookings';
COMMENT ON COLUMN public.partners.min_budget IS 'Minimum budget partner accepts';
COMMENT ON COLUMN public.partners.max_budget IS 'Maximum budget partner handles (NULL = unlimited)';