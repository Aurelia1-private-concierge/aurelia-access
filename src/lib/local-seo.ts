/**
 * Local SEO Configuration for Key Wealth Markets
 * Geographic targeting and schema markup for luxury concierge services
 */

export interface LocalMarket {
  id: string;
  city: string;
  country: string;
  region: string;
  priority: number;
  timezone: string;
  currency: string;
  languages: string[];
  keywords: string[];
  landingPageUrl?: string;
  gbpClaimed: boolean;
  citationsCount: number;
  schemaImplemented: boolean;
}

export const WEALTH_CENTERS: Omit<LocalMarket, 'id' | 'gbpClaimed' | 'citationsCount' | 'schemaImplemented' | 'landingPageUrl'>[] = [
  {
    city: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    priority: 1,
    timezone: 'Europe/London',
    currency: 'GBP',
    languages: ['en-GB'],
    keywords: [
      'luxury concierge London',
      'private concierge Mayfair',
      'VIP services London',
      'personal assistant London',
      'lifestyle management UK',
      'bespoke concierge services',
    ],
  },
  {
    city: 'Monaco',
    country: 'Monaco',
    region: 'Europe',
    priority: 2,
    timezone: 'Europe/Monaco',
    currency: 'EUR',
    languages: ['fr', 'en'],
    keywords: [
      'concierge Monaco',
      'luxury lifestyle Monaco',
      'private services Monte Carlo',
      'yacht concierge Monaco',
      'VIP services French Riviera',
    ],
  },
  {
    city: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    priority: 3,
    timezone: 'Asia/Dubai',
    currency: 'AED',
    languages: ['en', 'ar'],
    keywords: [
      'luxury concierge Dubai',
      'VIP services UAE',
      'private concierge Emirates',
      'lifestyle management Dubai',
      'personal assistant Dubai',
    ],
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    priority: 4,
    timezone: 'Asia/Singapore',
    currency: 'SGD',
    languages: ['en', 'zh', 'ms'],
    keywords: [
      'luxury concierge Singapore',
      'private services Singapore',
      'VIP concierge Asia',
      'lifestyle management Singapore',
      'personal assistant Singapore',
    ],
  },
  {
    city: 'New York',
    country: 'USA',
    region: 'North America',
    priority: 5,
    timezone: 'America/New_York',
    currency: 'USD',
    languages: ['en-US'],
    keywords: [
      'luxury concierge NYC',
      'private concierge Manhattan',
      'VIP services New York',
      'personal assistant New York',
      'lifestyle management NYC',
    ],
  },
  {
    city: 'Geneva',
    country: 'Switzerland',
    region: 'Europe',
    priority: 6,
    timezone: 'Europe/Zurich',
    currency: 'CHF',
    languages: ['fr', 'de', 'en'],
    keywords: [
      'concierge Geneva',
      'luxury services Switzerland',
      'private banking concierge',
      'VIP services Geneva',
      'lifestyle management Switzerland',
    ],
  },
  {
    city: 'Hong Kong',
    country: 'China',
    region: 'Asia',
    priority: 7,
    timezone: 'Asia/Hong_Kong',
    currency: 'HKD',
    languages: ['en', 'zh-HK'],
    keywords: [
      'luxury concierge Hong Kong',
      'VIP services HK',
      'private concierge Asia',
      'lifestyle management Hong Kong',
      'personal assistant HK',
    ],
  },
  {
    city: 'Zurich',
    country: 'Switzerland',
    region: 'Europe',
    priority: 8,
    timezone: 'Europe/Zurich',
    currency: 'CHF',
    languages: ['de', 'en'],
    keywords: [
      'concierge Zurich',
      'luxury services Zurich',
      'private wealth concierge',
      'VIP services Switzerland',
    ],
  },
  {
    city: 'Paris',
    country: 'France',
    region: 'Europe',
    priority: 9,
    timezone: 'Europe/Paris',
    currency: 'EUR',
    languages: ['fr', 'en'],
    keywords: [
      'concierge de luxe Paris',
      'services VIP Paris',
      'concierge privé France',
      'luxury lifestyle Paris',
    ],
  },
  {
    city: 'Los Angeles',
    country: 'USA',
    region: 'North America',
    priority: 10,
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    languages: ['en-US'],
    keywords: [
      'luxury concierge Los Angeles',
      'VIP services LA',
      'private concierge Beverly Hills',
      'lifestyle management California',
    ],
  },
];

// Generate LocalBusiness schema for a market
export const generateLocalBusinessSchema = (market: LocalMarket, businessInfo: {
  name: string;
  description: string;
  url: string;
  logo: string;
  phone: string;
  email: string;
}): object => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${businessInfo.url}#${market.city.toLowerCase().replace(/\s/g, '-')}`,
  name: `${businessInfo.name} - ${market.city}`,
  description: `${businessInfo.description} serving ${market.city}, ${market.country}`,
  url: market.landingPageUrl || `${businessInfo.url}/${market.city.toLowerCase().replace(/\s/g, '-')}`,
  logo: businessInfo.logo,
  image: businessInfo.logo,
  telephone: businessInfo.phone,
  email: businessInfo.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: market.city,
    addressCountry: market.country,
    addressRegion: market.region,
  },
  areaServed: {
    '@type': 'City',
    name: market.city,
    containedInPlace: {
      '@type': 'Country',
      name: market.country,
    },
  },
  priceRange: '$$$$',
  currenciesAccepted: market.currency,
  paymentAccepted: 'Credit Card, Wire Transfer',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  sameAs: [
    'https://www.linkedin.com/company/aurelia-concierge',
    'https://www.instagram.com/aureliaconcierge',
    'https://twitter.com/aureliaconcierge',
  ],
});

