// Marketing Packages for UHNW Client Acquisition
// Strategic advertising and partnership opportunities

export interface MarketingPackage {
  id: string;
  name: string;
  description: string;
  channels: string[];
  targetAudience: string[];
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  expectedReach: string;
  duration: string;
  features: string[];
  roi: string;
}

export const MARKETING_PACKAGES: MarketingPackage[] = [
  {
    id: "platinum-launch",
    name: "Platinum Launch Package",
    description: "Comprehensive launch campaign targeting UHNW networks globally",
    channels: [
      "LinkedIn Premium Ads",
      "Financial Times",
      "Bloomberg",
      "Robb Report",
      "Private Jet Card Comparisons",
    ],
    targetAudience: [
      "C-Suite Executives",
      "Family Office Principals",
      "Private Equity Partners",
      "Hedge Fund Managers",
      "Tech Entrepreneurs",
    ],
    budget: { min: 50000, max: 150000, currency: "USD" },
    expectedReach: "500K-2M UHNW impressions",
    duration: "3 months",
    features: [
      "Custom video production",
      "Native advertising placements",
      "Sponsored content series",
      "Influencer partnerships",
      "Event sponsorships",
    ],
    roi: "15-25 qualified leads per month",
  },
  {
    id: "private-banking",
    name: "Private Banking Network",
    description: "Direct partnerships with private banks and wealth managers",
    channels: [
      "UBS Partner Program",
      "Credit Suisse Referrals",
      "JP Morgan Private Bank",
      "Goldman Sachs PWM",
      "Family Office Networks",
    ],
    targetAudience: [
      "Private Banking Clients",
      "Wealth Management Clients",
      "Family Office Members",
      "Trust Beneficiaries",
    ],
    budget: { min: 25000, max: 75000, currency: "USD" },
    expectedReach: "Direct access to 10K+ UHNW individuals",
    duration: "12 months",
    features: [
      "Co-branded materials",
      "Client event access",
      "Referral fee structure",
      "White-label services",
      "Quarterly presentations",
    ],
    roi: "5-10 high-value conversions per quarter",
  },
  {
    id: "luxury-publications",
    name: "Luxury Publication Bundle",
    description: "Premium placements in top-tier luxury publications",
    channels: [
      "Robb Report",
      "Departures",
      "Elite Traveler",
      "Boat International",
      "Architectural Digest",
    ],
    targetAudience: [
      "Luxury Enthusiasts",
      "High-Net-Worth Collectors",
      "Superyacht Owners",
      "Private Jet Users",
    ],
    budget: { min: 75000, max: 200000, currency: "USD" },
    expectedReach: "3-5M affluent readers",
    duration: "6 months",
    features: [
      "Full-page advertisements",
      "Advertorial content",
      "Digital banner placements",
      "Newsletter inclusions",
      "Social media amplification",
    ],
    roi: "Brand awareness + 20-30 inquiries per month",
  },
  {
    id: "digital-premium",
    name: "Digital Premium Package",
    description: "Targeted digital advertising to verified wealthy audiences",
    channels: [
      "LinkedIn Sales Navigator",
      "Google Ads (Luxury Intent)",
      "Facebook Wealth Targeting",
      "Programmatic Display",
      "Reddit r/fatFIRE",
    ],
    targetAudience: [
      "Tech Executives",
      "Startup Founders",
      "Crypto Wealthy",
      "Young Affluents",
      "Serial Entrepreneurs",
    ],
    budget: { min: 15000, max: 50000, currency: "USD" },
    expectedReach: "1-3M targeted impressions",
    duration: "3 months",
    features: [
      "Lookalike audience creation",
      "Retargeting campaigns",
      "A/B testing optimization",
      "Conversion tracking",
      "Weekly reporting",
    ],
    roi: "8-15 qualified leads per month",
  },
  {
    id: "event-sponsorship",
    name: "Elite Event Sponsorship",
    description: "Presence at exclusive UHNW gatherings and events",
    channels: [
      "Monaco Yacht Show",
      "Art Basel",
      "Pebble Beach Concours",
      "World Economic Forum",
      "Milken Institute Conference",
    ],
    targetAudience: [
      "Event Attendees",
      "Industry Leaders",
      "Celebrity Clients",
      "Media & Press",
    ],
    budget: { min: 100000, max: 500000, currency: "USD" },
    expectedReach: "Direct networking with 500-2000 UHNW individuals",
    duration: "Per event",
    features: [
      "VIP booth presence",
      "Exclusive dinner hosting",
      "Speaking opportunities",
      "Press coverage",
      "Attendee list access",
    ],
    roi: "2-5 high-value clients per event",
  },
  {
    id: "influencer-elite",
    name: "Elite Influencer Program",
    description: "Partnerships with verified wealthy lifestyle influencers",
    channels: [
      "Instagram (Verified UHNW)",
      "YouTube Luxury",
      "TikTok Affluent",
      "Podcast Sponsorships",
      "Newsletter Partnerships",
    ],
    targetAudience: [
      "Aspiring Affluents",
      "Young Professionals",
      "Lifestyle Followers",
      "Crypto/Tech Community",
    ],
    budget: { min: 20000, max: 100000, currency: "USD" },
    expectedReach: "5-20M engaged followers",
    duration: "6 months",
    features: [
      "Sponsored content creation",
      "Experience documentation",
      "Exclusive access stories",
      "Affiliate tracking",
      "Cross-promotion",
    ],
    roi: "Brand awareness + 15-25 waitlist signups per campaign",
  },
];

