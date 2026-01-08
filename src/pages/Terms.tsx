import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BRAND } from "@/components/brand";
import { Shield, Scale, Globe, Lock, FileText, Users } from "lucide-react";

const Terms = () => {
  const sections = [
    {
      icon: FileText,
      title: "1. Acceptance of Terms",
      content: `By accessing or using ${BRAND.name} services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue use of our services immediately. These terms constitute a legally binding agreement between you and ${BRAND.entity}.`,
    },
    {
      icon: Users,
      title: "2. Membership & Eligibility",
      content: `${BRAND.name} membership is by invitation only and subject to our sole discretion. Members must be at least 18 years of age and possess the legal capacity to enter into binding agreements. We reserve the right to refuse, suspend, or terminate membership at any time without prior notice. Membership is non-transferable and may not be shared with third parties.`,
    },
    {
      icon: Shield,
      title: "3. Services & Obligations",
      content: `We provide bespoke concierge services including but not limited to travel arrangements, private aviation, yacht charters, real estate acquisitions, and lifestyle management. While we endeavor to fulfill all requests, we cannot guarantee availability or specific outcomes. All services are subject to third-party provider terms and conditions. We act as intermediaries and are not liable for third-party performance.`,
    },
    {
      icon: Lock,
      title: "4. Confidentiality & Privacy",
      content: `We maintain the strictest confidentiality regarding all member information and transactions. Your personal data is processed in accordance with Swiss data protection laws and our Privacy Policy. We employ bank-grade encryption and security protocols. Member information is never shared with third parties except as required to fulfill service requests or comply with legal obligations.`,
    },
    {
      icon: Scale,
      title: "5. Liability & Indemnification",
      content: `${BRAND.entity} liability is limited to the fees paid for the specific service in question. We are not liable for indirect, consequential, or punitive damages. Members agree to indemnify and hold harmless ${BRAND.entity}, its officers, directors, and employees from any claims arising from member conduct or breach of these terms. Force majeure events absolve us of performance obligations.`,
    },
    {
      icon: Globe,
      title: "6. Governing Law & Jurisdiction",
      content: `These Terms of Service are governed by and construed in accordance with the laws of Switzerland. Any disputes arising from these terms or your use of our services shall be subject to the exclusive jurisdiction of the courts of Geneva, Switzerland. The United Nations Convention on Contracts for the International Sale of Goods does not apply to these terms.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
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
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {BRAND.legal.jurisdiction}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-4">
              Last updated: January 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
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

          {/* Additional Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-8 rounded-2xl border border-border/30 bg-card/50"
          >
            <h3 className="text-lg font-serif text-foreground mb-4">
              7. Amendments & Modifications
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We reserve the right to modify these Terms of Service at any time. Members will be notified of material changes via email or through the member portal. Continued use of our services following any modifications constitutes acceptance of the revised terms.
            </p>
            
            <h3 className="text-lg font-serif text-foreground mb-4">
              8. Severability
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that the remaining provisions shall remain in full force and effect.
            </p>

            <h3 className="text-lg font-serif text-foreground mb-4">
              9. Contact Information
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              For questions regarding these Terms of Service, please contact our legal department at{" "}
              <a href={`mailto:legal@aurelia.com`} className="text-primary hover:underline">
                legal@aurelia.com
              </a>{" "}
              or via post at our registered office in Geneva, Switzerland.
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

export default Terms;
