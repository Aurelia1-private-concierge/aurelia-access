import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_MAX = 20; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window

// Input validation schema
const requestSchema = z.object({
  type: z.enum(['travel', 'wellness', 'lifestyle', 'investment', 'general']).default('general'),
  context: z.string().max(2000, "Context too long").optional(),
  preferences: z.record(z.any()).optional(),
});

// Generate fingerprint for rate limiting
function generateFingerprint(req: Request, userId: string | null): string {
  if (userId) return `insights_${userId}`;
  
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
             req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  
  let hash = 0;
  const combined = `${ip}:${userAgent.slice(0, 50)}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `insights_anon_${Math.abs(hash).toString(36)}`;
}

// Check rate limit
async function checkRateLimit(
  supabase: any,
  identifier: string
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  
  const { data, error } = await supabase
    .from("rate_limits")
    .select("id")
    .eq("identifier", identifier)
    .eq("action_type", "ai_insights")
    .gte("created_at", windowStart);

  if (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true, remaining: RATE_LIMIT_MAX };
  }

  const currentCount = data?.length || 0;
  const allowed = currentCount < RATE_LIMIT_MAX;
  const remaining = Math.max(0, RATE_LIMIT_MAX - currentCount - 1);

  if (allowed) {
    await supabase.from("rate_limits").insert({
      identifier,
      action_type: "ai_insights",
    });
  }

  return { allowed, remaining };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request
    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("Validation error:", validation.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { type, context, preferences } = validation.data;
    
    console.log(`Generating AI insights for type: ${type}`);
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Extract user ID if authenticated
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    
    if (authHeader && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const token = authHeader.replace("Bearer ", "");
      
      if (token !== Deno.env.get("SUPABASE_ANON_KEY")) {
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      }
    }
    
    // Apply rate limiting
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const fingerprint = generateFingerprint(req, userId);
      const { allowed, remaining } = await checkRateLimit(supabase, fingerprint);
      
      console.log(`[AI Insights] Request: fingerprint=${fingerprint}, allowed=${allowed}, remaining=${remaining}`);
      
      if (!allowed) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again later.",
            code: "RATE_LIMITED"
          }),
          { 
            status: 429, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
              'X-RateLimit-Remaining': '0',
              'Retry-After': '3600'
            } 
          }
        );
      }
    }
    
    const LOVABLE_API_URL = 'https://ai.gateway.lovable.dev';
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.log('LOVABLE_API_KEY not configured, using curated insights');
      const curatedInsights = getCuratedInsights(type, preferences);
      return new Response(JSON.stringify(curatedInsights), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    let systemPrompt = '';
    let userPrompt = '';
    
    // Sanitize context for prompt injection prevention
    const sanitizedContext = context?.replace(/[<>]/g, '').slice(0, 1000) || '';
    const sanitizedPrefs = JSON.stringify(preferences || {}).slice(0, 500);
    
    switch (type) {
      case 'travel':
        systemPrompt = `You are an elite luxury travel concierge AI for Aurelia, a premium lifestyle platform. Provide sophisticated, personalized travel recommendations based on the client's preferences. Be concise but insightful. Focus on exclusive experiences, hidden gems, and luxury accommodations. Always suggest 3-5 specific recommendations.`;
        userPrompt = `Based on these travel preferences: ${sanitizedPrefs}\n\nContext: ${sanitizedContext || 'Looking for travel inspiration'}\n\nProvide personalized luxury travel recommendations.`;
        break;
        
      case 'wellness':
        systemPrompt = `You are a wellness advisor for Aurelia's ultra-high-net-worth clients. Provide holistic wellness insights combining physical health, mental wellbeing, and lifestyle optimization. Be sophisticated and evidence-based. Consider sleep, nutrition, exercise, stress management, and biohacking.`;
        userPrompt = `Wellness data context: ${sanitizedContext}\n\nPreferences: ${sanitizedPrefs}\n\nProvide personalized wellness insights and recommendations.`;
        break;
        
      case 'lifestyle':
        systemPrompt = `You are a lifestyle curator for Aurelia, serving discerning clients who expect the exceptional. Provide recommendations for dining, events, experiences, and cultural activities. Be knowledgeable about exclusive venues, private events, and bespoke experiences.`;
        userPrompt = `Client context: ${sanitizedContext}\n\nPreferences: ${sanitizedPrefs}\n\nSuggest personalized lifestyle experiences.`;
        break;
        
      case 'investment':
        systemPrompt = `You are a luxury asset advisor for Aurelia's sophisticated clientele. Provide insights on collectibles, art, wine, watches, and alternative investments. Be knowledgeable about market trends, provenance, and appreciation potential. This is for informational purposes only.`;
        userPrompt = `Interest areas: ${sanitizedContext}\n\nProvide insights on luxury asset opportunities and trends.`;
        break;
        
      default:
        systemPrompt = `You are Orla, the AI concierge for Aurelia luxury lifestyle platform. Be sophisticated, helpful, and personalized in your responses.`;
        userPrompt = sanitizedContext || 'How can you assist me today?';
    }
    
    // Call Lovable AI
    const response = await fetch(`${LOVABLE_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      console.log('AI service unavailable, using curated insights');
      const curatedInsights = getCuratedInsights(type, preferences);
      return new Response(JSON.stringify(curatedInsights), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const aiData = await response.json();
    const insight = aiData.choices?.[0]?.message?.content || 'Unable to generate insight';
    
    console.log('AI insight generated successfully');
    
    return new Response(JSON.stringify({
      type,
      insight,
      generated_at: new Date().toISOString(),
      model: 'gemini-2.5-flash',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI insights error:', error);
    
    // Return curated fallback
    let type = 'general';
    let preferences = {};
    try {
      const body = await req.json();
      type = body.type || 'general';
      preferences = body.preferences || {};
    } catch { /* ignore */ }
    
    const curatedInsights = getCuratedInsights(type, preferences);
    
    return new Response(JSON.stringify(curatedInsights), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getCuratedInsights(type: string, preferences: any) {
  const insights: Record<string, any> = {
    travel: {
      type: 'travel',
      insight: `Based on current trends, we recommend considering:\n\n**1. Aman Tokyo** - A serene urban sanctuary blending traditional Japanese aesthetics with contemporary luxury.\n\n**2. Singita Grumeti, Tanzania** - Unparalleled wildlife experiences in the Serengeti with world-class accommodations.\n\n**3. Nihi Sumba, Indonesia** - Remote island paradise voted #1 hotel in the world, offering authentic cultural immersion.\n\n**4. Explora Patagonia, Chile** - Adventure and wellness in one of Earth's last frontiers.\n\n**5. Cheval Blanc Paris** - LVMH's flagship property offering the pinnacle of Parisian luxury.`,
      curated: true,
    },
    wellness: {
      type: 'wellness',
      insight: `Your wellness optimization recommendations:\n\n**Sleep Quality**: Consider circadian rhythm optimization with morning light exposure and evening blue light reduction.\n\n**Recovery**: HRV-guided training prevents overexertion. Aim for 48-72 hour recovery between intense sessions.\n\n**Nutrition**: Time-restricted eating (12-16 hour window) supports metabolic health and longevity.\n\n**Stress Management**: Regular sauna sessions (4-7x/week) associated with 40% reduced cardiovascular mortality.\n\n**Biohacking**: Consider red light therapy and cold exposure for enhanced recovery and mental clarity.`,
      curated: true,
    },
    lifestyle: {
      type: 'lifestyle',
      insight: `Exclusive experiences for the discerning:\n\n**Art Basel Miami** - December's premier art fair with exclusive preview access available through our partners.\n\n**Noma Pop-up Tokyo** - René Redzepi's temporary residence, reservations can be secured through Aurelia.\n\n**Monaco Grand Prix** - Yacht viewing packages and paddock access for the ultimate F1 experience.\n\n**Salzburg Festival** - Private opera boxes and behind-the-scenes artistic encounters.\n\n**White Truffle Season, Alba** - Private truffle hunting with master hunters, followed by tasting dinners.`,
      curated: true,
    },
    investment: {
      type: 'investment',
      insight: `Luxury asset market insights:\n\n**Watch Market**: Patek Philippe Nautilus and Audemars Piguet Royal Oak continue strong appreciation. Emerging interest in independent watchmakers.\n\n**Fine Art**: Post-war and contemporary remain strong. Digital art/NFTs stabilizing with institutional interest.\n\n**Wine**: Burgundy grands crus showing 12% annual appreciation. Champagne emerging as investment category.\n\n**Classic Cars**: Ferrari 250 GT series and Porsche 911 2.7 RS remain blue-chip. Electric conversion market emerging.\n\n**Real Estate**: Trophy properties in Monaco, London, and NYC showing resilience. Branded residences premium increasing.`,
      curated: true,
    },
  };
  
  return insights[type] || {
    type: 'general',
    insight: 'How may Aurelia assist you today? Our concierge team is available 24/7 for personalized recommendations.',
    curated: true,
  };
}
