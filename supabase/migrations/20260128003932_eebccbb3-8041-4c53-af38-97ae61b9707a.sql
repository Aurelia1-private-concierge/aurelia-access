-- =============================================================
-- SECURITY FIX: Block anonymous access to sensitive tables
-- Addresses: profiles_table_public_exposure, partner_messages_exposure, credit_transactions_exposure
-- =============================================================

-- 1. PROFILES TABLE - Add explicit anonymous block
-- The existing policies only check auth.uid() = user_id, but don't explicitly block anon
CREATE POLICY "Block anonymous access to profiles" 
ON public.profiles 
FOR SELECT 
TO anon
USING (false);

-- 2. PARTNER_MESSAGES TABLE - Add explicit anonymous block
-- Contains sensitive business communications
CREATE POLICY "Block anonymous access to partner_messages" 
ON public.partner_messages 
FOR SELECT 
TO anon
USING (false);

CREATE POLICY "Block anonymous insert to partner_messages" 
ON public.partner_messages 
FOR INSERT 
TO anon
WITH CHECK (false);

CREATE POLICY "Block anonymous update to partner_messages" 
ON public.partner_messages 
FOR UPDATE 
TO anon
USING (false);

CREATE POLICY "Block anonymous delete to partner_messages" 
ON public.partner_messages 
FOR DELETE 
TO anon
USING (false);

-- 3. CREDIT_TRANSACTIONS TABLE - Add explicit anonymous block
-- Contains financial transaction history
CREATE POLICY "Block anonymous access to credit_transactions" 
ON public.credit_transactions 
FOR SELECT 
TO anon
USING (false);

CREATE POLICY "Block anonymous insert to credit_transactions" 
ON public.credit_transactions 
FOR INSERT 
TO anon
WITH CHECK (false);

CREATE POLICY "Block anonymous update to credit_transactions" 
ON public.credit_transactions 
FOR UPDATE 
TO anon
USING (false);

CREATE POLICY "Block anonymous delete to credit_transactions" 
ON public.credit_transactions 
FOR DELETE 
TO anon
USING (false);