/**
 * Partner Event Notification API Types
 * 
 * This module defines the contract for the event-notify webhook endpoint.
 * Only public, non-PII event data is allowed to pass via connector/integration.
 * 
 * @module partner-notifications
 * @see /api/webhooks/event-notify
 */

/**
 * Supported event categories for partner notifications.
 * These align with Aurelia's luxury service verticals.
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

/**
 * Public, non-PII event data allowed to pass via connector/integration.
 * 
 * @property title - Event title (max 100 characters)
 * @property date - ISO 8601 formatted date string
 * @property location - General location (never a private address)
 * @property description - Brief description (max 500 characters)
 * @property category - One of the predefined EventCategory values
 */
export interface PublicEventSummary {
  title: string;
  date: string;
  location: string;
  description: string;
  category: EventCategory;
}

/**
 * Request payload for the event-notify webhook endpoint.
 * 
 * @property partnerRef - Partner's internal reference ID for the event (max 100 chars)
 * @property eventSummary - The public event data to be notified
 * 
 * @example
 * ```typescript
 * const request: PartnerNotificationRequest = {
 *   partnerRef: "EVT-2024-001",
 *   eventSummary: {
 *     title: "Monaco Yacht Show Reception",
 *     date: "2024-09-25T19:00:00Z",
 *     location: "Port Hercules, Monaco",
 *     description: "Exclusive champagne reception for Aurelia members",
 *     category: "Yachting"
 *   }
 * };
 * ```
 */
export interface PartnerNotificationRequest {
  partnerRef: string;
  eventSummary: PublicEventSummary;
}

/**
 * Successful response from the event-notify webhook endpoint.
 * Aligned with Express.js pattern for consistency.
 * 
 * @property status - Always "sent" on success
 * @property timestamp - Unix timestamp when notification was processed
 * @property notificationId - UUID for tracking this notification
 * @property partnerRef - Echo of the partner's reference ID
 */
export interface PartnerNotificationResponse {
  status: "sent";
  timestamp: number;
  notificationId: string;
  partnerRef: string;
}

/**
 * Error response from the event-notify webhook endpoint.
 * 
 * @property error - HTTP error type (e.g., "Bad Request", "Unauthorized")
 * @property message - Human-readable error description
 */
export interface PartnerNotificationError {
  error: string;
  message: string;
}

/**
 * Notification outbox status for reliable delivery tracking.
 */
export type OutboxStatus = "pending" | "processing" | "sent" | "failed" | "retrying";

/**
 * Notification outbox record structure.
 * Used for reliable delivery with retry support.
 */
export interface NotificationOutboxRecord {
  id: string;
  partner_id: string;
  partner_ref: string;
  event_summary: PublicEventSummary;
  status: OutboxStatus;
  attempts: number;
  max_attempts: number;
  last_attempt_at: string | null;
  next_retry_at: string | null;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Validation result for event summary payloads.
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}
