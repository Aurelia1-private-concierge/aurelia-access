import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is the membership fee structure?",
    answer: "Aurelia operates on an annual retainer model. The Sovereign tier begins at $150,000 annually, which includes unlimited concierge requests, a dedicated private liaison, and access to our global network. The Legacy tier, designed for family offices, is structured individually based on scope and complexity.",
  },
  {
    question: "How does the application process work?",
    answer: "Membership is by invitation or application only. After submitting your initial inquiry, our vetting team conducts a discrete background review. Qualified candidates are invited for a private consultation—either in person at our Geneva headquarters or via secure video. The entire process typically takes 2-3 weeks.",
  },
  {
    question: "What services are included in the membership?",
    answer: "Our services span luxury travel and aviation, real estate acquisition, art and collectibles procurement, exclusive event access, private security coordination, and bespoke lifestyle management. Every request is handled with absolute discretion by your dedicated liaison team.",
  },
  {
    question: "How do you ensure privacy and security?",
    answer: "Security is foundational to Aurelia. We employ 256-bit AES encryption for all communications, zero-knowledge architecture for data storage, and biometric authentication for sensitive transactions. Our Swiss data residency ensures your information remains beyond jurisdictional reach.",
  },
  {
    question: "What is your response time for requests?",
    answer: "Standard requests receive acknowledgment within 60 seconds, 24/7/365. Complex acquisitions or travel arrangements typically see initial options within 4-6 hours. For time-sensitive situations, our priority protocol ensures immediate escalation to senior liaisons.",
  },
  {
    question: "Can I use Aurelia services globally?",
    answer: "Absolutely. Our network spans 120+ cities across six continents. Whether you require a last-minute reservation in Tokyo, property viewing in Monaco, or private aviation in São Paulo, our local partners ensure seamless execution worldwide.",
  },
];

const FAQSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const glowY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  return (
    <section ref={ref} className="py-24 bg-secondary/10 relative overflow-hidden">
      {/* Parallax glow */}
      <motion.div
        style={{ y: glowY }}
        className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -translate-y-1/2"
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary text-xs font-medium tracking-[0.2em] uppercase mb-4">
            Questions & Answers
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight">
            Frequently <span className="italic text-muted-foreground">Asked</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/20 bg-secondary/20 backdrop-blur-sm px-6 rounded-lg hover:border-primary/30 transition-all duration-300 data-[state=open]:border-primary/40 data-[state=open]:bg-secondary/40"
              >
                <AccordionTrigger className="py-5 hover:no-underline group">
                  <span className="text-left font-serif text-lg text-foreground group-hover:text-primary transition-colors duration-300 pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground font-light">
            Have more questions?{" "}
            <a href="#" className="text-primary hover:underline transition-all">
              Contact your liaison
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
