import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

interface WebhookPayload {
  event: string;
  data: any;
  timestamp?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    // GET: List configured webhooks (for admin)
    if (req.method === "GET" && action === "list") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      const { data: webhooks, error } = await supabase
        .from('webhook_endpoints')
        .select('id, name, url, endpoint_type, events, is_active, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ webhooks }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // POST: Add a new webhook endpoint
    if (req.method === "POST" && action === "add") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      const { name, url: webhookUrl, endpoint_type, events, headers } = await req.json();
      
      if (!name || !webhookUrl || !endpoint_type) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: name, url, endpoint_type" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      const { data, error } = await supabase
        .from('webhook_endpoints')
        .insert({
          name,
          url: webhookUrl,
          endpoint_type,
          events: events || ['contact_form'],
          headers: headers || {},
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log(`Webhook endpoint created: ${name}`);
      
      return new Response(JSON.stringify({ success: true, webhook: data }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // DELETE: Remove a webhook endpoint
    if (req.method === "DELETE") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      const webhookId = url.searchParams.get('id');
      if (!webhookId) {
        return new Response(
          JSON.stringify({ error: "Missing webhook ID" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      const { error } = await supabase
        .from('webhook_endpoints')
        .delete()
        .eq('id', webhookId);
      
      if (error) throw error;
      
      console.log(`Webhook endpoint deleted: ${webhookId}`);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // PATCH: Toggle webhook active status
    if (req.method === "PATCH") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      const { id, is_active } = await req.json();
      
      const { data, error } = await supabase
        .from('webhook_endpoints')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log(`Webhook ${id} active status: ${is_active}`);
      
      return new Response(JSON.stringify({ success: true, webhook: data }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // POST without action: Receive incoming webhook (from n8n or external services)
    if (req.method === "POST" && !action) {
      const payload: WebhookPayload = await req.json();
      
      console.log("Received webhook:", JSON.stringify(payload));
      
      // Process based on event type
      switch (payload.event) {
        case 'contact_status_update':
          // Update contact submission status from CRM/n8n
          if (payload.data?.contact_id && payload.data?.status) {
            await supabase
              .from('contact_submissions')
              .update({ 
                status: payload.data.status,
                notes: payload.data.notes || null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', payload.data.contact_id);
            
            console.log(`Contact ${payload.data.contact_id} status updated to ${payload.data.status}`);
          }
          break;
          
        case 'assign_contact':
          // Assign contact to a team member
          if (payload.data?.contact_id && payload.data?.assigned_to) {
            await supabase
              .from('contact_submissions')
              .update({ 
                assigned_to: payload.data.assigned_to,
                updated_at: new Date().toISOString(),
              })
              .eq('id', payload.data.contact_id);
            
            console.log(`Contact ${payload.data.contact_id} assigned to ${payload.data.assigned_to}`);
          }
          break;
          
        case 'add_note':
          // Add note to contact
          if (payload.data?.contact_id && payload.data?.note) {
            const { data: contact } = await supabase
              .from('contact_submissions')
              .select('notes')
              .eq('id', payload.data.contact_id)
              .single();
            
            const existingNotes = contact?.notes || '';
            const newNote = `[${new Date().toISOString()}] ${payload.data.note}`;
            const updatedNotes = existingNotes ? `${existingNotes}\n\n${newNote}` : newNote;
            
            await supabase
              .from('contact_submissions')
              .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
              .eq('id', payload.data.contact_id);
            
            console.log(`Note added to contact ${payload.data.contact_id}`);
          }
          break;
          
        default:
          console.log(`Unknown webhook event: ${payload.event}`);
      }
      
      return new Response(JSON.stringify({ success: true, received: payload.event }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
    
  } catch (error: any) {
    console.error("Webhook receiver error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
