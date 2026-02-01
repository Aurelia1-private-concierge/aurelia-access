import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GuestInvitation {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  plus_ones?: number;
  vip_level?: string;
  dietary_restrictions?: string[];
  special_requests?: string;
}

interface EventData {
  title: string;
  description?: string;
  event_type?: string;
  venue_name?: string;
  venue_address?: string;
  start_date: string;
  end_date?: string;
  timezone?: string;
  expected_guests?: number;
  budget_min?: number;
  budget_max?: number;
  currency?: string;
  privacy_level?: string;
  dress_code?: string;
  theme?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
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
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const body = req.method !== 'GET' ? await req.json() : {};

    console.log(`[EventManagement] Action: ${action}, User: ${user.id}`);

    switch (action) {
      case 'create_event': {
        const eventData: EventData = body.event;
        
        const { data: event, error } = await supabase
          .from('vip_events')
          .insert({
            ...eventData,
            organizer_id: user.id,
            status: 'draft',
          })
          .select()
          .single();

        if (error) throw error;

        console.log(`[EventManagement] Created event: ${event.id}`);
        
        return new Response(
          JSON.stringify({ success: true, event }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'send_invitations': {
        const { event_id, guests } = body as { event_id: string; guests: GuestInvitation[] };

        // Validate event ownership
        const { data: event } = await supabase
          .from('vip_events')
          .select('id, title, organizer_id')
          .eq('id', event_id)
          .single();

        if (!event || event.organizer_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Event not found or unauthorized' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate invitation codes and insert guests
        const guestRecords = guests.map(guest => ({
          event_id,
          guest_name: guest.guest_name,
          guest_email: guest.guest_email,
          guest_phone: guest.guest_phone,
          plus_ones: guest.plus_ones || 0,
          vip_level: guest.vip_level || 'standard',
          dietary_restrictions: guest.dietary_restrictions || [],
          special_requests: guest.special_requests,
          invitation_code: crypto.randomUUID().slice(0, 8).toUpperCase(),
          invitation_sent_at: new Date().toISOString(),
          rsvp_status: 'pending',
        }));

        const { data: insertedGuests, error } = await supabase
          .from('guest_lists')
          .insert(guestRecords)
          .select();

        if (error) throw error;

        // Queue email notifications (using notification_outbox pattern)
        for (const guest of insertedGuests || []) {
          if (guest.guest_email) {
            await supabase.from('notification_outbox').insert({
              recipient_email: guest.guest_email,
              notification_type: 'event_invitation',
              subject: `You're Invited: ${event.title}`,
              template_data: {
                guest_name: guest.guest_name,
                event_title: event.title,
                invitation_code: guest.invitation_code,
                rsvp_url: `${Deno.env.get('SITE_URL') || 'https://aurelia.com'}/rsvp/${guest.invitation_code}`,
              },
            });
          }
        }

        console.log(`[EventManagement] Sent ${insertedGuests?.length} invitations for event ${event_id}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            invitations_sent: insertedGuests?.length || 0,
            guests: insertedGuests 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'rsvp': {
        const { invitation_code, response, dietary_restrictions, special_requests } = body;

        const { data: guest, error: findError } = await supabase
          .from('guest_lists')
          .select('*, vip_events(*)')
          .eq('invitation_code', invitation_code)
          .single();

        if (findError || !guest) {
          return new Response(
            JSON.stringify({ error: 'Invalid invitation code' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: updateError } = await supabase
          .from('guest_lists')
          .update({
            rsvp_status: response, // confirmed, declined
            rsvp_responded_at: new Date().toISOString(),
            dietary_restrictions: dietary_restrictions || guest.dietary_restrictions,
            special_requests: special_requests || guest.special_requests,
            user_id: user.id, // Link to authenticated user
          })
          .eq('id', guest.id);

        if (updateError) throw updateError;

        console.log(`[EventManagement] RSVP ${response} for guest ${guest.id}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: response === 'confirmed' 
              ? 'Your attendance has been confirmed!' 
              : 'Your response has been recorded.',
            event: guest.vip_events 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check_in': {
        const { guest_id, event_id } = body;

        // Validate organizer
        const { data: event } = await supabase
          .from('vip_events')
          .select('organizer_id')
          .eq('id', event_id)
          .single();

        if (!event || event.organizer_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: guest, error } = await supabase
          .from('guest_lists')
          .update({ check_in_at: new Date().toISOString() })
          .eq('id', guest_id)
          .eq('event_id', event_id)
          .select()
          .single();

        if (error) throw error;

        console.log(`[EventManagement] Guest ${guest_id} checked in`);

        return new Response(
          JSON.stringify({ success: true, guest }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_event_summary': {
        const event_id = url.searchParams.get('event_id');

        const { data: event } = await supabase
          .from('vip_events')
          .select(`
            *,
            guest_lists(count),
            event_budget_items(category, estimated_amount, paid_amount),
            event_itinerary(time_slot, activity, duration_minutes)
          `)
          .eq('id', event_id)
          .single();

        if (!event) {
          return new Response(
            JSON.stringify({ error: 'Event not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Calculate RSVP stats
        const { data: rsvpStats } = await supabase
          .from('guest_lists')
          .select('rsvp_status')
          .eq('event_id', event_id);

        const stats = {
          total_invited: rsvpStats?.length || 0,
          confirmed: rsvpStats?.filter(g => g.rsvp_status === 'confirmed').length || 0,
          declined: rsvpStats?.filter(g => g.rsvp_status === 'declined').length || 0,
          pending: rsvpStats?.filter(g => g.rsvp_status === 'pending').length || 0,
          waitlisted: rsvpStats?.filter(g => g.rsvp_status === 'waitlisted').length || 0,
        };

        // Budget summary
        const budgetItems = event.event_budget_items || [];
        const budgetSummary = {
          total_estimated: budgetItems.reduce((sum: number, item: any) => sum + (item.estimated_amount || 0), 0),
          total_paid: budgetItems.reduce((sum: number, item: any) => sum + (item.paid_amount || 0), 0),
          by_category: budgetItems.reduce((acc: Record<string, number>, item: any) => {
            acc[item.category] = (acc[item.category] || 0) + (item.estimated_amount || 0);
            return acc;
          }, {}),
        };

        return new Response(
          JSON.stringify({ 
            success: true, 
            event,
            rsvp_stats: stats,
            budget_summary: budgetSummary,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[EventManagement] Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
