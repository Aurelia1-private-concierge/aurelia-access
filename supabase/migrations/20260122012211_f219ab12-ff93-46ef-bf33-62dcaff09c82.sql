-- Create enum for site status
CREATE TYPE site_status AS ENUM ('draft', 'published', 'archived');

-- Create member_sites table
CREATE TABLE public.member_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  template_id TEXT NOT NULL,
  status site_status NOT NULL DEFAULT 'draft',
  content JSONB DEFAULT '[]'::jsonb,
  branding JSONB DEFAULT '{}'::jsonb,
  custom_domain TEXT,
  analytics_enabled BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create site_templates table
CREATE TABLE public.site_templates (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  preview_image TEXT,
  description TEXT,
  default_blocks JSONB DEFAULT '[]'::jsonb,
  min_tier TEXT NOT NULL DEFAULT 'gold',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create site_generation_credits table
CREATE TABLE public.site_generation_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.member_sites(id) ON DELETE CASCADE,
  credit_type TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.member_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_generation_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for member_sites
CREATE POLICY "Users can view their own sites"
  ON public.member_sites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sites"
  ON public.member_sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites"
  ON public.member_sites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sites"
  ON public.member_sites FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for site_templates (public read for active templates)
CREATE POLICY "Anyone can view active templates"
  ON public.site_templates FOR SELECT
  USING (is_active = true);

-- RLS Policies for site_generation_credits
CREATE POLICY "Users can view their own credits"
  ON public.site_generation_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON public.site_generation_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger for member_sites
CREATE TRIGGER update_member_sites_updated_at
  BEFORE UPDATE ON public.member_sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed luxury templates
INSERT INTO public.site_templates (id, name, category, description, min_tier, default_blocks) VALUES
  ('executive-profile', 'Executive Profile', 'personal', 'Sophisticated profile for C-suite executives and board members', 'gold', '[{"type":"hero","title":"","subtitle":"","background":"gradient"},{"type":"bio","content":""},{"type":"achievements","items":[]},{"type":"contact","email":"","phone":""}]'::jsonb),
  ('philanthropist-showcase', 'Philanthropist Showcase', 'personal', 'Elegant display of charitable work and foundation initiatives', 'gold', '[{"type":"hero","title":"","subtitle":"","background":"image"},{"type":"mission","content":""},{"type":"initiatives","items":[]},{"type":"impact","stats":[]},{"type":"contact","email":""}]'::jsonb),
  ('collectors-gallery', 'Collector''s Gallery', 'personal', 'Premium gallery for art, automobiles, or fine collections', 'platinum', '[{"type":"hero","title":"","background":"dark"},{"type":"gallery","items":[],"layout":"masonry"},{"type":"story","content":""},{"type":"contact","email":""}]'::jsonb),
  ('private-celebration', 'Private Celebration', 'event', 'Luxurious invitation site for weddings, galas, and milestones', 'gold', '[{"type":"hero","title":"","date":"","background":"elegant"},{"type":"story","content":""},{"type":"details","items":[]},{"type":"rsvp","enabled":true},{"type":"gallery","items":[]}]'::jsonb),
  ('invitation-portal', 'Invitation Portal', 'event', 'Exclusive event RSVP portal with guest management', 'gold', '[{"type":"hero","title":"","subtitle":""},{"type":"event-details","date":"","location":"","dresscode":""},{"type":"rsvp","fields":["name","guests","dietary"]},{"type":"contact","email":""}]'::jsonb),
  ('experience-journal', 'Experience Journal', 'event', 'Post-event photo and video gallery with storytelling', 'gold', '[{"type":"hero","title":"","background":"video"},{"type":"story","content":""},{"type":"gallery","items":[],"layout":"timeline"},{"type":"guestbook","enabled":true}]'::jsonb),
  ('investment-portfolio', 'Investment Portfolio', 'venture', 'Professional showcase for family office holdings', 'platinum', '[{"type":"hero","title":"","subtitle":""},{"type":"philosophy","content":""},{"type":"portfolio","items":[]},{"type":"team","members":[]},{"type":"contact","email":""}]'::jsonb),
  ('startup-launch', 'Startup Launch', 'venture', 'Sophisticated announcement for new venture initiatives', 'gold', '[{"type":"hero","title":"","tagline":""},{"type":"problem","content":""},{"type":"solution","content":""},{"type":"team","members":[]},{"type":"contact","email":""}]'::jsonb),
  ('advisory-board', 'Advisory Board', 'venture', 'Distinguished credentials and professional profile', 'gold', '[{"type":"hero","title":"","photo":""},{"type":"expertise","areas":[]},{"type":"boards","positions":[]},{"type":"publications","items":[]},{"type":"contact","email":""}]'::jsonb),
  ('legacy-site', 'Legacy Site', 'family-office', 'Multi-generational family story and heritage', 'platinum', '[{"type":"hero","title":"","background":"heritage"},{"type":"history","timeline":[]},{"type":"values","items":[]},{"type":"generations","members":[]},{"type":"contact","email":""}]'::jsonb),
  ('private-portal', 'Private Portal', 'family-office', 'Secure family-only access portal with authentication', 'platinum', '[{"type":"hero","title":""},{"type":"announcements","items":[]},{"type":"documents","folders":[]},{"type":"calendar","events":[]},{"type":"directory","members":[]}]'::jsonb),
  ('succession-planning', 'Succession Planning', 'family-office', 'Secure documentation and planning portal', 'platinum', '[{"type":"hero","title":""},{"type":"overview","content":""},{"type":"documents","secured":true},{"type":"timeline","milestones":[]},{"type":"contacts","advisors":[]}]'::jsonb);

-- Create index for faster slug lookups
CREATE INDEX idx_member_sites_slug ON public.member_sites(slug);
CREATE INDEX idx_member_sites_user_id ON public.member_sites(user_id);
CREATE INDEX idx_site_templates_category ON public.site_templates(category);