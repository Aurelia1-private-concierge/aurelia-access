-- WebAuthn/Passkey credentials table
CREATE TABLE public.passkey_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  device_type TEXT,
  device_name TEXT,
  transports TEXT[],
  backed_up BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, credential_id)
);

-- Enable RLS
ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own passkeys
CREATE POLICY "Users can view own passkeys" ON public.passkey_credentials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passkeys" ON public.passkey_credentials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own passkeys" ON public.passkey_credentials
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own passkeys" ON public.passkey_credentials
  FOR UPDATE USING (auth.uid() = user_id);

-- House partner bidding on service requests
CREATE TABLE public.house_partner_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  house_partner_id UUID NOT NULL REFERENCES public.house_partners(id) ON DELETE CASCADE,
  bid_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  estimated_timeline TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(service_request_id, house_partner_id)
);

-- Enable RLS
ALTER TABLE public.house_partner_bids ENABLE ROW LEVEL SECURITY;

-- Admins can manage all bids
CREATE POLICY "Admins can manage bids" ON public.house_partner_bids
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Clients can view bids on their requests
CREATE POLICY "Clients can view bids on their requests" ON public.house_partner_bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.service_requests sr
      WHERE sr.id = house_partner_bids.service_request_id
      AND sr.client_id = auth.uid()
    )
  );

-- Add bidding_deadline to service_requests if not exists
ALTER TABLE public.service_requests 
  ADD COLUMN IF NOT EXISTS bidding_deadline TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS bidding_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS selected_bid_id UUID REFERENCES public.house_partner_bids(id);

-- Trigger for updated_at
CREATE TRIGGER update_house_partner_bids_updated_at
  BEFORE UPDATE ON public.house_partner_bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();