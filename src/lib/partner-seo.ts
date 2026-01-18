// Partner SEO Configuration - Marketing Keywords, Meta Data, Structured Data

export interface PartnerSEO {
  title: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  h2Suggestions: string[];
  marketingCopy: {
    tagline: string;
    valueProposition: string;
    callToAction: string;
  };
  structuredData: {
    type: "LocalBusiness" | "Service" | "Organization";
    additionalType?: string;
    serviceType?: string;
    areaServed?: string[];
    priceRange?: string;
  };
  ogImage?: string;
  canonicalPath: string;
}

// SEO data for each partner
export const partnerSEOData: Record<string, PartnerSEO> = {
  velocities: {
    title: "Velocities Luxury Chauffeur & Executive Protection | Aurelia Partner",
    metaDescription: "Experience world-class executive chauffeur services and elite security protection with Velocities through Aurelia. Armored vehicles, former government personnel, 150+ cities worldwide. Book now.",
    keywords: [
      "luxury chauffeur service",
      "executive protection",
      "armored car service",
      "VIP security drivers",
      "celebrity chauffeur",
      "billionaire security",
      "executive transport",
      "close protection officers",
      "armored vehicle hire",
      "luxury car service",
      "private driver service",
      "bodyguard chauffeur",
      "secure ground transportation",
      "UHNW security",
      "discreet chauffeur",
      "24/7 chauffeur service",
      "airport luxury transfer",
      "executive car hire",
      "VIP ground transport",
      "personal security driver"
    ],
    h1: "Velocities Executive Chauffeur & Protection",
    h2Suggestions: [
      "Premium Armored Fleet",
      "Elite Security Personnel", 
      "Global Coverage",
      "Seamless Luxury Transport"
    ],
    marketingCopy: {
      tagline: "Arrive in Absolute Security",
      valueProposition: "Former government and military personnel providing discreet, world-class protection and luxury ground transport across 150+ cities worldwide.",
      callToAction: "Request a consultation with our security specialists"
    },
    structuredData: {
      type: "Service",
      serviceType: "Executive Protection and Chauffeur Service",
      areaServed: ["Worldwide", "United Kingdom", "United States", "Middle East", "Europe", "Asia"],
      priceRange: "$$$$$"
    },
    canonicalPath: "/partners/velocities"
  },
  
  "ontarget-couriers": {
    title: "OnTarget Couriers Premium UK Delivery & House Removals | Aurelia Partner",
    metaDescription: "Premium UK courier, same-day delivery & luxury house removal services by OnTarget Couriers. Mercedes & Luton van fleet, white glove service, 100% UK coverage. Book through Aurelia.",
    keywords: [
      "luxury house removals UK",
      "premium courier service",
      "same day delivery UK",
      "white glove delivery",
      "executive relocation service",
      "high value item courier",
      "luxury furniture delivery",
      "professional house movers",
      "Mercedes van delivery",
      "urgent courier UK",
      "office relocation London",
      "premium moving service",
      "art courier UK",
      "antique furniture movers",
      "secure parcel delivery",
      "express delivery service",
      "furniture assembly delivery",
      "nationwide removals UK",
      "luxury item transport",
      "bespoke delivery service"
    ],
    h1: "OnTarget Couriers Premium Delivery & Removals",
    h2Suggestions: [
      "Same-Day Courier Excellence",
      "White Glove House Removals",
      "Premium Fleet",
      "Nationwide UK Coverage"
    ],
    marketingCopy: {
      tagline: "Your Move. Our Mission.",
      valueProposition: "Premium UK courier and house removal service with Mercedes Sprinters and Luton vans. From urgent same-day deliveries to full home relocations with white glove care.",
      callToAction: "Get a quote for your delivery or removal"
    },
    structuredData: {
      type: "LocalBusiness",
      additionalType: "MovingCompany",
      serviceType: "Courier and Removal Services",
      areaServed: ["United Kingdom", "England", "Scotland", "Wales"],
      priceRange: "$$$$"
    },
    canonicalPath: "/partners/ontarget-couriers"
  },
  
  "ontarget-webdesigns": {
    title: "OnTarget WebDesigns AI-Enhanced Luxury Web Design | Aurelia Partner",
    metaDescription: "Bespoke AI-enhanced web design for luxury brands by OnTarget WebDesigns. Sophisticated digital experiences, member portals, e-commerce. 2-4 week delivery. Global service.",
    keywords: [
      "luxury web design",
      "AI website development",
      "bespoke web development",
      "luxury brand website",
      "high-end web design",
      "premium website agency",
      "luxury e-commerce",
      "member portal development",
      "exclusive website design",
      "UHNW web design",
      "luxury digital agency",
      "sophisticated web experiences",
      "private client portals",
      "wealth management websites",
      "luxury hotel websites",
      "yacht charter websites",
      "real estate luxury websites",
      "exclusive brand digital",
      "AI-driven optimization",
      "bespoke digital experiences"
    ],
    h1: "OnTarget WebDesigns AI-Enhanced Digital Excellence",
    h2Suggestions: [
      "Bespoke Luxury Websites",
      "AI-Driven Optimization",
      "Member Portal Solutions",
      "Global Digital Excellence"
    ],
    marketingCopy: {
      tagline: "Digital Excellence Elevated",
      valueProposition: "AI-enhanced bespoke web design agency creating sophisticated digital experiences for luxury brands and discerning individuals. Where technology meets artistry.",
      callToAction: "Start your digital transformation"
    },
    structuredData: {
      type: "Organization",
      additionalType: "ProfessionalService",
      serviceType: "Web Design and Development",
      areaServed: ["Worldwide"],
      priceRange: "$$$$"
    },
    canonicalPath: "/partners/ontarget-webdesigns"
  }
};

