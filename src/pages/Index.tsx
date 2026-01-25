import { useState, useCallback, useRef, lazy, Suspense, useEffect, startTransition, Component, ReactNode } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
// Real luxury video assets for rotating showcase
import heroYacht from "@/assets/hero-yacht.mp4";
import heroJet from "@/assets/hero-jet.mp4";
import heroHoliday from "@/assets/hero-luxury-holiday.mp4";
import heroPenthouse from "@/assets/hero-penthouse.mp4";
import ScrollProgress from "@/components/ScrollProgress";
import SectionDivider from "@/components/SectionDivider";
import Footer from "@/components/Footer";

// Array of luxury videos for rotating hero showcase
const heroVideos = [heroYacht, heroJet, heroHoliday, heroPenthouse];

// Simple error boundary for lazy-loaded sections
class SectionErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("Section failed to load:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

// LoadingScreen removed - was causing production hang issues

// Lazy load below-the-fold components
const GA4Script = lazy(() => import("@/components/GA4Script"));
const MetricsStrip = lazy(() => import("@/components/MetricsStrip"));
const TrustStrip = lazy(() => import("@/components/TrustStrip"));
const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const SecuritySection = lazy(() => import("@/components/SecuritySection"));
const ExperiencesSection = lazy(() => import("@/components/ExperiencesSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const MembershipCTA = lazy(() => import("@/components/MembershipCTA"));
const RolexClock = lazy(() => import("@/components/RolexClock"));
const CustomCursor = lazy(() => import("@/components/CustomCursor"));
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

// Minimal section loader for lazy components
const SectionLoader = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="w-8 h-8 border border-primary/30 rounded-full border-t-primary animate-spin" />
  </div>
);

// Force publish: 2026-01-21T09:14
const Index = () => {
  const [isPipEnabled, setIsPipEnabled] = useState(true);
  const [showAmbient, setShowAmbient] = useState(false);
  const soundscapes = useContextualSoundscapes();
  const musicToggleRef = useRef<(() => void) | null>(null);
  const narratorToggleRef = useRef<(() => void) | null>(null);

  // Defer ambient effects significantly to reduce main-thread work during LCP
  useEffect(() => {
    // Use requestIdleCallback for non-critical ambient effects
    const scheduleAmbient = () => {
      startTransition(() => {
        setShowAmbient(true);
      });
    };

    // Defer to idle time or 2 seconds, whichever comes first
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(scheduleAmbient, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    } else {
      const timer = setTimeout(scheduleAmbient, 2000);
      return () => clearTimeout(timer);
    }
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
      <SectionErrorBoundary>
        <Suspense fallback={null}>
          <GA4Script />
        </Suspense>
      </SectionErrorBoundary>
      
      {/* Ambient Effects - Deferred to reduce TBT */}
      {showAmbient && (
        <SectionErrorBoundary>
          <Suspense fallback={null}>
            <AmbientParticles />
            {/* Orbs positioned within viewport bounds, centered on their own axes */}
            <GlowingOrb className="top-[20%] left-0 -translate-x-1/2" size="xl" color="gold" intensity="soft" />
            <GlowingOrb className="top-1/2 right-0 translate-x-1/2 -translate-y-1/2" size="lg" color="gold" intensity="soft" />
            <GlowingOrb className="bottom-[25%] left-1/3 -translate-x-1/2" size="md" color="gold" intensity="soft" />
            <CustomCursor />
          </Suspense>
        </SectionErrorBoundary>
      )}
      
      {/* Loading Screen removed - was causing production issues */}
      <ScrollProgress />
      <Navigation />
      
      {/* Hero Section - Critical, not lazy - Rotating luxury video showcase */}
      <HeroSection 
        videoSources={heroVideos}
        rotationInterval={15000}
      />

      <SectionDivider variant="ornate" />

      {/* Below-the-fold content - Lazy loaded with error boundary */}
      <SectionErrorBoundary fallback={<SectionLoader />}>
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
      </SectionErrorBoundary>

      {/* Floating UI Elements - Lazy loaded */}
      <SectionErrorBoundary>
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
      </SectionErrorBoundary>
    </div>
  );
};

export default Index;
