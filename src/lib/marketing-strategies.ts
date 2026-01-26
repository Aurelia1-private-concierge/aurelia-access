/**
 * Marketing Strategies Framework
 * Comprehensive free and paid marketing strategies for UHNW client acquisition
 */

export type StrategyType = 'free' | 'paid';
export type StrategyStatus = 'active' | 'planned' | 'paused';
export type StrategyCategory = 
  | 'Content' 
  | 'Social' 
  | 'Community' 
  | 'PR' 
  | 'Referral' 
  | 'Email' 
  | 'Video'
  | 'Paid Social'
  | 'Paid Search'
  | 'Display'
  | 'Influencer'
  | 'Events'
  | 'Native';

export interface MarketingStrategy {
  id: string;
  name: string;
  type: StrategyType;
  category: StrategyCategory;
  description: string;
  channels: string[];
  estimatedHoursWeekly?: number;
  estimatedMonthlyBudget?: number;
  targetCPA?: number;
  expectedROI?: string;
  expectedResults: string;
  status: StrategyStatus;
  priority: number;
}

export interface StrategyMetrics {
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  spend: number;
  revenue: number;
}

// Free strategies with organic growth focus
export const FREE_STRATEGIES: Omit<MarketingStrategy, 'id'>[] = [
  {
    name: 'SEO Content Marketing',
    type: 'free',
    category: 'Content',
    description: 'Create high-quality blog posts, FAQ content, and service pages optimized for luxury keywords',
    channels: ['Blog', 'FAQ', 'Service Pages'],
    estimatedHoursWeekly: 5,
    expectedResults: '30-50% organic traffic increase',
    expectedROI: '300-500% over 12 months',
    status: 'active',
    priority: 1,
  },
  {
    name: 'Social Media Organic',
    type: 'free',
    category: 'Social',
    description: 'Daily engagement on LinkedIn, Instagram, and X with UHNW-focused content',
    channels: ['LinkedIn', 'Instagram', 'X'],
    estimatedHoursWeekly: 15,
    expectedResults: 'Brand awareness, 5-10 leads/month',
    expectedROI: '200-400% over 6 months',
    status: 'active',
    priority: 2,
  },
  {
    name: 'Community Engagement',
    type: 'free',
    category: 'Community',
    description: 'Active participation in r/fatFIRE, YPO Forums, and LinkedIn Groups',
    channels: ['Reddit', 'YPO', 'LinkedIn Groups'],
    estimatedHoursWeekly: 4,
    expectedResults: 'Relationship building, referrals',
    expectedROI: '150-300% over 6 months',
    status: 'active',
    priority: 3,
  },
  {
    name: 'PR & Earned Media',
    type: 'free',
    category: 'PR',
    description: 'HARO responses and journalist outreach for press coverage',
    channels: ['HARO', 'Press'],
    estimatedHoursWeekly: 3,
    expectedResults: 'High-DA backlinks, credibility',
    expectedROI: '400-600% over 12 months',
    status: 'planned',
    priority: 4,
  },
  {
    name: 'Referral Program',
    type: 'free',
    category: 'Referral',
    description: 'Member-to-member referral incentives',
    channels: ['Email', 'In-App'],
    estimatedHoursWeekly: 2,
    expectedResults: '15-25% of new signups',
    expectedROI: '500-800% ongoing',
    status: 'active',
    priority: 5,
  },
  {
    name: 'Email Newsletter',
    type: 'free',
    category: 'Email',
    description: 'Weekly digest with luxury lifestyle content and exclusive offers',
    channels: ['Email'],
    estimatedHoursWeekly: 3,
    expectedResults: 'Nurture leads, 20%+ open rate',
    expectedROI: '300-500% over 6 months',
    status: 'active',
    priority: 6,
  },
  {
    name: 'Guest Posting',
    type: 'free',
    category: 'Content',
    description: 'Publish thought leadership on Forbes, Robb Report, TechCrunch',
    channels: ['Forbes', 'Robb Report', 'TechCrunch'],
    estimatedHoursWeekly: 6,
    expectedResults: 'Authority backlinks',
    expectedROI: '400-700% over 12 months',
    status: 'planned',
    priority: 7,
  },
  {
    name: 'Video Content',
    type: 'free',
    category: 'Video',
    description: 'YouTube and LinkedIn video content showcasing experiences',
    channels: ['YouTube', 'LinkedIn Video'],
    estimatedHoursWeekly: 5,
    expectedResults: 'Engagement, brand personality',
    expectedROI: '200-400% over 12 months',
    status: 'planned',
    priority: 8,
  },
];

