import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowRight, Check, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type ServiceCategory = 
  | "private_aviation" 
  | "yacht_charter" 
  | "real_estate" 
  | "collectibles" 
  | "events_access" 
  | "security" 
  | "dining" 
  | "travel" 
  | "wellness" 
  | "shopping";

const categories: { value: ServiceCategory; label: string }[] = [
  { value: "private_aviation", label: "Private Aviation" },
  { value: "yacht_charter", label: "Yacht Charters" },
  { value: "real_estate", label: "Real Estate" },
  { value: "collectibles", label: "Rare Collectibles" },
  { value: "events_access", label: "Exclusive Events" },
  { value: "security", label: "Security & Privacy" },
  { value: "dining", label: "Fine Dining" },
  { value: "travel", label: "Bespoke Travel" },
  { value: "wellness", label: "Wellness & Medical" },
  { value: "shopping", label: "Personal Shopping" },
];

const PartnerApply = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    description: "",
    categories: [] as ServiceCategory[],
  });

  const handleCategoryToggle = (category: ServiceCategory) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to apply as a partner");
      navigate("/auth");
      return;
    }

    if (!formData.companyName || !formData.contactName || !formData.email || formData.categories.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("partners")
        .insert({
          user_id: user.id,
          company_name: formData.companyName,
          contact_name: formData.contactName,
          email: formData.email,
          phone: formData.phone || null,
          website: formData.website || null,
          description: formData.description || null,
          categories: formData.categories,
        });

      if (error) throw error;

      // Note: Partner role is automatically granted via database trigger when admin approves
      toast.success("Application submitted successfully! You'll be notified when approved.");
      navigate("/partner");
    } catch (error: any) {
      console.error("Application error:", error);
      if (error.code === "23505") {
        toast.error("You have already submitted an application");
        navigate("/partner");
      } else {
        toast.error(error.message || "Failed to submit application");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-2 border border-border/30 bg-secondary/50 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Building2 className="w-3 h-3 text-primary" />
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
                Partner Program
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
              Join Our <span className="text-primary italic">Network</span>
            </h1>
            
            <p className="text-muted-foreground font-light">
              Partner with Aurelia to serve the world's most discerning clientele.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  step >= s 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary border border-border text-muted-foreground"
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-px ${step > s ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-card/50 border border-border/30 rounded-2xl p-8"
          >
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif text-foreground mb-6">Company Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Your company name"
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="Primary contact"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@company.com"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://yourcompany.com"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!formData.companyName || !formData.contactName || !formData.email}
                  className="w-full mt-6"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif text-foreground mb-6">Service Categories</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Select the categories that best describe your services.
                </p>
                
                <div className="grid md:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <label
                      key={cat.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.categories.includes(cat.value)
                          ? "border-primary bg-primary/10"
                          : "border-border/30 hover:border-border"
                      }`}
                    >
                      <Checkbox
                        checked={formData.categories.includes(cat.value)}
                        onCheckedChange={() => handleCategoryToggle(cat.value)}
                      />
                      <span className="text-sm text-foreground">{cat.label}</span>
                    </label>
                  ))}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(3)}
                    disabled={formData.categories.length === 0}
                    className="flex-1"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif text-foreground mb-6">About Your Services</h2>
                
                <div>
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about your company, your expertise, and what makes your services exceptional..."
                    rows={6}
                    className="mt-1.5"
                  />
                </div>

                <div className="bg-secondary/30 rounded-xl p-4 border border-border/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">What happens next?</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Our team will review your application within 48 hours. Upon approval, 
                        you'll gain access to the Partner Portal to manage your services and requests.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartnerApply;
