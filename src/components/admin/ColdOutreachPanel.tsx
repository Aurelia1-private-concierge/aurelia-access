import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Search,
  Target,
  Mail,
  Play,
  Pause,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  Filter,
  Download,
  Calendar,
  Globe,
  Building2,
  Users,
  TrendingUp,
  Sparkles,
  Bot,
  Eye,
  Edit,
  Copy,
  Plus,
  Settings,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { format, addDays, differenceInDays } from "date-fns";
import { useAdminAuditLog } from "@/hooks/useAdminAuditLog";

interface OutreachCampaign {
  id: string;
  name: string;
  category: string;
  status: "draft" | "active" | "paused" | "completed";
  target_count: number;
  sent_count: number;
  opened_count: number;
  replied_count: number;
  converted_count: number;
  sequence_steps: number;
  created_at: string;
  start_date: string | null;
}

interface OutreachSequence {
  step: number;
  delay_days: number;
  subject: string;
  body: string;
  type: "email" | "linkedin" | "phone";
}

interface ProspectSource {
  id: string;
  name: string;
  type: "directory" | "linkedin" | "google" | "referral" | "manual";
  category: string;
  url: string | null;
  leads_found: number;
  last_scraped: string | null;
  is_active: boolean;
}

const categoryOptions = [
  { value: "private_aviation", label: "Private Aviation" },
  { value: "yacht_charter", label: "Yacht Charter" },
  { value: "real_estate", label: "Luxury Real Estate" },
  { value: "concierge", label: "Concierge Services" },
  { value: "chauffeur", label: "Ground Transportation" },
  { value: "security", label: "Security Services" },
  { value: "events", label: "VIP Events" },
  { value: "wellness", label: "Wellness & Spa" },
  { value: "dining", label: "Fine Dining" },
  { value: "travel", label: "Travel Agencies" },
  { value: "shopping", label: "Personal Shopping" },
  { value: "collectibles", label: "Collectibles & Art" },
];

const leadSources: ProspectSource[] = [
  { id: "1", name: "Private Jet Card Comparison", type: "directory", category: "private_aviation", url: "https://privatejetcardcomparison.com", leads_found: 156, last_scraped: "2025-01-10", is_active: true },
  { id: "2", name: "Yachting Pages Directory", type: "directory", category: "yacht_charter", url: "https://yachtingpages.com", leads_found: 89, last_scraped: "2025-01-08", is_active: true },
  { id: "3", name: "Luxury Real Estate Brokers", type: "linkedin", category: "real_estate", url: null, leads_found: 234, last_scraped: "2025-01-12", is_active: true },
  { id: "4", name: "UHNW Family Office Network", type: "referral", category: "concierge", url: null, leads_found: 45, last_scraped: null, is_active: true },
  { id: "5", name: "Forbes Luxury Council", type: "directory", category: "events", url: "https://councils.forbes.com/luxury", leads_found: 67, last_scraped: "2025-01-05", is_active: false },
  { id: "6", name: "Google Maps - Private Security", type: "google", category: "security", url: null, leads_found: 112, last_scraped: "2025-01-11", is_active: true },
];

const defaultSequence: OutreachSequence[] = [
  {
    step: 1,
    delay_days: 0,
    type: "email",
    subject: "Partnership Opportunity with Aurelia Private Concierge",
    body: `Dear {{contact_name}},

I hope this message finds you well. I'm reaching out from Aurelia Private Concierge, a bespoke luxury lifestyle management service catering to ultra-high-net-worth individuals worldwide.

We're currently expanding our partner network in the {{category}} space and believe {{company_name}} would be an excellent fit for our discerning clientele.

Our members include entrepreneurs, executives, and families with a minimum net worth of $10M who expect nothing but the finest experiences. We handle everything from private aviation to exclusive event access.

Would you be open to a brief conversation about a potential partnership?

Best regards,
The Aurelia Team`,
  },
  {
    step: 2,
    delay_days: 3,
    type: "email",
    subject: "Re: Partnership Opportunity with Aurelia Private Concierge",
    body: `Hi {{contact_name}},

I wanted to follow up on my previous message about partnering with Aurelia Private Concierge.

Our model is straightforward: we refer high-value clients to trusted partners and handle all the coordination. Our partners benefit from:

• Pre-qualified UHNW clientele
• No marketing spend required
• Seamless booking coordination
• Priority status for our members

I'd love to schedule a 15-minute call to discuss how we could work together.

Best,
The Aurelia Team`,
  },
  {
    step: 3,
    delay_days: 5,
    type: "email",
    subject: "Final follow-up: {{company_name}} + Aurelia",
    body: `Hi {{contact_name}},

This will be my last note. I understand you're busy, but I wanted to make one final attempt to connect.

If {{company_name}} is interested in receiving referrals from our network of affluent members, I'd be happy to send over more details about our partnership program.

If the timing isn't right, no worries at all. Feel free to reach out whenever you're ready to explore this opportunity.

Warmly,
The Aurelia Team`,
  },
];

