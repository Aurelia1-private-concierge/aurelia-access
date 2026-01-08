import { motion, useScroll, useTransform } from "framer-motion";
import { Quote } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

const testimonials = [
  { quote: "Aurelia secured a private viewing of a Basquiat before it went to auction. No other service could have made that happen.", author: "Alexandra M.", title: "Art Collector, Geneva", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" },
  { quote: "When my flight was cancelled in Tokyo, they had a private jet ready within 90 minutes. That level of response is unprecedented.", author: "James K.", title: "Tech Executive, Singapore", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" },
  { quote: "The discretion is absolute. In my position, that's not a luxury—it's a necessity. Aurelia understands this implicitly.", author: "Victoria S.", title: "Family Office Principal, London", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop" },
];

const TestimonialsSection = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glowX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="py-24 bg-background relative overflow-hidden">
      <motion.div style={{ x: glowX }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/3 blur-[200px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-primary text-xs font-medium tracking-[0.2em] uppercase mb-4">{t("testimonials.label")}</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight">
            {t("testimonials.title")} <span className="italic text-muted-foreground">{t("testimonials.titleHighlight")}</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div key={testimonial.author} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.15 }} className="group relative p-8 bg-secondary/20 border border-border/20 backdrop-blur-sm hover:border-primary/30 hover:bg-secondary/30 transition-all duration-500 card-hover">
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500"><Quote className="w-12 h-12 text-primary" /></div>
              <div className="relative z-10">
                <p className="text-foreground/90 font-light leading-relaxed mb-8 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-border/30 group-hover:border-primary/50 transition-colors duration-300">
                    <img src={testimonial.image} alt={testimonial.author} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none gradient-border" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
