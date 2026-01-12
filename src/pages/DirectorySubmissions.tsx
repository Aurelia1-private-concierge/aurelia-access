import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Star, 
  Users, 
  Globe, 
  Building2,
  Plane,
  Car,
  Anchor,
  Home,
  Gem,
  CreditCard,
  Shield,
  Award,
  TrendingUp,
  Share2,
  Linkedin,
  Twitter,
  Instagram,
  Facebook
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface DirectoryEntry {
  id: string;
  name: string;
  url: string;
  category: string;
  priority: "high" | "medium" | "low";
  audienceSize: string;
  description: string;
  submissionType: "free" | "paid" | "invite";
  estimatedImpact: string;
  status?: "submitted" | "pending" | "approved";
}

const UHNWI_DIRECTORIES: DirectoryEntry[] = [
  // Professional Networks
  {
    id: "linkedin-company",
    name: "LinkedIn Company Page",
    url: "https://www.linkedin.com/company/setup/new/",
    category: "Professional",
    priority: "high",
    audienceSize: "900M+ professionals",
    description: "Create company page, post regularly, join luxury groups",
    submissionType: "free",
    estimatedImpact: "Very High - Primary B2B channel"
  },
  {
    id: "crunchbase",
    name: "Crunchbase",
    url: "https://www.crunchbase.com/",
    category: "Professional",
    priority: "high",
    audienceSize: "60M+ monthly visitors",
    description: "Company profile for investors and business research",
    submissionType: "free",
    estimatedImpact: "High - Investor visibility"
  },
  {
    id: "angellist",
    name: "AngelList / Wellfound",
    url: "https://wellfound.com/",
    category: "Professional",
    priority: "medium",
    audienceSize: "10M+ startup community",
    description: "Startup and investment platform",
    submissionType: "free",
    estimatedImpact: "Medium - Tech investors"
  },

  // Luxury Directories
  {
    id: "luxury-society",
    name: "Luxury Society",
    url: "https://www.luxurysociety.com/",
    category: "Luxury",
    priority: "high",
    audienceSize: "500K+ luxury professionals",
    description: "Premier luxury industry network",
    submissionType: "invite",
    estimatedImpact: "Very High - Industry authority"
  },
  {
    id: "james-edition",
    name: "JamesEdition",
    url: "https://www.jamesedition.com/",
    category: "Luxury",
    priority: "high",
    audienceSize: "10M+ UHNW visitors",
    description: "Luxury marketplace for yachts, jets, real estate",
    submissionType: "paid",
    estimatedImpact: "Very High - Direct UHNW audience"
  },
  {
    id: "luxury-network",
    name: "The Luxury Network",
    url: "https://www.theluxurynetwork.com/",
    category: "Luxury",
    priority: "high",
    audienceSize: "500+ luxury brands",
    description: "B2B luxury brand partnership network",
    submissionType: "paid",
    estimatedImpact: "High - Partnership opportunities"
  },

  // Concierge & Travel
  {
    id: "virtuoso",
    name: "Virtuoso",
    url: "https://www.virtuoso.com/",
    category: "Travel",
    priority: "high",
    audienceSize: "20K+ travel advisors",
    description: "Premier luxury travel network",
    submissionType: "invite",
    estimatedImpact: "Very High - Travel referrals"
  },
  {
    id: "traveller-made",
    name: "Traveller Made",
    url: "https://www.travellermade.com/",
    category: "Travel",
    priority: "medium",
    audienceSize: "500+ luxury agencies",
    description: "Luxury travel consortium",
    submissionType: "invite",
    estimatedImpact: "High - Agency partnerships"
  },

  // Business Directories
  {
    id: "google-business",
    name: "Google Business Profile",
    url: "https://business.google.com/",
    category: "Search",
    priority: "high",
    audienceSize: "8.5B+ searches/day",
    description: "Essential for local SEO and visibility",
    submissionType: "free",
    estimatedImpact: "Very High - Search visibility"
  },
  {
    id: "bing-places",
    name: "Bing Places",
    url: "https://www.bingplaces.com/",
    category: "Search",
    priority: "medium",
    audienceSize: "1B+ monthly searches",
    description: "Microsoft search visibility",
    submissionType: "free",
    estimatedImpact: "Medium - Secondary search"
  },
  {
    id: "apple-maps",
    name: "Apple Maps Connect",
    url: "https://mapsconnect.apple.com/",
    category: "Search",
    priority: "medium",
    audienceSize: "1B+ Apple users",
    description: "Apple device visibility",
    submissionType: "free",
    estimatedImpact: "Medium - Mobile users"
  },

  // Private Banking & Wealth
  {
    id: "family-office-exchange",
    name: "Family Office Exchange",
    url: "https://www.familyoffice.com/",
    category: "Wealth",
    priority: "high",
    audienceSize: "500+ family offices",
    description: "Family office membership network",
    submissionType: "invite",
    estimatedImpact: "Very High - Direct UHNW"
  },
  {
    id: "campden-wealth",
    name: "Campden Wealth",
    url: "https://www.campdenwealth.com/",
    category: "Wealth",
    priority: "high",
    audienceSize: "3000+ family offices",
    description: "Global family office community",
    submissionType: "paid",
    estimatedImpact: "Very High - Research & events"
  },

  // Social Platforms
  {
    id: "instagram-business",
    name: "Instagram Business",
    url: "https://business.instagram.com/",
    category: "Social",
    priority: "high",
    audienceSize: "2B+ users",
    description: "Visual luxury brand presence",
    submissionType: "free",
    estimatedImpact: "High - Brand awareness"
  },
  {
    id: "tiktok-business",
    name: "TikTok Business",
    url: "https://www.tiktok.com/business/",
    category: "Social",
    priority: "medium",
    audienceSize: "1B+ users",
    description: "Emerging luxury audience",
    submissionType: "free",
    estimatedImpact: "Medium - Younger UHNW"
  },
  {
    id: "pinterest-business",
    name: "Pinterest Business",
    url: "https://business.pinterest.com/",
    category: "Social",
    priority: "medium",
    audienceSize: "450M+ users",
    description: "Lifestyle and luxury inspiration",
    submissionType: "free",
    estimatedImpact: "Medium - Visual discovery"
  },

  // Review & Rating
  {
    id: "trustpilot",
    name: "Trustpilot",
    url: "https://business.trustpilot.com/",
    category: "Reviews",
    priority: "high",
    audienceSize: "Consumer trust platform",
    description: "Build verified reviews and trust",
    submissionType: "free",
    estimatedImpact: "High - Trust signals"
  },
  {
    id: "g2",
    name: "G2",
    url: "https://www.g2.com/",
    category: "Reviews",
    priority: "medium",
    audienceSize: "60M+ B2B buyers",
    description: "Software and service reviews",
    submissionType: "free",
    estimatedImpact: "Medium - B2B credibility"
  },

  // Industry Specific
  {
    id: "leading-hotels",
    name: "Leading Hotels of the World",
    url: "https://www.lhw.com/",
    category: "Hospitality",
    priority: "high",
    audienceSize: "400+ luxury hotels",
    description: "Partner referral network",
    submissionType: "invite",
    estimatedImpact: "High - Hotel partnerships"
  },
  {
    id: "relais-chateaux",
    name: "Relais & Châteaux",
    url: "https://www.relaischateaux.com/",
    category: "Hospitality",
    priority: "high",
    audienceSize: "580+ properties",
    description: "Luxury hospitality network",
    submissionType: "invite",
    estimatedImpact: "High - Culinary & stays"
  },
];

