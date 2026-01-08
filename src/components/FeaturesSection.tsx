import { Shield, Sparkles, Globe, Fingerprint, ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={ref} id="services" className="py-24 marble-bg relative overflow-hidden">
      {/* Floating decorative elements */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute top-20 right-10 w-[400px] h-[400px] bg-primary/3 blur-[150px] rounded-full pointer-events-none"
      />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-16 md:flex md:items-end md:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <p className="text-primary text-xs font-medium tracking-[0.2em] uppercase mb-4">
              Our Services
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight mb-4">
              Sovereign <span className="italic text-muted-foreground">Standards</span>
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
            <a href="#" className="group inline-flex items-center text-primary text-sm tracking-widest uppercase hover:opacity-80 transition-opacity">
              View All Specifications 
              <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </a>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`group relative p-8 bg-secondary/20 border border-border/20 backdrop-blur-sm hover:border-primary/40 hover:bg-secondary/40 transition-all duration-500 card-hover overflow-hidden ${
                feature.large ? "md:col-span-2" : ""
              }`}
            >
              {feature.decorative && (
                <motion.div 
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-15 transition-opacity duration-500"
                >
                  <feature.icon className="w-32 h-32 text-primary" strokeWidth={1} />
                </motion.div>
              )}

              {feature.hasBackground && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-0" />
                  <motion.img
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7 }}
                    src="https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?q=80&w=2070&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20 z-0"
                    alt="Biometrics"
                  />
                </>
              )}

              <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
                <div className="w-12 h-12 rounded-full bg-background border border-border/30 flex items-center justify-center mb-6 text-primary group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-500">
                  <feature.icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className={`font-serif ${feature.large ? "text-2xl" : "text-xl"} text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors duration-300`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light max-w-md">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Gradient border effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none gradient-border" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