// Generate JSON-LD structured data for a partner
export function generatePartnerSchema(partnerId: string, partnerData: {
  name: string;
  description: string;
  specialty: string;
  services: string[];
  regions: string[];
  stats: { label: string; value: string }[];
  heroImage: string;
}) {
  const seo = partnerSEOData[partnerId];
  if (!seo) return null;

  const baseUrl = "https://aurelia-privateconcierge.com";
  
  const schema: any = {
    "@context": "https://schema.org",
    "@type": seo.structuredData.type,
    "name": partnerData.name,
    "description": partnerData.description,
    "url": `${baseUrl}${seo.canonicalPath}`,
    "image": partnerData.heroImage.startsWith('http') 
      ? partnerData.heroImage 
      : `${baseUrl}${partnerData.heroImage}`,
    "priceRange": seo.structuredData.priceRange,
    "areaServed": seo.structuredData.areaServed?.map(area => ({
      "@type": "Country",
      "name": area
    })),
    "provider": {
      "@type": "Organization",
      "name": "Aurelia Private Concierge",
      "url": baseUrl
    }
  };

  // Add service type if available
  if (seo.structuredData.serviceType) {
    schema.serviceType = seo.structuredData.serviceType;
  }

  // Add additional type if available
  if (seo.structuredData.additionalType) {
    schema.additionalType = `https://schema.org/${seo.structuredData.additionalType}`;
  }

  // Add services as offered items
  if (partnerData.services.length > 0) {
    schema.hasOfferCatalog = {
      "@type": "OfferCatalog",
      "name": `${partnerData.name} Services`,
      "itemListElement": partnerData.services.map((service, index) => ({
        "@type": "Offer",
        "position": index + 1,
        "itemOffered": {
          "@type": "Service",
          "name": service
        }
      }))
    };
  }

  return schema;
}

// Generate breadcrumb structured data
export function generateBreadcrumbSchema(partnerId: string, partnerName: string) {
  const baseUrl = "https://aurelia-privateconcierge.com";
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Partners",
        "item": `${baseUrl}/#partners`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": partnerName,
        "item": `${baseUrl}/partners/${partnerId}`
      }
    ]
  };
}

