-- Create auctions table for luxury items and experiences
CREATE TABLE public.auctions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'collectibles',
  starting_price NUMERIC NOT NULL DEFAULT 0,
  current_bid NUMERIC DEFAULT 0,
  reserve_price NUMERIC,
  buy_now_price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  images TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  winner_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bids table
CREATE TABLE public.auction_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  is_auto_bid BOOLEAN DEFAULT false,
  max_auto_bid NUMERIC,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create auction watchlist
CREATE TABLE public.auction_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(auction_id, user_id)
);

-- Enable RLS
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_watchlist ENABLE ROW LEVEL SECURITY;

-- Auctions policies (public read for active auctions)
CREATE POLICY "Anyone can view active auctions" 
ON public.auctions FOR SELECT 
USING (status IN ('active', 'upcoming', 'ended'));

-- Allow authenticated users to create auctions (admin check done in app)
CREATE POLICY "Authenticated users can create auctions" 
ON public.auctions FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can update own auctions" 
ON public.auctions FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete own auctions" 
ON public.auctions FOR DELETE 
USING (auth.uid() = created_by);

-- Bids policies
CREATE POLICY "Users can view all bids" 
ON public.auction_bids FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can place bids" 
ON public.auction_bids FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bids" 
ON public.auction_bids FOR UPDATE 
USING (auth.uid() = user_id);

-- Watchlist policies
CREATE POLICY "Users can view own watchlist" 
ON public.auction_watchlist FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlist" 
ON public.auction_watchlist FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from watchlist" 
ON public.auction_watchlist FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_auctions_status ON public.auctions(status);
CREATE INDEX idx_auctions_ends_at ON public.auctions(ends_at);
CREATE INDEX idx_auction_bids_auction ON public.auction_bids(auction_id);
CREATE INDEX idx_auction_bids_user ON public.auction_bids(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_auctions_updated_at
BEFORE UPDATE ON public.auctions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample auctions
INSERT INTO public.auctions (title, description, category, starting_price, current_bid, reserve_price, buy_now_price, currency, images, specifications, starts_at, ends_at, status) VALUES
(
  'Patek Philippe Nautilus 5711/1A',
  'Rare discontinued reference in pristine condition. Complete set with box, papers, and service history.',
  'watches',
  95000, 98500, 100000, 150000, 'USD',
  ARRAY['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800'],
  '{"brand": "Patek Philippe", "reference": "5711/1A", "year": 2020}',
  now() - interval '2 days', now() + interval '5 days', 'active'
),
(
  'Jean-Michel Basquiat - Untitled Study',
  'Authenticated preparatory work from the artist prolific 1982 period.',
  'art',
  450000, 475000, 500000, NULL, 'USD',
  ARRAY['https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800'],
  '{"artist": "Jean-Michel Basquiat", "year": 1982, "medium": "Mixed media"}',
  now() - interval '1 day', now() + interval '7 days', 'active'
),
(
  '1961 Ferrari 250 GT SWB Berlinetta',
  'Matching numbers example with documented racing history. Ferrari Classiche certified.',
  'automobiles',
  4500000, 4750000, 5000000, NULL, 'USD',
  ARRAY['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'],
  '{"make": "Ferrari", "model": "250 GT SWB", "year": 1961}',
  now(), now() + interval '14 days', 'active'
),
(
  'Chateau Petrus Vertical Collection 1990-2000',
  'Complete vertical of eleven vintages from one of Bordeaux legendary estates.',
  'wine',
  85000, 0, 90000, 120000, 'USD',
  ARRAY['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'],
  '{"producer": "Chateau Petrus", "region": "Pomerol", "bottles": 11}',
  now() + interval '2 days', now() + interval '10 days', 'upcoming'
),
(
  'Private Dinner at Noma with Rene Redzepi',
  'An extraordinary culinary experience: intimate dinner for 8 guests at Noma.',
  'experiences',
  75000, 0, 80000, NULL, 'USD',
  ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
  '{"type": "Private Dining", "location": "Copenhagen", "guests": 8}',
  now() + interval '3 days', now() + interval '12 days', 'upcoming'
);