// Paid strategies with budget allocations
export const PAID_STRATEGIES: Omit<MarketingStrategy, 'id'>[] = [
  {
    name: 'LinkedIn Ads (C-Suite)',
    type: 'paid',
    category: 'Paid Social',
    description: 'Targeted ads to C-Suite executives and UHNW professionals',
    channels: ['LinkedIn'],
    estimatedMonthlyBudget: 10000,
    targetCPA: 225,
    expectedResults: '20-50 qualified leads',
    expectedROI: '200-350%',
    status: 'active',
    priority: 1,
  },
  {
    name: 'Google Ads (Luxury Intent)',
    type: 'paid',
    category: 'Paid Search',
    description: 'High-intent keywords for luxury concierge services',
    channels: ['Google'],
    estimatedMonthlyBudget: 6500,
    targetCPA: 175,
    expectedResults: 'High-intent traffic',
    expectedROI: '250-400%',
    status: 'active',
    priority: 2,
  },
  {
    name: 'Meta Ads (Lookalike)',
    type: 'paid',
    category: 'Paid Social',
    description: 'Lookalike audiences based on existing UHNW members',
    channels: ['Facebook', 'Instagram'],
    estimatedMonthlyBudget: 5500,
    targetCPA: 140,
    expectedResults: 'Retargeting conversions',
    expectedROI: '300-450%',
    status: 'active',
    priority: 3,
  },
  {
    name: 'Reddit Ads (r/fatFIRE)',
    type: 'paid',
    category: 'Paid Social',
    description: 'Targeted ads to financial independence communities',
    channels: ['Reddit'],
    estimatedMonthlyBudget: 2000,
    targetCPA: 100,
    expectedResults: 'Niche UHNW audience',
    expectedROI: '350-500%',
    status: 'planned',
    priority: 4,
  },
  {
    name: 'Programmatic Display',
    type: 'paid',
    category: 'Display',
    description: 'Premium display placements on luxury publications',
    channels: ['Programmatic'],
    estimatedMonthlyBudget: 12500,
    targetCPA: 300,
    expectedResults: 'Brand awareness, retargeting',
    expectedROI: '150-250%',
    status: 'planned',
    priority: 5,
  },
  {
    name: 'Influencer Partnerships',
    type: 'paid',
    category: 'Influencer',
    description: 'Collaborations with luxury lifestyle influencers',
    channels: ['Instagram', 'YouTube'],
    estimatedMonthlyBudget: 27500,
    targetCPA: 550,
    expectedResults: 'Credibility, reach',
    expectedROI: '200-350%',
    status: 'planned',
    priority: 6,
  },
  {
    name: 'Event Sponsorships',
    type: 'paid',
    category: 'Events',
    description: 'Sponsorship of UHNW networking events and conferences',
    channels: ['Events'],
    estimatedMonthlyBudget: 55000,
    expectedResults: 'Direct networking',
    expectedROI: '100-200%',
    status: 'planned',
    priority: 7,
  },
  {
    name: 'Native Advertising',
    type: 'paid',
    category: 'Native',
    description: 'Sponsored content on luxury publications',
    channels: ['Native Ads'],
    estimatedMonthlyBudget: 10000,
    targetCPA: 250,
    expectedResults: 'Content distribution',
    expectedROI: '200-300%',
    status: 'planned',
    priority: 8,
  },
];

// Calculate total time investment for free strategies
export const calculateFreeTimeInvestment = (strategies: Omit<MarketingStrategy, 'id'>[]): number => {
  return strategies
    .filter(s => s.status === 'active')
    .reduce((total, s) => total + (s.estimatedHoursWeekly || 0), 0);
};

// Calculate total budget for paid strategies
export const calculatePaidBudget = (strategies: Omit<MarketingStrategy, 'id'>[]): number => {
  return strategies
    .filter(s => s.status === 'active')
    .reduce((total, s) => total + (s.estimatedMonthlyBudget || 0), 0);
};

// UHNW Network partnerships
export interface NetworkPartnership {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'pending' | 'negotiating' | 'declined';
  description: string;
  memberCount?: string;
  annualFee?: string;
  benefits: string[];
  contactName?: string;
  contactEmail?: string;
  lastContact?: Date;
  referrals: number;
  conversions: number;
}