const ColdOutreachPanel = () => {
  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([]);
  const [sources, setSources] = useState<ProspectSource[]>(leadSources);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("campaigns");
  
  // Campaign creation state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    category: "",
    target_keywords: "",
    daily_limit: 25,
    auto_follow_up: true,
  });
  const [sequence, setSequence] = useState<OutreachSequence[]>(defaultSequence);
  
  // Finder state
  const [finderDialogOpen, setFinderDialogOpen] = useState(false);
  const [finderCategory, setFinderCategory] = useState("");
  const [finderLocation, setFinderLocation] = useState("");
  const [finderKeywords, setFinderKeywords] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const { logAdminAction } = useAdminAuditLog();

  // Mock data for demonstration
  useEffect(() => {
    const mockCampaigns: OutreachCampaign[] = [
      {
        id: "1",
        name: "Private Aviation Partners Q1",
        category: "private_aviation",
        status: "active",
        target_count: 150,
        sent_count: 87,
        opened_count: 42,
        replied_count: 12,
        converted_count: 3,
        sequence_steps: 3,
        created_at: "2025-01-01",
        start_date: "2025-01-05",
      },
      {
        id: "2",
        name: "Yacht Charter Network",
        category: "yacht_charter",
        status: "active",
        target_count: 75,
        sent_count: 45,
        opened_count: 28,
        replied_count: 8,
        converted_count: 2,
        sequence_steps: 3,
        created_at: "2025-01-08",
        start_date: "2025-01-10",
      },
      {
        id: "3",
        name: "Luxury Real Estate Brokers",
        category: "real_estate",
        status: "paused",
        target_count: 200,
        sent_count: 120,
        opened_count: 65,
        replied_count: 15,
        converted_count: 4,
        sequence_steps: 3,
        created_at: "2024-12-15",
        start_date: "2024-12-20",
      },
      {
        id: "4",
        name: "Security Services Outreach",
        category: "security",
        status: "draft",
        target_count: 50,
        sent_count: 0,
        opened_count: 0,
        replied_count: 0,
        converted_count: 0,
        sequence_steps: 3,
        created_at: "2025-01-12",
        start_date: null,
      },
    ];
    setCampaigns(mockCampaigns);
  }, []);

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.status === "active").length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
    totalReplies: campaigns.reduce((sum, c) => sum + c.replied_count, 0),
    totalConverted: campaigns.reduce((sum, c) => sum + c.converted_count, 0),
    avgOpenRate: campaigns.length > 0 
      ? Math.round((campaigns.reduce((sum, c) => sum + (c.sent_count > 0 ? (c.opened_count / c.sent_count) * 100 : 0), 0)) / campaigns.length)
      : 0,
    avgReplyRate: campaigns.length > 0
      ? Math.round((campaigns.reduce((sum, c) => sum + (c.sent_count > 0 ? (c.replied_count / c.sent_count) * 100 : 0), 0)) / campaigns.length)
      : 0,
  };

  const handleToggleCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === "active" ? "paused" : "active";
          logAdminAction("admin.campaign_status_changed", "campaign", id, { new_status: newStatus });
          toast({ title: `Campaign ${newStatus === "active" ? "Activated" : "Paused"}` });
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.category) {
      toast({ title: "Error", description: "Name and category required", variant: "destructive" });
      return;
    }

    const campaign: OutreachCampaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      category: newCampaign.category,
      status: "draft",
      target_count: 0,
      sent_count: 0,
      opened_count: 0,
      replied_count: 0,
      converted_count: 0,
      sequence_steps: sequence.length,
      created_at: new Date().toISOString(),
      start_date: null,
    };

    setCampaigns((prev) => [campaign, ...prev]);
    setCreateDialogOpen(false);
    setNewCampaign({ name: "", category: "", target_keywords: "", daily_limit: 25, auto_follow_up: true });
    
    logAdminAction("admin.campaign_created", "campaign", campaign.id, { name: campaign.name });
    toast({ title: "Campaign Created", description: "Your campaign is ready as a draft" });
  };

  const handleAutoFind = async () => {
    if (!finderCategory) {
      toast({ title: "Error", description: "Please select a category", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    
    // Simulate AI-powered search
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    const mockResults = [
      { id: "f1", company: "Jet Linx Aviation", contact: "James Wilson", email: "partnerships@jetlinx.com", location: "Omaha, NE", score: 95 },
      { id: "f2", company: "XO Private Aviation", contact: "Sarah Chen", email: "partners@flyxo.com", location: "New York, NY", score: 92 },
      { id: "f3", company: "VistaJet", contact: "Michael Ross", email: "bdev@vistajet.com", location: "London, UK", score: 88 },
      { id: "f4", company: "NetJets", contact: "Emily Taylor", email: "commercial@netjets.com", location: "Columbus, OH", score: 85 },
      { id: "f5", company: "Flexjet", contact: "David Kim", email: "partnerships@flexjet.com", location: "Cleveland, OH", score: 82 },
    ];
    
    setSearchResults(mockResults);
    setIsSearching(false);
    
    toast({ title: "Search Complete", description: `Found ${mockResults.length} potential partners` });
  };

  const handleAddToProspects = async (results: any[]) => {
    // Add selected results to prospects table
    for (const result of results) {
      await (supabase as any).from("partner_prospects").insert({
        company_name: result.company,
        contact_name: result.contact,
        email: result.email,
        category: finderCategory,
        source: "auto_finder",
        status: "new",
        priority: result.score >= 90 ? "high" : result.score >= 80 ? "medium" : "low",
      });
    }
    
    toast({ title: "Prospects Added", description: `${results.length} prospects added to your pipeline` });
    setFinderDialogOpen(false);
    setSearchResults([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "paused":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getCategoryLabel = (value: string) => {
    return categoryOptions.find((c) => c.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground mb-2 flex items-center gap-3">
              <Zap className="h-8 w-8 text-primary" />
              Cold Outreach Center
            </h1>
            <p className="text-muted-foreground">
              Automated partner discovery and multi-step email sequences
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFinderDialogOpen(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Auto-Find Partners
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
      >
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-2xl font-semibold">{stats.totalCampaigns}</p>
              <p className="text-sm text-muted-foreground">Campaigns</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-2xl font-semibold text-green-500">{stats.activeCampaigns}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-2xl font-semibold">{stats.totalSent}</p>
              <p className="text-sm text-muted-foreground">Emails Sent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-2xl font-semibold">{stats.avgOpenRate}%</p>
              <p className="text-sm text-muted-foreground">Open Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-2xl font-semibold">{stats.totalReplies}</p>
              <p className="text-sm text-muted-foreground">Replies</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-2xl font-semibold">{stats.avgReplyRate}%</p>
              <p className="text-sm text-muted-foreground">Reply Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex flex-col">
              <p className="text-2xl font-semibold text-primary">{stats.totalConverted}</p>
              <p className="text-sm text-muted-foreground">Converted</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="campaigns">
            <Mail className="h-4 w-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="sources">
            <Globe className="h-4 w-4 mr-2" />
            Lead Sources
          </TabsTrigger>
          <TabsTrigger value="sequences">
            <MessageSquare className="h-4 w-4 mr-2" />
            Email Sequences
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card className="bg-card/50 border-border/30">
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Manage your outreach campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-center">Sent</TableHead>
                    <TableHead className="text-center">Opened</TableHead>
                    <TableHead className="text-center">Replied</TableHead>
                    <TableHead className="text-center">Converted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Created {format(new Date(campaign.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryLabel(campaign.category)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      </TableCell>
                      <TableCell className="w-32">
                        <div className="space-y-1">
                          <Progress 
                            value={campaign.target_count > 0 ? (campaign.sent_count / campaign.target_count) * 100 : 0} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground">
                            {campaign.sent_count} / {campaign.target_count}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{campaign.sent_count}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-500">{campaign.opened_count}</span>
                        {campaign.sent_count > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({Math.round((campaign.opened_count / campaign.sent_count) * 100)}%)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-blue-500">{campaign.replied_count}</span>
                        {campaign.sent_count > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({Math.round((campaign.replied_count / campaign.sent_count) * 100)}%)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-primary font-semibold">{campaign.converted_count}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={campaign.status === "active" ? "outline" : "default"}
                            onClick={() => handleToggleCampaign(campaign.id)}
                            disabled={campaign.status === "draft" && campaign.target_count === 0}
                          >
                            {campaign.status === "active" ? (
                              <><Pause className="h-3 w-3 mr-1" /> Pause</>
                            ) : (
                              <><Play className="h-3 w-3 mr-1" /> Start</>
                            )}
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card className="bg-card/50 border-border/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lead Sources</CardTitle>
                  <CardDescription>Directories and databases for finding partners</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Leads Found</TableHead>
                    <TableHead>Last Scraped</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{source.name}</p>
                            {source.url && (
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                {source.url}
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{source.type}</Badge>
                      </TableCell>
                      <TableCell>{getCategoryLabel(source.category)}</TableCell>
                      <TableCell className="text-center font-medium">{source.leads_found}</TableCell>
                      <TableCell>
                        {source.last_scraped 
                          ? format(new Date(source.last_scraped), "MMM d, yyyy")
                          : "Never"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={source.is_active} />
                          <span className="text-sm">{source.is_active ? "Active" : "Inactive"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Scrape
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sequences Tab */}
        <TabsContent value="sequences" className="space-y-4">
          <Card className="bg-card/50 border-border/30">
            <CardHeader>
              <CardTitle>Email Sequence Templates</CardTitle>
              <CardDescription>Multi-step follow-up sequences for cold outreach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {defaultSequence.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-border/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {step.step}
                      </div>
                      <div>
                        <p className="font-medium">Step {step.step}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {step.delay_days === 0 ? "Immediate" : `${step.delay_days} days after previous`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Subject</Label>
                      <p className="text-sm font-medium">{step.subject}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Preview</Label>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {step.body.split('\n').slice(0, 3).join(' ')}...
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border/30">
              <CardHeader>
                <CardTitle>Performance by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryOptions.slice(0, 6).map((category) => {
                    const categoryStats = campaigns.filter((c) => c.category === category.value);
                    const sent = categoryStats.reduce((sum, c) => sum + c.sent_count, 0);
                    const replies = categoryStats.reduce((sum, c) => sum + c.replied_count, 0);
                    const rate = sent > 0 ? Math.round((replies / sent) * 100) : 0;
                    
                    return (
                      <div key={category.value} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{category.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{sent} sent</span>
                          <Badge variant={rate > 10 ? "default" : "outline"}>
                            {rate}% reply rate
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border/30">
              <CardHeader>
                <CardTitle>Best Performing Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                    <div>
                      <p className="font-medium">Partnership Introduction</p>
                      <p className="text-sm text-muted-foreground">Step 1 - Initial Contact</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 font-semibold">48% open rate</p>
                      <p className="text-xs text-muted-foreground">12% reply rate</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                    <div>
                      <p className="font-medium">Value Proposition</p>
                      <p className="text-sm text-muted-foreground">Step 2 - Follow Up</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-500 font-semibold">35% open rate</p>
                      <p className="text-xs text-muted-foreground">8% reply rate</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                    <div>
                      <p className="font-medium">Final Touch</p>
                      <p className="text-sm text-muted-foreground">Step 3 - Last Chance</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-500 font-semibold">22% open rate</p>
                      <p className="text-xs text-muted-foreground">5% reply rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Outreach Campaign</DialogTitle>
            <DialogDescription>
              Set up a new automated outreach campaign
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g., Q1 Aviation Partners"
                />
              </div>
              <div className="space-y-2">
                <Label>Target Category</Label>
                <Select
                  value={newCampaign.category}
                  onValueChange={(v) => setNewCampaign({ ...newCampaign, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Target Keywords</Label>
              <Input
                value={newCampaign.target_keywords}
                onChange={(e) => setNewCampaign({ ...newCampaign, target_keywords: e.target.value })}
                placeholder="e.g., private jet, charter, luxury aviation"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Daily Send Limit</Label>
                <Input
                  type="number"
                  value={newCampaign.daily_limit}
                  onChange={(e) => setNewCampaign({ ...newCampaign, daily_limit: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-3 pt-7">
                <Switch
                  checked={newCampaign.auto_follow_up}
                  onCheckedChange={(v) => setNewCampaign({ ...newCampaign, auto_follow_up: v })}
                />
                <Label>Enable auto follow-ups</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign}>
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-Find Partners Dialog */}
      <Dialog open={finderDialogOpen} onOpenChange={setFinderDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Partner Finder
            </DialogTitle>
            <DialogDescription>
              Automatically discover and qualify potential partners using AI
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={finderCategory} onValueChange={setFinderCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={finderLocation}
                  onChange={(e) => setFinderLocation(e.target.value)}
                  placeholder="e.g., New York, London"
                />
              </div>
              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input
                  value={finderKeywords}
                  onChange={(e) => setFinderKeywords(e.target.value)}
                  placeholder="e.g., luxury, premium"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleAutoFind} 
              className="w-full" 
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Searching with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Find Partners
                </>
              )}
            </Button>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Found {searchResults.length} potential partners</p>
                  <Button size="sm" onClick={() => handleAddToProspects(searchResults)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add All to Prospects
                  </Button>
                </div>
                <div className="border border-border/50 rounded-lg divide-y divide-border/30">
                  {searchResults.map((result) => (
                    <div key={result.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{result.company}</p>
                          <p className="text-sm text-muted-foreground">
                            {result.contact} • {result.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={result.score >= 90 ? "bg-green-500/10 text-green-500" : result.score >= 80 ? "bg-amber-500/10 text-amber-500" : ""}>
                          {result.score}% match
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ColdOutreachPanel;
