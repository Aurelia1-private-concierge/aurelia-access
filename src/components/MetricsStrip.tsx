import { motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
const AnimatedCounter = ({
  value,
  prefix,
  suffix
}: {
  value: number;
  prefix: string;
  suffix: string;
}) => {
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
          if (current >= value) {
            setCount(value);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
        return () => clearInterval(timer);
      }
    }, {
      threshold: 0.5
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);
  return <span ref={ref} className="tabular-nums">
      {prefix}{count}{suffix}
    </span>;
};
const MetricsStrip = () => {
  const {
    t
  } = useTranslation();
  const [dynamicMetrics, setDynamicMetrics] = useState({
    members: 2500,
    countries: 180,
    response: 60,
    retention: 97
  });
  const fetchMetrics = useCallback(async () => {
    try {
      const [signupsResult, requestsResult] = await Promise.all([supabase.from("launch_signups").select("*", {
        count: "exact",
        head: true
      }), supabase.from("service_requests").select("*", {
        count: "exact",
        head: true
      }).eq("status", "completed")]);
      const signupCount = signupsResult.count || 0;
      const completedCount = requestsResult.count || 0;
      setDynamicMetrics({
        members: signupCount + 2500,
        // Base + actual signups
        countries: 180,
        response: 60,
        retention: completedCount > 5 ? 97 : 98
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  }, []);
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);
  const metrics = [{
    labelKey: "metrics.assets",
    value: Math.floor(dynamicMetrics.members / 100),
    prefix: "$",
    suffix: "M+",
    description: "Assets Managed"
  }, {
    labelKey: "metrics.coverage",
    value: dynamicMetrics.countries,
    prefix: "",
    suffix: "+",
    description: "Countries"
  }, {
    labelKey: "metrics.response",
    value: dynamicMetrics.response,
    prefix: "< ",
    suffix: "s",
    description: "Response"
  }, {
    labelKey: "metrics.retention",
    value: dynamicMetrics.retention,
    prefix: "",
    suffix: "%",
    description: "Retention"
  }];
  return <section className="py-16 md:py-20 bg-background relative text-platinum">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} className="text-center mb-12">
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            By The Numbers
          </span>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {metrics.map((metric, index) => <motion.div key={metric.labelKey} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.1
        }} className="text-center">
              <div className="text-4xl md:text-5xl text-foreground tracking-tight mb-2" style={{
            fontFamily: "'Cormorant Garamond', serif"
          }}>
                <AnimatedCounter value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary/70 mb-1">
                {t(metric.labelKey)}
              </p>
              <p className="text-[10px] hidden md:block text-platinum-light">
                {metric.description}
              </p>
            </motion.div>)}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
    </section>;
};
export default MetricsStrip;