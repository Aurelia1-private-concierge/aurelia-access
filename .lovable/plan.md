
# Comprehensive Enhancement Plan: Aurelia Private Concierge

## Overview

This plan implements five major enhancements to the Aurelia platform:
1. **Family/Enterprise Membership Management** - Multi-member access with permission controls
2. **Biometric Authentication (WebAuthn)** - Passkey/fingerprint/face ID support
3. **Enhanced Payment Processing** - Full Stripe subscription integration
4. **Competitive Bidding Experience** - Improved partner bid workflows
5. **Pay-As-You-Go Model** - Credits-only membership without subscription

---

## 1. Family/Enterprise Membership Management

### Current State
- Single-user profiles exist in `profiles` table
- No household or family linking mechanism
- No delegated permissions system

### Implementation

#### Database Schema
Create new tables for family/enterprise structure:

```text
households
├── id (uuid, primary key)
├── name (text) - "The Smith Family" or "Smith Enterprises"
├── type (enum: 'family' | 'enterprise')
├── primary_member_id (uuid → profiles)
├── subscription_id (text) - Shared Stripe subscription
├── credit_pool_enabled (boolean) - Share credits across members
├── created_at, updated_at

household_members
├── id (uuid, primary key)
├── household_id (uuid → households)
├── user_id (uuid → auth.users)
├── role (enum: 'owner' | 'admin' | 'member' | 'dependent')
├── permissions (jsonb) - Granular access controls
├── spending_limit (numeric) - Optional per-member limit
├── invited_by (uuid)
├── joined_at
├── status (enum: 'active' | 'pending' | 'suspended')
```

#### Permission System
```text
permissions: {
  can_request_services: boolean,
  can_accept_bids: boolean,
  can_view_billing: boolean,
  can_manage_members: boolean,
  can_use_pool_credits: boolean,
  service_categories: string[] | 'all'
}
```

#### Frontend Components
- **FamilyDashboard.tsx** - Overview of all household members and activity
- **MemberInviteFlow.tsx** - Email-based invitation system
- **PermissionEditor.tsx** - Role-based access control UI
- **HouseholdSettings.tsx** - Manage shared settings and credit pooling

#### Key Features
- Primary member controls subscription billing
- Optional credit pooling with per-member spending limits
- Activity feed showing all member requests
- Invitation flow with email verification
- Dependents (children) with restricted permissions

---

## 2. Biometric Authentication (WebAuthn)

### Current State
- Email/password authentication via Supabase Auth
- QuantumBiometric component exists for UI visualization only
- No actual WebAuthn implementation

### Implementation

#### Database Schema
```text
user_passkeys
├── id (uuid, primary key)
├── user_id (uuid → auth.users)
├── credential_id (text, unique) - WebAuthn credential ID
├── public_key (text) - Stored public key
├── counter (integer) - Replay attack prevention
├── device_name (text) - "MacBook Pro", "iPhone 15"
├── created_at
├── last_used_at
```

#### Edge Function: `webauthn-register`
- Generates registration challenge
- Validates and stores credential
- Uses `@simplewebauthn/server` for Deno

#### Edge Function: `webauthn-authenticate`
- Generates authentication challenge
- Verifies signature
- Returns session token on success

#### Frontend Integration
- **PasskeyManager.tsx** - Register/manage passkeys in settings
- **BiometricLogin.tsx** - "Sign in with Passkey" button on auth page
- Enhanced **QuantumBiometric.tsx** - Connect to real WebAuthn flows

#### Security Flow
```text
Registration:
1. User clicks "Add Passkey" in security settings
2. Server generates challenge via Edge Function
3. Browser prompts for biometric (Touch ID/Face ID/Windows Hello)
4. Credential stored in database
5. User can now use passkey for login

Authentication:
1. User clicks "Sign in with Passkey"
2. Server sends challenge
3. Device authenticates user biometrically
4. Signed response verified server-side
5. Session created, user logged in
```

---

## 3. Enhanced Payment Processing (Stripe)

### Current State
- Subscription tiers defined in `membership-tiers.ts` (Silver/Gold/Platinum)
- `create-checkout` and `check-subscription` Edge Functions exist
- Credit packages in `credit_packages` table
- Webhook handling in `stripe-credits-webhook`

### Issues Identified
- Stripe products/prices return empty (need creation in Stripe dashboard)
- Missing subscription lifecycle webhook handlers
- No automatic monthly credit allocation

### Implementation

#### Stripe Product Setup
Create in Stripe Dashboard (or via API):
```text
Products:
- Silver Membership (Monthly & Annual)
- Gold Membership (Monthly & Annual)  
- Platinum Membership (Monthly & Annual)
- Pay-As-You-Go (No subscription, credits only)

Credit Packs:
- Starter (5 credits - $99)
- Value (15 credits - $249)
- Premium (30 credits - $449)
- Elite (50 credits - $699)
```

#### Enhanced Webhooks
Update `stripe-credits-webhook` to handle:
- `invoice.paid` - Monthly credit allocation
- `customer.subscription.updated` - Tier changes
- `customer.subscription.deleted` - Cancellation cleanup

#### Subscription Lifecycle Edge Function
```text
On invoice.paid:
1. Identify tier from product_id
2. Get monthly credit allocation for tier
3. Add credits to user_credits.balance
4. Record credit_transaction (type: 'allocation')
5. Send notification to user
```

#### Frontend Enhancements
- Real-time subscription status in dashboard
- Upgrade/downgrade flow with proration preview
- Invoice history with download links
- Credit usage analytics chart

---

## 4. Competitive Bidding Experience

