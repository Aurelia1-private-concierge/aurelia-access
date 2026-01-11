import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Gift, 
  ArrowRight, 
  Crown, 
  Shield, 
  Star, 
  CheckCircle2,
  Loader2,
  Users,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/brand";
import { supabase } from "@/integrations/supabase/client";
import SocialShareButtons from "@/components/referral/SocialShareButtons";
import SEOHead from "@/components/SEOHead";

const Referral = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referralCode = searchParams.get("ref");
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track referral visit
  useEffect(() => {
    const trackReferral = async () => {
      if (referralCode) {
        // Store referral code in session for later use during signup
        sessionStorage.setItem("referral_code", referralCode);
        
        // Try to get referrer name (optional enhancement)
        try {
          const { data } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", referralCode)
            .single();
          
          if (data?.display_name) {
            setReferrerName(data.display_name);
          }
        } catch {
          // Referrer lookup failed, continue without name
        }
      }
      setIsLoading(false);
    };

    trackReferral();
  }, [referralCode]);

  const benefits = [
    {
      icon: Crown,
      title: "Exclusive Access",
      description: "Priority access to limited experiences and services"
    },
    {
      icon: Shield,
      title: "Trusted Network",
      description: "Join a vetted community of discerning individuals"
    },
    {
      icon: Star,
      title: "Premium Benefits",
      description: "Receive special perks as a referred member"
    },
    {
      icon: Gift,
      title: "Referral Rewards",
      description: "Both you and your referrer receive exclusive rewards"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <SEOHead pageType="referral" />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <Link to="/" className="flex items-center gap-3">
              <AnimatedLogo size="md" showWordmark={false} />
              <div className="text-left">
                <span className="font-serif text-2xl tracking-widest text-foreground">AURELIA</span>
                <p className="text-[10px] tracking-[0.3em] text-primary uppercase">Private Concierge</p>
              </div>
            </Link>
          </motion.div>

          {/* Referral Badge */}
          {referrerName && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8"
            >
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">
                Invited by <strong className="text-foreground">{referrerName}</strong>
              </span>
            </motion.div>
          )}

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight">
              You've Been Invited to
              <br />
              <span className="text-primary italic">Exceptional</span> Living
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Join the world's most exclusive private concierge service. 
              From private aviation to rare collectibles, experience life without limits.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="group text-sm tracking-widest uppercase px-8"
            >
              Accept Invitation
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/services")}
              className="text-sm tracking-widest uppercase px-8"
            >
              Explore Services
            </Button>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-6 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 border-t border-border/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-widest text-primary mb-8">
              Trusted by the World's Most Discerning Individuals
            </p>
            
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div>
                <p className="font-serif text-4xl text-foreground mb-2">2,500+</p>
                <p className="text-sm text-muted-foreground">Elite Members</p>
              </div>
              <div>
                <p className="font-serif text-4xl text-foreground mb-2">$2B+</p>
                <p className="text-sm text-muted-foreground">Transactions Managed</p>
              </div>
              <div>
                <p className="font-serif text-4xl text-foreground mb-2">180+</p>
                <p className="text-sm text-muted-foreground">Countries Served</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground italic">
                "The pinnacle of personalized service. Aurelia has redefined what luxury means."
              </p>
              <p className="text-sm text-foreground">— Private Client, Monaco</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Limited memberships available</span>
            </div>
            
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-muted-foreground mb-8">
              Your invitation awaits. Join a community where exceptional is the standard.
            </p>
            
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="group text-sm tracking-widest uppercase px-10"
            >
              Create Your Account
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/30">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Aurelia Private Concierge. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Referral;
