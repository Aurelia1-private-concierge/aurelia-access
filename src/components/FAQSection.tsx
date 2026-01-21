import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQSection = () => {
  const { t } = useTranslation();

  const faqs = [
    { questionKey: "faq.q1.question", answerKey: "faq.q1.answer" },
    { questionKey: "faq.q2.question", answerKey: "faq.q2.answer" },
    { questionKey: "faq.q3.question", answerKey: "faq.q3.answer" },
    { questionKey: "faq.q4.question", answerKey: "faq.q4.answer" },
    { questionKey: "faq.q5.question", answerKey: "faq.q5.answer" },
    { questionKey: "faq.q6.question", answerKey: "faq.q6.answer" },
  ];

  return (
    <section className="py-24 md:py-32 bg-card/20 relative">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center mb-12"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-4">
            {t("faq.label")}
          </span>
          <h2 
            className="text-4xl md:text-5xl text-foreground tracking-[-0.02em]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t("faq.title")}
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="border border-border/10 bg-background px-6 hover:border-primary/20 transition-colors duration-300 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="py-5 hover:no-underline group">
                  <span 
                    className="text-left text-sm text-foreground group-hover:text-primary transition-colors duration-300"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {t(faq.questionKey)}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground font-light leading-relaxed pb-5">
                  {t(faq.answerKey)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact link */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }} 
          transition={{ delay: 0.3 }} 
          className="text-center mt-10"
        >
          <p className="text-xs text-muted-foreground">
            {t("faq.moreQuestions")}{" "}
            <Link to="/contact" className="text-primary hover:underline">
              {t("faq.contactLiaison")}
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
