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

// Campaign configurations
const campaigns: Record<string, {
  headline: string;
  subheadline: string;
  ctaText: string;
  benefits: string[];
  source: string;
  theme?: "dark" | "gold";
}> = {
  "luxury-travel": {
    headline: "Elevate Your Travel Experience",
    subheadline: "Private aviation, yacht charters, and bespoke itineraries—crafted by Aurelia's elite concierge team.",
    ctaText: "Reserve Your Spot",
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
    benefits: [
      "Front-row seats to global events",
      "Private gallery viewings",
      "Celebrity meet-and-greets",
      "Exclusive launch invitations",
    ],
    source: "campaign_vip_events",
  },
  "wealth-management": {
    headline: "Beyond Traditional Concierge",
    subheadline: "Aurelia integrates lifestyle management with your wealth strategy for seamless living.",
    ctaText: "Learn More",
    benefits: [
      "Coordinated with your advisors",
      "Real estate acquisition support",
      "Art & collectibles guidance",
      "Family office integration",
    ],
    source: "campaign_wealth",
  },
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
              <span className="text-sm font-medium">Exclusive Invitation</span>
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
