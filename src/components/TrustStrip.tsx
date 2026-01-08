import { motion } from "framer-motion";

const partners = [
  { name: "Forbes", opacity: 0.4 },
  { name: "Bloomberg", opacity: 0.4 },
  { name: "Robb Report", opacity: 0.4 },
  { name: "Tatler", opacity: 0.4 },
  { name: "Financial Times", opacity: 0.4 },
];

const TrustStrip = () => {
  return (
    <section className="py-12 bg-background border-y border-border/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-8"
        >
          As Featured In
        </motion.p>
        
        <div className="flex items-center justify-center gap-12 md:gap-20 flex-wrap">
          {partners.map((partner, index) => (
            <motion.span
              key={partner.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: partner.opacity, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ opacity: 0.8 }}
              className="font-serif text-lg md:text-xl tracking-widest text-foreground cursor-default transition-opacity duration-300"
            >
              {partner.name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
