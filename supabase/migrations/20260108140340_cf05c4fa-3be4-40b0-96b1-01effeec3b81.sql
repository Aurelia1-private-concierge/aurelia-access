-- Create user_preferences table for structured preference categories
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  confidence_score DECIMAL DEFAULT 0.5,
  source TEXT DEFAULT 'explicit',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category, preference_key)
);

-- Create travel_dna_profile table for computed insights
CREATE TABLE public.travel_dna_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  traveler_archetype TEXT,
  pace_preference TEXT,
  accommodation_tier TEXT,
  cuisine_affinities TEXT[],
  activity_preferences JSONB,
  seasonal_patterns JSONB,
  budget_comfort_zone JSONB,
  special_requirements TEXT[],
  onboarding_completed BOOLEAN DEFAULT false,
  last_computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_category ON public.user_preferences(user_id, category);
CREATE INDEX idx_travel_dna_user_id ON public.travel_dna_profile(user_id);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_dna_profile ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for travel_dna_profile
CREATE POLICY "Users can view their own travel DNA"
ON public.travel_dna_profile FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own travel DNA"
ON public.travel_dna_profile FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel DNA"
ON public.travel_dna_profile FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_travel_dna_profile_updated_at
BEFORE UPDATE ON public.travel_dna_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();