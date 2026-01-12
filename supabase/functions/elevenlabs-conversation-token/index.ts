import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Orla's personality and capabilities
const ORLA_SYSTEM_PROMPT = `You are Orla, Aurelia's private AI concierge. Speak with warmth, discretion, and sophistication. Never use casual language like "hey" or "cool". Address members by name when known.

Your capabilities include:
- Private aviation bookings and jet charter
- Yacht charter arrangements
- Luxury real estate inquiries
- Collectibles acquisition
- Exclusive event access
- Security services coordination
- Fine dining reservations
- Bespoke travel planning
- Wellness retreat bookings
- Personal shopping assistance
- Chauffeur services

Always maintain confidentiality. When discussing services:
- Confirm budget comfort before presenting options
- Offer 2-3 curated choices, never overwhelming lists
- Proactively mention relevant perks for their membership tier
- For requests outside scope, offer to connect with specialist team
- Never promise specific availability without checking

Escalate immediately for: Legal matters, medical emergencies, security concerns, complaints about partners, requests over $100k, celebrity/political figures.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Voice service not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify authentication - require valid user token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Skip if it's just the anon key (not a user token)
    if (token === SUPABASE_ANON_KEY) {
      return new Response(
        JSON.stringify({ error: "User authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user token
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: claimsData, error: authError } = await supabase.auth.getClaims(token);

    if (authError || !claimsData?.claims?.sub) {
      console.error("Auth verification failed:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user ${userId} requesting voice session`);

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", userId)
      .single();

    const userName = profile?.display_name || "valued member";

    // Create a dynamic agent for this conversation
    console.log("Creating ElevenLabs conversational agent...");
    
    const createAgentResponse = await fetch(
      "https://api.elevenlabs.io/v1/convai/agents/create",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Orla - Session ${Date.now()}`,
          conversation_config: {
            agent: {
              prompt: {
                prompt: ORLA_SYSTEM_PROMPT + `\n\nThe current member's name is: ${userName}`,
              },
              first_message: `Good day, ${userName}. I'm Orla, your personal concierge. How may I assist you today?`,
              language: "en",
            },
            tts: {
              voice_id: "EXAVITQu4vr4xnSDxMaL", // Sarah - warm, professional voice
            },
          },
        }),
      }
    );

    if (!createAgentResponse.ok) {
      const errorText = await createAgentResponse.text();
      console.error("Failed to create agent:", createAgentResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to initialize voice assistant" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const agentData = await createAgentResponse.json();
    const agentId = agentData.agent_id;
    console.log(`Created agent: ${agentId}`);

    // Now get a signed URL for this agent
    const signedUrlResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    if (!signedUrlResponse.ok) {
      const errorText = await signedUrlResponse.text();
      console.error("Failed to get signed URL:", signedUrlResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to initialize voice session" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const urlData = await signedUrlResponse.json();
    console.log(`Successfully obtained signed URL for user ${userId}`);

    return new Response(
      JSON.stringify({ 
        signed_url: urlData.signed_url,
        agent_id: agentId 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Conversation token error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
