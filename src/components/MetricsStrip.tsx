import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

const AnimatedCounter = ({ value, prefix, suffix }: { value: number; prefix: string; suffix: string }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        const duration = 2000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= value) { setCount(value); clearInterval(timer); } 
          else { setCount(Math.floor(current)); }
        }, duration / steps);
        return () => clearInterval(timer);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <p 
      ref={ref} 
      className="text-4xl md:text-5xl text-foreground tracking-tight group-hover:text-primary transition-colors duration-500"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}
    >
      {prefix}{count}<span className="text-xl text-muted-foreground ml-1">{suffix}</span>
    </p>
  );
};

const MetricsStrip = () => {
  const { t } = useTranslation();
  
  const metrics = [
    { labelKey: "metrics.assets", value: 30, prefix: "$", suffix: "M+", description: "Assets Under Management" },
    { labelKey: "metrics.coverage", value: 180, prefix: "", suffix: "+", description: "Countries Covered" },
    { labelKey: "metrics.response", value: 60, prefix: "< ", suffix: "s", description: "Avg Response Time" },
    { labelKey: "metrics.retention", value: 97, prefix: "", suffix: "%", description: "Member Retention" },
  ];

  return (
    <section className="relative z-20 py-20 md:py-24 bg-card/30 border-y border-border/10">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
      
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary/60 font-medium">
            By The Numbers
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {metrics.map((metric, index) => (
            <motion.div 
              key={metric.labelKey} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: index * 0.1 }} 
              className="text-center group cursor-default"
            >
              <AnimatedCounter value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-3 font-medium">
                {t(metric.labelKey)}
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1 hidden md:block">
                {metric.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsStrip;
