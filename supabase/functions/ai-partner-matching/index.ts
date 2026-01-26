import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchingRequest {
  service_request_id: string;
  max_partners?: number;
}

interface Partner {
  id: string;
  company_name: string;
  categories: string[];
  service_regions: string[] | null;
  min_budget: number | null;
  max_budget: number | null;
  rating: number;
  total_bookings: number;
  response_rate: number;
}

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  preferred_date: string | null;
  location: string | null;
}

interface MatchResult {
  partner_id: string;
  score: number;
  reasons: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { service_request_id, max_partners = 5 }: MatchingRequest = await req.json();

    if (!service_request_id) {
      return new Response(
        JSON.stringify({ error: "service_request_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the service request
    const { data: request, error: requestError } = await supabase
      .from("service_requests")
      .select("*")
      .eq("id", service_request_id)
      .single();

    if (requestError || !request) {
      return new Response(
        JSON.stringify({ error: "Service request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all approved partners with relevant categories
    const { data: partners, error: partnersError } = await supabase
      .from("partners")
      .select(`
        id,
        company_name,
        categories,
        service_regions,
        min_budget,
        max_budget,
        rating,
        total_bookings,
        response_rate
      `)
      .eq("status", "approved");

    if (partnersError) {
      throw partnersError;
    }

    // Get existing bids for this request
    const { data: existingBids } = await supabase
      .from("service_request_bids")
      .select("partner_id")
      .eq("service_request_id", service_request_id);

    const biddingPartnerIds = new Set(existingBids?.map(b => b.partner_id) || []);

    // Get existing recommendations
    const { data: existingRecs } = await supabase
      .from("partner_recommendations")
      .select("partner_id")
      .eq("service_request_id", service_request_id);

    const recommendedPartnerIds = new Set(existingRecs?.map(r => r.partner_id) || []);

    // Score and rank partners
    const matchResults: MatchResult[] = [];

    for (const partner of partners || []) {
      // Skip if already bidding or recommended
      if (biddingPartnerIds.has(partner.id) || recommendedPartnerIds.has(partner.id)) {
        continue;
      }

      const { score, reasons } = calculateMatchScore(partner, request);

      if (score > 0) {
        matchResults.push({
          partner_id: partner.id,
          score,
          reasons,
        });
      }
    }

    // Sort by score and take top N
    matchResults.sort((a, b) => b.score - a.score);
    const topMatches = matchResults.slice(0, max_partners);

    // Create recommendations
    const recommendations = topMatches.map(match => ({
      service_request_id,
      partner_id: match.partner_id,
      match_score: match.score,
      match_reasons: match.reasons,
      status: "pending",
    }));

    if (recommendations.length > 0) {
      const { error: insertError } = await supabase
        .from("partner_recommendations")
        .insert(recommendations);

      if (insertError) {
        throw insertError;
      }
    }

    // Update service request to mark auto-recommend as done
    await supabase
      .from("service_requests")
      .update({ auto_recommend_partners: false })
      .eq("id", service_request_id);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations_created: recommendations.length,
        top_matches: topMatches.map(m => ({
          partner_id: m.partner_id,
          score: m.score,
          reasons: m.reasons,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("AI Partner Matching Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function calculateMatchScore(partner: Partner, request: ServiceRequest): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Category match (40 points)
  const partnerCategories = partner.categories?.map(c => c.toLowerCase()) || [];
  const requestCategory = request.category?.toLowerCase() || "";
  
  if (partnerCategories.includes(requestCategory)) {
    score += 40;
    reasons.push(`Specializes in ${request.category}`);
  } else {
    // Partial match for related categories
    const relatedCategories: Record<string, string[]> = {
      "travel": ["hotels", "flights", "transportation", "luxury-travel"],
      "events": ["dining", "entertainment", "celebrations"],
      "luxury": ["yachts", "jets", "real-estate", "watches", "art"],
      "wellness": ["spa", "fitness", "health", "retreats"],
    };
    
    for (const [group, cats] of Object.entries(relatedCategories)) {
      if (cats.includes(requestCategory) && partnerCategories.some(pc => cats.includes(pc))) {
        score += 20;
        reasons.push(`Related expertise in ${group}`);
        break;
      }
    }
  }

  // Budget alignment (25 points)
  if (request.budget_min !== null && request.budget_max !== null) {
    const partnerMin = partner.min_budget || 0;
    const partnerMax = partner.max_budget || Infinity;
    
    if (request.budget_min >= partnerMin && request.budget_max <= partnerMax) {
      score += 25;
      reasons.push("Budget range aligns perfectly");
    } else if (
      (request.budget_min >= partnerMin && request.budget_min <= partnerMax) ||
      (request.budget_max >= partnerMin && request.budget_max <= partnerMax)
    ) {
      score += 15;
      reasons.push("Budget partially overlaps");
    }
  } else {
    // No budget specified, give partial points
    score += 10;
  }

  // Partner quality metrics (35 points total)
  
  // Rating (15 points)
  const rating = partner.rating || 0;
  if (rating >= 4.8) {
    score += 15;
    reasons.push("Exceptional rating (4.8+)");
  } else if (rating >= 4.5) {
    score += 12;
    reasons.push("Excellent rating (4.5+)");
  } else if (rating >= 4.0) {
    score += 8;
    reasons.push("Good rating (4.0+)");
  }

  // Experience/bookings (10 points)
  const bookings = partner.total_bookings || 0;
  if (bookings >= 100) {
    score += 10;
    reasons.push("Highly experienced (100+ bookings)");
  } else if (bookings >= 50) {
    score += 7;
    reasons.push("Well-established (50+ bookings)");
  } else if (bookings >= 20) {
    score += 4;
    reasons.push("Growing track record");
  }

  // Response rate (10 points)
  const responseRate = partner.response_rate || 0;
  if (responseRate >= 95) {
    score += 10;
    reasons.push("Outstanding response rate");
  } else if (responseRate >= 85) {
    score += 7;
    reasons.push("Reliable response rate");
  } else if (responseRate >= 70) {
    score += 4;
  }

  // Location match (bonus 10 points)
  if (request.location && partner.service_regions) {
    const regions = partner.service_regions.map(r => r.toLowerCase());
    const requestLocation = request.location.toLowerCase();
    
    if (regions.some(r => requestLocation.includes(r) || r.includes(requestLocation))) {
      score += 10;
      reasons.push(`Serves ${request.location} region`);
    }
  }

  return { score: Math.min(score, 100), reasons };
}
