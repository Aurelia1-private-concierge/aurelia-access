import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import MetricsStrip from "@/components/MetricsStrip";
import TrustStrip from "@/components/TrustStrip";
import FeaturesSection from "@/components/FeaturesSection";
import SecuritySection from "@/components/SecuritySection";
import ExperiencesSection from "@/components/ExperiencesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import MembershipCTA from "@/components/MembershipCTA";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import LoadingScreen from "@/components/LoadingScreen";
import ScrollProgress from "@/components/ScrollProgress";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LoadingScreen />
      <ScrollProgress />
      <Navigation />
      <HeroSection />
      <MetricsStrip />
      <TrustStrip />
      <FeaturesSection />
      <SecuritySection />
      <ExperiencesSection />
      <TestimonialsSection />
      <MembershipCTA />
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
