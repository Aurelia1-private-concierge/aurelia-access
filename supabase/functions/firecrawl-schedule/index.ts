import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extraction schemas matching frontend
const extractionSchemas: Record<string, object> = {
  product: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      price: { type: 'string' },
      currency: { type: 'string' },
      description: { type: 'string' },
      images: { type: 'array', items: { type: 'string' } },
      availability: { type: 'string' },
      brand: { type: 'string' },
      sku: { type: 'string' },
      rating: { type: 'number' },
      reviewCount: { type: 'number' },
    },
  },
  article: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      author: { type: 'string' },
      publishDate: { type: 'string' },
      content: { type: 'string' },
      summary: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      images: { type: 'array', items: { type: 'string' } },
    },
  },
  contact: {
    type: 'object',
    properties: {
      companyName: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      address: { type: 'string' },
      socialLinks: { 
        type: 'object',
        properties: {
          linkedin: { type: 'string' },
          twitter: { type: 'string' },
          facebook: { type: 'string' },
          instagram: { type: 'string' },
        }
      },
    },
  },
  pricing: {
    type: 'object',
    properties: {
      plans: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'string' },
            period: { type: 'string' },
            features: { type: 'array', items: { type: 'string' } },
            cta: { type: 'string' },
          }
        }
      }
    }
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
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
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    const body = await req.json();
    const { action } = body;

    // Handle different actions
    if (action === 'list') {
      // List all scheduled jobs for this user
      const { data: jobs, error } = await supabaseClient
        .from('scheduled_scrape_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch scheduled jobs' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: jobs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'delete') {
      const { jobId } = body;
      
      if (!jobId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Job ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabaseClient
        .from('scheduled_scrape_jobs')
        .delete()
        .eq('id', jobId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting job:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to delete job' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Job deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new scheduled job
    const { url, extractionType, customSchema, scheduleType, webhookUrl } = body;

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!scheduleType || !['hourly', 'daily', 'weekly', 'monthly'].includes(scheduleType)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Valid schedule type is required (hourly, daily, weekly, monthly)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate next run time
    const now = new Date();
    let nextRun: Date;
    switch (scheduleType) {
      case 'hourly':
        nextRun = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case 'daily':
        nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextRun = new Date(now.setMonth(now.getMonth() + 1));
        break;
      default:
        nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }

    // Get schema for extraction
    const schema = extractionType && extractionType !== 'custom' 
      ? extractionSchemas[extractionType] 
      : customSchema;

    // Store the scheduled job
    const { data: job, error } = await supabaseClient
      .from('scheduled_scrape_jobs')
      .insert({
        user_id: userId,
        url,
        extraction_type: extractionType || null,
        extraction_schema: schema || null,
        schedule_type: scheduleType,
        webhook_url: webhookUrl || null,
        next_run_at: nextRun.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create scheduled job' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Created scheduled job:', job.id);
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: job,
        message: `Job scheduled to run ${scheduleType}. Next run: ${nextRun.toISOString()}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in schedule function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
