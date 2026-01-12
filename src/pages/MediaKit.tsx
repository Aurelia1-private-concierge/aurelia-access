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
  Sparkles,
  Package,
  Loader2,
  Mail,
  Camera,
  Share2,
  Smartphone,
  Monitor,
  Layout,
  Video,
  Music,
  FileImage,
  BookOpen,
  Users,
  Play
} from "lucide-react";
import { useState } from "react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const logoAssets = [
  { name: "aurelia-logo-dark.svg", path: "/logos/aurelia-logo-dark.svg", description: "Full logo for dark backgrounds" },
  { name: "aurelia-logo-light.svg", path: "/logos/aurelia-logo-light.svg", description: "Full logo for light backgrounds" },
  { name: "aurelia-icon.svg", path: "/logos/aurelia-icon.svg", description: "Icon mark (gold)" },
  { name: "aurelia-icon-dark.svg", path: "/logos/aurelia-icon-dark.svg", description: "Icon mark (dark)" },
  { name: "aurelia-wordmark-gold.svg", path: "/logos/aurelia-wordmark-gold.svg", description: "Wordmark (gold)" },
  { name: "aurelia-wordmark-black.svg", path: "/logos/aurelia-wordmark-black.svg", description: "Wordmark (black)" },
  { name: "aurelia-wordmark-white.svg", path: "/logos/aurelia-wordmark-white.svg", description: "Wordmark (white)" },
];

const pngSizes = [64, 128, 256, 512, 1024];

const socialMediaSizes = [
  { platform: "LinkedIn", sizes: [
    { name: "Profile Photo", width: 400, height: 400 },
    { name: "Cover Image", width: 1584, height: 396 },
    { name: "Post Image", width: 1200, height: 627 },
  ]},
  { platform: "Instagram", sizes: [
    { name: "Profile Photo", width: 320, height: 320 },
    { name: "Feed Post", width: 1080, height: 1080 },
    { name: "Story", width: 1080, height: 1920 },
  ]},
  { platform: "Twitter/X", sizes: [
    { name: "Profile Photo", width: 400, height: 400 },
    { name: "Header", width: 1500, height: 500 },
    { name: "Post Image", width: 1200, height: 675 },
  ]},
  { platform: "Facebook", sizes: [
    { name: "Profile Photo", width: 180, height: 180 },
    { name: "Cover Photo", width: 820, height: 312 },
    { name: "Post Image", width: 1200, height: 630 },
  ]},
];

const emailSignatureHtml = `<table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Inter', Arial, sans-serif; color: #333;">
  <tr>
    <td style="padding-right: 15px; border-right: 2px solid #D4AF37;">
      <img src="https://aurelia-privateconcierge.com/logos/aurelia-icon.svg" alt="Aurelia" width="48" height="48" />
    </td>
    <td style="padding-left: 15px;">
      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #0A0A0A;">[Your Name]</p>
      <p style="margin: 4px 0; font-size: 13px; color: #666;">[Your Title] | Aurelia Private Concierge</p>
      <p style="margin: 8px 0 0; font-size: 12px;">
        <a href="mailto:name@aurelia-privateconcierge.com" style="color: #D4AF37; text-decoration: none;">name@aurelia-privateconcierge.com</a>
        <span style="color: #ccc; margin: 0 8px;">|</span>
        <a href="https://aurelia-privateconcierge.com" style="color: #666; text-decoration: none;">aurelia-privateconcierge.com</a>
      </p>
    </td>
  </tr>
</table>`;

const photographyGuidelines = [
  { title: "Style", description: "Sophisticated, editorial-quality imagery with natural lighting and muted tones" },
  { title: "Subjects", description: "Luxury lifestyle moments — private jets, yachts, fine dining, exclusive events" },
  { title: "Mood", description: "Aspirational yet approachable, intimate rather than ostentatious" },
  { title: "Color Grading", description: "Warm undertones, subtle gold highlights, deep shadows" },
  { title: "Composition", description: "Clean lines, negative space, focus on details and craftsmanship" },
  { title: "Avoid", description: "Overly staged shots, visible branding of other luxury brands, crowded scenes" },
];

