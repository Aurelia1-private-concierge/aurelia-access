import { ArrowRight, ChevronDown, Play, Loader2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCampaignPersonalization } from "@/hooks/useCampaignPersonalization";


interface HeroSectionProps {
  videoSrc?: string;
  onPlayVideo?: () => void;
}

const HeroSection = ({ videoSrc, onPlayVideo }: HeroSectionProps) => {
  const { t } = useTranslation();
  const campaign = useCampaignPersonalization();
  const ref = useRef<HTMLElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  // Memoize scroll options to prevent recalculation
  const scrollOptions = useMemo(() => ({
    target: ref,
    offset: ["start start", "end start"] as ["start start", "end start"],
  }), []);
  
  const { scrollYProgress } = useScroll(scrollOptions);

  // Use CSS-friendly transform values to avoid forced reflows
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0.9]);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setVideoError(false);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setVideoLoaded(false);
  };

  return (
    <header ref={ref} className="relative w-full min-h-[100dvh] overflow-hidden flex items-center justify-center">
      {/* Background Video/Image with parallax - use will-change to hint GPU acceleration */}
      <motion.div 
        style={{ y: mediaY, scale: mediaScale, willChange: 'transform' }}
        className="absolute inset-0 w-full h-[130%] z-0"
      >
        {/* Video loading indicator - subtle, doesn't block content */}
        {videoSrc && !videoLoaded && !videoError && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center z-10 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/40 backdrop-blur-sm"
            >
              <Loader2 className="w-3 h-3 text-primary/60 animate-spin" />
              <span className="text-[9px] uppercase tracking-[0.15em] text-foreground/40">Loading</span>
            </motion.div>
          </div>
        )}
        
        {/* Video background */}
        {videoSrc && !videoError && (
          <video
            key={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={handleVideoLoad}
            onCanPlay={handleVideoLoad}
            onError={handleVideoError}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? "opacity-60" : "opacity-0"
            }`}
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </motion.div>

      {/* Enhanced Overlay with vignette */}
      <motion.div 
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 hero-overlay z-10" 
      />
      
      {/* Subtle noise texture */}
      <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Radial vignette */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 45%, transparent 30%, hsl(225 45% 3% / 0.5) 100%)'
        }}
      />

      {/* Content with parallax - use will-change for GPU acceleration */}
      <motion.div 
        style={{ y: contentY, opacity, willChange: 'transform, opacity' }}
        className="relative z-20 text-center px-4 sm:px-6 max-w-5xl mx-auto w-full"
      >
        {/* Elegant top line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mb-12"
        />

        {/* Refined badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="inline-flex items-center space-x-3 mb-10"
        >
          <span className="w-8 h-px bg-primary/40" />
          <span className="text-[11px] uppercase tracking-[0.4em] text-primary/80 font-medium">
            {campaign.badge || t("hero.badge")}
          </span>
          <span className="w-8 h-px bg-primary/40" />
        </motion.div>

        {/* Main headline - LCP element, render immediately for fast LCP, animation is progressive enhancement */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-foreground font-normal tracking-[-0.03em] leading-[0.95] mb-6 sm:mb-8 px-2 animate-fade-in"
          style={{ 
            fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
            contentVisibility: 'auto',
          }}
        >
          {campaign.title || t("hero.title")}
        </h1>

        {/* Subtitle with refined spacing */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground font-light tracking-wide max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-12 px-4"
        >
          {campaign.subtitle || t("hero.subtitle")}
        </motion.p>

        {/* Premium CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 px-4"
        >
          <Link 
            to="/auth" 
            className="group relative w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-primary text-primary-foreground text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-300 hover:bg-primary/90 hover:scale-105 hover:-translate-y-1 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.6),inset_0_1px_0_hsl(var(--primary-foreground)/0.2)] hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.7)] active:scale-95 active:translate-y-0 overflow-hidden text-center rounded-md cursor-pointer"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {campaign.ctaText || t("hero.joinButton")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </Link>

          <a 
            href="#experiences" 
            className="group w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-foreground/10 backdrop-blur-sm border-2 border-foreground/40 text-foreground text-sm font-semibold tracking-[0.15em] uppercase hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 hover:-translate-y-1 shadow-[0_4px_20px_-4px_hsl(var(--foreground)/0.2)] hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.5)] active:scale-95 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 rounded-md cursor-pointer"
          >
            <span>{t("hero.discoverButton")}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </a>
        </motion.div>

        {/* Waitlist CTA for non-ready visitors */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-6"
        >
          <Link 
            to="/waitlist" 
            className="inline-flex items-center gap-2 text-sm text-foreground bg-foreground/10 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 tracking-wide group px-5 py-2.5 rounded-full border border-foreground/30 hover:border-primary shadow-sm hover:shadow-[0_8px_25px_-6px_hsl(var(--primary)/0.4)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Not ready to join?</span>
            <span className="font-semibold">Join Waitlist</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Video Play Button */}
        {onPlayVideo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-10"
          >
            <motion.button
              onClick={onPlayVideo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group inline-flex items-center gap-3 text-foreground/60 hover:text-foreground transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-full border border-foreground/20 group-hover:border-primary/50 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-300">
                <Play className="w-4 h-4 ml-0.5 text-foreground/60 group-hover:text-primary transition-colors" fill="currentColor" />
              </div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-light">Watch Video</span>
            </motion.button>
          </motion.div>
        )}

        {/* Bottom decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.3, ease: [0.4, 0, 0.2, 1] }}
          className="w-24 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto mt-12"
        />
      </motion.div>

      {/* Refined Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/30 font-light">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-foreground/30" />
        </motion.div>
      </motion.div>

      {/* Ambient corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 z-20 pointer-events-none">
        <div className="absolute top-8 left-8 w-px h-12 bg-gradient-to-b from-primary/30 to-transparent" />
        <div className="absolute top-8 left-8 w-12 h-px bg-gradient-to-r from-primary/30 to-transparent" />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 z-20 pointer-events-none">
        <div className="absolute top-8 right-8 w-px h-12 bg-gradient-to-b from-primary/30 to-transparent" />
        <div className="absolute top-8 right-8 w-12 h-px bg-gradient-to-l from-primary/30 to-transparent" />
      </div>
    </header>
  );
};

export default HeroSection;
