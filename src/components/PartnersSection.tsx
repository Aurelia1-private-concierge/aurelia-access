import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Plane, Ship, Shield, Truck, Globe, Utensils, ArrowRight, Sparkles } from "lucide-react";
import { partnersData, getCategories } from "@/lib/partners-data";
import { useRef } from "react";


const categoryIcons: Record<string, typeof Plane> = {
  "Private Aviation": Plane,
  "Yacht Charter": Ship,
  "Security & Chauffeur": Shield,
  "AI Technology": Truck,
  "Logistics & Removals": Truck,
  "Hospitality": Globe,
  "Fine Dining": Utensils,
};

const categoryDescriptions: Record<string, string> = {
  "Private Aviation": "Seamless global travel with elite jet services",
  "Yacht Charter": "Luxury maritime experiences worldwide",
  "Security & Chauffeur": "Discreet protection and premium transport",
  "AI Technology": "Cutting-edge digital solutions",
  "Logistics & Removals": "Premium courier and relocation services",
  "Hospitality": "Exceptional stays and experiences",
  "Fine Dining": "World-renowned culinary excellence",
};

// 3D card tilt effect hook
const use3DTilt = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), springConfig);
  
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
    x.set(normalizedX);
    y.set(normalizedY);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return { rotateX, rotateY, handleMouseMove, handleMouseLeave };
};

const PartnersSection = () => {
  const categories = getCategories();

  return (
    <section id="partners" className="py-28 md:py-40 relative overflow-hidden">
      {/* Premium background gradient */}
      <div className="absolute inset-0 marble-premium" />
      
      {/* Animated gradient orbs */}
      <motion.div
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.08, 0.04, 0.08],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none"
      />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.4) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.4) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="w-20 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto mb-8"
          />
          
          <div className="inline-flex items-center gap-3 mb-6">
            <Sparkles className="w-4 h-4 text-primary/60" />
            <span className="text-xs uppercase tracking-[0.4em] text-primary/80">
              Exclusive Network
            </span>
            <Sparkles className="w-4 h-4 text-primary/60" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-6">
            Our <span className="text-gradient-gold">Partners</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light text-lg leading-relaxed">
            Curated relationships with the world's finest service providers, 
            ensuring exceptional experiences at every touchpoint.
          </p>
        </motion.div>

        {/* Partners Grid - Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category] || Globe;
            const categoryPartners = partnersData.filter(p => p.category === category);
            const description = categoryDescriptions[category] || "Premium services";
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                className="group relative perspective-1000"
              >
                <motion.div 
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative p-8 rounded-3xl border border-border/30 bg-card/40 backdrop-blur-xl transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden"
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Top highlight line */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Icon with animation */}
                  <div className="relative mb-6">
                    <motion.div 
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-500 border border-primary/10"
                    >
                      <Icon className="w-8 h-8 text-primary" />
                    </motion.div>
                    
                    {/* Decorative dots */}
                    <div className="absolute -right-2 -top-2 w-3 h-3 rounded-full bg-primary/20 group-hover:bg-primary/40 transition-colors" />
                    <div className="absolute -right-4 top-0 w-1.5 h-1.5 rounded-full bg-primary/10 group-hover:bg-primary/30 transition-colors" />
                  </div>

                  {/* Category Title */}
                  <h3 className="text-xl font-medium text-foreground mb-2 relative group-hover:text-primary transition-colors duration-300">
                    {category}
                  </h3>
                  
                  {/* Category Description */}
                  <p className="text-sm text-muted-foreground/70 font-light mb-6 relative">
                    {description}
                  </p>

                  {/* Partners List */}
                  <ul className="space-y-3 relative mb-6">
                    {categoryPartners.map((partner, partnerIndex) => (
                      <motion.li 
                        key={partner.id}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + partnerIndex * 0.1 }}
                      >
                        <Link 
                          to={`/partners/${partner.id}`}
                          className="flex items-center w-full text-muted-foreground font-light hover:text-primary hover:bg-primary/5 transition-all duration-300 group/link px-2 py-1.5 rounded-md"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/link:bg-primary group-hover/link:scale-150 transition-all duration-300 mr-3" />
                          <span className="flex-1 text-left text-sm">{partner.name}</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-3 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300 text-primary ml-2" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                  
                  {/* View all button */}
                  <div className="pt-4 border-t border-border/30">
                    <Link 
                      to={`/partners/${categoryPartners[0]?.id || ''}`}
                      className="flex items-center justify-center w-full py-2 px-4 rounded-md border border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-xs uppercase tracking-widest group/explore transition-all duration-300"
                    >
                      <span>Explore {category}</span>
                      <ArrowRight className="w-3 h-3 ml-2 group-hover/explore:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Decorative corner accents */}
                  <div className="absolute top-4 right-4 w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-6 h-px bg-gradient-to-l from-primary/40 to-transparent" />
                    <div className="absolute top-0 right-0 w-px h-6 bg-gradient-to-b from-primary/40 to-transparent" />
                  </div>
                  <div className="absolute bottom-4 left-4 w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-0 left-0 w-6 h-px bg-gradient-to-r from-primary/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-px h-6 bg-gradient-to-t from-primary/40 to-transparent" />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-card/30 backdrop-blur-sm border border-border/30">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-background flex items-center justify-center">
                  <span className="text-[10px] text-primary font-medium">{200 + i * 10}+</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground font-light">
              Access to <span className="text-primary font-medium">200+</span> vetted luxury partners worldwide
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;
