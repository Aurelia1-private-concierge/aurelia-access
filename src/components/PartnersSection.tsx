import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plane, Ship, Shield, Truck, Globe, Utensils, ArrowRight } from "lucide-react";
import { partnersData, getAllCategories } from "@/lib/partners-data";

const categoryIcons: Record<string, typeof Plane> = {
  "Private Aviation": Plane,
  "Yacht Charter": Ship,
  "Security & Chauffeur": Shield,
  "AI Technology": Truck,
  "Hospitality": Globe,
  "Fine Dining": Utensils,
};

const PartnersSection = () => {
  const categories = getAllCategories();

  return (
    <section id="partners" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-4 block">
            Exclusive Network
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-4">
            Our <span className="text-primary">Partners</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light">
            Curated relationships with the world's finest service providers, 
            ensuring exceptional experiences at every touchpoint.
          </p>
        </motion.div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category] || Globe;
            const categoryPartners = partnersData.filter(p => p.category === category);
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 hover:bg-card/50">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Icon */}
                  <div className="relative mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Category Title */}
                  <h3 className="text-lg font-medium text-foreground mb-3 relative">
                    {category}
                  </h3>

                  {/* Partners List */}
                  <ul className="space-y-2 relative mb-4">
                    {categoryPartners.map((partner) => (
                      <li key={partner.id}>
                        <Link 
                          to={`/partners/${partner.id}`}
                          className="text-sm text-muted-foreground font-light flex items-center gap-2 hover:text-primary transition-colors group/link"
                        >
                          <span className="w-1 h-1 rounded-full bg-primary/60 group-hover/link:bg-primary transition-colors" />
                          {partner.name}
                          <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* Decorative corner */}
                  <div className="absolute top-4 right-4 w-8 h-8 opacity-20 group-hover:opacity-40 transition-opacity">
                    <div className="absolute top-0 right-0 w-4 h-px bg-gradient-to-l from-primary to-transparent" />
                    <div className="absolute top-0 right-0 w-px h-4 bg-gradient-to-b from-primary to-transparent" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground/70 font-light">
            Access to 200+ vetted luxury partners worldwide
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;