// Citation sources for local SEO
export interface CitationSource {
  name: string;
  url: string;
  type: 'directory' | 'social' | 'industry' | 'review';
  priority: 'high' | 'medium' | 'low';
  claimed: boolean;
}

export const CITATION_SOURCES: Omit<CitationSource, 'claimed'>[] = [
  // High Priority Directories
  { name: 'Google Business Profile', url: 'https://business.google.com', type: 'directory', priority: 'high' },
  { name: 'LinkedIn Company Page', url: 'https://linkedin.com', type: 'social', priority: 'high' },
  { name: 'Yelp for Business', url: 'https://biz.yelp.com', type: 'review', priority: 'high' },
  { name: 'Apple Maps Connect', url: 'https://mapsconnect.apple.com', type: 'directory', priority: 'high' },
  { name: 'Bing Places', url: 'https://bingplaces.com', type: 'directory', priority: 'high' },
  
  // Industry Specific
  { name: 'Luxury Lifestyle Awards', url: 'https://luxurylifestyleawards.com', type: 'industry', priority: 'high' },
  { name: 'Virtuoso', url: 'https://virtuoso.com', type: 'industry', priority: 'high' },
  { name: 'Traveller Made', url: 'https://travellermade.com', type: 'industry', priority: 'medium' },
  
  // Medium Priority
  { name: 'Facebook Business', url: 'https://facebook.com/business', type: 'social', priority: 'medium' },
  { name: 'TripAdvisor', url: 'https://tripadvisor.com', type: 'review', priority: 'medium' },
  { name: 'Trustpilot', url: 'https://trustpilot.com', type: 'review', priority: 'medium' },
  { name: 'Crunchbase', url: 'https://crunchbase.com', type: 'directory', priority: 'medium' },
  
  // Lower Priority
  { name: 'Yellow Pages', url: 'https://yellowpages.com', type: 'directory', priority: 'low' },
  { name: 'BBB', url: 'https://bbb.org', type: 'directory', priority: 'low' },
  { name: 'Foursquare', url: 'https://foursquare.com', type: 'directory', priority: 'low' },
];

// SEO keyword clusters by intent
export interface KeywordCluster {
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  cluster: string;
  keywords: string[];
  avgSearchVolume: number;
  difficulty: 'low' | 'medium' | 'high';
  priority: number;
}

export const KEYWORD_CLUSTERS: KeywordCluster[] = [
  {
    intent: 'transactional',
    cluster: 'Hire Concierge',
    keywords: [
      'hire private concierge',
      'luxury concierge services near me',
      'personal concierge cost',
      'best private concierge service',
    ],
    avgSearchVolume: 2400,
    difficulty: 'high',
    priority: 1,
  },
  {
    intent: 'commercial',
    cluster: 'Compare Services',
    keywords: [
      'quintessentially vs velocity black',
      'best luxury concierge companies',
      'top concierge services for wealthy',
      'luxury concierge comparison',
    ],
    avgSearchVolume: 1800,
    difficulty: 'medium',
    priority: 2,
  },
  {
    intent: 'informational',
    cluster: 'What is Concierge',
    keywords: [
      'what does a private concierge do',
      'benefits of concierge service',
      'concierge service meaning',
      'luxury lifestyle management',
    ],
    avgSearchVolume: 5600,
    difficulty: 'low',
    priority: 3,
  },
  {
    intent: 'navigational',
    cluster: 'Specific Services',
    keywords: [
      'private jet concierge',
      'yacht charter concierge',
      'real estate concierge services',
      'travel concierge for wealthy',
    ],
    avgSearchVolume: 3200,
    difficulty: 'medium',
    priority: 4,
  },
];

// Content gap analysis helper
export const analyzeContentGaps = (
  existingContent: string[],
  targetKeywords: string[]
): { covered: string[]; gaps: string[]; coverage: number } => {
  const normalizedContent = existingContent.map(c => c.toLowerCase());
  const covered: string[] = [];
  const gaps: string[] = [];

  targetKeywords.forEach(keyword => {
    const normalizedKeyword = keyword.toLowerCase();
    const isCovered = normalizedContent.some(
      content => content.includes(normalizedKeyword) || normalizedKeyword.includes(content)
    );
    if (isCovered) {
      covered.push(keyword);
    } else {
      gaps.push(keyword);
    }
  });

  return {
    covered,
    gaps,
    coverage: (covered.length / targetKeywords.length) * 100,
  };
};

// Generate hreflang tags for international SEO
export const generateHreflangTags = (
  markets: LocalMarket[],
  baseUrl: string
): { lang: string; href: string }[] => {
  const tags: { lang: string; href: string }[] = [];

  markets.forEach(market => {
    market.languages.forEach(lang => {
      tags.push({
        lang: lang,
        href: market.landingPageUrl || `${baseUrl}/${market.city.toLowerCase().replace(/\s/g, '-')}`,
      });
    });
  });

  // Add x-default
  tags.push({
    lang: 'x-default',
    href: baseUrl,
  });

  return tags;
};
