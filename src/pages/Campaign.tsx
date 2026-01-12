import { useEffect } from "react";
import { useParams, useSearchParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Star, Clock, ArrowRight, Sparkles, Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useUTMTracking, getStoredUTMParams } from "@/hooks/useUTMTracking";

// Campaign configurations - All verticals
const campaigns: Record<string, {
  headline: string;
  subheadline: string;
  ctaText: string;
  benefits: string[];
  source: string;
  badge?: string;
  icon?: string;
}> = {
  // ===== TECH & AI VERTICALS =====
  "tech-leaders": {
    headline: "Time is Your Scarcest Resource",
    subheadline: "You've built the future. Now let Aurelia's AI-powered concierge optimize your lifestyle while you focus on what matters.",
    ctaText: "Claim Your Time Back",
    badge: "Built for Tech Leaders",
    benefits: [
      "AI-enhanced request processing",
      "Async-first communication",
      "API integrations with your calendar",
      "Privacy-first data handling",
    ],
    source: "campaign_tech_leaders",
  },
  "ai-founders": {
    headline: "From Exit to Extraordinary",
    subheadline: "You disrupted an industry. Now experience a concierge service that understands the pace of innovation.",
    ctaText: "Schedule Private Preview",
    badge: "For AI/ML Executives",
    benefits: [
      "Dedicated liaison (not a chatbot)",
      "Last-minute travel optimization",
      "Exclusive founder retreats access",
      "Family office coordination",
    ],
    source: "campaign_ai_founders",
  },
  "ml-engineers": {
    headline: "Deploy Your Lifestyle",
    subheadline: "You optimize models at scale. We optimize every other aspect of your life with the same precision.",
    ctaText: "Request Early Access",
    badge: "Tech Professional Tier",
    benefits: [
      "24/7 async support globally",
      "Seamless expense reporting",
      "Conference & speaking logistics",
      "Relocation & visa assistance",
    ],
    source: "campaign_ml_engineers",
  },
  "robotics": {
    headline: "Automate Your Lifestyle",
    subheadline: "You build machines that work for humans. Now experience service that works seamlessly for you.",
    ctaText: "Join Founder Circle",
    badge: "Robotics & Deep Tech",
    benefits: [
      "Lab-to-destination logistics",
      "International travel coordination",
      "Hardware event VIP access",
      "Team retreat planning",
    ],
    source: "campaign_robotics",
  },
  "genai": {
    headline: "The Only Prompt You Need",
    subheadline: "One message to Aurelia. Everything else handled—from Michelin reservations to Monaco weekends.",
    ctaText: "Unlock White-Glove AI",
    badge: "Generative AI Professionals",
    benefits: [
      "Human+AI hybrid service",
      "Context-aware recommendations",
      "Voice-first interaction option",
      "Unlimited request credits",
    ],
    source: "campaign_genai",
  },
  "crypto": {
    headline: "Decentralize Everything Except Your Lifestyle",
    subheadline: "Focus on building the future of finance. We'll handle the present.",
    ctaText: "Join Crypto Circle",
    badge: "Web3 & Crypto Leaders",
    benefits: [
      "Crypto-friendly payments accepted",
      "Global tax residency guidance",
      "Conference circuit logistics",
      "Privacy-first communication",
    ],
    source: "campaign_crypto",
  },
  "vc-partners": {
    headline: "Your Portfolio Gets Attention. So Should You.",
    subheadline: "Between board meetings and term sheets, reclaim your personal time with Aurelia.",
    ctaText: "Request Partner Access",
    badge: "Venture Capital Partners",
    benefits: [
      "LP event coordination",
      "Deal dinner reservations",
      "Global travel optimization",
      "Family scheduling support",
    ],
    source: "campaign_vc_partners",
  },
  
  // ===== FINANCE VERTICALS =====
  "hedge-fund": {
    headline: "Alpha in Every Aspect",
    subheadline: "You generate returns. We generate time—freeing you to focus on what matters most.",
    ctaText: "Access Private Preview",
    badge: "Hedge Fund Professionals",
    benefits: [
      "Market hours-aware service",
      "Last-minute travel flexibility",
      "Discretionary spending support",
      "Family office integration",
    ],
    source: "campaign_hedge_fund",
  },
  "private-equity": {
    headline: "Operate Your Life Like Your Portfolio",
    subheadline: "Maximize value. Minimize friction. Aurelia handles the operational complexity of luxury living.",
    ctaText: "Schedule Consultation",
    badge: "Private Equity Principals",
    benefits: [
      "Deal celebration planning",
      "Portfolio company perks access",
      "International LP entertainment",
      "Estate management coordination",
    ],
    source: "campaign_private_equity",
  },
  "family-office": {
    headline: "Generational Service Excellence",
    subheadline: "Your family office manages wealth. Aurelia manages lifestyle—across generations.",
    ctaText: "Request Family Access",
    badge: "Family Office Principals",
    benefits: [
      "Multi-generational accounts",
      "Coordinated family travel",
      "Education placement support",
      "Philanthropic event access",
    ],
    source: "campaign_family_office",
  },
  "wealth-management": {
    headline: "Beyond Traditional Concierge",
    subheadline: "Aurelia integrates lifestyle management with your wealth strategy for seamless living.",
    ctaText: "Learn More",
    badge: "Wealth Advisors",
    benefits: [
      "Coordinated with your advisors",
      "Real estate acquisition support",
      "Art & collectibles guidance",
      "Family office integration",
    ],
    source: "campaign_wealth",
  },
  
  // ===== TRAVEL & LIFESTYLE =====
  "luxury-travel": {
    headline: "Elevate Your Travel Experience",
    subheadline: "Private aviation, yacht charters, and bespoke itineraries—crafted by Aurelia's elite concierge team.",
    ctaText: "Reserve Your Spot",
    badge: "Travel Enthusiasts",
    benefits: [
      "Priority access to private jets",
      "Curated yacht experiences",
      "24/7 dedicated travel concierge",
      "Exclusive partner rates",
    ],
    source: "campaign_luxury_travel",
  },
  "vip-events": {
    headline: "Access the Inaccessible",
    subheadline: "From sold-out shows to private galleries—unlock doors that remain closed to others.",
    ctaText: "Get VIP Access",
    badge: "Event Access",
    benefits: [
      "Front-row seats to global events",
      "Private gallery viewings",
      "Celebrity meet-and-greets",
      "Exclusive launch invitations",
    ],
    source: "campaign_vip_events",
  },
  "yacht": {
    headline: "Seas the Moment",
    subheadline: "From Mediterranean summers to Caribbean escapes—your superyacht adventures, seamlessly arranged.",
    ctaText: "Explore Charter Options",
    badge: "Yacht Enthusiasts",
    benefits: [
      "Priority superyacht access",
      "Crew & chef arrangements",
      "Itinerary customization",
      "Destination expertise",
    ],
    source: "campaign_yacht",
  },
  "aviation": {
    headline: "Fly Private. Arrive Refreshed.",
    subheadline: "Skip the terminals. Aurelia coordinates your private aviation with precision.",
    ctaText: "Book Private Access",
    badge: "Aviation Members",
    benefits: [
      "Empty leg opportunities",
      "Jet card optimization",
      "FBO lounge access",
      "Catering preferences saved",
    ],
    source: "campaign_aviation",
  },
  
  // ===== EXECUTIVE & CORPORATE =====
  "ceo": {
    headline: "Lead Your Company. We'll Lead Your Calendar.",
    subheadline: "CEOs trust Aurelia to handle the complexity of elite lifestyle management.",
    ctaText: "Request Executive Access",
    badge: "C-Suite Executives",
    benefits: [
      "Executive assistant coordination",
      "Board meeting logistics",
      "Shareholder event planning",
      "Reputation-conscious service",
    ],
    source: "campaign_ceo",
  },
  "founder": {
    headline: "You Built Something Great. Now Enjoy It.",
    subheadline: "Post-exit or pre-IPO—Aurelia supports founders at every stage.",
    ctaText: "Join Founder Circle",
    badge: "Startup Founders",
    benefits: [
      "Investor dinner coordination",
      "Board offsite planning",
      "Work-life boundary support",
      "Founder retreat access",
    ],
    source: "campaign_founder",
  },
  
  // ===== ENTERTAINMENT & SPORTS =====
  "athlete": {
    headline: "Perform at Your Peak. Live at Your Best.",
    subheadline: "Professional athletes trust Aurelia for seamless off-field lifestyle management.",
    ctaText: "Get Athlete Access",
    badge: "Professional Athletes",
    benefits: [
      "Training schedule integration",
      "Family relocation support",
      "Endorsement event coordination",
      "Recovery retreat bookings",
    ],
    source: "campaign_athlete",
  },
  "entertainment": {
    headline: "Your Stage is Set. Let Us Handle the Rest.",
    subheadline: "From tour logistics to private escapes—entertainment professionals deserve elite service.",
    ctaText: "Request Industry Access",
    badge: "Entertainment Industry",
    benefits: [
      "Tour city coordination",
      "Privacy-first arrangements",
      "Award show logistics",
      "Creative retreat planning",
    ],
    source: "campaign_entertainment",
  },
  
  // ===== MEDICAL & LEGAL =====
  "physician": {
    headline: "You Heal Others. We Handle Everything Else.",
    subheadline: "Surgeons and specialists trust Aurelia to optimize their limited personal time.",
    ctaText: "Request Medical Professional Access",
    badge: "Medical Professionals",
    benefits: [
      "Call schedule awareness",
      "CME conference logistics",
      "Last-minute cancellation handling",
      "Family time optimization",
    ],
    source: "campaign_physician",
  },
  "attorney": {
    headline: "Bill Hours. Not Your Personal Time.",
    subheadline: "Top attorneys trust Aurelia to manage lifestyle while they manage cases.",
    ctaText: "Request Partner Access",
    badge: "Legal Partners",
    benefits: [
      "Client entertainment support",
      "Billable hours protection",
      "Confidential service standards",
      "Partnership retreat planning",
    ],
    source: "campaign_attorney",
  },
  
  // ===== REAL ESTATE =====
  "real-estate": {
    headline: "You Close Deals. We Open Doors.",
    subheadline: "Elite real estate professionals deserve elite personal service.",
    ctaText: "Join Real Estate Circle",
    badge: "Real Estate Developers",
    benefits: [
      "Property viewing coordination",
      "Investor entertainment",
      "Global market access",
      "Relocation services",
    ],
    source: "campaign_real_estate",
  },
  
  // ===== REGIONAL CAMPAIGNS =====
  "london": {
    headline: "London's Finest. At Your Service.",
    subheadline: "From Mayfair to Monaco—Aurelia serves London's most discerning residents.",
    ctaText: "Join London Circle",
    badge: "London Members",
    benefits: [
      "West End priority access",
      "Private club reservations",
      "Country estate weekends",
      "European travel coordination",
    ],
    source: "campaign_london",
  },
  "dubai": {
    headline: "Where Ambition Meets Excellence",
    subheadline: "Dubai's global citizens trust Aurelia for seamless lifestyle management.",
    ctaText: "Request Dubai Access",
    badge: "Dubai Residents",
    benefits: [
      "Multi-property coordination",
      "Ramadan & Eid planning",
      "Desert experience curation",
      "Family office integration",
    ],
    source: "campaign_dubai",
  },
  "nyc": {
    headline: "The City Never Sleeps. Neither Does Aurelia.",
    subheadline: "New York's busiest professionals trust Aurelia to handle the impossible.",
    ctaText: "Join NYC Circle",
    badge: "New York Members",
    benefits: [
      "Last-minute reservations",
      "Hamptons coordination",
      "Broadway priority access",
      "Art world connections",
    ],
    source: "campaign_nyc",
  },
  "singapore": {
    headline: "Asia's Gateway. Global Service.",
    subheadline: "From Singapore to the world—Aurelia serves APAC's elite with precision.",
    ctaText: "Request Singapore Access",
    badge: "Singapore Residents",
    benefits: [
      "F1 Grand Prix access",
      "Regional travel expertise",
      "Multi-cultural event planning",
      "Family education support",
    ],
    source: "campaign_singapore",
  },
  "monaco": {
    headline: "Riviera Excellence",
    subheadline: "Monaco's most discerning residents trust Aurelia for seamless Mediterranean living.",
    ctaText: "Join Monaco Circle",
    badge: "Monaco Residents",
    benefits: [
      "Grand Prix hospitality",
      "Yacht week coordination",
      "Casino & event access",
      "Côte d'Azur expertise",
    ],
    source: "campaign_monaco",
  },
  "zurich": {
    headline: "Swiss Precision. Global Reach.",
    subheadline: "Zurich's financial elite trust Aurelia for discreet, exceptional service.",
    ctaText: "Request Swiss Access",
    badge: "Zurich Residents",
    benefits: [
      "Ski season coordination",
      "Private banking integration",
      "Art Basel arrangements",
      "Alpine retreat bookings",
    ],
    source: "campaign_zurich",
  },
  
  // ===== DEFAULT =====
  "default": {
    headline: "The Future of Luxury Awaits",
    subheadline: "Join the waitlist for the world's most exclusive private concierge service.",
    ctaText: "Join Waitlist",
    benefits: [
      "Priority access at launch",
      "Founding member benefits",
      "Exclusive early-bird pricing",
      "VIP onboarding experience",
    ],
    source: "campaign_default",
  },
};

