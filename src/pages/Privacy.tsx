import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BRAND } from "@/components/brand";
import { Eye, Database, Shield, Clock, UserCheck, Globe } from "lucide-react";

const Privacy = () => {
  const sections = [
    {
      icon: Eye,
      title: "1. Information We Collect",
      content: `We collect information you provide directly, including name, contact details, travel preferences, and payment information. We also collect usage data, device information, and cookies to improve our services. All data collection is conducted with your consent and in compliance with UK data protection regulations including the UK GDPR.`,
    },
    {
      icon: Database,
      title: "2. How We Use Your Information",
      content: `Your information is used to provide and personalize our concierge services, process transactions, communicate with you, and improve our offerings. We analyze preferences to anticipate your needs and deliver exceptional experiences. Your data is never sold to third parties.`,
    },
    {
      icon: Shield,
      title: "3. Data Security",
      content: `We employ bank-grade encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Our infrastructure is hosted in secure UK and EU data centers with SOC 2 Type II certification. Access to member data is strictly controlled and audited. We conduct regular security assessments and penetration testing.`,
    },
    {
      icon: Clock,
      title: "4. Data Retention",
      content: `We retain your personal data only as long as necessary to fulfill the purposes outlined in this policy or as required by law. Transaction records are kept for seven years per UK financial regulations. You may request deletion of your data at any time, subject to legal retention requirements.`,
    },
    {
      icon: UserCheck,
      title: "5. Your Rights",
      content: `Under UK GDPR, you have the right to access, correct, or delete your personal data. You may request data portability or restrict processing. You can withdraw consent at any time without affecting prior processing. To exercise these rights, contact our Data Protection Officer at concierge@aurelia-privateconcierge.com.`,
    },
    {
      icon: Globe,
      title: "6. International Transfers",
      content: `When we transfer data outside the United Kingdom, we ensure adequate protection through standard contractual clauses approved by the UK Information Commissioner's Office. We only transfer data to jurisdictions with equivalent data protection standards or with appropriate safeguards in place.`,
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 text-xs font-medium tracking-[0.2em] uppercase text-primary border border-primary/30 rounded-full mb-6">
              Legal
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your privacy is paramount. We protect your data with the highest UK standards.
            </p>
            <p className="text-sm text-muted-foreground/60 mt-4">
              Last updated: January 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif text-foreground mb-3">
                      {section.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cookie Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-8 rounded-2xl border border-border/30 bg-card/50"
          >
            <h3 className="text-lg font-serif text-foreground mb-4">
              7. Cookies & Tracking
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We use essential cookies to enable core functionality and analytics cookies to understand usage patterns. You may disable non-essential cookies through your browser settings. We do not use cookies for advertising purposes.
            </p>
            
            <h3 className="text-lg font-serif text-foreground mb-4">
              8. Third-Party Services
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We share necessary information with trusted partners to fulfill your requests (airlines, hotels, vendors). All partners are bound by confidentiality agreements and must meet our strict data protection standards.
            </p>

            <h3 className="text-lg font-serif text-foreground mb-4">
              9. Contact Our DPO
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              For privacy inquiries or to exercise your rights, contact our Data Protection Officer at{" "}
              <a href="mailto:concierge@aurelia-privateconcierge.com" className="text-primary hover:underline">
                concierge@aurelia-privateconcierge.com
              </a>{" "}
              or write to: Data Protection Officer, {BRAND.entity}, London, United Kingdom.
            </p>
          </motion.div>

          {/* Legal Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground/60">
              {BRAND.legal.trademark}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-2">
              © {BRAND.year} {BRAND.entity}. {BRAND.legal.copyright}
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
