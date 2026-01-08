import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Gift, 
  ArrowRight,
  Moon,
  Fingerprint,
  Shield,
  BookOpen,
  Brain,
  Flower2,
  Users,
  Cloud,
  Key,
  Home,
  RefreshCw
} from "lucide-react";
import { useTravelDNA, TravelDNAProfile } from "@/hooks/useTravelDNA";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DiscoveryService {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tagline: string;
  description: string;
  matchReasons: string[];
  archetypes: string[];
  activities: string[];
}

const discoveryServices: DiscoveryService[] = [
  {
    id: "sleep-architecture",
    icon: Moon,
    title: "Sleep Architecture",
    tagline: "Perfect Rest, Engineered",
    description: "Custom sleep environment engineering—bespoke mattress science, circadian lighting design, and acoustic optimization.",
    matchReasons: ["You value wellness experiences", "Your pace preference suggests recovery is important", "Ultra-luxury accommodations deserve perfect sleep"],
    archetypes: ["wellness_seeker", "epicurean"],
    activities: ["spa_wellness"]
  },
  {
    id: "digital-estate",
    icon: Fingerprint,
    title: "Digital Estate Planning",
    tagline: "Secure Your Digital Legacy",
    description: "Comprehensive management of your digital legacy—cryptocurrency inheritance, password vault architecture, and social media legacy planning.",
    matchReasons: ["Your collector profile suggests valuable digital assets", "Modern wealth requires digital protection", "Privacy-conscious travelers need digital security"],
    archetypes: ["collector", "social_maven"],
    activities: ["art_collecting"]
  },
  {
    id: "reputation-sentinel",
    icon: Shield,
    title: "Reputation Sentinel",
    tagline: "Invisible Protection",
    description: "Proactive protection of your digital presence—dark web monitoring, digital footprint management, and crisis response retainers.",
    matchReasons: ["High-profile lifestyles require reputation management", "Social presence needs constant monitoring", "Preventive protection for your personal brand"],
    archetypes: ["social_maven", "collector"],
    activities: ["events_galas"]
  },
  {
    id: "legacy-curation",
    icon: BookOpen,
    title: "Legacy Curation",
    tagline: "Your Story, Preserved",
    description: "Professional archivists documenting your family history, digitizing heirlooms, and creating museum-quality legacy publications.",
    matchReasons: ["Your cultural interests extend to personal heritage", "Collectors understand the value of documentation", "Create a lasting narrative for future generations"],
    archetypes: ["culturalist", "collector"],
    activities: ["cultural_tours", "art_collecting"]
  },
  {
    id: "longevity-concierge",
    icon: Brain,
    title: "Longevity Concierge",
    tagline: "Optimize Your Vitality",
    description: "Access to cutting-edge treatments, personalized health optimization protocols, and the world's foremost specialists in preventive medicine.",
    matchReasons: ["Wellness seekers want the latest in health science", "Intensive travelers need peak performance", "Your lifestyle deserves longevity planning"],
    archetypes: ["wellness_seeker", "adventurer"],
    activities: ["spa_wellness", "adventure_sports"]
  },
  {
    id: "signature-scent",
    icon: Flower2,
    title: "Signature Scent Creation",
    tagline: "Essence, Bottled",
    description: "Bespoke fragrance development for your homes, offices, and private aircraft—working with master perfumers to capture your essence.",
    matchReasons: ["Epicureans appreciate sensory refinement", "Your accommodations deserve a signature atmosphere", "A truly personal luxury experience"],
    archetypes: ["epicurean", "collector"],
    activities: ["private_aviation", "yacht_charters"]
  },
  {
    id: "companion-matching",
    icon: Users,
    title: "Companion Matching",
    tagline: "Curated Connections",
    description: "Vetted travel and dining companions for solo journeys—intelligent, cultured individuals for meaningful connection without complication.",
    matchReasons: ["Solo travelers deserve quality company", "Social mavens appreciate curated connections", "Enhance every experience with the right companion"],
    archetypes: ["social_maven", "epicurean"],
    activities: ["wine_experiences", "cultural_tours"]
  },
  {
    id: "private-meteorology",
    icon: Cloud,
    title: "Private Meteorology",
    tagline: "Your Personal Weather",
    description: "Personal weather forecasting services for yacht crossings, outdoor events, and optimal travel windows—your own meteorologist on call.",
    matchReasons: ["Yacht enthusiasts need precise forecasting", "Adventurers plan around weather windows", "Outdoor events deserve certainty"],
    archetypes: ["adventurer"],
    activities: ["yacht_charters", "adventure_sports", "golf"]
  },
  {
    id: "second-passport",
    icon: Key,
    title: "Second Passport Advisory",
    tagline: "Ultimate Freedom",
    description: "Discreet guidance on citizenship-by-investment programs, residency planning, and global mobility optimization.",
    matchReasons: ["Global travelers need flexible access", "Your lifestyle spans multiple jurisdictions", "Plan for the unexpected with ultimate mobility"],
    archetypes: ["adventurer", "collector"],
    activities: ["private_aviation"]
  },
  {
    id: "household-optimization",
    icon: Home,
    title: "Household Optimization",
    tagline: "Seamless Living",
    description: "Comprehensive estate management—staff training and vetting, smart home integration, and operational efficiency consulting.",
    matchReasons: ["Private accommodations need expert management", "Your homes deserve the same excellence as top hotels", "Streamline your domestic operations"],
    archetypes: ["epicurean", "wellness_seeker"],
    activities: []
  }
];

