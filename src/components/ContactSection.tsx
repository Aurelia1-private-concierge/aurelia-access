import { motion } from "framer-motion";
import { useState } from "react";
import { Send, User, Mail, MessageSquare, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkRateLimit, generateFingerprint } from "@/lib/rate-limit";

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
      // Check rate limit (5 submissions per hour per fingerprint + email combo)
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
      
      // Send email notification to admin
      try {
        await supabase.functions.invoke("send-email", {
          body: {
            to: "Tye3to1@outlook.com",
            subject: `New Contact Form Submission from ${formData.name}`,
            template: "custom",
            data: {
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: 'Georgia', serif; background: #0a0a0a; color: #f5f5f0; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                    .header { text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 30px; margin-bottom: 30px; }
                    .logo { font-size: 28px; letter-spacing: 8px; color: #D4AF37; font-weight: 300; }
                    .content { line-height: 1.8; color: #c0c0c0; }
                    .content h1 { color: #f5f5f0; font-weight: 400; font-size: 24px; }
                    .field { margin-bottom: 16px; }
                    .field-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
                    .field-value { font-size: 16px; color: #f5f5f0; margin-top: 4px; }
                    .message-box { background: #1a1a1a; padding: 20px; border-left: 3px solid #D4AF37; margin-top: 20px; }
                    .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #666; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <div class="logo">AURELIA</div>
                      <p style="color: #888; font-size: 12px; letter-spacing: 2px; margin-top: 10px;">NEW CONTACT SUBMISSION</p>
                    </div>
                    <div class="content">
                      <h1>New Contact Form Submission</h1>
                      <div class="field">
                        <div class="field-label">Name</div>
                        <div class="field-value">${formData.name}</div>
                      </div>
                      <div class="field">
                        <div class="field-label">Email</div>
                        <div class="field-value">${formData.email}</div>
                      </div>
                      ${formData.phone ? `
                      <div class="field">
                        <div class="field-label">Phone</div>
                        <div class="field-value">${formData.phone}</div>
                      </div>
                      ` : ''}
                      <div class="field">
                        <div class="field-label">Message</div>
                        <div class="message-box">${formData.message}</div>
                      </div>
                    </div>
                    <div class="footer">
                      <p>Submitted via Aurelia Website Contact Form</p>
                    </div>
                  </div>
                </body>
                </html>
              `,
            },
          },
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail the form submission if email fails
      }
      
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
    <section id="contact" className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.03] blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-4 mb-6">
                <span className="w-12 h-px bg-primary/40" />
                <p className="text-[11px] uppercase tracking-[0.4em] text-primary/70 font-medium">
                  Get in Touch
                </p>
              </div>
              <h2 
                className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Begin Your <span className="italic text-muted-foreground/70">Journey</span>
              </h2>
              <p className="text-muted-foreground font-light leading-relaxed max-w-lg">
                Whether you seek membership information or wish to discuss a bespoke request, 
                our liaison team is at your service.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 pt-8 border-t border-border/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-card border border-border/30 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                  <a 
                    href="mailto:concierge@Aurelia-privateconcierge.com" 
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    concierge@Aurelia-privateconcierge.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-card border border-border/30 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">WhatsApp</p>
                  <a 
                    href="https://wa.me/+447309935106" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    +44 730 993 5106
                  </a>
                </div>
              </div>
            </div>

            {/* Response time */}
            <div className="p-6 bg-card/50 border border-border/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Expected Response</p>
              <p className="text-2xl text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Within 60 minutes
              </p>
              <p className="text-xs text-muted-foreground mt-1">During business hours • 24/7 for members</p>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card/30 border border-border/20 p-8 md:p-10"
          >
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full pl-12 pr-4 py-4 bg-background border border-border/30 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Your email"
                        className="w-full pl-12 pr-4 py-4 bg-background border border-border/30 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border/30 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                    Your Message
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-muted-foreground/50" />
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How may we assist you?"
                      rows={5}
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border/30 text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.25em] uppercase hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 gold-glow-hover"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-muted-foreground/50">
                  Your information is protected by 256-bit encryption
                </p>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Send className="w-8 h-8 text-primary" />
                </div>
                <h3 
                  className="text-2xl text-foreground mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Message Received
                </h3>
                <p className="text-muted-foreground font-light">
                  Our liaison team will respond within 60 minutes.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;