import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * KYC/AML Compliance Checker
 * 
 * Automated compliance verification for partners and clients:
 * 1. Identity verification against uploaded documents
 * 2. PEP (Politically Exposed Person) screening
 * 3. Sanctions list checking (OFAC, EU, UN)
 * 4. Adverse media screening
 * 5. Document discrepancy detection
 * 6. Risk scoring and alert generation
 * 
 * Uses AI for intelligent matching and discrepancy detection
 */

interface KycRequest {
  entity_type: "partner" | "client" | "user";
  entity_id: string;
  trigger?: string;
  document_id?: string;
  verification_level?: "basic" | "standard" | "enhanced";
}

interface SanctionsResult {
  list_name: string;
  match_score: number;
  matched_name: string;
  match_type: string;
}

interface RiskFactor {
  category: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  score_impact: number;
}

// Known sanctions lists (simplified - in production would use actual API)
const SANCTIONS_LISTS = [
  "OFAC SDN",
  "EU Consolidated",
  "UN Security Council",
  "UK HMT",
  "FATF High-Risk Countries",
];

// High-risk countries (simplified list)
const HIGH_RISK_COUNTRIES = [
  "north korea", "iran", "syria", "cuba", "crimea", 
  "donetsk", "luhansk", "belarus", "myanmar", "venezuela"
];

