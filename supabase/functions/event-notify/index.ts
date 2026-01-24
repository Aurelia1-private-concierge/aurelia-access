import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventSummary {
  title: string;
  date: string;
  location: string;
  description: string;
  category: string;
}

interface EventNotifyPayload {
  eventSummary: EventSummary;
  partnerRef: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Valid Bearer token required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const apiKey = authHeader.replace("Bearer ", "");

    // Validate partner API key against partners table
    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .select("id, company_name, status")
      .eq("api_key", apiKey)
      .eq("status", "approved")
      .single();

    if (partnerError || !partner) {
      console.error("Invalid partner API key or partner not approved");
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Invalid or inactive partner credentials" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse and validate payload
    const payload: EventNotifyPayload = await req.json();

    if (!payload.eventSummary || !payload.partnerRef) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "eventSummary and partnerRef are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { eventSummary, partnerRef } = payload;

    // Validate eventSummary fields
    if (!eventSummary.title || !eventSummary.date || !eventSummary.location) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "eventSummary must include title, date, and location" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log the notification
    console.log(`Event notification received from partner ${partner.company_name}:`, {
      partnerRef,
      eventTitle: eventSummary.title,
      eventDate: eventSummary.date,
      eventLocation: eventSummary.location,
      eventCategory: eventSummary.category,
    });

    // Store notification in partner_notifications table
    const { error: insertError } = await supabase
      .from("partner_notifications")
      .insert({
        partner_id: partner.id,
        notification_type: "event_notify",
        title: `Event: ${eventSummary.title}`,
        message: eventSummary.description || `${eventSummary.category} event at ${eventSummary.location}`,
        metadata: {
          partnerRef,
          eventSummary,
          receivedAt: new Date().toISOString(),
        },
      });

    if (insertError) {
      console.error("Failed to store notification:", insertError);
      // Continue anyway - notification storage is not critical
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Event notification received successfully",
        notificationId: crypto.randomUUID(),
        partnerRef,
        receivedAt: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Event notify error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
