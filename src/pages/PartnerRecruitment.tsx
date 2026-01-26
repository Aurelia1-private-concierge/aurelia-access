import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Crown, Users, Globe, TrendingUp, Shield, Star, 
  Check, ArrowRight, Building2, Plane, Ship, 
  UtensilsCrossed, Car, Gem 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const categories = [
  { value: "private_aviation", label: "Private Aviation", icon: Plane },
  { value: "yacht_charter", label: "Yacht Charter", icon: Ship },
  { value: "real_estate", label: "Luxury Real Estate", icon: Building2 },
  { value: "dining", label: "Fine Dining", icon: UtensilsCrossed },
  { value: "chauffeur", label: "Chauffeur Services", icon: Car },
  { value: "collectibles", label: "Art & Collectibles", icon: Gem },
  { value: "events_access", label: "VIP Events", icon: Star },
  { value: "wellness", label: "Wellness & Spa", icon: Shield },
  { value: "travel", label: "Luxury Travel", icon: Globe },
  { value: "security", label: "Personal Security", icon: Shield },
  { value: "shopping", label: "Personal Shopping", icon: Gem },
];

const PartnerRecruitment = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    website: "",
    categories: [] as string[],
    description: "",
    experience_years: "",
    notable_clients: "",
    coverage_regions: "",
  });

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categories.length === 0) {
      toast({ title: "Select Categories", description: "Please select at least one service category.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any).from("partner_applications").insert({
        company_name: formData.company_name,
        contact_name: formData.contact_name,
        email: formData.email,
        phone: formData.phone || null,
        website: formData.website || null,
        category: formData.categories[0] || "general", // Required field - use first category
        categories: formData.categories,
        description: formData.description || null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        notable_clients: formData.notable_clients || null,
        coverage_regions: formData.coverage_regions ? formData.coverage_regions.split(",").map(r => r.trim()) : null,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({ title: "Application Submitted", description: "We'll review your application and contact you shortly." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to submit application. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    { icon: Users, title: "Affluent Clientele", description: "Access to high-net-worth individuals actively seeking premium services" },
    { icon: TrendingUp, title: "Growth Opportunity", description: "Expand your business with qualified leads and repeat clients" },
    { icon: Crown, title: "Premium Positioning", description: "Associate your brand with the world's leading luxury concierge" },
    { icon: Shield, title: "Vetted Network", description: "Join an exclusive network of trusted luxury providers" },
    { icon: Globe, title: "Global Reach", description: "Connect with clients from major markets worldwide" },
    { icon: Star, title: "Concierge Support", description: "Dedicated partnership team to facilitate seamless bookings" },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <Navigation />
        <section className="min-h-screen flex items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center p-8"
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-4xl text-foreground mb-4">Application Received</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your interest in partnering with Aurelia. Our team will review 
              your application and contact you within 48 hours.
            </p>
            <Button onClick={() => window.location.href = "/"} variant="outline">
              Return to Homepage
            </Button>
          </motion.div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary mb-6"
            >
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Partner Program</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl md:text-6xl text-foreground mb-6"
            >
              Grow Your Business with
              <span className="text-primary block">Aurelia</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Join our exclusive network of luxury service providers and connect with 
              the world's most discerning clientele.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl text-foreground text-center mb-12"
          >
            Why Partner with Aurelia?
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border/50 rounded-xl p-6 group hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-serif text-3xl text-foreground mb-4">Apply to Join</h2>
              <p className="text-muted-foreground">
                Complete the form below and our partnership team will review your application
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border/50 rounded-xl p-8"
            >
              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        step >= s
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`w-12 h-0.5 ml-2 ${
                          step > s ? "bg-primary" : "bg-secondary"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step 1: Company Info */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="font-serif text-xl text-foreground mb-4">Company Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Company Name *</label>
                        <Input
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          required
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Contact Name *</label>
                        <Input
                          value={formData.contact_name}
                          onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                          required
                          className="bg-background"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Email *</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Phone</label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-background"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Website</label>
                      <Input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://"
                        className="bg-background"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        if (formData.company_name && formData.contact_name && formData.email) {
                          setStep(2);
                        } else {
                          toast({ title: "Required Fields", description: "Please fill in all required fields.", variant: "destructive" });
                        }
                      }}
                      className="w-full mt-4"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Service Categories */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="font-serif text-xl text-foreground mb-4">Service Categories</h3>
                    <p className="text-sm text-muted-foreground mb-4">Select all categories that apply to your services</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        const isSelected = formData.categories.includes(category.value);
                        return (
                          <button
                            key={category.value}
                            type="button"
                            onClick={() => handleCategoryToggle(category.value)}
                            className={`p-4 rounded-lg border text-left transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-border/50 hover:border-primary/50"
                            }`}
                          >
                            <Icon className={`w-5 h-5 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                            <span className={`text-sm ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                              {category.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (formData.categories.length > 0) {
                            setStep(3);
                          } else {
                            toast({ title: "Select Categories", description: "Please select at least one category.", variant: "destructive" });
                          }
                        }}
                        className="flex-1"
                      >
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Details */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="font-serif text-xl text-foreground mb-4">Additional Details</h3>
                    
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">About Your Company</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Tell us about your services, expertise, and what makes you unique..."
                        rows={4}
                        className="bg-background"
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Years in Business</label>
                        <Input
                          type="number"
                          value={formData.experience_years}
                          onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Coverage Regions</label>
                        <Input
                          value={formData.coverage_regions}
                          onChange={(e) => setFormData({ ...formData, coverage_regions: e.target.value })}
                          placeholder="e.g., Europe, Middle East, Asia"
                          className="bg-background"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Notable Clients / References</label>
                      <Textarea
                        value={formData.notable_clients}
                        onChange={(e) => setFormData({ ...formData, notable_clients: e.target.value })}
                        placeholder="Share examples of past clients or notable projects (optional)"
                        rows={3}
                        className="bg-background"
                      />
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartnerRecruitment;