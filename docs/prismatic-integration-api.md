# Prismatic Integration API

## Architecture

```
[Prismatic Connector] ---> [Aurelia Secure API Gateway] ---> [Sensitive Logic + Data Stores]
                                      │
                                      ├── Authentication (API Key)
                                      ├── Authorization (Scopes)
                                      ├── Rate Limiting
                                      └── Audit Logging
```

## Authentication

All requests require a Bearer token in the Authorization header:

```http
Authorization: Bearer <api-key>
```

API keys are generated when creating a Prismatic integration in the Aurelia admin panel.

## Rate Limiting

- Default: 60 requests per minute per integration
- Configurable per integration
- Headers returned:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `Retry-After`: Seconds until rate limit resets (when limited)

## Scopes

Integrations are granted specific scopes:

| Scope | Description |
|-------|-------------|
| `members:read` | Read member profiles |
| `members:write` | Update member profiles |
| `requests:read` | Read service requests |
| `requests:write` | Create/update service requests |
| `partners:read` | Read partner information |
| `partners:write` | Update partner data |
| `analytics:read` | Access platform metrics |
| `events:read` | Read calendar events |
| `events:write` | Create calendar events |
| `notifications:write` | Send notifications |
| `*` | Full access (admin only) |

## Endpoints

### Members

#### GET /members
List members with pagination.

**Parameters:**
- `limit` (optional): Max 100, default 50
- `offset` (optional): Pagination offset
- `tier` (optional): Filter by membership tier

**Response:**
```json
{
  "members": [...],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

#### GET /members/:id
Get a specific member by ID.

**Response:**
```json
{
  "member": {
    "id": "uuid",
    "display_name": "John Smith",
    "membership_tier": "prestige",
    "credit_balance": 100,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Service Requests

#### GET /requests
List service requests.

**Parameters:**
- `limit`, `offset`: Pagination
- `status`: Filter by status
- `category`: Filter by category

#### POST /requests
Create a new service request.

**Body:**
```json
{
  "title": "Private Jet to Monaco",
  "description": "Departure from London, 4 passengers",
  "category": "aviation",
  "client_id": "member-uuid",
  "priority": "high"
}
```

#### PUT /requests/:id
Update a service request.

**Body:**
```json
{
  "status": "in_progress",
  "priority": "urgent",
  "notes": "VIP escalation"
}
```

### Partners

#### GET /partners
List approved partners.

**Parameters:**
- `category`: Filter by service category
- `status`: Default "approved"

#### GET /partners/availability
Get partner availability (hotels, yachts, etc.).

**Parameters:**
- `partner_id`: Specific partner
- `from`, `to`: Date range

### Metrics

#### GET /metrics
Get platform analytics.

**Response:**
```json
{
  "metrics": {
    "totalMembers": 250,
    "totalPartners": 45,
    "totalRequests": 1200,
    "pendingRequests": 23,
    "timestamp": "2024-01-15T12:00:00Z"
  }
}
```

### Calendar Events

#### GET /events
List upcoming events.

**Parameters:**
- `from`: Start date (default: now)
- `limit`: Max events to return

#### POST /events
Create a calendar event.

**Body:**
```json
{
  "title": "Yacht Charter - Côte d'Azur",
  "start_date": "2024-07-01T10:00:00Z",
  "end_date": "2024-07-07T18:00:00Z",
  "event_type": "booking",
  "location": "Monaco",
  "user_id": "member-uuid"
}
```

### Notifications

#### POST /notifications
Send a notification to a member.

**Body:**
```json
{
  "user_id": "member-uuid",
  "title": "Booking Confirmed",
  "message": "Your yacht charter has been confirmed.",
  "type": "success"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "requiredScope": "scope:needed"  // if 403
}
```

**Error Codes:**
- `AUTH_MISSING` (401): No Authorization header
- `AUTH_INVALID_KEY` (401): Invalid API key
- `FORBIDDEN` (403): Missing required scope
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `VALIDATION_ERROR` (400): Invalid request body
- `INTERNAL_ERROR` (500): Server error

## API Logging

All API calls are logged with:
- Endpoint and method
- Sanitized request payload (PII redacted)
- Response status and time
- IP address and user agent

Logs are accessible in the admin panel under Integrations → Prismatic → API Logs.
