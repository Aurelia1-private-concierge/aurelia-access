import { motion, useScroll, useTransform } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import OptimizedImage from "./OptimizedImage";

const testimonials = [
  { 
    quote: "Aurelia secured a private viewing of a Basquiat before it went to auction. No other service could have made that happen.", 
    author: "Alexandra M.", 
    title: "Art Collector", 
    location: "Geneva",
    netWorth: "$50M+",
    memberSince: "2021",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    featured: true
  },
  { 
    quote: "When my flight was cancelled in Tokyo, they had a private jet ready within 90 minutes. That level of response is unprecedented.", 
    author: "James K.", 
    title: "Tech Executive", 
    location: "Singapore",
    netWorth: "$100M+",
    memberSince: "2020",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    featured: false
  },
  { 
    quote: "The discretion is absolute. In my position, that is not a luxury—it is a necessity. Aurelia understands this implicitly.", 
    author: "Victoria S.", 
    title: "Family Office Principal", 
    location: "London",
    netWorth: "$200M+",
    memberSince: "2019",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    featured: false
  },
  { 
    quote: "They arranged an after-hours tour of the Louvre for my daughter on her birthday. The memories we created are priceless.", 
    author: "Richard H.", 
    title: "Investment Chairman", 
    location: "New York",
    netWorth: "$500M+",
    memberSince: "2018",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    featured: true
  },
];

const TestimonialsSection = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glowX = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.8, 0]);

  const featuredTestimonial = testimonials[activeIndex];

  return (
    <section ref={ref} className="py-32 md:py-40 bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <motion.div 
        style={{ x: glowX, opacity: glowOpacity }} 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-primary/[0.03] blur-[150px] rounded-full pointer-events-none" 
      />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <span className="w-12 h-px bg-primary/40" />
            <p className="text-[11px] uppercase tracking-[0.4em] text-primary/70 font-medium">
              {t("testimonials.label")}
            </p>
            <span className="w-12 h-px bg-primary/40" />
          </div>
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl text-foreground tracking-[-0.02em] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t("testimonials.title")}{" "}
            <span className="italic text-muted-foreground/70">{t("testimonials.titleHighlight")}</span>
          </h2>
        </motion.div>

        {/* Featured Testimonial - Large Editorial Style */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="relative grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image Side */}
            <div className="relative group">
              <div className="relative aspect-[4/5] overflow-hidden">
              <motion.div
                key={featuredTestimonial.image}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full h-full"
              >
                <OptimizedImage 
                  src={featuredTestimonial.image} 
                  alt={featuredTestimonial.author}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </motion.div>
              {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                
                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-8 h-8">
                  <div className="absolute top-0 left-0 w-full h-px bg-primary/40" />
                  <div className="absolute top-0 left-0 w-px h-full bg-primary/40" />
                </div>
                <div className="absolute bottom-4 right-4 w-8 h-8">
                  <div className="absolute bottom-0 right-0 w-full h-px bg-primary/40" />
                  <div className="absolute bottom-0 right-0 w-px h-full bg-primary/40" />
                </div>
              </div>

              {/* Member badge */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-8 left-8 bg-background/90 backdrop-blur-md border border-border/30 px-5 py-3"
              >
                <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-1">Member Since</p>
                <p className="text-lg font-light text-foreground">{featuredTestimonial.memberSince}</p>
              </motion.div>
            </div>

            {/* Quote Side */}
            <div className="relative">
              {/* Large quote mark */}
              <Quote className="absolute -top-4 -left-4 w-16 h-16 text-primary/10" strokeWidth={1} />
              
              <motion.blockquote
                key={featuredTestimonial.quote}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10"
              >
                <p 
                  className="text-2xl md:text-3xl lg:text-4xl text-foreground/90 font-light leading-relaxed mb-10 italic"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  "{featuredTestimonial.quote}"
                </p>

                {/* Author info */}
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <p 
                      className="text-xl text-foreground mb-1"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {featuredTestimonial.author}
                    </p>
                    <p className="text-sm text-muted-foreground font-light">
                      {featuredTestimonial.title} · {featuredTestimonial.location}
                    </p>
                  </div>
                  
                  {/* Verified badge */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-primary">Verified</span>
                  </div>
                </div>
              </motion.blockquote>

              {/* Decorative line */}
              <div className="absolute -bottom-8 left-0 w-24 h-px bg-gradient-to-r from-primary/40 to-transparent" />
            </div>
          </div>
        </motion.div>

        {/* Thumbnail Navigation */}
        <div className="flex justify-center gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.button
              key={testimonial.author}
              onClick={() => setActiveIndex(index)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative transition-all duration-500 ${
                activeIndex === index ? 'scale-110' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all duration-500 ${
                activeIndex === index 
                  ? 'border-primary shadow-lg shadow-primary/20' 
                  : 'border-border/30 group-hover:border-primary/50'
              }`}>
                <OptimizedImage 
                  src={testimonial.image} 
                  alt={testimonial.author}
                  sizes="80px"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Active indicator */}
              {activeIndex === index && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-24 pt-16 border-t border-border/10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: "97%", label: "Member Retention" },
              { value: "$50M+", label: "Avg. Member Net Worth" },
              { value: "15min", label: "Avg. Response Time" },
              { value: "4.9/5", label: "Member Satisfaction" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-center"
              >
                <p 
                  className="text-3xl md:text-4xl text-primary mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
