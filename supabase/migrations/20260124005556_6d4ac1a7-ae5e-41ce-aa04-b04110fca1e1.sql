-- Add missing columns to partner_applications table
ALTER TABLE public.partner_applications
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS notable_clients TEXT,
ADD COLUMN IF NOT EXISTS coverage_regions TEXT[] DEFAULT '{}';