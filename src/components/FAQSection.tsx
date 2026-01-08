import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQSection = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  const faqs = [
    { questionKey: "faq.q1.question", answerKey: "faq.q1.answer" },
    { questionKey: "faq.q2.question", answerKey: "faq.q2.answer" },
    { questionKey: "faq.q3.question", answerKey: "faq.q3.answer" },
    { questionKey: "faq.q4.question", answerKey: "faq.q4.answer" },
    { questionKey: "faq.q5.question", answerKey: "faq.q5.answer" },
    { questionKey: "faq.q6.question", answerKey: "faq.q6.answer" },
  ];

  return (
    <section ref={ref} className="py-24 bg-secondary/10 relative overflow-hidden">
      <motion.div style={{ y: glowY }} className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-primary text-xs font-medium tracking-[0.2em] uppercase mb-4">{t("faq.label")}</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight">
            {t("faq.title")} <span className="italic text-muted-foreground">{t("faq.titleHighlight")}</span>
          </h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border/20 bg-secondary/20 backdrop-blur-sm px-6 rounded-lg hover:border-primary/30 transition-all duration-300 data-[state=open]:border-primary/40 data-[state=open]:bg-secondary/40">
                <AccordionTrigger className="py-5 hover:no-underline group">
                  <span className="text-left font-serif text-lg text-foreground group-hover:text-primary transition-colors duration-300 pr-4">{t(faq.questionKey)}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-5">{t(faq.answerKey)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-center mt-12">
          <p className="text-sm text-muted-foreground font-light">
            {t("faq.moreQuestions")} <a href="#" className="text-primary hover:underline transition-all">{t("faq.contactLiaison")}</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
