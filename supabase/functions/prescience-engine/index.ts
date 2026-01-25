import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PreferenceSignal {
  signal_type: string;
  category: string;
  signal_data: Record<string, unknown>;
  sentiment_score?: number;
}

interface OpportunityRequest {
  action: 'generate' | 'respond' | 'learn';
  opportunity_id?: string;
  response?: 'approved' | 'declined';
  feedback?: string;
  signal?: PreferenceSignal;
}

// Categories and their associated keywords for matching
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  travel: ['destination', 'flight', 'hotel', 'resort', 'villa', 'yacht', 'jet', 'cruise'],
  dining: ['restaurant', 'chef', 'cuisine', 'michelin', 'tasting', 'wine', 'culinary'],
  events: ['concert', 'premiere', 'gala', 'auction', 'exhibition', 'fashion', 'sports'],
  wellness: ['spa', 'retreat', 'meditation', 'fitness', 'therapy', 'health'],
  shopping: ['boutique', 'jewelry', 'watch', 'art', 'collectible', 'fashion'],
  experiences: ['adventure', 'safari', 'exploration', 'private', 'exclusive', 'bespoke'],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = user.id;
    const body: OpportunityRequest = await req.json();

    // Handle different actions
    switch (body.action) {
      case 'learn':
        return await handleLearnSignal(supabase, userId, body.signal);
      
      case 'generate':
        return await handleGenerateOpportunities(supabase, userId);
      
      case 'respond':
        return await handleOpportunityResponse(supabase, userId, body.opportunity_id!, body.response!, body.feedback);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { 
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }
  } catch (error) {
    console.error('Prescience engine error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

async function handleLearnSignal(supabase: any, userId: string, signal?: PreferenceSignal) {
  if (!signal) {
    return new Response(JSON.stringify({ error: 'Signal required' }), { 
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  // Store the signal
  const { error: signalError } = await supabase
    .from('preference_signals')
    .insert({
      user_id: userId,
      signal_type: signal.signal_type,
      category: signal.category,
      signal_data: signal.signal_data,
      sentiment_score: signal.sentiment_score || 0,
    });

  if (signalError) throw signalError;

  // Update preference DNA based on accumulated signals
  await updatePreferenceDNA(supabase, userId);

  return new Response(JSON.stringify({ success: true, message: 'Signal recorded' }), { 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}

async function updatePreferenceDNA(supabase: any, userId: string) {
  // Get recent signals
  const { data: signals } = await supabase
    .from('preference_signals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (!signals || signals.length === 0) return;

  // Analyze signals to update preference DNA
  const analysis = analyzeSignals(signals);

  // Upsert preference DNA
  const { error } = await supabase
    .from('member_preference_dna')
    .upsert({
      user_id: userId,
      adventure_score: analysis.adventureScore,
      luxury_threshold: analysis.luxuryThreshold,
      spontaneity_score: analysis.spontaneityScore,
      preferred_destinations: analysis.preferredDestinations,
      preferred_cuisines: analysis.preferredCuisines,
      preferred_experiences: analysis.preferredExperiences,
      data_points_analyzed: signals.length,
      last_learning_at: new Date().toISOString(),
      confidence_score: Math.min(signals.length * 2, 100),
    }, { onConflict: 'user_id' });

  if (error) console.error('Failed to update preference DNA:', error);
}

function analyzeSignals(signals: any[]) {
  // Calculate adventure score based on experience types
  const adventureSignals = signals.filter(s => 
    ['adventure', 'exploration', 'safari', 'extreme'].some(k => 
      JSON.stringify(s.signal_data).toLowerCase().includes(k)
    )
  );
  const adventureScore = Math.min(50 + (adventureSignals.length * 5), 100);

  // Calculate luxury threshold based on spending patterns
  const spendingSignals = signals.filter(s => s.signal_data?.estimated_cost);
  const avgSpend = spendingSignals.length > 0 
    ? spendingSignals.reduce((sum, s) => sum + (s.signal_data.estimated_cost || 0), 0) / spendingSignals.length 
    : 5000;
  const luxuryThreshold = Math.min(Math.floor(avgSpend / 100), 100);

  // Calculate spontaneity based on booking lead times
  const bookingSignals = signals.filter(s => s.signal_type === 'booking');
  const spontaneityScore = bookingSignals.length > 0
    ? Math.min(100 - (bookingSignals.filter(s => s.signal_data?.lead_days > 14).length * 10), 100)
    : 50;

  // Extract preferred destinations
  const destinations = signals
    .filter(s => s.signal_data?.destination && s.sentiment_score > 0)
    .map(s => s.signal_data.destination)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 10);

  // Extract preferred cuisines
  const cuisines = signals
    .filter(s => s.category === 'dining' && s.sentiment_score > 0)
    .map(s => s.signal_data?.cuisine)
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5);

  // Extract preferred experiences
  const experiences = signals
    .filter(s => s.sentiment_score > 50)
    .map(s => s.category)
    .filter((v, i, a) => a.indexOf(v) === i);

  return {
    adventureScore,
    luxuryThreshold,
    spontaneityScore,
    preferredDestinations: destinations,
    preferredCuisines: cuisines,
    preferredExperiences: experiences,
  };
}

async function handleGenerateOpportunities(supabase: any, userId: string) {
  // Get member's preference DNA
  const { data: dna } = await supabase
    .from('member_preference_dna')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Get important dates
  const { data: dates } = await supabase
    .from('member_important_dates')
    .select('*')
    .eq('user_id', userId)
    .gte('date_value', new Date().toISOString().split('T')[0]);

  // Generate AI-powered opportunities using Lovable AI
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not configured');
    return new Response(JSON.stringify({ error: 'AI service not configured' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  const prompt = buildOpportunityPrompt(dna, dates);

  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { 
          role: 'system', 
          content: `You are Aurelia Prescience, a predictive lifestyle intelligence system for ultra-high-net-worth individuals. Generate personalized, anticipatory lifestyle opportunities that feel magical - as if you're reading their mind. Be specific, luxurious, and time-sensitive. Always explain WHY this opportunity matches them.` 
        },
        { role: 'user', content: prompt }
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'generate_opportunities',
          description: 'Generate personalized lifestyle opportunities',
          parameters: {
            type: 'object',
            properties: {
              opportunities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    category: { type: 'string', enum: ['travel', 'dining', 'events', 'wellness', 'shopping', 'experiences'] },
                    opportunity_type: { type: 'string', enum: ['time_sensitive', 'calendar_match', 'preference_match', 'serendipity'] },
                    match_score: { type: 'number', minimum: 0, maximum: 100 },
                    match_reasons: { type: 'array', items: { type: 'string' } },
                    location: { type: 'string' },
                    estimated_cost: { type: 'number' },
                    available_until: { type: 'string' },
                    priority: { type: 'number', minimum: 1, maximum: 10 }
                  },
                  required: ['title', 'description', 'category', 'opportunity_type', 'match_score', 'match_reasons']
                }
              }
            },
            required: ['opportunities']
          }
        }
      }],
      tool_choice: { type: 'function', function: { name: 'generate_opportunities' } }
    }),
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    console.error('AI generation failed:', errorText);
    
    if (aiResponse.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), { 
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    if (aiResponse.status === 402) {
      return new Response(JSON.stringify({ error: 'AI credits exhausted' }), { 
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify({ error: 'Failed to generate opportunities' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  const aiData = await aiResponse.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall) {
    return new Response(JSON.stringify({ error: 'No opportunities generated' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  const opportunities = JSON.parse(toolCall.function.arguments).opportunities;

  // Store opportunities in database
  const insertPromises = opportunities.map((opp: any) => 
    supabase.from('lifestyle_opportunities').insert({
      user_id: userId,
      title: opp.title,
      description: opp.description,
      category: opp.category,
      opportunity_type: opp.opportunity_type,
      match_score: opp.match_score,
      match_reasons: opp.match_reasons,
      location: opp.location,
      estimated_cost: opp.estimated_cost,
      priority: opp.priority || 5,
      available_until: opp.available_until,
      expires_at: opp.available_until || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
  );

  await Promise.all(insertPromises);

  console.log(`Generated ${opportunities.length} opportunities for user ${userId}`);

  return new Response(JSON.stringify({ 
    success: true, 
    count: opportunities.length,
    opportunities 
  }), { 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}

function buildOpportunityPrompt(dna: any, dates: any[]) {
  const today = new Date();
  const upcomingDates = dates?.filter(d => {
    const dateVal = new Date(d.date_value);
    const daysUntil = Math.floor((dateVal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 60 && daysUntil >= 0;
  }) || [];

  let prompt = `Generate 3-5 personalized lifestyle opportunities for an Aurelia member.\n\n`;

  if (dna) {
    prompt += `MEMBER PREFERENCE DNA:\n`;
    prompt += `- Adventure score: ${dna.adventure_score}/100 (${dna.adventure_score > 70 ? 'thrill-seeker' : dna.adventure_score > 40 ? 'balanced' : 'comfort-focused'})\n`;
    prompt += `- Luxury threshold: ${dna.luxury_threshold}/100\n`;
    prompt += `- Spontaneity: ${dna.spontaneity_score}/100\n`;
    prompt += `- Privacy preference: ${dna.privacy_preference}/100\n`;
    
    if (dna.preferred_destinations?.length > 0) {
      prompt += `- Favorite destinations: ${dna.preferred_destinations.join(', ')}\n`;
    }
    if (dna.preferred_cuisines?.length > 0) {
      prompt += `- Preferred cuisines: ${dna.preferred_cuisines.join(', ')}\n`;
    }
    if (dna.preferred_experiences?.length > 0) {
      prompt += `- Preferred experiences: ${dna.preferred_experiences.join(', ')}\n`;
    }
    if (dna.typical_spend_per_experience) {
      prompt += `- Typical spend: $${dna.typical_spend_per_experience.toLocaleString()}\n`;
    }
  } else {
    prompt += `NEW MEMBER - No preference data yet. Suggest diverse, high-end options to learn preferences.\n`;
  }

  if (upcomingDates.length > 0) {
    prompt += `\nUPCOMING IMPORTANT DATES:\n`;
    upcomingDates.forEach(d => {
      const daysUntil = Math.floor((new Date(d.date_value).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      prompt += `- ${d.title} (${d.date_type}) in ${daysUntil} days${d.associated_person ? ` - for ${d.associated_person}` : ''}\n`;
    });
  }

  prompt += `\nCURRENT CONTEXT:\n`;
  prompt += `- Today: ${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}\n`;
  prompt += `- Season: ${getSeason(today)}\n`;
  prompt += `- Generate opportunities that feel prescient - like you anticipated their desires before they knew them.\n`;

  return prompt;
}

function getSeason(date: Date): string {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
}

async function handleOpportunityResponse(
  supabase: any, 
  userId: string, 
  opportunityId: string, 
  response: 'approved' | 'declined',
  feedback?: string
) {
  // Update opportunity status
  const { error: updateError } = await supabase
    .from('lifestyle_opportunities')
    .update({
      status: response === 'approved' ? 'approved' : 'declined',
      member_response: feedback,
      responded_at: new Date().toISOString(),
    })
    .eq('id', opportunityId)
    .eq('user_id', userId);

  if (updateError) throw updateError;

  // Get the opportunity to create a learning signal
  const { data: opp } = await supabase
    .from('lifestyle_opportunities')
    .select('*')
    .eq('id', opportunityId)
    .single();

  if (opp) {
    // Create a preference signal from this response
    await supabase.from('preference_signals').insert({
      user_id: userId,
      signal_type: response === 'approved' ? 'booking' : 'rejection',
      category: opp.category,
      signal_data: {
        opportunity_type: opp.opportunity_type,
        match_score: opp.match_score,
        location: opp.location,
        estimated_cost: opp.estimated_cost,
        feedback,
      },
      sentiment_score: response === 'approved' ? 80 : -50,
    });

    // Update preference DNA
    await updatePreferenceDNA(supabase, userId);
  }

  return new Response(JSON.stringify({ 
    success: true, 
    message: response === 'approved' ? 'Opportunity approved - our team will handle the details.' : 'Noted. We\'ll refine future suggestions.' 
  }), { 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}
