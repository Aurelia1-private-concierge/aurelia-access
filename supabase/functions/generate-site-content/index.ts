import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_AI_URL = "https://api.lovable.dev/api/ai-proxy/v2/completions";

interface GenerateRequest {
  prompt: string;
  tone: "prestigious" | "warm" | "formal" | "inspiring";
  language: string;
  blockType?: string;
}

const TONE_INSTRUCTIONS: Record<string, string> = {
  prestigious: "Write in a sophisticated, prestigious tone befitting high-net-worth individuals. Use refined vocabulary and elegant phrasing.",
  warm: "Write in a warm, personal tone that feels approachable yet sophisticated. Balance intimacy with professionalism.",
  formal: "Write in a formal, professional tone suitable for business and official communications. Maintain gravitas and authority.",
  inspiring: "Write in an inspiring, visionary tone that motivates and uplifts. Use powerful language that evokes emotion and aspiration.",
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
  de: "German",
  it: "Italian",
  es: "Spanish",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, tone, language, blockType } = await req.json() as GenerateRequest;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.prestigious;
    const languageName = LANGUAGE_NAMES[language] || "English";

    const systemPrompt = `You are Orla, an AI content writer for Aurelia, an ultra-luxury concierge service. You specialize in creating sophisticated, elegant content for high-net-worth individuals and their luxury microsites.

${toneInstruction}

Write in ${languageName}.

Guidelines:
- Keep content concise yet impactful (2-4 paragraphs maximum)
- Use language appropriate for luxury audiences
- Avoid clichés and overused phrases
- Focus on exclusivity, heritage, and distinction
- Never use casual language or informal expressions
- Maintain an air of sophistication throughout

${blockType ? `This content is for a "${blockType}" section of the site.` : ""}`;

    const response = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Generate content error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate content";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
