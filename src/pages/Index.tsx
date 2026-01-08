import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import MetricsStrip from "@/components/MetricsStrip";
import FeaturesSection from "@/components/FeaturesSection";
import ExperiencesSection from "@/components/ExperiencesSection";
import MembershipCTA from "@/components/MembershipCTA";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <MetricsStrip />
      <FeaturesSection />
      <ExperiencesSection />
      <MembershipCTA />
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
