import { motion } from "framer-motion";
import { Check, Crown, Star, Gem } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGlobal } from "@/contexts/GlobalContext";

const MembershipTiersPreview = () => {
  const { t } = useTranslation();
  const { formatCurrency, currency } = useGlobal();
  
  const conversionRates: Record<string, number> = {
    EUR: 1,
    USD: 1.08,
    GBP: 0.86,
    RUB: 98,
    CNY: 7.8,
    AED: 3.97,
  };
  
  const rate = conversionRates[currency] || 1;
  
  const tiers = [
    {
      name: "Signature",
      basePrice: 2500,
      period: "/year",
      description: t("membership.silverDesc") || "Essential luxury services",
      icon: Star,
      features: [
        t("membership.feature24_7") || "24/7 concierge access",
        t("membership.featureTravel") || "Travel planning assistance",
        t("membership.featureRestaurant") || "Restaurant reservations",
        t("membership.featureEvents") || "Event ticket procurement",
        t("membership.featurePriority5") || "5 priority requests/month",
      ],
      highlighted: false,
    },
    {
      name: "Prestige",
      basePrice: 10000,
      period: "/year",
      description: t("membership.goldDesc") || "Premium lifestyle management",
      icon: Crown,
      features: [
        t("membership.featureEverythingSilver") || "Everything in Signature",
        t("membership.featureDedicated") || "Dedicated personal concierge",
        t("membership.featureAviation") || "Private aviation booking",
        t("membership.featureCar") || "Luxury car rentals",
        t("membership.featureUnlimited") || "Unlimited priority requests",
        t("membership.featureProperty") || "Property management",
      ],
      highlighted: true,
    },
    {
      name: "Black Card",
      basePrice: 0,
      period: "",
      description: t("membership.platinumDesc") || "Ultimate bespoke experience",
      icon: Gem,
      features: [
        t("membership.featureEverythingGold") || "Everything in Prestige",
        t("membership.featureFamily") || "Family office integration",
        t("membership.featureYacht") || "Yacht charter management",
        t("membership.featureArt") || "Art acquisition advisory",
        t("membership.featureSecurity") || "Security coordination",
        t("membership.featureTeam") || "24/7 dedicated team",
      ],
      highlighted: false,
    },
  ];

  return (
    <section id="membership" className="py-24 md:py-32 bg-background relative" aria-labelledby="membership-heading">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-4">
            {t("membership.tiers") || "Membership"}
          </span>
          <h2 
            id="membership-heading"
            className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t("membership.chooseLevel") || "Choose Your Level"}
          </h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">
            {t("membership.selectTier") || "Select the tier that matches your lifestyle."}
          </p>
        </motion.div>

        {/* Tiers Grid */}
        <div className="grid md:grid-cols-3 gap-6" role="list" aria-label="Membership tiers">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 transition-all duration-500 ${
                tier.highlighted
                  ? 'bg-card border border-primary/30'
                  : 'bg-card/30 border border-border/10 hover:border-border/30'
              }`}
              role="listitem"
              aria-label={`${tier.name} membership tier`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-[9px] uppercase tracking-[0.2em]">
                    Popular
                  </span>
                </div>
              )}

              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${
                tier.highlighted 
                  ? 'border border-primary/30' 
                  : 'border border-border/20'
              }`} aria-hidden="true">
                <tier.icon className={`w-5 h-5 ${tier.highlighted ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={1.5} aria-hidden="true" />
              </div>

              <h3 
                className="text-xl text-foreground mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {tier.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-6">{tier.description}</p>

              <div className="mb-6">
                <span 
                  className="text-2xl text-foreground"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {tier.basePrice === 0 
                    ? "By Invitation"
                    : formatCurrency(Math.round(tier.basePrice * rate))
                  }
                </span>
                <span className="text-xs text-muted-foreground">{tier.period}</span>
              </div>

              <ul className="space-y-2 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                      tier.highlighted ? 'text-primary' : 'text-muted-foreground/50'
                    }`} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/membership"
                className={`block w-full py-3 text-center text-[10px] font-medium tracking-[0.2em] uppercase transition-all duration-300 ${
                  tier.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-transparent border border-primary/30 text-foreground hover:bg-primary/5'
                }`}
                aria-label={tier.basePrice === 0 ? `Request access to ${tier.name} membership` : `Apply for ${tier.name} membership`}
              >
                {tier.basePrice === 0 ? "Request Access" : "Apply Now"}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-[10px] text-muted-foreground/40 mt-10"
        >
          30-day satisfaction guarantee on all memberships
        </motion.p>
      </div>
    </section>
  );
};

export default MembershipTiersPreview;
