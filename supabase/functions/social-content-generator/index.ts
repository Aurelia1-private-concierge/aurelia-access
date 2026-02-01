import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  action: "generate" | "regenerate" | "customize" | "batch_generate";
  platform: "instagram" | "twitter" | "linkedin" | "facebook" | "tiktok";
  content_type?: "post" | "story" | "reel" | "carousel" | "thread";
  topic: string;
  tone?: "luxury" | "exclusive" | "sophisticated" | "warm" | "professional";
  target_audience?: string[];
  include_hashtags?: boolean;
  include_cta?: boolean;
  cta_type?: "book" | "inquire" | "discover" | "join" | "explore";
  template_id?: string;
  variables?: Record<string, string>;
  content_id?: string; // For regenerate action
  campaign_id?: string;
  batch_count?: number; // For batch_generate
}

interface PlatformSpecs {
  max_length: number;
  hashtag_limit: number;
  mention_style: string;
  format_hints: string;
}

const PLATFORM_SPECS: Record<string, PlatformSpecs> = {
  instagram: {
    max_length: 2200,
    hashtag_limit: 30,
    mention_style: "@username",
    format_hints: "Visual-first, lifestyle focused, emojis encouraged",
  },
  twitter: {
    max_length: 280,
    hashtag_limit: 3,
    mention_style: "@handle",
    format_hints: "Concise, punchy, conversation-starting",
  },
  linkedin: {
    max_length: 3000,
    hashtag_limit: 5,
    mention_style: "@Company or @Person",
    format_hints: "Professional, thought leadership, industry insights",
  },
  facebook: {
    max_length: 63206,
    hashtag_limit: 10,
    mention_style: "@Page or @Person",
    format_hints: "Community-focused, engaging questions, shareable",
  },
  tiktok: {
    max_length: 2200,
    hashtag_limit: 8,
    mention_style: "@username",
    format_hints: "Trendy, authentic, hook in first 3 seconds for video",
  },
};

const LUXURY_HASHTAGS: Record<string, string[]> = {
  travel: ["#LuxuryTravel", "#PrivateJet", "#UltraLuxury", "#EliteTravel", "#BespokeExperiences"],
  lifestyle: ["#LuxuryLifestyle", "#UHNW", "#PrivateWealth", "#EliteCircle", "#Prestige"],
  experiences: ["#ExclusiveAccess", "#VIPExperience", "#OnceInALifetime", "#Bespoke", "#Curated"],
  hospitality: ["#LuxuryHotel", "#PrivateVilla", "#FiveStarLiving", "#EliteHospitality"],
  yachting: ["#Superyacht", "#YachtLife", "#PrivateCharter", "#LuxuryYachting"],
  aviation: ["#PrivateAviation", "#JetSet", "#LuxuryFlight", "#PrivateJetLife"],
};

