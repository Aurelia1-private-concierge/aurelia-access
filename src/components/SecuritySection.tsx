import { Shield, Lock, Eye, Server, KeyRound, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";

const securityFeatures = [
  {
    icon: Lock,
    title: "256-bit AES Encryption",
    description: "Military-grade encryption protects all communications and data at rest.",
  },
  {
    icon: Eye,
    title: "Zero-Knowledge Architecture",
    description: "We cannot access your data. Only you hold the decryption keys.",
  },
  {
    icon: Server,
    title: "Swiss Data Residency",
    description: "Your information is stored in secure Swiss data centers, beyond jurisdictional reach.",
  },
  {
    icon: KeyRound,
    title: "End-to-End Privacy",
    description: "From request to fulfillment, your activities remain completely confidential.",
  },
];

const SecuritySection = () => {
  return (
    <section id="security" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary/3 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <p className="text-primary text-xs font-medium tracking-[0.2em] uppercase">
                Sovereign Security
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight">
                Your Privacy, <br />
                <span className="italic text-muted-foreground">Uncompromised.</span>
              </h2>
            </div>

            <p className="font-light text-muted-foreground leading-relaxed max-w-lg">
              In a world of data breaches and surveillance, Aurelia operates on the principle of absolute discretion. 
              Our security architecture is designed for those who demand nothing less than impenetrable privacy.
            </p>

            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-secondary border border-border/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-serif text-foreground">99.99%</p>
                  <p className="text-xs text-muted-foreground tracking-wide">Uptime SLA</p>
                </div>
              </div>
              <div className="w-px h-12 bg-border/30" />
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-secondary border border-border/30 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-serif text-foreground">Zero</p>
                  <p className="text-xs text-muted-foreground tracking-wide">Data Breaches</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 bg-secondary/20 border border-border/20 backdrop-blur-sm hover:border-primary/40 hover:bg-secondary/40 transition-all duration-500 card-hover"
              >
                <div className="w-10 h-10 rounded-full bg-background border border-border/30 flex items-center justify-center mb-4 group-hover:border-primary/50 transition-colors duration-300">
                  <feature.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg text-foreground mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
