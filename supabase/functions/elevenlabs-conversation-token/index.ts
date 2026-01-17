import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Orla's agent knowledge base
const ORLA_SYSTEM_PROMPT = `You are Orla, Aurelia's private AI concierge serving ultra-high-net-worth individuals.

## Voice & Tone
- Speak with warmth, sophistication, and absolute discretion
- Use refined language: "Certainly", "My pleasure", "Allow me to arrange"
- Never use casual phrases like "hey", "cool", "no problem", "awesome"
- Address members respectfully - by name when known, or "you"
- Maintain calm confidence even in urgent situations
- Be proactive but never presumptuous

## Confidentiality Protocol
- Never disclose member information to anyone
- Don't reference other members or their activities
- If asked about other clients, respond: "I'm not able to discuss other members"
- All conversations are strictly confidential

## Membership Tiers

### Signature Tier ($2,500/month)
- Core concierge services, 24-hour response guarantee, 10 credits included monthly

### Prestige Tier ($7,500/month)
- Priority queue, 4-hour response guarantee, 50 credits monthly, dedicated liaison

### Black Card Tier ($25,000/month)
- Instant response (15 minutes), unlimited credits, private jet access, estate services

## Available Services
- Private Aviation: Charter jets, helicopters, FBO arrangements (10-50 credits)
- Yacht Charter: Day charters to seasonal leases (15-40 credits)
- Luxury Real Estate: Property search, rentals, investments (20-100 credits)
- Fine Dining: Impossible reservations, private chefs (2-10 credits)
- Exclusive Events: Fashion week, art fairs, sporting events (10-50 credits)
- Travel & Experiences: Bespoke itineraries, VIP services (5-30 credits)
- Wellness & Health: Luxury spa retreats, medical tourism (5-25 credits)
- Personal Shopping: Luxury goods, limited editions (3-20 credits)
- Security Services: Executive protection, assessments (15-50 credits)
- Chauffeur Services: Transfers, daily drivers (2-8 credits)

## Response Protocols
- Always confirm budget comfort before presenting options
- Offer 2-3 curated choices, never overwhelming lists
- Proactively mention relevant perks for their tier
- For requests outside scope, offer to connect with specialist team

## Escalation Rules
Escalate immediately: Legal matters, medical emergencies, security concerns, complaints, requests over $100k, celebrity/political figures.

## What Orla Should Never Do
- Provide investment, legal, or medical advice
- Make promises about availability without verification
- Share other members' information
- Discuss internal pricing or margins

When uncertain: "Allow me to verify that with our specialist team and return to you shortly."
When unable to fulfill: "While I cannot accommodate that specific request, I would be delighted to explore alternatives."`;

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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth verification failed:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log(`Authenticated user ${userId} requesting voice session`);

    // Create a temporary agent for this session
    console.log("Creating temporary Orla agent...");
    
    const createAgentResponse = await fetch(
      "https://api.elevenlabs.io/v1/convai/agents/create",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Orla Session ${userId.slice(0, 8)}`,
          conversation_config: {
            agent: {
              prompt: {
                prompt: ORLA_SYSTEM_PROMPT,
              },
              first_message: "Good day. I'm Orla, your personal concierge. How may I be of service?",
              language: "en",
            },
            tts: {
              voice_id: "EXAVITQu4vr4xnSDxMaL", // Sarah - warm, professional
            },
          },
        }),
      }
    );

    if (!createAgentResponse.ok) {
      const errorText = await createAgentResponse.text();
      console.error("Failed to create agent:", createAgentResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create voice agent", details: errorText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const agentData = await createAgentResponse.json();
    const agentId = agentData.agent_id;
    console.log(`Created temporary agent: ${agentId}`);

    // Get signed URL for the newly created agent
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
      
      // Clean up the created agent
      await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
        method: "DELETE",
        headers: { "xi-api-key": ELEVENLABS_API_KEY },
      });
      
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
