import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Sparkles, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useTravelDNA,
  TRAVELER_ARCHETYPES,
  PACE_PREFERENCES,
  ACCOMMODATION_TIERS,
  CUISINE_OPTIONS,
  ACTIVITY_OPTIONS,
} from "@/hooks/useTravelDNA";

interface TravelDNAOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const TravelDNAOnboarding = ({ onComplete, onSkip }: TravelDNAOnboardingProps) => {
  const { saveProfile, completeOnboarding } = useTravelDNA();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [archetype, setArchetype] = useState<string | null>(null);
  const [pace, setPace] = useState<string | null>(null);
  const [accommodation, setAccommodation] = useState<string | null>(null);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [activities, setActivities] = useState<Record<string, boolean>>({});
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([]);

  const specialOptions = [
    "Dietary restrictions",
    "Accessibility needs",
    "Pet-friendly",
    "Child-friendly",
    "Privacy-focused",
    "Security detail",
  ];

  const steps = [
    { title: "Traveler Archetype", subtitle: "How would you describe your travel style?" },
    { title: "Travel Pace", subtitle: "How do you prefer to experience destinations?" },
    { title: "Accommodation", subtitle: "Where do you feel most at home?" },
    { title: "Culinary Preferences", subtitle: "What dining experiences delight you?" },
    { title: "Activities & Interests", subtitle: "What experiences do you seek?" },
    { title: "Special Requirements", subtitle: "Anything we should always consider?" },
  ];

  const toggleCuisine = (cuisine: string) => {
    setCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const toggleActivity = (activityId: string) => {
    setActivities(prev => ({
      ...prev,
      [activityId]: !prev[activityId],
    }));
  };

  const toggleSpecial = (req: string) => {
    setSpecialRequirements(prev =>
      prev.includes(req)
        ? prev.filter(r => r !== req)
        : [...prev, req]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!archetype;
      case 1: return !!pace;
      case 2: return !!accommodation;
      case 3: return cuisines.length > 0;
      case 4: return Object.values(activities).some(v => v);
      case 5: return true; // Optional
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
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
      
      toast.success("Your Travel DNA has been created");
      onComplete();
    } catch (err) {
      toast.error("Failed to save preferences");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid gap-3">
            {TRAVELER_ARCHETYPES.map((type) => (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setArchetype(type.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  archetype === type.id
                    ? "bg-primary/15 border-primary/50"
                    : "bg-secondary/30 border-border/30 hover:border-primary/30"
                }`}
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

      case 1:
        return (
          <div className="grid gap-3">
            {PACE_PREFERENCES.map((pref) => (
              <motion.button
                key={pref.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPace(pref.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  pace === pref.id
                    ? "bg-primary/15 border-primary/50"
                    : "bg-secondary/30 border-border/30 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-foreground">{pref.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{pref.description}</p>
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

      case 2:
        return (
          <div className="grid gap-3">
            {ACCOMMODATION_TIERS.map((tier) => (
              <motion.button
                key={tier.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAccommodation(tier.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  accommodation === tier.id
                    ? "bg-primary/15 border-primary/50"
                    : "bg-secondary/30 border-border/30 hover:border-primary/30"
                }`}
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

      case 3:
        return (
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((cuisine) => (
              <motion.button
                key={cuisine}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCuisine(cuisine)}
                className={`px-4 py-2 rounded-full border text-sm transition-all ${
                  cuisines.includes(cuisine)
                    ? "bg-primary/20 border-primary/50 text-primary"
                    : "bg-secondary/30 border-border/30 text-foreground/70 hover:border-primary/30"
                }`}
              >
                {cuisine}
              </motion.button>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="grid grid-cols-2 gap-3">
            {ACTIVITY_OPTIONS.map((activity) => (
              <motion.button
                key={activity.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleActivity(activity.id)}
                className={`p-3 rounded-xl border text-left text-sm transition-all ${
                  activities[activity.id]
                    ? "bg-primary/15 border-primary/50"
                    : "bg-secondary/30 border-border/30 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground/90">{activity.label}</span>
                  {activities[activity.id] && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select any that apply. This helps us anticipate your needs.
            </p>
            <div className="flex flex-wrap gap-2">
              {specialOptions.map((req) => (
                <motion.button
                  key={req}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSpecial(req)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${
                    specialRequirements.includes(req)
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "bg-secondary/30 border-border/30 text-foreground/70 hover:border-primary/30"
                  }`}
                >
                  {req}
                </motion.button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-card border border-border/30 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-border/20 bg-gradient-to-r from-primary/10 via-transparent to-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-serif text-xl text-foreground">Travel DNA</h2>
                <p className="text-xs text-muted-foreground">Personalization Profile</p>
              </div>
            </div>
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress */}
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= step ? "bg-primary" : "bg-border/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="font-serif text-lg text-foreground mb-1">
                {steps[step].title}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {steps[step].subtitle}
              </p>
              <div className="max-h-[300px] overflow-y-auto pr-2">
                {renderStepContent()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/20 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep(prev => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              "Saving..."
            ) : step === steps.length - 1 ? (
              "Complete"
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TravelDNAOnboarding;
