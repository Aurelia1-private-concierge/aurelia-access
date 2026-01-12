// Video SEO Schema for Aurelia - YouTube Integration & VideoObject markup
// Last updated: January 2026

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string; // ISO 8601 duration format (e.g., "PT2M30S")
  contentUrl?: string;
  embedUrl?: string;
  category: string;
}

// Demo videos with SEO metadata
export const VIDEO_LIBRARY: VideoMetadata[] = [
  {
    id: "demo-main",
    title: "Aurelia Private Concierge - The World's Most Exclusive Service",
    description: "Discover Aurelia, the premier private concierge service for billionaires and ultra-high-net-worth families. From private jets to superyachts, off-market real estate to impossible experiences - experience luxury without limits.",
    thumbnailUrl: "https://aurelia-privateconcierge.com/og-image-new.png",
    uploadDate: "2026-01-01",
    duration: "PT2M15S",
    contentUrl: "/assets/aurelia-demo.mp4",
    category: "Brand"
  },
  {
    id: "orla-ai",
    title: "Meet Orla - Your AI Private Concierge | Aurelia",
    description: "Introducing Orla, Aurelia's revolutionary AI concierge. Available 24/7 via voice and chat, Orla learns your preferences and delivers personalized recommendations for the ultimate luxury lifestyle experience.",
    thumbnailUrl: "https://aurelia-privateconcierge.com/og-image-new.png",
    uploadDate: "2026-01-05",
    duration: "PT1M45S",
    contentUrl: "/assets/orla-demo.mp4",
    category: "Technology"
  },
  {
    id: "hero-experience",
    title: "Luxury Lifestyle by Aurelia Private Concierge",
    description: "Experience the pinnacle of luxury living. Private aviation, superyacht charters, exclusive event access, and bespoke travel experiences curated by Aurelia's elite concierge team.",
    thumbnailUrl: "https://aurelia-privateconcierge.com/og-image-new.png",
    uploadDate: "2026-01-08",
    duration: "PT3M00S",
    contentUrl: "/assets/hero-luxury-holiday.mp4",
    category: "Lifestyle"
  },
  {
    id: "vision-pro",
    title: "Aurelia on Apple Vision Pro - Immersive Concierge Experience",
    description: "Explore luxury properties and experiences in stunning spatial computing. Aurelia's Vision Pro app brings immersive previews of private islands, superyachts, and exclusive destinations.",
    thumbnailUrl: "https://aurelia-privateconcierge.com/og-image-new.png",
    uploadDate: "2026-01-10",
    duration: "PT1M30S",
    contentUrl: "/assets/demo-vision.mp4",
    category: "Technology"
  },
  {
    id: "apple-watch",
    title: "Aurelia Apple Watch Companion - Concierge on Your Wrist",
    description: "Access your Aurelia concierge from your Apple Watch. Quick requests, flight updates, and lifestyle notifications delivered elegantly to your wrist.",
    thumbnailUrl: "https://aurelia-privateconcierge.com/og-image-new.png",
    uploadDate: "2026-01-10",
    duration: "PT1M00S",
    contentUrl: "/assets/demo-watch.mp4",
    category: "Technology"
  }
];

// Generate VideoObject schema for a single video
export const generateVideoSchema = (video: VideoMetadata, pageUrl: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": video.description,
    "thumbnailUrl": video.thumbnailUrl,
    "uploadDate": video.uploadDate,
    "duration": video.duration,
    "contentUrl": video.contentUrl ? `https://aurelia-privateconcierge.com${video.contentUrl}` : undefined,
    "embedUrl": video.embedUrl,
    "publisher": {
      "@type": "Organization",
      "name": "Aurelia Private Concierge",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aurelia-privateconcierge.com/logos/aurelia-logo-dark.svg"
      }
    },
    "potentialAction": {
      "@type": "WatchAction",
      "target": pageUrl
    }
  };
};

// Generate VideoObject schema for multiple videos (ItemList)
export const generateVideoListSchema = (videos: VideoMetadata[] = VIDEO_LIBRARY) => {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Aurelia Private Concierge Video Gallery",
    "description": "Explore the world of Aurelia through our video collection featuring luxury experiences, AI concierge demos, and lifestyle content for discerning individuals.",
    "numberOfItems": videos.length,
    "itemListElement": videos.map((video, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "VideoObject",
        "name": video.title,
        "description": video.description,
        "thumbnailUrl": video.thumbnailUrl,
        "uploadDate": video.uploadDate,
        "duration": video.duration
      }
    }))
  };
};

// Get videos by category
export const getVideosByCategory = (category: string): VideoMetadata[] => {
  return VIDEO_LIBRARY.filter(video => video.category === category);
};

// Get video categories
export const getVideoCategories = (): string[] => {
  return [...new Set(VIDEO_LIBRARY.map(video => video.category))];
};

// Generate HowTo schema for tutorial videos
export const generateHowToSchema = (title: string, description: string, steps: { name: string; text: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text
    }))
  };
};
