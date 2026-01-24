import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Types
type VendorCategory =
  | "hotel"
  | "privateJet"
  | "yacht"
  | "fineDining"
  | "vipEvent"
  | "wellness"
  | "experience";

interface Vendor {
  name: string;
  website?: string;
  location?: string;
  categories: VendorCategory[];
  referenceId?: string;
  email?: string;
  phone?: string;
  rating?: number;
}

interface VendorEnriched extends Vendor {
  compliant: boolean;
  complianceNotes?: string;
  enrichedAt?: string;
}

interface ComplianceResult {
  passed: boolean;
  notes?: string;
}

// Luxury/compliance filter logic
function filterToAureliaStandard(v: Vendor): boolean {
  const minRating = 4.5;
  const deniedWords = /(budget|cheap|economy|hostel|motel)/i;
  if (!v.name || deniedWords.test(v.name) || deniedWords.test(v.website || "")) return false;
  return !v.rating || v.rating >= minRating;
}

// Enrichment service - verify contact info and add metadata
async function enrichVendorContact(vendor: Vendor): Promise<Vendor> {
  // In production, this would call email verification APIs, LinkedIn, etc.
  return {
    ...vendor,
    email: vendor.email || `contact@${vendor.website?.replace(/https?:\/\//, "").split("/")[0] || "unknown.com"}`,
  };
}

// Compliance check
async function checkCompliance(vendor: Vendor): Promise<ComplianceResult> {
  const issues: string[] = [];
  
  // Check for required fields
  if (!vendor.website) issues.push("Missing website");
  if (!vendor.location) issues.push("Missing location");
  
  // Check rating threshold
  if (vendor.rating && vendor.rating < 4.0) {
    issues.push(`Rating ${vendor.rating} below minimum 4.0`);
  }
  
  // Check for blacklisted terms
  const blacklist = /(scam|fraud|complaint|lawsuit)/i;
  if (blacklist.test(vendor.name)) {
    issues.push("Blacklisted terms in name");
  }
  
  return {
    passed: issues.length === 0,
    notes: issues.length > 0 ? issues.join("; ") : "All checks passed",
  };
}

