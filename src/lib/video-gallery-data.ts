// Video Gallery Data for Aurelia
// Centralized video metadata for the gallery page

import { VIDEO_ASSETS } from './video-assets';

export type VideoCategory = 'brand' | 'technology' | 'lifestyle' | 'assets';

export interface GalleryVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  category: VideoCategory;
  featured?: boolean;
  uploadDate: string;
}

// All gallery videos with metadata
export const GALLERY_VIDEOS: GalleryVideo[] = [
  // Brand Videos
  {
    id: 'aurelia-demo',
    title: 'Aurelia Private Concierge',
    description: 'The world\'s most exclusive private concierge service for ultra-high-net-worth families.',
    thumbnailUrl: '/og-image-new.png',
    videoUrl: VIDEO_ASSETS.aureliaDemoVideo,
    duration: 'PT2M15S',
    category: 'brand',
    featured: true,
    uploadDate: '2026-01-01',
  },
  {
    id: 'orla-demo',
    title: 'Meet Orla - AI Concierge',
    description: 'Your personal AI concierge, available 24/7 via voice and chat for seamless luxury lifestyle management.',
    thumbnailUrl: '/og-image-new.png',
    videoUrl: VIDEO_ASSETS.orlaDemoVideo,
    duration: 'PT1M45S',
    category: 'brand',
    featured: true,
    uploadDate: '2026-01-05',
  },
  
  // Technology Videos
  {
    id: 'vision-pro',
    title: 'Vision Pro Experience',
    description: 'Immersive property tours and yacht previews in stunning spatial computing.',
    thumbnailUrl: '/og-image-new.png',
    videoUrl: VIDEO_ASSETS.demoVisionVideo,
    duration: 'PT1M30S',
    category: 'technology',
    uploadDate: '2026-01-10',
  },
  {
    id: 'apple-watch',
    title: 'Watch Companion App',
    description: 'Concierge at your wrist—flight updates, quick requests, and lifestyle notifications.',
    thumbnailUrl: '/og-image-new.png',
    videoUrl: VIDEO_ASSETS.demoWatchVideo,
    duration: 'PT1M00S',
    category: 'technology',
    uploadDate: '2026-01-10',
  },
  
  // Lifestyle Videos
  {
    id: 'hero-holiday',
    title: 'Luxury Escapes',
    description: 'Curated travel experiences to the world\'s most exclusive destinations.',
    thumbnailUrl: '/og-image-new.png',
    videoUrl: VIDEO_ASSETS.heroLuxuryHolidayVideo,
    duration: 'PT3M00S',
    category: 'lifestyle',
    featured: true,
    uploadDate: '2026-01-08',
  },
  
  // Assets Videos
  {
    id: 'hero-yacht',
    title: 'Superyacht Charters',
    description: 'Access to the world\'s finest superyachts for unforgettable ocean voyages.',
    thumbnailUrl: '/og-image-new.png',
    videoUrl: VIDEO_ASSETS.heroYachtVideo,
    duration: 'PT2M30S',
    category: 'assets',
    featured: true,
    uploadDate: '2026-01-12',
  },
  {
    id: 'hero-jet',
    title: 'Private Aviation',
    description: 'Global fleet access—from Gulfstream to Boeing BBJ, on demand.',
    thumbnailUrl: '/og-image-new.png',
    videoUrl: VIDEO_ASSETS.heroJetVideo,
    duration: 'PT2M00S',
    category: 'assets',
    uploadDate: '2026-01-12',
  },
  {
    id: 'hero-penthouse',
    title: 'Ultra-Luxury Real Estate',
    description: 'Off-market properties, private islands, and architectural masterpieces.',
    thumbnailUrl: '/og-image-new.png',
    videoUrl: VIDEO_ASSETS.heroPenthouseVideo,
    duration: 'PT2M45S',
    category: 'assets',
    uploadDate: '2026-01-12',
  },
];

// Category labels for UI
export const CATEGORY_LABELS: Record<VideoCategory | 'all', string> = {
  all: 'All Videos',
  brand: 'Brand',
  technology: 'Technology',
  lifestyle: 'Lifestyle',
  assets: 'Assets',
};

// Get videos by category
export const getVideosByCategory = (category: VideoCategory | 'all'): GalleryVideo[] => {
  if (category === 'all') return GALLERY_VIDEOS;
  return GALLERY_VIDEOS.filter(video => video.category === category);
};

// Get featured videos
export const getFeaturedVideos = (): GalleryVideo[] => {
  return GALLERY_VIDEOS.filter(video => video.featured);
};

// Get video by ID
export const getVideoById = (id: string): GalleryVideo | undefined => {
  return GALLERY_VIDEOS.find(video => video.id === id);
};

// Parse ISO 8601 duration to readable format
export const formatDuration = (isoDuration: string): string => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