// UHNW Networks and Platforms
export const UHNW_NETWORKS = [
  {
    name: "Tiger 21",
    description: "Peer network of ultra-high-net-worth entrepreneurs and investors",
    memberRequirement: "$10M+ investable assets",
    accessMethod: "Member referral partnership",
  },
  {
    name: "YPO (Young Presidents' Organization)",
    description: "Global leadership community of chief executives",
    memberRequirement: "CEO/President with $10M+ revenue company",
    accessMethod: "Chapter sponsorship",
  },
  {
    name: "Entrepreneurs' Organization",
    description: "Global business network for entrepreneurs",
    memberRequirement: "$1M+ annual revenue business owner",
    accessMethod: "Event sponsorship",
  },
  {
    name: "Family Office Exchange",
    description: "Network connecting family offices globally",
    memberRequirement: "Single/Multi-family office",
    accessMethod: "Vendor partnership",
  },
  {
    name: "Campden Wealth",
    description: "Research and events for family offices",
    memberRequirement: "Family office or wealth holder",
    accessMethod: "Event participation",
  },
  {
    name: "Private Wealth Network",
    description: "Networking events for UHNW individuals",
    memberRequirement: "$30M+ net worth",
    accessMethod: "Event sponsorship",
  },
  {
    name: "Quintessentially",
    description: "Luxury lifestyle management company",
    memberRequirement: "Existing members",
    accessMethod: "Strategic partnership",
  },
];

// Social Media Strategy for UHNW
export const SOCIAL_STRATEGY = {
  linkedin: {
    targeting: [
      "C-Suite titles",
      "Company size 500+",
      "Industry: Finance, Tech, Legal, Healthcare",
      "Seniority: Director and above",
      "Interests: Luxury travel, Private aviation, Fine wine",
    ],
    contentTypes: [
      "Thought leadership articles",
      "Client success stories (anonymized)",
      "Industry insights",
      "Exclusive access previews",
      "Team expertise highlights",
    ],
    postingFrequency: "3-4x per week",
    budget: "$5,000-15,000/month",
  },
  instagram: {
    targeting: [
      "Interests: Luxury, Travel, Yachts, Private jets",
      "Behaviors: Frequent travelers, Luxury purchasers",
      "Lookalikes: Existing client base",
      "Location: Major financial centers",
    ],
    contentTypes: [
      "Lifestyle imagery",
      "Behind-the-scenes access",
      "Destination highlights",
      "Exclusive experiences",
      "Partner showcases",
    ],
    postingFrequency: "Daily stories, 4-5 posts per week",
    budget: "$3,000-10,000/month",
  },
  twitter: {
    targeting: [
      "Followers of luxury brands",
      "Tech executives",
      "Financial influencers",
      "Travel enthusiasts",
    ],
    contentTypes: [
      "Industry news commentary",
      "Quick tips",
      "Event updates",
      "Engagement with industry leaders",
    ],
    postingFrequency: "2-3x per day",
    budget: "$1,000-3,000/month",
  },
};

// Calculate total marketing investment
export const calculateMarketingBudget = (
  selectedPackages: string[]
): { min: number; max: number } => {
  const selected = MARKETING_PACKAGES.filter(pkg => 
    selectedPackages.includes(pkg.id)
  );
  
  return {
    min: selected.reduce((sum, pkg) => sum + pkg.budget.min, 0),
    max: selected.reduce((sum, pkg) => sum + pkg.budget.max, 0),
  };
};
