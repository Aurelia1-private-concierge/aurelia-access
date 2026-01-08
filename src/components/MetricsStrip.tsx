import { motion } from "framer-motion";

const metrics = [
  { label: "Assets Under Advisement", value: "$30M+" },
  { label: "Global Coverage", value: "120+ Cities" },
  { label: "Response Time", value: "< 60 Seconds" },
  { label: "Security Level", value: "Zero-Trust" },
];

const MetricsStrip = () => {
  return (
    <section className="relative z-20 bg-background border-b border-border/30">
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="text-center md:text-left"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              {metric.label}
            </p>
            <p className="font-serif text-2xl text-foreground tracking-tight">
              {metric.value}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default MetricsStrip;
