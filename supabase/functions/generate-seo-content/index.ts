import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_AI_URL = "https://ai-proxy.gpteng.workers.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, tone, type } = await req.json();

    if (!keyword) {
      return new Response(
        JSON.stringify({ error: "Keyword is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const toneInstructions = {
      prestigious: "Write in a prestigious, exclusive tone befitting an ultra-luxury brand. Use refined language that conveys exclusivity and sophistication.",
      warm: "Write in a warm, inviting tone that makes readers feel welcomed into an exclusive community. Balance luxury with approachability.",
      formal: "Write in a formal, professional tone suitable for discerning clients. Maintain elegance while being informative.",
      inspiring: "Write in an inspiring, aspirational tone that paints vivid pictures of extraordinary experiences."
    };

    const systemPrompt = `You are an expert SEO content writer for Aurelia, an ultra-luxury private concierge service. 
Your task is to create engaging, SEO-optimized content that:
- Naturally incorporates the target keyword throughout
- Appeals to high-net-worth individuals
- Showcases exclusive experiences and services
- Maintains the brand's prestigious image
- Is well-structured with clear headings
- Includes compelling calls to action

${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.prestigious}

The content should be original, engaging, and provide real value to readers interested in luxury concierge services.`;

    const userPrompt = type === "blog_post" 
      ? `Create a comprehensive blog post targeting the keyword "${keyword}".

Include:
1. An engaging, SEO-optimized title (max 60 characters)
2. A compelling meta description (max 160 characters)
3. Full article content (800-1200 words) with:
   - Introduction that hooks the reader
   - 3-4 main sections with H2 headings
   - Practical insights and examples
   - Conclusion with call to action

Format your response as JSON:
{
  "title": "...",
  "metaDescription": "...",
  "content": "..."
}

Use markdown formatting for headings and emphasis in the content.`
      : `Create content for: ${keyword}`;

    const response = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    // Parse JSON response
    let parsedContent;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      parsedContent = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback: use raw content
      parsedContent = {
        title: `The Ultimate Guide to ${keyword}`,
        metaDescription: `Discover how Aurelia's concierge services transform ${keyword} into extraordinary experiences. Exclusive access awaits.`,
        content: content
      };
    }

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Content generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate content" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
