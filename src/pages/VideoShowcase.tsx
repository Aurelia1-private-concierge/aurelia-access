import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2, X } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// Import video assets
import heroLuxuryShowcase from '@/assets/hero-luxury-showcase.mp4';
import heroYacht from '@/assets/hero-yacht.mp4';
import heroJet from '@/assets/hero-jet.mp4';
import heroHoliday from '@/assets/hero-luxury-holiday.mp4';
import heroPenthouse from '@/assets/hero-penthouse.mp4';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  category: string;
  src: string;
  thumbnail?: string;
}

const videos: VideoItem[] = [
  {
    id: 'luxury-showcase',
    title: 'The Aurelia Experience',
    description: 'A cinematic journey through the world of bespoke luxury services.',
    category: 'Brand Film',
    src: heroLuxuryShowcase,
  },
  {
    id: 'yacht',
    title: 'Maritime Excellence',
    description: 'Discover our curated collection of superyacht charters across the Mediterranean.',
    category: 'Yachting',
    src: heroYacht,
  },
  {
    id: 'jet',
    title: 'Private Aviation',
    description: 'Experience seamless travel with our fleet of private aircraft.',
    category: 'Aviation',
    src: heroJet,
  },
  {
    id: 'holiday',
    title: 'Exclusive Retreats',
    description: 'Handpicked destinations for the most discerning travellers.',
    category: 'Travel',
    src: heroHoliday,
  },
  {
    id: 'penthouse',
    title: 'Prestigious Residences',
    description: 'Access to the world\'s most coveted properties and estates.',
    category: 'Real Estate',
    src: heroPenthouse,
  },
];

const categories = ['All', 'Brand Film', 'Yachting', 'Aviation', 'Travel', 'Real Estate'];

export default function VideoShowcase() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const filteredVideos = selectedCategory === 'All' 
    ? videos 
    : videos.filter(v => v.category === selectedCategory);

  const handleVideoClick = (video: VideoItem) => {
    setSelectedVideo(video);
    setIsPlaying(true);
  };

  const closeLightbox = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
  };

  return (
    <>
      <Helmet>
        <title>Video Showcase | Aurelia Private Concierge</title>
        <meta name="description" content="Experience the world of Aurelia through our cinematic video collection showcasing luxury yachts, private aviation, exclusive retreats, and prestigious residences." />
        <meta property="og:title" content="Video Showcase | Aurelia Private Concierge" />
        <meta property="og:description" content="Cinematic luxury lifestyle videos from Aurelia Private Concierge." />
        <link rel="canonical" href="https://aurelia-privateconcierge.com/videos" />
      </Helmet>

      <Navigation />

      <main className="min-h-screen bg-background pt-24">
        {/* Hero Header */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="text-primary text-sm tracking-[0.3em] uppercase mb-4 block">
                Cinematic Collection
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-6">
                Video Showcase
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Immerse yourself in the world of Aurelia through our curated collection of cinematic experiences.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="container mx-auto px-4 mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Video Grid */}
        <section className="container mx-auto px-4 pb-20">
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredVideos.map((video, index) => (
                <motion.article
                  key={video.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => handleVideoClick(video)}
                  className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-muted"
                >
                  {/* Video Preview */}
                  <video
                    src={video.src}
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="text-primary text-xs tracking-wider uppercase mb-2 block">
                      {video.category}
                    </span>
                    <h3 className="text-white text-lg font-medium mb-1">
                      {video.title}
                    </h3>
                    <p className="text-white/70 text-sm line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-5xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closeLightbox}
                  className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>

                {/* Video Player */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                  <video
                    src={selectedVideo.src}
                    autoPlay={isPlaying}
                    muted={isMuted}
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                    onClick={() => setIsPlaying(!isPlaying)}
                  />

                  {/* Controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="text-white hover:text-primary transition-colors"
                        >
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </button>
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-white hover:text-primary transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          const video = document.querySelector('video');
                          video?.requestFullscreen();
                        }}
                        className="text-white hover:text-primary transition-colors"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="mt-4 text-center">
                  <span className="text-primary text-sm tracking-wider uppercase">
                    {selectedVideo.category}
                  </span>
                  <h2 className="text-white text-2xl font-light mt-2">
                    {selectedVideo.title}
                  </h2>
                  <p className="text-white/60 mt-2 max-w-xl mx-auto">
                    {selectedVideo.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </>
  );
}
