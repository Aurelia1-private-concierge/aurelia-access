-- Fix auction_bids policy - bids should only be visible to auction participants, not everyone
DROP POLICY IF EXISTS "Users can view all bids" ON public.auction_bids;

-- Replace with secure policy: users can only see bids on auctions where they are participating
CREATE POLICY "Users can view bids on auctions they participate in" 
ON public.auction_bids 
FOR SELECT 
USING (
  -- User can see their own bids
  auth.uid() = user_id
  -- Or user can see bids on auctions they're watching or bidding on
  OR EXISTS (
    SELECT 1 FROM public.auction_watchlist w 
    WHERE w.auction_id = auction_bids.auction_id 
    AND w.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.auction_bids b 
    WHERE b.auction_id = auction_bids.auction_id 
    AND b.user_id = auth.uid()
  )
  -- Admins can see all
  OR has_role(auth.uid(), 'admin')
);

-- Fix webhook_endpoints - remove public read access, admin only
DROP POLICY IF EXISTS "Service can read active webhooks" ON public.webhook_endpoints;