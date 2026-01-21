import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Endpoints to monitor
const ENDPOINTS = [
  { name: 'Frontend', url: 'https://aurelia-privateconcierge.com', type: 'frontend' },
  { name: 'API Health', url: 'https://aurelia-privateconcierge.com/health.json', type: 'api' },
  { name: 'Auth API', url: `${Deno.env.get('SUPABASE_URL')}/auth/v1/health`, type: 'supabase' },
  { name: 'Database API', url: `${Deno.env.get('SUPABASE_URL')}/rest/v1/`, type: 'supabase' },
  { name: 'Edge Functions', url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/countries-service`, type: 'edge_function' },
];

async function checkEndpoint(endpoint: { name: string; url: string; type: string }) {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(endpoint.url, {
      method: 'GET',
      signal: controller.signal,
      headers: endpoint.type === 'supabase' ? {
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
      } : {},
    });
    
    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;
    
    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (!response.ok) {
      status = response.status >= 500 ? 'down' : 'degraded';
    } else if (responseTime > 3000) {
      status = 'degraded';
    }
    
    return {
      endpoint_name: endpoint.name,
      endpoint_url: endpoint.url,
      status,
      response_time_ms: responseTime,
      status_code: response.status,
      error_message: null,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      endpoint_name: endpoint.name,
      endpoint_url: endpoint.url,
      status: 'down' as const,
      response_time_ms: responseTime,
      status_code: null,
      error_message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    console.log('Starting health checks for', ENDPOINTS.length, 'endpoints');
    
    // Check all endpoints in parallel
    const results = await Promise.all(ENDPOINTS.map(checkEndpoint));
    
    // Store results in database
    const { error: insertError } = await supabase
      .from('uptime_checks')
      .insert(results.map(r => ({
        ...r,
        checked_at: new Date().toISOString(),
      })));

    if (insertError) {
      console.error('Failed to store uptime checks:', insertError);
    }

    // Check for any down services and create incident if needed
    const downServices = results.filter(r => r.status === 'down');
    if (downServices.length > 0) {
      // Check if there's already an active incident for these services
      const { data: existingIncidents } = await supabase
        .from('incidents')
        .select('id, affected_services')
        .neq('status', 'resolved')
        .limit(10);

      const affectedServiceNames = downServices.map(s => s.endpoint_name);
      const alreadyReported = existingIncidents?.some(i => 
        i.affected_services?.some((s: string) => affectedServiceNames.includes(s))
      );

      if (!alreadyReported) {
        await supabase.from('incidents').insert({
          title: `Service Outage: ${affectedServiceNames.join(', ')}`,
          description: `Automated detection: ${downServices.length} service(s) are currently unreachable.`,
          severity: downServices.length >= 2 ? 'critical' : 'major',
          affected_services: affectedServiceNames,
        });
        console.log('Created incident for down services:', affectedServiceNames);
      }
    }

    // Check for recovered services and auto-resolve incidents
    const healthyServices = results.filter(r => r.status === 'healthy').map(r => r.endpoint_name);
    const { data: activeIncidents } = await supabase
      .from('incidents')
      .select('id, affected_services')
      .neq('status', 'resolved');

    for (const incident of activeIncidents || []) {
      const allRecovered = incident.affected_services?.every((s: string) => 
        healthyServices.includes(s)
      );
      
      if (allRecovered) {
        await supabase
          .from('incidents')
          .update({ status: 'resolved', resolved_at: new Date().toISOString() })
          .eq('id', incident.id);
        console.log('Auto-resolved incident:', incident.id);
      }
    }

    // Calculate summary
    const summary = {
      total_endpoints: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      degraded: results.filter(r => r.status === 'degraded').length,
      down: results.filter(r => r.status === 'down').length,
      avg_response_time: Math.round(
        results.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / results.length
      ),
      checked_at: new Date().toISOString(),
    };

    console.log('Health check complete:', summary);

    return new Response(JSON.stringify({ results, summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Health check error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
