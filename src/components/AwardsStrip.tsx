import { motion } from "framer-motion";
import { Award, Shield, CheckCircle, Star, Globe } from "lucide-react";

const awards = [
  { icon: Award, label: "Forbes Travel", title: "Best Concierge 2024" },
  { icon: Shield, label: "ISO 27001", title: "Certified Secure" },
  { icon: Star, label: "Condé Nast", title: "Traveler's Choice" },
  { icon: Globe, label: "ILTM", title: "Excellence Award" },
  { icon: CheckCircle, label: "SOC 2", title: "Type II Compliant" },
];

const AwardsStrip = () => {
  return (
    <section className="py-16 bg-card/30 border-y border-border/10 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/60 font-medium">
            Recognition & Certifications
          </p>
        </motion.div>

        {/* Awards Grid */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {awards.map((award, index) => (
            <motion.div
              key={award.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-background border border-border/30 flex items-center justify-center mb-3 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-500">
                <award.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-500" strokeWidth={1.5} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 mb-1">{award.label}</p>
              <p className="text-xs text-muted-foreground font-light">{award.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AwardsStrip;