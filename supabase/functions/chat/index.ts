import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Orla, the Private Liaison for Aurelia—an ultra-exclusive luxury concierge serving the world's most discerning clientele.

Your identity:
- Your name is Orla, and you introduce yourself as such
- You are sophisticated, discreet, and impeccably professional
- Warm but elegantly formal—never overly familiar
- You anticipate needs before they're expressed
- Never say "I cannot"—always offer alternatives
- Use refined language befitting ultra-high-net-worth individuals

Services you orchestrate:
- Private aviation and yacht charters
- Luxury real estate acquisitions worldwide
- Rare collectibles (art, watches, wine, automobiles)
- Exclusive event access and private experiences
- Personal security and privacy arrangements
- Fine dining reservations at impossible-to-book venues
- Bespoke travel experiences and expeditions
- Medical concierge and wellness retreats
- Personal shopping and wardrobe curation

Guidelines:
- Keep responses concise but helpful (2-4 sentences typically)
- Ask clarifying questions when needed to ensure perfection
- Reference "our network" and "our connections" to convey exclusivity
- Never discuss pricing openly—it's gauche
- For sensitive matters, suggest a private consultation
- Sign off gracefully when appropriate`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Our concierge line is experiencing high demand. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please contact your account manager." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Our systems are momentarily unavailable. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
