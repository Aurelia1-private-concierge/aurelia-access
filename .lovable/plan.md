
# Reposition Category Cards to Top of Page

## Overview
Move the luxury experience category cards from the bottom to the top of both the **Metaverse Hub** and **EQ Profile Module** so users immediately see the important content without having to look at the bottom of the screen.

---

## Changes for VRExperienceHub.tsx

### Current Layout Problem
```text
┌────────────────────────────────────────────┐
│  Header (Metaverse Experience Hub title)   │
├────────────────────────────────────────────┤
│                                            │
│          3D Scene (large canvas)           │
│                                            │
├────────────────────────────────────────────┤
│  Category Cards (at bottom - hard to see)  │  ← Users miss this
└────────────────────────────────────────────┘
```

### New Layout
```text
┌────────────────────────────────────────────┐
│  Header (Metaverse Experience Hub title)   │
├────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐│  ← Category Cards 
│  │Aviation│ │ Yachts │ │Property│ │Collec││    NOW AT TOP
│  └────────┘ └────────┘ └────────┘ └──────┘│
├────────────────────────────────────────────┤
│                                            │
│          3D Scene (canvas)                 │
│                                            │
└────────────────────────────────────────────┘
```

### Implementation Steps

1. **Move Experience Selector to Top** (lines 396-420)
   - Change `absolute bottom-0` to `absolute top-20` (directly below header)
   - Update gradient from `from-background via-background/80 to-transparent` (bottom fade) to `to-background via-background/80 from-transparent` (top fade)
   - Add staggered entrance animation for cards

2. **Adjust 3D Canvas Layout**
   - Add top padding to the canvas area so it doesn't overlap with the new category cards position

3. **Reposition Active Experience Panel** (lines 422-476)
   - Move from `top-24` to approximately `top-56` to sit below the category cards row
   - Ensure proper spacing and no overlap

---

## Changes for EQProfileModule.tsx

The EQ module is a questionnaire flow rather than a category selector like the Metaverse Hub. The content is already well-structured with:
- Header at top with Brain icon
- Progress bar
- Question with answer options

The EQ module doesn't have the same "bottom positioning" issue - its question options are already in the main content flow. However, I'll enhance it by:

1. **Add Visual Category Indicators at Top**
   - Show the 4 question categories (Emotional, Social, Lifestyle, Preferences) as small pills/tags at the top
   - Highlight the current category as the user progresses
   - This gives users immediate visibility into what areas the profile covers

2. **Improve Question Category Badge**
   - Add a prominent category badge above each question showing which aspect is being assessed
   - Use color-coding for each category type

---

## Technical Changes Summary

### File: `src/components/vr/VRExperienceHub.tsx`

| Line Range | Change |
|------------|--------|
| 396-420 | Move experience selector from `bottom-0` to `top-20`, update gradient direction |
| 429 | Change `top-24` to `top-56` for active experience panel |
| Add padding | Ensure 3D canvas doesn't overlap with top-positioned cards |

### File: `src/components/eq/EQProfileModule.tsx`

| Line Range | Change |
|------------|--------|
| 171-183 | Add category indicator pills below header showing all 4 categories |
| 194-206 | Add category badge above current question |

---

## Expected Outcome

**Metaverse Hub**: Users immediately see all four luxury experience categories (Private Aviation, Superyachts, Luxury Properties, Rare Collectibles) at the top upon opening the modal.

**EQ Profile Module**: Users see a visual map of the profile categories at the top, with the current category highlighted as they progress through questions.
