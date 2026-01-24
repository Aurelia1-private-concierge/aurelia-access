// LinkedIn Skills & Endorsements Strategy for Aurelia Team
// Copy these to your LinkedIn profile

export const LINKEDIN_TOP_SKILLS = {
  // Primary Skills (Top 3 - Most Important)
  primary: [
    "Luxury Lifestyle Management",
    "Private Client Services", 
    "UHNW Relationship Management"
  ],

  // Secondary Skills (4-10)
  secondary: [
    "Private Aviation Coordination",
    "Bespoke Travel Planning",
    "VIP Event Management",
    "Executive Concierge Services",
    "High-Net-Worth Client Relations",
    "Luxury Real Estate Advisory",
    "Art & Collectibles Procurement"
  ],

  // Supporting Skills (11-50)
  supporting: [
    "Crisis Management",
    "Yacht Charter Coordination",
    "Family Office Services",
    "Estate Management",
    "Security Coordination",
    "White-Glove Service Delivery",
    "Luxury Brand Partnerships",
    "Hospitality Management",
    "International Protocol",
    "Discretion & Confidentiality",
    "AI-Powered Service Delivery",
    "Digital Concierge Platforms",
    "Wellness Tourism",
    "Fine Dining Reservations",
    "Luxury Automotive",
    "Private Member Clubs",
    "Legacy Planning",
    "Philanthropy Advisory",
    "Cultural Experiences",
    "Adventure Travel"
  ]
} as const;

export const LINKEDIN_HEADLINE_OPTIONS = [
  "Private Concierge | Luxury Lifestyle Management | UHNW Client Services",
  "Executive Concierge Specialist | Private Aviation & Yacht | Aurelia",
  "Luxury Travel Curator | Bespoke Experiences for Discerning Clients",
  "UHNW Lifestyle Manager | Art, Travel & Exclusive Access | Aurelia",
  "White-Glove Concierge | Turning Impossibility into Itinerary"
];

export const LINKEDIN_SUMMARY_TEMPLATE = `
As a member of Aurelia's elite concierge team, I orchestrate extraordinary experiences for the world's most discerning individuals and families.

𝗘𝘅𝗽𝗲𝗿𝘁𝗶𝘀𝗲:
→ Private aviation & yacht charter coordination
→ Bespoke travel itineraries across 50+ countries
→ Art acquisition & collectibles advisory
→ Exclusive event & restaurant access
→ Real estate & property services
→ Executive protection liaison

𝗧𝗵𝗲 𝗔𝘂𝗿𝗲𝗹𝗶𝗮 𝗗𝗶𝗳𝗳𝗲𝗿𝗲𝗻𝗰𝗲:
We don't just fulfill requests—we anticipate desires before they're voiced. Our AI concierge, Orla, combined with human expertise, delivers a level of service that redefines what's possible.

One request. Any desire. Anywhere on Earth.

🔒 Confidentiality is sacrosanct. We operate with Swiss-bank discretion.

Let's connect: concierge@aurelia-privateconcierge.com
`;

export const LINKEDIN_FEATURED_SKILLS = [
  { skill: "Luxury Lifestyle Management", endorsements: "Request from UHNW clients" },
  { skill: "Private Client Services", endorsements: "Request from partners" },
  { skill: "Bespoke Travel Planning", endorsements: "Request from colleagues" }
];

export const getAllSkillsForLinkedIn = (): string[] => [
  ...LINKEDIN_TOP_SKILLS.primary,
  ...LINKEDIN_TOP_SKILLS.secondary,
  ...LINKEDIN_TOP_SKILLS.supporting
];

export const getTopSkillsCount = (): number => 
  LINKEDIN_TOP_SKILLS.primary.length + 
  LINKEDIN_TOP_SKILLS.secondary.length + 
  LINKEDIN_TOP_SKILLS.supporting.length;
