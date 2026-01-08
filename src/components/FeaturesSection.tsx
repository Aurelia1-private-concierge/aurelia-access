import { Shield, Sparkles, Globe, Fingerprint, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description: "All communications are secured with sovereign-grade encryption. Your requests, itinerary, and financial data remain visible only to you and your dedicated private liaison.",
    large: true,
    decorative: true,
  },
  {
    icon: Sparkles,
    title: "Bespoke Curation",
    description: "Our specialists anticipate your needs before you articulate them, curating options based on your preferences and historical patterns.",
    large: false,
  },
  {
    icon: Globe,
    title: "Global Liquidity",
    description: "Multi-currency global payment solutions. Secure instant transfers for art auctions, real estate, or charter deposits without banking friction.",
    large: false,
  },
  {
    icon: Fingerprint,
    title: "Biometric Zero-Trust Access",
    description: "Passwordless authentication. Voice recognition and biometric verification ensure that only you can authorize high-value transactions or access sensitive itinerary details.",
    large: true,
    hasBackground: true,
  },
];

const FeaturesSection = () => {
  return (
    <section id="services" className="py-24 marble-bg relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 md:flex md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-foreground tracking-tight mb-4">
              Sovereign Standards
            </h2>
            <p className="font-light text-muted-foreground leading-relaxed">
              We blend state-of-the-art cryptographic security with the warmth of hyper-personalized service.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 md:mt-0"
          >
            <a href="#" className="inline-flex items-center text-primary text-sm tracking-widest uppercase hover:opacity-80 transition-opacity">
              View All Specifications <ArrowUpRight className="w-4 h-4 ml-2" />
            </a>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative p-8 bg-secondary/20 border border-border/20 backdrop-blur-sm hover:border-primary/40 hover:bg-secondary/40 transition-all duration-500 card-hover overflow-hidden ${
                feature.large ? "md:col-span-2" : ""
              }`}
            >
              {feature.decorative && (
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <feature.icon className="w-32 h-32 text-primary" strokeWidth={1} />
                </div>
              )}

              {feature.hasBackground && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent z-0" />
                  <img
                    src="https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?q=80&w=2070&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20 z-0"
                    alt="Biometrics"
                  />
                </>
              )}

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-full bg-background border border-border/30 flex items-center justify-center mb-6 text-primary">
                  <feature.icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className={`font-serif ${feature.large ? "text-2xl" : "text-xl"} text-foreground mb-2 tracking-tight`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light max-w-md">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
