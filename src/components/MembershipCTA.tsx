import { Crown } from "lucide-react";
import { motion } from "framer-motion";

const MembershipCTA = () => {
  return (
    <section id="membership" className="py-32 relative">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.08),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-3xl mx-auto px-6 text-center"
      >
        <Crown className="w-10 h-10 mx-auto text-primary mb-8" strokeWidth={1.5} />

        <h2 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight mb-6">
          Membership by Application
        </h2>
        <p className="text-muted-foreground font-light mb-10 leading-relaxed">
          Aurelia serves a limited global clientele. To maintain our standard of hyper-personalized service, we accept only 50 new members annually.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <a
            href="#"
            className="w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground text-sm font-medium tracking-widest uppercase hover:bg-primary/90 transition-colors gold-glow"
          >
            Begin Application
          </a>
          <a
            href="#"
            className="w-full sm:w-auto px-10 py-4 border border-border/30 text-foreground text-sm font-medium tracking-widest uppercase hover:bg-secondary/50 transition-colors"
          >
            Contact Liaison
          </a>
        </div>

        <p className="mt-8 text-xs text-muted-foreground/60 tracking-wide">
          Initial deposit of $50k required upon acceptance. <br />
          Identity verification via biometric secure link.
        </p>
      </motion.div>
    </section>
  );
};

export default MembershipCTA;
