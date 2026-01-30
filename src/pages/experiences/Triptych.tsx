import { motion } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";
import TriptychHero from "@/components/experiences/TriptychHero";
import TriptychTimeline from "@/components/experiences/TriptychTimeline";
import TriptychInquiryForm from "@/components/experiences/TriptychInquiryForm";
import TriptychDeadlineBanner from "@/components/experiences/TriptychDeadlineBanner";
import { ArrowLeft, MapPin, Calendar, Users, Sparkles, Music, UtensilsCrossed, Crown, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const AFFILIATE_CODE = "APC-TRIPTYCH-001";

const accessCategories = [
  {
    name: "EXIMIUS",
    tier: "Category I",
    subtitle: "Essential Immersion",
    description: "Access to the symbolic heart: The Night of Passage and The Gathering of Living Culture",
    icon: Music,
    pricing: { usd: 206000, eur: 169000, gbp: 145000 },
  },
  {
    name: "SINGULARIS",
    tier: "Category II",
    subtitle: "Cultural Depth",
    description: "Enhanced cultural encounters with private gastronomic experiences and curated site visits",
    icon: UtensilsCrossed,
    pricing: { usd: 274000, eur: 226000, gbp: 195000 },
  },
  {
    name: "EGREGIUS",
    tier: "Category III",
    subtitle: "Elevated Access",
    description: "Premium positioning, private styling environment, and exclusive behind-the-scenes access",
    icon: Sparkles,
    pricing: { usd: 342000, eur: 282000, gbp: 239000 },
  },
  {
    name: "UNUM",
    tier: "Category IV",
    subtitle: "Founding Circle",
    description: "Complete immersion with private transfers, dedicated concierge, and founding member status",
    icon: Crown,
    pricing: { usd: 456000, eur: 376000, gbp: 318000 },
  },
];

const Triptych = () => {
  return (
    <>
      <SEOHead
        title="TRIPTYCH | A Restricted Cultural Immersion | Rio de Janeiro"
        description="Between June 19-24, experience an unprecedented symphonic encounter, high-level Brazilian gastronomy, and forms of access never publicly announced. By invitation only."
        type="product"
      />
      
      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest">Back to Aurelia</span>
            </Link>
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary">
              Partner Experience
            </span>
          </div>
        </nav>

        {/* Hero */}
        <TriptychHero />

        {/* Deadline Banner */}
        <TriptychDeadlineBanner />

        {/* Philosophy Section */}
        <section className="py-24 md:py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
          
          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary block mb-6">
                Philosophy
              </span>
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl text-foreground mb-8 leading-relaxed"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Some places are visited.
                <br />
                <span className="text-primary">Others are revealed.</span>
              </h2>
              <p className="text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto text-lg">
                TRIPTYCH is not a journey in the conventional sense. It is a composed passage where time, 
                sound, territory, aesthetics, and human presence are treated as living material. Each moment 
                is designed not as programming, but as atmosphere — unfolding gradually, guiding the guest 
                from the exterior world into a more interior, perceptive state.
              </p>
            </motion.div>
          </div>
        </section>

        {/* The Experience Section */}
        <section className="py-24 md:py-32 px-6 bg-card/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary block mb-4">
                The Experience
              </span>
              <h2 
                className="text-3xl md:text-4xl text-foreground"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Two Symbolic Encounters
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-card/50 border border-border/20 p-8 md:p-10"
              >
                <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center mb-6">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <h3 
                  className="text-2xl text-foreground mb-4"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  The Night of Passage
                </h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  A symphonic encounter created for a single time and context, where contemporary Brazilian 
                  voices meet orchestral language in a work that exists only in that evening's breath. 
                  It is not presented as spectacle, but as suspension — a space where sound becomes transformation.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-card/50 border border-border/20 p-8 md:p-10"
              >
                <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center mb-6">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 
                  className="text-2xl text-foreground mb-4"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  The Gathering of Living Culture
                </h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  An elegant and vibrant Brazilian convergence where music circulates, presence replaces 
                  performance, and culture is not observed from a distance, but lived from within. 
                  A moment of connection, rhythm, and shared presence.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Access Categories */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary block mb-4">
                Access Categories
              </span>
              <h2 
                className="text-3xl md:text-4xl text-foreground mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Four Dimensions of Immersion
              </h2>
              <p className="text-muted-foreground font-light max-w-2xl mx-auto">
                Each category follows its own rhythm and degree of depth, revealing different layers 
                of Brazil's cultural and human landscape.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {accessCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card/30 border border-border/20 p-6 hover:border-primary/30 transition-all duration-500"
                >
                  <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center mb-4 group-hover:border-primary/50 transition-colors">
                    <category.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 
                    className="text-lg text-foreground mb-1"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {category.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    {category.tier}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-primary mb-3">
                    {category.subtitle}
                  </p>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {category.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border/10 space-y-1">
                    <div className="text-lg text-foreground font-light">
                      ${category.pricing.usd.toLocaleString()}
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                      <span>€{category.pricing.eur.toLocaleString()}</span>
                      <span>•</span>
                      <span>£{category.pricing.gbp.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-xs text-muted-foreground mt-8"
            >
              Maximum 50 guests per category • 200 total positions available
            </motion.p>
          </div>
        </section>

        {/* Timeline */}
        <TriptychTimeline />

        {/* Founding Members */}
        <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-card/30 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary block mb-6">
                Beyond Privé Brasilis
              </span>
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl text-foreground mb-8"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Become a Founding Member
              </h2>
              <p className="text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto text-lg mb-8">
                TRIPTYCH marks the inaugural moment of Beyond Privé Brasilis, a highly restricted circle 
                of belonging dedicated to rare cultural access within Brazil. Those present at this first 
                immersion become Founding Members, receiving priority access to future annual experiences 
                shaped under the same philosophy of depth, discretion, and meaning.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Rio de Janeiro, Brazil</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>June 19-24, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>By Application Only</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Inquiry Form */}
        <section className="py-24 md:py-32 px-6 bg-card/20" id="inquiry">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary block mb-4">
                Express Interest
              </span>
              <h2 
                className="text-3xl md:text-4xl text-foreground mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Begin the Conversation
              </h2>
              <p className="text-muted-foreground font-light mb-4">
                Submit your interest and our team will be in touch to discuss access categories and availability.
              </p>
              
              {/* Urgency text */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">
                  <span className="text-primary font-medium">Final deadline:</span> April 30, 2025
                </span>
              </div>
            </motion.div>

            <TriptychInquiryForm affiliateCode={AFFILIATE_CODE} />
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-border/10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-xs text-muted-foreground">
                Presented in partnership with Journeys Beyond Limits
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                A curated experience brought to you by Aurelia Private Concierge
              </p>
            </div>
            <Link 
              to="/"
              className="text-xs uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
            >
              aurelia-privateconcierge.com
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Triptych;