export const UHNW_NETWORKS: Omit<NetworkPartnership, 'id' | 'referrals' | 'conversions'>[] = [
  {
    name: 'Tiger 21',
    type: 'Investment Network',
    status: 'pending',
    description: 'Premier peer-to-peer network for high-net-worth entrepreneurs and investors',
    memberCount: '1,200+ members',
    annualFee: '$30,000+',
    benefits: [
      'Direct access to UHNW entrepreneurs',
      'Portfolio defense sessions',
      'Deal flow opportunities',
      'Exclusive events globally',
    ],
  },
  {
    name: 'YPO (Young Presidents Organization)',
    type: 'Executive Network',
    status: 'negotiating',
    description: 'Global leadership community of chief executives',
    memberCount: '30,000+ members',
    annualFee: '$20,000+',
    benefits: [
      'C-suite executives globally',
      'Chapter-based networking',
      'Family and spouse programs',
      'Business forums',
    ],
  },
  {
    name: 'Vistage',
    type: 'Executive Coaching',
    status: 'pending',
    description: 'CEO peer advisory groups with executive coaching',
    memberCount: '45,000+ members',
    annualFee: '$15,000+',
    benefits: [
      'Monthly peer advisory meetings',
      'One-on-one executive coaching',
      'Speaker events',
      'Regional networking',
    ],
  },
  {
    name: 'EO (Entrepreneurs Organization)',
    type: 'Entrepreneur Network',
    status: 'pending',
    description: 'Global business network for entrepreneurs with $1M+ revenue',
    memberCount: '17,000+ members',
    annualFee: '$5,000+',
    benefits: [
      'Forum groups for peer learning',
      'Global events and conferences',
      'Learning programs',
      'GSEA for young entrepreneurs',
    ],
  },
  {
    name: 'Family Office Exchange',
    type: 'Family Office',
    status: 'pending',
    description: 'Exclusive network for ultra-wealthy families and their advisors',
    memberCount: '500+ families',
    annualFee: '$25,000+',
    benefits: [
      'Multi-generational wealth planning',
      'Peer family connections',
      'Investment research',
      'Annual forums',
    ],
  },
  {
    name: 'Luxury Network',
    type: 'Luxury Industry',
    status: 'active',
    description: 'Premium B2B networking for luxury brands and service providers',
    memberCount: '300+ brands',
    annualFee: '$10,000+',
    benefits: [
      'Brand partnership opportunities',
      'Client referrals',
      'Exclusive events',
      'Content collaborations',
    ],
  },
];

// Content pillars for social strategy
export const CONTENT_PILLARS = [
  {
    name: 'Education',
    percentage: 40,
    description: 'Industry insights, how-tos, and thought leadership',
    examples: ['Market trends', 'Investment tips', 'Lifestyle guides'],
  },
  {
    name: 'Inspiration',
    percentage: 35,
    description: 'Aspirational content showcasing luxury experiences',
    examples: ['Travel highlights', 'Client stories', 'Behind-the-scenes'],
  },
  {
    name: 'Promotion',
    percentage: 25,
    description: 'Direct service promotion and calls-to-action',
    examples: ['Service features', 'Exclusive offers', 'Event invitations'],
  },
];

// Attribution models
export type AttributionModel = 'first-touch' | 'last-touch' | 'linear' | 'time-decay' | 'position-based';

export const ATTRIBUTION_MODELS: { id: AttributionModel; name: string; description: string }[] = [
  {
    id: 'first-touch',
    name: 'First Touch',
    description: '100% credit to the first interaction',
  },
  {
    id: 'last-touch',
    name: 'Last Touch',
    description: '100% credit to the final interaction before conversion',
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Equal credit distributed across all touchpoints',
  },
  {
    id: 'time-decay',
    name: 'Time Decay',
    description: 'More credit to touchpoints closer to conversion',
  },
  {
    id: 'position-based',
    name: 'Position-Based',
    description: '40% first, 40% last, 20% distributed to middle',
  },
];

// Campaign health scoring
export const calculateCampaignHealth = (metrics: StrategyMetrics, targetCPA?: number): {
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
} => {
  const issues: string[] = [];
  let score = 100;

  // Check CPA if target is set
  if (targetCPA && metrics.conversions > 0) {
    const actualCPA = metrics.spend / metrics.conversions;
    if (actualCPA > targetCPA * 1.5) {
      score -= 30;
      issues.push(`CPA ${((actualCPA / targetCPA - 1) * 100).toFixed(0)}% above target`);
    } else if (actualCPA > targetCPA * 1.2) {
      score -= 15;
      issues.push(`CPA slightly above target`);
    }
  }

  // Check click-through rate
  if (metrics.impressions > 0) {
    const ctr = metrics.clicks / metrics.impressions;
    if (ctr < 0.005) {
      score -= 20;
      issues.push('Low click-through rate');
    }
  }

  // Check conversion rate
  if (metrics.clicks > 0) {
    const cvr = metrics.conversions / metrics.clicks;
    if (cvr < 0.01) {
      score -= 20;
      issues.push('Low conversion rate');
    }
  }

  // Check ROAS
  if (metrics.spend > 0) {
    const roas = metrics.revenue / metrics.spend;
    if (roas < 1) {
      score -= 25;
      issues.push('Negative ROAS');
    } else if (roas < 2) {
      score -= 10;
      issues.push('ROAS below target');
    }
  }

  return {
    score: Math.max(0, score),
    status: score >= 70 ? 'healthy' : score >= 40 ? 'warning' : 'critical',
    issues,
  };
};
