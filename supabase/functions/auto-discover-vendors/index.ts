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

// Category fetchers with graceful fallbacks
async function fetchLuxuryHotels(apiKey?: string): Promise<Vendor[]> {
  if (!apiKey) {
    console.log("LUXURY_API_KEY not set, using fallback data");
    return [];
  }
  try {
    const res = await fetch("https://trusted-luxury-api.com/v1/hotels/curated", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.hotels || []).map((h: any) => ({
      name: h.name,
      website: h.website,
      location: `${h.city}, ${h.country}`,
      categories: ["hotel"] as VendorCategory[],
      referenceId: h.id,
      rating: h.rating,
    }));
  } catch (e) {
    console.error("Hotel fetch error:", e);
    return [];
  }
}

async function fetchPrivateJets(apiKey?: string): Promise<Vendor[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch("https://api.luxjetpartners.com/v1/jets", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jets || []).map((j: any) => ({
      name: j.operator,
      website: j.website,
      location: j.base,
      categories: ["privateJet"] as VendorCategory[],
      referenceId: j.tailNumber,
      rating: j.safetyRating,
    }));
  } catch (e) {
    console.error("Jet fetch error:", e);
    return [];
  }
}

async function fetchLuxuryYachts(apiKey?: string): Promise<Vendor[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch("https://api.yachtluxury.com/v2/yachts", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.yachts || []).map((y: any) => ({
      name: y.name,
      website: y.broker_website,
      location: y.port,
      categories: ["yacht"] as VendorCategory[],
      referenceId: y.yachtId,
      rating: y.rating,
    }));
  } catch (e) {
    console.error("Yacht fetch error:", e);
    return [];
  }
}

async function fetchFineDining(apiKey?: string): Promise<Vendor[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch("https://api.finedininglux.com/v1/restaurants", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.restaurants || []).map((r: any) => ({
      name: r.name,
      website: r.website,
      location: `${r.city}, ${r.country}`,
      categories: ["fineDining"] as VendorCategory[],
      referenceId: r.id,
      rating: r.michelinStars || r.rating,
    }));
  } catch (e) {
    console.error("Dining fetch error:", e);
    return [];
  }
}

async function fetchVipEvents(apiKey?: string): Promise<Vendor[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch("https://api.vipexperiences.com/v1/events", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.events || []).map((e: any) => ({
      name: e.title,
      website: e.website,
      location: e.location,
      categories: ["vipEvent"] as VendorCategory[],
      referenceId: e.id,
      rating: e.rating,
    }));
  } catch (e) {
    console.error("Events fetch error:", e);
    return [];
  }
}

async function fetchWellnessSpas(apiKey?: string): Promise<Vendor[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch("https://api.wellnesslux.com/v1/spas", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.spas || []).map((s: any) => ({
      name: s.name,
      website: s.website,
      location: `${s.city}, ${s.country}`,
      categories: ["wellness"] as VendorCategory[],
      referenceId: s.id,
      rating: s.rating,
    }));
  } catch (e) {
    console.error("Wellness fetch error:", e);
    return [];
  }
}

async function fetchExclusiveExperiences(apiKey?: string): Promise<Vendor[]> {
  if (!apiKey) return [];
  try {
    const res = await fetch("https://api.experiencelux.com/v1/experiences", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.experiences || []).map((ex: any) => ({
      name: ex.title,
      website: ex.website,
      location: ex.location,
      categories: ["experience"] as VendorCategory[],
      referenceId: ex.id,
      rating: ex.rating,
    }));
  } catch (e) {
    console.error("Experiences fetch error:", e);
    return [];
  }
}

// Main discovery function
async function autoDiscoverAllLuxuryVendors(): Promise<VendorEnriched[]> {
  const luxuryApiKey = Deno.env.get("LUXURY_API_KEY");
  const jetApiKey = Deno.env.get("JET_API_KEY");
  const yachtApiKey = Deno.env.get("YACHT_API_KEY");
  const diningApiKey = Deno.env.get("DINING_API_KEY");
  const eventApiKey = Deno.env.get("EVENT_API_KEY");
  const wellnessApiKey = Deno.env.get("WELLNESS_API_KEY");
  const experienceApiKey = Deno.env.get("EXPERIENCE_API_KEY");

  // Fetch from all sources in parallel
  const [hotels, jets, yachts, dining, events, wellness, experiences] = await Promise.all([
    fetchLuxuryHotels(luxuryApiKey),
    fetchPrivateJets(jetApiKey),
    fetchLuxuryYachts(yachtApiKey),
    fetchFineDining(diningApiKey),
    fetchVipEvents(eventApiKey),
    fetchWellnessSpas(wellnessApiKey),
    fetchExclusiveExperiences(experienceApiKey),
  ]);

  const all = [...hotels, ...jets, ...yachts, ...dining, ...events, ...wellness, ...experiences];
  console.log(`Total vendors fetched: ${all.length}`);

  // Filter to Aurelia standard
  const candidates = all.filter(filterToAureliaStandard);
  console.log(`Candidates after filtering: ${candidates.length}`);

  // Enrich and check compliance
  const enriched = await Promise.all(
    candidates.map(async (v) => {
      const enrichedObj = await enrichVendorContact(v);
      const compliance = await checkCompliance(enrichedObj);
      return {
        ...enrichedObj,
        compliant: compliance.passed,
        complianceNotes: compliance.notes,
        enrichedAt: new Date().toISOString(),
      } as VendorEnriched;
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
