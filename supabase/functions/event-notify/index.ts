import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valid event categories
const VALID_CATEGORIES = [
  "Yachting", "Gala", "Private Aviation", "Fine Dining",
  "Art & Culture", "Wellness", "Real Estate", "Collectibles", "Travel", "Other"
] as const;

interface PublicEventSummary {
  title: string;
  date: string;
  location: string;
  description: string;
  category: string;
}

interface PartnerNotificationRequest {
  eventSummary: PublicEventSummary;
  partnerRef: string;
}

/**
 * Validates the event summary payload
 */
function validateEventSummary(eventSummary: unknown): { valid: boolean; error?: string } {
  if (!eventSummary || typeof eventSummary !== 'object') {
    return { valid: false, error: 'eventSummary must be an object' };
  }

  const es = eventSummary as Record<string, unknown>;

  // Validate required string fields
  const requiredFields = ['title', 'date', 'location', 'description', 'category'];
  for (const field of requiredFields) {
    if (typeof es[field] !== 'string') {
      return { valid: false, error: `eventSummary.${field} must be a string` };
    }
    if ((es[field] as string).trim().length === 0) {
      return { valid: false, error: `eventSummary.${field} cannot be empty` };
    }
  }

  // Validate title length (max 100 chars)
  if ((es.title as string).length > 100) {
    return { valid: false, error: 'eventSummary.title must be 100 characters or less' };
  }

  // Validate description length (max 500 chars)
  if ((es.description as string).length > 500) {
    return { valid: false, error: 'eventSummary.description must be 500 characters or less' };
  }

  // Validate date format (ISO 8601)
  const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
  if (!dateRegex.test(es.date as string)) {
    return { valid: false, error: 'eventSummary.date must be a valid ISO 8601 date' };
  }

  // Validate category
  if (!VALID_CATEGORIES.includes(es.category as typeof VALID_CATEGORIES[number])) {
    return { valid: false, error: `eventSummary.category must be one of: ${VALID_CATEGORIES.join(', ')}` };
  }

  // Validate location is not a private address (basic check)
  const location = (es.location as string).toLowerCase();
  const privatePatterns = [/\d+\s+[a-z]+\s+(street|st|avenue|ave|road|rd|lane|ln|drive|dr)/i];
  for (const pattern of privatePatterns) {
    if (pattern.test(es.location as string)) {
      return { valid: false, error: 'eventSummary.location should be a general location, not a private address' };
    }
  }

  return { valid: true };
}

/**
 * Authenticates the partner using Bearer token
 */
async function authenticatePartner(
  supabase: any,
  authHeader: string | null
): Promise<{ valid: boolean; partner?: any; error?: string }> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Valid Bearer token required" };
  }

  const apiKey = authHeader.replace("Bearer ", "");

  if (!apiKey || apiKey.length < 32) {
    return { valid: false, error: "Invalid API key format" };
  }

  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("id, company_name, status")
    .eq("api_key", apiKey)
    .eq("status", "approved")
    .single();

  if (partnerError || !partner) {
    console.error("[AUDIT] Invalid partner API key or partner not approved");
    return { valid: false, error: "Invalid or inactive partner credentials" };
  }

  return { valid: true, partner };
}

/**
 * Adds notification to outbox queue for reliable delivery
 */
async function addToOutbox(
  supabase: any,
  partnerId: string,
  partnerRef: string,
  eventSummary: PublicEventSummary
): Promise<{ success: boolean; outboxId?: string; error?: string }> {
  const { data, error } = await supabase
    .from("notification_outbox")
    .insert({
      partner_id: partnerId,
      partner_ref: partnerRef,
      event_summary: eventSummary,
      status: "pending",
      next_retry_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[AUDIT] Failed to add to outbox:", error);
    return { success: false, error: error.message };
  }

  return { success: true, outboxId: data?.id as string };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed", message: "Only POST requests are accepted" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate partner
    const authResult = await authenticatePartner(supabase, req.headers.get("Authorization"));
    if (!authResult.valid) {
      console.error(`[AUDIT] Authentication failed: ${authResult.error}`);
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: authResult.error }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const partner = authResult.partner!;

    // Parse request body
    let payload: PartnerNotificationRequest;
    try {
      payload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { eventSummary, partnerRef } = payload;

    // Validate partnerRef
    if (!partnerRef || typeof partnerRef !== "string" || partnerRef.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "partnerRef is required and must be a non-empty string" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (partnerRef.length > 100) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "partnerRef must be 100 characters or less" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate event summary
    const validation = validateEventSummary(eventSummary);
    if (!validation.valid) {
      console.error(`[AUDIT] Validation failed for partner ${partner.company_name}: ${validation.error}`);
      return new Response(
        JSON.stringify({ error: "Bad Request", message: validation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const timestamp = Date.now();

    // Audit log the incoming notification
    console.log(`[AUDIT] Event notified from "${partner.company_name}" (ref: ${partnerRef}): ${JSON.stringify({
      title: eventSummary.title,
      date: eventSummary.date,
      location: eventSummary.location,
      category: eventSummary.category,
      timestamp: new Date(timestamp).toISOString()
    })}`);

    // Add to outbox queue for reliable delivery
    const outboxResult = await addToOutbox(supabase, partner.id, partnerRef, eventSummary);
    if (!outboxResult.success) {
      console.error(`[AUDIT] Outbox insert failed: ${outboxResult.error}`);
      // Continue even if outbox fails - store in partner_notifications as fallback
    }

    // Store in partner_notifications (legacy table, kept for compatibility)
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
          outboxId: outboxResult.outboxId,
          receivedAt: new Date(timestamp).toISOString(),
        },
      });

    if (insertError) {
      console.error("[AUDIT] Failed to store notification:", insertError);
    }

    // Response format aligned with Express pattern
    return new Response(
      JSON.stringify({
        status: "sent",
        timestamp,
        notificationId: outboxResult.outboxId || crypto.randomUUID(),
        partnerRef,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[AUDIT] Event notify error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
