
# Fix Gallery Videos Not Playing

## Problem Identified

The gallery videos are not playing because the `video-gallery-data.ts` file references video URLs as static paths (`/assets/hero-yacht.mp4`), but the actual video files are located in `src/assets/`, not `public/assets/`.

In Vite's bundling system:
- Files in `public/` folder are served at the root URL and can use paths like `/assets/video.mp4`
- Files in `src/assets/` are bundled and hashed, requiring ES module imports to resolve the correct URL

The HeroSection works correctly because it imports videos properly:
```typescript
import heroYacht from "@/assets/hero-yacht.mp4";
```

But the Gallery uses static paths that don't resolve:
```typescript
videoUrl: '/assets/hero-yacht.mp4'  // This path doesn't exist
```

---

## Solution

Update `video-gallery-data.ts` to import the video files as ES modules and use the resolved URLs in the data array.

### Files Modified

| File | Change |
|------|--------|
| `src/lib/video-gallery-data.ts` | Import videos from `@/assets/` and use imported URLs |

### Implementation

```text
Before (broken):
┌─────────────────────────────────────────┐
│  videoUrl: '/assets/hero-yacht.mp4'     │ ──▶ 404 Not Found
└─────────────────────────────────────────┘

After (fixed):
┌─────────────────────────────────────────┐
│  import heroYacht from '@/assets/...'   │
│  videoUrl: heroYacht                    │ ──▶ /assets/hero-yacht-ABC123.mp4 ✓
└─────────────────────────────────────────┘
```

### Code Changes

1. Add imports at the top of `video-gallery-data.ts`:
   - `import aureliaDemo from '@/assets/aurelia-demo.mp4'`
   - `import orlaDemo from '@/assets/orla-demo.mp4'`
   - `import demoVision from '@/assets/demo-vision.mp4'`
   - `import demoWatch from '@/assets/demo-watch.mp4'`
   - `import heroHoliday from '@/assets/hero-luxury-holiday.mp4'`
   - `import heroYacht from '@/assets/hero-yacht.mp4'`
   - `import heroJet from '@/assets/hero-jet.mp4'`
   - `import heroPenthouse from '@/assets/hero-penthouse.mp4'`

2. Update each `GALLERY_VIDEOS` entry to use imported references:
   - `videoUrl: '/assets/aurelia-demo.mp4'` becomes `videoUrl: aureliaDemo`
   - `videoUrl: '/assets/orla-demo.mp4'` becomes `videoUrl: orlaDemo`
   - And so on for all 8 videos

3. Update `thumbnailUrl` references to use the correct public path (`/og-image-new.png` is correct as it's in `public/`)

---

## Technical Details

### Why This Happens

Vite treats `src/` assets differently from `public/` assets:

| Location | Access Method | URL Example |
|----------|--------------|-------------|
| `public/video.mp4` | Static path | `/video.mp4` |
| `src/assets/video.mp4` | ES import | `/assets/video-Bx7kL9.mp4` (hashed) |

The hash in bundled URLs enables cache-busting and ensures browsers always load the latest version.

### Verification

After the fix, the console should show successful video loading without 404 errors, and the VideoLightbox should play videos when opened.

---

## Summary

A single file update to `src/lib/video-gallery-data.ts` will resolve the gallery video playback issue by correctly importing videos from the `src/assets/` directory using ES module syntax.
