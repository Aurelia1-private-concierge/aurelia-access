import { motion } from "framer-motion";
import {
  Crown,
  Globe,
  Users,
  Target,
  Sparkles,
  Building2,
  Plane,
  Gem,
  Wine,
  Palette,
  Copy,
  Check,
  ExternalLink,
  Instagram,
  Linkedin,
  Facebook,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface CopyBlock {
  platform: string;
  title: string;
  content: string;
  hashtags?: string[];
  cta?: string;
}

const advertisingCopy: Record<string, CopyBlock[]> = {
  social: [
    {
      platform: "Instagram",
      title: "Story/Reel Hook",
      content: "What does it feel like to have the impossible become routine?\n\nAurelia is the world's first AI-powered private concierge—reserved for those who value time above all.\n\nPrivate jets at 3am. Sold-out shows. Off-market estates.\n\nThe waitlist is now open.",
      hashtags: ["#Aurelia", "#PrivateConcierge", "#LuxuryLifestyle", "#UHNW", "#ExclusiveAccess"],
      cta: "Link in bio →",
    },
    {
      platform: "Instagram",
      title: "Feed Post - Aspirational",
      content: "Some doors only open for a select few.\n\nAurelia is not just a concierge service—it's your personal gateway to the extraordinary.\n\n✈️ Private aviation on demand\n🛥️ Superyacht charters worldwide\n🏛️ Off-market real estate\n🎭 Impossible reservations made possible\n\nJoin 2,400+ individuals on the waitlist.",
      hashtags: ["#Aurelia", "#BespokeLuxury", "#ConciergeService", "#EliteLifestyle"],
    },
    {
      platform: "LinkedIn",
      title: "Professional Network",
      content: "I'm excited to announce that I've joined the waitlist for Aurelia—an AI-powered private concierge service designed for high-net-worth individuals who value discretion and excellence.\n\nIn a world where time is the ultimate luxury, having a dedicated team (powered by cutting-edge AI) to handle everything from private aviation to exclusive property acquisitions is a game-changer.\n\nCurrently accepting applications for founding members. Worth exploring if you appreciate white-glove service at scale.",
    },
    {
      platform: "X (Twitter)",
      title: "Thread Hook",
      content: "The wealthy don't wait in lines.\nThey don't refresh for tickets.\nThey don't negotiate.\n\nThey have Aurelia.\n\n🧵 A thread on why the smartest concierge service I've seen is about to change luxury forever →",
    },
  ],
  uhnwi: [
    {
      platform: "Family Office Networks",
      title: "Investment-Focused",
      content: "Dear [Name],\n\nI wanted to personally bring to your attention a service that's garnered significant interest within our network.\n\nAurelia is a private concierge platform combining AI efficiency with human expertise, specifically designed for UHNW families. Their offering includes:\n\n• Coordinated lifestyle management integrated with family office operations\n• Real estate and art acquisition support\n• 24/7 global coverage across 40+ countries\n• Bank-grade security and discretion protocols\n\nThe founding membership tier offers preferential terms and priority access. Given your family's interests in [specific area], I thought this might align well.\n\nWould you be open to a brief introduction?",
    },
    {
      platform: "Private Banking Referral",
      title: "Partner Introduction",
      content: "Subject: Exclusive Partnership - Aurelia Private Concierge\n\nDear Relationship Manager,\n\nWe're selectively partnering with premier private banks to offer Aurelia's services to your most discerning clients.\n\nAurelia provides:\n• Bespoke travel and aviation coordination\n• Exclusive event and experience access\n• Real estate and collectibles acquisition\n• Complete lifestyle management\n\nAs a banking partner, your clients would receive:\n• Waived initiation fees (normally £15,000)\n• Preferential monthly rates\n• Dedicated account management\n• White-label integration options\n\nI'd welcome the opportunity to present a detailed proposal.",
    },
    {
      platform: "Luxury Events",
      title: "Gala/Conference Introduction",
      content: "Aurelia - Private Concierge for the Discerning Few\n\nIn a world of infinite options, the truly privileged seek simplicity.\n\nAurelia combines the discretion of a private secretary, the reach of a global network, and the intelligence of advanced AI—all dedicated to a single purpose: making the extraordinary effortless.\n\n• Access: Private aviation, superyachts, off-market properties\n• Excellence: Michelin-starred reservations, sold-out events, VIP experiences\n• Discretion: Bank-grade security, complete privacy\n\nFounder applications now open.\naurelia-privateconcierge.com",
    },
  ],
  channels: [
    {
      platform: "Wealth-X / Altrata",
      title: "Data-Driven Targeting",
      content: "Target: UHNW individuals ($30M+ net worth)\nInterests: Private aviation, yachting, fine art, luxury real estate\nGeographies: London, Geneva, Singapore, Monaco, Dubai\nBehaviors: Recent property acquisitions, art auction participation",
    },
    {
      platform: "Private Jet FBOs",
      title: "Physical Placement",
      content: "Premium lounges at: Signature Aviation, Jet Aviation, NetJets terminals\nCollateral: Discrete brochures, QR code cards, concierge desk partnerships\nPersona: Business owners, C-suite executives, family principals",
    },
    {
      platform: "Art & Auction Houses",
      title: "Cultural Institutions",
      content: "Partners: Christie's, Sotheby's, Phillips private client events\nGalleries: Gagosian, White Cube, Hauser & Wirth\nFairs: Art Basel, Frieze, TEFAF\nApproach: Sponsor receptions, VIP preview access partnerships",
    },
    {
      platform: "Luxury Publications",
      title: "Editorial & Advertorial",
      content: "Targets: Robb Report, Financial Times How To Spend It, Monocle, Departures\nContent: Founder profiles, service deep-dives, lifestyle integrations\nFormats: Native advertising, sponsored content, print inserts",
    },
  ],
};

const MarketingHub = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast({ title: "Copied!", description: "Content copied to clipboard" });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const networkChannels = [
    { name: "Family Offices", icon: Building2, description: "Direct outreach to single/multi-family offices" },
    { name: "Private Banks", icon: Crown, description: "UBS, Credit Suisse, Coutts partnerships" },
    { name: "Aviation Networks", icon: Plane, description: "NetJets, VistaJet member communities" },
    { name: "Art Collectors", icon: Palette, description: "Auction house client databases" },
    { name: "Wine & Spirits", icon: Wine, description: "Cult wine allocation lists, whisky societies" },
    { name: "Jewelry & Watches", icon: Gem, description: "High jewelry brand clientele" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-6 py-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            <Sparkles className="w-3 h-3 mr-1" />
            Marketing Hub
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
            UHNWI Advertising Strategy
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ready-to-use copy, channel strategies, and network partnerships for reaching 
            ultra-high-net-worth individuals globally.
          </p>
        </motion.div>

        {/* Target Networks */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl text-foreground mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Target Networks
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {networkChannels.map((channel, index) => (
              <motion.div
                key={channel.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-card/50 border-border/30 h-full hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="p-3 rounded-lg bg-primary/10 w-fit mb-3">
                      <channel.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-medium text-foreground mb-1">{channel.name}</h3>
                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Copy Library */}
        <Tabs defaultValue="social" className="space-y-6">
          <TabsList className="bg-card border border-border/50">
            <TabsTrigger value="social" className="gap-2">
              <Instagram className="w-4 h-4" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="uhnwi" className="gap-2">
              <Crown className="w-4 h-4" />
              UHNWI Outreach
            </TabsTrigger>
            <TabsTrigger value="channels" className="gap-2">
              <Globe className="w-4 h-4" />
              Channel Strategy
            </TabsTrigger>
          </TabsList>

          {Object.entries(advertisingCopy).map(([key, blocks]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="grid gap-4">
                {blocks.map((block, index) => (
                  <motion.div
                    key={`${block.platform}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-card/50 border-border/30">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {block.platform}
                            </Badge>
                            <CardTitle className="text-lg">{block.title}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(block.content, `${key}-${index}`)}
                          >
                            {copiedId === `${key}-${index}` ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans bg-muted/30 p-4 rounded-lg">
                          {block.content}
                        </pre>
                        {block.hashtags && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {block.hashtags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {block.cta && (
                          <p className="mt-4 text-sm font-medium text-primary">{block.cta}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Links */}
        <section className="mt-16">
          <h2 className="font-serif text-2xl text-foreground mb-6">Campaign Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/30">
              <CardContent className="pt-6">
                <Instagram className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-medium text-foreground mb-2">Instagram</h3>
                <code className="text-xs text-muted-foreground break-all">
                  {window.location.origin}/?utm_source=instagram&utm_medium=social
                </code>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/30">
              <CardContent className="pt-6">
                <Linkedin className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-medium text-foreground mb-2">LinkedIn</h3>
                <code className="text-xs text-muted-foreground break-all">
                  {window.location.origin}/?utm_source=linkedin&utm_medium=social
                </code>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/30">
              <CardContent className="pt-6">
                <Facebook className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-medium text-foreground mb-2">Facebook</h3>
                <code className="text-xs text-muted-foreground break-all">
                  {window.location.origin}/?utm_source=facebook&utm_medium=social
                </code>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MarketingHub;
