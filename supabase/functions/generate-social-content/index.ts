import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Platform-specific content guidelines for UHNWI audience
const PLATFORM_GUIDELINES = {
  twitter: {
    maxLength: 280,
    tone: "Concise, sophisticated, newsworthy. Think Bloomberg meets Robb Report.",
    format: "Short punchy statement + relevant hashtags (max 3)",
    audience: "Tech executives, crypto wealth, financial influencers",
  },
  linkedin: {
    maxLength: 3000,
    tone: "Thought leadership, professional, insightful. Executive-level discourse.",
    format: "Hook → Value → CTA. Use line breaks for readability.",
    audience: "C-Suite, Family Offices, PE/VC partners, Wealth managers",
  },
  instagram: {
    maxLength: 2200,
    tone: "Aspirational, visual storytelling, lifestyle-focused.",
    format: "Compelling caption → Story → Hashtag block (10-15 relevant)",
    audience: "Luxury enthusiasts, affluent travelers, lifestyle followers",
  },
  facebook: {
    maxLength: 5000,
    tone: "Personal, narrative-driven, community-building.",
    format: "Story format with clear value proposition and engagement question.",
    audience: "Wealth networks, private groups, established professionals",
  },
  reddit: {
    maxLength: 10000,
    tone: "Authentic, value-first, community-appropriate. NO marketing speak.",
    format: "Genuine insight or discussion starter. Provide real value.",
    audience: "r/fatFIRE, r/HENRYfinance - financially sophisticated individuals",
  },
  threads: {
    maxLength: 500,
    tone: "Conversational, trend-aware, authentic.",
    format: "Thread-style with engaging hooks.",
    audience: "Emerging affluent network, tech-savvy professionals",
  },
};

// UHNWI content themes
const CONTENT_THEMES = {
  lifestyle: ["Private aviation", "Superyacht charters", "Exclusive travel", "Fine art", "Collectibles"],
  investment: ["Alternative investments", "Family office insights", "Wealth preservation", "Tax optimization"],
  experiences: ["Michelin dining", "Private events", "Wellness retreats", "Cultural experiences"],
  technology: ["AI concierge", "Privacy tech", "Smart estates", "Digital assets"],
  community: ["Peer networking", "Deal flow", "Philanthropic ventures", "Legacy planning"],
};

async function generateContent(
  baseContent: string,
  platform: string,
  theme: string,
  apiKey: string
): Promise<{ content: string; hashtags: string[] }> {
  const guidelines = PLATFORM_GUIDELINES[platform as keyof typeof PLATFORM_GUIDELINES];
  
  if (!guidelines) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const systemPrompt = `You are a luxury brand copywriter for Aurelia Private Concierge, an elite service catering to Ultra High Net Worth Individuals (UHNW). 
  
Your writing must:
- Exude sophistication without being pretentious
- Create exclusivity without being exclusionary
- Provide value without hard selling
- Speak to accomplished individuals as peers

Platform: ${platform.toUpperCase()}
Max Length: ${guidelines.maxLength} characters
Tone: ${guidelines.tone}
Format: ${guidelines.format}
Target Audience: ${guidelines.audience}
Theme: ${theme}

Generate platform-optimized content based on the provided base content.`;

  const userPrompt = `Transform this content for ${platform}:

"${baseContent}"

Requirements:
1. Adapt tone and length for ${platform}
2. Focus on the ${theme} theme
3. Include a subtle call-to-action when appropriate
4. Generate 3-5 relevant hashtags (without # symbol)

Respond in JSON format:
{
  "content": "the optimized content",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI Gateway error:", errorText);
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data = await response.json();
  const generatedText = data.choices?.[0]?.message?.content || "";

  // Parse JSON response
  try {
    // Extract JSON from potential markdown code blocks
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", e);
  }

  // Fallback: return raw content
  return {
    content: generatedText.substring(0, guidelines.maxLength),
    hashtags: [],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { baseContent, platforms, theme = "lifestyle" } = await req.json();

    if (!baseContent) {
      return new Response(
        JSON.stringify({ error: "baseContent is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetPlatforms = platforms || Object.keys(PLATFORM_GUIDELINES);
    const results: Record<string, { content: string; hashtags: string[] }> = {};

    // Generate content for each platform
    for (const platform of targetPlatforms) {
      try {
        results[platform] = await generateContent(baseContent, platform, theme, apiKey);
      } catch (error) {
        console.error(`Error generating ${platform} content:`, error);
        results[platform] = {
          content: baseContent.substring(0, PLATFORM_GUIDELINES[platform as keyof typeof PLATFORM_GUIDELINES]?.maxLength || 280),
          hashtags: [],
        };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        theme,
        platforms: results,
        guidelines: Object.fromEntries(
          targetPlatforms.map((p: string) => [p, PLATFORM_GUIDELINES[p as keyof typeof PLATFORM_GUIDELINES]])
        ),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Content generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