// Get SEO data with fallback for unknown partners
export function getPartnerSEO(partnerId: string, partnerData?: {
  name: string;
  category: string;
  tagline: string;
  description: string;
}): PartnerSEO {
  if (partnerSEOData[partnerId]) {
    return partnerSEOData[partnerId];
  }

  // Generate fallback SEO for unknown partners
  if (partnerData) {
    return {
      title: `${partnerData.name} - ${partnerData.category} | Aurelia Partner`,
      metaDescription: `${partnerData.description.slice(0, 155)}...`,
      keywords: [
        partnerData.category.toLowerCase(),
        "luxury service",
        "premium partner",
        "aurelia concierge",
        "UHNW services"
      ],
      h1: partnerData.name,
      h2Suggestions: [partnerData.tagline],
      marketingCopy: {
        tagline: partnerData.tagline,
        valueProposition: partnerData.description,
        callToAction: "Contact Aurelia to book"
      },
      structuredData: {
        type: "Service",
        serviceType: partnerData.category,
        areaServed: ["Worldwide"],
        priceRange: "$$$$"
      },
      canonicalPath: `/partners/${partnerId}`
    };
  }

  // Ultimate fallback
  return {
    title: "Aurelia Partner | Premium Luxury Services",
    metaDescription: "Discover premium luxury services through Aurelia's exclusive partner network. By invitation only.",
    keywords: ["luxury concierge", "premium services", "UHNW"],
    h1: "Aurelia Partner",
    h2Suggestions: [],
    marketingCopy: {
      tagline: "Excellence Redefined",
      valueProposition: "Premium services through Aurelia",
      callToAction: "Contact us"
    },
    structuredData: {
      type: "Service",
      priceRange: "$$$$"
    },
    canonicalPath: "/partners"
  };
}

// Marketing-focused FAQ schema for partner pages
export function generatePartnerFAQSchema(partnerId: string, partnerName: string, category: string) {
  const faqs: { question: string; answer: string }[] = [];

  // Generic partner FAQs
  faqs.push({
    question: `How do I book ${partnerName} services through Aurelia?`,
    answer: `Aurelia members can request ${partnerName} services directly through their dedicated concierge or via the Orla AI assistant. Simply describe your requirements and our team will coordinate everything.`
  });

  faqs.push({
    question: `Is ${partnerName} available in my location?`,
    answer: `${partnerName} operates globally with priority coverage in major metropolitan areas. Contact your Aurelia concierge to confirm availability in your specific location.`
  });

  faqs.push({
    question: `What makes ${partnerName} an Aurelia preferred partner?`,
    answer: `${partnerName} has been vetted through Aurelia's rigorous partner selection process, meeting our standards for excellence, discretion, and service quality expected by UHNW clients.`
  });

  // Category-specific FAQs
  if (category === "Security & Chauffeur") {
    faqs.push({
      question: `What security credentials does ${partnerName} personnel have?`,
      answer: `${partnerName} employs former government, military, and law enforcement professionals with extensive backgrounds in executive protection and secure transport.`
    });
  }

  if (category === "Logistics & Removals") {
    faqs.push({
      question: `Does ${partnerName} offer insurance for high-value items?`,
      answer: `Yes, ${partnerName} provides comprehensive insurance coverage for all deliveries and removals. Additional coverage for high-value art, antiques, and luxury items is available.`
    });
  }

  if (category === "AI Technology") {
    faqs.push({
      question: `How long does a typical ${partnerName} project take?`,
      answer: `Most projects are delivered within 2-4 weeks, with ongoing support and maintenance available. Expedited timelines can be arranged for priority requirements.`
    });
  }

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
}

// All partner-related keywords for sitemap and internal linking
export const allPartnerKeywords = [
  // Chauffeur & Security
  "luxury chauffeur London",
  "executive protection service",
  "armored car rental",
  "VIP security escort",
  "celebrity bodyguard service",
  "private driver hire",
  
  // Courier & Removals
  "premium courier UK",
  "luxury house removal",
  "same day delivery service",
  "white glove movers",
  "high value courier",
  "art and antique movers",
  
  // Web Design
  "luxury brand web design",
  "AI website development",
  "bespoke digital agency",
  "UHNW web development",
  "luxury e-commerce design",
  
  // General
  "Aurelia partners",
  "luxury concierge partners",
  "premium service providers",
  "UHNW service network",
  "billionaire services"
];
