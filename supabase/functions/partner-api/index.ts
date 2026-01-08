import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const serviceCategories = [
  "private_aviation",
  "yacht_charter", 
  "real_estate",
  "collectibles",
  "events_access",
  "security",
  "dining",
  "travel",
  "wellness",
  "shopping"
] as const;

const getServicesSchema = z.object({
  category: z.enum(serviceCategories).optional(),
});

const createRequestSchema = z.object({
  category: z.enum(serviceCategories),
  title: z.string().min(1, "Title required").max(200, "Title too long"),
  description: z.string().min(1, "Description required").max(5000, "Description too long"),
  requirements: z.record(z.any()).optional(),
  preferred_date: z.string().optional(),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
});

const assignPartnerSchema = z.object({
  request_id: z.string().uuid("Invalid request ID"),
  partner_id: z.string().uuid("Invalid partner ID"),
});

const updateStatusSchema = z.object({
  request_id: z.string().uuid("Invalid request ID"),
  status: z.enum(["pending", "accepted", "in_progress", "completed", "cancelled"]),
  response: z.string().max(5000).optional(),
});

const actionSchema = z.enum(["get_services", "create_request", "assign_partner", "update_request_status"]);

// Helper function to check user role
async function hasRole(supabase: any, userId: string, role: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: role,
  });
  return !error && data === true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Create service role client for operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body first to validate action
    const body = await req.json();
    const actionValidation = actionSchema.safeParse(body.action);
    
    if (!actionValidation.success) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const action = actionValidation.data;
    const data = body.data || {};

    // get_services is public (read-only, filtered data)
    // All other actions require authentication
    let userId: string | null = null;

    if (action !== "get_services") {
      // Verify authentication
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.replace("Bearer ", "");
      
      // Skip if it's just the anon key
      if (token === supabaseAnonKey) {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user token
      const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);
      
      if (authError || !claimsData?.claims?.sub) {
        console.error("Auth error:", authError);
        return new Response(
          JSON.stringify({ error: "Invalid authentication" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = claimsData.claims.sub;
      console.log(`Authenticated user: ${userId}, action: ${action}`);
    }

    switch (action) {
      case "get_services": {
        // Validate optional filters
        const validation = getServicesSchema.safeParse(data);
        if (!validation.success) {
          return new Response(
            JSON.stringify({ error: "Invalid filter parameters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get all active services from approved partners
        let query = supabase
          .from("partner_services")
          .select(`
            id,
            title,
            description,
            category,
            highlights,
            min_price,
            max_price,
            availability_notes,
            partners!inner (
              id,
              company_name,
              logo_url,
              status
            )
          `)
          .eq("is_active", true)
          .eq("partners.status", "approved")
          .order("created_at", { ascending: false })
          .limit(100); // Rate limit results

        if (validation.data.category) {
          query = query.eq("category", validation.data.category);
        }

        const { data: services, error } = await query;

        if (error) {
          console.error("Get services error:", error);
          throw new Error("Failed to fetch services");
        }

        return new Response(JSON.stringify({ services }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create_request": {
        // Validate input
        const validation = createRequestSchema.safeParse(data);
        if (!validation.success) {
          return new Response(
            JSON.stringify({ error: validation.error.errors[0]?.message || "Invalid request data" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { category, title, description, requirements, preferred_date, budget_min, budget_max } = validation.data;

        // Use authenticated user ID (not client-supplied!)
        const { data: request, error } = await supabase
          .from("service_requests")
          .insert({
            client_id: userId, // From JWT, secure
            category,
            title,
            description,
            requirements,
            preferred_date,
            budget_min,
            budget_max,
          })
          .select()
          .single();

        if (error) {
          console.error("Create request error:", error);
          throw new Error("Failed to create request");
        }

        console.log(`Service request created: ${request.id} by user ${userId}`);

        return new Response(JSON.stringify({ request }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "assign_partner": {
        // Validate input
        const validation = assignPartnerSchema.safeParse(data);
        if (!validation.success) {
          return new Response(
            JSON.stringify({ error: validation.error.errors[0]?.message || "Invalid assignment data" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check admin role
        const isAdmin = await hasRole(supabase, userId!, "admin");
        if (!isAdmin) {
          console.warn(`Unauthorized admin action attempted by user ${userId}`);
          return new Response(
            JSON.stringify({ error: "Admin access required" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { request_id, partner_id } = validation.data;

        const { data: updated, error } = await supabase
          .from("service_requests")
          .update({ partner_id, status: "accepted" })
          .eq("id", request_id)
          .select()
          .single();

        if (error) {
          console.error("Assign partner error:", error);
          throw new Error("Failed to assign partner");
        }

        // Create notification for partner
        const { data: partner } = await supabase
          .from("partners")
          .select("user_id")
          .eq("id", partner_id)
          .single();

        if (partner) {
          await supabase.from("notifications").insert({
            user_id: partner.user_id,
            type: "request",
            title: "New Service Request",
            description: `You have been assigned a new ${updated.category.replace(/_/g, " ")} request.`,
            action_url: "/partner",
          });
        }

        console.log(`Partner ${partner_id} assigned to request ${request_id} by admin ${userId}`);

        return new Response(JSON.stringify({ request: updated }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_request_status": {
        // Validate input
        const validation = updateStatusSchema.safeParse(data);
        if (!validation.success) {
          return new Response(
            JSON.stringify({ error: validation.error.errors[0]?.message || "Invalid status update data" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { request_id, status, response } = validation.data;

        // Verify the user is either the partner assigned to this request or an admin
        const { data: request } = await supabase
          .from("service_requests")
          .select("partner_id, client_id, partners(user_id)")
          .eq("id", request_id)
          .single();

        if (!request) {
          return new Response(
            JSON.stringify({ error: "Request not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const isAdmin = await hasRole(supabase, userId!, "admin");
        // partners can be an array or object depending on relationship
        const partnerData = Array.isArray(request.partners) ? request.partners[0] : request.partners;
        const isAssignedPartner = partnerData?.user_id === userId;

        if (!isAdmin && !isAssignedPartner) {
          console.warn(`Unauthorized status update attempted by user ${userId} on request ${request_id}`);
          return new Response(
            JSON.stringify({ error: "Not authorized to update this request" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: updated, error } = await supabase
          .from("service_requests")
          .update({ 
            status, 
            partner_response: response,
            updated_at: new Date().toISOString()
          })
          .eq("id", request_id)
          .select()
          .single();

        if (error) {
          console.error("Update status error:", error);
          throw new Error("Failed to update request status");
        }

        // Notify client
        await supabase.from("notifications").insert({
          user_id: updated.client_id,
          type: "request_update",
          title: "Request Update",
          description: `Your ${updated.category.replace(/_/g, " ")} request status has been updated to ${status}.`,
          action_url: "/dashboard",
        });

        console.log(`Request ${request_id} status updated to ${status} by user ${userId}`);

        return new Response(JSON.stringify({ request: updated }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Partner API error:", error);
    // Return generic error to avoid leaking internal details
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
