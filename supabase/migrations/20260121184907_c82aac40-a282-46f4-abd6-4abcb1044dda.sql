-- Phase 1: Fix RLS policy so partners can view open bidding opportunities
CREATE POLICY "Partners can view open bidding opportunities" 
ON public.service_requests 
FOR SELECT 
USING (
  bidding_enabled = true 
  AND status IN ('pending', 'accepted')
  AND EXISTS (SELECT 1 FROM public.partners WHERE user_id = auth.uid() AND status = 'approved')
);

-- Phase 2: Counter-Bidding / Bid Revision System

-- Create bid_revisions table to track bid history
CREATE TABLE IF NOT EXISTS public.bid_revisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bid_id UUID NOT NULL REFERENCES public.service_request_bids(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL DEFAULT 1,
  previous_amount NUMERIC NOT NULL,
  new_amount NUMERIC NOT NULL,
  previous_timeline TEXT,
  new_timeline TEXT,
  previous_message TEXT,
  new_message TEXT,
  revision_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add revision tracking to service_request_bids
ALTER TABLE public.service_request_bids 
ADD COLUMN IF NOT EXISTS revision_count INTEGER NOT NULL DEFAULT 0;

-- Add revision settings to service_requests
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS allow_revisions BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS max_revisions INTEGER NOT NULL DEFAULT 3;

-- Enable RLS on bid_revisions
ALTER TABLE public.bid_revisions ENABLE ROW LEVEL SECURITY;

-- Partners can view revisions on their own bids
CREATE POLICY "Partners can view their bid revisions"
ON public.bid_revisions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.service_request_bids b
    WHERE b.id = bid_revisions.bid_id
    AND b.partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  )
);

-- Partners can insert revisions on their own bids
CREATE POLICY "Partners can create bid revisions"
ON public.bid_revisions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.service_request_bids b
    WHERE b.id = bid_revisions.bid_id
    AND b.partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
    AND b.status = 'pending'
  )
);

-- Members can view revisions on bids for their requests
CREATE POLICY "Members can view bid revisions on their requests"
ON public.bid_revisions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.service_request_bids b
    JOIN public.service_requests sr ON sr.id = b.service_request_id
    WHERE b.id = bid_revisions.bid_id
    AND sr.client_id = auth.uid()
  )
);

-- Admins can view all revisions
CREATE POLICY "Admins can view all bid revisions"
ON public.bid_revisions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for bid_revisions
ALTER PUBLICATION supabase_realtime ADD TABLE public.bid_revisions;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bid_revisions_bid_id ON public.bid_revisions(bid_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_bidding ON public.service_requests(bidding_enabled, status) WHERE bidding_enabled = true;