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

    console.log('Scraping URL:', formattedUrl, 'for user:', userId);
    console.log('Options:', JSON.stringify(options));

    // Build request body with advanced options
    // Filter out non-string formats (like JSON extraction objects) and handle them separately
    let formats = options?.formats || ['markdown'];
    let jsonSchema = null;
    let jsonPrompt = null;
    
    // Check if formats contains JSON extraction config
    if (Array.isArray(formats)) {
      const validFormats: string[] = [];
      for (const format of formats) {
        if (typeof format === 'string') {
          validFormats.push(format);
        } else if (format && typeof format === 'object' && format.type === 'json') {
          // Handle JSON extraction - add 'json' to formats and extract schema/prompt
          validFormats.push('json');
          if (format.schema) jsonSchema = format.schema;
          if (format.prompt) jsonPrompt = format.prompt;
        }
      }
      formats = validFormats;
    }

    const requestBody: Record<string, unknown> = {
      url: formattedUrl,
      formats,
      onlyMainContent: options?.onlyMainContent ?? true,
    };

    // Add JSON extraction parameters if present
    if (jsonSchema) {
      requestBody.jsonOptions = { schema: jsonSchema };
    }
    if (jsonPrompt) {
      requestBody.jsonOptions = { ...(requestBody.jsonOptions as object || {}), prompt: jsonPrompt };
    }

    // Add optional parameters
    if (options?.waitFor) {
      requestBody.waitFor = options.waitFor;
    }
    if (options?.location) {
      requestBody.location = options.location;
    }
    if (options?.actions) {
      requestBody.actions = options.actions;
    }
    if (options?.removeTags) {
      requestBody.removeTags = options.removeTags;
    }
    if (options?.headers) {
      requestBody.headers = options.headers;
    }

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scrape successful for user:', userId);
    
    // Return with consistent structure
    return new Response(
      JSON.stringify({
        success: true,
        data: data.data || data,
        metadata: data.data?.metadata || data.metadata,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
