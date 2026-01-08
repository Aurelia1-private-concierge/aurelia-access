import { motion } from "framer-motion";

const metrics = [
  { label: "Assets Under Advisement", value: "$30M+", suffix: "" },
  { label: "Global Coverage", value: "120+", suffix: " Cities" },
  { label: "Response Time", value: "< 60", suffix: " Seconds" },
  { label: "Security Level", value: "Zero", suffix: "-Trust" },
];

const MetricsStrip = () => {
  return (
    <section className="relative z-20 bg-gradient-to-r from-background via-secondary/30 to-background border-y border-border/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.03),transparent_70%)]" />
      
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="text-center group"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 font-medium">
              {metric.label}
            </p>
            <p className="font-serif text-3xl md:text-4xl text-foreground tracking-tight group-hover:text-primary transition-colors duration-500">
              {metric.value}
              <span className="text-lg text-muted-foreground">{metric.suffix}</span>
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default MetricsStrip;
