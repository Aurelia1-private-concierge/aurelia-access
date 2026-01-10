-- Create referrals table to track member referrals
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_email TEXT NOT NULL,
  referred_user_id UUID,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'subscribed', 'rewarded')),
  reward_amount DECIMAL(10, 2),
  reward_type TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE,
  signed_up_at TIMESTAMP WITH TIME ZONE,
  subscribed_at TIMESTAMP WITH TIME ZONE,
  rewarded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_referred_email ON public.referrals(referred_email);
CREATE UNIQUE INDEX idx_referrals_unique_email_per_referrer ON public.referrals(referrer_id, referred_email);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals"
  ON public.referrals
  FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referrals"
  ON public.referrals
  FOR UPDATE
  USING (auth.uid() = referrer_id);

-- Create trigger for updated_at
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create referral_rewards table for tracking earned rewards
CREATE TABLE public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  referral_id UUID REFERENCES public.referrals(id),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('free_month', 'discount', 'credit', 'tier_upgrade')),
  reward_value DECIMAL(10, 2),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for referral_rewards
CREATE POLICY "Users can view their own rewards"
  ON public.referral_rewards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create rewards"
  ON public.referral_rewards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);