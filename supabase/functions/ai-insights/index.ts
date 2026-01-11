import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, context, preferences } = await req.json();
    
    console.log(`Generating AI insights for type: ${type}`);
    
    // Use Lovable AI (built-in, no API key needed)
    const LOVABLE_API_URL = Deno.env.get('LOVABLE_API_URL') || 'https://api.lovable.ai';
    
    let systemPrompt = '';
    let userPrompt = '';
    
    switch (type) {
      case 'travel':
        systemPrompt = `You are an elite luxury travel concierge AI for Aurelia, a premium lifestyle platform. Provide sophisticated, personalized travel recommendations based on the client's preferences. Be concise but insightful. Focus on exclusive experiences, hidden gems, and luxury accommodations. Always suggest 3-5 specific recommendations.`;
        userPrompt = `Based on these travel preferences: ${JSON.stringify(preferences || {})}\n\nContext: ${context || 'Looking for travel inspiration'}\n\nProvide personalized luxury travel recommendations.`;
        break;
        
      case 'wellness':
        systemPrompt = `You are a wellness advisor for Aurelia's ultra-high-net-worth clients. Provide holistic wellness insights combining physical health, mental wellbeing, and lifestyle optimization. Be sophisticated and evidence-based. Consider sleep, nutrition, exercise, stress management, and biohacking.`;
        userPrompt = `Wellness data context: ${JSON.stringify(context || {})}\n\nPreferences: ${JSON.stringify(preferences || {})}\n\nProvide personalized wellness insights and recommendations.`;
        break;
        
      case 'lifestyle':
        systemPrompt = `You are a lifestyle curator for Aurelia, serving discerning clients who expect the exceptional. Provide recommendations for dining, events, experiences, and cultural activities. Be knowledgeable about exclusive venues, private events, and bespoke experiences.`;
        userPrompt = `Client context: ${JSON.stringify(context || {})}\n\nPreferences: ${JSON.stringify(preferences || {})}\n\nSuggest personalized lifestyle experiences.`;
        break;
        
      case 'investment':
        systemPrompt = `You are a luxury asset advisor for Aurelia's sophisticated clientele. Provide insights on collectibles, art, wine, watches, and alternative investments. Be knowledgeable about market trends, provenance, and appreciation potential. This is for informational purposes only.`;
        userPrompt = `Interest areas: ${JSON.stringify(context || {})}\n\nProvide insights on luxury asset opportunities and trends.`;
        break;
        
      default:
        systemPrompt = `You are Orla, the AI concierge for Aurelia luxury lifestyle platform. Be sophisticated, helpful, and personalized in your responses.`;
        userPrompt = context || 'How can you assist me today?';
    }
    
    // Call Lovable AI
    const response = await fetch(`${LOVABLE_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY') || ''}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      // Fallback to curated insights if AI unavailable
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
      model: 'gpt-5-mini',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI insights error:', error);
    
    // Return curated fallback
    const { type, preferences } = await req.json().catch(() => ({ type: 'general', preferences: {} }));
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
