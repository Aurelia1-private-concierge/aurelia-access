// Premium SEO Keywords for Luxury Concierge Targeting UHNW Individuals
// These keywords are optimized for high-intent, high-value search traffic

export const SEO_KEYWORDS = {
  // Primary High-Value Keywords
  primary: [
    "private concierge service",
    "luxury concierge",
    "UHNW concierge",
    "billionaire concierge",
    "ultra high net worth services",
    "exclusive lifestyle management",
    "bespoke concierge",
    "elite personal assistant",
    "VIP concierge service",
    "private lifestyle manager",
  ],

  // Private Aviation Keywords
  privateAviation: [
    "private jet charter",
    "luxury private aviation",
    "on-demand private jet",
    "private jet membership",
    "executive jet charter",
    "private helicopter charter",
    "VIP aviation services",
    "private air travel",
    "jet card programs",
    "fractional jet ownership",
  ],

  // Yacht & Marine Keywords
  yachtCharter: [
    "superyacht charter",
    "luxury yacht rental",
    "Mediterranean yacht charter",
    "Caribbean yacht charter",
    "motor yacht charter",
    "sailing yacht charter",
    "crewed yacht charter",
    "yacht charter broker",
    "expedition yacht charter",
    "mega yacht charter",
  ],

  // Real Estate Keywords
  realEstate: [
    "luxury real estate",
    "off-market properties",
    "billionaire estates",
    "private island for sale",
    "trophy properties",
    "penthouse acquisition",
    "chateau for sale",
    "luxury ski chalet",
    "waterfront mansion",
    "historic estate acquisition",
  ],

  // Collectibles & Investment
  collectibles: [
    "rare wine investment",
    "fine art acquisition",
    "luxury watch collection",
    "rare car collection",
    "investment grade art",
    "wine cellar management",
    "Patek Philippe acquisition",
    "classic car investment",
    "auction representation",
    "art advisory services",
  ],

  // Travel & Experiences
  travel: [
    "luxury travel planning",
    "bespoke travel experiences",
    "private island vacation",
    "exclusive safari experience",
    "luxury Antarctica expedition",
    "around the world private jet tour",
    "VIP event access",
    "exclusive restaurant reservations",
    "private museum tours",
    "celebrity event access",
  ],

  // Security & Privacy
  security: [
    "executive protection services",
    "family office security",
    "cyber security UHNW",
    "privacy management",
    "secure travel planning",
    "confidential concierge",
    "discreet personal services",
    "asset protection",
    "reputation management",
    "private banking coordination",
  ],

  // Lifestyle Management
  lifestyle: [
    "lifestyle management services",
    "personal assistant services",
    "household management",
    "estate management",
    "luxury relocation services",
    "private chef services",
    "personal shopping services",
    "wardrobe management",
    "event planning luxury",
    "family office services",
  ],

  // Geographic Targeting
  locations: [
    "London private concierge",
    "Monaco concierge services",
    "Dubai luxury concierge",
    "Singapore UHNW services",
    "New York elite concierge",
    "Geneva private banking",
    "Hong Kong luxury services",
    "Miami luxury lifestyle",
    "Zurich wealth management",
    "Paris luxury concierge",
  ],

  // Long-tail High-Intent Keywords
  longTail: [
    "how to hire a private concierge",
    "best luxury concierge service in the world",
    "private concierge for billionaires",
    "exclusive membership concierge club",
    "white glove concierge service",
    "24/7 private concierge",
    "international concierge service",
    "luxury concierge for executives",
    "personal concierge for families",
    "invitation only concierge service",
  ],
} as const;

// Meta description templates for different pages
export const META_DESCRIPTIONS = {
  home: "Aurelia is the world's most exclusive private concierge service. Private aviation, yacht charters, rare collectibles, and bespoke experiences—curated for UHNW individuals.",
  services: "Discover Aurelia's comprehensive luxury services: private jets, superyachts, off-market real estate, fine art, exclusive events, and 24/7 lifestyle management.",
  membership: "Apply for Aurelia membership. Join an elite community of discerning individuals with access to the world's most exclusive experiences and services.",
  aviation: "Private jet charter and aviation services. Access the finest fleet of jets and helicopters with 24/7 availability and white-glove service.",
  yacht: "Superyacht and luxury yacht charter services. Mediterranean, Caribbean, and worldwide destinations with fully crewed vessels.",
  realEstate: "Off-market luxury real estate acquisition. Private islands, historic estates, penthouses, and trophy properties worldwide.",
  collectibles: "Fine art, rare wines, luxury watches, and collectibles. Expert curation, authentication, and investment advisory.",
  travel: "Bespoke luxury travel experiences. Private island getaways, exclusive safaris, Antarctica expeditions, and around-the-world tours.",
  security: "Executive protection and privacy services. Discreet, confidential security solutions for UHNW individuals and families.",
  orla: "Meet Orla, your AI-powered luxury concierge. 24/7 intelligent assistance for all your lifestyle needs.",
} as const;

// Structured data for rich snippets
export const STRUCTURED_DATA = {
  priceRange: "$$$$",
  aggregateRating: {
    ratingValue: "4.9",
    reviewCount: "127",
    bestRating: "5",
    worstRating: "4",
  },
  serviceAreas: [
    "London", "Monaco", "Dubai", "Singapore", "New York", 
    "Geneva", "Hong Kong", "Miami", "Zurich", "Paris",
    "Los Angeles", "Tokyo", "Sydney", "Maldives", "St. Barths"
  ],
} as const;

// Generate keyword string for meta tags
export const generateKeywordString = (categories: (keyof typeof SEO_KEYWORDS)[]) => {
  return categories
    .flatMap(cat => SEO_KEYWORDS[cat])
    .slice(0, 20)
    .join(", ");
};
