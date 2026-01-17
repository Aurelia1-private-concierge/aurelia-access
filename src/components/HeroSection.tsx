import { ArrowRight, ChevronDown, Play, Loader2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

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
      {/* Background Video/Image with parallax */}
      <motion.div 
        style={{ y: mediaY, scale: mediaScale }}
        className="absolute inset-0 w-full h-[130%] z-0"
      >
        {/* Video loading indicator - only show if no video loaded yet */}
        {videoSrc && !videoLoaded && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-background">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center bg-background/20 backdrop-blur-sm">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
                <div className="absolute inset-0 w-12 h-12 rounded-full border-t border-primary/50 animate-spin" style={{ animationDuration: '2s' }} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">Loading video</span>
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

      {/* Content with parallax */}
      <motion.div 
        style={{ y: contentY, opacity }}
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

        {/* Main headline with refined typography */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-foreground font-normal tracking-[-0.03em] leading-[0.95] mb-6 sm:mb-8 px-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {campaign.title || t("hero.title")}
        </motion.h1>

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
            className="group relative w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.25em] uppercase transition-all duration-500 hover:bg-primary/90 btn-luxury gold-glow-hover overflow-hidden text-center"
          >
            <span className="relative z-10">{campaign.ctaText || t("hero.joinButton")}</span>
          </Link>

          <a 
            href="#experiences" 
            className="group w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 border border-foreground/20 text-foreground text-xs font-medium tracking-[0.25em] uppercase hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 flex items-center justify-center gap-3"
          >
            <span>{t("hero.discoverButton")}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-500" />
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
            className="inline-flex items-center gap-2 text-xs text-foreground/50 hover:text-primary transition-colors duration-300 tracking-wide"
          >
            <span>Not ready to join?</span>
            <span className="text-primary/80 hover:text-primary">Join the waitlist</span>
            <ArrowRight className="w-3 h-3" />
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
