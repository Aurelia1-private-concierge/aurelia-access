import { motion } from "framer-motion";
import { 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Palette, 
  Type, 
  Image as ImageIcon,
  MessageSquare,
  Star,
  Shield,
  Globe,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const MediaKit = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(label);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const brandColors = [
    { name: "Aurelia Gold", hex: "#D4AF37", hsl: "43, 74%, 52%", usage: "Primary accent, CTAs, highlights" },
    { name: "Deep Black", hex: "#0A0A0A", hsl: "0, 0%, 4%", usage: "Primary background" },
    { name: "Ivory White", hex: "#F5F5F0", hsl: "60, 20%, 96%", usage: "Primary text, headings" },
    { name: "Muted Silver", hex: "#888888", hsl: "0, 0%, 53%", usage: "Secondary text, borders" },
    { name: "Charcoal", hex: "#1A1A1A", hsl: "0, 0%, 10%", usage: "Card backgrounds, sections" },
  ];

  const typography = {
    primary: "Playfair Display",
    secondary: "Inter",
    weights: ["300 Light", "400 Regular", "500 Medium", "600 SemiBold", "700 Bold"],
  };

  const keyMessages = [
    {
      title: "Elevator Pitch",
      content: "Aurelia is the world's first AI-powered private concierge for Ultra High Net Worth individuals, combining cutting-edge technology with white-glove luxury service."
    },
    {
      title: "Value Proposition",
      content: "Experience 24/7 availability, instant response times, and personalized service that learns your preferences — all with bank-grade security and complete discretion."
    },
    {
      title: "Mission Statement",
      content: "To redefine luxury service by seamlessly blending artificial intelligence with human expertise, delivering extraordinary experiences to those who expect nothing less."
    }
  ];

  const boilerplate = `Aurelia is the premier AI-powered private concierge service designed exclusively for Ultra High Net Worth individuals. Founded in 2024 and headquartered in London with presence in Geneva and Singapore, Aurelia combines sophisticated artificial intelligence with world-class human expertise to deliver extraordinary lifestyle management.

Through its proprietary AI assistant, Orla, Aurelia provides 24/7 access to private aviation, yacht charters, off-market real estate, exclusive events, and bespoke experiences worldwide. With bank-grade security and a commitment to absolute discretion, Aurelia serves discerning clients who demand excellence in every interaction.

For more information, visit aurelia-privateconcierge.com`;

  const facts = [
    { label: "Founded", value: "2024" },
    { label: "Headquarters", value: "London, UK" },
    { label: "Global Presence", value: "Geneva • London • Singapore" },
    { label: "AI Assistant", value: "Orla" },
    { label: "Service Categories", value: "11+" },
    { label: "Security", value: "Bank-Grade Encryption" },
  ];

  const socialHandles = [
    { platform: "Website", handle: "aurelia-privateconcierge.com" },
    { platform: "Email", handle: "press@aurelia-privateconcierge.com" },
    { platform: "LinkedIn", handle: "@AureliaPrivateConcierge" },
    { platform: "Instagram", handle: "@aurelia.concierge" },
    { platform: "Twitter/X", handle: "@AureliaConcierge" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="text-primary text-sm tracking-[0.3em] uppercase mb-4 block">
                Press & Partners
              </span>
              <h1 className="text-4xl md:text-5xl font-light text-foreground mb-6">
                Media Kit
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Everything you need to tell the Aurelia story — brand assets, messaging guidelines, and key information for press and partners.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4">
          <Tabs defaultValue="brand" className="space-y-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-transparent h-auto p-0">
              {[
                { value: "brand", label: "Brand Guidelines", icon: Palette },
                { value: "messaging", label: "Key Messaging", icon: MessageSquare },
                { value: "assets", label: "Logo Assets", icon: ImageIcon },
                { value: "press", label: "Press Info", icon: FileText },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/30 border border-border/30 rounded-lg py-3 px-4"
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Brand Guidelines */}
            <TabsContent value="brand" className="space-y-8">
              {/* Colors */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Color Palette
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {brandColors.map((color) => (
                      <div 
                        key={color.name}
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/20 border border-border/20"
                      >
                        <div 
                          className="w-16 h-16 rounded-lg border border-border/30 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground">{color.name}</h4>
                          <p className="text-sm text-muted-foreground">{color.usage}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(color.hex, `${color.name} HEX`)}
                          >
                            {copiedItem === `${color.name} HEX` ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                            {color.hex}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Typography */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" />
                    Typography
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-lg bg-muted/20 border border-border/20">
                      <h4 className="text-sm text-muted-foreground mb-2">Primary Font</h4>
                      <p className="text-3xl font-serif text-foreground">{typography.primary}</p>
                      <p className="text-sm text-muted-foreground mt-2">Headlines, titles, emphasis</p>
                    </div>
                    <div className="p-6 rounded-lg bg-muted/20 border border-border/20">
                      <h4 className="text-sm text-muted-foreground mb-2">Secondary Font</h4>
                      <p className="text-3xl text-foreground">{typography.secondary}</p>
                      <p className="text-sm text-muted-foreground mt-2">Body text, UI elements</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {typography.weights.map((weight) => (
                      <span 
                        key={weight}
                        className="px-3 py-1.5 rounded-full bg-muted/30 text-sm text-muted-foreground"
                      >
                        {weight}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Voice & Tone */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Voice & Tone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { trait: "Sophisticated", desc: "Refined language, never casual or slang" },
                      { trait: "Warm", desc: "Approachable while maintaining elegance" },
                      { trait: "Discreet", desc: "Understated, never boastful or flashy" },
                      { trait: "Confident", desc: "Authoritative without being arrogant" },
                      { trait: "Personal", desc: "Direct address, individualized attention" },
                      { trait: "Precise", desc: "Clear, concise, purposeful communication" },
                    ].map((item) => (
                      <div key={item.trait} className="p-4 rounded-lg bg-muted/20 border border-border/20">
                        <h4 className="font-medium text-primary mb-1">{item.trait}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Key Messaging */}
            <TabsContent value="messaging" className="space-y-8">
              {keyMessages.map((msg, index) => (
                <Card key={index} className="bg-card/50 border-border/30">
                  <CardHeader>
                    <CardTitle className="text-lg">{msg.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-4">{msg.content}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(msg.content, msg.title)}
                    >
                      {copiedItem === msg.title ? <Check className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
                      Copy
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Boilerplate */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Company Boilerplate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-muted/20 border border-border/20 mb-4">
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                      {boilerplate}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(boilerplate, "Boilerplate")}
                  >
                    {copiedItem === "Boilerplate" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy Boilerplate
                  </Button>
                </CardContent>
              </Card>

              {/* Key Differentiators */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Key Differentiators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: Sparkles, title: "AI-Powered", desc: "First luxury concierge with advanced AI assistant (Orla)" },
                      { icon: Globe, title: "24/7 Global", desc: "Round-the-clock availability across all time zones" },
                      { icon: Shield, title: "Bank-Grade Security", desc: "Enterprise-level encryption and privacy protection" },
                      { icon: Star, title: "Learns & Adapts", desc: "Personalized service that improves with every interaction" },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-4 p-4 rounded-lg bg-muted/20 border border-border/20">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logo Assets */}
            <TabsContent value="assets" className="space-y-8">
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Logo Variations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Primary Logo - Dark BG */}
                    <div className="p-8 rounded-xl bg-[#0A0A0A] border border-border/30 text-center">
                      <div className="mb-4">
                        <span className="text-3xl font-light tracking-[0.3em] text-[#D4AF37]">AURELIA</span>
                        <p className="text-xs tracking-[0.2em] text-[#888] mt-1">PRIVATE CONCIERGE</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">Primary — Dark Background</p>
                      <Button variant="outline" size="sm">
                        <Download className="w-3 h-3 mr-2" />
                        Download SVG
                      </Button>
                    </div>
                    
                    {/* Primary Logo - Light BG */}
                    <div className="p-8 rounded-xl bg-[#F5F5F0] border border-border/30 text-center">
                      <div className="mb-4">
                        <span className="text-3xl font-light tracking-[0.3em] text-[#0A0A0A]">AURELIA</span>
                        <p className="text-xs tracking-[0.2em] text-[#666] mt-1">PRIVATE CONCIERGE</p>
                      </div>
                      <p className="text-xs text-[#666] mb-3">Primary — Light Background</p>
                      <Button variant="outline" size="sm" className="border-[#0A0A0A]/20 text-[#0A0A0A] hover:bg-[#0A0A0A]/5">
                        <Download className="w-3 h-3 mr-2" />
                        Download SVG
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Guidelines */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Logo Usage Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-emerald-500 mb-3">✓ Do</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Use provided logo files without modification</li>
                        <li>• Maintain clear space around the logo</li>
                        <li>• Use on appropriate contrasting backgrounds</li>
                        <li>• Scale proportionally</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-500 mb-3">✗ Don't</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Alter colors or add effects</li>
                        <li>• Stretch or distort the logo</li>
                        <li>• Place on busy or low-contrast backgrounds</li>
                        <li>• Add outlines, shadows, or gradients</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Press Info */}
            <TabsContent value="press" className="space-y-8">
              {/* Quick Facts */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Quick Facts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {facts.map((fact) => (
                      <div key={fact.label} className="p-4 rounded-lg bg-muted/20 border border-border/20">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{fact.label}</p>
                        <p className="font-medium text-foreground">{fact.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Press Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Media Inquiries</p>
                    <a 
                      href="mailto:press@aurelia-privateconcierge.com"
                      className="text-primary hover:underline"
                    >
                      press@aurelia-privateconcierge.com
                    </a>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {socialHandles.map((social) => (
                      <div key={social.platform} className="flex justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                        <span className="text-sm text-muted-foreground">{social.platform}</span>
                        <span className="text-sm text-foreground">{social.handle}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Download All */}
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="py-8">
                  <div className="text-center">
                    <h3 className="text-xl font-light text-foreground mb-2">Download Complete Media Kit</h3>
                    <p className="text-muted-foreground mb-6">
                      All logos, brand guidelines, and press materials in one package.
                    </p>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Download className="w-4 h-4 mr-2" />
                      Download Media Kit (ZIP)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MediaKit;
