import { motion } from "framer-motion";
import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
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
      const identifier = `${generateFingerprint()}_newsletter`;
      const rateCheck = await checkRateLimit(identifier, "newsletter_signup", 3, 60);
      
      if (!rateCheck.allowed) {
        toast.error(rateCheck.error || "Too many signup attempts.");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from("launch_signups")
        .insert({
          email: email,
          notification_preference: "email",
          source: "newsletter",
        });

      if (error) {
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
    <section className="py-24 md:py-32 bg-card/20 relative">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-4">
            Newsletter
          </span>
          <h2 
            className="text-3xl md:text-4xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Exclusive Access
          </h2>
          <p className="text-muted-foreground font-light mb-10 max-w-lg mx-auto text-sm">
            Receive curated invitations to private events and early access to limited offerings.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-background border border-border/20 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40 transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-primary text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/40 mt-4">
                Unsubscribe anytime. Privacy protected.
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full border border-primary/30 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-lg text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Welcome to the Inner Circle
                </p>
                <p className="text-xs text-muted-foreground mt-1">Check your inbox for confirmation.</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
