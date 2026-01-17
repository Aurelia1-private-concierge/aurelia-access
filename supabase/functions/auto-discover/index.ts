import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PARTNER_CATEGORIES = [
  "aviation", "yacht", "hospitality", "dining", "events",
  "security", "real_estate", "automotive", "wellness", "art_collectibles"
];

const SEARCH_QUERIES: Record<string, string[]> = {
  aviation: [
    "luxury private jet charter company",
    "VIP aviation services",
    "executive aircraft management"
  ],
  yacht: [
    "luxury yacht charter company",
    "superyacht broker",
    "mega yacht rental services"
  ],
  hospitality: [
    "luxury hotel management company",
    "five star resort operator",
    "exclusive villa rental"
  ],
  dining: [
    "Michelin star restaurant group",
    "private chef services luxury",
    "exclusive dining experiences"
  ],
  events: [
    "luxury event planning company",
    "VIP access entertainment",
    "exclusive experiences provider"
  ],
  security: [
    "executive protection services",
    "luxury security company",
    "VIP close protection"
  ],
  real_estate: [
    "luxury real estate agency",
    "exclusive property broker",
    "high-end property management"
  ],
  automotive: [
    "luxury car rental company",
    "exotic car dealership",
    "collector car broker"
  ],
  wellness: [
    "luxury spa resort",
    "exclusive wellness retreat",
    "VIP medical concierge"
  ],
  art_collectibles: [
    "fine art gallery",
    "luxury auction house",
    "collectibles broker"
  ]
};

const USER_SEARCH_QUERIES = [
  "UHNW individuals list",
  "luxury lifestyle influencers",
  "high net worth executives",
  "family office principals"
];

interface DiscoveredPartner {
  company_name: string;
  website?: string;
  category: string;
  subcategory?: string;
  contact_email?: string;
  description?: string;
  score: number;
  source: string;
  metadata?: Record<string, unknown>;
}

interface DiscoveredUser {
  full_name?: string;
  email?: string;
  company?: string;
  title?: string;
  linkedin_url?: string;
  source: string;
  score: number;
  interests?: string[];
  estimated_net_worth?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { 
      mode = "both", // "partners", "users", or "both"
      categories = PARTNER_CATEGORIES,
      limit = 10,
      dryRun = false 
    } = body;

    console.log(`[auto-discover] Starting discovery - mode: ${mode}, categories: ${categories.join(", ")}`);

    const results = {
      partners: [] as DiscoveredPartner[],
      users: [] as DiscoveredUser[],
      errors: [] as string[],
      stats: {
        partnersDiscovered: 0,
        usersDiscovered: 0,
        partnersInserted: 0,
        usersInserted: 0
      }
    };

    // Discover partners
    if (mode === "partners" || mode === "both") {
      for (const category of categories) {
        if (!SEARCH_QUERIES[category]) continue;

        for (const query of SEARCH_QUERIES[category].slice(0, 1)) { // Limit queries per category
          try {
            const discovered = await discoverPartnersFromWeb(
              query, 
              category, 
              firecrawlKey, 
              openaiKey,
              limit
            );
            
            results.partners.push(...discovered);
            results.stats.partnersDiscovered += discovered.length;

            if (!dryRun && discovered.length > 0) {
              const { error } = await supabase
                .from("potential_partners")
                .upsert(
                  discovered.map(p => ({
                    company_name: p.company_name,
                    website: p.website,
                    category: p.category,
                    subcategory: p.subcategory,
                    contact_email: p.contact_email,
                    description: p.description,
                    score: p.score,
                    source: p.source,
                    metadata: p.metadata,
                    status: "new"
                  })),
                  { onConflict: "company_name,category" }
                );

              if (error) {
                console.error(`[auto-discover] Insert error for ${category}:`, error);
                results.errors.push(`Failed to insert ${category} partners: ${error.message}`);
              } else {
                results.stats.partnersInserted += discovered.length;
              }
            }
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error(`[auto-discover] Discovery error for ${category}:`, errorMsg);
            results.errors.push(`${category}: ${errorMsg}`);
          }
        }
      }
    }

