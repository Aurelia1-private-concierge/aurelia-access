import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Service category configurations
const CATEGORY_CONFIG: Record<string, {
  priceUnit: string;
  defaultLeadTime: number;
  requiresDeposit: boolean;
  commissionRate: number;
}> = {
  aviation: { priceUnit: 'per_flight', defaultLeadTime: 48, requiresDeposit: true, commissionRate: 12 },
  yacht: { priceUnit: 'per_day', defaultLeadTime: 72, requiresDeposit: true, commissionRate: 15 },
  hospitality: { priceUnit: 'per_night', defaultLeadTime: 24, requiresDeposit: true, commissionRate: 15 },
  dining: { priceUnit: 'per_person', defaultLeadTime: 24, requiresDeposit: false, commissionRate: 10 },
  events: { priceUnit: 'per_service', defaultLeadTime: 168, requiresDeposit: true, commissionRate: 15 },
  security: { priceUnit: 'per_day', defaultLeadTime: 24, requiresDeposit: false, commissionRate: 20 },
  wellness: { priceUnit: 'per_session', defaultLeadTime: 24, requiresDeposit: false, commissionRate: 15 },
  automotive: { priceUnit: 'per_day', defaultLeadTime: 24, requiresDeposit: true, commissionRate: 12 },
  real_estate: { priceUnit: 'per_service', defaultLeadTime: 48, requiresDeposit: false, commissionRate: 3 },
  shopping: { priceUnit: 'per_service', defaultLeadTime: 24, requiresDeposit: false, commissionRate: 8 },
  art_collectibles: { priceUnit: 'per_service', defaultLeadTime: 48, requiresDeposit: false, commissionRate: 5 },
  technology: { priceUnit: 'per_service', defaultLeadTime: 24, requiresDeposit: false, commissionRate: 10 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'search';

    console.log(`Service availability - Action: ${action}`);

    // GET: Search inventory
    if (req.method === 'GET' && action === 'search') {
      const category = url.searchParams.get('category');
      const location = url.searchParams.get('location');
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');
      const guests = parseInt(url.searchParams.get('guests') || '1');
      const minPrice = url.searchParams.get('minPrice');
      const maxPrice = url.searchParams.get('maxPrice');
      const partnerId = url.searchParams.get('partnerId');
      const featured = url.searchParams.get('featured') === 'true';
      const subcategory = url.searchParams.get('subcategory');

      let query = supabase
        .from('service_inventory')
        .select(`
          *,
          partner:partners(id, company_name, logo_url, status)
        `)
        .neq('availability_status', 'sold_out');

      if (category) {
        query = query.eq('category', category);
      }

      if (subcategory) {
        query = query.eq('subcategory', subcategory);
      }

      if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      if (startDate) {
        query = query.or(`available_from.is.null,available_from.lte.${startDate}`);
      }

      if (endDate) {
        query = query.or(`available_to.is.null,available_to.gte.${endDate}`);
      }

      if (guests) {
        query = query.or(`max_guests.is.null,max_guests.gte.${guests}`);
      }

      if (minPrice) {
        query = query.gte('base_price', parseFloat(minPrice));
      }

      if (maxPrice) {
        query = query.lte('base_price', parseFloat(maxPrice));
      }

      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }

      if (featured) {
        query = query.eq('featured', true);
      }

      const { data: inventory, error } = await query
        .order('priority_rank', { ascending: false })
        .order('base_price', { ascending: true });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      // Enrich results with partner info
      const results = inventory?.map(item => ({
        ...item,
        partnerName: item.partner?.company_name,
        partnerLogo: item.partner?.logo_url,
        categoryConfig: CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.hospitality,
      }));

      console.log(`Found ${results?.length || 0} services for category: ${category || 'all'}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: results,
          query: { category, location, startDate, endDate, guests }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET: Get categories with counts
    if (req.method === 'GET' && action === 'categories') {
      const { data, error } = await supabase
        .from('service_inventory')
        .select('category')
        .neq('availability_status', 'sold_out');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach(item => {
        counts[item.category] = (counts[item.category] || 0) + 1;
      });

      const categories = Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
        id: key,
        name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: counts[key] || 0,
        ...config,
      }));

      return new Response(
        JSON.stringify({ success: true, data: categories }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET: Get featured services
    if (req.method === 'GET' && action === 'featured') {
      const limit = parseInt(url.searchParams.get('limit') || '6');

      const { data, error } = await supabase
        .from('service_inventory')
        .select(`
          *,
          partner:partners(id, company_name, logo_url)
        `)
        .eq('featured', true)
        .neq('availability_status', 'sold_out')
        .order('priority_rank', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const results = data?.map(item => ({
        ...item,
        partnerName: item.partner?.company_name,
        partnerLogo: item.partner?.logo_url,
      }));

      return new Response(
        JSON.stringify({ success: true, data: results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST: Create booking
    if (req.method === 'POST' && action === 'book') {
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

      const body = await req.json();
      const {
        inventoryId,
        startDatetime,
        endDatetime,
        durationHours,
        guests,
        location,
        specialRequests,
        guestDetails,
        dietaryRequirements,
        accessibilityNeeds,
        bookingDetails,
      } = body;

      if (!inventoryId || !startDatetime) {
        return new Response(
          JSON.stringify({ error: 'Missing required booking details' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get inventory details
      const { data: inventory, error: invError } = await supabase
        .from('service_inventory')
        .select('*')
        .eq('id', inventoryId)
        .single();

      if (invError || !inventory) {
        return new Response(
          JSON.stringify({ error: 'Service not found or no longer available' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate pricing
      let totalAmount = inventory.base_price || 0;
      if (inventory.price_unit === 'per_person' && guests) {
        totalAmount = totalAmount * guests;
      } else if (inventory.price_unit === 'per_day' && durationHours) {
        totalAmount = totalAmount * Math.ceil(durationHours / 24);
      } else if (inventory.price_unit === 'per_hour' && durationHours) {
        totalAmount = totalAmount * durationHours;
      }

      const depositAmount = inventory.deposit_required || 0;

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('service_bookings')
        .insert({
          inventory_id: inventoryId,
          client_id: user.id,
          partner_id: inventory.partner_id,
          category: inventory.category,
          title: inventory.title,
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          duration_hours: durationHours,
          guests: guests || 1,
          location: location || inventory.location,
          base_price: inventory.base_price,
          total_amount: totalAmount,
          currency: inventory.currency,
          deposit_amount: depositAmount,
          special_requests: specialRequests,
          guest_details: guestDetails,
          dietary_requirements: dietaryRequirements,
          accessibility_needs: accessibilityNeeds,
          booking_details: bookingDetails,
          booking_status: 'pending'
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Booking error:', bookingError);
        throw bookingError;
      }

      // Create service request for concierge
      const categoryLabels: Record<string, string> = {
        aviation: 'Private Aviation',
        yacht: 'Yacht Charter',
        hospitality: 'Luxury Accommodation',
        dining: 'Private Dining',
        events: 'Exclusive Event',
        security: 'Security Service',
        wellness: 'Wellness Experience',
        automotive: 'Luxury Automotive',
        real_estate: 'Property Service',
        shopping: 'Personal Shopping',
        art_collectibles: 'Art & Collectibles',
        technology: 'Technology Service',
      };

      const { data: serviceRequest } = await supabase
        .from('service_requests')
        .insert({
          client_id: user.id,
          title: `${categoryLabels[inventory.category] || 'Service'}: ${inventory.title}`,
          description: `Booking request for ${inventory.title}. Date: ${startDatetime}${guests ? `, Guests: ${guests}` : ''}${location ? `, Location: ${location}` : ''}`,
          category: inventory.category,
          priority: 'standard',
          status: 'pending',
          partner_id: inventory.partner_id,
          budget_min: totalAmount,
          budget_max: totalAmount,
          metadata: {
            booking_id: booking.id,
            inventory_id: inventoryId,
            special_requests: specialRequests,
            booking_details: bookingDetails,
          }
        })
        .select()
        .single();

      if (serviceRequest) {
        await supabase
          .from('service_bookings')
          .update({ service_request_id: serviceRequest.id })
          .eq('id', booking.id);
      }

      console.log(`Booking created: ${booking.id} for ${inventory.category}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { ...booking, serviceRequestId: serviceRequest?.id },
          message: 'Booking request submitted. Our concierge team will confirm shortly.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST: Partner adds/updates inventory
    if (req.method === 'POST' && action === 'inventory') {
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
      const { data: partner } = await supabase
        .from('partners')
        .select('id, status, categories')
        .eq('user_id', user.id)
        .single();

      if (!partner || partner.status !== 'approved') {
        return new Response(
          JSON.stringify({ error: 'Only approved partners can manage inventory' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const { id, ...inventoryData } = body;

      // Apply category defaults
      const categoryConfig = CATEGORY_CONFIG[inventoryData.category] || {};
      const dataWithDefaults = {
        ...inventoryData,
        partner_id: partner.id,
        price_unit: inventoryData.price_unit || categoryConfig.priceUnit,
        lead_time_hours: inventoryData.lead_time_hours || categoryConfig.defaultLeadTime,
        commission_rate: inventoryData.commission_rate || categoryConfig.commissionRate,
        last_synced_at: new Date().toISOString(),
      };

      if (id) {
        // Update existing
        const { data, error } = await supabase
          .from('service_inventory')
          .update(dataWithDefaults)
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
        // Create new
        const { data, error } = await supabase
          .from('service_inventory')
          .insert(dataWithDefaults)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // GET: Partner's inventory
    if (req.method === 'GET' && action === 'my-inventory') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
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

      const category = url.searchParams.get('category');

      let query = supabase
        .from('service_inventory')
        .select('*')
        .eq('partner_id', partner.id);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('category').order('title');

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET: User's bookings
    if (req.method === 'GET' && action === 'my-bookings') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authorization' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const category = url.searchParams.get('category');
      const status = url.searchParams.get('status');

      let query = supabase
        .from('service_bookings')
        .select(`
          *,
          partner:partners(company_name, logo_url)
        `)
        .eq('client_id', user.id);

      if (category) {
        query = query.eq('category', category);
      }

      if (status) {
        query = query.eq('booking_status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE: Remove inventory item
    if (req.method === 'DELETE' && action === 'inventory') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authorization' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const inventoryId = url.searchParams.get('id');
      if (!inventoryId) {
        return new Response(
          JSON.stringify({ error: 'Inventory ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

      const { error } = await supabase
        .from('service_inventory')
        .delete()
        .eq('id', inventoryId)
        .eq('partner_id', partner.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or method' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Service availability error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});