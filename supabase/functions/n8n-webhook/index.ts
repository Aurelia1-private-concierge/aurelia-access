import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-n8n-signature',
};

interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: WebhookPayload = await req.json();
    const { event, data } = payload;

    console.log(`[n8n-webhook] Received event: ${event}`, data);

    let result: Record<string, unknown> = { success: true };

    switch (event) {
      // Service request workflows
      case 'service_request.created':
        result = await handleServiceRequestCreated(supabase, data);
        break;

      case 'service_request.updated':
        result = await handleServiceRequestUpdated(supabase, data);
        break;

      case 'service_request.completed':
        result = await handleServiceRequestCompleted(supabase, data);
        break;

      // Partner workflows
      case 'partner.notify':
        result = await handlePartnerNotify(supabase, data);
        break;

      case 'partner.assigned':
        result = await handlePartnerAssigned(supabase, data);
        break;

      // Client workflows
      case 'client.welcome':
        result = await handleClientWelcome(supabase, data);
        break;

      case 'client.reminder':
        result = await handleClientReminder(supabase, data);
        break;

      // Calendar workflows
      case 'calendar.sync':
        result = await handleCalendarSync(supabase, data);
        break;

      // Commission workflows
      case 'commission.calculate':
        result = await handleCommissionCalculate(supabase, data);
        break;

      default:
        console.log(`[n8n-webhook] Unknown event: ${event}`);
        result = { success: false, error: `Unknown event: ${event}` };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[n8n-webhook] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Handler functions
async function handleServiceRequestCreated(supabase: any, data: Record<string, unknown>) {
  const { request_id, client_id, category, title } = data;
  
  // Create notification for admins
  const { error } = await supabase.from('notifications').insert({
    user_id: client_id,
    type: 'service_request',
    title: 'Request Received',
    description: `Your ${category} request "${title}" has been received and is being processed.`,
    action_url: `/dashboard?tab=requests`,
  });

  if (error) throw error;

  // Log the event
  await supabase.from('audit_logs').insert({
    action: 'service_request_created',
    resource_type: 'service_request',
    resource_id: request_id,
    details: { source: 'n8n', category, title },
  });

  return { success: true, message: 'Service request notification sent' };
}

async function handleServiceRequestUpdated(supabase: any, data: Record<string, unknown>) {
  const { request_id, client_id, new_status, title } = data;

  await supabase.from('notifications').insert({
    user_id: client_id,
    type: 'service_update',
    title: 'Request Updated',
    description: `Your request "${title}" status has been updated to: ${new_status}`,
    action_url: `/dashboard?tab=requests`,
  });

  return { success: true, message: 'Status update notification sent' };
}

async function handleServiceRequestCompleted(supabase: any, data: Record<string, unknown>) {
  const { request_id, client_id, title, partner_id } = data;

  // Notify client
  await supabase.from('notifications').insert({
    user_id: client_id,
    type: 'service_complete',
    title: 'Service Completed',
    description: `Your request "${title}" has been successfully completed. We hope you enjoyed the experience!`,
    action_url: `/dashboard?tab=requests`,
  });

  // If partner assigned, log for commission
  if (partner_id) {
    await supabase.from('audit_logs').insert({
      action: 'service_completed_with_partner',
      resource_type: 'service_request',
      resource_id: request_id,
      details: { partner_id, triggered_by: 'n8n' },
    });
  }

  return { success: true, message: 'Completion notifications sent' };
}

async function handlePartnerNotify(supabase: any, data: Record<string, unknown>) {
  const { partner_id, message, request_id } = data;

  // Get partner info
  const { data: partner } = await supabase
    .from('partners')
    .select('user_id, company_name')
    .eq('id', partner_id)
    .single();

  if (partner) {
    await supabase.from('notifications').insert({
      user_id: partner.user_id,
      type: 'partner_notification',
      title: 'New Opportunity',
      description: message || 'You have a new service opportunity. Please review.',
      action_url: `/partner-portal`,
    });
  }

  return { success: true, message: 'Partner notified' };
}

async function handlePartnerAssigned(supabase: any, data: Record<string, unknown>) {
  const { request_id, partner_id, client_id, title } = data;

  // Notify partner
  const { data: partner } = await supabase
    .from('partners')
    .select('user_id, company_name')
    .eq('id', partner_id)
    .single();

  if (partner) {
    await supabase.from('notifications').insert({
      user_id: partner.user_id,
      type: 'assignment',
      title: 'New Assignment',
      description: `You have been assigned to: "${title}"`,
      action_url: `/partner-portal`,
    });
  }

  // Notify client
  await supabase.from('notifications').insert({
    user_id: client_id,
    type: 'partner_assigned',
    title: 'Partner Assigned',
    description: `${partner?.company_name || 'A partner'} has been assigned to your request.`,
    action_url: `/dashboard?tab=requests`,
  });

  return { success: true, message: 'Assignment notifications sent' };
}

async function handleClientWelcome(supabase: any, data: Record<string, unknown>) {
  const { user_id, email, name } = data;

  await supabase.from('notifications').insert({
    user_id,
    type: 'welcome',
    title: 'Welcome to Aurelia',
    description: `Hello ${name}, welcome to the world of bespoke luxury. Your concierge awaits.`,
    action_url: `/dashboard`,
  });

  return { success: true, message: 'Welcome notification sent' };
}

async function handleClientReminder(supabase: any, data: Record<string, unknown>) {
  const { user_id, reminder_type, message } = data;

  await supabase.from('notifications').insert({
    user_id,
    type: 'reminder',
    title: reminder_type || 'Reminder',
    description: message,
    action_url: `/dashboard`,
  });

  return { success: true, message: 'Reminder sent' };
}

async function handleCalendarSync(supabase: any, data: Record<string, unknown>) {
  const { user_id, event_title, start_date, end_date, service_request_id } = data;

  const { error } = await supabase.from('calendar_events').insert({
    user_id,
    title: event_title,
    start_date,
    end_date,
    service_request_id,
    event_type: 'service',
  });

  if (error) throw error;

  return { success: true, message: 'Calendar event created' };
}

async function handleCommissionCalculate(supabase: any, data: Record<string, unknown>) {
  const { service_request_id } = data;

  // Get the service request
  const { data: request } = await supabase
    .from('service_requests')
    .select('*, partners(*)')
    .eq('id', service_request_id)
    .single();

  if (!request || !request.partner_id) {
    return { success: false, error: 'No partner assigned' };
  }

  const bookingAmount = request.budget_max || request.budget_min || 1000;
  const commissionRate = 15;
  const commissionAmount = bookingAmount * (commissionRate / 100);

  // Check if commission already exists
  const { data: existing } = await supabase
    .from('partner_commissions')
    .select('id')
    .eq('service_request_id', service_request_id)
    .single();

  if (!existing) {
    await supabase.from('partner_commissions').insert({
      partner_id: request.partner_id,
      client_id: request.client_id,
      service_request_id,
      service_title: request.title,
      booking_amount: bookingAmount,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      status: 'pending',
    });
  }

  return { 
    success: true, 
    commission: { amount: commissionAmount, rate: commissionRate } 
  };
}
