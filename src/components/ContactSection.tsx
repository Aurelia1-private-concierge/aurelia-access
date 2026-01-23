import { motion } from "framer-motion";
import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkRateLimit, generateFingerprint } from "@/lib/rate-limit";
import { n8nTriggers } from "@/lib/n8n-client";

const ContactSection = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const identifier = `${generateFingerprint()}_${formData.email}`;
      const rateCheck = await checkRateLimit(identifier, "contact_form", 5, 60);
      
      if (!rateCheck.allowed) {
        toast.error(rateCheck.error || "Too many requests. Please try again later.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from("contact_submissions")
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message,
          source: "website",
        });
      
      if (error) throw error;
      
      try {
        await supabase.functions.invoke("notify-admin", {
          body: {
            type: "contact_form",
            data: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone || undefined,
              message: formData.message,
            },
          },
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
      }

      // Trigger n8n workflow for new contact (non-blocking)
      n8nTriggers.newContactSubmission({
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message,
        source: "website",
      }).catch((err) => console.error("N8N trigger failed:", err));
      
      setIsSubmitted(true);
      toast.success(t("contact.success"));
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-background relative">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-4">
            Contact
          </span>
          <h2 
            className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Get In Touch
          </h2>
          <p className="text-muted-foreground font-light max-w-lg mx-auto">
            Ready to experience unparalleled service? Our team is available around the clock.
          </p>
        </motion.div>

        {/* Form or Success */}
        {!isSubmitted ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-4 max-w-xl mx-auto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name"
                required
                className="w-full px-4 py-3 bg-card/30 border border-border/20 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40 transition-colors"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                required
                className="w-full px-4 py-3 bg-card/30 border border-border/20 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone (optional)"
              className="w-full px-4 py-3 bg-card/30 border border-border/20 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40 transition-colors"
            />
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="How can we assist you?"
              required
              rows={4}
              className="w-full px-4 py-3 bg-card/30 border border-border/20 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40 transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Send Message
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 
              className="text-2xl text-foreground mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Message Received
            </h3>
            <p className="text-sm text-muted-foreground">
              Our team will respond within 24 hours.
            </p>
          </motion.div>
        )}

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center mt-12 pt-8 border-t border-border/10"
        >
          <p className="text-xs text-muted-foreground/50 mb-2">Or reach us directly</p>
          <a 
            href="mailto:concierge@aurelia-privateconcierge.com"
            className="text-sm text-primary hover:underline"
          >
            concierge@aurelia-privateconcierge.com
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
