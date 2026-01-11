-- Create table to store wearable device tokens
CREATE TABLE public.wearable_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('oura', 'whoop')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  device_name TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Create table to store wellness data
CREATE TABLE public.wellness_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  date DATE NOT NULL,
  readiness_score INTEGER,
  sleep_score INTEGER,
  recovery_score INTEGER,
  strain_score NUMERIC(4,1),
  hrv_avg INTEGER,
  resting_hr INTEGER,
  sleep_hours NUMERIC(4,2),
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider, date)
);

-- Enable RLS
ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for wearable_connections
CREATE POLICY "Users can view their own wearable connections"
ON public.wearable_connections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wearable connections"
ON public.wearable_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wearable connections"
ON public.wearable_connections
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wearable connections"
ON public.wearable_connections
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for wellness_data
CREATE POLICY "Users can view their own wellness data"
ON public.wellness_data
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wellness data"
ON public.wellness_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wellness data"
ON public.wellness_data
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_wearable_connections_updated_at
BEFORE UPDATE ON public.wearable_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();