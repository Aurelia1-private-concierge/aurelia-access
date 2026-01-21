-- Create unified service_inventory table for all service types
CREATE TABLE public.service_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  partner_service_id UUID REFERENCES public.partner_services(id),
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- Common fields
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  
  -- Availability
  available_from TIMESTAMP WITH TIME ZONE,
  available_to TIMESTAMP WITH TIME ZONE,
  is_always_available BOOLEAN DEFAULT false,
  lead_time_hours INTEGER DEFAULT 24,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'limited', 'sold_out', 'on_request', 'seasonal')),
  
  -- Pricing
  base_price NUMERIC(12,2),
  price_unit TEXT DEFAULT 'per_service', -- per_hour, per_day, per_night, per_person, per_service
  currency TEXT DEFAULT 'USD',
  min_spend NUMERIC(12,2),
  deposit_required NUMERIC(12,2),
  
  -- Capacity
  min_guests INTEGER DEFAULT 1,
  max_guests INTEGER,
  min_duration_hours NUMERIC(5,2),
  max_duration_hours NUMERIC(5,2),
  
  -- Category-specific metadata
  specifications JSONB, -- e.g., aircraft type, yacht specs, cuisine type
  amenities TEXT[],
  images TEXT[],
  
  -- Terms
  cancellation_policy TEXT,
  special_conditions TEXT,
  special_offers TEXT,
  
  -- Business
  commission_rate NUMERIC(5,2) DEFAULT 15.00,
  featured BOOLEAN DEFAULT false,
  priority_rank INTEGER DEFAULT 0,
  
  -- Tracking
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_service_inventory_partner ON public.service_inventory(partner_id);
CREATE INDEX idx_service_inventory_category ON public.service_inventory(category);
CREATE INDEX idx_service_inventory_location ON public.service_inventory(location);
CREATE INDEX idx_service_inventory_status ON public.service_inventory(availability_status);
CREATE INDEX idx_service_inventory_price ON public.service_inventory(base_price);
CREATE INDEX idx_service_inventory_featured ON public.service_inventory(featured) WHERE featured = true;

-- Enable RLS
ALTER TABLE public.service_inventory ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view service inventory"
ON public.service_inventory FOR SELECT USING (true);

CREATE POLICY "Partners can manage own inventory"
ON public.service_inventory FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE partners.id = service_inventory.partner_id
    AND partners.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all inventory"
ON public.service_inventory FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create unified service_bookings table
CREATE TABLE public.service_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID REFERENCES public.service_inventory(id),
  client_id UUID NOT NULL,
  partner_id UUID NOT NULL REFERENCES public.partners(id),
  service_request_id UUID REFERENCES public.service_requests(id),
  
  -- Service details
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  
  -- Booking specifics
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE,
  duration_hours NUMERIC(5,2),
  guests INTEGER DEFAULT 1,
  location TEXT,
  
  -- Pricing
  base_price NUMERIC(12,2),
  extras_price NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  deposit_amount NUMERIC(12,2),
  deposit_paid BOOLEAN DEFAULT false,
  
  -- Client info
  special_requests TEXT,
  guest_details JSONB,
  dietary_requirements TEXT[],
  accessibility_needs TEXT,
  
  -- Status
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'refunded')),
  confirmation_number TEXT,
  partner_response JSONB,
  
  -- Category-specific data
  booking_details JSONB, -- Route for aviation, itinerary for yachts, menu for dining, etc.
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for bookings
CREATE INDEX idx_service_bookings_client ON public.service_bookings(client_id);
CREATE INDEX idx_service_bookings_partner ON public.service_bookings(partner_id);
CREATE INDEX idx_service_bookings_category ON public.service_bookings(category);
CREATE INDEX idx_service_bookings_status ON public.service_bookings(booking_status);
CREATE INDEX idx_service_bookings_dates ON public.service_bookings(start_datetime, end_datetime);

-- Enable RLS
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own bookings"
ON public.service_bookings FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Users can create bookings"
ON public.service_bookings FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Partners can view their bookings"
ON public.service_bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE partners.id = service_bookings.partner_id
    AND partners.user_id = auth.uid()
  )
);

CREATE POLICY "Partners can update their bookings"
ON public.service_bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE partners.id = service_bookings.partner_id
    AND partners.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all bookings"
ON public.service_bookings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER update_service_inventory_updated_at
BEFORE UPDATE ON public.service_inventory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_bookings_updated_at
BEFORE UPDATE ON public.service_bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();