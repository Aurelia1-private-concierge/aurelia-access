import { motion } from "framer-motion";
import { Check, Crown, Star, Gem } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Silver",
    price: "€2,500",
    period: "/year",
    description: "Essential luxury services",
    icon: Star,
    features: [
      "24/7 concierge access",
      "Travel planning assistance",
      "Restaurant reservations",
      "Event ticket procurement",
      "5 priority requests/month",
    ],
    highlighted: false,
  },
  {
    name: "Gold",
    price: "€10,000",
    period: "/year",
    description: "Premium lifestyle management",
    icon: Crown,
    features: [
      "Everything in Silver",
      "Dedicated personal concierge",
      "Private aviation booking",
      "Luxury car rentals",
      "Unlimited priority requests",
      "Property management",
      "Personal shopping services",
    ],
    highlighted: true,
  },
  {
    name: "Platinum",
    price: "By Invitation",
    period: "",
    description: "Ultimate bespoke experience",
    icon: Gem,
    features: [
      "Everything in Gold",
      "Family office integration",
      "Yacht charter management",
      "Art acquisition advisory",
      "Security coordination",
      "Global relocation services",
      "24/7 dedicated team",
      "Annual luxury retreat",
    ],
    highlighted: false,
  },
];

const MembershipTiersPreview = () => {
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
              Membership Tiers
            </p>
            <span className="w-12 h-px bg-primary/40" />
          </div>
          <h2 
            className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Choose Your <span className="italic text-muted-foreground/70">Level</span>
          </h2>
          <p className="text-muted-foreground font-light max-w-2xl mx-auto">
            Select the tier that matches your lifestyle. Upgrade anytime as your needs evolve.
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
                    Most Popular
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
                  {tier.price}
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
                {tier.price === "By Invitation" ? "Request Access" : "Apply Now"}
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
          All memberships include a 30-day satisfaction guarantee
        </motion.p>
      </div>
    </section>
  );
};

export default MembershipTiersPreview;