import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  provider: "oura" | "whoop";
  date?: string; // ISO date string, defaults to today
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    const { provider, date }: SyncRequest = await req.json();
    const targetDate = date || new Date().toISOString().split("T")[0];

    // Get connection with access token
    const { data: connection, error: connError } = await supabase
      .from("wearable_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .single();

    if (connError || !connection) {
      // Return demo data if no real connection
      return new Response(
        JSON.stringify({
          demo_mode: true,
          data: generateDemoData(provider, targetDate),
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if token needs refresh
    if (connection.expires_at && new Date(connection.expires_at) < new Date()) {
      // Token expired, needs refresh
      return new Response(
        JSON.stringify({ error: "Token expired", needs_refresh: true }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let wellnessData;

    if (provider === "oura") {
      wellnessData = await fetchOuraData(connection.access_token, targetDate);
    } else if (provider === "whoop") {
      wellnessData = await fetchWhoopData(connection.access_token, targetDate);
    } else {
      throw new Error("Invalid provider");
    }

    // Store wellness data
    const { error: upsertError } = await supabase
      .from("wellness_data")
      .upsert({
        user_id: user.id,
        provider,
        date: targetDate,
        ...wellnessData,
      }, { onConflict: "user_id,provider,date" });

    if (upsertError) {
      console.error("Failed to store wellness data:", upsertError);
    }

    // Update last sync time
    await supabase
      .from("wearable_connections")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", connection.id);

    return new Response(
      JSON.stringify({ success: true, data: wellnessData }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Wearable sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

async function fetchOuraData(accessToken: string, date: string) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  
  // Fetch readiness
  const readinessRes = await fetch(
    `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${date}&end_date=${date}`,
    { headers }
  );
  
  // Fetch sleep
  const sleepRes = await fetch(
    `https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${date}&end_date=${date}`,
    { headers }
  );

  const readinessData = await readinessRes.json();
  const sleepData = await sleepRes.json();

  const readiness = readinessData.data?.[0];
  const sleep = sleepData.data?.[0];

  return {
    readiness_score: readiness?.score || null,
    sleep_score: sleep?.score || null,
    hrv_avg: readiness?.contributors?.hrv_balance || null,
    resting_hr: readiness?.contributors?.resting_heart_rate || null,
    sleep_hours: sleep?.contributors?.total_sleep ? sleep.contributors.total_sleep / 3600 : null,
    raw_data: { readiness, sleep },
  };
}

async function fetchWhoopData(accessToken: string, date: string) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  
  // Fetch cycles (which contain recovery and strain)
  const cyclesRes = await fetch(
    `https://api.prod.whoop.com/developer/v1/cycle?start=${date}T00:00:00.000Z&end=${date}T23:59:59.999Z`,
    { headers }
  );

  const cyclesData = await cyclesRes.json();
  const cycle = cyclesData.records?.[0];

  if (!cycle) {
    return generateDemoData("whoop", date);
  }

  // Fetch recovery for this cycle
  const recoveryRes = await fetch(
    `https://api.prod.whoop.com/developer/v1/cycle/${cycle.id}/recovery`,
    { headers }
  );

  const recovery = recoveryRes.status === 200 ? await recoveryRes.json() : null;

  return {
    recovery_score: recovery?.score?.recovery_score || null,
    strain_score: cycle.score?.strain || null,
    hrv_avg: recovery?.score?.hrv_rmssd_milli ? Math.round(recovery.score.hrv_rmssd_milli) : null,
    resting_hr: recovery?.score?.resting_heart_rate || null,
    sleep_hours: cycle.score?.sleep_performance_percentage 
      ? (cycle.score.sleep_performance_percentage / 100) * 8 
      : null,
    raw_data: { cycle, recovery },
  };
}

function generateDemoData(provider: string, date: string) {
  // Generate consistent demo data based on date
  const dateHash = date.split("-").reduce((a, b) => a + parseInt(b), 0);
  const variance = (dateHash % 20) - 10;

  if (provider === "oura") {
    return {
      readiness_score: Math.min(100, Math.max(50, 78 + variance)),
      sleep_score: Math.min(100, Math.max(50, 82 + variance)),
      hrv_avg: Math.max(20, 45 + variance),
      resting_hr: Math.max(45, 58 - Math.floor(variance / 2)),
      sleep_hours: Math.max(5, 7.2 + variance / 10),
      raw_data: { demo: true },
    };
  } else {
    return {
      recovery_score: Math.min(100, Math.max(30, 72 + variance)),
      strain_score: Math.min(21, Math.max(5, 12.5 + variance / 2)),
      hrv_avg: Math.max(20, 48 + variance),
      resting_hr: Math.max(45, 56 - Math.floor(variance / 2)),
      sleep_hours: Math.max(5, 7.5 + variance / 10),
      raw_data: { demo: true },
    };
  }
}

serve(handler);
