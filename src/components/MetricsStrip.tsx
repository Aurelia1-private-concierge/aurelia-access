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
    <p ref={ref} className="font-serif text-3xl md:text-4xl text-foreground tracking-tight group-hover:text-primary transition-colors duration-500">
      {prefix}{count}<span className="text-lg text-muted-foreground">{suffix}</span>
    </p>
  );
};

const MetricsStrip = () => {
  const { t } = useTranslation();
  
  const metrics = [
    { labelKey: "metrics.assets", value: 30, prefix: "$", suffix: "M+" },
    { labelKey: "metrics.coverage", value: 120, prefix: "", suffix: t("metrics.cities") },
    { labelKey: "metrics.response", value: 60, prefix: "< ", suffix: t("metrics.seconds") },
    { labelKey: "metrics.retention", value: 99, prefix: "", suffix: "%" },
  ];

  return (
    <section className="relative z-20 bg-gradient-to-r from-background via-secondary/30 to-background border-y border-border/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.03),transparent_70%)]" />
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
        {metrics.map((metric, index) => (
          <motion.div key={metric.labelKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="text-center group cursor-default">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-medium">{t(metric.labelKey)}</p>
            <AnimatedCounter value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default MetricsStrip;
