
# Partner Experience Sales Page: TRIPTYCH by Journeys Beyond Limits

## Overview

Creating a dedicated landing page to sell the TRIPTYCH cultural immersion experience (June 19-24, Rio de Janeiro) with affiliate tracking so you (Tyrone/Aurelia) are identified as the referring seller and earn the 6-10% commission.

## What We'll Build

### 1. New Sales Landing Page: `/experiences/triptych`
A luxurious, immersive landing page featuring:

- **Hero Section**: Stunning visual introduction with "Rio de Janeiro | June 19-24, 2025"
- **Experience Description**: The cultural immersion narrative from Bruno's materials
- **Access Categories**: 4 distinct tiers with different pricing levels
- **Itinerary Timeline**: Day-by-day breakdown (June 19-24)
- **Trust Elements**: Partner logo, location imagery, social proof
- **Contact/Inquiry Form**: Capture interested leads with your affiliate code embedded

### 2. Affiliate Code System

Your unique referral code will be: `APC-TRIPTYCH-001`

This code will be:
- Automatically embedded in all form submissions
- Tracked in a new `affiliate_sales` database table
- Linked to the submission when sent to Bruno's team
- Visible in your admin dashboard for tracking

### 3. Database Structure

```text
New Table: affiliate_sales
+------------------+------------------+
| Column           | Purpose          |
+------------------+------------------+
| id               | Unique ID        |
| affiliate_code   | Your tracking ID |
| experience_name  | "TRIPTYCH"       |
| partner_company  | Journeys Beyond  |
| client_name      | Interested buyer |
| client_email     | Buyer email      |
| category         | Access category  |
| status           | pending/sold     |
| sale_amount      | When sold        |
| commission_rate  | 6-10%            |
| created_at       | Timestamp        |
+------------------+------------------+
```

### 4. Admin Tracking Panel

A new section in your admin dashboard to:
- View all TRIPTYCH inquiries with your affiliate code
- Track conversion status (inquiry → sale)
- Calculate projected commission earnings
- Export lead list for follow-up with Bruno

## Page Design Specifications

### Visual Style
- Dark, sophisticated aesthetic matching Aurelia branding
- Subtle gold/amber accents for luxury feel
- High-end imagery of Rio, cultural events, fine dining
- Elegant typography with serif headings

### Content Sections

1. **Hero**: "TRIPTYCH" title with subtitle "A Restricted Cultural Immersion | Rio de Janeiro"
2. **Philosophy**: Bruno's narrative about interpretation over observation
3. **The Experience**: Night of Passage, The Gathering of Living Culture
4. **Access Categories**: 4 tiers with inquiry buttons
5. **Timeline**: Visual day-by-day flow
6. **Founding Members**: Beyond Privé Brasilis introduction
7. **Inquiry Form**: Name, email, phone, preferred category, message

### Category Pricing Display
Categories will show "Pricing upon application" (as Bruno hasn't shared exact prices), with an inquiry button for each tier.

## Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/experiences/Triptych.tsx` | Main landing page |
| `src/components/experiences/TriptychHero.tsx` | Hero section |
| `src/components/experiences/TriptychTimeline.tsx` | Day-by-day timeline |
| `src/components/experiences/TriptychInquiryForm.tsx` | Lead capture form |
| `src/components/admin/AffiliateSalesPanel.tsx` | Admin tracking |

### Route Addition
```
/experiences/triptych → Public access (no login required)
```

### Form Submission Flow

```text
User fills form → Submits → 
  → Saves to affiliate_sales table with your code
  → Sends notification email to you
  → Shows confirmation to user
  → (Optional) Forwards to Bruno's incoming@journeysbeyondlimits.com
```

## Your Affiliate Code Details

| Field | Value |
|-------|-------|
| Affiliate Code | `APC-TRIPTYCH-001` |
| Partner | Journeys Beyond Limits |
| Experience | TRIPTYCH Rio 2025 |
| Commission | 6% (up to 10% at 30+ sales) |
| Contact | incoming@journeysbeyondlimits.com |

## Commission Tracking Logic

```text
Base Rate: 6% per sale
Bonus Rate: 10% if 30+ total sales achieved
Max Guests: 50 per category (200 total)
```

## Next Steps After Implementation

1. Share the page URL with Bruno for approval
2. Begin promoting to your Aurelia member network
3. Track inquiries via admin dashboard
4. Forward qualified leads to Bruno with your affiliate code
5. Monitor conversions and commission accumulation

## Security Considerations

- Form submissions require rate limiting
- Email validation on inquiry form
- Admin-only access to affiliate sales data
- No sensitive pricing stored (inquiry-based model)
