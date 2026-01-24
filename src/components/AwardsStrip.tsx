import { motion } from "framer-motion";
import { Award, Shield, Star, Globe, CheckCircle } from "lucide-react";
const awards = [{
  icon: Award,
  label: "Forbes Travel",
  title: "Best Concierge 2024"
}, {
  icon: Shield,
  label: "ISO 27001",
  title: "Certified Secure"
}, {
  icon: Star,
  label: "Condé Nast",
  title: "Traveler's Choice"
}, {
  icon: Globe,
  label: "ILTM",
  title: "Excellence Award"
}, {
  icon: CheckCircle,
  label: "SOC 2",
  title: "Type II Compliant"
}];
const AwardsStrip = () => {
  return <section className="py-12 md:py-16 bg-card/20 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.4em] text-platinum">
            Recognition
          </span>
        </motion.div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {awards.map((award, index) => <motion.div key={award.label} initial={{
          opacity: 0,
          y: 10
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: index * 0.08
        }} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full border border-border/20 flex items-center justify-center group-hover:border-primary/30 transition-colors duration-300">
                <award.icon className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary/60 transition-colors duration-300" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-foreground/70">{award.label}</p>
                <p className="text-[10px] text-silver-light">{award.title}</p>
              </div>
            </motion.div>)}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/20 to-transparent" />
    </section>;
};
export default AwardsStrip;