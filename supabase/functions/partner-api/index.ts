import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, data } = await req.json();

    switch (action) {
      case "get_services": {
        // Get all active services from approved partners
        const { data: services, error } = await supabase
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
            partners (
              company_name,
              logo_url
            )
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Filter to only include services from approved partners
        const { data: approvedPartners } = await supabase
          .from("partners")
          .select("id")
          .eq("status", "approved");

        const approvedPartnerIds = new Set(approvedPartners?.map(p => p.id) || []);

        return new Response(JSON.stringify({ services }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create_request": {
        // Create a service request
        const { client_id, category, title, description, requirements, preferred_date, budget_min, budget_max } = data;

        if (!client_id || !category || !title || !description) {
          throw new Error("Missing required fields");
        }

        const { data: request, error } = await supabase
          .from("service_requests")
          .insert({
            client_id,
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

        if (error) throw error;

        // TODO: Trigger notification to relevant partners (could integrate with n8n)

        return new Response(JSON.stringify({ request }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "assign_partner": {
        // Admin assigns a partner to a request
        const { request_id, partner_id } = data;

        const { data: updated, error } = await supabase
          .from("service_requests")
          .update({ partner_id, status: "accepted" })
          .eq("id", request_id)
          .select()
          .single();

        if (error) throw error;

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
            description: `You have been assigned a new ${updated.category.replace("_", " ")} request.`,
            action_url: "/partner",
          });
        }

        return new Response(JSON.stringify({ request: updated }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_request_status": {
        // Partner updates request status
        const { request_id, status, response } = data;

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

        if (error) throw error;

        // Notify client
        await supabase.from("notifications").insert({
          user_id: updated.client_id,
          type: "request_update",
          title: "Request Update",
          description: `Your ${updated.category.replace("_", " ")} request status has been updated to ${status}.`,
          action_url: "/dashboard",
        });

        return new Response(JSON.stringify({ request: updated }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Partner API error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
