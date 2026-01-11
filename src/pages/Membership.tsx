import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Check, 
  Crown, 
  Sparkles, 
  Shield, 
  Gift, 
  ArrowRight, 
  CreditCard, 
  Smartphone,
  Building2,
  Clock,
  Lock,
  Globe,
  Users,
  Star,
  Zap,
  Coins
} from "lucide-react";
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

const paymentMethods = [
  {
    id: "cards",
    name: "Credit & Debit Cards",
    description: "Visa, Mastercard, American Express",
    icon: CreditCard,
  },
  {
    id: "wallets",
    name: "Digital Wallets",
    description: "Apple Pay, Google Pay",
    icon: Smartphone,
  },
  {
    id: "bank",
    name: "Bank Transfer",
    description: "Direct ACH & Wire transfers",
    icon: Building2,
  },
  {
    id: "bnpl",
    name: "Buy Now, Pay Later",
    description: "Affirm & Klarna available",
    icon: Clock,
  },
];

const securityFeatures = [
  { icon: Lock, text: "256-bit SSL encryption" },
  { icon: Shield, text: "PCI DSS compliant" },
  { icon: Globe, text: "Multi-currency support" },
];

const referralRewards = [
  {
    icon: Gift,
    title: "1 Free Month",
    description: "For each friend who subscribes"
  },
  {
    icon: Users,
    title: "20% Off",
    description: "Your referrals get first month discount"
  },
  {
    icon: Star,
    title: "Ambassador Status",
    description: "Unlock VIP perks with 5+ referrals"
  },
];

// Founding member deadline (set to a future date)
const FOUNDING_MEMBER_DEADLINE = new Date("2026-03-31");

const Membership = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const { createCheckout, isLoading, tier: currentTier, subscribed, isTrial } = useSubscription();
  const { user } = useAuth();
  
  const isFoundingPeriod = new Date() < FOUNDING_MEMBER_DEADLINE;
  const daysRemaining = Math.max(0, Math.ceil((FOUNDING_MEMBER_DEADLINE.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

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

          {/* Founding Member Banner */}
          {isFoundingPeriod && !subscribed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-medium text-foreground">Founding Member Rates</h3>
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                        {daysRemaining} days left
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Lock in current pricing forever. Rates increase after founding period ends.
                    </p>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-xs text-muted-foreground">Price locked until</p>
                  <p className="text-sm font-medium text-emerald-400">Forever</p>
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
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-24">
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

                  {/* Credits Badge */}
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4",
                    tier.isUnlimited 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    <Coins className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {tier.isUnlimited ? "Unlimited Credits" : `${tier.monthlyCredits} Credits/month`}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-6">
                    {tier.description}
                  </p>

                  {/* Price - Hidden for non-authenticated users */}
                  <div className="mb-6">
                    {user ? (
                      <>
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
                        {/* Founding Member Tag */}
                        {isFoundingPeriod && !subscribed && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Zap className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs text-emerald-400 font-medium">
                              Founding rate locked forever
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="w-4 h-4" />
                          <span className="text-sm italic">Exclusive pricing</span>
                        </div>
                        <p className="text-xs text-muted-foreground/70">
                          Sign in to view member rates
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  {user ? (
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
                  ) : (
                    <Link to="/auth" className="w-full block mb-8">
                      <Button
                        className={cn(
                          "w-full transition-all group",
                          tier.highlighted
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground gold-glow-hover"
                            : "bg-secondary hover:bg-secondary/80 text-foreground"
                        )}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Reveal Pricing
                        <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </Button>
                    </Link>
                  )}

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

          {/* Referral Rewards Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mb-24"
          >
            <div className="relative rounded-2xl p-8 md:p-12 bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full" />
              
              <div className="relative">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-xs uppercase tracking-widest text-primary font-medium">
                        Referral Program
                      </span>
                    </div>
                    <h2 className="text-3xl font-light mb-4">
                      Earn Rewards, <span className="text-gradient-gold">Share Excellence</span>
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-lg">
                      Invite friends to Aurelia and both of you receive exclusive benefits. 
                      The more you share, the more you earn.
                    </p>
                    
                    <div className="grid sm:grid-cols-3 gap-4 mb-6">
                      {referralRewards.map((reward, index) => (
                        <div 
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <reward.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{reward.title}</p>
                            <p className="text-xs text-muted-foreground">{reward.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {user ? (
                      <Link to="/dashboard">
                        <Button className="group">
                          Go to Referral Dashboard
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/auth">
                        <Button className="group">
                          Sign In to Start Referring
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Methods Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-24"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light mb-4">
                Flexible <span className="text-gradient-gold">Payment Options</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We accept a variety of payment methods for your convenience
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paymentMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="group relative p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                      <method.icon className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-medium text-foreground mb-1">{method.name}</h3>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Security Features */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-10 border-t border-border">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light mb-4">
                Frequently Asked <span className="text-gradient-gold">Questions</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  q: "Can I change my plan later?",
                  a: "Yes, you can upgrade or downgrade your membership at any time. Changes take effect at the start of your next billing cycle."
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, Apple Pay, Google Pay, bank transfers, and buy-now-pay-later options like Affirm and Klarna."
                },
                {
                  q: "Is there a contract or commitment?",
                  a: "No long-term commitment required. Monthly plans can be cancelled anytime. Annual plans offer significant savings with a 30-day satisfaction guarantee."
                },
                {
                  q: "How does the 7-day trial work?",
                  a: "Apply for our trial to experience Gold-tier access. After approval, you'll have 7 days to explore all features before deciding on a membership."
                },
              ].map((faq, index) => (
                <div 
                  key={index} 
                  className="p-6 rounded-xl bg-card border border-border"
                >
                  <h3 className="font-medium text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center"
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