### Current State
- `service_request_bids` table with full bid structure
- `BidComparisonView.tsx` for comparing bids
- Partner bidding hook `usePartnerBidding.ts`
- Bid revisions tracked in `bid_revisions`

### Enhancements

#### Real-Time Bidding Improvements
- **Live Bid Counter** - Show "3 partners are viewing this opportunity"
- **Countdown Timer** - Optional bid deadline with urgency indicator
- **Bid Notifications** - Push notifications when new bids arrive

#### Enhanced Comparison Features
```text
BidComparisonView Enhancements:
- Side-by-side partner comparison cards
- Partner rating/review history display
- AI-powered "Best Match" recommendation badge
- One-click negotiate/counter-offer flow
- Video introduction from partners (optional)
```

#### Blind Bidding Option
```text
service_requests table addition:
- blind_bidding (boolean) - Hide competitor bid amounts
- reserve_price (numeric) - Minimum acceptable bid
```

#### Partner Experience
- **Quick Bid Templates** - Pre-saved pricing for common requests
- **Bid Analytics Dashboard** - Win rate, average response time
- **Competitor Insights** - Anonymous market positioning data

---

## 5. Pay-As-You-Go Model

### Current State
- Credit packages exist but require visiting purchase modal
- No subscription-free membership option
- Credits tied to subscription tiers

### Implementation

#### New Membership Tier
Add to `membership-tiers.ts`:
```typescript
{
  id: "paygo",
  name: "Pay As You Go",
  description: "No commitment. Purchase credits as needed.",
  monthlyPrice: 0,
  annualPrice: 0,
  monthlyPriceId: null, // No subscription
  annualPriceId: null,
  productIds: [],
  monthlyCredits: 0,
  features: [
    "No monthly fee",
    "Purchase credits anytime",
    "Access to all services",
    "Orla AI Companion",
    "Standard response times",
    "Credits never expire"
  ]
}
```

#### Database Updates
```text
user_credits table addition:
- membership_type (enum: 'subscription' | 'paygo' | 'trial')

check-subscription Edge Function update:
- Return tier: 'paygo' for users with credits but no subscription
- Allow service access based on credit balance
```

#### Pricing Strategy
```text
Pay-As-You-Go Credit Rates (higher than subscription):
- Per credit: ~$20-25 (vs ~$13-15 for subscribers)
- Bulk discounts still apply for larger packs
- No monthly allocation, all purchased
```

#### Frontend Updates
- **Membership Page** - Add PAYGO tier with "Get Started Free" CTA
- **Dashboard** - Prominent "Buy Credits" button for PAYGO users
- **Credit Balance Widget** - Low balance warnings with quick-purchase
- **Onboarding** - Option to skip subscription, start with credit pack

#### User Flow
```text
1. User signs up (free)
2. Completes profile onboarding
3. Can immediately purchase credit pack
4. Submit service requests using credits
5. Prompt to subscribe after N requests (optional)
```

---

## Technical Implementation Summary

### New Database Tables
| Table | Purpose |
|-------|---------|
| `households` | Family/enterprise groupings |
| `household_members` | Member roles and permissions |
| `user_passkeys` | WebAuthn credential storage |

### New Edge Functions
| Function | Purpose |
|----------|---------|
| `webauthn-register` | Passkey registration flow |
| `webauthn-authenticate` | Passkey login verification |
| `household-invite` | Send member invitations |
| `allocate-monthly-credits` | Subscription credit allocation |

### Modified Edge Functions
| Function | Changes |
|----------|---------|
| `check-subscription` | Support PAYGO tier, household context |
| `stripe-credits-webhook` | Handle `invoice.paid`, subscription updates |
| `uhnwi-service-matcher` | Consider household preferences |

### New Frontend Components
| Component | Purpose |
|-----------|---------|
| `FamilyDashboard.tsx` | Household overview and management |
| `MemberInviteFlow.tsx` | Invitation workflow |
| `PasskeyManager.tsx` | Manage registered passkeys |
| `BiometricLogin.tsx` | WebAuthn login UI |
| `PayGoOnboarding.tsx` | Credits-first signup flow |
| `BidCountdownTimer.tsx` | Urgency indicator for bids |

### Modified Frontend Components
| Component | Changes |
|-----------|---------|
| `Membership.tsx` | Add PAYGO tier, household toggle |
| `Auth.tsx` | Add passkey login option |
| `BidComparisonView.tsx` | Enhanced comparison features |
| `CreditPurchaseModal.tsx` | Prominent placement for PAYGO users |

---

## Implementation Order

### Phase 1: Payment Foundation (Priority)
1. Create Stripe products/prices in dashboard
2. Update `stripe-credits-webhook` for subscription lifecycle
3. Implement automatic monthly credit allocation
4. Add Pay-As-You-Go tier to membership page

### Phase 2: Family/Enterprise
1. Create database tables with RLS policies
2. Build household management Edge Functions
3. Develop FamilyDashboard and member management UI
4. Implement credit pooling logic

### Phase 3: Biometric Authentication
1. Create `user_passkeys` table
2. Build WebAuthn Edge Functions
3. Integrate with auth flow
4. Add passkey management to security settings

### Phase 4: Bidding Enhancements
1. Add blind bidding and deadline features
2. Implement real-time presence indicators
3. Build enhanced comparison UI
4. Add partner analytics dashboard

---

## Security Considerations

- **RLS Policies**: All new tables require proper row-level security
- **Household Access**: Members can only see their own household
- **WebAuthn**: Credentials never leave the device; only public keys stored
- **Credit Transactions**: Audit trail for all credit movements
- **Permission Validation**: Server-side checks for all household operations

This comprehensive plan transforms Aurelia into a full-featured platform supporting individuals, families, and enterprises with modern authentication and flexible payment options.