const getServiceScore = (service: DiscoveryService, profile: TravelDNAProfile | null): number => {
  if (!profile) return Math.random();
  
  let score = 0;
  
  // Match archetype
  if (profile.traveler_archetype && service.archetypes.includes(profile.traveler_archetype)) {
    score += 3;
  }
  
  // Match activities
  if (profile.activity_preferences) {
    const activeActivities = Object.entries(profile.activity_preferences)
      .filter(([, active]) => active)
      .map(([key]) => key);
    
    const matchingActivities = service.activities.filter(a => activeActivities.includes(a));
    score += matchingActivities.length * 2;
  }
  
  // Accommodation tier bonus for certain services
  if (profile.accommodation_tier === "ultra_luxury" || profile.accommodation_tier === "private") {
    if (["sleep-architecture", "signature-scent", "household-optimization"].includes(service.id)) {
      score += 2;
    }
  }
  
  // Pace preference bonus
  if (profile.pace_preference === "intensive" && service.id === "longevity-concierge") {
    score += 1;
  }
  
  // Add some randomness to keep it fresh
  score += Math.random() * 0.5;
  
  return score;
};

const getMatchReason = (service: DiscoveryService, profile: TravelDNAProfile | null): string => {
  if (!profile) return service.matchReasons[0];
  
  // Find the most relevant reason based on profile
  if (profile.traveler_archetype && service.archetypes.includes(profile.traveler_archetype)) {
    return service.matchReasons[0]; // Primary match reason
  }
  
  if (profile.activity_preferences) {
    const activeActivities = Object.entries(profile.activity_preferences)
      .filter(([, active]) => active)
      .map(([key]) => key);
    
    if (service.activities.some(a => activeActivities.includes(a))) {
      return service.matchReasons[1] || service.matchReasons[0];
    }
  }
  
  return service.matchReasons[Math.floor(Math.random() * service.matchReasons.length)];
};

