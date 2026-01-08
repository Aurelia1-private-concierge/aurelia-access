import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Crown, Shield, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MEMBERSHIP_TIERS } from "@/lib/membership-tiers";
import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/lib/utils";

interface TierComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightTier?: string;
}

const tierIcons = {
  silver: Shield,
  gold: Crown,
  platinum: Sparkles,
};

const tierColors = {
  silver: {
    accent: "text-slate-400",
    bg: "bg-slate-400/10",
    border: "border-slate-400/30",
  },
  gold: {
    accent: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
  platinum: {
    accent: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/30",
  },
};

// All features across all tiers
const allFeatures = [
  { name: "24/7 Concierge Support", silver: true, gold: true, platinum: true },
  { name: "Travel Planning Assistance", silver: true, gold: true, platinum: true },
  { name: "Restaurant Reservations", silver: true, gold: true, platinum: true },
  { name: "Event Ticket Access", silver: true, gold: true, platinum: true },
  { name: "Orla AI Companion", silver: true, gold: true, platinum: true },
  { name: "Dedicated Account Manager", silver: false, gold: true, platinum: true },
  { name: "Priority Response Times", silver: false, gold: true, platinum: true },
  { name: "Private Aviation Booking", silver: false, gold: true, platinum: true },
  { name: "Yacht Charter Access", silver: false, gold: true, platinum: true },
  { name: "VIP Event Invitations", silver: false, gold: true, platinum: true },
  { name: "24/7 Personal Lifestyle Manager", silver: false, gold: false, platinum: true },
  { name: "Unlimited Concierge Requests", silver: false, gold: false, platinum: true },
  { name: "Global Property Access", silver: false, gold: false, platinum: true },
  { name: "Art & Collectibles Advisory", silver: false, gold: false, platinum: true },
  { name: "Family Office Integration", silver: false, gold: false, platinum: true },
  { name: "Bespoke Experience Curation", silver: false, gold: false, platinum: true },
];

const TierComparisonModal = ({ isOpen, onClose, highlightTier }: TierComparisonModalProps) => {
  const { createCheckout, tier: currentTier, subscribed, isLoading } = useSubscription();

  const handleUpgrade = async (priceId: string) => {
    await createCheckout(priceId);
    onClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const tierRank = { silver: 1, gold: 2, platinum: 3 };
  const currentRank = currentTier ? tierRank[currentTier as keyof typeof tierRank] : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-5xl md:w-full md:max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-foreground">Compare Membership Tiers</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Find the perfect level of service for your lifestyle
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {/* Tier Headers */}
              <div className="grid grid-cols-4 gap-4 mb-6 sticky top-0 bg-card pb-4 border-b border-border/30">
                <div className="text-sm font-medium text-muted-foreground">Features</div>
                {MEMBERSHIP_TIERS.map((tier) => {
                  const Icon = tierIcons[tier.id as keyof typeof tierIcons];
                  const colors = tierColors[tier.id as keyof typeof tierColors];
                  const isHighlighted = highlightTier === tier.id;
                  const isCurrent = subscribed && currentTier === tier.id;

                  return (
                    <div
                      key={tier.id}
                      className={cn(
                        "text-center p-4 rounded-xl transition-all",
                        isHighlighted && cn(colors.bg, colors.border, "border-2"),
                        !isHighlighted && "bg-muted/30"
                      )}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Icon className={cn("w-5 h-5", colors.accent)} />
                        <span className={cn("font-medium", colors.accent)}>{tier.name}</span>
                      </div>
                      <p className="text-lg font-light text-foreground">
                        {formatPrice(tier.monthlyPrice)}<span className="text-xs text-muted-foreground">/mo</span>
                      </p>
                      {isCurrent && (
                        <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded-full">
                          Current Plan
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Feature Rows */}
              <div className="space-y-2">
                {allFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="grid grid-cols-4 gap-4 py-3 border-b border-border/20 hover:bg-muted/20 rounded-lg px-2"
                  >
                    <div className="text-sm text-foreground">{feature.name}</div>
                    {["silver", "gold", "platinum"].map((tierId) => {
                      const hasFeature = feature[tierId as keyof typeof feature];
                      const colors = tierColors[tierId as keyof typeof tierColors];
                      return (
                        <div key={tierId} className="flex justify-center">
                          {hasFeature ? (
                            <Check className={cn("w-5 h-5", colors.accent)} />
                          ) : (
                            <span className="w-5 h-5 flex items-center justify-center text-muted-foreground/30">
                              —
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer with CTAs */}
            <div className="p-6 border-t border-border/50 bg-muted/20">
              <div className="grid grid-cols-4 gap-4">
                <div /> {/* Empty cell for alignment */}
                {MEMBERSHIP_TIERS.map((tier) => {
                  const colors = tierColors[tier.id as keyof typeof tierColors];
                  const tierIndex = tierRank[tier.id as keyof typeof tierRank];
                  const isCurrent = subscribed && currentTier === tier.id;
                  const isDowngrade = tierIndex < currentRank;
                  const isUpgrade = tierIndex > currentRank;

                  return (
                    <Button
                      key={tier.id}
                      onClick={() => handleUpgrade(tier.monthlyPriceId)}
                      disabled={isLoading || isCurrent}
                      variant={tier.highlighted ? "default" : "outline"}
                      className={cn(
                        "w-full",
                        tier.highlighted && "bg-primary hover:bg-primary/90 gold-glow-hover",
                        !tier.highlighted && cn(colors.border, "hover:bg-muted/50")
                      )}
                    >
                      {isCurrent ? (
                        "Current Plan"
                      ) : isDowngrade ? (
                        "Downgrade"
                      ) : (
                        <>
                          {isUpgrade ? "Upgrade" : "Select"} <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TierComparisonModal;
