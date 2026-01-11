import { useState } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import MetricsStrip from "@/components/MetricsStrip";
import TrustStrip from "@/components/TrustStrip";
import FeaturesSection from "@/components/FeaturesSection";
import SecuritySection from "@/components/SecuritySection";
import ExperiencesSection from "@/components/ExperiencesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import MembershipCTA from "@/components/MembershipCTA";
import Footer from "@/components/Footer";
import MultiAgentWidget from "@/components/MultiAgentWidget";
import heroVideo from "@/assets/hero-video-extended.mp4";
import LoadingScreen from "@/components/LoadingScreen";
import ScrollProgress from "@/components/ScrollProgress";
import RolexClock from "@/components/RolexClock";
import SectionDivider from "@/components/SectionDivider";
import CustomCursor from "@/components/CustomCursor";
import VideoModal from "@/components/VideoModal";
import AwardsStrip from "@/components/AwardsStrip";
import GlobalPresenceSection from "@/components/GlobalPresenceSection";
import NewsletterSection from "@/components/NewsletterSection";
import ContactSection from "@/components/ContactSection";
import ServiceCategoriesSection from "@/components/ServiceCategoriesSection";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import MembershipTiersPreview from "@/components/MembershipTiersPreview";
import AmbientParticles from "@/components/AmbientParticles";
import GlowingOrb from "@/components/GlowingOrb";
import MetaverseEntryPoint from "@/components/MetaverseEntryPoint";
import WearablesHub from "@/components/wearables/WearablesHub";
import SmartIntegrationsHub from "@/components/SmartIntegrationsHub";

const Index = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Ambient Effects */}
      <AmbientParticles />
      <GlowingOrb className="top-1/4 -left-48" size="xl" color="gold" intensity="soft" />
      <GlowingOrb className="top-1/2 -right-32" size="lg" color="gold" intensity="soft" />
      <GlowingOrb className="bottom-1/4 left-1/3" size="md" color="gold" intensity="soft" />
      
      <CustomCursor />
      <LoadingScreen />
      <ScrollProgress />
      <Navigation />
      
      {/* Hero Section */}
      <HeroSection 
        videoSrc={heroVideo} 
        onPlayVideo={() => setIsVideoModalOpen(true)} 
      />

      <SectionDivider variant="ornate" />

      {/* Luxury Clock Section */}
      <section className="py-16 flex justify-center items-center">
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

      <SectionDivider variant="ornate" />

      {/* Global Presence */}
      <GlobalPresenceSection />
      
      <SectionDivider variant="default" />
      
      {/* Experiences Showcase */}
      <ExperiencesSection />
      
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

      {/* Floating Elements */}
      <MultiAgentWidget />
      <FloatingWhatsApp />

      {/* Video Modal */}
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
