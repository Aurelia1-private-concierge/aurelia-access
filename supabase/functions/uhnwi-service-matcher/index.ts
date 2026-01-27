import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * UHNWI Service Matcher - Automated Partner Discovery Orchestrator
 * 
 * This function implements the full Aurelia partner discovery workflow:
 * 1. Parse & normalize incoming service requests
 * 2. Fetch user profile, preferences, and history
 * 3. Query & filter partners by category, compliance, availability
 * 4. AI-powered ranking based on match score, performance, client fit
 * 5. Automated partner outreach & bidding invitation
 * 6. Track outcomes for continuous AI refinement
 */

interface MatchRequest {
  service_request_id: string;
  auto_outreach?: boolean;
  max_partners?: number;
}

interface UserProfile {
  id: string;
  preferences: Record<string, unknown>;
  usage_history: PartnerInteraction[];
  tier: string;
}

interface PartnerInteraction {
  partner_id: string;
  rating: number;
  completed_at: string;
}

interface PartnerCandidate {
  id: string;
  company_name: string;
  categories: string[];
  service_regions: string[];
  rating: number;
  response_rate: number;
  total_bookings: number;
  min_budget: number | null;
  max_budget: number | null;
  status: string;
}

interface MatchResult {
  partner_id: string;
  company_name: string;
  score: number;
  reasons: string[];
  ai_confidence: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { service_request_id, auto_outreach = true, max_partners = 5 }: MatchRequest = await req.json();

