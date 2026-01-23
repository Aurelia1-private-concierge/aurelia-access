import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { 
  Plane, Anchor, Building2, Gem, Ticket, Shield, 
  UtensilsCrossed, Compass, Heart, ShoppingBag, ArrowRight
} from "lucide-react";

const categories = [
  { icon: Plane, name: "Private Aviation", href: "/services#aviation", video: null },
  { icon: Anchor, name: "Yacht Charter", href: "/services#yachts", video: null },
  { icon: Building2, name: "Real Estate", href: "/services#realestate", video: null },
  { icon: Gem, name: "Collectibles", href: "/services#collectibles", video: null },
  { icon: Ticket, name: "VIP Access", href: "/services#events", video: null },
  { icon: Shield, name: "Security", href: "/services#security", video: null },
  { icon: UtensilsCrossed, name: "Fine Dining", href: "/services#dining", video: null },
  { icon: Compass, name: "Travel", href: "/services#travel", video: null },
  { icon: Heart, name: "Wellness", href: "/services#wellness", video: null },
  { icon: ShoppingBag, name: "Shopping", href: "/services#shopping", video: null },
];

// 3D Card component with perspective hover
const ServiceCard3D = ({ 
  category, 
  index 
}: { 
  category: typeof categories[0]; 
  index: number;
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -8;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      style={{ perspective: "1000px" }}
    >
      <Link
        ref={cardRef}
        to={category.href}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="group relative flex flex-col items-center p-6 md:p-8 bg-card/30 border border-border/10 transition-all duration-300 h-full text-center"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) ${isHovered ? 'translateZ(20px)' : 'translateZ(0)'}`,
          transformStyle: "preserve-3d",
          transition: "transform 0.15s ease-out",
          boxShadow: isHovered 
            ? "0 25px 50px -12px rgba(212, 175, 55, 0.15), 0 0 0 1px rgba(212, 175, 55, 0.1)" 
            : "none",
        }}
      >
        {/* Highlight gradient on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.08) 0%, transparent 70%)",
          }}
        />
        
        {/* Icon container with animated ring */}
        <div className="relative w-12 h-12 flex items-center justify-center mb-4" style={{ transform: "translateZ(30px)" }}>
          {/* Animated ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/0 group-hover:border-primary/40"
            animate={isHovered ? { scale: [1, 1.3, 1.3], opacity: [0, 0.5, 0] } : {}}
            transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
          />
          
          {/* Static ring */}
          <div className="absolute inset-0 rounded-full border border-border/20 group-hover:border-primary/30 transition-all duration-500" />
          
          {/* Icon with animation */}
          <motion.div
            animate={isHovered ? { 
              rotate: category.icon === Plane ? [0, -10, 10, 0] : 
                      category.icon === Anchor ? [0, -5, 5, 0] : 0,
              scale: isHovered ? 1.1 : 1,
            } : { rotate: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <category.icon 
              className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-500" 
              strokeWidth={1.5} 
            />
          </motion.div>
        </div>
        
        {/* Service name */}
        <span 
          className="text-xs text-foreground/80 group-hover:text-foreground transition-colors duration-300"
          style={{ transform: "translateZ(20px)" }}
        >
          {category.name}
        </span>
        
        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
          initial={{ width: 0 }}
          animate={{ width: isHovered ? "60%" : 0 }}
          transition={{ duration: 0.3 }}
        />
      </Link>
    </motion.div>
  );
};

const ServiceCategoriesSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      id="services" 
      data-tour="service-categories" 
      className="py-24 md:py-32 bg-background relative"
      aria-labelledby="services-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-4">
            Our Services
          </span>
          <h2 
            id="services-heading"
            className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Curated Excellence
          </h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">
            Every aspect of luxury living, curated by experts who understand your world.
          </p>
        </motion.div>

        {/* Categories Grid with 3D cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6" role="list">
          {categories.map((category, index) => (
            <div key={category.name} role="listitem">
              <ServiceCard3D category={category} index={index} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 group"
          >
            Explore All Services
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceCategoriesSection;
