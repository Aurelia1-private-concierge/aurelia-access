import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Message cannot be empty").max(10000, "Message too long"),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1, "At least one message required").max(100, "Too many messages"),
  conversationId: z.string().uuid().optional().nullable(),
  channel: z.enum(["chat", "voice", "email"]).default("chat"),
});

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("Validation error:", validation.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid request format. Please check your input." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { messages, conversationId, channel } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Extract user from JWT if provided
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    
    if (authHeader && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const token = authHeader.replace("Bearer ", "");
      
      // Skip if it's just the anon key
      if (token !== Deno.env.get("SUPABASE_ANON_KEY")) {
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      }
    }

    let activeConversationId = conversationId;
    let conversationContext = "";
    let travelDNAContext = "";
    
    // If user is authenticated, handle conversation persistence and Travel DNA
    if (userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Fetch Travel DNA profile for personalization
      const { data: travelDNA } = await supabase
        .from("travel_dna_profile")
        .select("*")
        .eq("user_id", userId)
        .eq("onboarding_completed", true)
        .single();

      if (travelDNA) {
        const archetypeLabels: Record<string, string> = {
          epicurean: "The Epicurean (fine dining, culinary focus)",
          adventurer: "The Adventurer (expeditions, thrill-seeking)",
          culturalist: "The Culturalist (art, history, museums)",
          wellness_seeker: "The Wellness Seeker (spas, retreats)",
          collector: "The Collector (art, watches, rare acquisitions)",
          social_maven: "The Social Maven (events, galas)",
        };
        
        const paceLabels: Record<string, string> = {
          relaxed: "Relaxed (unhurried, minimal scheduling)",
          moderate: "Balanced (mix of activities and leisure)",
          intensive: "Intensive (packed itineraries)",
        };
        
        const accommodationLabels: Record<string, string> = {
          ultra_luxury: "Ultra-Luxury (Aman, Four Seasons, Rosewood)",
          luxury: "Luxury (Leading Hotels, Relais & Châteaux)",
          boutique: "Boutique (unique, design-forward)",
          private: "Private (villas, estates, yachts)",
        };

        travelDNAContext = `\n\nCLIENT TRAVEL DNA PROFILE:
- Traveler Archetype: ${archetypeLabels[travelDNA.traveler_archetype] || travelDNA.traveler_archetype || "Not specified"}
- Travel Pace: ${paceLabels[travelDNA.pace_preference] || travelDNA.pace_preference || "Not specified"}
- Accommodation Preference: ${accommodationLabels[travelDNA.accommodation_tier] || travelDNA.accommodation_tier || "Not specified"}
- Culinary Affinities: ${travelDNA.cuisine_affinities?.join(", ") || "Not specified"}
- Preferred Activities: ${travelDNA.activity_preferences ? Object.entries(travelDNA.activity_preferences).filter(([_, v]) => v).map(([k]) => k.replace(/_/g, " ")).join(", ") : "Not specified"}
- Special Requirements: ${travelDNA.special_requirements?.join(", ") || "None noted"}

Use this profile to personalize all recommendations. Proactively suggest experiences that match their archetype and preferences without them needing to ask.`;
      }

      // If no conversationId, check for recent conversation or create new
      if (!activeConversationId) {
        // Look for recent conversation (within last 24 hours)
        const { data: recentConv } = await supabase
          .from("conversations")
          .select("id, summary, message_count, started_at")
          .eq("user_id", userId)
          .eq("channel", channel)
          .is("ended_at", null)
          .gte("last_message_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order("last_message_at", { ascending: false })
          .limit(1)
          .single();

        if (recentConv) {
          activeConversationId = recentConv.id;
          if (recentConv.summary) {
            conversationContext = `\n\nPREVIOUS CONVERSATION CONTEXT:\n${recentConv.summary}`;
          }
        } else {
          // Create new conversation
          const { data: newConv, error: createError } = await supabase
            .from("conversations")
            .insert({
              user_id: userId,
              channel,
              title: null, // Will be set after first exchange
            })
            .select("id")
            .single();

          if (createError) {
            console.error("Failed to create conversation:", createError);
          } else {
            activeConversationId = newConv.id;
          }
        }
      }

      // Fetch recent messages for context if resuming
      if (activeConversationId) {
        const { data: recentMessages } = await supabase
          .from("conversation_messages")
          .select("role, content")
          .eq("conversation_id", activeConversationId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (recentMessages && recentMessages.length > 0) {
          // Reverse to get chronological order
          const contextMessages = recentMessages.reverse();
          conversationContext += "\n\nRECENT CONVERSATION HISTORY:\n" + 
            contextMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
        }
      }

      // Store the user's message
      const lastUserMessage = messages[messages.length - 1];
      if (activeConversationId && lastUserMessage?.role === "user") {
        await supabase.from("conversation_messages").insert({
          conversation_id: activeConversationId,
          role: "user",
          content: lastUserMessage.content,
        });

        // Update conversation last_message_at
        await supabase
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", activeConversationId);
      }
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
- Remember details from our conversation and reference them naturally
- Sign off gracefully when appropriate${travelDNAContext}${conversationContext}`;

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

    // For authenticated users, we need to capture the full response to store it
    if (userId && activeConversationId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Create a TransformStream to capture and forward the response
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      
      let fullResponse = "";

      // Process stream in background
      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Forward the chunk
            await writer.write(value);
            
            // Parse to capture content
            const text = decoder.decode(value, { stream: true });
            const lines = text.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ") && line !== "data: [DONE]") {
                try {
                  const json = JSON.parse(line.slice(6));
                  const content = json.choices?.[0]?.delta?.content;
                  if (content) fullResponse += content;
                } catch { /* ignore parse errors */ }
              }
            }
          }
          
          // Store assistant response
          if (fullResponse) {
            await supabase.from("conversation_messages").insert({
              conversation_id: activeConversationId,
              role: "assistant",
              content: fullResponse,
            });

            // Generate title from first exchange if not set
            const { data: conv } = await supabase
              .from("conversations")
              .select("title, message_count")
              .eq("id", activeConversationId)
              .single();

            if (conv && !conv.title) {
              // Use AI to generate a brief title
              const titleResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${LOVABLE_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash-lite",
                  messages: [
                    { role: "system", content: "Generate a 3-5 word title for this conversation. Return ONLY the title, nothing else." },
                    { role: "user", content: `User asked: "${messages[messages.length - 1]?.content}"\nAssistant replied: "${fullResponse.slice(0, 200)}"` }
                  ],
                }),
              });

              if (titleResponse.ok) {
                const titleData = await titleResponse.json();
                const title = titleData.choices?.[0]?.message?.content?.trim();
                if (title) {
                  await supabase
                    .from("conversations")
                    .update({ title })
                    .eq("id", activeConversationId);
                }
              }
            }
          }
        } catch (e) {
          console.error("Stream processing error:", e);
        } finally {
          await writer.close();
        }
      })();

      // Return the readable stream with conversation metadata
      return new Response(readable, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "text/event-stream",
          "X-Conversation-Id": activeConversationId || "",
        },
      });
    }

    // For unauthenticated users, just forward the stream
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    // Log detailed error server-side
    console.error("[Chat] Internal error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    // Return sanitized error to client
    return new Response(JSON.stringify({ 
      error: "An error occurred processing your request. Please try again.",
      code: "CHAT_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
