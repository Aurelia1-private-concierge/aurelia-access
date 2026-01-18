import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getPartnerById, getPartnersByCategory } from "@/lib/partners-data";

const PartnerDetail = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const partner = partnerId ? getPartnerById(partnerId) : undefined;

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
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link to="/#partners" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Partners
            </Link>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <Badge variant="outline" className="mb-2 border-primary/30 text-primary">
                  {partner.category}
                </Badge>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-2">
                  {partner.name}
                </h1>
                <p className="text-lg text-primary font-light">{partner.specialty}</p>
              </div>
            </div>
            
            <p className="text-muted-foreground text-lg font-light max-w-3xl leading-relaxed">
              {partner.description}
            </p>
          </motion.div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm"
            >
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Services
              </h3>
              <ul className="space-y-3">
                {partner.services.map((service) => (
                  <li key={service} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary/60" />
                    {service}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Regions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm"
            >
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Coverage
              </h3>
              <ul className="space-y-3">
                {partner.regions.map((region) => (
                  <li key={region} className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    {region}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm"
            >
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Highlights
              </h3>
              <ul className="space-y-3">
                {partner.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mb-16"
          >
            <h3 className="text-2xl font-light text-foreground mb-3">
              Ready to experience {partner.name}?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Contact your Aurelia concierge to arrange services through our preferred partner network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button className="bg-primary hover:bg-primary/90">
                  Contact Concierge
                </Button>
              </Link>
              <Link to="/orla">
                <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                  Speak with Orla
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Related Partners */}
          {relatedPartners.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-xl font-light text-foreground mb-6">
                More in {partner.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPartners.slice(0, 3).map((related) => {
                  const RelatedIcon = related.icon;
                  return (
                    <Link
                      key={related.id}
                      to={`/partners/${related.id}`}
                      className="group p-6 rounded-2xl border border-border/50 bg-card/30 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <RelatedIcon className="w-5 h-5 text-primary" />
                        </div>
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {related.name}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {related.specialty}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PartnerDetail;
