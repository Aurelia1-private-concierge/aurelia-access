import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Plane, 
  Anchor, 
  Building2, 
  Gem, 
  Ticket, 
  Shield, 
  UtensilsCrossed, 
  Compass, 
  Heart, 
  ShoppingBag,
  ArrowUpRight
} from "lucide-react";

const categories = [
  { icon: Plane, name: "Private Aviation", description: "Jets & helicopters", href: "/services#aviation" },
  { icon: Anchor, name: "Yacht Charter", description: "Luxury vessels", href: "/services#yachts" },
  { icon: Building2, name: "Real Estate", description: "Premium properties", href: "/services#realestate" },
  { icon: Gem, name: "Collectibles", description: "Art & rarities", href: "/services#collectibles" },
  { icon: Ticket, name: "VIP Access", description: "Exclusive events", href: "/services#events" },
  { icon: Shield, name: "Security", description: "Personal protection", href: "/services#security" },
  { icon: UtensilsCrossed, name: "Fine Dining", description: "Culinary experiences", href: "/services#dining" },
  { icon: Compass, name: "Travel", description: "Bespoke journeys", href: "/services#travel" },
  { icon: Heart, name: "Wellness", description: "Health & retreat", href: "/services#wellness" },
  { icon: ShoppingBag, name: "Luxury Shopping", description: "Personal styling", href: "/services#shopping" },
];

const ServiceCategoriesSection = () => {
  return (
    <section className="py-24 md:py-32 bg-card/20 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(45deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <span className="w-12 h-px bg-primary/40" />
            <p className="text-[11px] uppercase tracking-[0.4em] text-primary/70 font-medium">
              Our Services
            </p>
            <span className="w-12 h-px bg-primary/40" />
          </div>
          <h2 
            className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Curated <span className="italic text-muted-foreground/70">Excellence</span>
          </h2>
          <p className="text-muted-foreground font-light max-w-2xl mx-auto">
            From private aviation to rare collectibles, every aspect of luxury living curated by experts.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={category.href}
                className="group flex flex-col items-center p-6 bg-background/50 border border-border/20 hover:border-primary/30 hover:bg-card/50 transition-all duration-500 h-full text-center"
              >
                <div className="w-12 h-12 rounded-full bg-card border border-border/30 flex items-center justify-center mb-4 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-500">
                  <category.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-[10px] text-muted-foreground/60">
                  {category.description}
                </p>
                <ArrowUpRight className="w-4 h-4 text-transparent group-hover:text-primary mt-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground text-sm font-semibold tracking-[0.15em] uppercase hover:bg-primary/90 hover:scale-105 hover:-translate-y-1 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.6)] hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.7)] active:scale-95 transition-all duration-300 rounded-md cursor-pointer"
          >
            View All Services
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceCategoriesSection;