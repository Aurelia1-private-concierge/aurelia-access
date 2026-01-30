
# Add Price List to TRIPTYCH Experience Page

## Overview

Adding the official pricing for all four access categories with multi-currency display (USD, EUR, GBP) to the TRIPTYCH landing page.

## Pricing Data

| Category | Latin Name | USD | EUR | GBP |
|----------|------------|-----|-----|-----|
| Category I | EXIMIUS | $206,000 | €169,000 | £145,000 |
| Category II | SINGULARIS | $274,000 | €226,000 | £195,000 |
| Category III | EGREGIUS | $342,000 | €282,000 | £239,000 |
| Category IV | UNUM | $456,000 | €376,000 | £318,000 |

## Implementation

### File: `src/pages/experiences/Triptych.tsx`

**Update the `accessCategories` array** (lines 11-36) to include Latin names and pricing:

```typescript
const accessCategories = [
  {
    name: "EXIMIUS",
    tier: "Category I",
    subtitle: "Essential Immersion",
    description: "Access to the symbolic heart: The Night of Passage and The Gathering of Living Culture",
    icon: Music,
    pricing: {
      usd: 206000,
      eur: 169000,
      gbp: 145000,
    },
  },
  {
    name: "SINGULARIS",
    tier: "Category II",
    subtitle: "Cultural Depth",
    description: "Enhanced cultural encounters with private gastronomic experiences and curated site visits",
    icon: UtensilsCrossed,
    pricing: {
      usd: 274000,
      eur: 226000,
      gbp: 195000,
    },
  },
  {
    name: "EGREGIUS",
    tier: "Category III",
    subtitle: "Elevated Access",
    description: "Premium positioning, private styling environment, and exclusive behind-the-scenes access",
    icon: Sparkles,
    pricing: {
      usd: 342000,
      eur: 282000,
      gbp: 239000,
    },
  },
  {
    name: "UNUM",
    tier: "Category IV",
    subtitle: "Founding Circle",
    description: "Complete immersion with private transfers, dedicated concierge, and founding member status",
    icon: Crown,
    pricing: {
      usd: 456000,
      eur: 376000,
      gbp: 318000,
    },
  },
];
```

**Update the category card rendering** (around lines 194-226) to display pricing:

Replace the "Pricing upon application" text with actual multi-currency prices:

```tsx
<div className="mt-4 pt-4 border-t border-border/10 space-y-1">
  <div className="text-lg text-foreground font-light">
    ${category.pricing.usd.toLocaleString()}
  </div>
  <div className="flex gap-3 text-[10px] text-muted-foreground">
    <span>€{category.pricing.eur.toLocaleString()}</span>
    <span>•</span>
    <span>£{category.pricing.gbp.toLocaleString()}</span>
  </div>
</div>
```

## Visual Design

The pricing will be displayed elegantly within each category card:

```text
+---------------------------+
|  🎵                       |
|  EXIMIUS                  |
|  Category I               |
|  Essential Immersion      |
|  [description text]       |
|  ─────────────────────    |
|  $206,000                 |
|  €169,000 • £145,000      |
+---------------------------+
```

## Changes Summary

| Location | Change |
|----------|--------|
| `accessCategories` array | Add `tier`, rename `name` to Latin names, add `pricing` object |
| Category cards | Replace "Pricing upon application" with formatted prices |
| Card display | Show USD prominently, EUR/GBP as secondary line |

## Technical Notes

- Uses `toLocaleString()` for proper number formatting with commas
- EUR and GBP shown as secondary currencies in smaller text
- Maintains the luxury aesthetic with subtle typography hierarchy
