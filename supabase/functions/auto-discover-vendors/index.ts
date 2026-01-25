import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { VendorCategory, VendorEnriched, DiscoveryResult } from "./types.ts";
import { fetchVendorsFromAllSources } from "./fetchers.ts";
import { filterCurated, enrichAndValidate, compliesWith } from "./automation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Main discovery pipeline - matches the clean pattern:
// 1. Fetch from luxury directories
// 2. Auto-filter with business logic
// 3. Enrich with contact/compliance info
// 4. Auto-add compliant vendors to curated list
async function autoDiscoverPartners(categoryFilter?: VendorCategory[]): Promise<VendorEnriched[]> {
  // 1. Fetch from luxury directories
  const rawVendors = await fetchVendorsFromAllSources();
  
  // 2. Auto-filter with business logic (location/reputation/compliance)
  const filtered = rawVendors.filter(filterCurated);
  console.log(`[Discovery] Candidates after filtering: ${filtered.length}`);
  
  // 3. Enrich with contact/compliance info
  const enriched = await Promise.all(filtered.map(enrichAndValidate));
  
  // 4. Apply category filter if specified
  let finalVendors = enriched;
  if (categoryFilter && categoryFilter.length > 0) {
    finalVendors = enriched.filter((v) =>
      v.categories.some((c) => categoryFilter.includes(c))
    );
  }
  
  return finalVendors;
}

// Add compliant vendor to curated list (database)
async function addToCuratedList(
  supabase: any,
  vendor: VendorEnriched
): Promise<void> {
  // Check if vendor already exists
  const { data: existing } = await supabase
    .from("potential_partners")
    .select("id")
    .eq("name", vendor.name)
    .maybeSingle();
  
  if (existing) {
    console.log(`[Discovery] Vendor "${vendor.name}" already in curated list`);
    return;
  }
  
  // Add to potential_partners for review
  const { error } = await supabase.from("potential_partners").insert({
    name: vendor.name,
    website: vendor.website,
    email: vendor.email,
    category: vendor.categories[0] || "experience",
    score: vendor.rating ? Math.round(vendor.rating * 20) : 80,
    source: "auto_discovery",
    metadata: {
      location: vendor.location,
      referenceId: vendor.referenceId,
      complianceNotes: vendor.complianceNotes,
      enrichedAt: vendor.enrichedAt,
    },
  });
  
  if (error) {
    console.error(`[Discovery] Failed to add vendor "${vendor.name}":`, error);
  } else {
    console.log(`[Discovery] Added vendor "${vendor.name}" to curated list`);
  }
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
    let autoAdd = false;
    
    if (req.method === "POST") {
      try {
        const body = await req.json();
        categoryFilter = body.categories;
        autoAdd = body.autoAdd === true;
      } catch {
        // No body or invalid JSON, continue without filter
      }
    }

    console.log("[Discovery] Starting luxury vendor discovery...");
    
    // Run the discovery pipeline
    const vendors = await autoDiscoverPartners(categoryFilter);
    
    // Auto-add compliant vendors to curated list if requested
    if (autoAdd) {
      for (const vendor of vendors) {
        if (compliesWith(vendor, "AureliaLuxuryStandard")) {
          await addToCuratedList(supabase, vendor);
        }
      }
    }

    // Calculate stats
    const categoryCounts: Record<string, number> = {};
    for (const v of vendors) {
      for (const cat of v.categories) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    }
    const compliantCount = vendors.filter((v) => v.compliant).length;

    // Log discovery to database
    await supabase.from("discovery_logs").insert({
      kind: "auto_discover_vendors",
      partners_found: vendors.length,
      metadata: {
        categories: categoryCounts,
        compliantCount,
        filter: categoryFilter,
        autoAdd,
      },
    });

    console.log(`[Discovery] Complete: ${vendors.length} vendors, ${compliantCount} compliant`);

    const result: DiscoveryResult = {
      success: true,
      vendors,
      totalDiscovered: vendors.length,
      totalCompliant: compliantCount,
      categories: categoryCounts,
      discoveredAt: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[Discovery] Auto-discover error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
