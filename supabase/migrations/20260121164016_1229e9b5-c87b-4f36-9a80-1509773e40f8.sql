-- Fix auction_consignments RLS to work with partner_id (not user_id)
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can create consignments" ON auction_consignments;
DROP POLICY IF EXISTS "Users can view their own consignments" ON auction_consignments;
DROP POLICY IF EXISTS "Users can update their pending consignments" ON auction_consignments;

-- Create new policies that check partner ownership via partners table
CREATE POLICY "Partners can create consignments"
ON auction_consignments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM partners 
    WHERE partners.id = auction_consignments.submitter_id 
    AND partners.user_id = auth.uid()
  )
);

CREATE POLICY "Partners can view their own consignments"
ON auction_consignments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM partners 
    WHERE partners.id = auction_consignments.submitter_id 
    AND partners.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Partners can update their pending consignments"
ON auction_consignments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM partners 
    WHERE partners.id = auction_consignments.submitter_id 
    AND partners.user_id = auth.uid()
  )
  AND status IN ('pending', 'under_review')
);