// Video & Motion Assets
const videoAssets = [
  { name: "Logo Intro Animation", duration: "3s", format: "MP4/MOV", resolution: "1920×1080", description: "Elegant logo reveal with gold particle effects" },
  { name: "Logo Outro Animation", duration: "2s", format: "MP4/MOV", resolution: "1920×1080", description: "Subtle fade-out with diamond icon" },
  { name: "Logo Loop", duration: "5s", format: "MP4/MOV/GIF", resolution: "1080×1080", description: "Seamless animated logo for social/web" },
  { name: "Lower Third Template", duration: "N/A", format: "AE/PR", resolution: "1920×1080", description: "Branded name/title overlay for videos" },
];

// Audio Assets
const audioAssets = [
  { name: "Sonic Logo", duration: "3s", format: "WAV/MP3", description: "Elegant chime sequence for brand recognition" },
  { name: "Hold Music", duration: "2m loop", format: "WAV/MP3", description: "Refined instrumental for phone systems" },
  { name: "Notification Sound", duration: "1s", format: "WAV/MP3", description: "Subtle, luxurious alert tone" },
  { name: "Ambient Background", duration: "5m loop", format: "WAV/MP3", description: "Premium ambiance for videos/presentations" },
];

// Favicon Package Sizes
const faviconSizes = [
  { name: "favicon.ico", size: "16×16, 32×32, 48×48", usage: "Browser tabs" },
  { name: "favicon-16x16.png", size: "16×16", usage: "Standard favicon" },
  { name: "favicon-32x32.png", size: "32×32", usage: "Standard favicon" },
  { name: "apple-touch-icon.png", size: "180×180", usage: "iOS home screen" },
  { name: "android-chrome-192x192.png", size: "192×192", usage: "Android PWA" },
  { name: "android-chrome-512x512.png", size: "512×512", usage: "Android PWA splash" },
  { name: "mstile-150x150.png", size: "150×150", usage: "Windows tiles" },
  { name: "safari-pinned-tab.svg", size: "SVG", usage: "Safari pinned tabs" },
];

// Brand Guidelines PDF Chapters
const brandGuideChapters = [
  { chapter: "1. Brand Story", pages: "2-5", description: "Origin, mission, vision, and values" },
  { chapter: "2. Visual Identity", pages: "6-15", description: "Logo, colors, typography, and imagery" },
  { chapter: "3. Voice & Tone", pages: "16-19", description: "Communication style and key messages" },
  { chapter: "4. Application", pages: "20-28", description: "Digital, print, and environmental usage" },
  { chapter: "5. Do's & Don'ts", pages: "29-32", description: "Common mistakes and best practices" },
];

// Partner Co-branding Templates
const partnerTemplates = [
  { name: "Horizontal Lock-up", description: "Aurelia logo + partner logo side by side", usage: "Wide formats, headers" },
  { name: "Vertical Lock-up", description: "Aurelia logo above partner logo", usage: "Portrait formats, banners" },
  { name: "Endorsed Lock-up", description: "'In partnership with Aurelia' treatment", usage: "Partner-led materials" },
  { name: "Co-branded Header", description: "Shared header template for digital use", usage: "Websites, emails" },
];

