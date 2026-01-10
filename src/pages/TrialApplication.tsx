import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Shield,
  Plane,
  Anchor,
  Gem,
  Building2,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const interests = [
  { id: "aviation", label: "Private Aviation", icon: Plane },
  { id: "yachts", label: "Yacht Charters", icon: Anchor },
  { id: "real_estate", label: "Luxury Real Estate", icon: Building2 },
  { id: "collectibles", label: "Art & Collectibles", icon: Gem },
  { id: "events", label: "Exclusive Events", icon: Star },
  { id: "travel", label: "Bespoke Travel", icon: Crown },
];

const incomeRanges = [
  { value: "500k-1m", label: "£500,000 - £1,000,000" },
  { value: "1m-5m", label: "£1,000,000 - £5,000,000" },
  { value: "5m-10m", label: "£5,000,000 - £10,000,000" },
  { value: "10m+", label: "£10,000,000+" },
  { value: "prefer_not", label: "Prefer not to say" },
];

const TrialApplication = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: user?.email || "",
    phone: "",
    company: "",
    annual_income_range: "",
    interests: [] as string[],
    referral_source: "",
    reason: "",
  });

  const toggleInterest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please sign in first", variant: "destructive" });
      return;
    }

    if (!formData.full_name || !formData.email || formData.interests.length === 0) {
      toast({ title: "Please complete all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("trial_applications").insert({
        user_id: user.id,
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone || null,
        company: formData.company || null,
        annual_income_range: formData.annual_income_range || null,
        interests: formData.interests,
        referral_source: formData.referral_source || null,
        reason: formData.reason || null,
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: "Application submitted", description: "We'll review your application within 24 hours." });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({ title: "Error", description: "Failed to submit application. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-4xl text-foreground mb-4">Application Received</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your interest in Aurelia. Our membership committee will review your
              application and respond within 24 hours.
            </p>
            <div className="p-6 bg-card/50 border border-border/30 rounded-lg text-left">
              <h3 className="font-medium text-foreground mb-4">What happens next?</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                  Our team reviews your application
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                  You'll receive an email with your trial activation
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                  Enjoy 7 days of full Gold-tier access
                </li>
              </ul>
            </div>
            <Button className="mt-8" onClick={() => window.location.href = "/dashboard"}>
              Go to Dashboard
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">Exclusive 7-Day Trial</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6">
              Experience Aurelia
            </h1>
            <p className="text-xl text-muted-foreground">
              Apply for a complimentary 7-day trial with full Gold-tier access.
              Our membership committee reviews each application personally.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-center gap-4 mb-12">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="font-serif text-2xl text-foreground mb-2">Personal Information</h2>
                  <p className="text-muted-foreground">Tell us about yourself</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Your full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+44 ..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Your company"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Annual Income Range</label>
                  <Select
                    value={formData.annual_income_range}
                    onValueChange={(v) => setFormData({ ...formData, annual_income_range: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => setStep(2)} disabled={!formData.full_name || !formData.email}>
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Interests */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="font-serif text-2xl text-foreground mb-2">Your Interests</h2>
                  <p className="text-muted-foreground">Select the services you're most interested in</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {interests.map((interest) => {
                    const isSelected = formData.interests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`p-4 rounded-lg border transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border/50 hover:border-border"
                        }`}
                      >
                        <interest.icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <p className={`text-sm ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                          {interest.label}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)} disabled={formData.interests.length === 0}>
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Final Details */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="font-serif text-2xl text-foreground mb-2">Final Details</h2>
                  <p className="text-muted-foreground">Help us understand your expectations</p>
                </div>

                <div>
                  <label className="text-sm font-medium">How did you hear about Aurelia?</label>
                  <Select
                    value={formData.referral_source}
                    onValueChange={(v) => setFormData({ ...formData, referral_source: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="referral">Personal Referral</SelectItem>
                      <SelectItem value="search">Search Engine</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="press">Press/Media</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Why are you interested in Aurelia?</label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Tell us about your lifestyle needs and what you hope to experience..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="p-4 bg-muted/20 rounded-lg border border-border/30">
                  <h4 className="font-medium text-foreground mb-2">Trial Benefits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✓ 7 days of full Gold-tier access</li>
                    <li>✓ Dedicated trial concierge</li>
                    <li>✓ 3 complimentary service requests</li>
                    <li>✓ No credit card required</li>
                  </ul>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrialApplication;
