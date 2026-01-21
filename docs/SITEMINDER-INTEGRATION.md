# SiteMinder OTA Integration Guide

## Overview

Aurelia integrates with SiteMinder and other channel managers using the **OTA (Open Travel Alliance)** XML standard for real-time room availability queries and booking synchronization.

## Supported Operations

### 1. OTA_HotelAvailRQ - Availability Request

Query real-time room availability for a property.

```xml
<OTA_HotelAvailRQ xmlns="http://www.opentravel.org" Version="1.0">
  <AvailRequestSegments>
    <AvailRequestSegment>
      <HotelSearchCriteria>
        <Criterion>
          <HotelRef HotelCode="PARTNER_PROPERTY_ID"/>
          <StayDateRange Start="2026-06-01" End="2026-06-05"/>
          <RoomStayCandidates>
            <RoomStayCandidate Quantity="1">
              <GuestCounts>
                <GuestCount AgeQualifyingCode="10" Count="2"/>
              </GuestCounts>
            </RoomStayCandidate>
          </RoomStayCandidates>
        </Criterion>
      </HotelSearchCriteria>
    </AvailRequestSegment>
  </AvailRequestSegments>
</OTA_HotelAvailRQ>
```

### 2. OTA_HotelAvailRS - Availability Response

Response contains available room types with rates.

```xml
<OTA_HotelAvailRS xmlns="http://www.opentravel.org" Version="1.0">
  <RoomStays>
    <RoomStay>
      <RoomTypes>
        <RoomType RoomTypeCode="DELUXE">
          <RoomDescription>
            <Text>Deluxe Room with City View</Text>
          </RoomDescription>
        </RoomType>
      </RoomTypes>
      <RatePlans>
        <RatePlan RatePlanCode="BAR"/>
      </RatePlans>
      <RoomRates>
        <RoomRate RoomTypeCode="DELUXE" RatePlanCode="BAR">
          <Rates>
            <Rate>
              <Total AmountAfterTax="450.00" CurrencyCode="USD"/>
            </Rate>
          </Rates>
        </RoomRate>
      </RoomRates>
    </RoomStay>
  </RoomStays>
</OTA_HotelAvailRS>
```

## API Endpoints

### Query Availability (Public)

```
GET /functions/v1/siteminder-availability?action=query
  &property=HOTEL123
  &start=2026-06-01
  &end=2026-06-05
  &rooms=1
  &guests=2
```

### Trigger Full Sync (Authenticated)

```
POST /functions/v1/siteminder-availability?action=sync
Authorization: Bearer {user_token}
```

### Webhook Receiver (SiteMinder → Aurelia)

```
POST /functions/v1/siteminder-availability?action=webhook
Content-Type: application/xml

<OTA_HotelResNotifRQ>...</OTA_HotelResNotifRQ>
```

## Database Schema

### partner_pms_integrations

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| partner_id | UUID | Reference to partners table |
| provider | VARCHAR(50) | e.g., "siteminder", "cloudbeds" |
| property_code | VARCHAR(100) | Hotel code in the PMS |
| api_endpoint | VARCHAR(500) | Custom API endpoint (optional) |
| is_active | BOOLEAN | Whether sync is enabled |
| last_sync_at | TIMESTAMP | Last successful sync |
| sync_status | VARCHAR(50) | pending, success, error |
| sync_error | TEXT | Last error message |

### pms_sync_logs

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| integration_id | UUID | Reference to integration |
| sync_type | VARCHAR(50) | availability_query, full_sync, webhook |
| rooms_synced | INTEGER | Number of rooms processed |
| status | VARCHAR(50) | success, error |
| duration_ms | INTEGER | Request duration |

## Supported Providers

1. **SiteMinder** - Primary integration
2. **Cloudbeds** - Cloud-based PMS
3. **Oracle Opera** - Enterprise hospitality
4. **Mews** - Modern property management

## Partner Portal Setup

1. Navigate to Partner Portal → Settings → Integrations
2. Click "Add Integration"
3. Select your channel manager provider
4. Enter your Property Code (Hotel ID)
5. Optionally configure custom API endpoint
6. Click "Connect"

## Security

- All credentials are encrypted at rest
- API calls use TLS 1.3
- Partner authentication required for sync operations
- Webhook signatures validated (when provided by SiteMinder)

## Rate Limits

- Availability queries: 100/minute per property
- Full syncs: 10/hour per partner
- Webhook processing: Unlimited

## Error Handling

The integration handles OTA error responses:

```xml
<OTA_HotelAvailRS>
  <Errors>
    <Error Type="3" Code="392" ShortText="No availability for requested dates"/>
  </Errors>
</OTA_HotelAvailRS>
```

## Support

For integration support, contact partners@aurelia-privateconcierge.com