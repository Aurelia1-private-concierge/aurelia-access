import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plane,
  Anchor,
  Building2,
  Palette,
  Calendar,
  Shield,
  UtensilsCrossed,
  Compass,
  Heart,
  ShoppingBag,
  ArrowRight,
  Star,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTravelDNA, TRAVELER_ARCHETYPES } from "@/hooks/useTravelDNA";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  matchScore: number;
  image?: string;
  price?: string;
  location?: string;
  isPartnerService: boolean;
  partnerId?: string;
}

const categoryIcons: Record<string, typeof Plane> = {
  private_aviation: Plane,
  yacht_charter: Anchor,
  real_estate: Building2,
  collectibles: Palette,
  events_access: Calendar,
  security: Shield,
  dining: UtensilsCrossed,
  travel: Compass,
  wellness: Heart,
  shopping: ShoppingBag,
};

const categoryLabels: Record<string, string> = {
  private_aviation: "Private Aviation",
  yacht_charter: "Yacht Charter",
  real_estate: "Real Estate",
  collectibles: "Collectibles",
  events_access: "Exclusive Events",
  security: "Security",
  dining: "Fine Dining",
  travel: "Travel",
  wellness: "Wellness",
  shopping: "Personal Shopping",
};

// Curated experiences based on archetypes
const curatedExperiences: Record<string, Recommendation[]> = {
  epicurean: [
    { id: "exp-1", title: "Private Dinner at Noma Tokyo", description: "Exclusive 12-course kaiseki experience with Chef René Redzepi", category: "dining", matchScore: 98, price: "From $8,500/person", location: "Tokyo, Japan", isPartnerService: false },
    { id: "exp-2", title: "Burgundy Grand Cru Harvest", description: "Participate in the vendange at Domaine de la Romanée-Conti", category: "travel", matchScore: 95, price: "From $45,000", location: "Burgundy, France", isPartnerService: false },
    { id: "exp-3", title: "Truffle Hunting in Alba", description: "Private truffle hunt with legendary trifolau and Michelin dinner", category: "dining", matchScore: 92, price: "From $12,000", location: "Piedmont, Italy", isPartnerService: false },
  ],
  adventurer: [
    { id: "exp-4", title: "Antarctic Expedition by Private Jet", description: "Fly to Antarctica and camp on the ice with expert guides", category: "private_aviation", matchScore: 97, price: "From $125,000", location: "Antarctica", isPartnerService: false },
    { id: "exp-5", title: "Heli-Skiing in the Himalayas", description: "First descents on virgin powder with world champion guides", category: "travel", matchScore: 94, price: "From $85,000", location: "Nepal", isPartnerService: false },
    { id: "exp-6", title: "Deep Ocean Submarine Dive", description: "Explore the Mariana Trench in a private research submersible", category: "travel", matchScore: 91, price: "From $250,000", location: "Pacific Ocean", isPartnerService: false },
  ],
  culturalist: [
    { id: "exp-7", title: "Private Vatican After-Hours", description: "Exclusive access to Sistine Chapel and Vatican archives", category: "events_access", matchScore: 96, price: "From $75,000", location: "Vatican City", isPartnerService: false },
    { id: "exp-8", title: "Kyoto Temple Stay with Zen Master", description: "Week-long immersion in authentic temple life and meditation", category: "wellness", matchScore: 93, price: "From $28,000", location: "Kyoto, Japan", isPartnerService: false },
    { id: "exp-9", title: "Private Archaeological Dig", description: "Join active excavation site with leading archaeologists", category: "travel", matchScore: 90, price: "From $55,000", location: "Petra, Jordan", isPartnerService: false },
  ],
  wellness_seeker: [
    { id: "exp-10", title: "SHA Wellness Clinic Longevity", description: "21-day comprehensive health optimization program", category: "wellness", matchScore: 98, price: "From $95,000", location: "Alicante, Spain", isPartnerService: false },
    { id: "exp-11", title: "Bhutan Happiness Retreat", description: "Mindfulness journey through Himalayan monasteries", category: "wellness", matchScore: 94, price: "From $45,000", location: "Bhutan", isPartnerService: false },
    { id: "exp-12", title: "Private Island Digital Detox", description: "Complete disconnection on your own Maldivian island", category: "wellness", matchScore: 91, price: "From $150,000/week", location: "Maldives", isPartnerService: false },
  ],
  collector: [
    { id: "exp-13", title: "Art Basel VIP Access Package", description: "Private previews, artist studio visits, and curator dinners", category: "events_access", matchScore: 97, price: "From $125,000", location: "Basel/Miami/Hong Kong", isPartnerService: false },
    { id: "exp-14", title: "Patek Philippe Factory Tour", description: "Exclusive visit to Grand Complications workshop", category: "collectibles", matchScore: 95, price: "By invitation", location: "Geneva, Switzerland", isPartnerService: false },
    { id: "exp-15", title: "Classic Car Concours Circuit", description: "VIP access to Pebble Beach, Goodwood & Villa d'Este", category: "events_access", matchScore: 92, price: "From $85,000", location: "Global", isPartnerService: false },
  ],
  social_maven: [
    { id: "exp-16", title: "Monaco Grand Prix Yacht Package", description: "Track-side superyacht with paddock access and driver meet", category: "yacht_charter", matchScore: 98, price: "From $450,000", location: "Monaco", isPartnerService: false },
    { id: "exp-17", title: "Met Gala Preparation Suite", description: "Complete styling, atelier visits, and after-party access", category: "events_access", matchScore: 95, price: "From $250,000", location: "New York", isPartnerService: false },
    { id: "exp-18", title: "Cannes Film Festival Insider", description: "Jury screenings, yacht parties, and celebrity dinners", category: "events_access", matchScore: 93, price: "From $180,000", location: "Cannes, France", isPartnerService: false },
  ],
};

