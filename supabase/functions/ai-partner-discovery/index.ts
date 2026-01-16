import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PARTNER_CATEGORIES = [
  'aviation', 'yacht', 'hospitality', 'dining', 'events',
  'security', 'real_estate', 'automotive', 'wellness', 'art_collectibles'
];

const AUTO_OUTREACH_THRESHOLD = 80;
const CACHE_TTL_HOURS = 24;

// Enhanced search sources for better coverage
const SEARCH_QUERIES_TEMPLATE = {
  aviation: ['luxury private jet charter company', 'elite aircraft management firm', 'VIP aviation services'],
  yacht: ['superyacht charter broker', 'luxury yacht management company', 'mega yacht charter services'],
  hospitality: ['luxury hotel management company', 'five star resort operator', 'boutique luxury hotel group'],
  dining: ['private chef services VIP', 'exclusive restaurant group luxury', 'michelin star catering'],
  events: ['VIP event planning luxury', 'exclusive party planner celebrity', 'high-end event management'],
  security: ['executive protection services VIP', 'celebrity security firm', 'luxury estate security'],
  real_estate: ['luxury real estate broker', 'ultra high net worth property', 'exclusive mansion sales'],
  automotive: ['exotic car rental VIP', 'luxury vehicle concierge', 'supercar experience provider'],
  wellness: ['luxury wellness retreat', 'VIP medical concierge', 'exclusive spa resort'],
  art_collectibles: ['fine art dealer private', 'rare collectibles broker', 'luxury auction specialist'],
};

// Simple in-memory cache (resets per invocation, but helps within same request)
const searchCache = new Map<string, { data: any; timestamp: number }>();

async function getCachedSearch(supabase: any, cacheKey: string): Promise<any | null> {
  try {
    const { data } = await supabase
      .from('app_settings')
      .select('value, updated_at')
      .eq('key', `search_cache_${cacheKey}`)
      .single();
    
    if (data?.value) {
      const cached = JSON.parse(data.value);
      const age = (Date.now() - new Date(data.updated_at).getTime()) / (1000 * 60 * 60);
      if (age < CACHE_TTL_HOURS) {
        console.log('Cache hit for:', cacheKey);
        return cached;
      }
    }
  } catch (e) {
    // Cache miss
  }
  return null;
}

