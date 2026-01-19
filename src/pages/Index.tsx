import { useState, useCallback, useRef, lazy, Suspense, useEffect, startTransition } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import heroVideo from "@/assets/hero-yacht.mp4";
import ScrollProgress from "@/components/ScrollProgress";
import SectionDivider from "@/components/SectionDivider";

// Defer loading screen to reduce TBT - it's not critical for LCP
const LoadingScreen = lazy(() => import("@/components/LoadingScreen"));
const GA4Script = lazy(() => import("@/components/GA4Script"));

// Lazy load below-the-fold components to reduce initial bundle size
const MetricsStrip = lazy(() => import("@/components/MetricsStrip"));
const TrustStrip = lazy(() => import("@/components/TrustStrip"));
const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const SecuritySection = lazy(() => import("@/components/SecuritySection"));
const ExperiencesSection = lazy(() => import("@/components/ExperiencesSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const MembershipCTA = lazy(() => import("@/components/MembershipCTA"));
const Footer = lazy(() => import("@/components/Footer"));
const RolexClock = lazy(() => import("@/components/RolexClock"));
const CustomCursor = lazy(() => import("@/components/CustomCursor"));
import VideoModal from "@/components/VideoModal";
const AwardsStrip = lazy(() => import("@/components/AwardsStrip"));
const GlobalPresenceSection = lazy(() => import("@/components/GlobalPresenceSection"));
const NewsletterSection = lazy(() => import("@/components/NewsletterSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const ServiceCategoriesSection = lazy(() => import("@/components/ServiceCategoriesSection"));
const MembershipTiersPreview = lazy(() => import("@/components/MembershipTiersPreview"));
const AmbientParticles = lazy(() => import("@/components/AmbientParticles"));
const GlowingOrb = lazy(() => import("@/components/GlowingOrb"));
const MetaverseEntryPoint = lazy(() => import("@/components/MetaverseEntryPoint"));
const WearablesHub = lazy(() => import("@/components/wearables/WearablesHub"));
const SmartIntegrationsHub = lazy(() => import("@/components/SmartIntegrationsHub"));
const GamingServicesSection = lazy(() => import("@/components/GamingServicesSection"));
const PictureInPicture = lazy(() => import("@/components/PictureInPicture"));
const VoiceCommands = lazy(() => import("@/components/VoiceCommands"));
const ContextualSoundscapeIndicator = lazy(() => import("@/components/ContextualSoundscapeIndicator"));
const MusicControlFAB = lazy(() => import("@/components/MusicControlFAB"));
const PartnersSection = lazy(() => import("@/components/PartnersSection"));

// Defer behavior tracking hook loading
const useBehaviorTrackingModule = () => import("@/hooks/useBehaviorTracking");

// Lazy load soundscapes hook
const useContextualSoundscapes = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [currentSection] = useState("hero");
  
  return {
    isPlaying,
    isLoading,
    volume,
    setVolume,
    currentSection,
    toggleSoundscapes: () => setIsPlaying(prev => !prev),
    getCurrentSoundscape: () => ({ description: "Ambient luxury" })
  };
};

// Minimal section loader for lazy components - optimized to reduce layout shift
const SectionLoader = () => (
  <div 
    className="min-h-[200px] flex items-center justify-center"
    style={{ contentVisibility: 'auto', containIntrinsicSize: '0 200px' }}
  >
    <div className="w-8 h-8 border border-primary/30 rounded-full border-t-primary animate-spin" />
  </div>
);

const Index = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isPipEnabled, setIsPipEnabled] = useState(true);
  const [showAmbient, setShowAmbient] = useState(false);
  const soundscapes = useContextualSoundscapes();
  const musicToggleRef = useRef<(() => void) | null>(null);
  const narratorToggleRef = useRef<(() => void) | null>(null);

  // Defer ambient effects and behavior tracking to reduce TBT
  useEffect(() => {
    // Use requestIdleCallback to defer non-critical initialization
    const scheduleIdle = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        return (window as typeof window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(callback, { timeout: 2000 });
      }
      return setTimeout(callback, 100) as unknown as number;
    };

    // Defer showing ambient effects
    const ambientId = scheduleIdle(() => {
      startTransition(() => {
        setShowAmbient(true);
      });
    });

    // Defer behavior tracking initialization
    const trackingId = scheduleIdle(() => {
      useBehaviorTrackingModule().then(module => {
        // Module loaded but tracking will self-initialize
      });
    });

    return () => {
      if ('cancelIdleCallback' in window) {
        (window as typeof window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(ambientId);
        (window as typeof window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(trackingId);
      } else {
        clearTimeout(ambientId);
        clearTimeout(trackingId);
      }
    };
  }, []);

  // Callbacks for voice commands
  const handleToggleMusic = useCallback(() => {
    musicToggleRef.current?.();
  }, []);

  const handleToggleNarrator = useCallback(() => {
    narratorToggleRef.current?.();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background overflow-x-hidden relative" style={{ contain: 'layout style' }}>
      {/* GA4 Analytics - Deferred */}
      <Suspense fallback={null}>
        <GA4Script />
      </Suspense>
      
      {/* Ambient Effects - Deferred to reduce TBT */}
      {showAmbient && (
        <Suspense fallback={null}>
          <AmbientParticles />
          <GlowingOrb className="top-1/4 -left-48" size="xl" color="gold" intensity="soft" />
          <GlowingOrb className="top-1/2 -right-32" size="lg" color="gold" intensity="soft" />
          <GlowingOrb className="bottom-1/4 left-1/3" size="md" color="gold" intensity="soft" />
          <CustomCursor />
        </Suspense>
      )}
      
      {/* Loading Screen - Deferred */}
      <Suspense fallback={null}>
        <LoadingScreen />
      </Suspense>
      
      <ScrollProgress />
      <Navigation />
      
      {/* Hero Section - Critical, not lazy */}
      <HeroSection 
        videoSrc={heroVideo} 
        onPlayVideo={() => setIsVideoModalOpen(true)} 
      />

      <SectionDivider variant="ornate" />

      {/* Below-the-fold content - Lazy loaded with content visibility optimization */}
      <Suspense fallback={<SectionLoader />}>
        {/* Luxury Clock Section */}
        <section className="py-16 flex justify-center items-center content-auto">
          <RolexClock />
        </section>

        <SectionDivider variant="default" />

        {/* Key Metrics */}
        <MetricsStrip />
        
        <SectionDivider variant="minimal" />
        
        {/* Trust Indicators - Publications */}
        <TrustStrip />

        {/* Awards & Certifications */}
        <AwardsStrip />
        
        <SectionDivider variant="wide" />
        
        {/* Service Categories Quick Links */}
        <ServiceCategoriesSection />

        <SectionDivider variant="ornate" />
        
        {/* Detailed Features */}
        <FeaturesSection />
        
        <SectionDivider variant="default" />
        
        {/* Security & Privacy */}
        <SecuritySection />
        
        <SectionDivider variant="wide" />

        {/* Metaverse & EQ Intelligence Section */}
        <MetaverseEntryPoint />

        <SectionDivider variant="default" />

        {/* Wearables Hub */}
        <WearablesHub />

        <SectionDivider variant="default" />

        {/* Smart Integrations Hub */}
        <SmartIntegrationsHub />

        <SectionDivider variant="default" />

        {/* Private Gaming Servers */}
        <GamingServicesSection />

        <SectionDivider variant="ornate" />

        {/* Global Presence */}
        <GlobalPresenceSection />
        
        <SectionDivider variant="default" />
        
        {/* Experiences Showcase */}
        <ExperiencesSection />

        <SectionDivider variant="default" />

        {/* Partners Network */}
        <PartnersSection />
        
        <SectionDivider variant="default" />
        
        {/* Client Testimonials */}
        <TestimonialsSection />

        <SectionDivider variant="wide" />

        {/* Membership Tiers */}
        <MembershipTiersPreview />
        
        <SectionDivider variant="ornate" />
        
        {/* FAQ Section */}
        <FAQSection />
        
        <SectionDivider variant="minimal" />

        {/* Newsletter / Exclusive Access */}
        <NewsletterSection />

        <SectionDivider variant="default" />

        {/* Contact Section */}
        <ContactSection />
        
        <SectionDivider variant="ornate" />
        
        {/* Final CTA */}
        <MembershipCTA />

        {/* Footer */}
        <Footer />
      </Suspense>

      {/* Floating UI Elements - Lazy loaded */}
      <Suspense fallback={null}>
        <PictureInPicture 
          isEnabled={isPipEnabled} 
          onClose={() => setIsPipEnabled(false)} 
        />
        
        <VoiceCommands 
          onToggleMusic={handleToggleMusic}
          onToggleNarrator={handleToggleNarrator}
        />
        
        <MusicControlFAB
          isPlaying={soundscapes.isPlaying}
          isLoading={soundscapes.isLoading}
          volume={soundscapes.volume}
          onToggle={soundscapes.toggleSoundscapes}
          onVolumeChange={soundscapes.setVolume}
          currentSection={soundscapes.currentSection}
          description={soundscapes.getCurrentSoundscape().description}
        />
        
        <ContextualSoundscapeIndicator
          currentSection={soundscapes.currentSection}
          description={soundscapes.getCurrentSoundscape().description}
          isPlaying={soundscapes.isPlaying}
        />

      </Suspense>
      
      {/* Video Modal - Always mounted for immediate response */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoSrc={heroVideo}
        title="Experience Aurelia"
      />
    </div>
  );
};

export default Index;
