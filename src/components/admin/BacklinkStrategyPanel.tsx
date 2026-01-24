import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import {
  Link2,
  ExternalLink,
  Plus,
  Check,
  Clock,
  Target,
  Globe,
  Mail,
  Copy,
  TrendingUp,
  Star,
  AlertCircle,
  Send,
  FileText,
  Users,
  Newspaper,
  Building2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BacklinkOpportunity {
  id: string;
  category: string;
  name: string;
  url: string | null;
  domain_authority: number;
  status: string;
  type: string | null;
  priority: string;
}

// Backlink opportunity categories
const backlinkStrategies = [
  {
    category: "Luxury Publications",
    icon: Newspaper,
    priority: "high",
    opportunities: [
      { id: "r1", name: "Robb Report", url: "robbreport.com", da: 78, status: "pending", type: "Guest Post" },
      { id: "r2", name: "Luxury Daily", url: "luxurydaily.com", da: 65, status: "pending", type: "Press Release" },
      { id: "r3", name: "JustLuxe", url: "justluxe.com", da: 58, status: "pending", type: "Feature Article" },
      { id: "r4", name: "Elite Traveler", url: "elitetraveler.com", da: 55, status: "pending", type: "Interview" },
      { id: "r5", name: "Departures", url: "departures.com", da: 62, status: "pending", type: "Editorial" },
      { id: "r6", name: "How To Spend It", url: "htsi.ft.com", da: 85, status: "pending", type: "Feature" },
      { id: "r7", name: "Monocle", url: "monocle.com", da: 72, status: "pending", type: "Profile" },
    ],
  },
  {
    category: "Business & Finance",
    icon: TrendingUp,
    priority: "high",
    opportunities: [
      { id: "b1", name: "Forbes", url: "forbes.com", da: 95, status: "pending", type: "Contributor" },
      { id: "b2", name: "Business Insider", url: "businessinsider.com", da: 94, status: "pending", type: "Feature" },
      { id: "b3", name: "Bloomberg", url: "bloomberg.com", da: 93, status: "pending", type: "Interview" },
      { id: "b4", name: "Entrepreneur", url: "entrepreneur.com", da: 92, status: "pending", type: "Guest Post" },
      { id: "b5", name: "Inc.", url: "inc.com", da: 91, status: "pending", type: "Article" },
      { id: "b6", name: "Fast Company", url: "fastcompany.com", da: 90, status: "pending", type: "Profile" },
    ],
  },
  {
    category: "Travel & Lifestyle",
    icon: Globe,
    priority: "medium",
    opportunities: [
      { id: "t1", name: "Condé Nast Traveler", url: "cntraveler.com", da: 88, status: "pending", type: "Feature" },
      { id: "t2", name: "Travel + Leisure", url: "travelandleisure.com", da: 86, status: "pending", type: "Review" },
      { id: "t3", name: "AFAR", url: "afar.com", da: 75, status: "pending", type: "Article" },
      { id: "t4", name: "Fodor's", url: "fodors.com", da: 78, status: "pending", type: "Guide" },
      { id: "t5", name: "Lonely Planet", url: "lonelyplanet.com", da: 89, status: "pending", type: "Feature" },
    ],
  },
  {
    category: "Tech & AI",
    icon: Sparkles,
    priority: "medium",
    opportunities: [
      { id: "a1", name: "TechCrunch", url: "techcrunch.com", da: 94, status: "pending", type: "Startup Feature" },
      { id: "a2", name: "VentureBeat", url: "venturebeat.com", da: 90, status: "pending", type: "AI Article" },
      { id: "a3", name: "Wired", url: "wired.com", da: 93, status: "pending", type: "Profile" },
      { id: "a4", name: "The Verge", url: "theverge.com", da: 92, status: "pending", type: "Review" },
      { id: "a5", name: "Ars Technica", url: "arstechnica.com", da: 89, status: "pending", type: "Feature" },
    ],
  },
  {
    category: "Directories & Listings",
    icon: Building2,
    priority: "low",
    opportunities: [
      { id: "d1", name: "Crunchbase", url: "crunchbase.com", da: 91, status: "pending", type: "Company Profile" },
      { id: "d2", name: "LinkedIn Company", url: "linkedin.com", da: 98, status: "active", type: "Company Page" },
      { id: "d3", name: "G2", url: "g2.com", da: 88, status: "pending", type: "Software Listing" },
      { id: "d4", name: "Clutch", url: "clutch.co", da: 78, status: "pending", type: "Service Listing" },
      { id: "d5", name: "Capterra", url: "capterra.com", da: 87, status: "pending", type: "Software Review" },
      { id: "d6", name: "Product Hunt", url: "producthunt.com", da: 90, status: "pending", type: "Launch" },
    ],
  },
  {
    category: "HARO & PR",
    icon: Users,
    priority: "high",
    opportunities: [
      { id: "h1", name: "HARO (Cision)", url: "helpareporter.com", da: 75, status: "pending", type: "Expert Source" },
      { id: "h2", name: "Qwoted", url: "qwoted.com", da: 60, status: "pending", type: "Expert Quote" },
      { id: "h3", name: "SourceBottle", url: "sourcebottle.com", da: 55, status: "pending", type: "Media Query" },
      { id: "h4", name: "JournoRequests", url: "journorequests.com", da: 45, status: "pending", type: "Expert" },
      { id: "h5", name: "ResponseSource", url: "responsesource.com", da: 58, status: "pending", type: "Press" },
    ],
  },
];

// Pitch templates for outreach
const pitchTemplates = [
  {
    id: "luxury-lifestyle",
    title: "Luxury Lifestyle Feature",
    subject: "Story Idea: The Future of Ultra-Luxury Concierge Services",
    body: `Dear [Editor Name],

I'm reaching out from Aurelia Private Concierge, the world's first AI-powered concierge service designed exclusively for Ultra High Net Worth individuals.

We've recently launched an innovative approach that combines artificial intelligence with white-glove luxury service, and I believe your readers at [Publication] would find our story compelling.

Key angles:
• How AI is transforming the $25B luxury concierge industry
• What billionaires actually want from a concierge service
• The rise of "invisible luxury" and hyper-personalization

Would you be interested in a feature, interview, or exclusive data on UHNW lifestyle trends?

Best regards,
[Your Name]
Aurelia Private Concierge
press@aurelia-privateconcierge.com`,
  },
  {
    id: "tech-innovation",
    title: "Tech Innovation Pitch",
    subject: "AI Startup Revolutionizing Billionaire Services",
    body: `Hi [Editor Name],

Aurelia just launched the world's first voice-activated AI concierge for Ultra High Net Worth clients.

Our AI assistant, Orla, handles everything from private jet bookings to off-market real estate acquisitions—with bank-grade security and 24/7 availability.

Thought this might be interesting for [Publication]'s tech/AI coverage.

Key stats:
• 11+ service categories automated
• Response time: under 60 seconds
• Integration with 50+ luxury partners

Happy to share more details or arrange a demo.

Thanks,
[Your Name]`,
  },
  {
    id: "guest-post",
    title: "Guest Post Proposal",
    subject: "Guest Post Proposal: [Topic Idea]",
    body: `Dear [Editor Name],

I'm the [Your Title] at Aurelia Private Concierge, and I'd love to contribute a guest article to [Publication].

Proposed topics:
1. "5 Ways AI is Changing Luxury Travel Forever"
2. "Inside the World of Billionaire Lifestyle Management"
3. "The Psychology of Ultra-Premium Service"

These would be 1,500-2,000 word pieces with original research and expert insights.

I can provide exclusive data from our UHNW client base (anonymized, of course) to support the article.

Would any of these topics work for your editorial calendar?

Best,
[Your Name]`,
  },
];

// Article topic ideas for journalists
const articleIdeas = [
  "The Rise of AI Concierge Services: How Technology is Redefining Luxury",
  "What Do Billionaires Actually Want? Inside Ultra-Premium Service",
  "From Private Jets to Private Islands: The New Luxury Concierge Landscape",
  "Voice Assistants for the 1%: The Next Wave of Personal AI",
  "The $25 Billion Question: Can AI Replace Human Concierges?",
  "Invisible Luxury: Why UHNW Clients Demand Discretion Over Display",
  "The Psychology of White-Glove Service in the Digital Age",
  "London's New Luxury Startups: Challenging the Old Guard",
];

const BacklinkStrategyPanel = forwardRef<HTMLDivElement>((_, ref) => {
  const [opportunities, setOpportunities] = useState<BacklinkOpportunity[]>([]);
  const [groupedOpportunities, setGroupedOpportunities] = useState(backlinkStrategies);
  const [loading, setLoading] = useState(true);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [newOpportunity, setNewOpportunity] = useState({ 
    name: "", 
    url: "", 
    type: "", 
    category: "",
    domain_authority: 50,
    priority: "medium"
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = [
    "Luxury Publications",
    "Business & Finance",
    "Travel & Lifestyle",
    "Tech & AI",
    "Directories & Listings",
    "HARO & PR"
  ];

  const typeOptions = [
    "Guest Post",
    "Press Release",
    "Feature Article",
    "Interview",
    "Editorial",
    "Profile",
    "Contributor",
    "Company Profile",
    "Software Listing",
    "Expert Source"
  ];

  const handleAddOpportunity = async () => {
    if (!newOpportunity.name || !newOpportunity.category) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("backlink_opportunities")
        .insert({
          name: newOpportunity.name,
          url: newOpportunity.url || null,
          type: newOpportunity.type || null,
          category: newOpportunity.category,
          domain_authority: newOpportunity.domain_authority,
          priority: newOpportunity.priority,
          status: "pending"
        });

      if (error) throw error;

      toast.success("Opportunity added successfully");
      setNewOpportunity({ 
        name: "", 
        url: "", 
        type: "", 
        category: "",
        domain_authority: 50,
        priority: "medium"
      });
      setIsAddDialogOpen(false);
      fetchOpportunities();
    } catch (error) {
      console.error("Error adding opportunity:", error);
      toast.error("Failed to add opportunity");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch opportunities from database
  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("backlink_opportunities")
        .select("*")
        .order("domain_authority", { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setOpportunities(data);
        
        // Group by category
        const grouped = data.reduce((acc: any, opp: BacklinkOpportunity) => {
          if (!acc[opp.category]) {
            acc[opp.category] = [];
          }
          acc[opp.category].push({
            name: opp.name,
            url: opp.url || "",
            da: opp.domain_authority,
            status: opp.status,
            type: opp.type || "",
            id: opp.id,
          });
          return acc;
        }, {});

        // Convert to array format
        const groupedArray = Object.keys(grouped).map(category => ({
          category,
          icon: getCategoryIcon(category),
          priority: getPriorityFromCategory(category),
          opportunities: grouped[category],
        }));
        
        setGroupedOpportunities(groupedArray.length > 0 ? groupedArray : backlinkStrategies);
      }
    } catch (error) {
      console.error("Error fetching backlink opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      "Luxury Publications": Newspaper,
      "Business & Finance": TrendingUp,
      "Travel & Lifestyle": Globe,
      "Tech & AI": Sparkles,
      "Directories": Building2,
      "HARO & PR": Users,
    };
    return icons[category] || Globe;
  };

  const getPriorityFromCategory = (category: string) => {
    const priorities: Record<string, string> = {
      "Luxury Publications": "high",
      "Business & Finance": "high",
      "HARO & PR": "high",
      "Travel & Lifestyle": "medium",
      "Tech & AI": "medium",
      "Directories": "low",
    };
    return priorities[category] || "medium";
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const updateStatus = async (oppId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("backlink_opportunities")
        .update({ status: newStatus })
        .eq("id", oppId);

      if (error) throw error;
      
      toast.success("Status updated");
      fetchOpportunities();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const totalOpportunities = groupedOpportunities.reduce((acc, cat) => acc + cat.opportunities.length, 0);
  const activeLinks = groupedOpportunities.reduce(
    (acc, cat) => acc + cat.opportunities.filter((o: any) => o.status === "active").length,
    0
  );
  const pendingLinks = groupedOpportunities.reduce(
    (acc, cat) => acc + cat.opportunities.filter((o: any) => o.status === "pending").length,
    0
  );
  const outreachSent = groupedOpportunities.reduce(
    (acc, cat) => acc + cat.opportunities.filter((o: any) => o.status === "outreach").length,
    0
  );

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case "outreach":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Outreach Sent</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Declined</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-primary/20 text-primary border-primary/30">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-muted text-muted-foreground border-border">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <div ref={ref} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-foreground">Backlink Strategy</h2>
          <p className="text-muted-foreground">Track and manage link-building opportunities</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Backlink Opportunity</DialogTitle>
              <DialogDescription>
                Add a new publication or website for link-building outreach.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Publication Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Forbes, TechCrunch"
                  value={newOpportunity.name}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  placeholder="e.g., forbes.com"
                  value={newOpportunity.url}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, url: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newOpportunity.category}
                    onValueChange={(value) => setNewOpportunity({ ...newOpportunity, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Link Type</Label>
                  <Select
                    value={newOpportunity.type}
                    onValueChange={(value) => setNewOpportunity({ ...newOpportunity, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="da">Domain Authority (1-100)</Label>
                  <Input
                    id="da"
                    type="number"
                    min={1}
                    max={100}
                    value={newOpportunity.domain_authority}
                    onChange={(e) => setNewOpportunity({ ...newOpportunity, domain_authority: parseInt(e.target.value) || 50 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newOpportunity.priority}
                    onValueChange={(value) => setNewOpportunity({ ...newOpportunity, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddOpportunity} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Opportunity"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-light text-foreground">{totalOpportunities}</div>
            <div className="text-xs text-muted-foreground">Total Opportunities</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-light text-green-400">{activeLinks}</div>
            <div className="text-xs text-green-400/70">Active Backlinks</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-light text-blue-400">{outreachSent}</div>
            <div className="text-xs text-blue-400/70">Outreach Sent</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-light text-yellow-400">{pendingLinks}</div>
            <div className="text-xs text-yellow-400/70">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Backlink Goal Progress</span>
            <span className="text-sm font-medium text-foreground">{activeLinks} / 100</span>
          </div>
          <Progress value={(activeLinks / 100) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Target: 100 quality backlinks by Q2 2026
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="templates">Pitch Templates</TabsTrigger>
          <TabsTrigger value="ideas">Article Ideas</TabsTrigger>
        </TabsList>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-6">
          {groupedOpportunities.map((category, catIndex) => (
            <Card key={category.category} className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {category.icon && <category.icon className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-medium">{category.category}</CardTitle>
                      <CardDescription>{category.opportunities.length} opportunities</CardDescription>
                    </div>
                  </div>
                  {getPriorityBadge(category.priority)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.opportunities.map((opp, oppIndex) => (
                    <div
                      key={opp.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{opp.name}</span>
                          <a
                            href={`https://${opp.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          DA: {opp.da}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {opp.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(opp.status)}
                        <select
                          value={opp.status}
                          onChange={(e) => updateStatus(opp.id || opp.name, e.target.value)}
                          className="text-xs bg-background border border-border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="outreach">Outreach Sent</option>
                          <option value="active">Active</option>
                          <option value="rejected">Declined</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Pitch Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {pitchTemplates.map((template) => (
            <Card key={template.id} className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">{template.title}</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(template.body, template.title)}
                  >
                    {copiedItem === template.title ? (
                      <Check className="w-4 h-4 mr-1" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    Copy
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Subject: {template.subject}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/20 p-4 rounded-lg overflow-x-auto">
                  {template.body}
                </pre>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Article Ideas Tab */}
        <TabsContent value="ideas" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Suggested Article Topics</CardTitle>
              <CardDescription>
                Share these with journalists or use for guest posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {articleIdeas.map((idea, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{idea}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(idea, "Article idea")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Embeddable Badge */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Embeddable Partner Badge</CardTitle>
              <CardDescription>
                Offer this to partners for their websites (instant backlink)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center p-8 bg-muted/20 rounded-lg">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-primary/30 rounded-lg">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Aurelia Certified Partner</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Embed code:</p>
                <div className="relative">
                  <pre className="text-xs bg-muted/20 p-3 rounded-lg overflow-x-auto">
{`<a href="https://aurelia-privateconcierge.com/partners" target="_blank" rel="noopener">
  <img src="https://aurelia-privateconcierge.com/badges/partner-badge.svg" 
       alt="Aurelia Certified Partner" width="200" />
</a>`}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      handleCopy(
                        `<a href="https://aurelia-privateconcierge.com/partners" target="_blank" rel="noopener"><img src="https://aurelia-privateconcierge.com/badges/partner-badge.svg" alt="Aurelia Certified Partner" width="200" /></a>`,
                        "Badge embed code"
                      )
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

BacklinkStrategyPanel.displayName = "BacklinkStrategyPanel";

export default BacklinkStrategyPanel;