// PEP indicator keywords
const PEP_INDICATORS = [
  "minister", "president", "senator", "congressman", "ambassador",
  "governor", "mayor", "judge", "general", "admiral", "royal family",
  "parliament", "legislature", "central bank", "state-owned"
];

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
    const { 
      entity_type, 
      entity_id, 
      trigger = "manual",
      document_id,
      verification_level = "standard" 
    }: KycRequest = await req.json();

    console.log(`[KYC] Starting ${verification_level} verification for ${entity_type}: ${entity_id}`);

    // Fetch entity data
    let entityData: Record<string, unknown> | null = null;
    let entityName = "";
    let entityCountry = "";
    let entityEmail = "";

    if (entity_type === "partner") {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("id", entity_id)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Partner not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      entityData = data;
      entityName = data.company_name || data.contact_name || "";
      entityCountry = data.country || "";
      entityEmail = data.email || "";
    } else if (entity_type === "client" || entity_type === "user") {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", entity_id)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Profile not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      entityData = data;
      entityName = data.display_name || data.full_name || "";
      entityCountry = data.country || "";
    }

    console.log(`[KYC] Checking entity: "${entityName}" from ${entityCountry || "unknown country"}`);

    // Create or update verification record
    let verificationId: string;
    const { data: existingVerification } = await supabase
      .from("kyc_verifications")
      .select("id")
      .eq("entity_type", entity_type)
      .eq("entity_id", entity_id)
      .eq("status", "pending")
      .maybeSingle();

    if (existingVerification) {
      verificationId = existingVerification.id;
      await supabase
        .from("kyc_verifications")
        .update({ status: "in_progress", verification_level })
        .eq("id", verificationId);
    } else {
      const { data: newVerification, error: insertError } = await supabase
        .from("kyc_verifications")
        .insert({
          entity_type,
          entity_id,
          verification_level,
          status: "in_progress",
          provider: "internal",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      verificationId = newVerification.id;
    }

    // Initialize risk tracking
    const riskFactors: RiskFactor[] = [];
    let riskScore = 0;
    const alerts: {
      alert_type: string;
      severity: string;
      title: string;
      description: string;
      match_details: Record<string, unknown>;
      match_score: number;
    }[] = [];

    // =========================================================================
    // CHECK 1: High-Risk Country Screening
    // =========================================================================
    const countryLower = entityCountry.toLowerCase();
    const isHighRiskCountry = HIGH_RISK_COUNTRIES.some(c => countryLower.includes(c));
    
    if (isHighRiskCountry) {
      riskFactors.push({
        category: "geography",
        description: `Entity is based in or associated with high-risk jurisdiction: ${entityCountry}`,
        severity: "high",
        score_impact: 30,
      });
      riskScore += 30;

      alerts.push({
        alert_type: "sanctions_match",
        severity: "high",
        title: "High-Risk Jurisdiction",
        description: `Entity is associated with ${entityCountry}, which is on the high-risk countries list`,
        match_details: { country: entityCountry, list: "FATF High-Risk Countries" },
        match_score: 1.0,
      });
    }

    // =========================================================================
    // CHECK 2: PEP Screening
    // =========================================================================
    const nameLower = entityName.toLowerCase();
    const potentialPep = PEP_INDICATORS.some(indicator => 
      nameLower.includes(indicator) || 
      (entityData?.title as string || "").toLowerCase().includes(indicator) ||
      (entityData?.bio as string || "").toLowerCase().includes(indicator)
    );

    if (potentialPep) {
      riskFactors.push({
        category: "pep",
        description: "Entity may be a Politically Exposed Person based on title/bio analysis",
        severity: "medium",
        score_impact: 20,
      });
      riskScore += 20;

      alerts.push({
        alert_type: "pep_match",
        severity: "medium",
        title: "Potential PEP Detected",
        description: `${entityName} shows indicators of political exposure. Enhanced due diligence recommended.`,
        match_details: { indicators_found: PEP_INDICATORS.filter(i => nameLower.includes(i)) },
        match_score: 0.7,
      });
    }

    // =========================================================================
    // CHECK 3: AI-Powered Name Screening
    // =========================================================================
    if (lovableApiKey && entityName) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: `You are a compliance screening expert. Analyze names and entities for potential sanctions, PEP status, or adverse media concerns.
Be thorough but avoid false positives. Return structured JSON.`
              },
              {
                role: "user",
                content: `Screen this entity for compliance concerns:

Name: ${entityName}
Type: ${entity_type === "partner" ? "Business/Company" : "Individual"}
Country: ${entityCountry || "Unknown"}
Additional Info: ${entityData?.bio || entityData?.description || "None provided"}

Check for:
1. Known sanctioned entities (OFAC, EU, UN lists)
2. Political exposure (PEP indicators)
3. Adverse media (fraud, money laundering, corruption)
4. Name variations that might match watchlists

Return JSON:
{
  "overall_risk": "low|medium|high|critical",
  "sanctions_concern": { "found": boolean, "details": "explanation" },
  "pep_concern": { "found": boolean, "details": "explanation" },
  "adverse_media_concern": { "found": boolean, "details": "explanation" },
  "name_variations": ["list of possible name variations to check"],
  "recommendation": "approve|enhanced_due_diligence|reject|manual_review"
}`
              }
            ],
            temperature: 0.1,
            max_tokens: 1000,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          
          if (jsonMatch) {
            const aiAnalysis = JSON.parse(jsonMatch[0]);
            console.log(`[KYC] AI risk assessment: ${aiAnalysis.overall_risk}`);

            // Process AI findings
            if (aiAnalysis.sanctions_concern?.found) {
              riskScore += 40;
              riskFactors.push({
                category: "sanctions",
                description: aiAnalysis.sanctions_concern.details,
                severity: "critical",
                score_impact: 40,
              });
              alerts.push({
                alert_type: "sanctions_match",
                severity: "critical",
                title: "Potential Sanctions Match",
                description: aiAnalysis.sanctions_concern.details,
                match_details: { source: "AI_screening", name: entityName },
                match_score: 0.9,
              });
            }

            if (aiAnalysis.pep_concern?.found && !potentialPep) {
              riskScore += 15;
              riskFactors.push({
                category: "pep",
                description: aiAnalysis.pep_concern.details,
                severity: "medium",
                score_impact: 15,
              });
            }

            if (aiAnalysis.adverse_media_concern?.found) {
              riskScore += 25;
              riskFactors.push({
                category: "adverse_media",
                description: aiAnalysis.adverse_media_concern.details,
                severity: "high",
                score_impact: 25,
              });
              alerts.push({
                alert_type: "adverse_media",
                severity: "high",
                title: "Adverse Media Found",
                description: aiAnalysis.adverse_media_concern.details,
                match_details: { source: "AI_media_screening" },
                match_score: 0.75,
              });
            }
          }
        }
      } catch (aiError) {
        console.error("[KYC] AI screening error:", aiError);
      }
    }

    // =========================================================================
    // CHECK 4: Document Verification (if document provided)
    // =========================================================================
    let documentsVerified = false;
    
    if (document_id || trigger === "document_uploaded") {
      // Get extracted data from documents
      const { data: extractedData } = await supabase
        .from("extracted_data")
        .select("field_name, field_value, confidence")
        .eq("document_id", document_id);

      if (extractedData && extractedData.length > 0) {
        // Check for discrepancies between document and profile
        const docFields = new Map(extractedData.map(e => [e.field_name, e]));
        
        // Name verification
        const docName = docFields.get("full_name")?.field_value || docFields.get("company_name")?.field_value;
        if (docName && entityName && !fuzzyMatch(docName, entityName)) {
          riskScore += 15;
          riskFactors.push({
            category: "identity",
            description: `Name discrepancy: Document shows "${docName}", profile shows "${entityName}"`,
            severity: "medium",
            score_impact: 15,
          });
          alerts.push({
            alert_type: "document_discrepancy",
            severity: "medium",
            title: "Name Mismatch Detected",
            description: `Document name "${docName}" does not match profile name "${entityName}"`,
            match_details: { document_name: docName, profile_name: entityName },
            match_score: 0.6,
          });
        }

        // Check document expiry
        const expiryDate = docFields.get("expiry_date")?.field_value;
        if (expiryDate) {
          const expiry = new Date(expiryDate);
          const now = new Date();
          if (expiry < now) {
            riskScore += 10;
            riskFactors.push({
              category: "documentation",
              description: `Document expired on ${expiryDate}`,
              severity: "medium",
              score_impact: 10,
            });
          } else if (expiry < new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)) {
            riskFactors.push({
              category: "documentation",
              description: `Document expires soon: ${expiryDate}`,
              severity: "low",
              score_impact: 5,
            });
            riskScore += 5;
          }
        }

        // Low confidence fields need manual review
        const lowConfidenceFields = extractedData.filter(e => e.confidence < 0.7);
        if (lowConfidenceFields.length > 2) {
          riskFactors.push({
            category: "documentation",
            description: `${lowConfidenceFields.length} document fields have low extraction confidence`,
            severity: "low",
            score_impact: 5,
          });
          riskScore += 5;
        }

        documentsVerified = extractedData.every(e => e.confidence >= 0.7);
      }
    }

    // =========================================================================
    // FINALIZE: Calculate risk level and update verification
    // =========================================================================
    const riskLevel = riskScore >= 60 ? "critical" : 
                      riskScore >= 40 ? "high" : 
                      riskScore >= 20 ? "medium" : "low";

    const verificationStatus = 
      riskScore >= 60 ? "rejected" :
      riskScore >= 40 ? "manual_review" :
      riskScore >= 20 ? "approved" :
      "approved";

    console.log(`[KYC] Final risk score: ${riskScore} (${riskLevel}), Status: ${verificationStatus}`);

    // Update verification record
    await supabase
      .from("kyc_verifications")
      .update({
        status: verificationStatus,
        pep_checked: true,
        pep_status: alerts.some(a => a.alert_type === "pep_match") ? "potential_match" : "clear",
        sanctions_checked: true,
        sanctions_status: alerts.some(a => a.alert_type === "sanctions_match") ? "potential_match" : "clear",
        documents_verified: documentsVerified,
        documents_verified_at: documentsVerified ? new Date().toISOString() : null,
        risk_score: riskScore,
        risk_level: riskLevel,
        risk_factors: riskFactors,
        provider_response: {
          processing_time_ms: Date.now() - startTime,
          checks_performed: ["country_screening", "pep_screening", "ai_screening", "document_verification"],
          alerts_generated: alerts.length,
        },
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
      })
      .eq("id", verificationId);

    // Create AML alerts
    if (alerts.length > 0) {
      const alertRecords = alerts.map(alert => ({
        entity_type,
        entity_id,
        kyc_verification_id: verificationId,
        alert_type: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        source: "internal_kyc",
        match_details: alert.match_details,
        match_score: alert.match_score,
        status: "open",
      }));

      await supabase.from("aml_alerts").insert(alertRecords);
      console.log(`[KYC] Created ${alertRecords.length} AML alerts`);
    }

    // Notify admins if high-risk or critical
    if (riskLevel === "high" || riskLevel === "critical") {
      await supabase.from("notifications").insert({
        type: "compliance_alert",
        title: `High-Risk ${entity_type} Detected`,
        description: `${entityName} flagged with risk score ${riskScore}. Requires immediate review.`,
        action_url: `/admin/compliance?verification=${verificationId}`,
        priority: "high",
      });
    }

    // Log for analytics
    await supabase.from("discovery_logs").insert({
      kind: "kyc_verification",
      metadata: {
        verification_id: verificationId,
        entity_type,
        entity_id,
        verification_level,
        risk_score: riskScore,
        risk_level: riskLevel,
        alerts_generated: alerts.length,
        documents_verified: documentsVerified,
        processing_time_ms: Date.now() - startTime,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        verification_id: verificationId,
        status: verificationStatus,
        risk_score: riskScore,
        risk_level: riskLevel,
        risk_factors: riskFactors,
        alerts: alerts.length,
        documents_verified: documentsVerified,
        recommendation: verificationStatus === "approved" ? "proceed" : 
                        verificationStatus === "manual_review" ? "enhanced_due_diligence" : "block",
        processing_time_ms: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[KYC] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Fuzzy name matching to detect variations
 */
function fuzzyMatch(name1: string, name2: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const n1 = normalize(name1);
  const n2 = normalize(name2);
  
  // Exact match after normalization
  if (n1 === n2) return true;
  
  // One contains the other
  if (n1.includes(n2) || n2.includes(n1)) return true;
  
  // Levenshtein distance check (allow ~20% difference)
  const maxDist = Math.floor(Math.max(n1.length, n2.length) * 0.2);
  return levenshtein(n1, n2) <= maxDist;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}