async function setCachedSearch(supabase: any, cacheKey: string, data: any): Promise<void> {
  try {
    await supabase
      .from('app_settings')
      .upsert({
        key: `search_cache_${cacheKey}`,
        value: JSON.stringify(data),
        description: 'Partner discovery search cache',
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
  } catch (e) {
    console.error('Cache write error:', e);
  }
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidPatterns = ['noreply', 'no-reply', 'donotreply', 'mailer-daemon', 'postmaster'];
  const lowercaseEmail = email.toLowerCase();
  
  if (!emailRegex.test(email)) return false;
  if (invalidPatterns.some(p => lowercaseEmail.includes(p))) return false;
  
  return true;
}

function extractContactEmail(website: string, companyName: string): string | null {
  if (!website) return null;
  
  try {
    const url = new URL(website.startsWith('http') ? website : `https://${website}`);
    const domain = url.hostname.replace('www.', '');
    
    // Common contact patterns in order of preference
    const patterns = ['info', 'contact', 'hello', 'enquiries', 'partnerships', 'business'];
    
    for (const pattern of patterns) {
      const email = `${pattern}@${domain}`;
      if (validateEmail(email)) return email;
    }
    
    return `info@${domain}`;
  } catch {
    return null;
  }
}

async function parallelSearch(queries: string[], apiKey: string, limit: number = 5): Promise<any[]> {
  const searchPromises = queries.map(async (query) => {
    try {
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit,
          scrapeOptions: { formats: ['markdown'] },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (e) {
      console.error('Search error for query:', query, e);
      return [];
    }
  });

  const results = await Promise.all(searchPromises);
  return results.flat();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { requirements, regions, category, autoOutreach } = await req.json();

    if (!requirements) {
      return new Response(
        JSON.stringify({ success: false, error: 'Requirements are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing enhanced partner discovery:', { requirements, regions, category, autoOutreach });

    // Create cache key from request params
    const cacheKey = btoa(`${requirements}_${category || 'all'}_${(regions || []).join(',')}`).slice(0, 50);

    // Check cache first
    const cachedResult = await getCachedSearch(supabase, cacheKey);
    if (cachedResult && !autoOutreach) {
      console.log('Returning cached results');
      return new Response(
        JSON.stringify({
          ...cachedResult,
          cached: true,
          processingTime: Date.now() - startTime
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Generate search queries using AI (parallel with template queries)
    const aiQueryPromise = fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `Generate 3 highly specific web search queries to find luxury service partners. Return ONLY a JSON array of strings.`
          },
          {
            role: 'user',
            content: `Requirements: ${requirements}
${regions ? `Regions: ${Array.isArray(regions) ? regions.join(', ') : regions}` : 'Global'}
${category ? `Category: ${category}` : ''}`
          }
        ],
        temperature: 0.5,
      }),
    });

    // Get template queries for the category
    const templateQueries = category && SEARCH_QUERIES_TEMPLATE[category as keyof typeof SEARCH_QUERIES_TEMPLATE]
      ? SEARCH_QUERIES_TEMPLATE[category as keyof typeof SEARCH_QUERIES_TEMPLATE]
      : [];

    // Add region context to template queries
    const regionContext = Array.isArray(regions) && regions.length > 0 ? regions[0] : '';
    const enhancedTemplateQueries = templateQueries.map(q => 
      regionContext ? `${q} ${regionContext}` : q
    );

    // Wait for AI queries
    let aiQueries: string[] = [];
    try {
      const aiResponse = await aiQueryPromise;
      if (aiResponse.ok) {
        const queryData = await aiResponse.json();
        const content = queryData.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          aiQueries = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (e) {
      console.error('AI query generation failed, using templates:', e);
    }

    // Combine and deduplicate queries
    const allQueries = [...new Set([...aiQueries, ...enhancedTemplateQueries])].slice(0, 6);
    console.log('Search queries:', allQueries);

    // Step 2: Parallel web searches
    let searchResults: any[] = [];
    
    if (FIRECRAWL_API_KEY && allQueries.length > 0) {
      searchResults = await parallelSearch(allQueries, FIRECRAWL_API_KEY, 5);
      console.log('Found', searchResults.length, 'web results in parallel');
    } else {
      console.log('Firecrawl not configured, using AI-only discovery');
    }

    // Step 3: AI analysis with enhanced extraction
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are a luxury concierge partner acquisition specialist. Analyze search results and identify potential partners.

For each partner, extract:
- company_name: Business name
- category: One of [${PARTNER_CATEGORIES.join(', ')}]
- subcategory: More specific type
- description: Brief service description (max 100 chars)
- website: URL if found
- coverage_regions: Array of regions
- priority: "high", "medium", or "low"
- match_reason: Why they're a good fit (max 50 chars)
- contact_hints: Any contact info found (email, phone patterns)

Return up to 10 partners. Prioritize companies with clear websites and contact info.`
          },
          {
            role: 'user',
            content: `Requirements: ${requirements}
Regions: ${Array.isArray(regions) ? regions.join(', ') : (regions || 'Global')}
Category: ${category || 'Any luxury service'}

Search Results:
${searchResults.length > 0 
  ? searchResults.slice(0, 15).map((r, i) => `
[${i + 1}] ${r.title || 'Unknown'}
URL: ${r.url || 'N/A'}
${(r.description || r.markdown?.slice(0, 300) || 'No description').substring(0, 300)}
`).join('\n---\n')
  : 'No web results. Generate suggestions from your knowledge of the luxury industry.'}
`
          }
        ],
        temperature: 0.4,
        tools: [
          {
            type: 'function',
            function: {
              name: 'return_partners',
              description: 'Return potential partner companies',
              parameters: {
                type: 'object',
                properties: {
                  partners: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        company_name: { type: 'string' },
                        category: { type: 'string' },
                        subcategory: { type: 'string' },
                        description: { type: 'string' },
                        website: { type: 'string' },
                        coverage_regions: { type: 'array', items: { type: 'string' } },
                        priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                        match_reason: { type: 'string' },
                        contact_hints: { type: 'string' }
                      },
                      required: ['company_name', 'category', 'description', 'priority', 'match_reason']
                    }
                  }
                },
                required: ['partners']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'return_partners' } }
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('AI analysis failed:', errorText);
      
      if (analysisResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (analysisResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits depleted. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('Failed to analyze search results');
    }

    const analysisData = await analysisResponse.json();
    let suggestions: any[] = [];

    try {
      const toolCall = analysisData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        suggestions = parsed.partners || [];
      }
    } catch (e) {
      console.error('Failed to parse partner suggestions:', e);
    }

    // Enhance suggestions with validated emails
    suggestions = suggestions.map((s: any) => ({
      ...s,
      validated_email: s.website ? extractContactEmail(s.website, s.company_name) : null,
      match_score: s.priority === 'high' ? 90 : s.priority === 'medium' ? 70 : 50,
    }));

    console.log('Generated', suggestions.length, 'enhanced partner suggestions');

    // Cache the result (without auto-outreach data)
    const cacheableResult = {
      success: true,
      suggestions,
      searchQueries: allQueries,
      webResultsCount: searchResults.length,
    };
    
    // Background cache save (fire and forget)
    setCachedSearch(supabase, cacheKey, cacheableResult).catch(console.error);

    // Step 4: Auto-outreach for high-match partners
    const autoOutreachResults: any[] = [];
    
    if (autoOutreach) {
      const highMatchPartners = suggestions.filter((s: any) => 
        s.priority === 'high' && (s.validated_email || s.website)
      );

      console.log(`Auto-outreach: ${highMatchPartners.length} high-priority partners`);

      // Process auto-outreach (limit to 3 concurrent)
      const outreachPromises = highMatchPartners.slice(0, 3).map(async (partner: any) => {
        try {
          const contactEmail = partner.validated_email || extractContactEmail(partner.website, partner.company_name);
          
          if (contactEmail && validateEmail(contactEmail)) {
            const inviteResponse = await fetch(`${SUPABASE_URL}/functions/v1/partner-invite`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                company_name: partner.company_name,
                contact_email: contactEmail,
                category: partner.category,
                subcategory: partner.subcategory,
                website: partner.website,
                description: partner.description,
                coverage_regions: partner.coverage_regions,
                match_score: partner.match_score,
                match_reason: partner.match_reason,
                auto_outreach: true,
              }),
            });

            if (inviteResponse.ok) {
              const inviteResult = await inviteResponse.json();
              return {
                company: partner.company_name,
                email: contactEmail,
                success: true,
                invite_link: inviteResult.invite_link,
              };
            }
          }
          return null;
        } catch (e) {
          console.error(`Failed to auto-invite ${partner.company_name}:`, e);
          return {
            company: partner.company_name,
            success: false,
            error: 'Invite failed',
          };
        }
      });

      const results = await Promise.all(outreachPromises);
      autoOutreachResults.push(...results.filter(r => r !== null));
    }

    const processingTime = Date.now() - startTime;
    console.log(`Discovery completed in ${processingTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        suggestions,
        searchQueries: allQueries,
        webResultsCount: searchResults.length,
        autoOutreachResults: autoOutreach ? autoOutreachResults : undefined,
        processingTime,
        message: `Found ${suggestions.length} partners in ${(processingTime / 1000).toFixed(1)}s${autoOutreachResults.length > 0 ? ` | ${autoOutreachResults.filter(r => r.success).length} auto-invited` : ''}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Partner discovery error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Discovery failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
