import { motion } from "framer-motion";
import { Shield, Eye, Lock, Fingerprint } from "lucide-react";

const exclusivityFeatures = [
  {
    icon: Shield,
    title: "Absolute Discretion",
    description: "Every guest signs binding NDAs. No press, no social media coverage. What happens at TRIPTYCH remains within the circle.",
  },
  {
    icon: Eye,
    title: "Curated Presence",
    description: "Guests are carefully vetted for cultural alignment, ensuring meaningful connections and shared sensibilities.",
  },
  {
    icon: Lock,
    title: "Limited Access",
    description: "Maximum 200 positions across all categories. Once filled, no exceptions are made.",
  },
  {
    icon: Fingerprint,
    title: "Personal Recognition",
    description: "Every guest is known by name. Staff-to-guest ratios ensure invisible yet attentive service throughout.",
  },
];

const TriptychExclusivity = () => {
  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L100 50L50 100L0 50Z' fill='none' stroke='%23D4AF37' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-primary block mb-4">
            By Design
          </span>
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl text-foreground mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Privacy as Principle
          </h2>
          <p className="text-muted-foreground font-light max-w-2xl mx-auto">
            TRIPTYCH operates under protocols designed for those accustomed to the highest 
            standards of discretion. Every detail is protected.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {exclusivityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group text-center p-8 border border-border/10 hover:border-primary/20 bg-card/20 hover:bg-card/40 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-full border border-primary/20 flex items-center justify-center mx-auto mb-6 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-500">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 
                className="text-lg text-foreground mb-3"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quote section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-block">
            <div className="w-12 h-px bg-primary/30 mx-auto mb-8" />
            <blockquote 
              className="text-xl md:text-2xl text-foreground/90 font-light italic max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              "True luxury is not about excess — it is about the freedom to experience 
              life's rarest moments without intrusion."
            </blockquote>
            <div className="w-12 h-px bg-primary/30 mx-auto mt-8" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TriptychExclusivity;
