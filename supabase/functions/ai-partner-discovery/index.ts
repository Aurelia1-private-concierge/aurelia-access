import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PARTNER_CATEGORIES = [
  'aviation', 'yacht', 'hospitality', 'dining', 'events',
  'security', 'real_estate', 'automotive', 'wellness', 'art_collectibles'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requirements, regions, category } = await req.json();

    if (!requirements) {
      return new Response(
        JSON.stringify({ success: false, error: 'Requirements are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing partner discovery request:', { requirements, regions, category });

    // Step 1: Generate optimized search queries using AI
    const searchQueryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are an expert at finding luxury service providers globally. Generate 3 highly specific web search queries to find potential partners based on user requirements. Focus on finding established companies with excellent reputations.

Categories available: ${PARTNER_CATEGORIES.join(', ')}

Return ONLY a JSON array of search query strings, no explanation.`
          },
          {
            role: 'user',
            content: `Requirements: ${requirements}
${regions ? `Target regions: ${Array.isArray(regions) ? regions.join(', ') : regions}` : 'Global coverage preferred'}
${category ? `Category: ${category}` : ''}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!searchQueryResponse.ok) {
      console.error('AI query generation failed:', await searchQueryResponse.text());
      throw new Error('Failed to generate search queries');
    }

    const queryData = await searchQueryResponse.json();
    let searchQueries: string[] = [];
    
    try {
      const content = queryData.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        searchQueries = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse search queries:', e);
      searchQueries = [`luxury ${category || 'concierge'} services ${Array.isArray(regions) ? regions[0] : 'worldwide'}`];
    }

    console.log('Generated search queries:', searchQueries);

    // Step 2: Search the web using Firecrawl (if available)
    let searchResults: any[] = [];
    
    if (FIRECRAWL_API_KEY) {
      for (const query of searchQueries.slice(0, 3)) {
        try {
          const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query,
              limit: 5,
              scrapeOptions: { formats: ['markdown'] },
            }),
          });

          if (searchResponse.ok) {
            const data = await searchResponse.json();
            if (data.data) {
              searchResults.push(...data.data);
            }
          }
        } catch (e) {
          console.error('Search error for query:', query, e);
        }
      }
      console.log('Found', searchResults.length, 'web results');
    } else {
      console.log('Firecrawl not configured, using AI-only discovery');
    }

    // Step 3: Analyze results and generate partner suggestions using AI
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
            content: `You are a luxury concierge partner acquisition specialist. Analyze the provided web search results and user requirements to identify potential partner companies.

For each potential partner, extract or infer:
- company_name: The business name
- category: One of [${PARTNER_CATEGORIES.join(', ')}]
- subcategory: More specific service type
- description: Brief description of their services
- website: Their website URL if found
- coverage_regions: Array of regions they operate in
- priority: "high", "medium", or "low" based on fit
- match_reason: Why they're a good fit

Return a JSON object with a "partners" array containing up to 8 partner objects. Be realistic and only include companies that appear legitimate.`
          },
          {
            role: 'user',
            content: `User Requirements: ${requirements}
Target Regions: ${Array.isArray(regions) ? regions.join(', ') : (regions || 'Global')}
Category Focus: ${category || 'Any luxury service'}

Web Search Results:
${searchResults.length > 0 
  ? searchResults.map((r, i) => `
[${i + 1}] ${r.title || 'Unknown'}
URL: ${r.url || 'N/A'}
${r.description || r.markdown?.slice(0, 500) || 'No description'}
`).join('\n---\n')
  : 'No web results available. Generate suggestions based on your knowledge of the luxury service industry for the specified requirements and regions.'}
`
          }
        ],
        temperature: 0.5,
        tools: [
          {
            type: 'function',
            function: {
              name: 'return_partners',
              description: 'Return the list of potential partner companies',
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
                        match_reason: { type: 'string' }
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
          JSON.stringify({ success: false, error: 'AI credits depleted. Please add credits to continue.' }),
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
      try {
        const content = analysisData.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*"partners"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          suggestions = parsed.partners || [];
        }
      } catch (e2) {
        console.error('Fallback parsing failed:', e2);
      }
    }

    console.log('Generated', suggestions.length, 'partner suggestions');

    return new Response(
      JSON.stringify({
        success: true,
        suggestions,
        searchQueries,
        webResultsCount: searchResults.length,
        message: FIRECRAWL_API_KEY 
          ? `Found ${suggestions.length} potential partners from global web search`
          : `Generated ${suggestions.length} AI-suggested partners`
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
