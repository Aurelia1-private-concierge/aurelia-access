import { Crown, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";

const MembershipCTA = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const leftGlowY = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);
  const rightGlowY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const centerGlowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <section ref={ref} id="membership" className="py-32 relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-background" />
      <motion.div 
        style={{ scale: centerGlowScale }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.1),transparent_60%)]" 
      />
      <motion.div 
        style={{ y: leftGlowY }}
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" 
      />
      <motion.div 
        style={{ y: rightGlowY }}
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/3 blur-[120px] rounded-full pointer-events-none" 
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-3xl mx-auto px-6 text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 mx-auto mb-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center"
        >
          <Crown className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </motion.div>

        <h2 className="font-serif text-4xl md:text-6xl text-foreground tracking-tight mb-6">
          Membership by <span className="italic text-primary">Application</span>
        </h2>
        <p className="text-muted-foreground font-light mb-12 leading-relaxed text-lg max-w-xl mx-auto">
          Aurelia serves a limited global clientele. To maintain our standard of hyper-personalized service, we accept only 50 new members annually.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/auth"
            className="group w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground text-sm font-medium tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 gold-glow-hover flex items-center justify-center gap-3"
          >
            Begin Application
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          <a
            href="#"
            className="w-full sm:w-auto px-10 py-4 border border-border/30 text-foreground text-sm font-medium tracking-widest uppercase hover:bg-secondary/50 hover:border-primary/30 transition-all duration-300"
          >
            Contact Liaison
          </a>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-border/20 inline-flex flex-col sm:flex-row items-center gap-6 text-xs text-muted-foreground/60 tracking-wide"
        >
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            $50k initial deposit upon acceptance
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            Biometric identity verification
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default MembershipCTA;
