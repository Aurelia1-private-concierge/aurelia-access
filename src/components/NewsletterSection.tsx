import { motion } from "framer-motion";
import { useState } from "react";
import { Send, CheckCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkRateLimit, generateFingerprint } from "@/lib/rate-limit";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    
    try {
      // Check rate limit (3 signups per hour per fingerprint)
      const identifier = `${generateFingerprint()}_newsletter`;
      const rateCheck = await checkRateLimit(identifier, "newsletter_signup", 3, 60);
      
      if (!rateCheck.allowed) {
        toast.error(rateCheck.error || "Too many signup attempts. Please try again later.");
        setIsLoading(false);
        return;
      }

      // Save to launch_signups table
      const { error } = await supabase
        .from("launch_signups")
        .insert({
          email: email,
          notification_preference: "email",
          source: "newsletter",
        });

      if (error) {
        // Check for duplicate email
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
          setIsSubmitted(true);
        } else {
          throw error;
        }
      } else {
        setIsSubmitted(true);
        toast.success("Welcome to the inner circle!");
      }
    } catch (error) {
      console.error("Newsletter signup error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 md:py-32 bg-card/30 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-primary/3 blur-[80px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 mx-auto mb-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
          >
            <Sparkles className="w-7 h-7 text-primary" />
          </motion.div>

          {/* Title */}
          <h2 
            className="text-3xl md:text-4xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Exclusive Access
          </h2>
          <p className="text-muted-foreground font-light mb-10 max-w-lg mx-auto">
            Receive curated invitations to private events, early access to limited offerings, 
            and insights reserved for our inner circle.
          </p>

          {/* Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="relative flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 bg-background border border-border/30 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                  ) : (
                    <>
                      <span className="hidden sm:inline">Subscribe</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/50 mt-4 tracking-wide">
                By subscribing, you agree to receive exclusive communications. Unsubscribe anytime.
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-lg text-foreground mb-1">Welcome to the Inner Circle</p>
                <p className="text-sm text-muted-foreground">Check your inbox for confirmation.</p>
              </div>
            </motion.div>
          )}

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex justify-center items-center gap-6 mt-12 text-[10px] text-muted-foreground/40 uppercase tracking-wide"
          >
            <span>No spam</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
            <span>Unsubscribe anytime</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
            <span>Privacy protected</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
