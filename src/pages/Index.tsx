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
import OrlaFAB from "@/components/OrlaFAB";
import heroVideo from "@/assets/hero-video.mp4";
import LoadingScreen from "@/components/LoadingScreen";
import ScrollProgress from "@/components/ScrollProgress";
import RolexClock from "@/components/RolexClock";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LoadingScreen />
      <ScrollProgress />
      <Navigation />
      <HeroSection videoSrc={heroVideo} />

      {/* Luxury Clock Section */}
      <section className="py-16 flex justify-center items-center">
        <RolexClock />
      </section>

      <MetricsStrip />
      <TrustStrip />
      <FeaturesSection />
      <SecuritySection />
      <ExperiencesSection />
      <TestimonialsSection />
      <FAQSection />
      <MembershipCTA />
      <Footer />
      <OrlaFAB />
    </div>
  );
};

export default Index;
