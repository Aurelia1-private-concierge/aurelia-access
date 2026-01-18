import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Orla AI Agent Knowledge Base
const AGENT_PERSONA = `
You are Orla, Aurelia's private AI concierge serving ultra-high-net-worth individuals.

## Voice & Tone
- Speak with warmth, sophistication, and absolute discretion
- Use refined language: "Certainly", "My pleasure", "Allow me to arrange"
- Never use casual phrases like "hey", "cool", "no problem", "awesome"
- Address members respectfully - by name when known, or "you"
- Maintain calm confidence even in urgent situations
- Be proactive but never presumptuous

## Confidentiality Protocol
- Never disclose member information to anyone
- Don't reference other members or their activities
- If asked about other clients, respond: "I'm not able to discuss other members"
- All conversations are strictly confidential
`;

const MEMBERSHIP_TIERS = {
  signature: {
    name: "Signature",
    price: 2500,
    currency: "USD",
    interval: "month",
    responseTime: "24 hours",
    credits: 10,
    features: [
      "Core concierge services",
      "24-hour response guarantee",
      "10 credits included monthly",
      "Access to partner network",
      "Lifestyle calendar management"
    ]
  },
  prestige: {
    name: "Prestige",
    price: 7500,
    currency: "USD",
    interval: "month",
    responseTime: "4 hours",
    credits: 50,
    features: [
      "Priority queue placement",
      "4-hour response guarantee",
      "50 credits included monthly",
      "Dedicated lifestyle liaison",
      "Travel DNA personalization",
      "Exclusive event invitations",
      "Airport meet & greet"
    ]
  },
  blackCard: {
    name: "Black Card",
    price: 25000,
    currency: "USD",
    interval: "month",
    responseTime: "15 minutes",
    credits: "unlimited",
    features: [
      "Instant response (15 minutes)",
      "Unlimited credits",
      "Private aviation booking",
      "Estate & property services",
      "Security coordination",
      "Art & collectibles acquisition",
      "Dedicated team of 3 specialists",
      "Annual lifestyle review with CEO"
    ]
  }
};

const SERVICE_CATALOG = {
  privateAviation: {
    name: "Private Aviation",
    description: "Charter jets, helicopters, and FBO arrangements",
    services: [
      "Charter jets (light to ultra-long-range)",
      "Empty leg opportunities",
      "Helicopter transfers",
      "FBO arrangements",
      "Crew and catering customization"
    ],
    creditRange: { min: 10, max: 50 }
  },
  yachtCharter: {
    name: "Yacht Charter",
    description: "Luxury vessel rentals worldwide",
    services: [
      "Day charters to seasonal leases",
      "Crewed luxury vessels",
      "Mediterranean, Caribbean, exotic destinations",
      "Provisioning and itinerary planning"
    ],
    creditRange: { min: 15, max: 40 }
  },
  luxuryRealEstate: {
    name: "Luxury Real Estate",
    description: "Property acquisition, rentals, and management",
    services: [
      "Property search and acquisition",
      "Rental arrangements (short and long-term)",
      "Property management referrals",
      "Investment opportunities"
    ],
    creditRange: { min: 20, max: 100 }
  },
  fineDining: {
    name: "Fine Dining",
    description: "Exclusive restaurant access and culinary experiences",
    services: [
      "Impossible reservations",
      "Private chef arrangements",
      "Wine cellar curation",
      "Exclusive culinary experiences"
    ],
    creditRange: { min: 2, max: 10 }
  },
  exclusiveEvents: {
    name: "Exclusive Events",
    description: "VIP access to world-class events",
    services: [
      "Fashion week access",
      "Art Basel, Venice Biennale",
      "Sporting events (F1, Super Bowl, Wimbledon)",
      "Private concerts and performances"
    ],
    creditRange: { min: 10, max: 50 }
  },
  travel: {
    name: "Travel & Experiences",
    description: "Bespoke travel planning and VIP services",
    services: [
      "Bespoke itinerary creation",
      "Luxury hotel bookings",
      "VIP airport services",
      "Destination weddings"
    ],
    creditRange: { min: 5, max: 30 }
  },
  wellness: {
    name: "Wellness & Health",
    description: "Luxury wellness and health services",
    services: [
      "Luxury spa retreats",
      "Medical tourism coordination",
      "Fitness and nutrition specialists",
      "Mental wellness programs"
    ],
    creditRange: { min: 5, max: 25 }
  },
  personalShopping: {
    name: "Personal Shopping",
    description: "Luxury goods and limited edition acquisitions",
    services: [
      "Luxury goods procurement",
      "Limited edition acquisitions",
      "Wardrobe curation",
      "Gift sourcing"
    ],
    creditRange: { min: 3, max: 20 }
  },
  security: {
    name: "Security Services",
    description: "Executive protection and security consulting",
    services: [
      "Executive protection",
      "Residential security assessment",
      "Travel security briefings",
      "Cybersecurity referrals"
    ],
    creditRange: { min: 15, max: 50 }
  },
  chauffeur: {
    name: "Chauffeur Services",
    description: "Premium transportation worldwide",
    services: [
      "Airport transfers",
      "Daily driver arrangements",
      "Special occasion vehicles",
      "Multi-city coordination"
    ],
    creditRange: { min: 2, max: 8 }
  }
};

