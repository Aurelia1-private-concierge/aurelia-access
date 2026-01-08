import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Dna } from "lucide-react";
import { useTravelDNA, TRAVELER_ARCHETYPES, PACE_PREFERENCES, ACCOMMODATION_TIERS } from "@/hooks/useTravelDNA";

interface TravelDNACardProps {
  onEditClick?: () => void;
}

const TravelDNACard = ({ onEditClick }: TravelDNACardProps) => {
  const { profile, isLoading } = useTravelDNA();

  if (isLoading) {
    return (
      <div className="bg-card border border-border/30 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-secondary/50 rounded w-1/3 mb-4" />
        <div className="h-4 bg-secondary/30 rounded w-2/3 mb-2" />
        <div className="h-4 bg-secondary/30 rounded w-1/2" />
      </div>
    );
  }

  if (!profile || !profile.onboarding_completed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-2xl p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Dna className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-foreground">Travel DNA</h3>
              <p className="text-xs text-muted-foreground">Unlock personalized experiences</p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4 mb-4">
          Complete your Travel DNA profile to receive tailored recommendations and anticipatory service from Orla.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEditClick}
          className="w-full py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl text-primary text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Create Your Travel DNA
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    );
  }

  const archetype = TRAVELER_ARCHETYPES.find(a => a.id === profile.traveler_archetype);
  const pace = PACE_PREFERENCES.find(p => p.id === profile.pace_preference);
  const accommodation = ACCOMMODATION_TIERS.find(a => a.id === profile.accommodation_tier);
  const activeActivities = profile.activity_preferences 
    ? Object.entries(profile.activity_preferences).filter(([_, v]) => v).map(([k]) => k)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/5 via-card to-card border border-primary/20 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-border/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 10px rgba(212, 175, 55, 0.2)",
                  "0 0 20px rgba(212, 175, 55, 0.3)",
                  "0 0 10px rgba(212, 175, 55, 0.2)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/40"
            >
              <Dna className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h3 className="font-serif text-lg text-foreground">Travel DNA</h3>
              <p className="text-xs text-primary uppercase tracking-widest">
                {archetype?.label || "Profile Complete"}
              </p>
            </div>
          </div>
          
          <button
            onClick={onEditClick}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/20 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Pace</p>
            <p className="text-sm text-foreground">{pace?.label || "—"}</p>
          </div>
          <div className="bg-secondary/20 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Stays</p>
            <p className="text-sm text-foreground">{accommodation?.label || "—"}</p>
          </div>
        </div>

        {/* Cuisines */}
        {profile.cuisine_affinities && profile.cuisine_affinities.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Culinary</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.cuisine_affinities.slice(0, 4).map((cuisine) => (
                <span
                  key={cuisine}
                  className="px-2 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] text-primary"
                >
                  {cuisine}
                </span>
              ))}
              {profile.cuisine_affinities.length > 4 && (
                <span className="px-2 py-1 text-[10px] text-muted-foreground">
                  +{profile.cuisine_affinities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Activities */}
        {activeActivities.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {activeActivities.slice(0, 3).map((activity) => (
                <span
                  key={activity}
                  className="px-2 py-1 bg-secondary/30 border border-border/30 rounded-full text-[10px] text-foreground/70"
                >
                  {activity.replace(/_/g, " ")}
                </span>
              ))}
              {activeActivities.length > 3 && (
                <span className="px-2 py-1 text-[10px] text-muted-foreground">
                  +{activeActivities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-primary/5 border-t border-primary/10">
        <p className="text-[10px] text-center text-muted-foreground">
          <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
          Orla uses this to personalize your experience
        </p>
      </div>
    </motion.div>
  );
};

export default TravelDNACard;
