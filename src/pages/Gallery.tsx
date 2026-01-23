import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import VideoCard from '@/components/gallery/VideoCard';
import VideoLightbox from '@/components/gallery/VideoLightbox';
import { 
  GALLERY_VIDEOS, 
  CATEGORY_LABELS, 
  getVideosByCategory,
  GalleryVideo,
  VideoCategory 
} from '@/lib/video-gallery-data';
import { generateVideoListSchema } from '@/lib/video-seo-schema';

type FilterCategory = VideoCategory | 'all';

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [selectedVideo, setSelectedVideo] = useState<GalleryVideo | null>(null);

  // Filter videos by category
  const filteredVideos = useMemo(() => {
    return getVideosByCategory(activeCategory);
  }, [activeCategory]);

  // Categories for filter buttons
  const categories: FilterCategory[] = ['all', 'brand', 'technology', 'lifestyle', 'assets'];

  // Generate SEO schema
  const videoSchema = useMemo(() => {
    return generateVideoListSchema(
      GALLERY_VIDEOS.map(v => ({
        id: v.id,
        title: v.title,
        description: v.description,
        thumbnailUrl: v.thumbnailUrl,
        uploadDate: v.uploadDate,
        duration: v.duration,
        contentUrl: v.videoUrl,
        category: v.category,
      }))
    );
  }, []);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (selectedVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedVideo]);

  return (
    <>
      <Helmet>
        <title>Video Gallery | Aurelia Private Concierge</title>
        <meta 
          name="description" 
          content="Explore the world of Aurelia through our curated video collection—luxury lifestyle, private aviation, superyachts, and exclusive experiences."
        />
        <meta property="og:title" content="Video Gallery | Aurelia Private Concierge" />
        <meta property="og:description" content="Explore the world of Aurelia through our curated video collection." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://aurelia-privateconcierge.com/gallery" />
        <script type="application/ld+json">
          {JSON.stringify(videoSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Hero Section */}
        <section className="relative pt-32 pb-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="text-xs uppercase tracking-[0.4em] text-primary font-medium">
                Cinematic Collection
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-foreground mb-6"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Video Gallery
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12"
            >
              Discover the essence of Aurelia through our curated collection of luxury lifestyle content
            </motion.p>

            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2.5 text-sm font-medium uppercase tracking-wider rounded-full transition-all duration-300 ${
                    activeCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {CATEGORY_LABELS[category]}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-32 left-8 w-px h-16 bg-gradient-to-b from-primary/20 to-transparent" />
          <div className="absolute top-32 right-8 w-px h-16 bg-gradient-to-b from-primary/20 to-transparent" />
        </section>

        {/* Video Grid */}
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            {filteredVideos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <p className="text-muted-foreground">No videos found in this category.</p>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredVideos.map((video, index) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    index={index}
                    onClick={() => setSelectedVideo(video)}
                  />
                ))}
              </motion.div>
            )}

            {/* Video count */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-muted-foreground mt-12"
            >
              Showing {filteredVideos.length} of {GALLERY_VIDEOS.length} videos
            </motion.p>
          </div>
        </section>

        <Footer />

        {/* Video Lightbox */}
        {selectedVideo && (
          <VideoLightbox
            video={selectedVideo}
            videos={filteredVideos}
            onClose={() => setSelectedVideo(null)}
            onNavigate={(video) => setSelectedVideo(video)}
          />
        )}
      </div>
    </>
  );
};

export default Gallery;