const Campaign = () => {
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  
  // Track UTM parameters
  useUTMTracking();
  
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get campaign config or default
  const campaign = campaigns[campaignId || ""] || campaigns.default;
  
  // If no valid campaign and no UTM params, redirect to main waitlist
  if (!campaignId && !searchParams.get("utm_source")) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const utmParams = getStoredUTMParams();
      
      const { error } = await supabase.from("launch_signups").insert({
        email,
        notification_preference: "email",
        source: utmParams?.utm_campaign || campaign.source,
      });

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already Registered", description: "You're already on the waitlist!" });
          setIsSubmitted(true);
        } else {
          throw error;
        }
      } else {
        setIsSubmitted(true);
        toast({ 
          title: "Welcome to the Waitlist", 
          description: "You'll receive an email when we launch." 
        });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{campaign.badge || "Exclusive Invitation"}</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-6xl text-foreground mb-6"
            >
              {campaign.headline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              {campaign.subheadline}
            </motion.p>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-12"
            >
              {campaign.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-left p-3 rounded-lg bg-card/50 border border-border/50"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{benefit}</span>
                </div>
              ))}
            </motion.div>

            {/* Signup Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-md mx-auto"
            >
              {isSubmitted ? (
                <div className="bg-card border border-primary/30 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl text-foreground mb-2">You're on the List</h3>
                  <p className="text-muted-foreground">
                    Welcome to an exclusive circle. We'll notify you the moment Aurelia launches.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-14 bg-card border-border/50 text-foreground placeholder:text-muted-foreground"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    {isSubmitting ? "Joining..." : campaign.ctaText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                <span>Ultra-Premium Service</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span>Founding Member Benefits</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>24/7 Availability</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Campaign;