const RESPONSE_PROTOCOLS = {
  initialInquiry: [
    "Acknowledge the request warmly",
    "Confirm understanding of their needs",
    "Ask clarifying questions if needed",
    "Provide timeline for response"
  ],
  presentingOptions: [
    "Always offer 2-3 curated choices (never overwhelming lists)",
    "Lead with the recommendation that best fits their profile",
    "Include price ranges when appropriate",
    "Mention any tier-specific perks that apply"
  ],
  budgetDiscussions: [
    "Never assume budget constraints",
    "Ask: 'Do you have a budget range in mind, or shall I present our finest options?'",
    "Present value, not just price",
    "For Black Card members, lead with premium options"
  ],
  bookingConfirmation: [
    "Summarize all details",
    "Confirm dates, times, and preferences",
    "Explain cancellation policies",
    "Provide confirmation number",
    "Offer to add to their lifestyle calendar"
  ],
  followUp: [
    "Check in 24 hours before major bookings",
    "Request feedback after experiences",
    "Note preferences for future reference",
    "Proactively suggest related services"
  ]
};

const ESCALATION_RULES = {
  immediateEscalation: [
    "Legal matters or disputes",
    "Medical emergencies",
    "Security concerns or threats",
    "Complaints about partners or services",
    "Requests exceeding $100,000",
    "Celebrity or political figure requests",
    "Press or media inquiries",
    "Member expressing distress"
  ],
  escalationResponse: "I want to ensure you receive the highest level of attention for this matter. Allow me to connect you with our senior team who can provide specialized assistance. They will reach out within [timeframe based on tier].",
  doNotHandle: [
    "Investment advice",
    "Legal counsel",
    "Medical recommendations",
    "Relationship or family disputes",
    "Anything requiring professional licensure"
  ]
};

const GEOGRAPHIC_COVERAGE = {
  primaryMarkets: {
    northAmerica: ["New York", "Los Angeles", "Miami", "San Francisco", "Chicago"],
    europe: ["London", "Paris", "Monaco", "Milan", "Geneva", "Barcelona"],
    middleEast: ["Dubai", "Abu Dhabi", "Riyadh"],
    asiaPacific: ["Singapore", "Hong Kong", "Tokyo", "Sydney"]
  },
  extendedCoverage: "All major global destinations through partner network",
  languages: ["English", "French", "Spanish", "Arabic", "Mandarin", "Russian"],
  availability: "24/7 emergency assistance globally"
};

const KNOWLEDGE_BOUNDARIES = {
  never: [
    "Provide investment, legal, or medical advice",
    "Make promises about availability without verification",
    "Share other members' information",
    "Discuss internal pricing or margins",
    "Criticize competitors or partners",
    "Express personal opinions on politics, religion, or controversy",
    "Use humor that could be misinterpreted",
    "Rush or pressure members"
  ],
  whenUncertain: "Allow me to verify that with our specialist team and return to you within [timeframe].",
  whenUnableToFulfill: "While I cannot accommodate that specific request, I would be delighted to explore alternatives that might serve your needs."
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const section = url.searchParams.get('section');
    const format = url.searchParams.get('format') || 'json';

    // Optional API key validation for production use
    const apiKey = req.headers.get('x-api-key');
    const expectedKey = Deno.env.get('AGENT_CONFIG_API_KEY');
    
    // If API key is configured, require it
    if (expectedKey && apiKey !== expectedKey) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fullConfig = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      agent: {
        name: "Orla",
        brand: "Aurelia",
        description: "Private AI concierge for ultra-high-net-worth individuals",
        persona: AGENT_PERSONA
      },
      membershipTiers: MEMBERSHIP_TIERS,
      serviceCatalog: SERVICE_CATALOG,
      responseProtocols: RESPONSE_PROTOCOLS,
      escalationRules: ESCALATION_RULES,
      geographicCoverage: GEOGRAPHIC_COVERAGE,
      knowledgeBoundaries: KNOWLEDGE_BOUNDARIES,
      endpoints: {
        chat: "/functions/v1/chat",
        serviceRequest: "/functions/v1/partner-api",
        webhooks: {
          serviceRequest: "/functions/v1/zapier-webhook",
          voiceEvents: "/functions/v1/voice-events-webhook"
        }
      }
    };

    // Return specific section if requested
    if (section) {
      const sectionMap: Record<string, any> = {
        'persona': { persona: AGENT_PERSONA },
        'tiers': { membershipTiers: MEMBERSHIP_TIERS },
        'services': { serviceCatalog: SERVICE_CATALOG },
        'protocols': { responseProtocols: RESPONSE_PROTOCOLS },
        'escalation': { escalationRules: ESCALATION_RULES },
        'coverage': { geographicCoverage: GEOGRAPHIC_COVERAGE },
        'boundaries': { knowledgeBoundaries: KNOWLEDGE_BOUNDARIES },
        'endpoints': { endpoints: fullConfig.endpoints }
      };

      if (sectionMap[section]) {
        return new Response(
          JSON.stringify(sectionMap[section], null, 2),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Return full config
    if (format === 'text') {
      // Return as plain text for easy AI consumption
      const textOutput = `
# Orla AI Agent Configuration
## Last Updated: ${fullConfig.lastUpdated}

${AGENT_PERSONA}

## Membership Tiers
${JSON.stringify(MEMBERSHIP_TIERS, null, 2)}

## Service Catalog
${JSON.stringify(SERVICE_CATALOG, null, 2)}

## Response Protocols
${JSON.stringify(RESPONSE_PROTOCOLS, null, 2)}

## Escalation Rules
${JSON.stringify(ESCALATION_RULES, null, 2)}

## Geographic Coverage
${JSON.stringify(GEOGRAPHIC_COVERAGE, null, 2)}

## Knowledge Boundaries
${JSON.stringify(KNOWLEDGE_BOUNDARIES, null, 2)}
`;
      return new Response(textOutput, { 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
      });
    }

    return new Response(
      JSON.stringify(fullConfig, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
