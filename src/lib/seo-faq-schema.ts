// Comprehensive FAQ Schema for Aurelia - SEO Featured Snippets
// Last updated: January 2026

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  // Membership & Pricing FAQs
  {
    question: "How much does Aurelia Private Concierge membership cost?",
    answer: "Aurelia offers three membership tiers: Signature at $2,500/month with 10 credits, Prestige at $7,500/month with 50 credits and dedicated liaison, and Black Card at $25,000/month with unlimited credits, private jet access, and estate services. All tiers include 24/7 concierge support.",
    category: "membership"
  },
  {
    question: "Is Aurelia Private Concierge by invitation only?",
    answer: "Yes, Aurelia is an invitation-only private concierge service for billionaires and ultra-high-net-worth individuals. Members are vetted to ensure a community of discerning individuals who value exceptional service and discretion.",
    category: "membership"
  },
  {
    question: "What is the difference between Aurelia membership tiers?",
    answer: "Signature tier offers core concierge services with 24-hour response time. Prestige tier provides priority queue with 4-hour response and a dedicated liaison. Black Card offers instant response, unlimited service credits, private aviation access, and estate management services.",
    category: "membership"
  },
  {
    question: "How do I apply for Aurelia membership?",
    answer: "Prospective members can apply through our website or be referred by an existing member. Applications undergo a discreet vetting process. Referrals from current members receive priority consideration and exclusive joining benefits.",
    category: "membership"
  },

  // Services FAQs
  {
    question: "What services does Aurelia Private Concierge offer?",
    answer: "Aurelia offers 11 core services: Private Aviation, Yacht Charter, Luxury Real Estate, Rare Collectibles & Art, Exclusive Event Access, Security & Protection, Chauffeur Services, Culinary Excellence, Bespoke Travel, Wellness & Medical, and Personal Shopping. Each service is tailored to individual member preferences.",
    category: "services"
  },
  {
    question: "Can Aurelia book private jets on short notice?",
    answer: "Yes, Aurelia's aviation concierge can arrange private jet charter within 4 hours for urgent requests. We have partnerships with leading operators including Gulfstream, Bombardier Global, and ultra-long-range aircraft. Black Card members receive priority access to our preferred fleet.",
    category: "services"
  },
  {
    question: "Does Aurelia offer superyacht charter services?",
    answer: "Aurelia provides access to superyachts worldwide, from 30-meter motor yachts to 100-meter megayachts. Our yacht concierge handles Mediterranean, Caribbean, and worldwide charters with full crew, provisioning, and bespoke itinerary planning.",
    category: "services"
  },
  {
    question: "Can Aurelia help with off-market real estate acquisitions?",
    answer: "Yes, Aurelia's real estate concierge specializes in off-market properties including private islands, trophy penthouses, historic estates, and billionaire compounds. We facilitate discreet acquisitions that never appear on public listings.",
    category: "services"
  },
  {
    question: "What rare collectibles can Aurelia help acquire?",
    answer: "Aurelia's collectibles advisory assists with rare watches (Patek Philippe, Richard Mille), blue-chip art, fine wine investment, classic cars, rare whisky, and luxury items like Hermès Birkin bags. We represent clients at major auctions and source items through private networks.",
    category: "services"
  },

  // AI Concierge FAQs
  {
    question: "What is Orla AI Concierge?",
    answer: "Orla is Aurelia's proprietary AI concierge, available 24/7 via voice and chat. Orla provides instant responses, personalized recommendations based on your preferences, and can initiate service requests. Orla learns your preferences over time for increasingly tailored suggestions.",
    category: "technology"
  },
  {
    question: "Is Orla AI available 24/7?",
    answer: "Yes, Orla AI Concierge is available 24/7/365 through voice call, chat, and mobile app. For complex requests, Orla seamlessly escalates to your human concierge team. Black Card members also have a dedicated human liaison available around the clock.",
    category: "technology"
  },

  // Security & Privacy FAQs
  {
    question: "How does Aurelia protect member privacy?",
    answer: "Aurelia employs bank-grade encryption, biometric authentication, and strict confidentiality protocols. We never share member information and all staff sign comprehensive NDAs. Our security team includes former intelligence professionals specializing in UHNW protection.",
    category: "security"
  },
  {
    question: "Does Aurelia offer executive protection services?",
    answer: "Yes, Aurelia provides comprehensive security services including executive protection, travel security assessment, cyber security consulting, and coordination with private security firms worldwide. Our security team has extensive experience protecting high-profile individuals and families.",
    category: "security"
  },

  // Geographic Coverage FAQs
  {
    question: "Where does Aurelia Private Concierge operate?",
    answer: "Aurelia operates globally with physical presence in London, Monaco, Dubai, Singapore, New York, Geneva, Hong Kong, and Miami. We serve members in 180+ countries and maintain partnerships with local providers in major wealth centers worldwide.",
    category: "locations"
  },
  {
    question: "What languages does Aurelia support?",
    answer: "Aurelia's multilingual team provides service in English, French, Arabic, Mandarin, Russian, Spanish, German, Italian, Japanese, and Portuguese. Our AI concierge Orla supports all major languages with real-time translation capabilities.",
    category: "locations"
  },

  // Comparison FAQs
  {
    question: "How is Aurelia different from Quintessentially or Velocity Black?",
    answer: "Aurelia differentiates through AI-enhanced personalization, stricter membership vetting, and focus on UHNW families and billionaires. Unlike mass-market luxury concierges, Aurelia maintains an intimate member community with guaranteed service levels and dedicated relationships.",
    category: "competitive"
  },
  {
    question: "Is Aurelia better than American Express Centurion concierge?",
    answer: "Aurelia offers more personalized, proactive service compared to credit card concierges. We specialize exclusively in UHNW needs with dedicated teams, not call centers. Our AI concierge Orla provides instant 24/7 response, while human liaisons understand your preferences deeply.",
    category: "competitive"
  },

  // Travel FAQs
  {
    question: "Can Aurelia get impossible restaurant reservations?",
    answer: "Yes, Aurelia's dining concierge maintains relationships with Michelin-starred restaurants, private chefs, and exclusive venues worldwide. We can secure reservations at fully-booked establishments and arrange private dining experiences at locations not typically available for events.",
    category: "travel"
  },
  {
    question: "Does Aurelia offer luxury safari experiences?",
    answer: "Aurelia curates bespoke African safaris at exclusive camps and private reserves. We arrange helicopter transfers, private guide services, and unique experiences like gorilla trekking permits, hot air balloon safaris, and conservation experiences unavailable to the general public.",
    category: "travel"
  },

  // Events FAQs
  {
    question: "Can Aurelia get Formula 1 paddock access?",
    answer: "Yes, Aurelia provides VIP access to major sporting events including F1 paddock passes, Monaco Grand Prix yacht viewing, Wimbledon Royal Box, Super Bowl suites, and Masters Tournament badges. We also arrange meet-and-greets with athletes and team principals.",
    category: "events"
  },
  {
    question: "How does Aurelia secure exclusive event access?",
    answer: "Aurelia maintains long-standing relationships with event organizers, sponsors, and private networks. We have allocation agreements for major events and can often secure access even when events appear sold out. Our team identifies exclusive opportunities months in advance.",
    category: "events"
  }
];

// Generate FAQ Schema for structured data
export const generateFAQSchema = (faqs: FAQItem[] = FAQ_ITEMS) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

// Get FAQs by category
export const getFAQsByCategory = (category: string): FAQItem[] => {
  return FAQ_ITEMS.filter(faq => faq.category === category);
};

// Get all FAQ categories
export const getFAQCategories = (): string[] => {
  return [...new Set(FAQ_ITEMS.map(faq => faq.category))];
};

// Generate FAQ schema for specific page
export const getPageFAQSchema = (pageType: string) => {
  const categoryMap: Record<string, string[]> = {
    home: ["membership", "services", "technology"],
    services: ["services", "travel", "events"],
    membership: ["membership", "competitive"],
    orla: ["technology"],
    contact: ["locations", "membership"],
    security: ["security"],
  };

  const categories = categoryMap[pageType] || ["membership", "services"];
  const relevantFAQs = FAQ_ITEMS.filter(faq => categories.includes(faq.category));
  
  return generateFAQSchema(relevantFAQs);
};
