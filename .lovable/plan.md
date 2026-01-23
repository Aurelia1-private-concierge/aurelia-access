
# Video Enhancement Suite for Aurelia

This plan implements all three requested video enhancements to elevate the hero showcase, provide a dedicated gallery experience, and optimize video performance.

---

## Overview

| Feature | Description |
|---------|-------------|
| **Private Island Hero Video** | New hero-island.mp4 added to rotating showcase |
| **Video Gallery Page** | Dedicated /gallery route with category filters |
| **Intelligent Preloading** | Custom hook for seamless video transitions |

---

## 1. Private Island Hero Video

### What It Delivers
Expand the rotating hero showcase from 4 to 5 luxury lifestyle videos, featuring exclusive private island properties.

### Implementation
- **Asset Requirement**: You will need to provide a `hero-island.mp4` video file (real footage of private island properties, matching the existing aesthetic)
- **Integration**: Add to `heroVideos` array in `Index.tsx`
- **SEO**: Add corresponding entry to `VIDEO_LIBRARY` in `video-seo-schema.ts`

### Files Modified
| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Import and add `hero-island.mp4` to `heroVideos` array |
| `src/lib/video-seo-schema.ts` | Add private island video metadata |

---

## 2. Video Gallery Page

### What It Delivers
A premium, dedicated video showcase page at `/gallery` featuring:
- Category filters (Brand, Technology, Lifestyle, Assets)
- Lightbox video player with cinematic controls
- Thumbnail grid with hover previews
- SEO-optimized with VideoObject structured data

### Page Structure
```text
┌─────────────────────────────────────────────────┐
│  Navigation                                      │
├─────────────────────────────────────────────────┤
│  AURELIA VIDEO GALLERY                          │
│  Category Filters: [All] [Brand] [Lifestyle]... │
├─────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ Video 1 │ │ Video 2 │ │ Video 3 │            │
│  │ ▶ Play  │ │ ▶ Play  │ │ ▶ Play  │            │
│  │ Title   │ │ Title   │ │ Title   │            │
│  └─────────┘ └─────────┘ └─────────┘            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ Video 4 │ │ Video 5 │ │ Video 6 │            │
│  └─────────┘ └─────────┘ └─────────┘            │
├─────────────────────────────────────────────────┤
│  Footer                                          │
└─────────────────────────────────────────────────┘
```

### Video Categories
| Category | Content |
|----------|---------|
| **Brand** | Aurelia demos, corporate videos |
| **Technology** | Orla AI, Vision Pro, Apple Watch |
| **Lifestyle** | Travel, holidays, experiences |
| **Assets** | Yachts, jets, penthouses, cars |

### New Files
| File | Purpose |
|------|---------|
| `src/pages/Gallery.tsx` | Main gallery page with filters and grid |
| `src/components/gallery/VideoCard.tsx` | Thumbnail card with hover preview |
| `src/components/gallery/VideoLightbox.tsx` | Fullscreen cinematic player |
| `src/lib/video-gallery-data.ts` | Extended video metadata for all assets |

### Files Modified
| File | Change |
|------|--------|
| `src/App.tsx` | Add `/gallery` route |
| `src/components/Navigation.tsx` | Add Gallery link |

---

## 3. Intelligent Video Preloading

### What It Delivers
A custom hook that preloads the next video in the rotation sequence, ensuring seamless crossfade transitions without buffering delays.

### How It Works
```text
Current Video Playing    Next Video Preloading
     ┌──────┐                 ┌──────┐
     │ ▶ 1  │ ─── preload ──► │  2   │
     └──────┘                 └──────┘
           │
           ▼ (transition)
     ┌──────┐                 ┌──────┐
     │ ▶ 2  │ ─── preload ──► │  3   │
     └──────┘                 └──────┘
```

### Features
- **Preload Buffer**: Starts loading next video 5 seconds before transition
- **Memory Management**: Revokes blob URLs after use to prevent leaks
- **Network Awareness**: Respects `connection.saveData` preference
- **Fallback Handling**: Graceful degradation if preload fails

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useVideoPreloader.ts` | Preloading logic with cache management |

### Files Modified
| File | Change |
|------|--------|
| `src/components/HeroSection.tsx` | Integrate `useVideoPreloader` hook |

---

## Technical Details

### useVideoPreloader Hook API
```typescript
const { preloadedUrl, isPreloading, error } = useVideoPreloader({
  videos: string[],
  currentIndex: number,
  preloadAheadMs: 5000 // Start preload 5s before transition
});
```

### Video Gallery Data Structure
```typescript
interface GalleryVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  category: "brand" | "technology" | "lifestyle" | "assets";
  featured?: boolean;
}
```

### VideoLightbox Features
- Play/Pause, Mute/Unmute controls
- Progress bar with seek functionality
- Picture-in-Picture support
- Keyboard navigation (Space, Escape, Arrow keys)
- Auto-play next video option

---

## Implementation Order

| Phase | Task | Estimated Effort |
|-------|------|------------------|
| 1 | Create `useVideoPreloader` hook | Low |
| 2 | Integrate preloader into `HeroSection` | Low |
| 3 | Create video gallery data file | Low |
| 4 | Build `VideoCard` component | Medium |
| 5 | Build `VideoLightbox` component | Medium |
| 6 | Create `Gallery.tsx` page | Medium |
| 7 | Add routing and navigation | Low |
| 8 | Update SEO schema for new videos | Low |
| 9 | Add private island video (pending asset) | Low |

---

## Asset Requirements

Before implementing the private island video:
- **File**: `hero-island.mp4`
- **Requirements**: Real footage (no AI-generated), 1080p minimum, 15-30 seconds duration
- **Content**: Private island properties, beaches, exclusive villas

The gallery and preloader can be implemented immediately using existing video assets.

---

## Summary

This enhancement suite transforms Aurelia's video experience with:
- ✓ Expanded hero showcase (5 rotating luxury videos)
- ✓ Dedicated video gallery with premium filtering
- ✓ Seamless transitions via intelligent preloading
- ✓ Full SEO optimization with structured data
