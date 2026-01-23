import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, User, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PartnerWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCategory?: string;
}

const categories = [
  "Private Aviation",
  "Yacht Charter",
  "Luxury Hotels",
  "Private Dining",
  "Exclusive Events",
  "Security Services",
  "Wellness & Spa",
  "Luxury Automotive",
  "Real Estate",
  "Personal Shopping",
  "Art & Collectibles",
  "Technology"
];

const PartnerWaitlistModal = ({ isOpen, onClose, preselectedCategory }: PartnerWaitlistModalProps) => {
  const [interestType, setInterestType] = useState<"partner" | "member" | null>(null);
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    preselectedCategory ? [preselectedCategory] : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !interestType) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("partner_waitlist").insert({
        email,
        company_name: companyName || null,
        interest_type: interestType,
        category_preferences: selectedCategories.length > 0 ? selectedCategories : null,
        message: message || null
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already on our waitlist");
        } else {
          throw error;
        }
      } else {
        setIsSubmitted(true);
        toast.success("You're on the list! We'll be in touch soon.");
      }
    } catch (error) {
      console.error("Waitlist error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form after animation
    setTimeout(() => {
      setInterestType(null);
      setEmail("");
      setCompanyName("");
      setMessage("");
      setSelectedCategories(preselectedCategory ? [preselectedCategory] : []);
      setIsSubmitted(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg bg-card border border-border/20 rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/10">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 
                className="text-2xl text-foreground"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {isSubmitted ? "You're on the List" : "Join Our Network"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isSubmitted 
                  ? "We'll notify you when we launch in your selected categories."
                  : "Be among the first to access our curated partner network."
                }
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    Thank you for your interest in Aurelia's exclusive partner network.
                  </p>
                  <Button onClick={handleClose} className="mt-6">
                    Close
                  </Button>
                </motion.div>
              ) : !interestType ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    How would you like to connect with us?
                  </p>
                  <button
                    onClick={() => setInterestType("partner")}
                    className="w-full p-4 border border-border/20 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-border/20 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                        <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">I'm a Service Provider</h3>
                        <p className="text-xs text-muted-foreground">Apply to join our partner network</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setInterestType("member")}
                    className="w-full p-4 border border-border/20 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-border/20 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                        <User className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">I'm a Member</h3>
                        <p className="text-xs text-muted-foreground">Notify me when partners are available</p>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={() => setInterestType(null)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
                  >
                    ← Back
                  </button>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="bg-background/50"
                    />
                  </div>

                  {interestType === "partner" && (
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Company Name
                      </label>
                      <Input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your company"
                        className="bg-background/50"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Service Categories of Interest
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                            selectedCategories.includes(category)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/20 text-muted-foreground hover:border-border/40"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {interestType === "partner" && (
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Tell us about your services
                      </label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Brief description of your offerings..."
                        className="bg-background/50 min-h-[80px]"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      interestType === "partner" ? "Apply to Partner Network" : "Join Waitlist"
                    )}
                  </Button>
                </motion.form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PartnerWaitlistModal;
