-- ============================================
-- Part 1: Auction Management Enhancements
-- ============================================

-- Auction categories table
CREATE TABLE IF NOT EXISTS public.auction_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auction_categories ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Anyone can view active auction categories"
  ON public.auction_categories FOR SELECT
  USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage auction categories"
  ON public.auction_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default categories
INSERT INTO public.auction_categories (name, slug, description, icon, display_order) VALUES
  ('Watches & Jewelry', 'watches-jewelry', 'Luxury timepieces and fine jewelry', 'Watch', 1),
  ('Art & Collectibles', 'art-collectibles', 'Fine art, sculptures, and rare collectibles', 'Palette', 2),
  ('Vehicles', 'vehicles', 'Classic cars, supercars, and luxury vehicles', 'Car', 3),
  ('Experiences', 'experiences', 'Exclusive experiences and once-in-a-lifetime opportunities', 'Sparkles', 4),
  ('Real Estate', 'real-estate', 'Luxury properties and vacation homes', 'Home', 5),
  ('Wine & Spirits', 'wine-spirits', 'Rare wines, whiskeys, and fine spirits', 'Wine', 6)
ON CONFLICT (slug) DO NOTHING;

-- Add new columns to auctions table
ALTER TABLE public.auctions 
  ADD COLUMN IF NOT EXISTS submitted_by UUID,
  ADD COLUMN IF NOT EXISTS submitted_by_type TEXT DEFAULT 'admin' CHECK (submitted_by_type IN ('admin', 'partner', 'member')),
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS reserve_price NUMERIC,
  ADD COLUMN IF NOT EXISTS reserve_met BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS buyer_premium_percent NUMERIC DEFAULT 10,
  ADD COLUMN IF NOT EXISTS seller_commission_percent NUMERIC DEFAULT 15,
  ADD COLUMN IF NOT EXISTS provenance TEXT,
  ADD COLUMN IF NOT EXISTS condition_report TEXT,
  ADD COLUMN IF NOT EXISTS authenticity_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- ============================================
-- Part 2: Partner Job Bidding System
-- ============================================

-- Create enum for bid status
DO $$ BEGIN
  CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for recommendation status
DO $$ BEGIN
  CREATE TYPE recommendation_status AS ENUM ('pending', 'viewed', 'bid_submitted', 'declined');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Service request bids table
CREATE TABLE IF NOT EXISTS public.service_request_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  bid_amount NUMERIC NOT NULL CHECK (bid_amount > 0),
  currency TEXT DEFAULT 'USD',
  proposed_timeline TEXT,
  estimated_duration TEXT,
  bid_message TEXT NOT NULL,
  attachments TEXT[],
  status bid_status DEFAULT 'pending',
  is_recommended BOOLEAN DEFAULT false,
  response_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_request_id, partner_id)
);

-- Enable RLS
ALTER TABLE public.service_request_bids ENABLE ROW LEVEL SECURITY;

-- Partners can view and manage their own bids
CREATE POLICY "Partners can view their own bids"
  ON public.service_request_bids FOR SELECT
  USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

CREATE POLICY "Partners can create bids"
  ON public.service_request_bids FOR INSERT
  WITH CHECK (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid() AND status = 'approved')
  );

CREATE POLICY "Partners can update their own pending bids"
  ON public.service_request_bids FOR UPDATE
  USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
    AND status = 'pending'
  );

-- Clients can view bids on their requests
CREATE POLICY "Clients can view bids on their requests"
  ON public.service_request_bids FOR SELECT
  USING (
    service_request_id IN (SELECT id FROM public.service_requests WHERE client_id = auth.uid())
  );

-- Admins have full access
CREATE POLICY "Admins can manage all bids"
  ON public.service_request_bids FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Partner recommendations table
CREATE TABLE IF NOT EXISTS public.partner_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons TEXT[],
  notified_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  status recommendation_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_request_id, partner_id)
);

-- Enable RLS
ALTER TABLE public.partner_recommendations ENABLE ROW LEVEL SECURITY;

-- Partners can view their own recommendations
CREATE POLICY "Partners can view their recommendations"
  ON public.partner_recommendations FOR SELECT
  USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

-- Partners can update their own recommendations
CREATE POLICY "Partners can update their recommendations"
  ON public.partner_recommendations FOR UPDATE
  USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

-- Admins have full access
CREATE POLICY "Admins can manage all recommendations"
  ON public.partner_recommendations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Extend service_requests table for bidding
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS bidding_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bidding_deadline TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS min_bids_required INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_bids_allowed INTEGER,
  ADD COLUMN IF NOT EXISTS auto_recommend_partners BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS winning_bid_id UUID,
  ADD COLUMN IF NOT EXISTS blind_bidding BOOLEAN DEFAULT false;

-- Add foreign key for winning_bid_id (after table exists)
DO $$ BEGIN
  ALTER TABLE public.service_requests 
    ADD CONSTRAINT fk_winning_bid 
    FOREIGN KEY (winning_bid_id) 
    REFERENCES public.service_request_bids(id) 
    ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_request_bids_request ON public.service_request_bids(service_request_id);
CREATE INDEX IF NOT EXISTS idx_service_request_bids_partner ON public.service_request_bids(partner_id);
CREATE INDEX IF NOT EXISTS idx_service_request_bids_status ON public.service_request_bids(status);
CREATE INDEX IF NOT EXISTS idx_partner_recommendations_request ON public.partner_recommendations(service_request_id);
CREATE INDEX IF NOT EXISTS idx_partner_recommendations_partner ON public.partner_recommendations(partner_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_bidding ON public.service_requests(bidding_enabled) WHERE bidding_enabled = true;

-- Update trigger for service_request_bids
CREATE TRIGGER update_service_request_bids_updated_at
  BEFORE UPDATE ON public.service_request_bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for bids
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_request_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_recommendations;

-- ============================================
-- Part 3: Auction Consignment Tracking
-- ============================================

-- Auction consignments table for partner/member submissions
CREATE TABLE IF NOT EXISTS public.auction_consignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitter_id UUID NOT NULL,
  submitter_type TEXT NOT NULL CHECK (submitter_type IN ('partner', 'member')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.auction_categories(id),
  estimated_value_min NUMERIC,
  estimated_value_max NUMERIC,
  reserve_price_request NUMERIC,
  images TEXT[],
  provenance TEXT,
  condition_report TEXT,
  authenticity_documents TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'listed', 'sold', 'withdrawn')),
  reviewer_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  auction_id UUID REFERENCES public.auctions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auction_consignments ENABLE ROW LEVEL SECURITY;

-- Users can view their own consignments
CREATE POLICY "Users can view their own consignments"
  ON public.auction_consignments FOR SELECT
  USING (submitter_id = auth.uid());

-- Users can create consignments
CREATE POLICY "Authenticated users can create consignments"
  ON public.auction_consignments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND submitter_id = auth.uid());

-- Users can update their pending consignments
CREATE POLICY "Users can update their pending consignments"
  ON public.auction_consignments FOR UPDATE
  USING (submitter_id = auth.uid() AND status IN ('pending', 'under_review'));

-- Admins have full access
CREATE POLICY "Admins can manage all consignments"
  ON public.auction_consignments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Update trigger
CREATE TRIGGER update_auction_consignments_updated_at
  BEFORE UPDATE ON public.auction_consignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();