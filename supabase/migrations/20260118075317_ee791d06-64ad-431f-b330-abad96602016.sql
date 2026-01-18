-- Create surprise_me_requests table to track premium surprise experience purchases
CREATE TABLE public.surprise_me_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  credits_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'revealed', 'fulfilled', 'cancelled')),
  experience_title TEXT,
  experience_description TEXT,
  estimated_value_min INTEGER,
  estimated_value_max INTEGER,
  partner_id UUID REFERENCES public.partners(id),
  revealed_at TIMESTAMP WITH TIME ZONE,
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.surprise_me_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own surprise requests"
  ON public.surprise_me_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create own surprise requests"
  ON public.surprise_me_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own requests (for ratings/feedback)
CREATE POLICY "Users can update own surprise requests"
  ON public.surprise_me_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create user_surprise_preferences table
CREATE TABLE public.user_surprise_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_categories TEXT[] DEFAULT '{}',
  excluded_categories TEXT[] DEFAULT '{}',
  budget_comfort_level TEXT DEFAULT 'moderate' CHECK (budget_comfort_level IN ('conservative', 'moderate', 'adventurous', 'unlimited')),
  surprise_frequency TEXT DEFAULT 'occasional' CHECK (surprise_frequency IN ('weekly', 'monthly', 'occasional', 'special_occasions')),
  dietary_restrictions TEXT[] DEFAULT '{}',
  accessibility_needs TEXT,
  travel_radius_km INTEGER DEFAULT 100,
  preferred_days TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_surprise_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_surprise_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences"
  ON public.user_surprise_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_surprise_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_surprise_me_requests_updated_at
  BEFORE UPDATE ON public.surprise_me_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_surprise_preferences_updated_at
  BEFORE UPDATE ON public.user_surprise_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_surprise_me_requests_user_id ON public.surprise_me_requests(user_id);
CREATE INDEX idx_surprise_me_requests_status ON public.surprise_me_requests(status);
CREATE INDEX idx_surprise_me_requests_created_at ON public.surprise_me_requests(created_at DESC);