import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plane, Ship, Shield, Truck, Globe, Utensils, ArrowRight, Bot } from "lucide-react";
import { partnersData, getCategories } from "@/lib/partners-data";

const categoryIcons: Record<string, typeof Plane> = {
  "Private Aviation": Plane,
  "Yacht Charter": Ship,
  "Security & Chauffeur": Shield,
  "AI Technology": Bot,
  "Logistics & Removals": Truck,
  "Hospitality": Globe,
  "Fine Dining": Utensils,
};

const PartnersSection = () => {
  const categories = getCategories();

  return (
    <section id="partners" className="py-24 md:py-32 bg-background relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-4">
            Partner Network
          </span>
          <h2 
            className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Curated Partners
          </h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">
            Exclusive relationships with the world's finest service providers.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((category, index) => {
            const Icon = categoryIcons[category] || Globe;
            const categoryPartners = partnersData.filter(p => p.category === category).slice(0, 3);

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group p-8 bg-card/30 border border-border/10 hover:border-primary/20 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-full border border-border/20 flex items-center justify-center mb-6 group-hover:border-primary/30 transition-colors duration-500">
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-500" strokeWidth={1.5} />
                </div>
                
                <h3 
                  className="text-lg text-foreground mb-4"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {category}
                </h3>

                <ul className="space-y-2 mb-6">
                  {categoryPartners.map((partner) => (
                    <li key={partner.id}>
                      <Link 
                        to={`/partners/${partner.id}`}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        {partner.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/services#${category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-primary/70 hover:text-primary transition-colors group/link"
                >
                  View All
                  <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-xs text-muted-foreground/50 mb-4">
            {partnersData.length}+ vetted partners worldwide
          </p>
          <Link
            to="/partners/join"
            className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
          >
            Become a Partner
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;