const MediaKit = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(label);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const downloadSingleAsset = async (path: string, filename: string) => {
    try {
      const response = await fetch(path);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded", description: `${filename} saved successfully` });
    } catch {
      toast({ title: "Error", description: "Failed to download file", variant: "destructive" });
    }
  };

  // Convert SVG to PNG at specified size
  const svgToPng = async (svgContent: string, width: number, height: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svg = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svg);
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create PNG blob"));
          }
          URL.revokeObjectURL(url);
        }, "image/png");
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load SVG"));
      };
      
      img.src = url;
    });
  };

  const downloadAllAssets = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const svgFolder = zip.folder("svg");
      const pngFolder = zip.folder("png");
      
      // Fetch all SVG files and generate PNGs
      for (const asset of logoAssets) {
        const response = await fetch(asset.path);
        const content = await response.text();
        svgFolder?.file(asset.name, content);
        
        // Generate PNG versions at multiple sizes
        const baseName = asset.name.replace(".svg", "");
        for (const size of pngSizes) {
          try {
            const pngBlob = await svgToPng(content, size, size);
            const sizeFolder = pngFolder?.folder(`${size}x${size}`);
            sizeFolder?.file(`${baseName}.png`, pngBlob);
          } catch (e) {
            console.warn(`Failed to generate PNG for ${baseName} at ${size}px`, e);
          }
        }
      }

      // Add a README file
      const readme = `AURELIA BRAND ASSETS
====================

This package contains official Aurelia logo assets.

FOLDER STRUCTURE:
/svg/ - Vector files (scalable, recommended for print)
/png/64x64/ - Small icons (favicons, app icons)
/png/128x128/ - Medium icons (thumbnails)
/png/256x256/ - Standard web usage
/png/512x512/ - High-resolution displays
/png/1024x1024/ - Print and large displays

INCLUDED ASSETS:
- aurelia-logo-dark - Full logo for dark backgrounds
- aurelia-logo-light - Full logo for light backgrounds
- aurelia-icon - Diamond icon mark (gold)
- aurelia-icon-dark - Diamond icon mark (dark)
- aurelia-wordmark-gold - Text-only wordmark (gold)
- aurelia-wordmark-black - Text-only wordmark (black)
- aurelia-wordmark-white - Text-only wordmark (white)

USAGE GUIDELINES:
- Use provided logo files without modification
- Maintain clear space around the logo (minimum 1/4 logo height)
- Use on appropriate contrasting backgrounds
- Scale proportionally — never stretch or distort
- Do not alter colors, add effects, or modify the design

SOCIAL MEDIA SIZES:
- LinkedIn Profile: 400x400px
- LinkedIn Cover: 1584x396px
- Instagram Feed: 1080x1080px
- Instagram Story: 1080x1920px
- Twitter/X Profile: 400x400px
- Facebook Cover: 820x312px

For questions, contact: press@aurelia-privateconcierge.com

© ${new Date().getFullYear()} Aurelia Private Concierge. All rights reserved.
`;
      zip.file("README.txt", readme);

      // Add email signature template
      zip.file("email-signature.html", emailSignatureHtml);

      // Generate and download ZIP
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "aurelia-brand-assets.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: "Success", description: "Brand assets with PNGs downloaded successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to create ZIP file", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
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
            <TabsList className="flex flex-wrap gap-2 bg-transparent h-auto p-0 justify-center">
              {[
                { value: "brand", label: "Brand", icon: Palette },
                { value: "messaging", label: "Messaging", icon: MessageSquare },
                { value: "assets", label: "Logos", icon: ImageIcon },
                { value: "motion", label: "Motion", icon: Video },
                { value: "audio", label: "Audio", icon: Music },
                { value: "social", label: "Social", icon: Share2 },
                { value: "templates", label: "Templates", icon: Layout },
                { value: "favicons", label: "Favicons", icon: FileImage },
                { value: "guidelines", label: "Brand Book", icon: BookOpen },
                { value: "partners", label: "Co-brand", icon: Users },
                { value: "press", label: "Press", icon: FileText },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/30 border border-border/30 rounded-lg py-3 px-3 text-xs md:text-sm"
                >
                  <tab.icon className="w-4 h-4 mr-1.5" />
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
              {/* Download All */}
              <Card className="bg-gradient-to-br from-primary/10 via-card/50 to-card/50 border-primary/30">
                <CardContent className="py-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Package className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-foreground">Complete Brand Package</h3>
                        <p className="text-muted-foreground">Download all logo assets in one ZIP file (SVG formats)</p>
                      </div>
                    </div>
                    <Button 
                      size="lg" 
                      onClick={downloadAllAssets}
                      disabled={isDownloading}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {isDownloading ? "Preparing..." : "Download All Assets"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadSingleAsset("/logos/aurelia-logo-dark.svg", "aurelia-logo-dark.svg")}
                      >
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#0A0A0A]/20 text-[#0A0A0A] hover:bg-[#0A0A0A]/5"
                        onClick={() => downloadSingleAsset("/logos/aurelia-logo-light.svg", "aurelia-logo-light.svg")}
                      >
                        <Download className="w-3 h-3 mr-2" />
                        Download SVG
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Icon & Wordmark Assets */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Icon & Wordmark Variations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Icon Gold */}
                    <div className="p-6 rounded-xl bg-[#0A0A0A] border border-border/30 text-center">
                      <div className="w-12 h-12 mx-auto mb-3">
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24 4L44 24L24 44L4 24L24 4Z" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                          <path d="M24 12L32 20L24 28L16 20L24 12Z" fill="#D4AF37"/>
                          <path d="M12 24L24 36M36 24L24 36" stroke="#D4AF37" strokeWidth="1.5" opacity="0.6"/>
                        </svg>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">Icon (Gold)</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadSingleAsset("/logos/aurelia-icon.svg", "aurelia-icon.svg")}
                      >
                        <Download className="w-3 h-3 mr-2" />
                        SVG
                      </Button>
                    </div>

                    {/* Icon Dark */}
                    <div className="p-6 rounded-xl bg-[#F5F5F0] border border-border/30 text-center">
                      <div className="w-12 h-12 mx-auto mb-3">
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24 4L44 24L24 44L4 24L24 4Z" stroke="#0A0A0A" strokeWidth="1.5" fill="none"/>
                          <path d="M24 12L32 20L24 28L16 20L24 12Z" fill="#0A0A0A"/>
                          <path d="M12 24L24 36M36 24L24 36" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.6"/>
                        </svg>
                      </div>
                      <p className="text-xs text-[#666] mb-3">Icon (Dark)</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-[#0A0A0A]/20 text-[#0A0A0A] hover:bg-[#0A0A0A]/5"
                        onClick={() => downloadSingleAsset("/logos/aurelia-icon-dark.svg", "aurelia-icon-dark.svg")}
                      >
                        <Download className="w-3 h-3 mr-2" />
                        SVG
                      </Button>
                    </div>

                    {/* Wordmark Gold */}
                    <div className="p-6 rounded-xl bg-[#0A0A0A] border border-border/30 text-center">
                      <div className="mb-3 py-2">
                        <span className="text-xl font-light tracking-[0.2em] text-[#D4AF37]">AURELIA</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">Wordmark (Gold)</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadSingleAsset("/logos/aurelia-wordmark-gold.svg", "aurelia-wordmark-gold.svg")}
                      >
                        <Download className="w-3 h-3 mr-2" />
                        SVG
                      </Button>
                    </div>

                    {/* Wordmark Black */}
                    <div className="p-6 rounded-xl bg-[#F5F5F0] border border-border/30 text-center">
                      <div className="mb-3 py-2">
                        <span className="text-xl font-light tracking-[0.2em] text-[#0A0A0A]">AURELIA</span>
                      </div>
                      <p className="text-xs text-[#666] mb-3">Wordmark (Black)</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-[#0A0A0A]/20 text-[#0A0A0A] hover:bg-[#0A0A0A]/5"
                        onClick={() => downloadSingleAsset("/logos/aurelia-wordmark-black.svg", "aurelia-wordmark-black.svg")}
                      >
                        <Download className="w-3 h-3 mr-2" />
                        SVG
                      </Button>
                    </div>

                    {/* Wordmark White */}
                    <div className="p-6 rounded-xl bg-[#0A0A0A] border border-border/30 text-center">
                      <div className="mb-3 py-2">
                        <span className="text-xl font-light tracking-[0.2em] text-[#F5F5F0]">AURELIA</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">Wordmark (White)</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadSingleAsset("/logos/aurelia-wordmark-white.svg", "aurelia-wordmark-white.svg")}
                      >
                        <Download className="w-3 h-3 mr-2" />
                        SVG
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

            {/* Motion / Video Assets */}
            <TabsContent value="motion" className="space-y-8">
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    Video & Motion Assets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {videoAssets.map((asset) => (
                      <div key={asset.name} className="p-5 rounded-xl bg-muted/20 border border-border/20 group hover:border-primary/30 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Play className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground mb-1">{asset.name}</h4>
                            <p className="text-sm text-muted-foreground mb-3">{asset.description}</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="px-2 py-1 rounded bg-muted/30 text-muted-foreground">{asset.duration}</span>
                              <span className="px-2 py-1 rounded bg-muted/30 text-muted-foreground">{asset.format}</span>
                              <span className="px-2 py-1 rounded bg-muted/30 text-muted-foreground">{asset.resolution}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Request Motion Assets:</strong> Contact{" "}
                      <a href="mailto:brand@aurelia-privateconcierge.com" className="text-primary hover:underline">
                        brand@aurelia-privateconcierge.com
                      </a>{" "}
                      to receive video files or After Effects/Premiere templates.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Motion Guidelines */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Motion Design Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/20">
                      <h4 className="font-medium text-foreground mb-3">Animation Principles</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Elegant, understated transitions (no flashy effects)</li>
                        <li>• Easing: ease-out for enters, ease-in for exits</li>
                        <li>• Duration: 0.3-0.8s for UI, 1-3s for logo reveals</li>
                        <li>• Particle effects: gold (#D4AF37) with subtle glow</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/20">
                      <h4 className="font-medium text-foreground mb-3">Video Specifications</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Resolution: 1920×1080 (min), 4K preferred</li>
                        <li>• Frame Rate: 30fps standard, 60fps for web</li>
                        <li>• Codec: H.264 for web, ProRes for editing</li>
                        <li>• Color Space: sRGB for web, Rec. 709 for video</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audio Assets */}
            <TabsContent value="audio" className="space-y-8">
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-primary" />
                    Audio Branding Assets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {audioAssets.map((asset) => (
                      <div key={asset.name} className="p-5 rounded-xl bg-muted/20 border border-border/20 group hover:border-primary/30 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Music className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground mb-1">{asset.name}</h4>
                            <p className="text-sm text-muted-foreground mb-3">{asset.description}</p>
                            <div className="flex gap-2 text-xs">
                              <span className="px-2 py-1 rounded bg-muted/30 text-muted-foreground">{asset.duration}</span>
                              <span className="px-2 py-1 rounded bg-muted/30 text-muted-foreground">{asset.format}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Request Audio Assets:</strong> Contact{" "}
                      <a href="mailto:brand@aurelia-privateconcierge.com" className="text-primary hover:underline">
                        brand@aurelia-privateconcierge.com
                      </a>{" "}
                      for WAV/MP3 files and licensing information.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Audio Guidelines */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Audio Brand Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/20">
                      <h4 className="font-medium text-primary mb-2">Sonic Identity</h4>
                      <p className="text-sm text-muted-foreground">Warm, sophisticated tones with subtle metallic resonance reflecting the gold brand accent.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/20">
                      <h4 className="font-medium text-primary mb-2">Instrumentation</h4>
                      <p className="text-sm text-muted-foreground">Piano, subtle strings, crystal chimes. Avoid heavy bass, electronic beats, or abrupt sounds.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/20">
                      <h4 className="font-medium text-primary mb-2">Technical Specs</h4>
                      <p className="text-sm text-muted-foreground">44.1kHz / 16-bit minimum. Normalize to -14 LUFS for consistency across platforms.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Media Assets */}
            <TabsContent value="social" className="space-y-8">
              {/* Social Media Sizes Reference */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-primary" />
                    Social Media Asset Sizes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {socialMediaSizes.map((platform) => (
                      <div key={platform.platform} className="p-4 rounded-lg bg-muted/20 border border-border/20">
                        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          {platform.platform === "Instagram" && <Smartphone className="w-4 h-4 text-primary" />}
                          {platform.platform === "LinkedIn" && <Monitor className="w-4 h-4 text-primary" />}
                          {platform.platform === "Twitter/X" && <MessageSquare className="w-4 h-4 text-primary" />}
                          {platform.platform === "Facebook" && <Globe className="w-4 h-4 text-primary" />}
                          {platform.platform}
                        </h4>
                        <div className="space-y-2">
                          {platform.sizes.map((size) => (
                            <div key={size.name} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{size.name}</span>
                              <span className="text-foreground font-mono">{size.width} × {size.height}px</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* OG Image / Social Share */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Open Graph / Social Share Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-[#0A0A0A] border border-border/30">
                      <div className="aspect-[1200/630] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-lg flex items-center justify-center mb-4 border border-[#333]">
                        <div className="text-center">
                          <span className="text-2xl font-light tracking-[0.3em] text-[#D4AF37]">AURELIA</span>
                          <p className="text-xs tracking-[0.2em] text-[#888] mt-1">PRIVATE CONCIERGE</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">OG Image — 1200×630px</p>
                      <p className="text-xs text-muted-foreground/70">Recommended for link sharing on social platforms</p>
                    </div>
                    <div className="p-6 rounded-xl bg-[#F5F5F0] border border-border/30">
                      <div className="aspect-[1200/630] bg-gradient-to-br from-[#FAFAF8] to-[#F0F0E8] rounded-lg flex items-center justify-center mb-4 border border-[#E5E5E0]">
                        <div className="text-center">
                          <span className="text-2xl font-light tracking-[0.3em] text-[#0A0A0A]">AURELIA</span>
                          <p className="text-xs tracking-[0.2em] text-[#666] mt-1">PRIVATE CONCIERGE</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#666] mb-3">OG Image Light — 1200×630px</p>
                      <p className="text-xs text-[#888]">Alternative for light-themed contexts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Photography Guidelines */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    Photography Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {photographyGuidelines.map((guideline) => (
                      <div key={guideline.title} className="p-4 rounded-lg bg-muted/20 border border-border/20">
                        <h4 className="font-medium text-primary mb-2">{guideline.title}</h4>
                        <p className="text-sm text-muted-foreground">{guideline.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-8">
              {/* Email Signature */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Email Signature Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 rounded-xl bg-white border border-border/30">
                    <table cellPadding="0" cellSpacing="0" style={{ fontFamily: "'Inter', Arial, sans-serif", color: "#333" }}>
                      <tbody>
                        <tr>
                          <td style={{ paddingRight: 15, borderRight: "2px solid #D4AF37" }}>
                            <div className="w-12 h-12">
                              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 4L44 24L24 44L4 24L24 4Z" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                                <path d="M24 12L32 20L24 28L16 20L24 12Z" fill="#D4AF37"/>
                                <path d="M12 24L24 36M36 24L24 36" stroke="#D4AF37" strokeWidth="1.5" opacity="0.6"/>
                              </svg>
                            </div>
                          </td>
                          <td style={{ paddingLeft: 15 }}>
                            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0A0A0A" }}>[Your Name]</p>
                            <p style={{ margin: "4px 0", fontSize: 13, color: "#666" }}>[Your Title] | Aurelia Private Concierge</p>
                            <p style={{ margin: "8px 0 0", fontSize: 12 }}>
                              <a href="#" style={{ color: "#D4AF37", textDecoration: "none" }}>name@aurelia-privateconcierge.com</a>
                              <span style={{ color: "#ccc", margin: "0 8px" }}>|</span>
                              <a href="#" style={{ color: "#666", textDecoration: "none" }}>aurelia-privateconcierge.com</a>
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(emailSignatureHtml, "Email Signature HTML")}
                    >
                      {copiedItem === "Email Signature HTML" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy HTML
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Presentation Slide Formats */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Presentation Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-muted/20 border border-border/20">
                      <h4 className="font-medium text-foreground mb-3">Slide Dimensions</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Standard (16:9)</span>
                          <span className="font-mono">1920 × 1080px</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Widescreen (16:10)</span>
                          <span className="font-mono">1920 × 1200px</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Classic (4:3)</span>
                          <span className="font-mono">1024 × 768px</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 rounded-xl bg-muted/20 border border-border/20">
                      <h4 className="font-medium text-foreground mb-3">Slide Design Rules</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Use dark backgrounds (#0A0A0A) as primary</li>
                        <li>• Headlines in Playfair Display, gold (#D4AF37)</li>
                        <li>• Body text in Inter, white (#F5F5F0)</li>
                        <li>• Logo placed top-left or bottom-right corner</li>
                        <li>• Maintain 10% margins on all sides</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Print Specifications */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Print Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/20">
                      <h4 className="font-medium text-primary mb-2">Business Cards</h4>
                      <p className="text-sm text-muted-foreground">3.5" × 2" (89 × 51mm)</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">CMYK, 300 DPI, 0.125" bleed</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/20">
                      <h4 className="font-medium text-primary mb-2">Letterhead</h4>
                      <p className="text-sm text-muted-foreground">A4 (210 × 297mm)</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">CMYK, 300 DPI, 5mm bleed</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/20">
                      <h4 className="font-medium text-primary mb-2">Brochures</h4>
                      <p className="text-sm text-muted-foreground">A5 folded (148 × 210mm)</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">CMYK, 300 DPI, 3mm bleed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favicons Tab */}
            <TabsContent value="favicons" className="space-y-8">
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileImage className="w-5 h-5 text-primary" />
                    Favicon Package
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {faviconSizes.map((favicon) => (
                      <div key={favicon.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/20">
                        <div>
                          <p className="font-mono text-sm text-foreground">{favicon.name}</p>
                          <p className="text-xs text-muted-foreground">{favicon.usage}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-muted/30 text-muted-foreground font-mono">{favicon.size}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Download Favicon Package:</strong> The complete favicon set is included in the "Download All Assets" ZIP file, or contact{" "}
                      <a href="mailto:brand@aurelia-privateconcierge.com" className="text-primary hover:underline">
                        brand@aurelia-privateconcierge.com
                      </a>.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Web Manifest Example */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Web Manifest Reference</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-[#1A1A1A] border border-border/30 overflow-x-auto">
                    <pre className="text-sm text-[#F5F5F0] font-mono">
{`{
  "name": "Aurelia Private Concierge",
  "short_name": "Aurelia",
  "icons": [
    { "src": "/favicon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/favicon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#D4AF37",
  "background_color": "#0A0A0A",
  "display": "standalone"
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Brand Guidelines PDF Tab */}
            <TabsContent value="guidelines" className="space-y-8">
              <Card className="bg-gradient-to-br from-primary/10 via-card/50 to-card/50 border-primary/30">
                <CardContent className="py-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                        <BookOpen className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-foreground">Aurelia Brand Guidelines</h3>
                        <p className="text-muted-foreground">Comprehensive 32-page brand book (PDF)</p>
                      </div>
                    </div>
                    <Button 
                      size="lg" 
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => toast({ title: "Coming Soon", description: "Brand Guidelines PDF will be available for download shortly." })}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Table of Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {brandGuideChapters.map((chapter) => (
                      <div key={chapter.chapter} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/30 transition-colors">
                        <div>
                          <h4 className="font-medium text-foreground">{chapter.chapter}</h4>
                          <p className="text-sm text-muted-foreground">{chapter.description}</p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded bg-muted/30 text-muted-foreground">pp. {chapter.pages}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Partner Co-branding Tab */}
            <TabsContent value="partners" className="space-y-8">
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Partner Co-branding Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {partnerTemplates.map((template) => (
                      <div key={template.name} className="p-5 rounded-xl bg-muted/20 border border-border/20 hover:border-primary/30 transition-colors">
                        <h4 className="font-medium text-foreground mb-2">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{template.usage}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lock-up Examples */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Lock-up Examples</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Horizontal Lock-up */}
                    <div className="p-6 rounded-xl bg-[#0A0A0A] border border-border/30">
                      <div className="flex items-center justify-center gap-8 py-4">
                        <span className="text-lg font-light tracking-[0.2em] text-[#D4AF37]">AURELIA</span>
                        <div className="w-px h-8 bg-[#333]" />
                        <span className="text-lg font-medium text-[#888]">Partner</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-4">Horizontal Lock-up</p>
                    </div>

                    {/* Vertical Lock-up */}
                    <div className="p-6 rounded-xl bg-[#0A0A0A] border border-border/30">
                      <div className="flex flex-col items-center justify-center gap-4 py-4">
                        <span className="text-lg font-light tracking-[0.2em] text-[#D4AF37]">AURELIA</span>
                        <div className="h-px w-16 bg-[#333]" />
                        <span className="text-lg font-medium text-[#888]">Partner</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-4">Vertical Lock-up</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Co-branding Rules */}
              <Card className="bg-card/50 border-border/30">
                <CardHeader>
                  <CardTitle>Co-branding Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-emerald-500 mb-3">✓ Requirements</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Aurelia logo must be same size or larger than partner logo</li>
                        <li>• Maintain clear space equal to Aurelia icon height</li>
                        <li>• Use official Aurelia colors only</li>
                        <li>• Submit designs for approval before publication</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-500 mb-3">✗ Restrictions</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• No modification of Aurelia logo proportions</li>
                        <li>• No color changes to accommodate partner palette</li>
                        <li>• No use without written partnership agreement</li>
                        <li>• No crowded or cluttered compositions</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Request Templates:</strong> Contact{" "}
                      <a href="mailto:partnerships@aurelia-privateconcierge.com" className="text-primary hover:underline">
                        partnerships@aurelia-privateconcierge.com
                      </a>{" "}
                      for editable co-branding files and approval process.
                    </p>
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
                      All logos (SVG + PNG in 5 sizes), email signature, and README included.
                    </p>
                    <Button 
                      onClick={downloadAllAssets}
                      disabled={isDownloading}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {isDownloading ? "Preparing..." : "Download Media Kit (ZIP)"}
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
