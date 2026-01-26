import { motion } from "framer-motion";
import { useRef, memo } from "react";
import { 
  Shield, Lock, Key, Eye, Server, FileCheck, 
  Fingerprint, AlertTriangle, Clock, Award,
  CheckCircle2, ShieldCheck, Database, Globe
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BRAND } from "@/components/brand";
import { AnimatedBeam } from "@/components/ui/animated-beam";

// Security Layers Section with Crossbeam Visualization
interface SecurityLayer {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string;
}

const SecurityLayersSection = memo(({ securityLayers }: { securityLayers: SecurityLayer[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 
            className="text-3xl md:text-4xl font-normal mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Multi-Layered Protection
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Six interlocking security layers ensure your data remains impenetrable
          </p>
        </motion.div>

        {/* Crossbeam visualization - visible on larger screens */}
        <div ref={containerRef} className="hidden lg:block relative h-[400px] mb-16">
          {/* Central shield hub */}
          <div 
            ref={centerRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="relative">
              <div className="absolute inset-0 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 border border-primary/40 flex items-center justify-center backdrop-blur-xl">
                <Shield className="w-10 h-10 text-primary" />
              </div>
            </div>
          </div>

          {/* Layer nodes arranged in circle */}
          {securityLayers.map((layer, index) => {
            const angle = (index * 2 * Math.PI) / securityLayers.length - Math.PI / 2;
            const radius = 38;
            const left = `${50 + radius * Math.cos(angle)}%`;
            const top = `${50 + radius * Math.sin(angle)}%`;

            return (
              <motion.div
                key={layer.title}
                ref={(el) => { nodeRefs.current[index] = el; }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
                style={{ left, top }}
              >
                <div className="relative cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-card/80 border border-border/40 flex items-center justify-center backdrop-blur-xl group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300">
                    <layer.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-primary font-medium tracking-wide">
                      {layer.badge}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Animated beams connecting nodes to center */}
          {nodeRefs.current.map((nodeRef, index) => {
            if (!nodeRef || !centerRef.current) return null;
            return (
              <AnimatedBeam
                key={`security-beam-${index}`}
                containerRef={containerRef as React.RefObject<HTMLDivElement>}
                fromRef={{ current: nodeRef } as React.RefObject<HTMLDivElement>}
                toRef={centerRef as React.RefObject<HTMLDivElement>}
                duration={3 + index * 0.2}
                delay={index * 0.15}
                curvature={8}
                pathOpacity={0.08}
                pathWidth={1}
                gradientStartColor="hsl(var(--primary))"
                gradientStopColor="hsl(var(--primary) / 0.2)"
              />
            );
          })}
        </div>

        {/* Card grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityLayers.map((layer, index) => (
            <motion.div
              key={layer.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-8 bg-card/50 border border-border/30 rounded-lg hover:border-primary/30 hover:bg-card/80 transition-all duration-500"
            >
              <div className="absolute top-4 right-4">
                <span className="text-[10px] uppercase tracking-widest text-primary/60 px-2 py-1 bg-primary/10 rounded-full">
                  {layer.badge}
                </span>
              </div>
              
              <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <layer.icon className="w-5 h-5 text-primary" />
              </div>
              
              <h3 className="text-lg font-medium mb-3">{layer.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {layer.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

SecurityLayersSection.displayName = "SecurityLayersSection";

const Security = () => {
  const { t } = useTranslation();

  const securityLayers = [
    {
      icon: Lock,
      title: "AES-256-GCM Encryption",
      description: "Military-grade encryption protects all data at rest. The same standard trusted by intelligence agencies worldwide.",
      badge: "Bank-Grade"
    },
    {
      icon: Shield,
      title: "Zero-Trust Architecture",
      description: "Every request is authenticated and authorized. No implicit trust, no exceptions. Your data never leaves secure perimeters.",
      badge: "Enterprise"
    },
    {
      icon: Key,
      title: "Automatic Key Rotation",
      description: "Encryption keys rotate every 90 days with full audit trails. Compromised keys are instantly invalidated.",
      badge: "Automated"
    },
    {
      icon: Fingerprint,
      title: "Biometric & MFA",
      description: "Multi-factor authentication with support for hardware keys, TOTP, and biometric verification.",
      badge: "Required"
    },
    {
      icon: Eye,
      title: "Real-Time Threat Detection",
      description: "AI-powered anomaly detection monitors for suspicious patterns 24/7. Instant alerts for unusual activity.",
      badge: "AI-Powered"
    },
    {
      icon: Server,
      title: "Secure Infrastructure",
      description: "SOC 2 Type II certified data centers with geographic redundancy. Your data is replicated across secure regions.",
      badge: "Certified"
    }
  ];

  const certifications = [
    { name: "SOC 2 Type II", icon: Award },
    { name: "GDPR Compliant", icon: Globe },
    { name: "ISO 27001", icon: FileCheck },
    { name: "PCI DSS Level 1", icon: Database },
  ];

  const securityStats = [
    { value: "256-bit", label: "AES Encryption" },
    { value: "99.99%", label: "Uptime SLA" },
    { value: "24/7", label: "Security Monitoring" },
    { value: "<1ms", label: "Threat Response" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 mb-8">
              <span className="w-12 h-px bg-primary/40" />
              <Shield className="w-6 h-6 text-primary" />
              <span className="w-12 h-px bg-primary/40" />
            </div>
            
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-normal tracking-tight mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Fortress-Grade Security
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Your privacy is sacrosanct. We employ the same security protocols trusted by 
              governments, financial institutions, and intelligence agencies to protect your 
              most sensitive information.
            </p>

            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-medium tracking-wide">
                AAA+ Security Rating
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-12 border-y border-border/20 bg-card/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {securityStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-light text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Layers with Crossbeam Visualization */}
      <SecurityLayersSection securityLayers={securityLayers} />

      {/* Certifications */}
      <section className="py-20 bg-card/30 border-y border-border/20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 
              className="text-3xl font-normal mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Compliance & Certifications
            </h2>
            <p className="text-muted-foreground">
              Independently audited and certified to the highest global standards
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center p-6 bg-background border border-border/30 rounded-lg"
              >
                <cert.icon className="w-8 h-8 text-primary mb-3" />
                <span className="text-sm font-medium text-center">{cert.name}</span>
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Promise */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-8">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            
            <h2 
              className="text-3xl md:text-4xl font-normal mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Our Unbreakable Promise
            </h2>
            
            <div className="prose prose-invert mx-auto text-muted-foreground leading-relaxed space-y-4">
              <p>
                At {BRAND.name}, your privacy is not a feature—it is the foundation. We operate under 
                the principle of <strong className="text-foreground">data minimisation</strong>: we collect only what is essential, 
                store nothing unnecessary, and never monetise your information.
              </p>
              <p>
                Every communication is end-to-end encrypted. Every transaction is secured with 
                bank-grade protocols. Every team member undergoes rigorous background checks and 
                signs ironclad confidentiality agreements.
              </p>
              <p className="text-foreground font-medium">
                Your secrets remain exactly that—yours.
              </p>
            </div>

            <div className="mt-12 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Last security audit: January 2026 | Next audit: April 2026</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Questions about our security practices?
          </p>
          <Link 
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Contact Security Team
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Security;
