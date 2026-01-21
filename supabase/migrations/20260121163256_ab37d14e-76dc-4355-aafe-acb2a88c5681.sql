-- Create consignments storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('consignments', 'consignments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload to their partner folder
CREATE POLICY "Partners can upload consignment files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'consignments');

-- Policy: Allow public read access to consignment files
CREATE POLICY "Public can view consignment files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'consignments');

-- Policy: Partners can delete their own files
CREATE POLICY "Partners can delete their own consignment files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'consignments');