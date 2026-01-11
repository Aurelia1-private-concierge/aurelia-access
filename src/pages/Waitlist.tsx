import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Star, Clock, Gift, Shield, Users, Check, ArrowRight, Sparkles, Globe, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Logo } from "@/components/brand";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const Waitlist = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+44");
  const [signupMethod, setSignupMethod] = useState<"email" | "phone">("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [launchDate, setLaunchDate] = useState<Date>(new Date("2026-02-01"));
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [waitlistCount, setWaitlistCount] = useState(0);

  const countryCodes = [
    { code: "+44", country: "UK" },
    { code: "+1", country: "US" },
    { code: "+971", country: "UAE" },
    { code: "+33", country: "FR" },
    { code: "+49", country: "DE" },
    { code: "+39", country: "IT" },
    { code: "+41", country: "CH" },
    { code: "+65", country: "SG" },
    { code: "+852", country: "HK" },
    { code: "+81", country: "JP" },
  ];

  // Fetch launch date from settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "launch_date")
        .single();
      
      if (data?.value) {
        setLaunchDate(new Date(data.value));
      }

      // Get waitlist count
      const { count } = await supabase
        .from("launch_signups")
        .select("*", { count: "exact", head: true });
      
      setWaitlistCount(count || 0);
    };
    fetchSettings();
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasEmail = signupMethod === "email" && email;
    const hasPhone = signupMethod === "phone" && phone;
    
    if (!hasEmail && !hasPhone) return;

    setIsSubmitting(true);
    try {
      const insertData: {
        email?: string;
        phone?: string;
        country_code?: string;
        notification_preference: string;
        source: string;
      } = {
        notification_preference: signupMethod,
        source: "waitlist_page",
      };

      if (signupMethod === "email") {
        insertData.email = email;
      } else {
        insertData.phone = phone;
        insertData.country_code = countryCode;
      }

      const { error } = await supabase.from("launch_signups").insert(insertData);

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already Registered", description: "You're already on the waitlist!" });
        } else {
          throw error;
        }
      } else {
        setIsSubmitted(true);
        setWaitlistCount(prev => prev + 1);
        toast({ 
          title: "Welcome to the Waitlist", 
          description: signupMethod === "email" 
            ? "You'll receive an email when we launch." 
            : "You'll receive an SMS when we launch."
        });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    { icon: Crown, title: "Priority Access", description: "Be among the first to experience Aurelia's exclusive services" },
    { icon: Gift, title: "Founding Member Perks", description: "Exclusive discounts and lifetime benefits for early adopters" },
    { icon: Star, title: "VIP Onboarding", description: "Personal concierge to guide your first luxury experience" },
    { icon: Shield, title: "Invitation-Only Events", description: "Access to private gatherings and curated experiences" },
  ];

  const services = [
    "Private Aviation",
    "Yacht Charters",
    "Luxury Real Estate",
    "Fine Dining Reservations",
    "VIP Event Access",
    "Personal Security",
    "Wellness Retreats",
    "Art & Collectibles",
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                opacity: 0 
              }}
              animate={{ 
                y: [null, Math.random() * -200],
                opacity: [0, 1, 0],
              }}
              transition={{ 
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5 
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Exclusive Early Access</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl md:text-7xl text-foreground mb-6"
            >
              The Future of
              <span className="block text-primary">Luxury Awaits</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              Aurelia is launching soon. Join the waitlist for exclusive early access to 
              the world's most sophisticated private concierge service.
            </motion.p>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-4 gap-4 max-w-lg mx-auto mb-12"
            >
              {[
                { value: timeLeft.days, label: "Days" },
                { value: timeLeft.hours, label: "Hours" },
                { value: timeLeft.minutes, label: "Minutes" },
                { value: timeLeft.seconds, label: "Seconds" },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="bg-card border border-border/50 rounded-lg p-4"
                >
                  <div className="text-3xl md:text-4xl font-serif text-primary mb-1">
                    {String(item.value).padStart(2, "0")}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </div>
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
                    Welcome to an exclusive circle. We'll notify you via {signupMethod === "email" ? "email" : "SMS"} the moment Aurelia launches.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Toggle between Email and SMS */}
                  <div className="flex justify-center gap-2 p-1 bg-card border border-border/50 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setSignupMethod("email")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
                        signupMethod === "email"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupMethod("phone")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
                        signupMethod === "phone"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Phone className="w-4 h-4" />
                      SMS
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    {signupMethod === "email" ? (
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 h-14 bg-card border-border/50 text-foreground placeholder:text-muted-foreground"
                        required
                      />
                    ) : (
                      <div className="flex-1 flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="h-14 px-3 bg-card border border-border/50 rounded-md text-foreground text-sm"
                        >
                          {countryCodes.map((cc) => (
                            <option key={cc.code} value={cc.code}>
                              {cc.code} {cc.country}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="tel"
                          placeholder="Phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="flex-1 h-14 bg-card border-border/50 text-foreground placeholder:text-muted-foreground"
                          required
                        />
                      </div>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                      {isSubmitting ? "Joining..." : "Join Waitlist"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </div>
              )}

              {/* Social Proof */}
              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span>
                  <strong className="text-foreground">{waitlistCount.toLocaleString()}</strong> people already waiting
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl text-foreground mb-4">Early Access Benefits</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Founding members receive exclusive privileges that will never be offered again
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border/50 rounded-xl p-6 text-center group hover:border-primary/50 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl text-foreground mb-4">What Awaits You</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A world of extraordinary experiences, curated exclusively for you
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="px-6 py-3 bg-card border border-border/50 rounded-full text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all cursor-default"
              >
                {service}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Globe className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="font-serif text-4xl text-foreground mb-4">
                Available Worldwide
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                From Monaco to Maldives, from New York penthouses to Kyoto ryokans — 
                Aurelia's network spans the globe's most prestigious destinations.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                {["London", "New York", "Dubai", "Singapore", "Paris", "Monaco", "Tokyo", "Sydney"].map((city) => (
                  <span key={city} className="px-4 py-2 border border-border/30 rounded-full">
                    {city}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="font-serif text-4xl text-foreground mb-4">
              Don't Miss Your Moment
            </h2>
            <p className="text-muted-foreground mb-8">
              Founding member positions are limited. Secure your place among the elite.
            </p>
            {!isSubmitted && (
              <div className="max-w-md mx-auto space-y-4">
                {/* Toggle between Email and SMS */}
                <div className="flex justify-center gap-2 p-1 bg-card border border-border/50 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSignupMethod("email")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all",
                      signupMethod === "email"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupMethod("phone")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all",
                      signupMethod === "phone"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Phone className="w-4 h-4" />
                    SMS
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  {signupMethod === "email" ? (
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-14 bg-card border-border/50"
                      required
                    />
                  ) : (
                    <div className="flex-1 flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="h-14 px-3 bg-card border border-border/50 rounded-md text-foreground text-sm"
                      >
                        {countryCodes.map((cc) => (
                          <option key={cc.code} value={cc.code}>
                            {cc.code} {cc.country}
                          </option>
                        ))}
                      </select>
                      <Input
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 h-14 bg-card border-border/50"
                        required
                      />
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 px-8 bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? "Joining..." : "Claim Your Spot"}
                  </Button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Waitlist;