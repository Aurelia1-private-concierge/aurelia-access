import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  CheckCircle2, 
  Globe, 
  Mail, 
  ExternalLink, 
  Plane, 
  Ship, 
  Home, 
  Gem, 
  Shield, 
  ShoppingBag,
  Loader2,
  Star,
  ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Partner {
  id: string;
  company_name: string;
  categories: string[];
  description: string | null;
  website: string | null;
  logo_url: string | null;
  email: string | null;
}

const categoryIcons: Record<string, React.ReactNode> = {
  private_aviation: <Plane className="w-4 h-4" />,
  yacht_charter: <Ship className="w-4 h-4" />,
  real_estate: <Home className="w-4 h-4" />,
  collectibles: <Gem className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
};

const categoryLabels: Record<string, string> = {
  private_aviation: "Aviation",
  yacht_charter: "Yacht",
  real_estate: "Real Estate",
  collectibles: "Collectibles",
  security: "Security",
  shopping: "Shopping",
  events_access: "Events",
  dining: "Dining",
  wellness: "Wellness",
  travel: "Travel",
  chauffeur: "Chauffeur",
};

interface VettedPartnersSectionProps {
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
  onContactClick?: (partner: Partner) => void;
}

const VettedPartnersSection: React.FC<VettedPartnersSectionProps> = ({
  limit = 6,
  showHeader = true,
  compact = false,
  onContactClick
}) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, [limit]);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("id, company_name, categories, description, website, logo_url, email")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className={compact ? "py-8" : "py-16"}>
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Vetted & Verified
          </Badge>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
            Our <span className="text-primary italic">Trusted</span> Partners
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each partner has been carefully vetted to ensure they meet our exceptional standards for luxury service.
          </p>
        </motion.div>
      )}

      <div className={`grid gap-6 ${compact ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"}`}>
        {partners.map((partner, index) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <Card className="h-full group hover:border-primary/30 transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={partner.company_name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">
                        {partner.company_name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Partner</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                </div>

                {/* Categories */}
                {partner.categories && partner.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {partner.categories.slice(0, 3).map((cat, i) => (
                      <Badge key={i} variant="secondary" className="text-xs gap-1">
                        {categoryIcons[cat]}
                        {categoryLabels[cat] || cat.replace("_", " ")}
                      </Badge>
                    ))}
                    {partner.categories.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{partner.categories.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Description */}
                {partner.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {partner.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                  {partner.website && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => window.open(partner.website!, "_blank")}
                    >
                      <Globe className="w-4 h-4 mr-1" />
                      Website
                    </Button>
                  )}
                  {onContactClick && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10 ml-auto"
                      onClick={() => onContactClick(partner)}
                    >
                      Contact
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default VettedPartnersSection;