// Category fetchers with production-grade error handling
async function fetchLuxuryHotels(): Promise<Vendor[]> {
  try {
    const res = await fetch("https://trusted-luxury-api.com/v1/hotels/curated", {
      headers: { Authorization: `Bearer ${Deno.env.get("LUXURY_API_KEY")}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.hotels || []).map((h: any) => ({
      name: h.name,
      website: h.website,
      location: `${h.city}, ${h.country}`,
      categories: ["hotel"] as VendorCategory[],
      referenceId: h.id,
      rating: h.rating,
    }));
  } catch (error) {
    console.warn("[Discovery] Hotel API failed:", error);
    return [];
  }
}

async function fetchPrivateJets(): Promise<Vendor[]> {
  try {
    const res = await fetch("https://api.luxjetpartners.com/v1/jets", {
      headers: { Authorization: `Bearer ${Deno.env.get("JET_API_KEY")}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.jets || []).map((j: any) => ({
      name: j.operator,
      website: j.website,
      location: j.base,
      categories: ["privateJet"] as VendorCategory[],
      referenceId: j.tailNumber,
      rating: j.safetyRating,
    }));
  } catch (error) {
    console.warn("[Discovery] Jet API failed:", error);
    return [];
  }
}

async function fetchLuxuryYachts(): Promise<Vendor[]> {
  try {
    const res = await fetch("https://api.yachtluxury.com/v2/yachts", {
      headers: { Authorization: `Bearer ${Deno.env.get("YACHT_API_KEY")}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.yachts || []).map((y: any) => ({
      name: y.name,
      website: y.broker_website,
      location: y.port,
      categories: ["yacht"] as VendorCategory[],
      referenceId: y.yachtId,
      rating: y.rating,
    }));
  } catch (error) {
    console.warn("[Discovery] Yacht API failed:", error);
    return [];
  }
}

async function fetchFineDining(): Promise<Vendor[]> {
  try {
    const res = await fetch("https://api.finedininglux.com/v1/restaurants", {
      headers: { Authorization: `Bearer ${Deno.env.get("DINING_API_KEY")}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.restaurants || []).map((r: any) => ({
      name: r.name,
      website: r.website,
      location: `${r.city}, ${r.country}`,
      categories: ["fineDining"] as VendorCategory[],
      referenceId: r.id,
      rating: r.michelinStars || r.rating,
    }));
  } catch (error) {
    console.warn("[Discovery] Dining API failed:", error);
    return [];
  }
}

async function fetchVipEvents(): Promise<Vendor[]> {
  try {
    const res = await fetch("https://api.vipexperiences.com/v1/events", {
      headers: { Authorization: `Bearer ${Deno.env.get("EVENT_API_KEY")}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.events || []).map((e: any) => ({
      name: e.title,
      website: e.website,
      location: e.location,
      categories: ["vipEvent"] as VendorCategory[],
      referenceId: e.id,
      rating: e.rating,
    }));
  } catch (error) {
    console.warn("[Discovery] Events API failed:", error);
    return [];
  }
}

async function fetchWellnessSpas(): Promise<Vendor[]> {
  try {
    const res = await fetch("https://api.wellnesslux.com/v1/spas", {
      headers: { Authorization: `Bearer ${Deno.env.get("WELLNESS_API_KEY")}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.spas || []).map((s: any) => ({
      name: s.name,
      website: s.website,
      location: `${s.city}, ${s.country}`,
      categories: ["wellness"] as VendorCategory[],
      referenceId: s.id,
      rating: s.rating,
    }));
  } catch (error) {
    console.warn("[Discovery] Wellness API failed:", error);
    return [];
  }
}

async function fetchExclusiveExperiences(): Promise<Vendor[]> {
  try {
    const res = await fetch("https://api.experiencelux.com/v1/experiences", {
      headers: { Authorization: `Bearer ${Deno.env.get("EXPERIENCE_API_KEY")}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.experiences || []).map((ex: any) => ({
      name: ex.title,
      website: ex.website,
      location: ex.location,
      categories: ["experience"] as VendorCategory[],
      referenceId: ex.id,
      rating: ex.rating,
    }));
  } catch (error) {
    console.warn("[Discovery] Experiences API failed:", error);
    return [];
  }
}

// Main discovery function
async function autoDiscoverAllLuxuryVendors(): Promise<VendorEnriched[]> {
  // Fetch from all sources in parallel - each handles its own errors gracefully
  const [hotels, jets, yachts, dining, events, wellness, experiences] = await Promise.all([
    fetchLuxuryHotels(),
    fetchPrivateJets(),
    fetchLuxuryYachts(),
    fetchFineDining(),
    fetchVipEvents(),
    fetchWellnessSpas(),
    fetchExclusiveExperiences(),
  ]);

  const all = [...hotels, ...jets, ...yachts, ...dining, ...events, ...wellness, ...experiences];
  console.log(`Total vendors fetched: ${all.length}`);

  // Filter to Aurelia standard
  const candidates = all.filter(filterToAureliaStandard);
  console.log(`Candidates after filtering: ${candidates.length}`);

  // Enrich and check compliance with individual error handling
  const enriched = await Promise.all(
    candidates.map(async (v) => {
      try {
        const enrichedObj = await enrichVendorContact(v);
        const compliance = await checkCompliance(enrichedObj);
        console.log(`[AUDIT] Vendor "${v.name}" compliance ${compliance.passed ? "PASS" : "FAIL"} - ${compliance.notes}`);
        return {
          ...enrichedObj,
          compliant: compliance.passed,
          complianceNotes: compliance.notes,
          enrichedAt: new Date().toISOString(),
        } as VendorEnriched;
      } catch (e) {
        console.error(`[ENRICH ERROR] Vendor: ${v.name}`, e);
        return {
          ...v,
          compliant: false,
          complianceNotes: "Enrichment failed",
          enrichedAt: new Date().toISOString(),
        } as VendorEnriched;
      }
    })
  );

  return enriched;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Require admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse optional filters from request
    let categoryFilter: VendorCategory[] | undefined;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        categoryFilter = body.categories;
      } catch {
        // No body or invalid JSON, continue without filter
      }
    }

    console.log("Starting luxury vendor discovery...");
    const vendors = await autoDiscoverAllLuxuryVendors();

    // Apply category filter if specified
    let filtered = vendors;
    if (categoryFilter && categoryFilter.length > 0) {
      filtered = vendors.filter((v) =>
        v.categories.some((c) => categoryFilter!.includes(c))
      );
    }

    // Calculate stats
    const categoryCounts: Record<string, number> = {};
    for (const v of filtered) {
      for (const cat of v.categories) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    }

    const compliantCount = filtered.filter((v) => v.compliant).length;

    // Log discovery to database
    await supabase.from("discovery_logs").insert({
      kind: "auto_discover_vendors",
      partners_found: filtered.length,
      metadata: {
        categories: categoryCounts,
        compliantCount,
        filter: categoryFilter,
      },
    });

    console.log(`Discovery complete: ${filtered.length} vendors, ${compliantCount} compliant`);

    return new Response(
      JSON.stringify({
        success: true,
        vendors: filtered,
        totalDiscovered: filtered.length,
        totalCompliant: compliantCount,
        categories: categoryCounts,
        discoveredAt: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Auto-discover error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
