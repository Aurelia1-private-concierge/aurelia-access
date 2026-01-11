import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Crown, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft, 
  Check,
  Plane,
  Utensils,
  MapPin,
  Heart,
  Shield,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTravelDNA, TRAVELER_ARCHETYPES, PACE_PREFERENCES, ACCOMMODATION_TIERS, CUISINE_OPTIONS, ACTIVITY_OPTIONS } from "@/hooks/useTravelDNA";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFunnelTracking } from "@/hooks/useFunnelTracking";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, saveProfile, isLoading: profileLoading } = useTravelDNA();
  const { trackOnboardingStarted, trackOnboardingCompleted } = useFunnelTracking();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTrackedStart, setHasTrackedStart] = useState(false);
  
  // Form state
  const [archetype, setArchetype] = useState<string | null>(null);
  const [pace, setPace] = useState<string | null>(null);
  const [accommodation, setAccommodation] = useState<string | null>(null);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [activities, setActivities] = useState<Record<string, boolean>>({});
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([]);

  const specialOptions = [
    { id: "dietary", label: "Dietary restrictions", icon: Utensils },
    { id: "accessibility", label: "Accessibility needs", icon: Heart },
    { id: "pet", label: "Pet-friendly", icon: Heart },
    { id: "child", label: "Child-friendly", icon: Heart },
    { id: "privacy", label: "Privacy-focused", icon: Shield },
    { id: "security", label: "Security detail", icon: Shield },
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !profileLoading) {
      navigate("/auth");
    }
  }, [user, profileLoading, navigate]);

  // Track onboarding start
  useEffect(() => {
    if (user && !hasTrackedStart && !profile?.onboarding_completed) {
      trackOnboardingStarted();
      setHasTrackedStart(true);
    }
  }, [user, hasTrackedStart, profile, trackOnboardingStarted]);

  // Redirect if onboarding already completed
  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate("/dashboard");
    }
  }, [profile, navigate]);

  const steps = [
    { 
      id: "welcome",
      title: "Welcome to Aurelia",
      subtitle: "Your journey to extraordinary experiences begins now",
      icon: Crown
    },
    { 
      id: "archetype",
      title: "Your Travel Style",
      subtitle: "How would you describe your approach to luxury travel?",
      icon: Plane
    },
    { 
      id: "pace",
      title: "Your Pace",
      subtitle: "How do you prefer to experience destinations?",
      icon: Clock
    },
    { 
      id: "accommodation",
      title: "Accommodation Preference",
      subtitle: "Where do you feel most at home?",
      icon: MapPin
    },
    { 
      id: "cuisines",
      title: "Culinary Preferences",
      subtitle: "What dining experiences delight you?",
      icon: Utensils
    },
    { 
      id: "activities",
      title: "Activities & Interests",
      subtitle: "What experiences do you seek?",
      icon: Heart
    },
    { 
      id: "special",
      title: "Special Considerations",
      subtitle: "Anything we should always keep in mind?",
      icon: Shield
    },
    { 
      id: "complete",
      title: "You're All Set",
      subtitle: "Your personalized concierge experience awaits",
      icon: Sparkles
    },
  ];

  const toggleCuisine = (cuisine: string) => {
    setCuisines(prev =>
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    );
  };

  const toggleActivity = (activityId: string) => {
    setActivities(prev => ({ ...prev, [activityId]: !prev[activityId] }));
  };

  const toggleSpecial = (req: string) => {
    setSpecialRequirements(prev =>
      prev.includes(req) ? prev.filter(r => r !== req) : [...prev, req]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true; // Welcome
      case 1: return !!archetype;
      case 2: return !!pace;
      case 3: return !!accommodation;
      case 4: return cuisines.length > 0;
      case 5: return Object.values(activities).some(v => v);
      case 6: return true; // Optional
      case 7: return true; // Complete
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < steps.length - 2) {
      setStep(prev => prev + 1);
    } else if (step === steps.length - 2) {
      // Save profile before showing completion
      await handleSubmit();
    } else {
      // Navigate to dashboard
      navigate("/dashboard");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await saveProfile({
        traveler_archetype: archetype,
        pace_preference: pace,
        accommodation_tier: accommodation,
        cuisine_affinities: cuisines,
        activity_preferences: activities,
        special_requirements: specialRequirements.length > 0 ? specialRequirements : null,
        onboarding_completed: true,
      });

      if (error) throw new Error(error);
      
      // Track onboarding completed
      trackOnboardingCompleted({ archetype, pace, accommodation });
      
      setStep(steps.length - 1); // Go to completion step
      toast.success("Your preferences have been saved");
    } catch (err) {
      toast.error("Failed to save preferences");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  const CurrentIcon = steps[step].icon;

  const renderStepContent = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center"
            >
              <Crown className="w-12 h-12 text-primary" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-serif text-3xl text-foreground mb-4"
            >
              Welcome, {user?.email?.split('@')[0] || 'Member'}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground max-w-md mx-auto mb-8"
            >
              Let's personalize your experience. In the next few steps, we'll learn about your 
              preferences to curate extraordinary experiences tailored just for you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-4 max-w-sm mx-auto"
            >
              {[
                { label: "2 min", sublabel: "to complete" },
                { label: "6", sublabel: "quick questions" },
                { label: "100%", sublabel: "personalized" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-3 rounded-lg bg-secondary/30">
                  <p className="text-lg font-medium text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
                </div>
              ))}
            </motion.div>
          </div>
        );

      case 1: // Archetype
        return (
          <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
            {TRAVELER_ARCHETYPES.map((type) => (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setArchetype(type.id)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all",
                  archetype === type.id
                    ? "bg-primary/15 border-primary/50"
                    : "bg-secondary/30 border-border/30 hover:border-primary/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-foreground">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                  </div>
                  {archetype === type.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 2: // Pace
        return (
          <div className="grid gap-4">
            {PACE_PREFERENCES.map((pref) => (
              <motion.button
                key={pref.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPace(pref.id)}
                className={cn(
                  "p-5 rounded-xl border text-left transition-all",
                  pace === pref.id
                    ? "bg-primary/15 border-primary/50"
                    : "bg-secondary/30 border-border/30 hover:border-primary/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-lg text-foreground">{pref.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{pref.description}</p>
                  </div>
                  {pace === pref.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 3: // Accommodation
        return (
          <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
            {ACCOMMODATION_TIERS.map((tier) => (
              <motion.button
                key={tier.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAccommodation(tier.id)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all",
                  accommodation === tier.id
                    ? "bg-primary/15 border-primary/50"
                    : "bg-secondary/30 border-border/30 hover:border-primary/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-foreground">{tier.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
                  </div>
                  {accommodation === tier.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 4: // Cuisines
        return (
          <div className="flex flex-wrap gap-3">
            {CUISINE_OPTIONS.map((cuisine) => (
              <motion.button
                key={cuisine}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCuisine(cuisine)}
                className={cn(
                  "px-5 py-3 rounded-full border text-sm transition-all",
                  cuisines.includes(cuisine)
                    ? "bg-primary/20 border-primary/50 text-primary"
                    : "bg-secondary/30 border-border/30 text-foreground/70 hover:border-primary/30"
                )}
              >
                {cuisines.includes(cuisine) && <Check className="w-3 h-3 inline mr-2" />}
                {cuisine}
              </motion.button>
            ))}
          </div>
        );

      case 5: // Activities
        return (
          <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {ACTIVITY_OPTIONS.map((activity) => (
              <motion.button
                key={activity.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleActivity(activity.id)}
                className={cn(
                  "p-4 rounded-xl border text-left text-sm transition-all",
                  activities[activity.id]
                    ? "bg-primary/15 border-primary/50"
                    : "bg-secondary/30 border-border/30 hover:border-primary/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground/90">{activity.label}</span>
                  {activities[activity.id] && <Check className="w-4 h-4 text-primary" />}
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 6: // Special
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select any that apply. This helps us anticipate your needs. You can skip this step.
            </p>
            <div className="flex flex-wrap gap-3">
              {specialOptions.map((req) => (
                <motion.button
                  key={req.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSpecial(req.label)}
                  className={cn(
                    "px-5 py-3 rounded-full border text-sm transition-all",
                    specialRequirements.includes(req.label)
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "bg-secondary/30 border-border/30 text-foreground/70 hover:border-primary/30"
                  )}
                >
                  {specialRequirements.includes(req.label) && <Check className="w-3 h-3 inline mr-2" />}
                  {req.label}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 7: // Complete
        return (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center"
            >
              <Sparkles className="w-12 h-12 text-primary" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-serif text-3xl text-foreground mb-4"
            >
              Your Profile is Complete
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground max-w-md mx-auto mb-8"
            >
              We've created your personalized Travel DNA profile. 
              Orla, your AI concierge, is ready to curate extraordinary experiences just for you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {archetype && (
                <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                  {TRAVELER_ARCHETYPES.find(a => a.id === archetype)?.label}
                </span>
              )}
              {pace && (
                <span className="px-3 py-1.5 rounded-full bg-secondary/50 text-foreground/70 text-sm">
                  {PACE_PREFERENCES.find(p => p.id === pace)?.label} Pace
                </span>
              )}
              {accommodation && (
                <span className="px-3 py-1.5 rounded-full bg-secondary/50 text-foreground/70 text-sm">
                  {ACCOMMODATION_TIERS.find(a => a.id === accommodation)?.label}
                </span>
              )}
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl"
      >
        {/* Skip button */}
        {step < steps.length - 1 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleSkip}
            className="absolute -top-12 right-0 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </motion.button>
        )}

        {/* Card */}
        <div className="bg-card/95 backdrop-blur-xl border border-border/30 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-8 border-b border-border/20 bg-gradient-to-r from-primary/10 via-transparent to-primary/5">
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                key={step}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center"
              >
                <CurrentIcon className="w-7 h-7 text-primary" />
              </motion.div>
              <div>
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-serif text-2xl text-foreground"
                  >
                    {steps[step].title}
                  </motion.h1>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-muted-foreground"
                  >
                    {steps[step].subtitle}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Progress */}
            <div className="flex gap-1.5">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors origin-left",
                    index <= step ? "bg-primary" : "bg-border/30"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-8 pt-0 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(prev => Math.max(0, prev - 1))}
              disabled={step === 0 || step === steps.length - 1}
              className="text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : step === steps.length - 1 ? (
                <>
                  Enter Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : step === steps.length - 2 ? (
                "Complete Setup"
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Step indicator */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Step {step + 1} of {steps.length}
        </p>
      </motion.div>
    </div>
  );
};

export default Onboarding;