    // Discover potential users
    if (mode === "users" || mode === "both") {
      for (const query of USER_SEARCH_QUERIES.slice(0, 2)) {
        try {
          const discovered = await discoverUsersFromWeb(
            query,
            firecrawlKey,
            openaiKey,
            limit
          );

          results.users.push(...discovered);
          results.stats.usersDiscovered += discovered.length;

          if (!dryRun && discovered.length > 0) {
            // Filter out users without email
            const validUsers = discovered.filter(u => u.email);
            
            if (validUsers.length > 0) {
              const { error } = await supabase
                .from("potential_users")
                .upsert(
                  validUsers.map(u => ({
                    full_name: u.full_name,
                    email: u.email,
                    company: u.company,
                    title: u.title,
                    linkedin_url: u.linkedin_url,
                    source: u.source,
                    score: u.score,
                    interests: u.interests,
                    estimated_net_worth: u.estimated_net_worth,
                    metadata: u.metadata,
                    status: "new"
                  })),
                  { onConflict: "email" }
                );

              if (error) {
                console.error(`[auto-discover] User insert error:`, error);
                results.errors.push(`Failed to insert users: ${error.message}`);
              } else {
                results.stats.usersInserted += validUsers.length;
              }
            }
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error(`[auto-discover] User discovery error:`, errorMsg);
          results.errors.push(`users: ${errorMsg}`);
        }
      }
    }

    // Log the discovery run
    await supabase.from("discovery_logs").insert({
      kind: mode,
      source: "auto-discover",
      partners_found: results.stats.partnersDiscovered,
      users_found: results.stats.usersDiscovered,
      error: results.errors.length > 0 ? results.errors.join("; ") : null,
      metadata: {
        categories,
        dryRun,
        partnersInserted: results.stats.partnersInserted,
        usersInserted: results.stats.usersInserted
      }
    });

    console.log(`[auto-discover] Complete - Partners: ${results.stats.partnersInserted}, Users: ${results.stats.usersInserted}`);

    return new Response(JSON.stringify({
      success: true,
      ...results.stats,
      errors: results.errors,
      preview: dryRun ? { partners: results.partners.slice(0, 5), users: results.users.slice(0, 5) } : undefined
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[auto-discover] Fatal error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

// Helper function to discover partners from web search
async function discoverPartnersFromWeb(
  query: string,
  category: string,
  firecrawlKey?: string,
  openaiKey?: string,
  limit: number = 10
): Promise<DiscoveredPartner[]> {
  const partners: DiscoveredPartner[] = [];

  // If we have Firecrawl, use it for web search
  if (firecrawlKey) {
    try {
      const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: `${query} contact email`,
          limit: limit
        })
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const results = searchData.data || [];

        for (const result of results) {
          // Extract company info from search result
          const partner: DiscoveredPartner = {
            company_name: extractCompanyName(result.title || result.url),
            website: result.url,
            category,
            description: result.description || result.content?.substring(0, 500),
            score: calculatePartnerScore(result),
            source: "firecrawl",
            contact_email: extractEmail(result.content || result.description || ""),
            metadata: {
              searchQuery: query,
              originalTitle: result.title
            }
          };

          if (partner.company_name && partner.company_name !== "Unknown") {
            partners.push(partner);
          }
        }
      }
    } catch (err) {
      console.error("[discoverPartnersFromWeb] Firecrawl error:", err);
    }
  }

  // If we have OpenAI, enhance the results
  if (openaiKey && partners.length > 0) {
    try {
      const enhancedPartners = await enhanceWithAI(partners, openaiKey);
      return enhancedPartners;
    } catch (err) {
      console.error("[discoverPartnersFromWeb] AI enhancement error:", err);
    }
  }

  // Fallback: Generate mock data for testing
  if (partners.length === 0) {
    partners.push(...generateMockPartners(category, limit));
  }

  return partners;
}

// Helper function to discover users from web
async function discoverUsersFromWeb(
  query: string,
  firecrawlKey?: string,
  openaiKey?: string,
  limit: number = 10
): Promise<DiscoveredUser[]> {
  const users: DiscoveredUser[] = [];

  if (firecrawlKey) {
    try {
      const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: query,
          limit: limit
        })
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const results = searchData.data || [];

        for (const result of results) {
          const user: DiscoveredUser = {
            full_name: extractPersonName(result.title || ""),
            company: extractCompanyFromContent(result.content || result.description || ""),
            linkedin_url: result.url?.includes("linkedin") ? result.url : undefined,
            source: "firecrawl",
            score: calculateUserScore(result),
            metadata: {
              searchQuery: query,
              originalContent: result.description
            }
          };

          if (user.full_name) {
            users.push(user);
          }
        }
      }
    } catch (err) {
      console.error("[discoverUsersFromWeb] Firecrawl error:", err);
    }
  }

  // Fallback: Generate mock data for testing
  if (users.length === 0) {
    users.push(...generateMockUsers(limit));
  }

  return users;
}

// Utility functions
function extractCompanyName(text: string): string {
  if (!text) return "Unknown";
  
  // Remove common URL parts
  let cleaned = text
    .replace(/https?:\/\/(www\.)?/gi, "")
    .replace(/\.(com|org|net|io|co).*$/gi, "")
    .replace(/[-_]/g, " ")
    .trim();

  // Capitalize words
  cleaned = cleaned
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return cleaned || "Unknown";
}