    if (!service_request_id) {
      return new Response(
        JSON.stringify({ error: "service_request_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[UHNWI-Matcher] Starting orchestration for request: ${service_request_id}`);

    // =========================================================================
    // STEP 1: Fetch and normalize service request
    // =========================================================================
    const { data: serviceRequest, error: requestError } = await supabase
      .from("service_requests")
      .select("*")
      .eq("id", service_request_id)
      .single();

    if (requestError || !serviceRequest) {
      return new Response(
        JSON.stringify({ error: "Service request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[UHNWI-Matcher] Request: "${serviceRequest.title}" | Category: ${serviceRequest.category}`);

    // =========================================================================
    // STEP 2: Fetch user profile, preferences, and history
    // =========================================================================
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", serviceRequest.client_id)
      .single();

    // Get user's past interactions with partners (ratings, completed requests)
    const { data: pastRequests } = await supabase
      .from("service_requests")
      .select("partner_id, status, updated_at")
      .eq("client_id", serviceRequest.client_id)
      .eq("status", "completed")
      .not("partner_id", "is", null)
      .order("updated_at", { ascending: false })
      .limit(50);

    // Get feedback/ratings from updates
    const { data: feedbackData } = await supabase
      .from("service_request_updates")
      .select("service_request_id, metadata")
      .eq("update_type", "message")
      .eq("updated_by", serviceRequest.client_id)
      .not("metadata", "is", null);

    // Build user preference profile
    const partnerRatings: Record<string, number[]> = {};
    for (const fb of feedbackData || []) {
      const meta = fb.metadata as { rating?: number; partner_id?: string };
      if (meta?.rating) {
        const request = pastRequests?.find(r => r.partner_id);
        if (request?.partner_id) {
          if (!partnerRatings[request.partner_id]) {
            partnerRatings[request.partner_id] = [];
          }
          partnerRatings[request.partner_id].push(meta.rating);
        }
      }
    }

    const preferredPartners = Object.entries(partnerRatings)
      .filter(([_, ratings]) => ratings.length > 0)
      .map(([partnerId, ratings]) => ({
        partnerId,
        avgRating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
      }))
      .filter(p => p.avgRating >= 4)
      .sort((a, b) => b.avgRating - a.avgRating);

    console.log(`[UHNWI-Matcher] User has ${preferredPartners.length} preferred partners from history`);

    // =========================================================================
    // STEP 3: Query & filter partners by category, compliance, availability
    // =========================================================================
    const { data: candidates, error: partnersError } = await supabase
      .from("partners")
      .select(`
        id,
        company_name,
        categories,
        service_regions,
        rating,
        response_rate,
        total_bookings,
        min_budget,
        max_budget,
        status
      `)
      .eq("status", "approved")
      .contains("categories", [serviceRequest.category]);

    if (partnersError) {
      throw partnersError;
    }

    console.log(`[UHNWI-Matcher] Found ${candidates?.length || 0} partners in category: ${serviceRequest.category}`);

    // Get existing bids to exclude already-invited partners
    const { data: existingBids } = await supabase
      .from("service_request_bids")
      .select("partner_id")
      .eq("service_request_id", service_request_id);

    const alreadyBiddingIds = new Set(existingBids?.map(b => b.partner_id) || []);

    // Filter candidates
    const eligibleCandidates = (candidates || []).filter(p => !alreadyBiddingIds.has(p.id));

    // =========================================================================
    // STEP 4: AI-powered ranking
    // =========================================================================
    const matchResults: MatchResult[] = [];

    for (const partner of eligibleCandidates) {
      const { score, reasons, aiConfidence } = calculateAdvancedMatchScore(
        partner as PartnerCandidate,
        serviceRequest,
        preferredPartners,
        userProfile
      );

      if (score >= 30) {
        matchResults.push({
          partner_id: partner.id,
          company_name: partner.company_name,
          score,
          reasons,
          ai_confidence: aiConfidence,
        });
      }
    }

    // Sort by score
    matchResults.sort((a, b) => b.score - a.score);
    const topMatches = matchResults.slice(0, max_partners);

    console.log(`[UHNWI-Matcher] Top ${topMatches.length} matches identified`);

    // =========================================================================
    // STEP 5: AI Enhancement (if available) - Get personalized recommendations
    // =========================================================================
    let aiEnhancedReasons: Record<string, string> = {};

    if (lovableApiKey && topMatches.length > 0) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are Aurelia's luxury concierge AI. Generate personalized, sophisticated recommendations for UHNWI clients. Be concise but compelling.`
              },
              {
                role: "user",
                content: `Client request: "${serviceRequest.title}"
Description: "${serviceRequest.description}"
Budget range: ${serviceRequest.budget_min || 'Flexible'} - ${serviceRequest.budget_max || 'Unlimited'}

Top partner matches:
${topMatches.map((m, i) => `${i + 1}. ${m.company_name} (Score: ${m.score}) - ${m.reasons.join(', ')}`).join('\n')}

For each partner, provide a 1-sentence personalized recommendation explaining why they're ideal for this specific request. Return as JSON: { "partner_name": "recommendation" }`
              }
            ],
            temperature: 0.7,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiEnhancedReasons = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (e) {
        console.error("[UHNWI-Matcher] AI enhancement failed:", e);
      }
    }

    // Merge AI recommendations
    for (const match of topMatches) {
      if (aiEnhancedReasons[match.company_name]) {
        match.reasons.push(aiEnhancedReasons[match.company_name]);
      }
    }

    // =========================================================================
    // STEP 6: Create partner recommendations in database
    // =========================================================================
    const recommendations = topMatches.map(match => ({
      service_request_id,
      partner_id: match.partner_id,
      match_score: match.score,
      match_reasons: match.reasons,
      ai_confidence: match.ai_confidence,
      status: "pending",
    }));

    if (recommendations.length > 0) {
      const { error: insertError } = await supabase
        .from("partner_recommendations")
        .insert(recommendations);

      if (insertError) {
        console.error("[UHNWI-Matcher] Failed to insert recommendations:", insertError);
      }
    }

    // =========================================================================
    // STEP 7: Automated partner outreach (if enabled)
    // =========================================================================
    const outreachResults: { partner_id: string; success: boolean; method: string }[] = [];

    if (auto_outreach && topMatches.length > 0) {
      console.log(`[UHNWI-Matcher] Initiating automated outreach to ${topMatches.length} partners`);

      // Enable bidding on the request if not already enabled
      if (!serviceRequest.bidding_enabled) {
        await supabase
          .from("service_requests")
          .update({
            bidding_enabled: true,
            bidding_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
            auto_recommend_partners: false,
          })
          .eq("id", service_request_id);
      }

      // Send invitations to top partners
      for (const match of topMatches) {
        try {
          // Create notification for partner
          const { data: partnerData } = await supabase
            .from("partners")
            .select("user_id, email, company_name")
            .eq("id", match.partner_id)
            .single();

          if (partnerData?.user_id) {
            // In-app notification
            await supabase.from("notifications").insert({
              user_id: partnerData.user_id,
              type: "bid_invitation",
              title: "New Bidding Opportunity",
              description: `You've been matched for: "${serviceRequest.title}". Match score: ${match.score}%`,
              action_url: `/partner-portal?tab=opportunities&request=${service_request_id}`,
              read: false,
            });

            outreachResults.push({
              partner_id: match.partner_id,
              success: true,
              method: "in_app_notification",
            });
          }

          // Email notification (if email available and configured)
          if (partnerData?.email) {
            try {
              await supabase.from("notification_outbox").insert({
                channel: "email",
                recipient: partnerData.email,
                subject: `Exclusive Opportunity: ${serviceRequest.title}`,
                content: JSON.stringify({
                  template: "partner_bid_invitation",
                  data: {
                    partner_name: partnerData.company_name,
                    request_title: serviceRequest.title,
                    match_score: match.score,
                    deadline: serviceRequest.bidding_deadline,
                  },
                }),
                priority: "high",
              });
            } catch (emailError) {
              console.error(`[UHNWI-Matcher] Email queue failed for ${match.partner_id}:`, emailError);
            }
          }
        } catch (err) {
          console.error(`[UHNWI-Matcher] Outreach failed for partner ${match.partner_id}:`, err);
          outreachResults.push({
            partner_id: match.partner_id,
            success: false,
            method: "failed",
          });
        }
      }

      // Create timeline update for client
      await supabase.from("service_request_updates").insert({
        service_request_id,
        update_type: "status_change",
        title: "Partners Matched",
        description: `${topMatches.length} luxury partners have been identified and invited to propose options for your request.`,
        updated_by_role: "system",
        is_visible_to_client: true,
        metadata: {
          partners_matched: topMatches.length,
          top_match_score: topMatches[0]?.score,
        },
      });
    }

    // =========================================================================
    // STEP 8: Log for AI learning loop
    // =========================================================================
    await supabase.from("discovery_logs").insert({
      kind: "uhnwi_service_match",
      metadata: {
        service_request_id,
        category: serviceRequest.category,
        client_id: serviceRequest.client_id,
        candidates_evaluated: eligibleCandidates.length,
        matches_found: topMatches.length,
        auto_outreach,
        outreach_results: outreachResults,
        processing_time_ms: Date.now() - startTime,
      },
    });

    console.log(`[UHNWI-Matcher] Completed in ${Date.now() - startTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        matches: topMatches.map(m => ({
          partner_id: m.partner_id,
          company_name: m.company_name,
          score: m.score,
          reasons: m.reasons,
          ai_confidence: m.ai_confidence,
        })),
        candidates_evaluated: eligibleCandidates.length,
        auto_outreach_sent: auto_outreach ? outreachResults.filter(r => r.success).length : 0,
        processing_time_ms: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[UHNWI-Matcher] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Advanced match scoring algorithm
 * Incorporates category fit, budget alignment, performance metrics,
 * client history, and geographic coverage
 */
function calculateAdvancedMatchScore(
  partner: PartnerCandidate,
  request: Record<string, unknown>,
  preferredPartners: { partnerId: string; avgRating: number }[],
  userProfile: Record<string, unknown> | null
): { score: number; reasons: string[]; aiConfidence: number } {
  let score = 0;
  const reasons: string[] = [];
  let confidenceFactors = 0;

  // 1. Category match (35 points)
  const partnerCategories = partner.categories?.map(c => c.toLowerCase()) || [];
  const requestCategory = (request.category as string)?.toLowerCase() || "";
  
  if (partnerCategories.includes(requestCategory)) {
    score += 35;
    reasons.push(`Specializes in ${request.category}`);
    confidenceFactors++;
  }

  // 2. Budget alignment (20 points)
  const budgetMin = request.budget_min as number | null;
  const budgetMax = request.budget_max as number | null;
  
  if (budgetMin !== null && budgetMax !== null) {
    const partnerMin = partner.min_budget || 0;
    const partnerMax = partner.max_budget || Infinity;
    
    if (budgetMin >= partnerMin && budgetMax <= partnerMax) {
      score += 20;
      reasons.push("Budget aligns perfectly");
      confidenceFactors++;
    } else if (
      (budgetMin >= partnerMin && budgetMin <= partnerMax) ||
      (budgetMax >= partnerMin && budgetMax <= partnerMax)
    ) {
      score += 12;
      reasons.push("Budget partially overlaps");
    }
  } else {
    score += 8; // No budget specified, partial credit
  }

  // 3. Partner quality metrics (25 points total)
  const rating = partner.rating || 0;
  if (rating >= 4.8) {
    score += 12;
    reasons.push("Exceptional rating (4.8+)");
    confidenceFactors++;
  } else if (rating >= 4.5) {
    score += 9;
    reasons.push("Excellent rating (4.5+)");
  } else if (rating >= 4.0) {
    score += 6;
  }

  // Response rate (8 points)
  const responseRate = partner.response_rate || 0;
  if (responseRate >= 95) {
    score += 8;
    reasons.push("Outstanding responsiveness");
    confidenceFactors++;
  } else if (responseRate >= 85) {
    score += 6;
  } else if (responseRate >= 70) {
    score += 3;
  }

  // Experience (5 points)
  const bookings = partner.total_bookings || 0;
  if (bookings >= 100) {
    score += 5;
    reasons.push(`${bookings}+ successful bookings`);
  } else if (bookings >= 50) {
    score += 3;
  }

  // 4. Client preference bonus (15 points)
  const isPreferred = preferredPartners.find(p => p.partnerId === partner.id);
  if (isPreferred) {
    score += 15;
    reasons.push(`Previously rated ${isPreferred.avgRating.toFixed(1)}★ by you`);
    confidenceFactors += 2; // High confidence for repeat preference
  }

  // 5. Geographic coverage (5 points)
  const requestLocation = request.preferred_location as string | null;
  if (requestLocation && partner.service_regions) {
    const regions = partner.service_regions.map(r => r.toLowerCase());
    if (regions.some(r => requestLocation.toLowerCase().includes(r) || r.includes(requestLocation.toLowerCase()))) {
      score += 5;
      reasons.push(`Serves ${requestLocation}`);
    }
  }

  // Calculate AI confidence (0-1)
  const aiConfidence = Math.min(1, confidenceFactors / 4);

  return {
    score: Math.min(score, 100),
    reasons,
    aiConfidence,
  };
}
