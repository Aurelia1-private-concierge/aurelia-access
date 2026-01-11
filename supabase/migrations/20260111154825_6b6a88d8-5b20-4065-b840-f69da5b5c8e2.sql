-- Add Stripe Connect fields to partners table
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false;

-- Add stripe_transfer_id to partner_commissions for tracking payouts
ALTER TABLE public.partner_commissions
ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT,
ADD COLUMN IF NOT EXISTS payout_error TEXT;