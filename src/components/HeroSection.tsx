import { ArrowRight, ChevronDown, Play, Loader2 } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCampaignPersonalization } from "@/hooks/useCampaignPersonalization";

interface HeroSectionProps {
  videoSrc?: string;
  videoSources?: string[];
  rotationInterval?: number;
  onPlayVideo?: () => void;
}

const HeroSection = ({ 
  videoSrc, 
  videoSources = [], 
  rotationInterval = 15000,
  onPlayVideo 
}: HeroSectionProps) => {
  const { t } = useTranslation();
  const campaign = useCampaignPersonalization();
  const ref = useRef<HTMLElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  const videos = videoSources.length > 0 ? videoSources : (videoSrc ? [videoSrc] : []);
  const currentVideo = videos[currentVideoIndex];
  const hasMultipleVideos = videos.length > 1;
  
  useEffect(() => {
    if (!hasMultipleVideos) return;
    
    const interval = setInterval(() => {
      setVideoLoaded(false);
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

  return (
    <header ref={ref} className="relative w-full min-h-[100dvh] overflow-hidden flex items-center justify-center bg-background">
      {/* Background Video with parallax */}
      <motion.div 
        style={{ y: mediaY, scale: mediaScale, willChange: 'transform' }}
        className="absolute inset-0 w-full h-[120%] z-0"
      >
        {/* Loading state */}
        {currentVideo && !videoLoaded && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-8 h-8 border border-primary/30 rounded-full border-t-primary animate-spin" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Loading</span>
            </motion.div>
          </div>
        )}
        
        {/* Video background */}
        <AnimatePresence mode="wait">
          {currentVideo && !videoError && (
            <motion.video
              key={currentVideo}
              initial={{ opacity: 0 }}
              animate={{ opacity: videoLoaded ? 0.9 : 0 }}
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

      {/* Dark overlay */}
      <div className="absolute inset-0 hero-overlay z-10" />
      
      {/* Subtle grain texture */}
      <div className="grain absolute inset-0 z-10 pointer-events-none" />

      {/* Radial vignette - lighter */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 45%, transparent 0%, hsl(30 8% 3% / 0.5) 100%)'
        }}
      />

      {/* Content */}
      <motion.div 
        style={{ y: contentY, opacity, willChange: 'transform, opacity' }}
        className="relative z-20 text-center px-6 max-w-4xl mx-auto w-full"
      >
        {/* Top line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="w-12 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto mb-16 origin-center"
        />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-10"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground font-light">
            {campaign.badge || t("hero.badge")}
          </span>
        </motion.div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-foreground font-normal tracking-[-0.03em] leading-[0.9] mb-8 animate-fade-in"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {campaign.title || t("hero.title")}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-sm sm:text-base md:text-lg text-muted-foreground font-light tracking-wide max-w-xl mx-auto leading-relaxed mb-12"
        >
          {campaign.subtitle || t("hero.subtitle")}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            to="/auth" 
            className="group w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 hover:bg-primary/90 flex items-center justify-center gap-3"
          >
            {campaign.ctaText || t("hero.joinButton")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a 
            href="#experiences" 
            className="group w-full sm:w-auto px-10 py-4 bg-transparent border border-primary/30 text-foreground text-xs font-medium tracking-[0.2em] uppercase hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 flex items-center justify-center gap-3"
          >
            {t("hero.discoverButton")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* Waitlist link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-8"
        >
          <Link 
            to="/waitlist" 
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-300 tracking-wide group"
          >
            <span>Not ready to join?</span>
            <span className="text-primary">Join Waitlist</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* Video button */}
        {onPlayVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="mt-12"
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlayVideo();
              }}
              className="group inline-flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-full border border-primary/20 group-hover:border-primary/40 flex items-center justify-center transition-all duration-300">
                <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-light">Watch</span>
            </button>
          </motion.div>
        )}

        {/* Bottom line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1.6, ease: [0.4, 0, 0.2, 1] }}
          className="w-16 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto mt-16 origin-center"
        />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
      >
        <span className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground/50 font-light">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground/50" />
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
