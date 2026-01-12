import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Sparkles, ArrowRight, Check, Loader2, Mail, Bell, Rocket, Star, 
  LogOut, LogIn, Globe, Shield, Users, Plane, Ship, Building2,
  Instagram, Linkedin, Twitter, Facebook
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import AnimatedLogo from "@/components/brand/AnimatedLogo";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const waitlistSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email" }).max(255),
});

type WaitlistForm = z.infer<typeof waitlistSchema>;

// SEO structured data for the launch page
const launchPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Aurelia Private Concierge - Coming Soon",
  "description": "Join the waitlist for the world's most exclusive private concierge service. Early access to private jets, superyachts, off-market real estate, and impossible experiences.",
  "url": "https://aurelia-privateconcierge.com",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Aurelia Private Concierge",
    "url": "https://aurelia-privateconcierge.com"
  },
  "about": {
    "@type": "Organization",
    "name": "Aurelia Private Concierge",
    "description": "Ultra-exclusive concierge service for billionaires and UHNW individuals"
  },
  "potentialAction": {
    "@type": "JoinAction",
    "name": "Join Waitlist",
    "target": "https://aurelia-privateconcierge.com"
  }
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/aureliaprivate", label: "Instagram", color: "hover:text-pink-400" },
  { icon: Linkedin, href: "https://linkedin.com/company/aurelia-private-concierge", label: "LinkedIn", color: "hover:text-blue-400" },
  { icon: Twitter, href: "https://twitter.com/AureliaPrivate", label: "X (Twitter)", color: "hover:text-sky-400" },
  { icon: Facebook, href: "https://facebook.com/aureliaprivateconcierge", label: "Facebook", color: "hover:text-blue-500" },
];

const stats = [
  { value: "50+", label: "Countries Served" },
  { value: "$10B+", label: "Assets Managed" },
  { value: "24/7", label: "Concierge Access" },
  { value: "500+", label: "Partner Network" },
];

const services = [
  { icon: Plane, label: "Private Aviation" },
  { icon: Ship, label: "Yacht Charters" },
  { icon: Building2, label: "Off-Market Real Estate" },
  { icon: Shield, label: "Security Services" },
  { icon: Star, label: "Exclusive Access" },
  { icon: Globe, label: "Global Network" },
];

const UnderConstruction = () => {
  const { user, signOut } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  // Add structured data to head
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'launch-page-schema';
    script.textContent = JSON.stringify(launchPageSchema);
    document.head.appendChild(script);

    // Update meta tags for launch page
    document.title = "Aurelia Private Concierge | Join the Exclusive Waitlist - Coming Soon";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Be first to access the world\'s most exclusive private concierge. Join 500+ discerning individuals on our waitlist for priority membership to private jets, superyachts & impossible experiences.');
    }

    return () => {
      const existingScript = document.getElementById('launch-page-schema');
      if (existingScript) existingScript.remove();
    };
  }, []);

  // Fetch waitlist count for social proof
  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('launch_signups')
        .select('*', { count: 'exact', head: true });
      if (count !== null) setWaitlistCount(count);
    };
    fetchCount();
  }, [isSubmitted]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
  };

  const form = useForm<WaitlistForm>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: WaitlistForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("launch_signups")
        .insert({ email: data.email, source: "under_construction" });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already on the list!");
        } else {
          throw error;
        }
      } else {
        toast.success("Welcome to the future!");
      }
      setIsSubmitted(true);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Auth button in top right */}
      <div className="absolute top-6 right-6 z-20">
        {user ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 border-primary/20 hover:bg-primary/10"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2 border-primary/20 hover:bg-primary/10"
            >
              <Link to="/auth">
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Glowing orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/30 rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.4, 0.6],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <AnimatedLogo size="lg" />
            </motion.div>

            {/* Status badge with waitlist count */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-sm font-medium text-primary">
                {waitlistCount !== null && waitlistCount > 0 
                  ? `${waitlistCount.toLocaleString()}+ Already Joined` 
                  : "Exclusive Access Opening Soon"}
              </span>
            </motion.div>

            {/* Main heading - SEO optimized */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              <span className="text-foreground">The World's Most</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Exclusive Concierge
              </span>
              <br />
              <span className="text-foreground">is Coming</span>
            </motion.h1>

            {/* SEO-rich description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed"
            >
              Private jets. Superyachts. Off-market real estate. Rare art. 
              <span className="text-foreground font-medium"> 24/7 white-glove service</span> for those who expect nothing less than extraordinary.
            </motion.p>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-10 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                By Invitation Only
              </span>
              <span className="text-primary/30">|</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-primary" />
                UHNW Clientele
              </span>
              <span className="text-primary/30">|</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-accent" />
                Global Coverage
              </span>
            </motion.div>

            {/* Waitlist form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              {!isSubmitted ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                placeholder="Enter your email"
                                className="h-14 pl-12 pr-4 bg-secondary/50 border-primary/20 focus:border-primary text-base rounded-xl"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-left mt-1" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-14 px-8 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold text-base group"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Join Waitlist
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">You're on the exclusive list!</p>
                      <p className="text-sm text-muted-foreground">Priority access when we launch.</p>
                    </div>
                  </div>
                  
                  {/* Share CTA after signup */}
                  <p className="text-sm text-muted-foreground">
                    Share with those who deserve extraordinary experiences
                  </p>
                  <div className="flex items-center gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-full bg-secondary/50 border border-primary/10 text-muted-foreground ${social.color} transition-colors`}
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Stats strip for social proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="text-center p-3"
                >
                  <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Services preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-12"
            >
              {services.map((item, i) => (
                <motion.div
                  key={item.label}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/30 border border-primary/10 hover:border-primary/30 transition-colors"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.05 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground text-center">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Footer with social links */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 py-8 border-t border-primary/10"
        >
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Social links */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Follow us:</span>
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full bg-secondary/50 border border-primary/10 text-muted-foreground ${social.color} transition-colors`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

              {/* Notify prompt */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bell className="w-4 h-4" />
                <span>Be among the first to experience exclusive access</span>
              </div>

              {/* Copyright */}
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Aurelia Private Concierge
              </p>
            </div>
          </div>
        </motion.footer>
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default UnderConstruction;
