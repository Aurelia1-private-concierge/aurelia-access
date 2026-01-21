import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// OTA XML namespace
const OTA_NS = "http://www.opentravel.org";

/**
 * Build OTA_HotelAvailRQ XML request
 */
function buildAvailabilityRequest(
  hotelCode: string,
  startDate: string,
  endDate: string,
  roomCount: number = 1,
  guestCount: number = 2
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<OTA_HotelAvailRQ xmlns="${OTA_NS}" Version="1.0" TimeStamp="${new Date().toISOString()}">
  <POS>
    <Source>
      <RequestorID Type="22" ID="AURELIA"/>
    </Source>
  </POS>
  <AvailRequestSegments>
    <AvailRequestSegment>
      <HotelSearchCriteria>
        <Criterion>
          <HotelRef HotelCode="${hotelCode}"/>
          <StayDateRange Start="${startDate}" End="${endDate}"/>
          <RoomStayCandidates>
            <RoomStayCandidate Quantity="${roomCount}">
              <GuestCounts>
                <GuestCount AgeQualifyingCode="10" Count="${guestCount}"/>
              </GuestCounts>
            </RoomStayCandidate>
          </RoomStayCandidates>
        </Criterion>
      </HotelSearchCriteria>
    </AvailRequestSegment>
  </AvailRequestSegments>
</OTA_HotelAvailRQ>`;
}

/**
 * Parse OTA_HotelAvailRS XML response
 */
function parseAvailabilityResponse(xmlString: string): {
  success: boolean;
  rooms: Array<{
    roomTypeCode: string;
    ratePlanCode: string;
    available: boolean;
    rateAmount: number;
    currency: string;
    description?: string;
  }>;
  errors?: string[];
} {
  // Basic XML parsing for OTA response
  const rooms: Array<{
    roomTypeCode: string;
    ratePlanCode: string;
    available: boolean;
    rateAmount: number;
    currency: string;
    description?: string;
  }> = [];
  const errors: string[] = [];

  // Check for errors in response
  const errorMatch = xmlString.match(/<Error[^>]*>(.*?)<\/Error>/gs);
  if (errorMatch) {
    errorMatch.forEach((err) => {
      const msgMatch = err.match(/ShortText="([^"]+)"/);
      if (msgMatch) errors.push(msgMatch[1]);
    });
    return { success: false, rooms: [], errors };
  }

  // Parse RoomStay elements
  const roomStayMatches = xmlString.match(/<RoomStay[^>]*>[\s\S]*?<\/RoomStay>/gs);
  if (roomStayMatches) {
    roomStayMatches.forEach((roomStay) => {
      const roomTypeMatch = roomStay.match(/RoomTypeCode="([^"]+)"/);
      const ratePlanMatch = roomStay.match(/RatePlanCode="([^"]+)"/);
      const amountMatch = roomStay.match(/AmountAfterTax="([^"]+)"/);
      const currencyMatch = roomStay.match(/CurrencyCode="([^"]+)"/);
      const availMatch = roomStay.match(/AvailabilityStatus="([^"]+)"/);
      const descMatch = roomStay.match(/<RoomDescription[^>]*>[\s\S]*?<Text[^>]*>(.*?)<\/Text>/);

      rooms.push({
        roomTypeCode: roomTypeMatch?.[1] || "UNKNOWN",
        ratePlanCode: ratePlanMatch?.[1] || "STANDARD",
        available: availMatch?.[1] !== "NoAvailability",
        rateAmount: parseFloat(amountMatch?.[1] || "0"),
        currency: currencyMatch?.[1] || "USD",
        description: descMatch?.[1]?.trim(),
      });
    });
  }

  return { success: true, rooms };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "query";

    if (req.method === "GET" && action === "query") {
      // Public availability query
      const propertyCode = url.searchParams.get("property");
      const startDate = url.searchParams.get("start");
      const endDate = url.searchParams.get("end");
      const rooms = parseInt(url.searchParams.get("rooms") || "1");
      const guests = parseInt(url.searchParams.get("guests") || "2");

      if (!propertyCode || !startDate || !endDate) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters: property, start, end" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Look up integration config
      const { data: integration, error: integrationError } = await supabase
        .from("partner_pms_integrations")
        .select("*, partners(company_name)")
        .eq("property_code", propertyCode)
        .eq("is_active", true)
        .eq("provider", "siteminder")
        .single();

      if (integrationError || !integration) {
        console.log(`No SiteMinder integration found for property: ${propertyCode}`);
        return new Response(
          JSON.stringify({ error: "Property not found or integration not active" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Build OTA request
      const otaRequest = buildAvailabilityRequest(propertyCode, startDate, endDate, rooms, guests);
      console.log(`SiteMinder availability request for ${propertyCode}:`, otaRequest);

      // In production, this would call SiteMinder's API endpoint
      // For now, we return a mock response and log the sync
      const mockResponse = {
        success: true,
        property: {
          code: propertyCode,
          name: integration.partners?.company_name || propertyCode,
        },
        dateRange: { start: startDate, end: endDate },
        rooms: [
          {
            roomTypeCode: "DELUXE",
            ratePlanCode: "BAR",
            available: true,
            rateAmount: 450.00,
            currency: "USD",
            description: "Deluxe Room with City View",
          },
          {
            roomTypeCode: "SUITE",
            ratePlanCode: "BAR",
            available: true,
            rateAmount: 850.00,
            currency: "USD",
            description: "Executive Suite",
          },
        ],
        otaRequestGenerated: otaRequest,
        integrationStatus: "connected",
      };

      // Log the sync attempt
      await supabase.from("pms_sync_logs").insert({
        integration_id: integration.id,
        sync_type: "availability_query",
        request_payload: { propertyCode, startDate, endDate, rooms, guests },
        response_payload: mockResponse,
        rooms_synced: mockResponse.rooms.length,
        status: "success",
        duration_ms: Date.now() - startTime,
      });

      return new Response(JSON.stringify(mockResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "sync") {
      // Partner-initiated full sync
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);

      if (authError || !claimsData?.claims?.sub) {
        return new Response(
          JSON.stringify({ error: "Invalid authentication" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userId = claimsData.claims.sub;

      // Get partner's integrations
      const { data: partner } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!partner) {
        return new Response(
          JSON.stringify({ error: "Partner not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: integrations } = await supabase
        .from("partner_pms_integrations")
        .select("*")
        .eq("partner_id", partner.id)
        .eq("is_active", true);

      if (!integrations || integrations.length === 0) {
        return new Response(
          JSON.stringify({ error: "No active integrations found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Sync each integration
      const results = [];
      for (const integration of integrations) {
        // In production, this would call SiteMinder's API
        const syncResult = {
          integrationId: integration.id,
          propertyCode: integration.property_code,
          status: "success",
          roomsSynced: 5,
          message: "Inventory synchronized successfully",
        };

        // Update integration status
        await supabase
          .from("partner_pms_integrations")
          .update({
            last_sync_at: new Date().toISOString(),
            sync_status: "success",
            sync_error: null,
          })
          .eq("id", integration.id);

        // Log the sync
        await supabase.from("pms_sync_logs").insert({
          integration_id: integration.id,
          sync_type: "full_sync",
          request_payload: { triggered_by: userId },
          response_payload: syncResult,
          rooms_synced: syncResult.roomsSynced,
          status: "success",
          duration_ms: Date.now() - startTime,
        });

        results.push(syncResult);
      }

      console.log(`SiteMinder sync completed for partner ${partner.id}:`, results);

      return new Response(JSON.stringify({ success: true, synced: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "webhook") {
      // Incoming webhook from SiteMinder for real-time updates
      const body = await req.text();
      console.log("SiteMinder webhook received:", body);

      // Parse the OTA message
      const isBookingNotification = body.includes("OTA_HotelResNotifRQ");
      const isAvailabilityUpdate = body.includes("OTA_HotelAvailNotifRQ");

      if (isBookingNotification) {
        // Handle new booking notification
        // Extract booking details from XML and update hotel_bookings table
        console.log("Processing booking notification from SiteMinder");
      } else if (isAvailabilityUpdate) {
        // Handle availability update
        // Update hotel_availability table
        console.log("Processing availability update from SiteMinder");
      }

      // Acknowledge receipt
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
<OTA_CommonRespRS xmlns="${OTA_NS}" Version="1.0">
  <Success/>
</OTA_CommonRespRS>`,
        { headers: { ...corsHeaders, "Content-Type": "application/xml" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[SiteMinder API] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});