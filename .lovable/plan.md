

# Comprehensive Page Review and Testing Plan

## Executive Summary
This plan addresses three main objectives:
1. Fix identified issues across all pages
2. Ensure proper alignment, viewability, and error-free components
3. Implement comprehensive testing coverage
4. fix all button and links globally
5. Make spinning globe slightly smaller
---

## Phase 1: Dialog Accessibility Fixes

### Issue Identified
Console warnings showing "Missing `Description` or `aria-describedby={undefined}` for {DialogContent}" indicate several dialogs are missing required DialogDescription components for accessibility compliance.

### Files Requiring DialogDescription Addition

| Component | Location | Current State |
|-----------|----------|---------------|
| HousePartnersPanel | src/components/admin/HousePartnersPanel.tsx | Missing DialogDescription after DialogTitle (line 248-249) |
| FamilyDashboard | src/components/household/FamilyDashboard.tsx | Missing DialogDescription in 3 dialogs (lines 265, 381, 384) |
| BiddingManagementPanel | src/components/admin/BiddingManagementPanel.tsx | Missing DialogDescription (line 197) |

### Fix Strategy
Add DialogDescription with appropriate context to each dialog:
- HousePartnersPanel: "Add or edit house partner vendor details"
- FamilyDashboard Create: "Set up a family or enterprise household account"
- FamilyDashboard Invite: "Send an invitation to join your household"
- BiddingManagementPanel: "Review and manage bids from house partners"

---

## Phase 2: Component and Navigation Verification

### Areas Confirmed Working
- Dashboard sidebar includes "Family/Team" navigation (line 39)
- Mobile sidebar includes "Family" navigation (line 41)
- DashboardHeader includes "family" view title mapping (line 21)
- Dashboard.tsx correctly renders FamilyDashboard for "family" view
- Routes properly configured in App.tsx

### Recommended Enhancements

#### 2.1 SelectContent Component Improvements
Ensure all Select components have proper background and z-index per dropdowns guidance:
- Add `className="bg-background z-50"` to SelectContent components if missing

#### 2.2 Table Responsiveness
Review tables in HousePartnersPanel and BiddingManagementPanel for mobile overflow handling.

---

## Phase 3: New Feature Integration Validation

### House Partners System
- Database tables: `house_partners`, `house_partner_services` - verified in schema
- Hook: `useHousePartners.ts` - correctly queries active partners with sorting
- UI: HousePartnersPanel - complete CRUD operations implemented

### Bidding System
- Database tables: `house_partner_bids` - verified in schema
- Hook: `useHousePartnerBids.ts` - handles bid creation, acceptance, status updates
- UI: BiddingManagementPanel - displays requests with bidding enabled

### Family/Household System
- Database tables: `households`, `household_members` - verified in schema
- UI: FamilyDashboard - creates households, invites members, manages credit pooling

### Passkey/WebAuthn System
- Database table: `passkey_credentials` - verified in schema
- Hook: `usePasskeys.ts` - handles registration, authentication, deletion
- UI: PasskeyManager - integrated into Profile page

---

## Phase 4: Comprehensive Testing Implementation

### 4.1 Unit Tests for New Hooks

**File: `src/test/hooks/useHousePartners.test.ts`**
```text
Tests:
- Fetches house partners successfully
- Filters by category when provided
- Sorts by preferred status and rating
- Handles query errors gracefully
```

**File: `src/test/hooks/useHousePartnerBids.test.ts`**
```text
Tests:
- Fetches bids for a specific service request
- Creates new bid with correct parameters
- Accepts bid and rejects competing bids
- Enables/disables bidding on requests
```

**File: `src/test/hooks/usePasskeys.test.ts`**
```text
Tests:
- Detects WebAuthn support
- Fetches existing passkey credentials
- Handles unsupported browser gracefully
- Mock registration flow validation
```

### 4.2 Component Tests

**File: `src/test/components/HousePartnersPanel.test.tsx`**
```text
Tests:
- Renders empty state when no partners
- Displays partner list correctly
- Opens add dialog when button clicked
- Form validation works correctly
```

**File: `src/test/components/FamilyDashboard.test.tsx`**
```text
Tests:
- Shows create household prompt when none exists
- Displays household info when present
- Credit pool toggle works
- Member list renders correctly
```

### 4.3 Integration Tests

**File: `src/test/integration/householdFlow.test.ts`**
```text
Tests:
- Create household flow
- Invite member flow
- Toggle credit pooling
- Member role changes
```

---

## Phase 5: Edge Function Validation

### Functions to Test
1. `check-subscription` - Verify PAYGO tier support
2. `stripe-credits-webhook` - Verify credit allocation on invoice.paid

### Testing Approach
Use existing edge function test infrastructure in `src/test/integration/edgeFunctions.test.ts`.

---

## Phase 6: RLS Policy Verification

### Critical Tables to Verify
| Table | Expected Policy |
|-------|-----------------|
| house_partners | Admin-only write, authenticated read |
| house_partner_bids | Admin/assigned partner write, authenticated read |
| households | Owner/member access only |
| household_members | Household member visibility |
| passkey_credentials | User's own credentials only |

---

## Implementation Sequence

1. **Accessibility Fixes** (Priority: High)
   - Add DialogDescription to all dialogs missing them
   - Estimated: 4 files, ~15 lines each

2. **UI Polish** (Priority: Medium)
   - Verify SelectContent styling
   - Check table responsiveness
   - Estimated: Review 6 components

3. **Test Suite Expansion** (Priority: High)
   - Create 3 new hook test files
   - Create 2 new component test files
   - Add integration test
   - Estimated: 6 new test files, ~300 lines total

4. **Run Full Test Suite**
   - Execute Vitest unit tests
   - Execute integration tests
   - Review and fix any failures

---

## Technical Notes

### Test Mocking Requirements
New tests will require mocking:
- Supabase client for database operations
- WebAuthn API for passkey tests
- React Query for hook state management

### Files to Create
| File | Purpose |
|------|---------|
| src/test/hooks/useHousePartners.test.ts | House partner hook tests |
| src/test/hooks/useHousePartnerBids.test.ts | Bidding hook tests |
| src/test/hooks/usePasskeys.test.ts | Passkey hook tests |
| src/test/components/HousePartnersPanel.test.tsx | Admin panel tests |
| src/test/components/FamilyDashboard.test.tsx | Household UI tests |

### Files to Modify
| File | Changes |
|------|---------|
| src/components/admin/HousePartnersPanel.tsx | Add DialogDescription |
| src/components/admin/BiddingManagementPanel.tsx | Add DialogDescription |
| src/components/household/FamilyDashboard.tsx | Add DialogDescription (3 locations) |

---

## Success Criteria

- Zero console warnings for missing DialogDescription
- All new tests pass
- Existing tests remain green
- Visual review confirms proper alignment
- Mobile responsiveness verified

