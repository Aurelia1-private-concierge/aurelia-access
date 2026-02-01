-- =============================================
-- TIER 4: COMPLETE MISSING TABLES & ENHANCEMENTS
-- =============================================

-- Event Timeline/Itinerary (missing table)
CREATE TABLE IF NOT EXISTS public.event_itinerary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.vip_events(id) ON DELETE CASCADE,
  time_slot TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  activity TEXT NOT NULL,
  location TEXT,
  responsible_party TEXT,
  notes TEXT,
  is_public BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Cached Data for Offline Access (missing table)
CREATE TABLE IF NOT EXISTS public.offline_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL,
  cache_type TEXT NOT NULL,
  data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, cache_key)
);

-- Enable RLS on new tables
ALTER TABLE public.event_itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_cache ENABLE ROW LEVEL SECURITY;

-- Itinerary Policies
CREATE POLICY "Event organizers can manage itinerary"
  ON public.event_itinerary FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.vip_events ve
      WHERE ve.id = event_id AND ve.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Invited guests can view public itinerary"
  ON public.event_itinerary FOR SELECT
  USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM public.guest_lists gl
      WHERE gl.event_id = event_id AND gl.user_id = auth.uid()
    )
  );

-- Offline Cache Policies
CREATE POLICY "Users can manage their own cache"
  ON public.offline_cache FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_event_itinerary_event ON public.event_itinerary(event_id);
CREATE INDEX IF NOT EXISTS idx_event_itinerary_time ON public.event_itinerary(time_slot);
CREATE INDEX IF NOT EXISTS idx_offline_cache_user_key ON public.offline_cache(user_id, cache_key);
CREATE INDEX IF NOT EXISTS idx_offline_cache_expires ON public.offline_cache(expires_at);

-- Add missing columns to offline_sync_queue if needed
ALTER TABLE public.offline_sync_queue 
  ADD COLUMN IF NOT EXISTS device_id TEXT,
  ADD COLUMN IF NOT EXISTS client_timestamp TIMESTAMP WITH TIME ZONE;

-- Enable Realtime for guest list updates (if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'guest_lists'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.guest_lists;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'vip_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vip_events;
  END IF;
END $$;