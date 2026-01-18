import { useParams, Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Star, CheckCircle, ArrowRight, Sparkles, Shield, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getPartnerById, getPartnersByCategory } from "@/lib/partners-data";
import { useRef } from "react";

const PartnerDetail = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const partner = partnerId ? getPartnerById(partnerId) : undefined;
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-foreground mb-4">Partner Not Found</h1>
          <Link to="/#partners">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Partners
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedPartners = getPartnersByCategory(partner.category).filter(p => p.id !== partner.id);
  const Icon = partner.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Immersive Hero Section */}
      <div ref={heroRef} className="relative h-[100vh] overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div 
          style={{ scale: heroScale }}
          className="absolute inset-0"
        >
          <img 
            src={partner.heroImage}
            alt={partner.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Sophisticated Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
        </motion.div>
        
        {/* Floating Particles Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div 
          style={{ opacity: heroOpacity, y: textY }}
          className="relative h-full flex items-center"
        >
          <div className="container mx-auto px-4 lg:px-8">
            {/* Back Link */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Link 
                to="/#partners" 
                className="inline-flex items-center text-foreground/70 hover:text-primary transition-all duration-300 group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm tracking-widest uppercase">Back to Partners</span>
              </Link>
            </motion.div>

            <div className="max-w-4xl">
              {/* Category Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 backdrop-blur-sm text-xs tracking-widest uppercase px-4 py-1.5">
                  {partner.category}
                </Badge>
              </motion.div>

              {/* Partner Name */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-7xl lg:text-8xl font-extralight text-foreground mb-4 tracking-tight"
              >
                {partner.name}
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-2xl md:text-3xl font-light text-primary mb-8 italic"
              >
                "{partner.tagline}"
              </motion.p>

              {/* Specialty */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg text-foreground/70 max-w-2xl leading-relaxed font-light"
              >
                {partner.specialty}
              </motion.p>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-wrap gap-8 mt-12"
              >
                {partner.stats.map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className="text-3xl md:text-4xl font-light text-primary mb-1"
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-xs text-foreground/50 uppercase tracking-widest">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-foreground/50 uppercase tracking-widest">Scroll to Explore</span>
            <div className="w-px h-12 bg-gradient-to-b from-primary/50 to-transparent" />
          </motion.div>
        </motion.div>
      </div>

      <main className="relative bg-background">
        {/* Description Section */}
        <section className="py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                </div>
                <h2 className="text-4xl md:text-5xl font-extralight text-foreground mb-8 leading-tight">
                  Excellence <br />
                  <span className="text-primary">Redefined</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-light mb-8">
                  {partner.description}
                </p>
                <div className="flex items-center gap-4">
                  <Link to="/contact">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 group">
                      Request Service
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/orla">
                    <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10">
                      Speak with Orla
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Gallery Grid */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-2 gap-4"
              >
                {partner.galleryImages.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative overflow-hidden rounded-2xl ${
                      index === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${partner.name} gallery ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services & Details Grid */}
        <section className="py-24 bg-gradient-to-b from-background via-primary/5 to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-extralight text-foreground mb-4">
                Exceptional <span className="text-primary">Services</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto font-light">
                Curated offerings designed for the most discerning clientele
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Services Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group p-8 rounded-3xl border border-border/30 bg-card/30 backdrop-blur-xl hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-6">Services</h3>
                <ul className="space-y-4">
                  {partner.services.map((service) => (
                    <li key={service} className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground/80 transition-colors">
                      <CheckCircle className="w-5 h-5 text-primary/60 flex-shrink-0" />
                      <span className="font-light">{service}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Regions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="group p-8 rounded-3xl border border-border/30 bg-card/30 backdrop-blur-xl hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-6">Global Coverage</h3>
                <ul className="space-y-4">
                  {partner.regions.map((region) => (
                    <li key={region} className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground/80 transition-colors">
                      <MapPin className="w-5 h-5 text-primary/60 flex-shrink-0" />
                      <span className="font-light">{region}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Highlights Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="group p-8 rounded-3xl border border-border/30 bg-card/30 backdrop-blur-xl hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 md:col-span-2 lg:col-span-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-6">Aurelia Exclusive</h3>
                <ul className="space-y-4">
                  {partner.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3 text-muted-foreground group-hover:text-foreground/80 transition-colors">
                      <Star className="w-5 h-5 text-primary/60 flex-shrink-0 mt-0.5" />
                      <span className="font-light">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Premium CTA Section */}
        <section className="py-32 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative max-w-4xl mx-auto text-center"
            >
              {/* Glowing Orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-8">
                  <Icon className="w-10 h-10 text-primary" />
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-foreground mb-6 leading-tight">
                  Ready to Experience <br />
                  <span className="text-primary">{partner.name}</span>?
                </h2>
                
                <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto font-light">
                  Contact your Aurelia concierge to arrange exclusive services through our preferred partner network.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 min-w-[200px] h-14 text-base group">
                      Contact Concierge
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/orla">
                    <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 min-w-[200px] h-14 text-base">
                      Speak with Orla AI
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Related Partners */}
        {relatedPartners.length > 0 && (
          <section className="py-24 bg-gradient-to-b from-background to-primary/5">
            <div className="container mx-auto px-4 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-between mb-12"
              >
                <div>
                  <h3 className="text-2xl md:text-3xl font-extralight text-foreground mb-2">
                    More in <span className="text-primary">{partner.category}</span>
                  </h3>
                  <p className="text-muted-foreground font-light">Discover other exceptional partners</p>
                </div>
                <Link to="/#partners" className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group">
                  <span className="text-sm uppercase tracking-widest">View All</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPartners.slice(0, 3).map((related, index) => {
                  const RelatedIcon = related.icon;
                  return (
                    <motion.div
                      key={related.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Link
                        to={`/partners/${related.id}`}
                        className="group block relative overflow-hidden rounded-3xl border border-border/30 bg-card/30 backdrop-blur-xl hover:border-primary/30 transition-all duration-500"
                      >
                        {/* Image */}
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={related.heroImage}
                            alt={related.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                        </div>
                        
                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <RelatedIcon className="w-5 h-5 text-primary" />
                            </div>
                            <h4 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors">
                              {related.name}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 font-light mb-4">
                            {related.tagline}
                          </p>
                          <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                            <span>Explore</span>
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PartnerDetail;