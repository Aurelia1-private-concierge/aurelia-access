import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // POST /track - Record a new visitor hit
    if (req.method === 'POST' && action === 'track') {
      const body = await req.json();
      const { path, sessionId, referrer } = body;
      const userAgent = req.headers.get('user-agent') || '';
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                 req.headers.get('cf-connecting-ip') || 
                 'unknown';

      // Filter out bots
      if (/bot|crawl|spider|googlebot|bingbot|yandex|baidu/i.test(userAgent)) {
        return new Response(
          JSON.stringify({ ignored: true, reason: 'bot' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('visitor_logs')
        .insert({
          path,
          user_agent: userAgent,
          ip_address: ip,
          session_id: sessionId,
          referrer,
        });

      if (error) {
        console.error('Error tracking visitor:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Tracked visit: ${path} from ${ip}`);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /count - Query visitor counts
    if (req.method === 'GET' && action === 'count') {
      const type = url.searchParams.get('type') || 'today';
      let count = 0;

      if (type === 'realtime') {
        // Real-time = last 5 minutes active (distinct IPs)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
          .from('visitor_logs')
          .select('ip_address')
          .gte('timestamp', fiveMinutesAgo);

        if (error) {
          console.error('Error fetching realtime count:', error);
          return new Response(
            JSON.stringify({ count: 0, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Count distinct IPs
        const uniqueIps = new Set(data?.map(row => row.ip_address) || []);
        count = uniqueIps.size;
      } else {
        // Today's visitors (distinct IPs)
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('visitor_logs')
          .select('ip_address')
          .eq('visit_date', today);

        if (error) {
          console.error('Error fetching today count:', error);
          return new Response(
            JSON.stringify({ count: 0, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Count distinct IPs
        const uniqueIps = new Set(data?.map(row => row.ip_address) || []);
        count = uniqueIps.size;
      }

      return new Response(
        JSON.stringify({ count, type }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use ?action=track (POST) or ?action=count (GET)' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Visitor tracking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
