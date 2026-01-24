import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
interface Testimonial {
  id: string;
  quote: string;
  author: string;
  title: string | null;
  location: string | null;
  member_since: string | null;
  image_url: string | null;
}
const fallbackTestimonials: Testimonial[] = [{
  id: "1",
  quote: "Aurelia secured a private viewing of a Basquiat before it went to auction. No other service could have made that happen.",
  author: "Alexandra M.",
  title: "Art Collector",
  location: "Geneva",
  member_since: "2021",
  image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face"
}, {
  id: "2",
  quote: "When my flight was cancelled in Tokyo, they had a private jet ready within 90 minutes. That level of response is unprecedented.",
  author: "James K.",
  title: "Tech Executive",
  location: "Singapore",
  member_since: "2020",
  image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
}, {
  id: "3",
  quote: "The discretion is absolute. In my position, that is not a luxury—it is a necessity. Aurelia understands this implicitly.",
  author: "Victoria S.",
  title: "Family Office Principal",
  location: "London",
  member_since: "2019",
  image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
}];
const TestimonialsSection = () => {
  const {
    t
  } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    const fetchTestimonials = async () => {
      const {
        data,
        error
      } = await supabase.from("testimonials").select("*").eq("status", "active").eq("is_featured", true).order("display_order", {
        ascending: true
      }).limit(5);
      if (!error && data && data.length > 0) {
        setTestimonials(data);
      }
    };
    fetchTestimonials();
  }, []);
  const activeTestimonial = testimonials[activeIndex] || fallbackTestimonials[0];
  return <section className="py-24 md:py-32 bg-background relative" aria-labelledby="testimonials-heading">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-4">
            {t("testimonials.label")}
          </span>
          <h2 id="testimonials-heading" className="text-4xl md:text-5xl text-foreground tracking-[-0.02em]" style={{
          fontFamily: "'Cormorant Garamond', serif"
        }}>
            {t("testimonials.title")}
          </h2>
        </motion.div>

        {/* Featured Testimonial */}
        <motion.div key={activeIndex} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="text-center mb-12">
          <Quote className="w-8 h-8 text-primary/20 mx-auto mb-8" aria-hidden="true" />
          
          <blockquote className="text-2xl md:text-3xl lg:text-4xl text-foreground font-light leading-relaxed mb-10 max-w-3xl mx-auto" style={{
          fontFamily: "'Cormorant Garamond', serif"
        }}>
            "{activeTestimonial.quote}"
          </blockquote>

          <div className="flex flex-col items-center gap-4">
            {activeTestimonial.image_url && <img src={activeTestimonial.image_url} alt={`Portrait of ${activeTestimonial.author}, ${activeTestimonial.title} from ${activeTestimonial.location}`} className="w-14 h-14 rounded-full object-cover grayscale" loading="lazy" />}
            <div>
              <p className="text-sm text-foreground">{activeTestimonial.author}</p>
              <p className="text-xs text-muted-foreground">
                {activeTestimonial.title} • {activeTestimonial.location}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-3" role="tablist" aria-label="Testimonial navigation">
          {testimonials.map((testimonial, index) => <button key={testimonial.id} onClick={() => setActiveIndex(index)} className={`h-0.5 transition-all duration-500 ${index === activeIndex ? 'bg-primary w-8' : 'bg-muted-foreground/20 w-2 hover:bg-muted-foreground/40'}`} aria-label={`View testimonial from ${testimonial.author}`} aria-selected={index === activeIndex} role="tab" />)}
        </div>

        {/* Stats */}
        <motion.div initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} transition={{
        delay: 0.3
      }} className="mt-20 pt-12 border-t border-border/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[{
            value: "97%",
            label: "Retention"
          }, {
            value: "$50M+",
            label: "Avg. Net Worth"
          }, {
            value: "15min",
            label: "Response"
          }, {
            value: "4.9/5",
            label: "Satisfaction"
          }].map((stat, index) => <motion.div key={stat.label} initial={{
            opacity: 0,
            y: 10
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.4 + index * 0.1
          }} className="text-center">
                <p className="text-2xl md:text-3xl text-primary/80 mb-1" style={{
              fontFamily: "'Cormorant Garamond', serif"
            }}>
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-platinum-light">
                  {stat.label}
                </p>
              </motion.div>)}
          </div>
        </motion.div>
      </div>
    </section>;
};
export default TestimonialsSection;