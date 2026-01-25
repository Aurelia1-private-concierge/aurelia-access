# Partner Event Notification API

## Overview

The Event Notification API allows approved partners to send event notifications to the Aurelia platform. This endpoint is designed to receive **public, non-PII event data only** and uses an outbox queue pattern for reliable delivery.

## Endpoint

```
POST /functions/v1/event-notify
```

## Authentication

All requests must include a Bearer token in the Authorization header:

```
Authorization: Bearer <partner_api_key>
```

Partners receive their API key upon approval. Only partners with `status: 'approved'` can use this endpoint.

## Request Format

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer <api_key>` |
| `Content-Type` | Yes | `application/json` |

### Body

```json
{
  "partnerRef": "EVT-2024-001",
  "eventSummary": {
    "title": "Monaco Yacht Show Reception",
    "date": "2024-09-25T19:00:00Z",
    "location": "Port Hercules, Monaco",
    "description": "Exclusive champagne reception for Aurelia members",
    "category": "Yachting"
  }
}
```

### Field Specifications

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `partnerRef` | string | Yes | 100 | Partner's internal reference ID |
| `eventSummary.title` | string | Yes | 100 | Event title |
| `eventSummary.date` | string | Yes | - | ISO 8601 date format |
| `eventSummary.location` | string | Yes | - | General location (no private addresses) |
| `eventSummary.description` | string | Yes | 500 | Brief event description |
| `eventSummary.category` | string | Yes | - | Must be a valid category |

### Valid Categories

- `Yachting`
- `Gala`
- `Private Aviation`
- `Fine Dining`
- `Art & Culture`
- `Wellness`
- `Real Estate`
- `Collectibles`
- `Travel`
- `Other`

## Response Format

### Success (200)

```json
{
  "status": "sent",
  "timestamp": 1706198400000,
  "notificationId": "550e8400-e29b-41d4-a716-446655440000",
  "partnerRef": "EVT-2024-001"
}
```

### Error (400 - Bad Request)

```json
{
  "error": "Bad Request",
  "message": "eventSummary.title must be 100 characters or less"
}
```

### Error (401 - Unauthorized)

```json
{
  "error": "Unauthorized",
  "message": "Invalid or inactive partner credentials"
}
```

### Error (500 - Internal Server Error)

```json
{
  "error": "Internal Server Error",
  "message": "Database connection failed"
}
```

## Validation Rules

1. **Title**: Required, non-empty, max 100 characters
2. **Date**: Must be valid ISO 8601 format
3. **Location**: Must be a general location (private addresses are rejected)
4. **Description**: Required, non-empty, max 500 characters
5. **Category**: Must match one of the valid categories exactly
6. **Partner Reference**: Required, non-empty, max 100 characters

## Outbox Queue System

Notifications are processed through a reliable outbox queue:

1. **Immediate Acknowledgment**: Request returns immediately with `status: "sent"`
2. **Queue Processing**: Background job processes pending notifications
3. **Retry Logic**: Failed deliveries are retried with exponential backoff
4. **Max Attempts**: 3 attempts before marking as failed

### Retry Schedule

| Attempt | Delay |
|---------|-------|
| 1st retry | 15 minutes |
| 2nd retry | 45 minutes |
| 3rd retry | 135 minutes (then marked as failed) |

## Integration Examples

### cURL

```bash
curl -X POST \
  'https://dukohtdvhsdckizneksr.supabase.co/functions/v1/event-notify' \
  -H 'Authorization: Bearer your-partner-api-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "partnerRef": "EVT-2024-001",
    "eventSummary": {
      "title": "Private Viewing at Sotheby'\''s",
      "date": "2024-10-15T18:00:00Z",
      "location": "London, United Kingdom",
      "description": "Exclusive preview of upcoming contemporary art auction",
      "category": "Art & Culture"
    }
  }'
```

### JavaScript/TypeScript

```typescript
import { PartnerNotificationRequest, PartnerNotificationResponse } from '../types/partner-notifications';

async function notifyEvent(
  apiKey: string,
  request: PartnerNotificationRequest
): Promise<PartnerNotificationResponse> {
  const response = await fetch(
    'https://dukohtdvhsdckizneksr.supabase.co/functions/v1/event-notify',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

### n8n Webhook Node

1. Set HTTP Request node method to `POST`
2. URL: `https://dukohtdvhsdckizneksr.supabase.co/functions/v1/event-notify`
3. Add header: `Authorization` = `Bearer {{$credentials.partnerApiKey}}`
4. Body format: JSON
5. Map your event data to the required schema

## Security Considerations

1. **API Key Storage**: Never expose API keys in client-side code
2. **PII Protection**: Only send public event information; never include attendee data
3. **Location Privacy**: Use general locations (city, venue name) not specific addresses
4. **Audit Logging**: All requests are logged for security and compliance

## Rate Limits

- **100 requests per minute** per partner
- **1000 requests per hour** per partner

Exceeding limits returns `429 Too Many Requests`.

## Monitoring

Partners can track notification status through the Partner Portal:

1. Navigate to `/partner-portal/notifications`
2. View delivery status, timestamps, and any error messages
3. Filter by date range and status

## Support

For API issues or questions:
- Email: concierge@aurelia-privateconcierge.com
- Partner Portal: https://aureliaprivateconcierge.lovable.app/partner-portal
