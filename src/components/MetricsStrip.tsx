import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

const AnimatedCounter = ({ value, prefix, suffix }: { value: number; prefix: string; suffix: string }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

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
    <span ref={ref} className="tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
};

const MetricsStrip = () => {
  const { t } = useTranslation();
  
  const metrics = [
    { labelKey: "metrics.assets", value: 30, prefix: "$", suffix: "M+", description: "Assets Managed" },
    { labelKey: "metrics.coverage", value: 180, prefix: "", suffix: "+", description: "Countries" },
    { labelKey: "metrics.response", value: 60, prefix: "< ", suffix: "s", description: "Response" },
    { labelKey: "metrics.retention", value: 97, prefix: "", suffix: "%", description: "Retention" },
  ];

  return (
    <section className="py-16 md:py-20 bg-background relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            By The Numbers
          </span>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {metrics.map((metric, index) => (
            <motion.div 
              key={metric.labelKey} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.5, delay: index * 0.1 }} 
              className="text-center"
            >
              <div 
                className="text-4xl md:text-5xl text-foreground tracking-tight mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                <AnimatedCounter value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary/70 mb-1">
                {t(metric.labelKey)}
              </p>
              <p className="text-[10px] text-muted-foreground/50 hidden md:block">
                {metric.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
    </section>
  );
};

export default MetricsStrip;
