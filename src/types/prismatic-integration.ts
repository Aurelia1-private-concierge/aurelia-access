/**
 * Prismatic Integration Types
 * 
 * Defines the contract for Prismatic → Aurelia API communication
 */

// ==================== Integration Configuration ====================

export interface PrismaticIntegration {
  id: string;
  name: string;
  integrationId: string; // External Prismatic integration ID
  scopes: PrismaticScope[];
  rateLimitPerMinute: number;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export type PrismaticScope = 
  | 'members:read'
  | 'members:write'
  | 'requests:read'
  | 'requests:write'
  | 'partners:read'
  | 'partners:write'
  | 'analytics:read'
  | 'events:read'
  | 'events:write'
  | 'notifications:write'
  | '*'; // Full access

// ==================== API Request/Response Types ====================

export interface PrismaticApiError {
  error: string;
  code: string;
  requiredScope?: string;
  retryAfter?: number;
}

// Members
export interface GetMembersRequest {
  limit?: number;
  offset?: number;
  tier?: string;
}

export interface GetMembersResponse {
  members: PrismaticMember[];
  total: number;
  limit: number;
  offset: number;
}

export interface PrismaticMember {
  id: string;
  display_name: string | null;
  membership_tier: string | null;
  credit_balance: number;
  created_at: string;
  preferences?: Record<string, unknown>;
}

// Service Requests
export interface GetRequestsParams {
  limit?: number;
  offset?: number;
  status?: string;
  category?: string;
}

export interface CreateRequestPayload {
  title: string;
  description?: string;
  category: string;
  client_id: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface UpdateRequestPayload {
  status?: string;
  priority?: string;
  notes?: string;
}

export interface PrismaticServiceRequest {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  client_id: string;
}

// Partners
export interface GetPartnersParams {
  category?: string;
  status?: string;
}

export interface PrismaticPartner {
  id: string;
  company_name: string;
  categories: string[];
  description: string | null;
  rating: number | null;
  status: string;
}

// Availability
export interface GetAvailabilityParams {
  partner_id?: string;
  from?: string;
  to?: string;
}

// Metrics
export interface PlatformMetrics {
  totalMembers: number;
  totalPartners: number;
  totalRequests: number;
  pendingRequests: number;
  timestamp: string;
}

// Events
export interface CreateEventPayload {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  event_type?: string;
  location?: string;
  user_id: string;
}

// Notifications
export interface SendNotificationPayload {
  user_id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

// ==================== API Log Entry ====================

export interface PrismaticApiLogEntry {
  id: string;
  integration_id: string | null;
  endpoint: string;
  method: string;
  request_payload: Record<string, unknown> | null;
  response_status: number;
  response_time_ms: number;
  ip_address: string | null;
  user_agent: string | null;
  error_message: string | null;
  created_at: string;
}

// ==================== Admin UI Types ====================

export interface PrismaticIntegrationFormData {
  name: string;
  integrationId: string;
  scopes: PrismaticScope[];
  rateLimitPerMinute: number;
}

export interface PrismaticApiKeyResponse {
  integrationId: string;
  apiKey: string; // Only shown once on creation
  createdAt: string;
}
