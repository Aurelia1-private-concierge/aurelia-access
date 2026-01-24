/**
 * Public, non-PII event data allowed to pass via connector/integration.
 */
export interface PublicEventSummary {
  title: string;
  date: string; // ISO 8601
  location: string; // General location, never a private address
  description: string; // 100 char max
  category: string; // e.g., "Yachting", "Gala"
}

export interface PartnerNotificationRequest {
  partnerRef: string; // ID for the trusted partner
  eventSummary: PublicEventSummary;
}

export interface PartnerNotificationResponse {
  success: boolean;
  message: string;
  notificationId: string;
  partnerRef: string;
  receivedAt: string; // ISO 8601
}

export interface PartnerNotificationError {
  error: string;
  message: string;
}

/**
 * Supported event categories for partner notifications
 */
export type EventCategory =
  | "Yachting"
  | "Gala"
  | "Private Aviation"
  | "Fine Dining"
  | "Art & Culture"
  | "Wellness"
  | "Real Estate"
  | "Collectibles"
  | "Travel"
  | "Other";
