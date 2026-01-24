import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Orla's persona for SMS/WhatsApp responses
const ORLA_SYSTEM_PROMPT = `You are Orla, Aurelia's private AI concierge. You communicate via SMS/WhatsApp.

IMPORTANT GUIDELINES:
- Be warm, sophisticated, and discreet
- Keep responses concise (SMS has character limits - aim for under 320 chars for SMS, can be longer for WhatsApp)
- Never use casual language like "hey" or "cool"
- Address members with respect
- Always maintain confidentiality
- If someone needs urgent assistance, recommend they call the concierge line directly
- For complex requests, offer to have the team follow up

Services you can help with:
- Private aviation and yacht charter inquiries
- Luxury travel and accommodation
- Fine dining reservations
- Event access and tickets
- Personal shopping assistance
- General lifestyle management questions

If the request is beyond your scope, politely acknowledge and offer to connect them with a specialist.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse form-encoded body from Twilio
    const formData = await req.formData();
    const body = formData.get("Body")?.toString() || "";
    const from = formData.get("From")?.toString() || "";
    const to = formData.get("To")?.toString() || "";
    const messageSid = formData.get("MessageSid")?.toString() || "";
    const accountSid = formData.get("AccountSid")?.toString() || "";
    
    // Determine if WhatsApp or SMS
    const isWhatsApp = from.startsWith("whatsapp:");
    const cleanFrom = from.replace("whatsapp:", "");
    const channel = isWhatsApp ? "whatsapp" : "sms";
    
    console.log(`Incoming ${channel} from ${cleanFrom}: ${body}`);
    
    // Verify Twilio account SID
    const expectedAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    if (accountSid !== expectedAccountSid) {
      console.error("Invalid Twilio Account SID");
      return new Response("Unauthorized", { status: 401 });
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store incoming message
    const { data: incomingMsg, error: insertError } = await supabase
      .from("sms_conversations")
      .insert({
        phone_number: cleanFrom,
        channel: channel,
        direction: "inbound",
        message: body,
        twilio_message_sid: messageSid,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing message:", insertError);
    }

    // Get conversation history for context
    const { data: history } = await supabase
      .from("sms_conversations")
      .select("direction, message, created_at")
      .eq("phone_number", cleanFrom)
      .order("created_at", { ascending: false })
      .limit(10);

    // Build message history for AI
    const messages = [
      { role: "system", content: ORLA_SYSTEM_PROMPT },
    ];

    // Add conversation history (reversed to chronological order)
    if (history && history.length > 1) {
      const conversationHistory = history.slice(1).reverse();
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.direction === "inbound" ? "user" : "assistant",
          content: msg.message,
        });
      }
    }

    // Add current message
    messages.push({ role: "user", content: body });

    // Get AI response
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return generateTwiMLResponse("I apologize, but I'm currently unavailable. Please try again later or call our concierge line.");
    }

    const aiResponse = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: isWhatsApp ? 1000 : 320, // WhatsApp allows longer messages
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errorText);
      return generateTwiMLResponse("I apologize for the inconvenience. Our team will follow up with you shortly.");
    }

    const aiData = await aiResponse.json();
    const responseMessage = aiData.choices?.[0]?.message?.content || 
      "Thank you for your message. Our concierge team will be in touch shortly.";

    // Store outgoing response
    await supabase
      .from("sms_conversations")
      .insert({
        phone_number: cleanFrom,
        channel: channel,
        direction: "outbound",
        message: responseMessage,
        in_reply_to: incomingMsg?.id,
      });

    console.log(`Responding to ${cleanFrom}: ${responseMessage}`);

    // Return TwiML response
    return generateTwiMLResponse(responseMessage);

  } catch (error) {
    console.error("Webhook error:", error);
    return generateTwiMLResponse("We're experiencing technical difficulties. Please try again later.");
  }
});

function generateTwiMLResponse(message: string): Response {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;

  return new Response(twiml, {
    headers: {
      "Content-Type": "text/xml",
      ...corsHeaders,
    },
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
