import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Shield, Gift, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MEMBERSHIP_TIERS } from "@/lib/membership-tiers";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const tierIcons = {
  silver: Shield,
  gold: Crown,
  platinum: Sparkles,
};

const Membership = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const { createCheckout, isLoading, tier: currentTier, subscribed, isTrial } = useSubscription();
  const { user } = useAuth();

  const handleSubscribe = async (priceId: string) => {
    await createCheckout(priceId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Trial Banner */}
          {!subscribed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Not ready to commit?</h3>
                    <p className="text-sm text-muted-foreground">
                      Apply for a free 7-day trial with full Gold-tier access
                    </p>
                  </div>
                </div>
                <Link to="/trial">
                  <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                    Apply for Trial <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Trial Status Banner */}
          {isTrial && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">You're on a 7-day trial</h3>
                    <p className="text-sm text-muted-foreground">
                      Enjoying Gold-tier access. Subscribe now to continue after your trial ends.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6">
              Membership <span className="text-gradient-gold">Tiers</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Choose the level of service that matches your lifestyle. 
              All memberships include access to our exclusive network and Orla AI companion.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={cn(
                "text-sm transition-colors",
                !isAnnual ? "text-foreground" : "text-muted-foreground"
              )}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-primary"
              />
              <span className={cn(
                "text-sm transition-colors",
                isAnnual ? "text-foreground" : "text-muted-foreground"
              )}>
                Annual
              </span>
              {isAnnual && (
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                  Save 20%
                </span>
              )}
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {MEMBERSHIP_TIERS.map((tier, index) => {
              const Icon = tierIcons[tier.id as keyof typeof tierIcons];
              const isCurrentTier = subscribed && currentTier === tier.id;
              const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
              const priceId = isAnnual ? tier.annualPriceId : tier.monthlyPriceId;
              const monthlyEquivalent = isAnnual ? tier.annualPrice / 12 : tier.monthlyPrice;

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={cn(
                    "relative rounded-2xl p-8 transition-all duration-500",
                    tier.highlighted
                      ? "bg-gradient-to-b from-primary/10 to-card border-2 border-primary/30 scale-105 shadow-2xl"
                      : "bg-card border border-border hover:border-primary/20",
                    isCurrentTier && "ring-2 ring-primary"
                  )}
                >
                  {/* Current Plan Badge */}
                  {isCurrentTier && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                        Your Plan
                      </span>
                    </div>
                  )}

                  {/* Popular Badge */}
                  {tier.highlighted && !isCurrentTier && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Tier Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      tier.highlighted ? "bg-primary/20" : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        tier.highlighted ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">{tier.name}</h3>
                      <p className="text-xs text-muted-foreground">Membership</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-6">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-light text-foreground">
                        {formatPrice(monthlyEquivalent)}
                      </span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    {isAnnual && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatPrice(price)} billed annually
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSubscribe(priceId)}
                    disabled={isLoading || isCurrentTier}
                    className={cn(
                      "w-full mb-8 transition-all",
                      tier.highlighted
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground gold-glow-hover"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                    )}
                  >
                    {isCurrentTier ? "Current Plan" : isLoading ? "Loading..." : "Select Plan"}
                  </Button>

                  {/* Features */}
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className={cn(
                          "w-4 h-4 mt-0.5 flex-shrink-0",
                          tier.highlighted ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground text-sm mb-4">
              All memberships include a 30-day satisfaction guarantee.
            </p>
            <p className="text-muted-foreground text-xs">
              Questions? Contact your personal liaison at{" "}
              <a href="mailto:membership@aurelia.com" className="text-primary hover:underline">
                membership@aurelia.com
              </a>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Membership;
