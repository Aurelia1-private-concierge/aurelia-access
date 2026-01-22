import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Invalid authentication:', claimsError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    const { url, options } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Crawling URL:', formattedUrl, 'for user:', userId);
    console.log('Crawl options:', JSON.stringify(options));

    // Build crawl request with advanced options
    const crawlRequest: Record<string, unknown> = {
      url: formattedUrl,
      limit: options?.limit || 100,
    };

    // Add optional parameters
    if (options?.maxDepth) {
      crawlRequest.maxDepth = options.maxDepth;
    }
    if (options?.includePaths?.length) {
      crawlRequest.includePaths = options.includePaths;
    }
    if (options?.excludePaths?.length) {
      crawlRequest.excludePaths = options.excludePaths;
    }

    // Handle scrape options for each page
    if (options?.scrapeOptions) {
      // Filter out object formats (like JSON extraction schemas) - crawl API only accepts string formats
      const stringFormats = (options.scrapeOptions.formats || ['markdown', 'html']).filter(
        (f: unknown) => typeof f === 'string'
      );
      
      // Check if there's a JSON extraction schema
      const jsonFormat = (options.scrapeOptions.formats || []).find(
        (f: unknown) => typeof f === 'object' && f !== null && (f as Record<string, unknown>).type === 'json'
      );
      
      crawlRequest.scrapeOptions = {
        formats: stringFormats.length > 0 ? stringFormats : ['markdown', 'html'],
        onlyMainContent: options.scrapeOptions.onlyMainContent ?? true,
        waitFor: options.scrapeOptions.waitFor || 0,
      };
      
      // If JSON extraction was requested, add extract format and extractOptions
      if (jsonFormat) {
        const jsonObj = jsonFormat as { schema?: object; prompt?: string };
        (crawlRequest.scrapeOptions as Record<string, unknown>).formats = [...stringFormats, 'extract'];
        crawlRequest.extractOptions = {
          schema: jsonObj.schema,
          prompt: jsonObj.prompt,
        };
      }
    } else {
      crawlRequest.scrapeOptions = {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      };
    }

    const response = await fetch('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(crawlRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Crawl started successfully for user:', userId, 'Job ID:', data.id);
    return new Response(
      JSON.stringify({
        success: true,
        id: data.id,
        status: data.status || 'scraping',
        url: formattedUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error crawling:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to crawl';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
