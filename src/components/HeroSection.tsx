import { ArrowRight, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCampaignPersonalization } from "@/hooks/useCampaignPersonalization";

interface HeroSectionProps {
  videoSrc?: string;
  videoSources?: string[];
  rotationInterval?: number;
}

const HeroSection = ({ 
  videoSrc, 
  videoSources = [], 
  rotationInterval = 15000
}: HeroSectionProps) => {
  const { t } = useTranslation();
  const campaign = useCampaignPersonalization();
  const ref = useRef<HTMLElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [forcedShowContent, setForcedShowContent] = useState(false);
  
  const videos = videoSources.length > 0 ? videoSources : (videoSrc ? [videoSrc] : []);
  const currentVideo = videos[currentVideoIndex];
  const hasMultipleVideos = videos.length > 1;
  
  // CRITICAL: Always show content after 2s, even if video hasn't loaded
  // This prevents blank screen issues in production
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("[HeroSection] Force showing content after 2s timeout");
      setForcedShowContent(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  // Mark content ready immediately if video loads successfully
  useEffect(() => {
    if (videoLoaded) {
      setForcedShowContent(true);
    }
  }, [videoLoaded]);
  
  useEffect(() => {
    if (!hasMultipleVideos) return;
    
    const interval = setInterval(() => {
      setVideoLoaded(false);
      setVideoError(false);
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }, rotationInterval);
    
    return () => clearInterval(interval);
  }, [hasMultipleVideos, videos.length, rotationInterval]);
  
  const scrollOptions = useMemo(() => ({
    target: ref,
    offset: ["start start", "end start"] as ["start start", "end start"],
  }), []);
  
  const { scrollYProgress } = useScroll(scrollOptions);

  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setVideoError(false);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoaded(false);
  };

  // Determine if content should be visible
  const showContent = videoLoaded || forcedShowContent;

  return (
    <header 
      ref={ref} 
      className="relative w-full min-h-[100dvh] overflow-hidden flex items-center justify-center"
      style={{
        // PERMANENT fallback background - ensures never blank/black
        background: 'linear-gradient(135deg, #252525 0%, #2c2f34 60%, #141418 100%)',
      }}
    >
      {/* Permanent gradient layer - always visible at 0.75 opacity to prevent gaps */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #252525 0%, #2c2f34 60%, #141418 100%)',
          opacity: videoLoaded ? 0.5 : 0.75,
        }}
        aria-hidden="true"
      />
      
      {/* Background Video with parallax */}
      <motion.div 
        style={{ y: mediaY, scale: mediaScale, willChange: 'transform' }}
        className="absolute inset-0 w-full h-[120%] z-0"
      >
        {/* Loading spinner - only show briefly before forced content */}
        {!showContent && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border border-primary/30 rounded-full border-t-primary animate-spin" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Loading</span>
            </div>
          </div>
        )}
        
        {/* Video background - using sync mode for smooth crossfade without gaps */}
        <AnimatePresence mode="sync">
          {currentVideo && !videoError && (
            <motion.video
              key={currentVideo}
              initial={{ opacity: 0 }}
              animate={{ opacity: videoLoaded ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              autoPlay
              muted
              loop={!hasMultipleVideos}
              playsInline
              preload="auto"
              onLoadedData={handleVideoLoad}
              onCanPlay={handleVideoLoad}
              onError={handleVideoError}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ 
                objectFit: 'cover',
                minWidth: '100%',
                minHeight: '100%',
              }}
            >
              <source src={currentVideo} type="video/mp4" />
            </motion.video>
          )}
        </AnimatePresence>
        
        
        {/* Video indicators */}
        {hasMultipleVideos && videoLoaded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20"
          >
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setVideoLoaded(false);
                  setCurrentVideoIndex(index);
                }}
                className={`h-0.5 transition-all duration-500 ${
                  index === currentVideoIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-foreground/20 w-2 hover:bg-foreground/40'
                }`}
                aria-label={`View video ${index + 1}`}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Dark overlay - ensures text readability */}
      <div className="absolute inset-0 hero-overlay z-10" />
      
      {/* Text backdrop for accessibility */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, hsl(30 8% 3% / 0.5) 0%, transparent 70%)'
        }}
      />
      
      {/* Subtle grain texture */}
      <div className="grain absolute inset-0 z-10 pointer-events-none" />

      {/* Content - always render, animate in when ready */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ 
          opacity: showContent ? 1 : 0, 
          y: showContent ? 0 : 30 
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ willChange: 'transform, opacity' }}
        className="relative z-20 text-center px-6 max-w-4xl mx-auto w-full"
      >
        {/* Top line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="w-12 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto mb-16 origin-center"
        />

        {/* Badge - improved contrast */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-10"
        >
          <span className="text-xs uppercase tracking-[0.4em] text-foreground/80 font-medium">
            {campaign.badge || t("hero.badge")}
          </span>
        </motion.div>

        {/* Headline - high contrast white text */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-medium tracking-[-0.02em] leading-[0.95] mb-8 animate-fade-in drop-shadow-lg"
          style={{ 
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            textShadow: '0 2px 20px hsl(30 8% 3% / 0.8)'
          }}
        >
          {campaign.title || t("hero.title")}
        </h1>

        {/* Subtitle - improved visibility */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-base sm:text-lg md:text-xl text-foreground/90 font-normal tracking-wide max-w-xl mx-auto leading-relaxed mb-12 drop-shadow-md"
          style={{ textShadow: '0 1px 10px hsl(30 8% 3% / 0.6)' }}
        >
          {campaign.subtitle || t("hero.subtitle")}
        </motion.p>

        {/* CTAs - larger touch targets, better contrast */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            to="/auth" 
            className="group w-full sm:w-auto min-h-[52px] px-10 py-4 bg-primary text-primary-foreground text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-300 hover:bg-primary/90 flex items-center justify-center gap-3 rounded focus-visible:ring-4 focus-visible:ring-primary/50"
            aria-label="Begin your membership application"
          >
            {campaign.ctaText || t("hero.joinButton")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>

          <a 
            href="#experiences" 
            className="group w-full sm:w-auto min-h-[52px] px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white text-sm font-semibold tracking-[0.15em] uppercase hover:border-white/70 hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3 rounded focus-visible:ring-4 focus-visible:ring-white/50"
            aria-label="Explore our experiences"
          >
            {t("hero.discoverButton")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </a>
        </motion.div>

        {/* Waitlist link - improved visibility */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-8"
        >
          <Link 
            to="/waitlist" 
            className="inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-white transition-colors duration-300 tracking-wide group underline-offset-4 hover:underline"
            aria-label="Join our waitlist if you're not ready to apply yet"
          >
            <span>Not ready to join?</span>
            <span className="text-primary font-medium">Join Waitlist</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        </motion.div>


        {/* Bottom line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1.6, ease: [0.4, 0, 0.2, 1] }}
          className="w-16 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto mt-16 origin-center"
        />
      </motion.div>

      {/* Scroll indicator - improved visibility */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        aria-hidden="true"
      >
        <span className="text-xs uppercase tracking-[0.3em] text-foreground/60 font-medium">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-foreground/60" />
        </motion.div>
      </motion.div>

      {/* Corner accents - minimal */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <div className="w-px h-8 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="w-8 h-px bg-gradient-to-r from-primary/20 to-transparent -mt-8 ml-0" />
      </div>
      <div className="absolute top-8 right-8 z-20 pointer-events-none">
        <div className="w-px h-8 bg-gradient-to-b from-primary/20 to-transparent ml-7" />
        <div className="w-8 h-px bg-gradient-to-l from-primary/20 to-transparent -mt-8" />
      </div>
    </header>
  );
};

export default HeroSection;