const SurpriseMeCard = () => {
  const { profile, isLoading } = useTravelDNA();
  const { user } = useAuth();
  const [suggestedService, setSuggestedService] = useState<DiscoveryService | null>(null);
  const [matchReason, setMatchReason] = useState<string>("");
  const [matchScore, setMatchScore] = useState<number>(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  // Track analytics event
  const trackEvent = useCallback(async (
    service: DiscoveryService, 
    eventType: 'reveal' | 'click' | 'save',
    score?: number
  ) => {
    if (!user) return;
    
    try {
      await supabase.from('discovery_service_analytics').insert({
        user_id: user.id,
        service_id: service.id,
        service_title: service.title,
        event_type: eventType,
        match_score: score ?? null,
        traveler_archetype: profile?.traveler_archetype ?? null
      });
    } catch (error) {
      console.error('Failed to track analytics:', error);
    }
  }, [user, profile?.traveler_archetype]);

  const selectNewService = useCallback(() => {
    // Score all services based on profile
    const scoredServices = discoveryServices.map(service => ({
      service,
      score: getServiceScore(service, profile)
    }));
    
    // Sort by score and pick from top 3 randomly for variety
    scoredServices.sort((a, b) => b.score - a.score);
    const topServices = scoredServices.slice(0, 3);
    const selected = topServices[Math.floor(Math.random() * topServices.length)];
    
    setSuggestedService(selected.service);
    setMatchScore(selected.score);
    setMatchReason(getMatchReason(selected.service, profile));
    
    // Track reveal event
    trackEvent(selected.service, 'reveal', selected.score);
  }, [profile, trackEvent]);

  const handleReveal = () => {
    setIsRevealing(true);
    
    // Add a moment of anticipation
    setTimeout(() => {
      selectNewService();
      setIsRevealing(false);
      setHasRevealed(true);
    }, 1200);
  };

  const handleRefresh = () => {
    setHasRevealed(false);
    setSuggestedService(null);
    setTimeout(() => {
      handleReveal();
    }, 100);
  };

  const handleExploreClick = () => {
    if (suggestedService) {
      trackEvent(suggestedService, 'click', matchScore);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-primary/10 rounded w-2/3 mb-4" />
        <div className="h-4 bg-primary/5 rounded w-full mb-2" />
        <div className="h-4 bg-primary/5 rounded w-3/4" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative bg-gradient-to-br from-primary/10 via-card to-card border border-primary/30 rounded-2xl overflow-hidden"
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isRevealing ? 360 : 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center"
            >
              <Gift className="w-5 h-5 text-primary" />
            </motion.div>
            <div>
              <h3 className="font-serif text-lg text-foreground">Surprise Me</h3>
              <p className="text-xs text-muted-foreground">Orla&apos;s Discovery Recommendation</p>
            </div>
          </div>
          
          {hasRevealed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!hasRevealed ? (
            <motion.div
              key="unrevealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <p className="text-sm text-muted-foreground mb-4">
                {profile?.traveler_archetype 
                  ? "Based on your Travel DNA, Orla has a service you might never have considered..."
                  : "Let Orla surprise you with a service you never knew you needed..."}
              </p>
              
              <Button
                onClick={handleReveal}
                disabled={isRevealing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
              >
                {isRevealing ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Discovering...
                  </motion.span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Reveal My Discovery
                  </span>
                )}
              </Button>
            </motion.div>
          ) : suggestedService ? (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Service Card */}
              <div className="bg-secondary/30 border border-primary/20 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0"
                  >
                    <suggestedService.icon className="w-6 h-6 text-primary" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <motion.h4
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="font-serif text-lg text-foreground mb-1"
                    >
                      {suggestedService.title}
                    </motion.h4>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-xs text-primary italic mb-2"
                    >
                      {suggestedService.tagline}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm text-muted-foreground leading-relaxed"
                    >
                      {suggestedService.description}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Match Reason */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-start gap-2 mb-4 px-1"
              >
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground italic">
                  &ldquo;{matchReason}&rdquo;
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Link to="/services" className="block" onClick={handleExploreClick}>
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 group"
                  >
                    <span>Explore All Discovery Services</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SurpriseMeCard;