-- Create ab_tests table for real A/B testing data
CREATE TABLE public.ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  winner_variant_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ab_test_variants table
CREATE TABLE public.ab_test_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  traffic_percentage INTEGER NOT NULL DEFAULT 50 CHECK (traffic_percentage >= 0 AND traffic_percentage <= 100),
  impressions INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ab_test_assignments table to track user assignments
CREATE TABLE public.ab_test_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.ab_test_variants(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  converted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(test_id, session_id)
);

-- Enable RLS
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for ab_tests (admins only for write, public read for running tests)
CREATE POLICY "Admins can manage ab_tests"
  ON public.ab_tests
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view running tests"
  ON public.ab_tests
  FOR SELECT
  USING (status = 'running');

-- RLS policies for ab_test_variants
CREATE POLICY "Admins can manage variants"
  ON public.ab_test_variants
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view variants of running tests"
  ON public.ab_test_variants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ab_tests 
      WHERE id = test_id AND status = 'running'
    )
  );

-- RLS policies for ab_test_assignments
CREATE POLICY "Admins can view all assignments"
  ON public.ab_test_assignments
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create assignments"
  ON public.ab_test_assignments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own assignments"
  ON public.ab_test_assignments
  FOR UPDATE
  USING (session_id IS NOT NULL OR user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_ab_tests_status ON public.ab_tests(status);
CREATE INDEX idx_ab_test_assignments_test ON public.ab_test_assignments(test_id);
CREATE INDEX idx_ab_test_assignments_session ON public.ab_test_assignments(session_id);

-- Add triggers for updated_at
CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON public.ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();