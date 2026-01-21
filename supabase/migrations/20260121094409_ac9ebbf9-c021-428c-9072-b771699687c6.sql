-- Create hotel_availability table for partner property inventory
CREATE TABLE public.hotel_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  property_code TEXT,
  location TEXT,
  room_type TEXT NOT NULL,
  room_description TEXT,
  available_from DATE NOT NULL,
  available_to DATE NOT NULL,
  rate_per_night NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'limited', 'sold_out', 'on_request')),
  min_nights INTEGER DEFAULT 1,
  max_guests INTEGER DEFAULT 2,
  amenities TEXT[],
  images TEXT[],
  special_offers TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 15.00,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX idx_hotel_availability_partner ON public.hotel_availability(partner_id);
CREATE INDEX idx_hotel_availability_dates ON public.hotel_availability(available_from, available_to);
CREATE INDEX idx_hotel_availability_location ON public.hotel_availability(location);
CREATE INDEX idx_hotel_availability_status ON public.hotel_availability(availability_status);

-- Enable RLS
ALTER TABLE public.hotel_availability ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view available properties
CREATE POLICY "Anyone can view hotel availability"
ON public.hotel_availability
FOR SELECT
USING (true);

-- Policy: Partners can manage their own availability
CREATE POLICY "Partners can manage own availability"
ON public.hotel_availability
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE partners.id = hotel_availability.partner_id
    AND partners.user_id = auth.uid()
  )
);

-- Policy: Admins can manage all availability
CREATE POLICY "Admins can manage all availability"
ON public.hotel_availability
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create hotel_bookings table for reservation requests
CREATE TABLE public.hotel_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  availability_id UUID REFERENCES public.hotel_availability(id),
  client_id UUID NOT NULL,
  service_request_id UUID REFERENCES public.service_requests(id),
  partner_id UUID NOT NULL REFERENCES public.partners(id),
  property_name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER DEFAULT 2,
  total_nights INTEGER,
  rate_per_night NUMERIC(10,2),
  total_amount NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  special_requests TEXT,
  guest_details JSONB,
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  confirmation_number TEXT,
  partner_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bookings
ALTER TABLE public.hotel_bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON public.hotel_bookings
FOR SELECT
USING (auth.uid() = client_id);

-- Policy: Partners can view bookings for their properties
CREATE POLICY "Partners can view their bookings"
ON public.hotel_bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.partners
    WHERE partners.id = hotel_bookings.partner_id
    AND partners.user_id = auth.uid()
  )
);

-- Policy: Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings"
ON public.hotel_bookings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE TRIGGER update_hotel_availability_updated_at
BEFORE UPDATE ON public.hotel_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hotel_bookings_updated_at
BEFORE UPDATE ON public.hotel_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();