function extractEmail(text: string): string | undefined {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);
  
  if (matches) {
    // Filter out common invalid patterns
    const validEmails = matches.filter(email => 
      !email.includes("example.com") &&
      !email.includes("test.com") &&
      !email.startsWith("noreply") &&
      !email.startsWith("no-reply")
    );
    return validEmails[0];
  }
  return undefined;
}

function extractPersonName(text: string): string | undefined {
  // Simple heuristic: look for capitalized words pattern
  const namePattern = /([A-Z][a-z]+\s+[A-Z][a-z]+)/;
  const match = text.match(namePattern);
  return match ? match[1] : undefined;
}

function extractCompanyFromContent(content: string): string | undefined {
  // Look for common patterns like "CEO of Company" or "at Company"
  const patterns = [
    /(?:CEO|CFO|Founder|President|Director)\s+(?:of|at)\s+([A-Z][A-Za-z\s&]+)/i,
    /(?:at|with)\s+([A-Z][A-Za-z\s&]+(?:Inc|LLC|Ltd|Corp)?)/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return match[1].trim();
  }
  return undefined;
}

function calculatePartnerScore(result: Record<string, unknown>): number {
  let score = 50; // Base score

  // Boost for having contact info
  if (result.content && typeof result.content === "string") {
    if (result.content.includes("@")) score += 15;
    if (result.content.includes("phone") || result.content.includes("contact")) score += 10;
  }

  // Boost for relevant keywords
  const keywords = ["luxury", "vip", "exclusive", "premier", "elite", "bespoke"];
  const title = (result.title as string || "").toLowerCase();
  for (const keyword of keywords) {
    if (title.includes(keyword)) score += 5;
  }

  return Math.min(score, 100);
}

function calculateUserScore(result: Record<string, unknown>): number {
  let score = 40;

  // Boost for LinkedIn profiles
  if ((result.url as string || "").includes("linkedin")) score += 20;

  // Boost for executive titles
  const content = (result.content as string || result.description as string || "").toLowerCase();
  const executiveTitles = ["ceo", "cfo", "founder", "president", "chairman", "director"];
  for (const title of executiveTitles) {
    if (content.includes(title)) score += 10;
  }

  return Math.min(score, 100);
}

async function enhanceWithAI(
  partners: DiscoveredPartner[],
  openaiKey: string
): Promise<DiscoveredPartner[]> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are a business analyst. For each company, estimate their quality score (0-100) based on luxury service fit."
        }, {
          role: "user",
          content: `Rate these companies for luxury concierge partnership potential:\n${partners.map(p => `- ${p.company_name}: ${p.description || "No description"}`).join("\n")}`
        }],
        max_tokens: 500
      })
    });

    if (response.ok) {
      // Parse AI response and update scores
      // For now, just return original partners
      return partners;
    }
  } catch (err) {
    console.error("[enhanceWithAI] Error:", err);
  }
  return partners;
}

// Mock data generators for testing
function generateMockPartners(category: string, limit: number): DiscoveredPartner[] {
  const mockCompanies: Record<string, string[]> = {
    aviation: ["SkyLux Jets", "Elite Air Charter", "Prestige Aviation"],
    yacht: ["Azure Yachts", "Monaco Charter Co", "Riviera Sailing"],
    hospitality: ["Grand Luxury Hotels", "Elite Resorts Group", "Platinum Stays"],
    dining: ["Gastronomie Elite", "Private Chef Network", "Culinary Masters"],
    events: ["Luxe Events Co", "VIP Access Group", "Premier Experiences"],
    security: ["Elite Protection Services", "Guardian Security", "Apex Protection"],
    real_estate: ["Prestige Properties", "Luxury Estates Intl", "Prime Realty"],
    automotive: ["Exotic Motors", "Luxury Auto Rentals", "Elite Driving Club"],
    wellness: ["Tranquil Retreats", "Wellness Elite", "Vitality Spas"],
    art_collectibles: ["Fine Art Partners", "Heritage Auctions", "Collector's Circle"]
  };

  const companies = mockCompanies[category] || ["Sample Company"];
  
  return companies.slice(0, limit).map((name, i) => ({
    company_name: name,
    category,
    score: 70 + Math.floor(Math.random() * 25),
    source: "mock_data",
    description: `Leading ${category} service provider`,
    metadata: { mock: true }
  }));
}

function generateMockUsers(limit: number): DiscoveredUser[] {
  const mockUsers = [
    { name: "James Wellington", company: "Wellington Capital", title: "CEO" },
    { name: "Sarah Blackwood", company: "Blackwood Ventures", title: "Founder" },
    { name: "Michael Sterling", company: "Sterling Industries", title: "Chairman" }
  ];

  return mockUsers.slice(0, limit).map(u => ({
    full_name: u.name,
    company: u.company,
    title: u.title,
    source: "mock_data",
    score: 60 + Math.floor(Math.random() * 30),
    metadata: { mock: true }
  }));
}