const SOCIAL_SHARE_LINKS = {
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    url: (text: string, url: string) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
    color: "bg-[#0A66C2]"
  },
  twitter: {
    name: "X (Twitter)",
    icon: Twitter,
    url: (text: string, url: string) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    color: "bg-black"
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    url: (text: string, url: string) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    color: "bg-[#1877F2]"
  },
  instagram: {
    name: "Instagram",
    icon: Instagram,
    url: () => `https://www.instagram.com/`,
    color: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]"
  }
};

const SHARE_CONTENT = {
  launch: {
    title: "Launch Announcement",
    text: "Introducing AURELIA — The world's most exclusive private concierge for those who demand the extraordinary. Where impossibility becomes itinerary. ✨\n\n#LuxuryLifestyle #PrivateConcierge #UHNW #Aurelia",
    url: "https://aurelia-privateconcierge.com?utm_source=social&utm_medium=organic&utm_campaign=launch"
  },
  orla: {
    title: "Meet Orla",
    text: "Meet Orla — Your AI confidante who anticipates your desires before you voice them. The future of luxury concierge is here. 🤖✨\n\n#AI #LuxuryTech #Concierge #Aurelia",
    url: "https://aurelia-privateconcierge.com/orla?utm_source=social&utm_medium=organic&utm_campaign=orla"
  },
  membership: {
    title: "Membership",
    text: "Experience a new realm of possibility. AURELIA membership: Vetted. Verified. Uncompromising. By invitation only. 🔐\n\n#ExclusiveMembership #Luxury #UHNW #Aurelia",
    url: "https://aurelia-privateconcierge.com/membership?utm_source=social&utm_medium=organic&utm_campaign=membership"
  },
  partner: {
    title: "Partner With Us",
    text: "Join the AURELIA partner network. Connect with the world's most discerning clientele. 🤝\n\n#LuxuryPartners #BusinessDevelopment #Aurelia",
    url: "https://aurelia-privateconcierge.com/partner-apply?utm_source=social&utm_medium=organic&utm_campaign=partner"
  }
};

