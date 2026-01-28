import { motion } from "framer-motion";
import { Crown, Shield, Sparkles, Calendar, ArrowUpRight, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tierIcons = {
  paygo: Wallet,
  silver: Shield,
  gold: Crown,
  platinum: Sparkles,
};

const tierColors = {
  paygo: "text-emerald-400",
  silver: "text-slate-400",
  gold: "text-primary",
  platinum: "text-purple-400",
};

const SubscriptionCard = () => {
  const navigate = useNavigate();
  const { 
    subscribed, 
    tier, 
    tierDetails, 
    subscriptionEnd, 
    isLoading, 
    openCustomerPortal 
  } = useSubscription();

  const Icon = tier ? tierIcons[tier as keyof typeof tierIcons] : Shield;
  const iconColor = tier ? tierColors[tier as keyof typeof tierColors] : "text-muted-foreground";

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-card/50 border border-border/30 backdrop-blur-sm rounded-lg"
      >
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 bg-card/50 border backdrop-blur-sm rounded-lg relative overflow-hidden",
        subscribed ? "border-primary/30" : "border-border/30"
      )}
    >
      {/* Subtle glow for subscribed users */}
      {subscribed && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              subscribed ? "bg-primary/10 border border-primary/20" : "bg-muted"
            )}>
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
            <div>
              <h3 className="font-serif text-lg text-foreground">
                {subscribed ? `${tierDetails?.name || tier} Member` : "No Active Plan"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {subscribed ? "Active subscription" : "Upgrade to unlock benefits"}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        {subscribed && tierDetails && (
          <div className="mb-4 space-y-3">
            {/* Renewal Date */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Renews:</span>
              <span className="text-foreground">{formatDate(subscriptionEnd)}</span>
            </div>

            {/* Key Features Preview */}
            <div className="flex flex-wrap gap-2">
              {tierDetails.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-muted/50 text-muted-foreground rounded-full"
                >
                  {feature.replace("Everything in Silver, plus:", "").replace("Everything in Gold, plus:", "").trim() || feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {subscribed ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCustomerPortal()}
                className="flex-1 border-border/50 hover:border-primary/50"
              >
                Manage Subscription
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/membership")}
                className="text-primary hover:text-primary/80"
              >
                View Plans <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate("/membership")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gold-glow-hover"
            >
              <Crown className="w-4 h-4 mr-2" />
              Explore Membership
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SubscriptionCard;
