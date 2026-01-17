// Discovery service intake question configuration
export type QuestionType = "select" | "multiselect" | "text" | "textarea";

export interface IntakeQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface CategoryIntake {
  categoryId: string;
  categoryName: string;
  questions: IntakeQuestion[];
}

// Tier-based response times (in hours)
export const tierResponseTimes = {
  silver: {
    initial: 48,
    options: 72,
    fulfillment: "Standard",
  },
  gold: {
    initial: 24,
    options: 48,
    fulfillment: "Priority",
  },
  platinum: {
    initial: 4,
    options: 24,
    fulfillment: "Immediate",
  },
};

export const discoveryIntakeConfig: CategoryIntake[] = [
  {
    categoryId: "sleep-architecture",
    categoryName: "Sleep Architecture",
    questions: [
      {
        id: "current_issues",
        question: "What sleep challenges are you currently experiencing?",
        type: "multiselect",
        options: [
          "Difficulty falling asleep",
          "Waking during the night",
          "Light sensitivity",
          "Noise disturbances",
          "Temperature regulation",
          "Partner disturbance",
          "Travel/jet lag recovery",
        ],
        required: true,
      },
      {
        id: "bedroom_size",
        question: "What are your primary bedroom dimensions?",
        type: "select",
        options: [
          "Under 200 sq ft",
          "200-400 sq ft",
          "400-600 sq ft",
          "Over 600 sq ft",
          "Multiple residences",
        ],
      },
      {
        id: "light_sensitivity",
        question: "How would you describe your light sensitivity?",
        type: "select",
        options: [
          "Minimal - can sleep with some light",
          "Moderate - prefer darkness",
          "High - need complete darkness",
          "Variable - depends on circumstances",
        ],
        required: true,
      },
      {
        id: "additional_notes",
        question: "Any additional details about your sleep environment or goals?",
        type: "textarea",
        placeholder: "E.g., existing mattress brand, health conditions, travel frequency...",
      },
    ],
  },
  {
    categoryId: "digital-estate",
    categoryName: "Digital Estate Planning",
    questions: [
      {
        id: "crypto_holdings",
        question: "What types of digital assets do you hold?",
        type: "multiselect",
        options: [
          "Cryptocurrency (Bitcoin, Ethereum, etc.)",
          "NFTs and digital collectibles",
          "Domain names",
          "Digital businesses/platforms",
          "Cloud storage with important files",
          "Social media accounts",
          "Gaming accounts with value",
        ],
        required: true,
      },
      {
        id: "account_complexity",
        question: "Approximately how many significant digital accounts require management?",
        type: "select",
        options: [
          "Under 20 accounts",
          "20-50 accounts",
          "50-100 accounts",
          "Over 100 accounts",
        ],
      },
      {
        id: "beneficiaries",
        question: "How many family members or beneficiaries should have access?",
        type: "select",
        options: ["1-2 individuals", "3-5 individuals", "6+ individuals", "Corporate structure"],
        required: true,
      },
      {
        id: "urgency",
        question: "What is your timeline for establishing this plan?",
        type: "select",
        options: [
          "Immediate - within 2 weeks",
          "Short-term - within 1 month",
          "Medium-term - within 3 months",
          "Planning phase - no rush",
        ],
      },
    ],
  },
  {
    categoryId: "reputation-sentinel",
    categoryName: "Reputation Sentinel",
    questions: [
      {
        id: "public_profile",
        question: "What is your current public profile level?",
        type: "select",
        options: [
          "High-profile public figure",
          "Industry leader/executive",
          "Moderate public presence",
          "Private individual seeking protection",
        ],
        required: true,
      },
      {
        id: "previous_incidents",
        question: "Have you experienced any reputation incidents in the past?",
        type: "select",
        options: [
          "Yes - currently dealing with an issue",
          "Yes - resolved in the past",
          "No - preventive protection only",
          "Prefer to discuss privately",
        ],
      },
      {
        id: "priority_platforms",
        question: "Which platforms require the most attention?",
        type: "multiselect",
        options: [
          "Google Search results",
          "LinkedIn",
          "Twitter/X",
          "Instagram",
          "News publications",
          "Industry-specific platforms",
          "Dark web monitoring",
        ],
        required: true,
      },
      {
        id: "coverage_regions",
        question: "Which geographic regions are most important for reputation management?",
        type: "multiselect",
        options: ["North America", "Europe", "Asia Pacific", "Middle East", "Global coverage"],
      },
    ],
  },
  {
    categoryId: "legacy-curation",
    categoryName: "Legacy Curation",
    questions: [
      {
        id: "generations",
        question: "How many generations would you like to document?",
        type: "select",
        options: [
          "Current generation only",
          "2-3 generations",
          "4-5 generations",
          "Comprehensive family history",
        ],
        required: true,
      },
      {
        id: "existing_archives",
        question: "What existing materials do you have?",
        type: "multiselect",
        options: [
          "Physical photographs",
          "Documents and letters",
          "Video recordings",
          "Audio recordings",
          "Heirlooms and artifacts",
          "Digital files",
          "Previous family research",
        ],
      },
      {
        id: "preferred_format",
        question: "What is your preferred final format?",
        type: "multiselect",
        options: [
          "Coffee table book",
          "Digital archive",
          "Video documentary",
          "Interactive website",
          "Museum-quality display",
          "All of the above",
        ],
        required: true,
      },
      {
        id: "special_focus",
        question: "Any particular stories or themes to emphasize?",
        type: "textarea",
        placeholder: "E.g., immigration story, business legacy, cultural heritage...",
      },
    ],
  },
  {
    categoryId: "longevity-concierge",
    categoryName: "Longevity Concierge",
    questions: [
      {
        id: "health_focus",
        question: "What are your primary health and longevity goals?",
        type: "multiselect",
        options: [
          "Preventive health optimization",
          "Specific condition management",
          "Peak performance enhancement",
          "Mental clarity and cognitive health",
          "Sleep optimization",
          "Stress management",
          "Anti-aging treatments",
        ],
        required: true,
      },
      {
        id: "approach_preference",
        question: "What approach resonates most with you?",
        type: "select",
        options: [
          "Cutting-edge medical technology",
          "Holistic and integrative",
          "Evidence-based conventional",
          "Combination of all approaches",
        ],
        required: true,
      },
      {
        id: "travel_flexibility",
        question: "Are you open to traveling for specialized treatments?",
        type: "select",
        options: [
          "Yes - anywhere in the world",
          "Yes - within my region",
          "Prefer local options",
          "Prefer in-home services",
        ],
      },
      {
        id: "current_tracking",
        question: "What health tracking do you currently use?",
        type: "multiselect",
        options: [
          "Wearable devices (Oura, Apple Watch, etc.)",
          "Regular blood panels",
          "Genetic testing completed",
          "Working with functional medicine doctor",
          "None currently",
        ],
      },
    ],
  },
  {
    categoryId: "signature-scent",
    categoryName: "Signature Scent",
    questions: [
      {
        id: "scent_preferences",
        question: "What scent families appeal to you?",
        type: "multiselect",
        options: [
          "Fresh and citrus",
          "Woody and earthy",
          "Floral",
          "Oriental and spicy",
          "Aquatic",
          "Gourmand (sweet, edible notes)",
          "Green and herbal",
        ],
        required: true,
      },
      {
        id: "application_spaces",
        question: "Where will the scent be applied?",
        type: "multiselect",
        options: [
          "Personal fragrance",
          "Primary residence",
          "Secondary homes",
          "Office space",
          "Private aircraft",
          "Yacht",
          "Vehicle",
        ],
        required: true,
      },
      {
        id: "existing_favorites",
        question: "What fragrances do you currently enjoy?",
        type: "textarea",
        placeholder: "List any perfumes, colognes, or scents you've loved...",
      },
      {
        id: "seasonal_variations",
        question: "Would you like seasonal variations?",
        type: "select",
        options: [
          "Yes - different scents for different seasons",
          "Yes - subtle seasonal adjustments",
          "No - one consistent signature",
        ],
      },
    ],
  },
  {
    categoryId: "companion-matching",
    categoryName: "Companion Matching",
    questions: [
      {
        id: "occasion_types",
        question: "For what occasions do you need companionship?",
        type: "multiselect",
        options: [
          "Travel companionship",
          "Dining partners",
          "Cultural events",
          "Business functions",
          "Sports and recreation",
          "Intellectual conversation",
        ],
        required: true,
      },
      {
        id: "language_preferences",
        question: "What languages are important?",
        type: "multiselect",
        options: [
          "English",
          "French",
          "Spanish",
          "German",
          "Italian",
          "Mandarin",
          "Japanese",
          "Arabic",
          "Other",
        ],
        required: true,
      },
      {
        id: "cultural_interests",
        question: "What cultural or intellectual interests should be shared?",
        type: "multiselect",
        options: [
          "Fine arts and museums",
          "Classical music and opera",
          "Contemporary culture",
          "Literature and philosophy",
          "Wine and gastronomy",
          "Sports and fitness",
          "Technology and innovation",
          "Travel and exploration",
        ],
      },
      {
        id: "additional_requirements",
        question: "Any additional preferences or requirements?",
        type: "textarea",
        placeholder: "E.g., age range, professional background, specific expertise...",
      },
    ],
  },
  {
    categoryId: "private-meteorology",
    categoryName: "Private Meteorology",
    questions: [
      {
        id: "primary_use",
        question: "What is your primary use case?",
        type: "select",
        options: [
          "Yacht/sailing operations",
          "Private aviation",
          "Outdoor events",
          "Travel planning",
          "Agricultural/estate management",
          "Multiple use cases",
        ],
        required: true,
      },
      {
        id: "geographic_focus",
        question: "What regions require monitoring?",
        type: "multiselect",
        options: [
          "Mediterranean",
          "Caribbean",
          "North Atlantic",
          "Pacific",
          "Indian Ocean",
          "Specific locations (specify)",
        ],
        required: true,
      },
      {
        id: "notification_prefs",
        question: "How would you like to receive forecasts?",
        type: "multiselect",
        options: [
          "Mobile app notifications",
          "Daily briefing email",
          "SMS alerts for changes",
          "Direct call for critical updates",
          "Integration with yacht/aircraft systems",
        ],
      },
      {
        id: "forecast_frequency",
        question: "How frequently do you need updates?",
        type: "select",
        options: [
          "On-demand only",
          "Daily during active periods",
          "Multiple times daily",
          "Continuous monitoring",
        ],
      },
    ],
  },
  {
    categoryId: "second-passport",
    categoryName: "Second Passport Advisory",
    questions: [
      {
        id: "target_countries",
        question: "Which regions or countries interest you?",
        type: "multiselect",
        options: [
          "European Union",
          "Caribbean",
          "Middle East",
          "Asia Pacific",
          "North America",
          "Open to recommendations",
        ],
        required: true,
      },
      {
        id: "timeline",
        question: "What is your target timeline?",
        type: "select",
        options: [
          "Urgent - fastest possible route",
          "1-2 years",
          "3-5 years",
          "Long-term planning (5+ years)",
        ],
        required: true,
      },
      {
        id: "investment_range",
        question: "What investment range are you considering?",
        type: "select",
        options: [
          "Under $250,000",
          "$250,000 - $500,000",
          "$500,000 - $1,000,000",
          "$1,000,000 - $2,000,000",
          "Over $2,000,000",
          "Prefer to discuss privately",
        ],
      },
      {
        id: "primary_motivation",
        question: "What is your primary motivation?",
        type: "multiselect",
        options: [
          "Travel freedom",
          "Tax optimization",
          "Business expansion",
          "Family security",
          "Political stability",
          "Quality of life",
        ],
      },
    ],
  },
  {
    categoryId: "household-optimization",
    categoryName: "Household Optimization",
    questions: [
      {
        id: "property_details",
        question: "What type of properties require optimization?",
        type: "multiselect",
        options: [
          "Primary residence",
          "Secondary home",
          "Urban apartment",
          "Country estate",
          "Beach property",
          "Multiple properties",
        ],
        required: true,
      },
      {
        id: "staff_count",
        question: "What is your current household staff count?",
        type: "select",
        options: [
          "No current staff",
          "1-3 staff members",
          "4-10 staff members",
          "10+ staff members",
        ],
      },
      {
        id: "smart_home_status",
        question: "What is your current smart home setup?",
        type: "select",
        options: [
          "No smart home systems",
          "Basic automation",
          "Moderate integration",
          "Comprehensive but needs optimization",
        ],
        required: true,
      },
      {
        id: "priority_areas",
        question: "What areas need the most attention?",
        type: "multiselect",
        options: [
          "Staff recruitment and training",
          "Smart home integration",
          "Vendor management",
          "Security systems",
          "Energy efficiency",
          "Maintenance scheduling",
          "Inventory management",
        ],
      },
    ],
  },
];

export const getIntakeConfigByCategory = (categoryId: string): CategoryIntake | undefined => {
  return discoveryIntakeConfig.find((config) => config.categoryId === categoryId);
};

export const isDiscoveryService = (categoryId: string): boolean => {
  return discoveryIntakeConfig.some((config) => config.categoryId === categoryId);
};
