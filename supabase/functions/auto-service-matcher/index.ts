import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserContext {
  profile: {
    id: string;
    display_name: string | null;
    company: string | null;
    timezone: string | null;
  };
  recentRequests: Array<{
    category: string;
    title: string;
    created_at: string;
  }>;
  preferences: Record<string, unknown>;
}

interface ServiceRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  reason: string;
  confidence: number;
  suggestedBudget?: { min: number; max: number };
  urgency: 'low' | 'medium' | 'high';
  actionLabel: string;
}

// Service catalog with intelligent matching criteria (aligned with service_category enum)
const SERVICE_CATALOG = [
  {
    category: 'private_aviation',
    services: [
      { title: 'Private Jet Charter', description: 'Door-to-door luxury air travel', keywords: ['travel', 'flight', 'jet', 'aviation'] },
      { title: 'Helicopter Transfer', description: 'Swift city-to-city or airport transfers', keywords: ['helicopter', 'transfer', 'airport'] },
      { title: 'Aircraft Management', description: 'Complete management of your private aircraft', keywords: ['aircraft', 'ownership', 'management'] },
    ]
  },
  {
    category: 'yacht_charter',
    services: [
      { title: 'Yacht Charter', description: 'Luxury yacht experiences worldwide', keywords: ['yacht', 'boat', 'sailing', 'cruise', 'sea'] },
      { title: 'Superyacht Events', description: 'Host exclusive events aboard luxury vessels', keywords: ['event', 'party', 'celebration', 'yacht'] },
    ]
  },
  {
    category: 'travel',
    services: [
      { title: 'Bespoke Travel Planning', description: 'Curated luxury itineraries worldwide', keywords: ['travel', 'vacation', 'trip', 'holiday'] },
      { title: 'Hotel & Resort Booking', description: 'Access to the world\'s finest accommodations', keywords: ['hotel', 'resort', 'stay', 'accommodation'] },
      { title: 'VIP Airport Services', description: 'Fast-track, lounge access, and meet-and-greet', keywords: ['airport', 'lounge', 'vip', 'transfer'] },
    ]
  },
  {
    category: 'dining',
    services: [
      { title: 'Restaurant Reservations', description: 'Priority access to sought-after establishments', keywords: ['restaurant', 'dining', 'food', 'reservation'] },
      { title: 'Private Chef Experience', description: 'In-home culinary experiences', keywords: ['chef', 'cooking', 'private', 'dinner'] },
      { title: 'Wine & Spirits Procurement', description: 'Rare wines and exclusive spirits sourcing', keywords: ['wine', 'spirits', 'cellar', 'collection'] },
    ]
  },
  {
    category: 'events_access',
    services: [
      { title: 'Event Planning', description: 'Full-service luxury event coordination', keywords: ['event', 'party', 'celebration', 'wedding'] },
      { title: 'Exclusive Access', description: 'VIP tickets to sold-out events', keywords: ['tickets', 'concert', 'show', 'sports', 'access'] },
      { title: 'Venue Sourcing', description: 'Unique locations for private gatherings', keywords: ['venue', 'location', 'space', 'private'] },
    ]
  },
  {
    category: 'wellness',
    services: [
      { title: 'Spa & Wellness Retreat', description: 'World-class wellness experiences', keywords: ['spa', 'wellness', 'retreat', 'health', 'relax'] },
      { title: 'Personal Training', description: 'Elite fitness and wellness coaching', keywords: ['fitness', 'training', 'gym', 'health'] },
      { title: 'Medical Concierge', description: 'Access to top medical specialists', keywords: ['doctor', 'medical', 'health', 'specialist'] },
    ]
  },
  {
    category: 'real_estate',
    services: [
      { title: 'Property Search', description: 'Exclusive real estate opportunities', keywords: ['property', 'home', 'house', 'apartment', 'estate'] },
      { title: 'Rental & Lease', description: 'Luxury short and long-term rentals', keywords: ['rental', 'lease', 'accommodation'] },
      { title: 'Property Management', description: 'Comprehensive estate management', keywords: ['management', 'maintenance', 'property'] },
    ]
  },
  {
    category: 'security',
    services: [
      { title: 'Executive Protection', description: 'Discreet personal security services', keywords: ['security', 'protection', 'bodyguard', 'safety'] },
      { title: 'Secure Transport', description: 'Armored vehicles and secure logistics', keywords: ['transport', 'secure', 'vehicle', 'driver'] },
    ]
  },
  {
    category: 'chauffeur',
    services: [
      { title: 'Luxury Car Rental', description: 'Exotic and luxury vehicle rentals', keywords: ['car', 'rental', 'vehicle', 'drive'] },
      { title: 'Vehicle Acquisition', description: 'Sourcing rare and collector automobiles', keywords: ['car', 'purchase', 'collector', 'acquisition'] },
      { title: 'Chauffeur Services', description: 'Professional driving services', keywords: ['chauffeur', 'driver', 'transport'] },
    ]
  },
  {
    category: 'collectibles',
    services: [
      { title: 'Art Acquisition', description: 'Source fine art and collectibles', keywords: ['art', 'painting', 'sculpture', 'collection'] },
      { title: 'Watch & Jewelry', description: 'Rare timepieces and fine jewelry', keywords: ['watch', 'jewelry', 'luxury', 'rolex', 'patek'] },
      { title: 'Auction Representation', description: 'Bidding on your behalf at major auctions', keywords: ['auction', 'bid', 'sotheby', 'christie'] },
    ]
  },
  {
    category: 'shopping',
    services: [
      { title: 'Personal Shopping', description: 'Expert shopping assistance for luxury goods', keywords: ['shopping', 'fashion', 'luxury', 'style'] },
      { title: 'Gift Sourcing', description: 'Find the perfect gift for any occasion', keywords: ['gift', 'present', 'special', 'occasion'] },
    ]
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { limit = 5, refresh = false } = await req.json().catch(() => ({}));

    console.log(`[auto-service-matcher] Processing for user: ${user.id}, limit: ${limit}`);

    // Gather user context
    const [profileResult, recentRequestsResult, preferencesResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("service_requests").select("category, title, created_at").eq("client_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("member_preferences").select("*").eq("user_id", user.id).single(),
    ]);

    const userContext: UserContext = {
      profile: profileResult.data || { id: user.id, display_name: null, company: null, timezone: null },
      recentRequests: recentRequestsResult.data || [],
      preferences: preferencesResult.data || {},
    };

    console.log(`[auto-service-matcher] User context gathered: ${userContext.recentRequests.length} recent requests`);

    // Analyze patterns and generate recommendations
    const recommendations = generateRecommendations(userContext, limit);

    console.log(`[auto-service-matcher] Generated ${recommendations.length} recommendations`);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        context: {
          totalPastRequests: userContext.recentRequests.length,
          profileComplete: !!userContext.profile.display_name,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[auto-service-matcher] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateRecommendations(context: UserContext, limit: number): ServiceRecommendation[] {
  const recommendations: ServiceRecommendation[] = [];
  const usedCategories = new Set<string>();

  // Analyze past request patterns
  const categoryFrequency: Record<string, number> = {};
  for (const req of context.recentRequests) {
    if (req.category) {
      categoryFrequency[req.category] = (categoryFrequency[req.category] || 0) + 1;
    }
  }

  // Sort categories by frequency
  const sortedCategories = Object.entries(categoryFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  // Add recommendations based on frequent categories
  for (const category of sortedCategories) {
    if (usedCategories.size >= limit) break;
    
    const catalogEntry = SERVICE_CATALOG.find(c => c.category === category);
    if (catalogEntry && !usedCategories.has(category)) {
      const service = catalogEntry.services[Math.floor(Math.random() * catalogEntry.services.length)];
      recommendations.push({
        id: `rec-${category}-${Date.now()}`,
        category,
        title: service.title,
        description: service.description,
        reason: `Based on your ${categoryFrequency[category]} previous ${category.replace('_', ' ')} requests`,
        confidence: Math.min(0.9, 0.5 + (categoryFrequency[category] * 0.1)),
        urgency: categoryFrequency[category] >= 3 ? 'high' : 'medium',
        actionLabel: 'Request Now',
      });
      usedCategories.add(category);
    }
  }

  // Add complementary services based on patterns
  const complementaryServices = getComplementaryServices(sortedCategories);
  for (const service of complementaryServices) {
    if (usedCategories.size >= limit) break;
    if (!usedCategories.has(service.category)) {
      recommendations.push({
        id: `rec-comp-${service.category}-${Date.now()}`,
        category: service.category,
        title: service.title,
        description: service.description,
        reason: service.reason,
        confidence: 0.7,
        urgency: 'low',
        actionLabel: 'Explore',
      });
      usedCategories.add(service.category);
    }
  }

  // Fill remaining slots with popular services
  const popularCategories = ['travel', 'dining', 'events_access', 'private_aviation', 'wellness'];
  for (const category of popularCategories) {
    if (usedCategories.size >= limit) break;
    
    const catalogEntry = SERVICE_CATALOG.find(c => c.category === category);
    if (catalogEntry && !usedCategories.has(category)) {
      const service = catalogEntry.services[0];
      recommendations.push({
        id: `rec-pop-${category}-${Date.now()}`,
        category,
        title: service.title,
        description: service.description,
        reason: 'Popular among our members',
        confidence: 0.6,
        urgency: 'low',
        actionLabel: 'Discover',
      });
      usedCategories.add(category);
    }
  }

  return recommendations.slice(0, limit);
}

function getComplementaryServices(userCategories: string[]): Array<{category: string; title: string; description: string; reason: string}> {
  const complementary: Array<{category: string; title: string; description: string; reason: string}> = [];

  // Travel + Dining pairing
  if (userCategories.includes('travel') && !userCategories.includes('dining')) {
    complementary.push({
      category: 'dining',
      title: 'Restaurant Reservations',
      description: 'Priority access to sought-after establishments',
      reason: 'Complement your travels with exceptional dining experiences',
    });
  }

  // Aviation + Ground Transport pairing
  if (userCategories.includes('private_aviation') && !userCategories.includes('automotive')) {
    complementary.push({
      category: 'automotive',
      title: 'Chauffeur Services',
      description: 'Professional driving services',
      reason: 'Seamless ground transportation for your private flights',
    });
  }

  // Events + Catering pairing
  if (userCategories.includes('events') && !userCategories.includes('dining')) {
    complementary.push({
      category: 'dining',
      title: 'Private Chef Experience',
      description: 'In-home culinary experiences',
      reason: 'Elevate your events with bespoke culinary services',
    });
  }

  // Real Estate + Security pairing
  if (userCategories.includes('real_estate') && !userCategories.includes('security')) {
    complementary.push({
      category: 'security',
      title: 'Executive Protection',
      description: 'Discreet personal security services',
      reason: 'Comprehensive security for your properties',
    });
  }

  // Travel + Wellness pairing
  if (userCategories.includes('travel') && !userCategories.includes('wellness')) {
    complementary.push({
      category: 'wellness',
      title: 'Spa & Wellness Retreat',
      description: 'World-class wellness experiences',
      reason: 'Rejuvenate during your travels',
    });
  }

  return complementary;
}
