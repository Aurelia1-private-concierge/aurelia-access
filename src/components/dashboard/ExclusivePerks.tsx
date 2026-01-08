import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plane, 
  Ship, 
  Building2, 
  Gem, 
  Calendar, 
  Utensils,
  Lock,
  Crown,
  Sparkles,
  Shield,
  Star
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import TierComparisonModal from "./TierComparisonModal";
import { cn } from "@/lib/utils";

interface Perk {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  minTier: "silver" | "gold" | "platinum" | null;
  exclusive?: boolean;
}

const allPerks: Perk[] = [
  {
    id: "concierge",
    title: "24/7 Concierge Support",
    description: "Instant access to your personal concierge team",
    icon: Star,
    minTier: "silver",
  },
  {
    id: "dining",
    title: "Priority Reservations",
    description: "Skip the waitlist at Michelin-starred restaurants",
    icon: Utensils,
    minTier: "silver",
  },
  {
    id: "events",
    title: "VIP Event Access",
    description: "Exclusive invitations to galas, premieres & private viewings",
    icon: Calendar,
    minTier: "gold",
    exclusive: true,
  },
  {
    id: "aviation",
    title: "Private Aviation",
    description: "Preferred rates on private jet charters worldwide",
    icon: Plane,
    minTier: "gold",
  },
  {
    id: "yacht",
    title: "Yacht Charter Network",
    description: "Access to 500+ luxury vessels globally",
    icon: Ship,
    minTier: "gold",
    exclusive: true,
  },
  {
    id: "property",
    title: "Global Property Access",
    description: "Exclusive listings & off-market opportunities",
    icon: Building2,
    minTier: "platinum",
    exclusive: true,
  },
  {
    id: "collectibles",
    title: "Art & Collectibles Advisory",
    description: "Expert guidance on acquisitions & portfolio management",
    icon: Gem,
    minTier: "platinum",
    exclusive: true,
  },
  {
    id: "lifestyle",
    title: "Personal Lifestyle Manager",
    description: "Dedicated manager for all your lifestyle needs",
    icon: Sparkles,
    minTier: "platinum",
    exclusive: true,
  },
];

const tierRank = { silver: 1, gold: 2, platinum: 3 };

interface ExclusivePerksProps {
  onShowCelebration?: () => void;
}

const ExclusivePerks = ({ onShowCelebration }: ExclusivePerksProps) => {
  const [showComparison, setShowComparison] = useState(false);
  const [highlightTier, setHighlightTier] = useState<string | undefined>();
  const { subscribed, tier } = useSubscription();

  const userTierRank = tier ? tierRank[tier as keyof typeof tierRank] : 0;

  const isPerkUnlocked = (perk: Perk) => {
    if (!perk.minTier) return true;
    if (!subscribed || !tier) return false;
    return userTierRank >= tierRank[perk.minTier];
  };

  const getTierIcon = (minTier: string | null) => {
    switch (minTier) {
      case "silver": return Shield;
      case "gold": return Crown;
      case "platinum": return Sparkles;
      default: return Star;
    }
  };

  const getTierColor = (minTier: string | null) => {
    switch (minTier) {
      case "silver": return "text-slate-400";
      case "gold": return "text-primary";
      case "platinum": return "text-purple-400";
      default: return "text-muted-foreground";
    }
  };

  const handleLockedPerkClick = (perk: Perk) => {
    setHighlightTier(perk.minTier || undefined);
    setShowComparison(true);
  };

  // Group perks by unlock status
  const unlockedPerks = allPerks.filter(isPerkUnlocked);
  const lockedPerks = allPerks.filter(p => !isPerkUnlocked(p));

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-card/50 border border-border/30 backdrop-blur-sm rounded-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-lg text-foreground">Exclusive Perks</h3>
          </div>
          {subscribed && tier && (
            <span className={cn(
              "text-xs px-2 py-1 rounded-full border",
              tier === "platinum" ? "border-purple-400/30 text-purple-400 bg-purple-400/10" :
              tier === "gold" ? "border-primary/30 text-primary bg-primary/10" :
              "border-slate-400/30 text-slate-400 bg-slate-400/10"
            )}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Member
            </span>
          )}
        </div>

        {/* Unlocked Perks */}
        {unlockedPerks.length > 0 && (
          <div className="space-y-3 mb-6">
            {unlockedPerks.map((perk, index) => {
              const TierIcon = getTierIcon(perk.minTier);
              return (
                <motion.div
                  key={perk.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <perk.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{perk.title}</p>
                      {perk.exclusive && (
                        <span className="text-[10px] uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          Exclusive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{perk.description}</p>
                  </div>
                  <TierIcon className={cn("w-4 h-4 flex-shrink-0", getTierColor(perk.minTier))} />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Locked Perks (Upgrade Preview) */}
        {lockedPerks.length > 0 && (
          <>
            <div className="border-t border-border/30 pt-4 mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Unlock with upgrade
              </p>
            </div>
            <div className="space-y-2">
              {lockedPerks.slice(0, 3).map((perk) => {
                const TierIcon = getTierIcon(perk.minTier);
                return (
                  <div
                    key={perk.id}
                    onClick={() => handleLockedPerkClick(perk)}
                    className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg opacity-60 hover:opacity-80 cursor-pointer transition-opacity"
                  >
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">{perk.title}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <TierIcon className={cn("w-3 h-3", getTierColor(perk.minTier))} />
                      <span className={cn("text-[10px] capitalize", getTierColor(perk.minTier))}>
                        {perk.minTier}+
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {lockedPerks.length > 3 && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                +{lockedPerks.length - 3} more perks available
              </p>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComparison(true)}
              className="w-full mt-4 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Crown className="w-4 h-4 mr-2" />
              {subscribed ? "Compare & Upgrade" : "Compare Memberships"}
            </Button>
          </>
        )}

        {/* All perks unlocked message for Platinum */}
        {lockedPerks.length === 0 && subscribed && (
          <div className="text-center py-4 border-t border-border/30 mt-4">
            <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              You have access to all exclusive perks
            </p>
          </div>
        )}
      </motion.div>

      {/* Tier Comparison Modal */}
      <TierComparisonModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        highlightTier={highlightTier}
      />
    </>
  );
};

export default ExclusivePerks;
