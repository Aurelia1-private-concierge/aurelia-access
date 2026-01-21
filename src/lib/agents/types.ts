// Background Agent Types

export interface AgentTask {
  id: string;
  agentId: string;
  userId?: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'travel' | 'experiences' | 'market' | 'service' | 'operations';
  isActive: boolean;
  runInterval?: number; // minutes
  capabilities: string[];
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface TravelIntelligence {
  flightDeals: Array<{
    route: string;
    airline: string;
    price: number;
    savings: number;
    expiresAt: Date;
  }>;
  hotelAlerts: Array<{
    property: string;
    location: string;
    availability: string;
    pricePerNight: number;
  }>;
  advisories: Array<{
    destination: string;
    type: 'weather' | 'safety' | 'event';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface ExperienceSuggestion {
  id: string;
  title: string;
  category: string;
  location: string;
  date?: string;
  exclusivityLevel: 'high' | 'ultra' | 'rare';
  estimatedCost: string;
  matchScore: number;
  reason: string;
}

export interface MarketOpportunity {
  id: string;
  type: 'collectible' | 'real_estate' | 'luxury_goods' | 'investment';
  title: string;
  description: string;
  currentPrice: number;
  marketTrend: 'rising' | 'stable' | 'declining';
  urgency: 'low' | 'medium' | 'high';
  source: string;
}

export interface ServiceAlert {
  id: string;
  userId: string;
  type: 'reminder' | 'suggestion' | 'opportunity';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  suggestedAction?: string;
}

export interface PartnerInsight {
  partnerId: string;
  partnerName: string;
  overallScore: number;
  metrics: {
    responseTime: number;
    completionRate: number;
    clientSatisfaction: number;
    valueForMoney: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}
