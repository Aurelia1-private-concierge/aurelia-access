import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkRateLimit, generateFingerprint } from "@/lib/rate-limit";
import { z } from "zod";

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().max(30, "Phone must be less than 30 characters").optional(),
  category: z.string().min(1, "Please select a category"),
  message: z.string().trim().max(2000, "Message must be less than 2000 characters").optional(),
});

interface TriptychInquiryFormProps {
  affiliateCode: string;
}

const categoryOptions = [
  { value: "category-1", label: "Category I – Essential Immersion" },
  { value: "category-2", label: "Category II – Cultural Depth" },
  { value: "category-3", label: "Category III – Elevated Access" },
  { value: "category-4", label: "Category IV – Founding Circle" },
  { value: "undecided", label: "I'd like to learn more first" },
];

const TriptychInquiryForm = ({ affiliateCode }: TriptychInquiryFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form data
    const result = inquirySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Rate limiting
      const identifier = `${generateFingerprint()}_${formData.email}`;
      const rateCheck = await checkRateLimit(identifier, "triptych_inquiry", 3, 60);
      
      if (!rateCheck.allowed) {
        toast.error(rateCheck.error || "Too many requests. Please try again later.");
        setIsSubmitting(false);
        return;
      }

      // Submit to database
      const { error } = await supabase.from("affiliate_sales").insert({
        affiliate_code: affiliateCode,
        experience_name: "TRIPTYCH Rio 2025",
        partner_company: "Journeys Beyond Limits",
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone || null,
        preferred_category: formData.category,
        message: formData.message || null,
        status: "pending",
        commission_rate: 6,
      });

      if (error) throw error;

      // Send notification email
      try {
        await supabase.functions.invoke("notify-admin", {
          body: {
            type: "affiliate_inquiry",
            data: {
              experience: "TRIPTYCH Rio 2025",
              affiliate_code: affiliateCode,
              client_name: formData.name,
              client_email: formData.email,
              client_phone: formData.phone || undefined,
              preferred_category: formData.category,
              message: formData.message || undefined,
            },
          },
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail the submission if email fails
      }

      setIsSubmitted(true);
      toast.success("Your inquiry has been received");
    } catch (error) {
      console.error("Inquiry form error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 
          className="text-2xl text-foreground mb-3"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Inquiry Received
        </h3>
        <p className="text-muted-foreground font-light max-w-md mx-auto">
          Thank you for your interest in TRIPTYCH. Our team will review your inquiry and 
          be in touch within 48 hours to discuss access and availability.
        </p>
        <p className="text-xs text-muted-foreground/60 mt-6">
          Reference: {affiliateCode}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Full Name *"
            required
            className={`w-full px-4 py-4 bg-card/30 border ${
              errors.name ? "border-destructive" : "border-border/20"
            } text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40 transition-colors`}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>
        <div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email Address *"
            required
            className={`w-full px-4 py-4 bg-card/30 border ${
              errors.email ? "border-destructive" : "border-border/20"
            } text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40 transition-colors`}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>
      </div>

      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="Phone (optional)"
        className="w-full px-4 py-4 bg-card/30 border border-border/20 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40 transition-colors"
      />

      <div>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
          className={`w-full px-4 py-4 bg-card/30 border ${
            errors.category ? "border-destructive" : "border-border/20"
          } text-foreground text-sm focus:outline-none focus:border-primary/40 transition-colors appearance-none cursor-pointer`}
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1.5em 1.5em",
          }}
        >
          <option value="" disabled className="text-muted-foreground">
            Preferred Access Category *
          </option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-card text-foreground">
              {option.label}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
      </div>

      <textarea
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        placeholder="Tell us about your interests and any questions (optional)"
        rows={4}
        className="w-full px-4 py-4 bg-card/30 border border-border/20 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40 transition-colors resize-none"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Submit Inquiry
            <Send className="w-3.5 h-3.5" />
          </>
        )}
      </button>

      <p className="text-[10px] text-center text-muted-foreground/60">
        Your information is handled with complete discretion. By submitting, you agree to be 
        contacted regarding this exclusive experience.
      </p>
    </motion.form>
  );
};

export default TriptychInquiryForm;