const DirectorySubmissions = () => {
  const { toast } = useToast();
  const [completedSubmissions, setCompletedSubmissions] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState("all");

  const toggleSubmission = (id: string) => {
    const newSet = new Set(completedSubmissions);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCompletedSubmissions(newSet);
    
    // Save to localStorage
    localStorage.setItem('aurelia-submissions', JSON.stringify([...newSet]));
  };

  const openDirectory = (url: string, name: string) => {
    window.open(url, '_blank');
    toast({
      title: "Opening " + name,
      description: "Complete your submission and mark it done when finished.",
    });
  };

  const shareToSocial = (platform: keyof typeof SOCIAL_SHARE_LINKS, content: typeof SHARE_CONTENT.launch) => {
    const socialConfig = SOCIAL_SHARE_LINKS[platform];
    const url = socialConfig.url(content.text, content.url);
    window.open(url, '_blank', 'width=600,height=400');
    toast({
      title: `Sharing to ${socialConfig.name}`,
      description: "Complete your post in the new window.",
    });
  };

  const categories = ["all", ...new Set(UHNWI_DIRECTORIES.map(d => d.category))];
  
  const filteredDirectories = selectedCategory === "all" 
    ? UHNWI_DIRECTORIES 
    : UHNWI_DIRECTORIES.filter(d => d.category === selectedCategory);

  const highPriorityCount = UHNWI_DIRECTORIES.filter(d => d.priority === "high").length;
  const freeCount = UHNWI_DIRECTORIES.filter(d => d.submissionType === "free").length;
  const completedCount = completedSubmissions.size;

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, typeof Globe> = {
      Professional: Building2,
      Luxury: Gem,
      Travel: Plane,
      Search: Globe,
      Wealth: CreditCard,
      Social: Users,
      Reviews: Star,
      Hospitality: Home,
    };
    return icons[category] || Globe;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4" variant="outline">Free Marketing Toolkit</Badge>
            <h1 className="text-4xl md:text-5xl font-serif mb-4">
              Directory & Network Submissions
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Maximize Aurelia's visibility across UHNWI networks, luxury directories, and high-impact platforms. 
              Track your submissions and share across social media.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{UHNWI_DIRECTORIES.length}</div>
                <div className="text-sm text-muted-foreground">Total Directories</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-amber-500">{highPriorityCount}</div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-500">{freeCount}</div>
                <div className="text-sm text-muted-foreground">Free Submissions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{completedCount}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="directories" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="directories">Directory Submissions</TabsTrigger>
              <TabsTrigger value="social">Quick Social Share</TabsTrigger>
            </TabsList>

            <TabsContent value="directories" className="space-y-6">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Directory List */}
              <div className="grid md:grid-cols-2 gap-4">
                {filteredDirectories.map((directory) => {
                  const CategoryIcon = getCategoryIcon(directory.category);
                  const isCompleted = completedSubmissions.has(directory.id);
                  
                  return (
                    <motion.div
                      key={directory.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={isCompleted ? "opacity-60" : ""}
                    >
                      <Card className="h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <CategoryIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {directory.name}
                                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {directory.category}
                                  </Badge>
                                  <Badge 
                                    variant={directory.priority === "high" ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {directory.priority} priority
                                  </Badge>
                                  <Badge 
                                    variant={directory.submissionType === "free" ? "outline" : "secondary"}
                                    className={`text-xs ${directory.submissionType === "free" ? "text-green-600 border-green-600" : ""}`}
                                  >
                                    {directory.submissionType}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">{directory.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {directory.audienceSize}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {directory.estimatedImpact}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <Checkbox 
                                id={directory.id}
                                checked={isCompleted}
                                onCheckedChange={() => toggleSubmission(directory.id)}
                              />
                              <label htmlFor={directory.id} className="text-sm cursor-pointer">
                                Mark as done
                              </label>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openDirectory(directory.url, directory.name)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Quick Social Share
                  </CardTitle>
                  <CardDescription>
                    Share pre-written content with UTM tracking to all major platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(SHARE_CONTENT).map(([key, content]) => (
                    <div key={key} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{content.title}</h3>
                        <Badge variant="outline">{key}</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground whitespace-pre-line bg-muted/50 p-3 rounded-lg">
                        {content.text}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(SOCIAL_SHARE_LINKS).map(([platform, config]) => {
                          const Icon = config.icon;
                          return (
                            <Button
                              key={platform}
                              size="sm"
                              className={`${config.color} text-white hover:opacity-90`}
                              onClick={() => shareToSocial(platform as keyof typeof SOCIAL_SHARE_LINKS, content)}
                            >
                              <Icon className="h-4 w-4 mr-2" />
                              {config.name}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Additional Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Posting Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Linkedin className="h-4 w-4" /> LinkedIn
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Post Tuesday-Thursday, 8-10am</li>
                        <li>• Use 3-5 relevant hashtags</li>
                        <li>• Tag luxury industry leaders</li>
                        <li>• Add a carousel or video</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Instagram className="h-4 w-4" /> Instagram
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Post at 11am or 7-9pm</li>
                        <li>• Use 20-30 hashtags in first comment</li>
                        <li>• High-quality visuals essential</li>
                        <li>• Use Stories for behind-the-scenes</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Twitter className="h-4 w-4" /> X (Twitter)
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Post 3-5 times daily</li>
                        <li>• Use 1-2 hashtags max</li>
                        <li>• Engage with luxury influencers</li>
                        <li>• Share industry insights</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Facebook className="h-4 w-4" /> Facebook
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Post 1-2 times daily</li>
                        <li>• Video content performs best</li>
                        <li>• Join luxury lifestyle groups</li>
                        <li>• Use Facebook Events</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DirectorySubmissions;
