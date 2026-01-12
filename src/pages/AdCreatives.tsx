import { motion } from "framer-motion";
import { Download, Copy, Check, Linkedin, Instagram, Search } from "lucide-react";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

// Import ad images
import linkedinAd1 from "@/assets/ads/linkedin-ad-1.jpg";
import instagramAd1 from "@/assets/ads/instagram-ad-1.jpg";
import googleAd1 from "@/assets/ads/google-ad-1.jpg";

interface AdCreative {
  id: string;
  platform: "linkedin" | "instagram" | "google";
  image: string;
  headline: string;
  primaryText: string;
  callToAction: string;
  targetAudience: string;
  dimensions: string;
  utmLink: string;
}

const adCreatives: AdCreative[] = [
  {
    id: "linkedin-1",
    platform: "linkedin",
    image: linkedinAd1,
    headline: "Your Time Is Priceless. We Protect It.",
    primaryText: "For those who've built empires, every minute matters. Aurelia is the UK's most exclusive private concierge—handling everything from private aviation to impossible reservations, so you can focus on what truly matters.\n\n✓ 24/7 dedicated liaison\n✓ Bank-grade security\n✓ Membership by invitation only\n\nRequest your private consultation.",
    callToAction: "Learn More",
    targetAudience: "CEOs, Founders, Family Office Principals, PE/VC Partners",
    dimensions: "1200 x 672 (1.91:1)",
    utmLink: "https://aurelia-privateconcierge.com/campaign/ceo?utm_source=linkedin&utm_medium=paid_social&utm_campaign=ceo"
  },
  {
    id: "instagram-1",
    platform: "instagram",
    image: instagramAd1,
    headline: "Access the Inaccessible",
    primaryText: "Impossible tables. Sold-out shows. Last-minute jets.\n\nWhen you're accustomed to the extraordinary, ordinary service won't do.\n\nAurelia is the private concierge trusted by London's most discerning.\n\n🔒 Swiss-bank discretion\n✈️ One call. Any desire. Anywhere.\n\nLink in bio for private consultation.",
    callToAction: "Learn More",
    targetAudience: "UHNW individuals, Athletes, Entertainment industry",
    dimensions: "1080 x 1080 (1:1)",
    utmLink: "https://aurelia-privateconcierge.com/?utm_source=instagram&utm_medium=paid_social&utm_campaign=ig_ads_jan2026"
  },
  {
    id: "google-1",
    platform: "google",
    image: googleAd1,
    headline: "Private Concierge for Those Who Demand Excellence",
    primaryText: "UK's premier luxury concierge service. Private jets, superyachts, exclusive access. Membership by invitation. London • Geneva • Singapore.",
    callToAction: "Request Access",
    targetAudience: "High-intent luxury keywords: private jet charter, luxury concierge, VIP services",
    dimensions: "1200 x 672 (Responsive Display)",
    utmLink: "https://aurelia-privateconcierge.com/?utm_source=google&utm_medium=cpc&utm_campaign=services&utm_term=luxury_concierge_service"
  }
];

const platformIcons = {
  linkedin: Linkedin,
  instagram: Instagram,
  google: Search,
};

const platformColors = {
  linkedin: "bg-[#0A66C2]",
  instagram: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
  google: "bg-[#4285F4]",
};

const AdCreatives = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied to clipboard",
      description: "Ad copy has been copied successfully.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadImage = (imageSrc: string, filename: string) => {
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Download started",
      description: `${filename} is being downloaded.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge variant="outline" className="mb-6">UK-Based Targeting</Badge>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-normal mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Ad Creatives Gallery
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ready-to-use ad creatives for LinkedIn, Instagram, and Google Ads. 
              Download images and copy the text for your campaigns.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Ad Gallery */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="space-y-16">
            {adCreatives.map((ad, index) => {
              const PlatformIcon = platformIcons[ad.platform];
              return (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card/50 border border-border/30 rounded-xl overflow-hidden"
                >
                  {/* Platform Header */}
                  <div className={`${platformColors[ad.platform]} px-6 py-3 flex items-center gap-3`}>
                    <PlatformIcon className="w-5 h-5 text-white" />
                    <span className="text-white font-medium capitalize">{ad.platform} Ad</span>
                    <span className="text-white/70 text-sm ml-auto">{ad.dimensions}</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 p-8">
                    {/* Image Preview */}
                    <div className="space-y-4">
                      <div className="relative group">
                        <img 
                          src={ad.image} 
                          alt={ad.headline}
                          className="w-full rounded-lg border border-border/30"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            onClick={() => downloadImage(ad.image, `aurelia-${ad.id}.jpg`)}
                            variant="secondary"
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download Image
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Hover to download • {ad.dimensions}
                      </p>
                    </div>

                    {/* Ad Copy */}
                    <div className="space-y-6">
                      {/* Headline */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs uppercase tracking-wider text-muted-foreground">Headline</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(ad.headline, `${ad.id}-headline`)}
                            className="h-8 gap-1"
                          >
                            {copiedId === `${ad.id}-headline` ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            Copy
                          </Button>
                        </div>
                        <p className="text-lg font-medium">{ad.headline}</p>
                      </div>

                      {/* Primary Text */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs uppercase tracking-wider text-muted-foreground">Primary Text</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(ad.primaryText, `${ad.id}-text`)}
                            className="h-8 gap-1"
                          >
                            {copiedId === `${ad.id}-text` ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            Copy
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                          {ad.primaryText}
                        </p>
                      </div>

                      {/* CTA */}
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">Call to Action</span>
                        <Badge>{ad.callToAction}</Badge>
                      </div>

                      {/* Target Audience */}
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-2">Target Audience</span>
                        <p className="text-sm text-foreground/80">{ad.targetAudience}</p>
                      </div>

                      {/* UTM Link */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs uppercase tracking-wider text-muted-foreground">Tracking URL</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(ad.utmLink, `${ad.id}-url`)}
                            className="h-8 gap-1"
                          >
                            {copiedId === `${ad.id}-url` ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            Copy
                          </Button>
                        </div>
                        <code className="text-xs text-primary/80 bg-primary/10 px-3 py-2 rounded block overflow-x-auto">
                          {ad.utmLink}
                        </code>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-16 bg-card/30 border-y border-border/20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 
            className="text-2xl font-normal mb-8 text-center"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Campaign Best Practices
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <Linkedin className="w-8 h-8 text-[#0A66C2] mx-auto mb-4" />
              <h3 className="font-medium mb-2">LinkedIn</h3>
              <p className="text-sm text-muted-foreground">
                Target by job title, company size, and seniority. Minimum £10/day budget recommended.
              </p>
            </div>
            <div className="text-center p-6">
              <Instagram className="w-8 h-8 text-[#E4405F] mx-auto mb-4" />
              <h3 className="font-medium mb-2">Instagram</h3>
              <p className="text-sm text-muted-foreground">
                Use interest targeting for luxury, travel, and high-net-worth audiences. Stories perform well.
              </p>
            </div>
            <div className="text-center p-6">
              <Search className="w-8 h-8 text-[#4285F4] mx-auto mb-4" />
              <h3 className="font-medium mb-2">Google Ads</h3>
              <p className="text-sm text-muted-foreground">
                Target high-intent keywords like "private concierge London" and "luxury lifestyle management".
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdCreatives;