const CTA_TEMPLATES: Record<string, string[]> = {
  book: ["Reserve your experience →", "Secure your moment →", "Book exclusively at link in bio"],
  inquire: ["Inquire privately via DM", "Reach out to our concierge team", "Contact us for bespoke arrangements"],
  discover: ["Discover more at aurelia-privateconcierge.com", "Explore the collection →", "See what awaits →"],
  join: ["Join the Circle →", "Apply for membership →", "Become an Aurelia member"],
  explore: ["Explore our world →", "Step into luxury →", "Begin your journey →"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: GenerateRequest = await req.json();

    console.log("[social-content-generator] Action:", body.action);

    const { action, platform, topic } = body;
    const contentType = body.content_type || "post";
    const tone = body.tone || "luxury";
    const targetAudience = body.target_audience || ["uhnw", "luxury_lifestyle"];
    const includeHashtags = body.include_hashtags !== false;
    const includeCta = body.include_cta !== false;
    const ctaType = body.cta_type || "discover";

    const specs = PLATFORM_SPECS[platform];
    if (!specs) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    switch (action) {
      case "generate": {
        // Build prompt for content generation
        const prompt = buildContentPrompt({
          platform,
          contentType,
          topic,
          tone,
          targetAudience,
          specs,
          includeHashtags,
          includeCta,
          ctaType,
          variables: body.variables,
        });

        // Call Lovable AI for generation
        const generatedContent = await generateWithAI(prompt, lovableApiKey, supabaseUrl, supabaseServiceKey);

        // Parse and enhance content
        const enhancedContent = enhanceContent(generatedContent, platform, includeHashtags, includeCta, ctaType);

        // Save to database
        const { data: savedContent, error: saveError } = await supabase
          .from("social_content")
          .insert({
            template_id: body.template_id,
            platform,
            content_type: contentType,
            generated_text: enhancedContent.text,
            hashtags: enhancedContent.hashtags,
            mentions: enhancedContent.mentions,
            call_to_action: enhancedContent.cta,
            ai_model: "lovable-ai/gemini-2.5-flash",
            generation_params: {
              topic,
              tone,
              target_audience: targetAudience,
              specs,
            },
            approval_status: "pending",
          })
          .select()
          .single();

        if (saveError) throw saveError;

        // Link to campaign if specified
        if (body.campaign_id && savedContent) {
          await supabase.from("campaign_content").insert({
            campaign_id: body.campaign_id,
            content_id: savedContent.id,
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            content: savedContent,
            suggestions: {
              best_posting_times: getBestPostingTimes(platform),
              related_hashtags: getRelatedHashtags(topic),
              engagement_tips: getEngagementTips(platform, contentType),
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "regenerate": {
        if (!body.content_id) {
          throw new Error("content_id required for regenerate action");
        }

        // Fetch existing content
        const { data: existingContent, error: fetchError } = await supabase
          .from("social_content")
          .select("*")
          .eq("id", body.content_id)
          .single();

        if (fetchError || !existingContent) {
          throw new Error("Content not found");
        }

        const params = existingContent.generation_params as Record<string, any>;
        const prompt = buildContentPrompt({
          platform: existingContent.platform,
          contentType: existingContent.content_type,
          topic: params.topic || topic,
          tone: params.tone || tone,
          targetAudience: params.target_audience || targetAudience,
          specs: PLATFORM_SPECS[existingContent.platform],
          includeHashtags,
          includeCta,
          ctaType,
          regenerate: true,
        });

        const generatedContent = await generateWithAI(prompt, lovableApiKey, supabaseUrl, supabaseServiceKey);
        const enhancedContent = enhanceContent(generatedContent, existingContent.platform, includeHashtags, includeCta, ctaType);

        // Update existing content
        const { data: updatedContent, error: updateError } = await supabase
          .from("social_content")
          .update({
            generated_text: enhancedContent.text,
            hashtags: enhancedContent.hashtags,
            call_to_action: enhancedContent.cta,
            approval_status: "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.content_id)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ success: true, content: updatedContent }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "batch_generate": {
        const batchCount = Math.min(body.batch_count || 5, 10);
        const contents = [];

        for (let i = 0; i < batchCount; i++) {
          const prompt = buildContentPrompt({
            platform,
            contentType,
            topic,
            tone,
            targetAudience,
            specs,
            includeHashtags,
            includeCta,
            ctaType,
            variationIndex: i + 1,
          });

          const generatedContent = await generateWithAI(prompt, lovableApiKey, supabaseUrl, supabaseServiceKey);
          const enhancedContent = enhanceContent(generatedContent, platform, includeHashtags, includeCta, ctaType);

          const { data: savedContent } = await supabase
            .from("social_content")
            .insert({
              platform,
              content_type: contentType,
              generated_text: enhancedContent.text,
              hashtags: enhancedContent.hashtags,
              call_to_action: enhancedContent.cta,
              ai_model: "lovable-ai/gemini-2.5-flash",
              generation_params: {
                topic,
                tone,
                target_audience: targetAudience,
                batch_index: i + 1,
              },
              approval_status: "pending",
            })
            .select()
            .single();

          if (savedContent) contents.push(savedContent);
        }

        return new Response(
          JSON.stringify({
            success: true,
            batch_count: contents.length,
            contents,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "customize": {
        if (!body.template_id) {
          throw new Error("template_id required for customize action");
        }

        const { data: template, error: templateError } = await supabase
          .from("social_content_templates")
          .select("*")
          .eq("id", body.template_id)
          .single();

        if (templateError || !template) {
          throw new Error("Template not found");
        }

        // Replace variables in template
        let customizedText = template.template_text;
        const variables = body.variables || {};

        for (const [key, value] of Object.entries(variables)) {
          customizedText = customizedText.replace(new RegExp(`{{${key}}}`, "g"), value);
        }

        const { data: savedContent, error: saveError } = await supabase
          .from("social_content")
          .insert({
            template_id: body.template_id,
            platform: template.platform,
            content_type: template.content_type,
            generated_text: customizedText,
            hashtags: template.hashtag_strategy,
            ai_model: "template-based",
            generation_params: { variables },
            approval_status: "pending",
          })
          .select()
          .single();

        if (saveError) throw saveError;

        return new Response(
          JSON.stringify({ success: true, content: savedContent }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error("[social-content-generator] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface PromptParams {
  platform: string;
  contentType: string;
  topic: string;
  tone: string;
  targetAudience: string[];
  specs: PlatformSpecs;
  includeHashtags: boolean;
  includeCta: boolean;
  ctaType: string;
  variables?: Record<string, string>;
  regenerate?: boolean;
  variationIndex?: number;
}

function buildContentPrompt(params: PromptParams): string {
  const { platform, contentType, topic, tone, targetAudience, specs, variationIndex, regenerate } = params;

  let prompt = `You are an expert social media content creator for Aurelia Private Concierge, an ultra-luxury concierge service for UHNW (Ultra-High-Net-Worth) individuals.

Create a ${contentType} for ${platform} about: ${topic}

BRAND VOICE:
- Tone: ${tone}
- Target audience: ${targetAudience.join(", ")}
- We speak to discerning individuals who value exclusivity, privacy, and unparalleled experiences
- Never use salesy language or common marketing clichés
- Evoke aspiration through subtlety, not boasting

PLATFORM REQUIREMENTS:
- Maximum length: ${specs.max_length} characters
- Format: ${specs.format_hints}
- Hashtag limit: ${specs.hashtag_limit}

CONTENT GUIDELINES:
1. Open with a captivating hook that stops the scroll
2. Use sensory language that evokes luxury experiences
3. Create FOMO through exclusivity, not urgency
4. End with a soft call-to-action that feels like an invitation, not a demand

${regenerate ? "This is a regeneration - create a completely different approach while maintaining brand voice." : ""}
${variationIndex ? `This is variation ${variationIndex} - make it distinct from other variations.` : ""}

OUTPUT FORMAT:
Return only the post content, nothing else. Do not include hashtags in the main text - they will be added separately.`;

  return prompt;
}

async function generateWithAI(
  prompt: string,
  lovableApiKey: string | undefined,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<string> {
  try {
    // Use Lovable AI edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/lovable-ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[social-content-generator] AI API error:", errorText);
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content || result.content || "Content generation failed";
  } catch (error) {
    console.error("[social-content-generator] AI error:", error);
    // Return a fallback template
    return "Experience the extraordinary. Where your most discerning wishes become reality. ✨";
  }
}

interface EnhancedContent {
  text: string;
  hashtags: string[];
  mentions: string[];
  cta: string;
}

function enhanceContent(
  rawContent: string,
  platform: string,
  includeHashtags: boolean,
  includeCta: boolean,
  ctaType: string
): EnhancedContent {
  let text = rawContent.trim();
  const hashtags: string[] = [];
  const mentions: string[] = [];
  let cta = "";

  // Extract any existing hashtags from content
  const hashtagMatches = text.match(/#\w+/g);
  if (hashtagMatches) {
    hashtags.push(...hashtagMatches);
    text = text.replace(/#\w+/g, "").trim();
  }

  // Add luxury hashtags if needed
  if (includeHashtags) {
    const specs = PLATFORM_SPECS[platform];
    const baseHashtags = ["#Aurelia", "#PrivateConcierge", "#UltraLuxury"];
    const categoryHashtags = LUXURY_HASHTAGS.lifestyle.slice(0, 2);

    const allHashtags = [...new Set([...hashtags, ...baseHashtags, ...categoryHashtags])];
    hashtags.length = 0;
    hashtags.push(...allHashtags.slice(0, specs.hashtag_limit));
  }

  // Add CTA
  if (includeCta) {
    const ctaOptions = CTA_TEMPLATES[ctaType] || CTA_TEMPLATES.discover;
    cta = ctaOptions[Math.floor(Math.random() * ctaOptions.length)];
  }

  return { text, hashtags, mentions, cta };
}

function getBestPostingTimes(platform: string): string[] {
  const times: Record<string, string[]> = {
    instagram: ["9:00 AM", "12:00 PM", "7:00 PM"],
    twitter: ["8:00 AM", "12:00 PM", "5:00 PM"],
    linkedin: ["7:30 AM", "12:00 PM", "5:30 PM"],
    facebook: ["1:00 PM", "4:00 PM", "8:00 PM"],
    tiktok: ["7:00 PM", "8:00 PM", "9:00 PM"],
  };
  return times[platform] || ["12:00 PM"];
}

function getRelatedHashtags(topic: string): string[] {
  const topicLower = topic.toLowerCase();
  for (const [category, tags] of Object.entries(LUXURY_HASHTAGS)) {
    if (topicLower.includes(category)) {
      return tags;
    }
  }
  return LUXURY_HASHTAGS.lifestyle;
}

function getEngagementTips(platform: string, contentType: string): string[] {
  const tips: string[] = [];

  if (platform === "instagram") {
    tips.push("Respond to comments within the first hour for algorithm boost");
    tips.push("Use Instagram Stories to tease the post");
  } else if (platform === "linkedin") {
    tips.push("Engage with comments using thoughtful responses");
    tips.push("Share to relevant groups for broader reach");
  } else if (platform === "twitter") {
    tips.push("Quote retweet with additional context");
    tips.push("Pin if it's a key announcement");
  }

  if (contentType === "carousel") {
    tips.push("Ensure first slide is the strongest hook");
  }

  return tips;
}