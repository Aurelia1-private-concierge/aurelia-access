import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FraudCheckRequest {
  user_id: string;
  amount: number;
  currency: string;
  ip_address?: string;
  device_fingerprint?: string;
  geolocation?: {
    country?: string;
    city?: string;
    lat?: number;
    lon?: number;
  };
  service_request_id?: string;
  partner_id?: string;
  description?: string;
}

interface FraudRule {
  id: string;
  name: string;
  rule_type: string;
  condition: Record<string, unknown>;
  action: string;
  severity: string;
  priority: number;
}

interface RiskFactor {
  rule: string;
  severity: string;
  score: number;
  details: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body: FraudCheckRequest = await req.json();
    const { user_id, amount, currency, ip_address, device_fingerprint, geolocation } = body;

    console.log(`Fraud check for user ${user_id}: ${amount} ${currency}`);

    // Fetch active fraud rules
    const { data: rules, error: rulesError } = await supabase
      .from("fraud_rules")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: true });

    if (rulesError) {
      console.error("Failed to fetch fraud rules:", rulesError);
      throw new Error("Failed to load fraud rules");
    }

    const riskFactors: RiskFactor[] = [];
    let totalScore = 0;
    let blockTransaction = false;
    let requireReview = false;

    // 1. Velocity Checks
    const velocityRules = (rules as FraudRule[]).filter((r) => r.rule_type === "velocity");
    for (const rule of velocityRules) {
      const period = rule.condition.period as string;
      const maxTransactions = rule.condition.max_transactions as number;
      const maxAmount = rule.condition.max_amount as number;

      const periodStart = getPeriodStart(period);
      
      const { data: velocity } = await supabase
        .from("payment_velocity")
        .select("*")
        .eq("user_id", user_id)
        .eq("period_type", period)
        .gte("period_start", periodStart.toISOString())
        .single();

      if (velocity) {
        if (maxTransactions && velocity.transaction_count >= maxTransactions) {
          const score = calculateScore(rule.severity, 25);
          riskFactors.push({
            rule: rule.name,
            severity: rule.severity,
            score,
            details: `${velocity.transaction_count} transactions in ${period} (limit: ${maxTransactions})`,
          });
          totalScore += score;
          if (rule.action === "block") blockTransaction = true;
          if (rule.action === "review") requireReview = true;
        }
        if (maxAmount && velocity.total_amount >= maxAmount) {
          const score = calculateScore(rule.severity, 30);
          riskFactors.push({
            rule: rule.name,
            severity: rule.severity,
            score,
            details: `$${velocity.total_amount} in ${period} (limit: $${maxAmount})`,
          });
          totalScore += score;
          if (rule.action === "block") blockTransaction = true;
          if (rule.action === "review") requireReview = true;
        }
      }
    }

    // 2. Amount Checks
    const amountRules = (rules as FraudRule[]).filter((r) => r.rule_type === "amount");
    for (const rule of amountRules) {
      const threshold = rule.condition.threshold as number;
      if (amount >= threshold) {
        const score = calculateScore(rule.severity, 20);
        riskFactors.push({
          rule: rule.name,
          severity: rule.severity,
          score,
          details: `Transaction amount $${amount} exceeds threshold $${threshold}`,
        });
        totalScore += score;
        if (rule.action === "block") blockTransaction = true;
        if (rule.action === "review") requireReview = true;
      }
    }

    // 3. Multiple Failure Checks
    const failureRules = (rules as FraudRule[]).filter((r) => r.rule_type === "failure");
    for (const rule of failureRules) {
      const maxFailures = rule.condition.max_failures as number;
      const period = rule.condition.period as string;
      const periodStart = getPeriodStart(period);

      const { count } = await supabase
        .from("payment_intents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user_id)
        .eq("status", "failed")
        .gte("created_at", periodStart.toISOString());

      if (count && count >= maxFailures) {
        const score = calculateScore(rule.severity, 35);
        riskFactors.push({
          rule: rule.name,
          severity: rule.severity,
          score,
          details: `${count} failed payments in ${period} (limit: ${maxFailures})`,
        });
        totalScore += score;
        if (rule.action === "block") blockTransaction = true;
        if (rule.action === "review") requireReview = true;
      }
    }

    // 4. Geolocation Anomaly Check
    if (geolocation?.lat && geolocation?.lon) {
      const geoRules = (rules as FraudRule[]).filter((r) => r.rule_type === "geolocation");
      for (const rule of geoRules) {
        const maxDistanceKm = rule.condition.max_distance_km as number;
        const periodMinutes = rule.condition.period_minutes as number;
        const since = new Date(Date.now() - periodMinutes * 60 * 1000);

        const { data: recentPayments } = await supabase
          .from("payment_intents")
          .select("geolocation")
          .eq("user_id", user_id)
          .gte("created_at", since.toISOString())
          .not("geolocation", "is", null)
          .limit(5);

        if (recentPayments && recentPayments.length > 0) {
          for (const payment of recentPayments) {
            const prevGeo = payment.geolocation as { lat?: number; lon?: number };
            if (prevGeo?.lat && prevGeo?.lon) {
              const distance = haversineDistance(
                geolocation.lat,
                geolocation.lon,
                prevGeo.lat,
                prevGeo.lon
              );
              if (distance > maxDistanceKm) {
                const score = calculateScore(rule.severity, 40);
                riskFactors.push({
                  rule: rule.name,
                  severity: rule.severity,
                  score,
                  details: `Location change of ${Math.round(distance)}km within ${periodMinutes} minutes`,
                });
                totalScore += score;
                if (rule.action === "block") blockTransaction = true;
                if (rule.action === "review") requireReview = true;
                break;
              }
            }
          }
        }
      }
    }

    // 5. Device Check
    if (device_fingerprint) {
      const deviceRules = (rules as FraudRule[]).filter((r) => r.rule_type === "device");
      for (const rule of deviceRules) {
        const newDeviceThreshold = rule.condition.new_device_threshold as number;

        const { count } = await supabase
          .from("payment_intents")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user_id)
          .eq("device_fingerprint", device_fingerprint)
          .eq("status", "succeeded");

        const isNewDevice = !count || count === 0;
        if (isNewDevice && amount >= newDeviceThreshold) {
          const score = calculateScore(rule.severity, 15);
          riskFactors.push({
            rule: rule.name,
            severity: rule.severity,
            score,
            details: `Large transaction ($${amount}) from new device`,
          });
          totalScore += score;
          if (rule.action === "challenge") requireReview = true;
        }
      }
    }

    // 6. Time-based Check
    const timeRules = (rules as FraudRule[]).filter((r) => r.rule_type === "time");
    const currentHour = new Date().getUTCHours();
    for (const rule of timeRules) {
      const startHour = rule.condition.start_hour as number;
      const endHour = rule.condition.end_hour as number;
      const multiplier = rule.condition.threshold_multiplier as number;

      if (currentHour >= startHour && currentHour < endHour) {
        const score = calculateScore(rule.severity, 10);
        riskFactors.push({
          rule: rule.name,
          severity: rule.severity,
          score,
          details: `Transaction during high-risk hours (${startHour}:00-${endHour}:00 UTC)`,
        });
        totalScore += score * multiplier;
        if (rule.action === "review") requireReview = true;
      }
    }

    // Cap score at 100
    totalScore = Math.min(100, totalScore);

    // Determine fraud status
    let fraudStatus: "clean" | "review" | "blocked" | "approved" = "clean";
    let actionTaken: "allow" | "review" | "block" | "challenge" = "allow";

    if (blockTransaction) {
      fraudStatus = "blocked";
      actionTaken = "block";
    } else if (requireReview || totalScore >= 50) {
      fraudStatus = "review";
      actionTaken = "review";
    } else if (totalScore >= 25) {
      actionTaken = "challenge";
    }

    // Create payment intent record
    const { data: paymentIntent, error: insertError } = await supabase
      .from("payment_intents")
      .insert({
        user_id,
        amount,
        currency,
        fraud_score: totalScore,
        fraud_status: fraudStatus,
        risk_factors: riskFactors,
        ip_address,
        device_fingerprint,
        geolocation,
        service_request_id: body.service_request_id,
        partner_id: body.partner_id,
        description: body.description,
        status: blockTransaction ? "failed" : "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create payment intent:", insertError);
      throw new Error("Failed to create payment intent");
    }

    // Create fraud alerts for significant risks
    const significantRisks = riskFactors.filter(
      (r) => r.severity === "high" || r.severity === "critical"
    );

    for (const risk of significantRisks) {
      await supabase.from("fraud_alerts").insert({
        payment_intent_id: paymentIntent.id,
        user_id,
        alert_type: mapRuleToAlertType(risk.rule),
        severity: risk.severity,
        rule_triggered: risk.rule,
        rule_details: { score: risk.score, details: risk.details },
        action_taken: actionTaken,
        action_reason: risk.details,
      });
    }

    // Update velocity tracking
    await updateVelocity(supabase, user_id, amount, currency, ip_address);

    console.log(`Fraud check complete: score=${totalScore}, status=${fraudStatus}, action=${actionTaken}`);

    return new Response(
      JSON.stringify({
        payment_intent_id: paymentIntent.id,
        fraud_score: totalScore,
        fraud_status: fraudStatus,
        action: actionTaken,
        risk_factors: riskFactors,
        allowed: !blockTransaction,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fraud detection error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper functions
function getPeriodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case "hour":
      return new Date(now.getTime() - 60 * 60 * 1000);
    case "day":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

function calculateScore(severity: string, baseScore: number): number {
  const multipliers: Record<string, number> = {
    low: 0.5,
    medium: 1,
    high: 1.5,
    critical: 2,
  };
  return Math.round(baseScore * (multipliers[severity] || 1));
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function mapRuleToAlertType(ruleName: string): string {
  if (ruleName.toLowerCase().includes("velocity")) return "velocity_limit";
  if (ruleName.toLowerCase().includes("geo")) return "geolocation_anomaly";
  if (ruleName.toLowerCase().includes("device")) return "device_mismatch";
  if (ruleName.toLowerCase().includes("amount")) return "amount_anomaly";
  if (ruleName.toLowerCase().includes("time") || ruleName.toLowerCase().includes("hour"))
    return "time_anomaly";
  if (ruleName.toLowerCase().includes("failure")) return "multiple_failures";
  return "manual_review";
}

interface VelocityRecord {
  id: string;
  transaction_count: number;
  total_amount: number;
  unique_ips: number;
  currencies_used?: string[];
}

// deno-lint-ignore no-explicit-any
async function updateVelocity(
  supabase: any,
  userId: string,
  amount: number,
  _currency: string,
  ipAddress?: string
) {
  const periods: Array<{ type: string; start: Date }> = [
    { type: "hour", start: new Date(new Date().setMinutes(0, 0, 0)) },
    { type: "day", start: new Date(new Date().setHours(0, 0, 0, 0)) },
  ];

  for (const period of periods) {
    const { data } = await supabase
      .from("payment_velocity")
      .select("*")
      .eq("user_id", userId)
      .eq("period_type", period.type)
      .eq("period_start", period.start.toISOString())
      .single();

    const existing = data as VelocityRecord | null;

    if (existing) {
      const newIps = ipAddress && !existing.currencies_used?.includes(ipAddress) ? 1 : 0;
      await supabase
        .from("payment_velocity")
        .update({
          transaction_count: existing.transaction_count + 1,
          total_amount: Number(existing.total_amount) + amount,
          unique_ips: existing.unique_ips + newIps,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("payment_velocity").insert({
        user_id: userId,
        period_type: period.type,
        period_start: period.start.toISOString(),
        transaction_count: 1,
        total_amount: amount,
        unique_ips: ipAddress ? 1 : 0,
      });
    }
  }
}
