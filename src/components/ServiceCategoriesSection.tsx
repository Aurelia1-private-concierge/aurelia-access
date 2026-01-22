import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Plane, Anchor, Building2, Gem, Ticket, Shield, 
  UtensilsCrossed, Compass, Heart, ShoppingBag, ArrowRight
} from "lucide-react";

const categories = [
  { icon: Plane, name: "Private Aviation", href: "/services#aviation" },
  { icon: Anchor, name: "Yacht Charter", href: "/services#yachts" },
  { icon: Building2, name: "Real Estate", href: "/services#realestate" },
  { icon: Gem, name: "Collectibles", href: "/services#collectibles" },
  { icon: Ticket, name: "VIP Access", href: "/services#events" },
  { icon: Shield, name: "Security", href: "/services#security" },
  { icon: UtensilsCrossed, name: "Fine Dining", href: "/services#dining" },
  { icon: Compass, name: "Travel", href: "/services#travel" },
  { icon: Heart, name: "Wellness", href: "/services#wellness" },
  { icon: ShoppingBag, name: "Shopping", href: "/services#shopping" },
];

const ServiceCategoriesSection = () => {
  return (
    <section id="services" data-tour="service-categories" className="py-24 md:py-32 bg-background relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-4">
            Our Services
          </span>
          <h2 
            className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Curated Excellence
          </h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">
            Every aspect of luxury living, curated by experts who understand your world.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              <Link
                to={category.href}
                className="group flex flex-col items-center p-6 md:p-8 bg-card/30 border border-border/10 hover:border-primary/20 hover:bg-card/50 transition-all duration-500 h-full text-center"
              >
                <div className="w-12 h-12 rounded-full border border-border/20 flex items-center justify-center mb-4 group-hover:border-primary/30 transition-all duration-500">
                  <category.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-500" strokeWidth={1.5} />
                </div>
                <span className="text-xs text-foreground/80 group-hover:text-foreground transition-colors duration-300">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 group"
          >
            Explore All Services
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceCategoriesSection;
