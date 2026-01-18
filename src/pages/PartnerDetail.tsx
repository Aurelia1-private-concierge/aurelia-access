import { useParams, Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Star, CheckCircle, ArrowRight, Sparkles, Shield, Globe2, Play, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getPartnerById, getPartnersByCategory } from "@/lib/partners-data";
import { getPartnerSEO, generatePartnerSchema, generateBreadcrumbSchema, generatePartnerFAQSchema } from "@/lib/partner-seo";
import { useRef, useState, useEffect } from "react";

const PartnerDetail = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const partner = partnerId ? getPartnerById(partnerId) : undefined;
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const heroOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.5], [1, 1.15]);
  const textY = useTransform(smoothProgress, [0, 0.5], [0, 80]);
  const overlayOpacity = useTransform(smoothProgress, [0, 0.4], [0.4, 0.9]);

  // SEO: Update meta tags and structured data
  useEffect(() => {
    if (!partner || !partnerId) return;

    const seo = getPartnerSEO(partnerId, {
      name: partner.name,
      category: partner.category,
      tagline: partner.tagline,
      description: partner.description
    });

    // Update document title
    document.title = seo.title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', seo.metaDescription);
    }

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', seo.keywords.join(', '));
    } else {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      metaKeywords.setAttribute('content', seo.keywords.join(', '));
      document.head.appendChild(metaKeywords);
    }

    // Update Open Graph tags
    const updateOG = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      }
    };
    updateOG('og:title', seo.title);
    updateOG('og:description', seo.metaDescription);
    updateOG('og:url', `https://aurelia-privateconcierge.com${seo.canonicalPath}`);
    updateOG('og:image', partner.heroImage);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://aurelia-privateconcierge.com${seo.canonicalPath}`);
    }

    // Inject structured data
    const existingSchemas = document.querySelectorAll('script[data-partner-schema]');
    existingSchemas.forEach(el => el.remove());

    // Partner schema
    const partnerSchema = generatePartnerSchema(partnerId, {
      name: partner.name,
      description: partner.description,
      specialty: partner.specialty,
      services: partner.services,
      regions: partner.regions,
      stats: partner.stats,
      heroImage: partner.heroImage
    });
    if (partnerSchema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-partner-schema', 'main');
      script.textContent = JSON.stringify(partnerSchema);
      document.head.appendChild(script);
    }

    // Breadcrumb schema
    const breadcrumbSchema = generateBreadcrumbSchema(partnerId, partner.name);
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-partner-schema', 'breadcrumb');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    // FAQ schema
    const faqSchema = generatePartnerFAQSchema(partnerId, partner.name, partner.category);
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.setAttribute('data-partner-schema', 'faq');
    faqScript.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    // Cleanup on unmount
    return () => {
      const schemas = document.querySelectorAll('script[data-partner-schema]');
      schemas.forEach(el => el.remove());
    };
  }, [partner, partnerId]);

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
        {/* Background Video/Image with Parallax */}
        <motion.div 
          style={{ scale: heroScale }}
          className="absolute inset-0"
        >
          {partner.heroVideo ? (
            <>
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                poster={partner.heroImage}
              >
                <source src={partner.heroVideo} type="video/mp4" />
              </video>
              {/* Video play indicator */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                className="absolute bottom-8 right-8 z-30 w-12 h-12 rounded-full bg-background/30 backdrop-blur-md border border-primary/20 flex items-center justify-center hover:bg-background/50 transition-all group"
              >
                <Play className={`w-5 h-5 text-primary transition-transform ${isVideoPlaying ? 'opacity-50' : ''}`} fill={isVideoPlaying ? 'currentColor' : 'none'} />
              </motion.button>
            </>
          ) : (
            <img 
              src={partner.heroImage}
              alt={partner.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {/* Sophisticated Gradient Overlays */}
          <motion.div 
            style={{ opacity: overlayOpacity }}
            className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
          
          {/* Film grain effect */}
          <div className="absolute inset-0 film-grain pointer-events-none" />
        </motion.div>
        
        {/* Floating Particles Effect - Enhanced */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: `radial-gradient(circle, hsl(var(--primary) / ${0.3 + Math.random() * 0.4}), transparent)`,
              }}
              animate={{
                y: [-30, 30],
                x: [-10, 10],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-40 h-40 z-20 pointer-events-none">
          <div className="absolute top-8 left-8 w-px h-16 bg-gradient-to-b from-primary/40 to-transparent" />
          <div className="absolute top-8 left-8 w-16 h-px bg-gradient-to-r from-primary/40 to-transparent" />
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 z-20 pointer-events-none">
          <div className="absolute top-8 right-8 w-px h-16 bg-gradient-to-b from-primary/40 to-transparent" />
          <div className="absolute top-8 right-8 w-16 h-px bg-gradient-to-l from-primary/40 to-transparent" />
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

              {/* Interactive Gallery Grid */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                {/* Main featured image */}
                <motion.div
                  key={activeGalleryIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative aspect-[16/10] overflow-hidden rounded-3xl"
                >
                  <img
                    src={partner.galleryImages[activeGalleryIndex]}
                    alt={`${partner.name} gallery ${activeGalleryIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  
                  {/* Image counter */}
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-md border border-primary/20">
                    <span className="text-xs font-medium text-primary">
                      {activeGalleryIndex + 1} / {partner.galleryImages.length}
                    </span>
                  </div>
                </motion.div>
                
                {/* Thumbnail strip */}
                <div className="grid grid-cols-4 gap-3">
                  {partner.galleryImages.map((img, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setActiveGalleryIndex(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative aspect-square overflow-hidden rounded-xl transition-all duration-300 ${
                        index === activeGalleryIndex 
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${partner.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === activeGalleryIndex && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className="absolute inset-0 bg-primary/10"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
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
          
          {/* Animated gradient orbs */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.15, 0.1, 0.15],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          />

          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative max-w-4xl mx-auto text-center"
            >
              {/* Glowing Orb */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" 
              />
              
              <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 mb-8 border border-primary/20"
                >
                  <Icon className="w-12 h-12 text-primary" />
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-foreground mb-6 leading-tight">
                  Ready to Experience <br />
                  <span className="text-gradient-gold">{partner.name}</span>?
                </h2>
                
                <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto font-light">
                  Contact your Aurelia concierge to arrange exclusive services through our preferred partner network.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 min-w-[220px] h-16 text-base group btn-luxury gold-glow-hover">
                      <Phone className="w-5 h-5 mr-3" />
                      Contact Concierge
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/orla">
                    <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 min-w-[220px] h-16 text-base group">
                      <Sparkles className="w-5 h-5 mr-3" />
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