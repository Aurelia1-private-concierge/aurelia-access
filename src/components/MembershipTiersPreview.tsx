import { motion } from "framer-motion";
import { Check, Crown, Star, Gem } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGlobal } from "@/contexts/GlobalContext";

const MembershipTiersPreview = () => {
  const { t } = useTranslation();
  const { formatCurrency, currency } = useGlobal();
  
  // Base prices in EUR, convert based on locale
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
      name: "Silver",
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
      name: "Gold",
      basePrice: 10000,
      period: "/year",
      description: t("membership.goldDesc") || "Premium lifestyle management",
      icon: Crown,
      features: [
        t("membership.featureEverythingSilver") || "Everything in Silver",
        t("membership.featureDedicated") || "Dedicated personal concierge",
        t("membership.featureAviation") || "Private aviation booking",
        t("membership.featureCar") || "Luxury car rentals",
        t("membership.featureUnlimited") || "Unlimited priority requests",
        t("membership.featureProperty") || "Property management",
        t("membership.featureShopping") || "Personal shopping services",
      ],
      highlighted: true,
    },
    {
      name: "Platinum",
      basePrice: 0,
      period: "",
      description: t("membership.platinumDesc") || "Ultimate bespoke experience",
      icon: Gem,
      features: [
        t("membership.featureEverythingGold") || "Everything in Gold",
        t("membership.featureFamily") || "Family office integration",
        t("membership.featureYacht") || "Yacht charter management",
        t("membership.featureArt") || "Art acquisition advisory",
        t("membership.featureSecurity") || "Security coordination",
        t("membership.featureRelocation") || "Global relocation services",
        t("membership.featureTeam") || "24/7 dedicated team",
        t("membership.featureRetreat") || "Annual luxury retreat",
      ],
      highlighted: false,
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-transparent to-card/30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.02] blur-[200px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <span className="w-12 h-px bg-primary/40" />
            <p className="text-[11px] uppercase tracking-[0.4em] text-primary/70 font-medium">
              {t("membership.tiers") || "Membership Tiers"}
            </p>
            <span className="w-12 h-px bg-primary/40" />
          </div>
          <h2 
            className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t("membership.chooseLevel") || "Choose Your"} <span className="italic text-muted-foreground/70">{t("membership.level") || "Level"}</span>
          </h2>
          <p className="text-muted-foreground font-light max-w-2xl mx-auto">
            {t("membership.selectTier") || "Select the tier that matches your lifestyle. Upgrade anytime as your needs evolve."}
          </p>
        </motion.div>

        {/* Tiers Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`relative group p-8 transition-all duration-500 ${
                tier.highlighted
                  ? 'bg-card border-2 border-primary/30 shadow-lg shadow-primary/10'
                  : 'bg-card/50 border border-border/20 hover:border-border/40'
              }`}
            >
              {/* Highlighted badge */}
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em]">
                    {t("membership.mostPopular") || "Most Popular"}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${
                tier.highlighted 
                  ? 'bg-primary/20 border border-primary/30' 
                  : 'bg-background border border-border/30'
              }`}>
                <tier.icon className={`w-6 h-6 ${tier.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>

              {/* Tier name */}
              <h3 
                className="text-2xl text-foreground mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {tier.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

              {/* Price */}
              <div className="mb-8">
                <span 
                  className="text-3xl text-foreground"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {tier.basePrice === 0 
                    ? (t("membership.byInvitation") || "By Invitation")
                    : formatCurrency(Math.round(tier.basePrice * rate))
                  }
                </span>
                <span className="text-sm text-muted-foreground">{tier.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      tier.highlighted ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to="/auth"
                className={`block w-full py-3 text-center text-xs tracking-[0.2em] uppercase transition-all duration-300 ${
                  tier.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 gold-glow-hover'
                    : 'border border-border/30 text-foreground hover:border-primary/40 hover:bg-primary/5'
                }`}
              >
                {tier.basePrice === 0 ? (t("membership.requestAccess") || "Request Access") : (t("membership.applyNow") || "Apply Now")}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground/50 mt-12"
        >
          {t("membership.guarantee") || "All memberships include a 30-day satisfaction guarantee"}
        </motion.p>
      </div>
    </section>
  );
};

export default MembershipTiersPreview;
