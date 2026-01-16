import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PARTNER_CATEGORIES = [
  { id: 'aviation', name: 'Private Aviation', examples: ['Charter operators', 'FBO services', 'Aircraft management'] },
  { id: 'yacht', name: 'Yacht & Marine', examples: ['Charter companies', 'Yacht management', 'Marina services'] },
  { id: 'hospitality', name: 'Luxury Hospitality', examples: ['5-star hotels', 'Private villas', 'Resort properties'] },
  { id: 'dining', name: 'Fine Dining', examples: ['Michelin restaurants', 'Private chefs', 'Catering services'] },
  { id: 'events', name: 'Exclusive Events', examples: ['VIP event access', 'Private concerts', 'Art exhibitions'] },
  { id: 'security', name: 'Security Services', examples: ['Executive protection', 'Residential security', 'Cybersecurity'] },
  { id: 'real_estate', name: 'Luxury Real Estate', examples: ['Property acquisition', 'Estate management', 'Investment properties'] },
  { id: 'automotive', name: 'Luxury Automotive', examples: ['Exotic car rental', 'Chauffeur services', 'Classic car acquisition'] },
  { id: 'wellness', name: 'Wellness & Health', examples: ['Private medical', 'Wellness retreats', 'Personal trainers'] },
  { id: 'art_collectibles', name: 'Art & Collectibles', examples: ['Art advisory', 'Auction services', 'Collection management'] },
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requirements } = await req.json();

    if (!requirements || typeof requirements !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Requirements text is required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze requirements to determine category and generate suggestions
    const reqLower = requirements.toLowerCase();
    
    // Determine primary category based on keywords
    let primaryCategory = 'hospitality';
    const categoryScores: Record<string, number> = {};
    
    PARTNER_CATEGORIES.forEach(cat => {
      let score = 0;
      if (reqLower.includes(cat.id)) score += 10;
      if (reqLower.includes(cat.name.toLowerCase())) score += 8;
      cat.examples.forEach(ex => {
        if (reqLower.includes(ex.toLowerCase())) score += 5;
      });
      categoryScores[cat.id] = score;
    });

    const sortedCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0);

    if (sortedCategories.length > 0) {
      primaryCategory = sortedCategories[0][0];
    }

    // Detect regions mentioned
    const regions: string[] = [];
    const regionKeywords = {
      'North America': ['america', 'usa', 'us', 'united states', 'canada', 'north america', 'new york', 'los angeles', 'miami'],
      'Europe': ['europe', 'european', 'france', 'italy', 'uk', 'london', 'paris', 'monaco', 'mediterranean'],
      'Middle East': ['middle east', 'dubai', 'uae', 'saudi', 'qatar', 'abu dhabi'],
      'Asia Pacific': ['asia', 'pacific', 'japan', 'singapore', 'hong kong', 'australia', 'tokyo'],
      'Latin America': ['latin america', 'caribbean', 'mexico', 'brazil', 'bahamas'],
      'Africa': ['africa', 'south africa', 'morocco', 'kenya'],
    };

    Object.entries(regionKeywords).forEach(([region, keywords]) => {
      if (keywords.some(kw => reqLower.includes(kw))) {
        regions.push(region);
      }
    });

    // Generate AI-style suggestions based on requirements
    const suggestions = generateSuggestions(primaryCategory, regions, requirements);

    return new Response(
      JSON.stringify({
        suggestions,
        detectedCategory: primaryCategory,
        detectedRegions: regions,
        analysis: {
          categoryScores: sortedCategories.slice(0, 3),
          keywordsFound: extractKeywords(requirements),
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('AI Partner Discovery error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process discovery request' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const importantTerms = [
    'luxury', 'premium', 'exclusive', 'vip', 'ultra', 'bespoke', 'private',
    'charter', 'yacht', 'jet', 'villa', 'estate', 'concierge', 'butler',
    'michelin', '5-star', 'five-star', 'boutique', 'elite', 'high-end',
    'personalized', 'curated', 'tailored', 'white-glove', 'discreet'
  ];
  
  const textLower = text.toLowerCase();
  importantTerms.forEach(term => {
    if (textLower.includes(term)) {
      keywords.push(term);
    }
  });
  
  return keywords;
}

function generateSuggestions(category: string, regions: string[], requirements: string) {
  const templates: Record<string, any[]> = {
    aviation: [
      { name: 'Elite Aviation Services', description: 'Premium private jet charter with global fleet access', specialty: 'Long-range intercontinental flights' },
      { name: 'SkyLuxe Partners', description: 'Boutique aviation management and charter services', specialty: 'On-demand charter arrangements' },
      { name: 'Apex Air Holdings', description: 'Ultra-luxury aircraft management and acquisitions', specialty: 'Aircraft ownership consultation' },
    ],
    yacht: [
      { name: 'Azure Marine Charters', description: 'Superyacht charter specialists for Mediterranean and Caribbean', specialty: 'Crewed yacht charters' },
      { name: 'Oceanic Prestige', description: 'Luxury yacht brokerage and management', specialty: 'New build supervision' },
      { name: 'Marina Elite Services', description: 'Premium berth services and yacht concierge', specialty: 'Marina reservations worldwide' },
    ],
    hospitality: [
      { name: 'Sovereign Stays', description: 'Private villa and estate rentals worldwide', specialty: 'Exclusive property access' },
      { name: 'Grand Palace Partners', description: 'Luxury hotel reservations and VIP arrangements', specialty: 'Suite upgrades and amenities' },
      { name: 'Retreat Masters', description: 'Curated wellness and luxury retreat experiences', specialty: 'Bespoke retreat planning' },
    ],
    dining: [
      { name: 'Culinary Excellence Group', description: 'Michelin restaurant reservations and private chef services', specialty: 'Impossible reservations' },
      { name: 'Table Exclusive', description: 'Private dining experiences and chef collaborations', specialty: 'Celebrity chef access' },
      { name: 'Gastronomie Privée', description: 'Bespoke catering and private events', specialty: 'Estate dining services' },
    ],
    events: [
      { name: 'VIP Access Collective', description: 'Exclusive event tickets and hospitality packages', specialty: 'Front-row experiences' },
      { name: 'Premiere Events Group', description: 'Private concerts and exclusive entertainment', specialty: 'Artist bookings' },
      { name: 'Cultural Elite', description: 'Art fair and exhibition private viewings', specialty: 'Collector previews' },
    ],
    security: [
      { name: 'Guardian Executive Protection', description: 'Elite security services for HNW individuals', specialty: 'Travel security' },
      { name: 'Fortress Security Solutions', description: 'Residential and estate protection services', specialty: 'Family security' },
      { name: 'Cipher Cyber Defense', description: 'Premium cybersecurity for private clients', specialty: 'Privacy protection' },
    ],
    real_estate: [
      { name: 'Prime Estates International', description: 'Ultra-luxury property acquisition worldwide', specialty: 'Off-market properties' },
      { name: 'Heritage Property Group', description: 'Historic estate and castle acquisitions', specialty: 'European estates' },
      { name: 'Urban Luxe Realty', description: 'Prime penthouse and city residence specialists', specialty: 'Trophy properties' },
    ],
    automotive: [
      { name: 'Prestige Motors Elite', description: 'Exotic car rental and chauffeur services', specialty: 'Supercar collection access' },
      { name: 'Classic Heritage Autos', description: 'Vintage and classic car acquisition', specialty: 'Collection curation' },
      { name: 'Executive Drive Services', description: 'Premium chauffeur and limousine services', specialty: 'VIP transportation' },
    ],
    wellness: [
      { name: 'Vitality Elite Concierge', description: 'Private medical coordination and wellness', specialty: 'Executive health programs' },
      { name: 'Serenity Wellness Partners', description: 'Exclusive spa and wellness retreats', specialty: 'Longevity programs' },
      { name: 'Peak Performance Group', description: 'Elite personal training and nutrition', specialty: 'Athletic optimization' },
    ],
    art_collectibles: [
      { name: 'Artisan Advisory Group', description: 'Fine art acquisition and collection management', specialty: 'Blue-chip art access' },
      { name: 'Legacy Collections', description: 'Rare collectibles and memorabilia sourcing', specialty: 'Auction representation' },
      { name: 'Museum Quality Partners', description: 'Art storage, transport, and conservation', specialty: 'Collection care' },
    ],
  };

  const categoryTemplates = templates[category] || templates.hospitality;
  const effectiveRegions = regions.length > 0 ? regions : ['North America', 'Europe'];

  return categoryTemplates.map((template, index) => ({
    ...template,
    category,
    regions: effectiveRegions,
    website: `https://www.${template.name.toLowerCase().replace(/\s+/g, '')}.com`,
    matchScore: 85 - (index * 5),
    source: 'AI Discovery',
  }));
}
