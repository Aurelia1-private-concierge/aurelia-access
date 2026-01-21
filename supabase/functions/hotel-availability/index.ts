import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AvailabilityQuery {
  location?: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  minRate?: number;
  maxRate?: number;
  amenities?: string[];
  partnerId?: string;
}

interface BookingRequest {
  availabilityId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
  guestDetails?: {
    name: string;
    email: string;
    phone?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'search';

    console.log(`Hotel availability service - Action: ${action}`);

    // GET: Search availability
    if (req.method === 'GET' && action === 'search') {
      const location = url.searchParams.get('location');
      const checkIn = url.searchParams.get('checkIn');
      const checkOut = url.searchParams.get('checkOut');
      const guests = parseInt(url.searchParams.get('guests') || '2');
      const minRate = url.searchParams.get('minRate');
      const maxRate = url.searchParams.get('maxRate');
      const partnerId = url.searchParams.get('partnerId');

      if (!checkIn || !checkOut) {
        return new Response(
          JSON.stringify({ error: 'checkIn and checkOut dates are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let query = supabase
        .from('hotel_availability')
        .select(`
          *,
          partner:partners(id, company_name, logo_url, status)
        `)
        .lte('available_from', checkIn)
        .gte('available_to', checkOut)
        .gte('max_guests', guests)
        .neq('availability_status', 'sold_out');

      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }

      if (minRate) {
        query = query.gte('rate_per_night', parseFloat(minRate));
      }

      if (maxRate) {
        query = query.lte('rate_per_night', parseFloat(maxRate));
      }

      const { data: availability, error } = await query.order('rate_per_night', { ascending: true });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      // Calculate total for each property
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      const results = availability?.map(item => ({
        ...item,
        nights,
        totalAmount: item.rate_per_night * nights,
        partnerName: item.partner?.company_name,
        partnerLogo: item.partner?.logo_url,
      }));

      console.log(`Found ${results?.length || 0} available properties`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: results,
          query: { location, checkIn, checkOut, guests, nights }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST: Create booking request
    if (req.method === 'POST' && action === 'book') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify user
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authorization' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body: BookingRequest = await req.json();
      const { availabilityId, checkIn, checkOut, guests, specialRequests, guestDetails } = body;

      if (!availabilityId || !checkIn || !checkOut) {
        return new Response(
          JSON.stringify({ error: 'Missing required booking details' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get availability details
      const { data: availability, error: availError } = await supabase
        .from('hotel_availability')
        .select('*')
        .eq('id', availabilityId)
        .single();

      if (availError || !availability) {
        return new Response(
          JSON.stringify({ error: 'Property not found or no longer available' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate booking details
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalAmount = availability.rate_per_night * totalNights;

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('hotel_bookings')
        .insert({
          availability_id: availabilityId,
          client_id: user.id,
          partner_id: availability.partner_id,
          property_name: availability.property_name,
          room_type: availability.room_type,
          check_in: checkIn,
          check_out: checkOut,
          guests: guests || 2,
          total_nights: totalNights,
          rate_per_night: availability.rate_per_night,
          total_amount: totalAmount,
          currency: availability.currency,
          special_requests: specialRequests,
          guest_details: guestDetails,
          booking_status: 'pending'
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Booking error:', bookingError);
        throw bookingError;
      }

      // Create a service request for concierge follow-up
      const { data: serviceRequest, error: srError } = await supabase
        .from('service_requests')
        .insert({
          client_id: user.id,
          title: `Hotel Booking: ${availability.property_name}`,
          description: `Booking request for ${availability.room_type} at ${availability.property_name}, ${availability.location}. Check-in: ${checkIn}, Check-out: ${checkOut}, Guests: ${guests}`,
          category: 'hospitality',
          priority: 'standard',
          status: 'pending',
          partner_id: availability.partner_id,
          budget_min: totalAmount,
          budget_max: totalAmount,
          metadata: {
            booking_id: booking.id,
            property_code: availability.property_code,
            special_requests: specialRequests
          }
        })
        .select()
        .single();

      if (!srError && serviceRequest) {
        // Link booking to service request
        await supabase
          .from('hotel_bookings')
          .update({ service_request_id: serviceRequest.id })
          .eq('id', booking.id);
      }

      console.log(`Booking created: ${booking.id} for user ${user.id}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            ...booking,
            serviceRequestId: serviceRequest?.id
          },
          message: 'Booking request submitted. Our concierge team will confirm your reservation shortly.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST: Partner updates availability
    if (req.method === 'POST' && action === 'update') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authorization' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user is a partner
      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .select('id, status')
        .eq('user_id', user.id)
        .single();

      if (partnerError || !partner || partner.status !== 'approved') {
        return new Response(
          JSON.stringify({ error: 'Only approved partners can update availability' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const { id, ...updateData } = body;

      if (id) {
        // Update existing availability
        const { data, error } = await supabase
          .from('hotel_availability')
          .update({ ...updateData, last_synced_at: new Date().toISOString() })
          .eq('id', id)
          .eq('partner_id', partner.id)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Create new availability
        const { data, error } = await supabase
          .from('hotel_availability')
          .insert({ ...updateData, partner_id: partner.id })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // GET: Partner's own availability
    if (req.method === 'GET' && action === 'my-properties') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authorization' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: partner } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!partner) {
        return new Response(
          JSON.stringify({ error: 'Partner not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('hotel_availability')
        .select('*')
        .eq('partner_id', partner.id)
        .order('property_name');

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or method' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Hotel availability error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});