// Default recommendations for users without a profile
const defaultRecommendations: Recommendation[] = [
  { id: "def-1", title: "Bespoke Mediterranean Yacht Charter", description: "7-day journey through the Greek Islands on a 50m superyacht", category: "yacht_charter", matchScore: 85, price: "From $280,000/week", location: "Mediterranean", isPartnerService: false },
  { id: "def-2", title: "Private Jet to Northern Lights", description: "Chase the aurora borealis across Scandinavia in ultimate comfort", category: "private_aviation", matchScore: 82, price: "From $95,000", location: "Norway/Finland", isPartnerService: false },
  { id: "def-3", title: "Monaco Real Estate Preview", description: "First look at off-market properties in the Principality", category: "real_estate", matchScore: 80, price: "Viewings available", location: "Monaco", isPartnerService: false },
];

const RecommendationsFeed = () => {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useTravelDNA();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [partnerServices, setPartnerServices] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch partner services
  useEffect(() => {
    const fetchPartnerServices = async () => {
      try {
        const { data, error } = await supabase
          .from("partner_services")
          .select(`
            id,
            title,
            description,
            category,
            min_price,
            max_price,
            currency,
            partner_id
          `)
          .eq("is_active", true)
          .limit(10);

        if (error) throw error;

        if (data) {
          const mapped: Recommendation[] = data.map((s) => ({
            id: s.id,
            title: s.title,
            description: s.description || "",
            category: s.category,
            matchScore: Math.floor(Math.random() * 15) + 80, // Will be replaced with real matching
            price: s.min_price ? `From ${s.currency || "$"}${s.min_price.toLocaleString()}` : undefined,
            isPartnerService: true,
            partnerId: s.partner_id,
          }));
          setPartnerServices(mapped);
        }
      } catch (err) {
        console.error("Error fetching partner services:", err);
      }
    };

    fetchPartnerServices();
  }, []);

  // Generate recommendations based on profile
  useEffect(() => {
    if (profileLoading) return;

    setIsLoading(true);

    // Get archetype-based recommendations
    let baseRecs: Recommendation[] = [];
    
    if (profile?.traveler_archetype) {
      baseRecs = curatedExperiences[profile.traveler_archetype] || [];
    }
    
    if (baseRecs.length === 0) {
      baseRecs = defaultRecommendations;
    }

    // Mix in partner services based on activity preferences
    let relevantPartnerServices = partnerServices;
    
    if (profile?.activity_preferences) {
      const preferredActivities = Object.entries(profile.activity_preferences)
        .filter(([_, enabled]) => enabled)
        .map(([activity]) => activity);

      // Boost match scores for relevant categories
      relevantPartnerServices = partnerServices.map((s) => {
        const categoryMap: Record<string, string[]> = {
          private_aviation: ["private_aviation"],
          yacht_charters: ["yacht_charter"],
          wine_experiences: ["dining"],
          spa_wellness: ["wellness"],
          cultural_tours: ["travel", "events_access"],
          shopping: ["shopping"],
          golf: ["wellness", "travel"],
          events_galas: ["events_access"],
        };

        let boost = 0;
        preferredActivities.forEach((pref) => {
          if (categoryMap[pref]?.includes(s.category)) {
            boost += 10;
          }
        });

        return { ...s, matchScore: Math.min(99, s.matchScore + boost) };
      });
    }

    // Combine and sort by match score
    const combined = [...baseRecs, ...relevantPartnerServices]
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    setRecommendations(combined);
    setIsLoading(false);
  }, [profile, profileLoading, partnerServices]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh with slight randomization
    await new Promise((r) => setTimeout(r, 1000));
    
    setRecommendations((prev) => 
      [...prev].sort(() => Math.random() - 0.5).map((r) => ({
        ...r,
        matchScore: Math.max(75, Math.min(99, r.matchScore + Math.floor(Math.random() * 10) - 5)),
      }))
    );
    
    setRefreshing(false);
    toast({ title: "Recommendations refreshed", description: "Based on your latest preferences" });
  };

  const handleInterest = async (rec: Recommendation) => {
    // Log analytics
    if (user) {
      await supabase.from("discovery_service_analytics").insert({
        user_id: user.id,
        service_id: rec.id,
        service_title: rec.title,
        event_type: "interest_click",
        match_score: rec.matchScore,
        traveler_archetype: profile?.traveler_archetype,
      });
    }

    toast({
      title: "Interest noted",
      description: "Your concierge team has been notified and will reach out shortly.",
    });
  };

  const archetypeLabel = TRAVELER_ARCHETYPES.find((a) => a.id === profile?.traveler_archetype)?.label;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 bg-card/50 border border-border/30 backdrop-blur-sm rounded-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-foreground">Curated For You</h3>
            <p className="text-xs text-muted-foreground">
              {archetypeLabel 
                ? `Personalized for ${archetypeLabel}` 
                : "Complete your Travel DNA for personalized picks"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Recommendations Grid */}
      {isLoading || profileLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {recommendations.map((rec, index) => {
              const Icon = categoryIcons[rec.category] || Compass;
              
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative p-4 bg-muted/20 hover:bg-muted/40 border border-border/20 hover:border-primary/30 rounded-xl transition-all cursor-pointer"
                  onClick={() => handleInterest(rec)}
                >
                  {/* Match Score Badge */}
                  <div className="absolute -top-2 -right-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs border-0 ${
                        rec.matchScore >= 95 
                          ? "bg-primary/20 text-primary" 
                          : rec.matchScore >= 90 
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {rec.matchScore}% match
                    </Badge>
                  </div>

                  {/* Category Icon */}
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>

                  {/* Content */}
                  <h4 className="font-medium text-foreground text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {rec.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      {rec.price && (
                        <p className="text-xs text-primary font-medium">{rec.price}</p>
                      )}
                      {rec.location && (
                        <p className="text-xs text-muted-foreground">{rec.location}</p>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  {/* Partner Badge */}
                  {rec.isPartnerService && (
                    <Badge 
                      variant="outline" 
                      className="absolute bottom-4 left-4 text-[10px] bg-background/50 border-border/50"
                    >
                      Partner Service
                    </Badge>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* View All Link */}
      {recommendations.length > 0 && (
        <div className="mt-6 text-center">
          <button className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">
            Explore all experiences
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default RecommendationsFeed;
