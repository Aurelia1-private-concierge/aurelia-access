import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
  Plus,
  Mail,
  Phone,
  Globe,
  Calendar,
  ChevronDown,
  ChevronUp,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Filter,
  Download,
  RefreshCw,
  ExternalLink,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAdminAuditLog } from "@/hooks/useAdminAuditLog";
import { Label } from "@/components/ui/label";

interface PartnerProspect {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  category: string;
  subcategory: string | null;
  coverage_regions: string[] | null;
  description: string | null;
  source: string;
  status: string;
  priority: string;
  notes: string | null;
  last_contacted_at: string | null;
  follow_up_date: string | null;
  created_at: string;
}

interface OutreachTemplate {
  id: string;
  name: string;
  category: string | null;
  subject: string;
  body: string;
  variables: string[] | null;
  is_active: boolean;
}

interface OutreachLog {
  id: string;
  prospect_id: string;
  outreach_type: string;
  subject: string | null;
  content: string | null;
  sent_at: string;
  response_received: boolean;
  response_notes: string | null;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  contacted: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  responded: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  interested: "bg-green-500/10 text-green-500 border-green-500/20",
  negotiating: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  converted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  declined: "bg-red-500/10 text-red-500 border-red-500/20",
  inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-500/10 text-red-500",
  medium: "bg-amber-500/10 text-amber-500",
  low: "bg-green-500/10 text-green-500",
};

const categoryLabels: Record<string, string> = {
  private_aviation: "Private Aviation",
  yacht_charter: "Yacht Charter",
  real_estate: "Real Estate",
  concierge: "Concierge Services",
  chauffeur: "Ground Transportation",
  security: "Security",
  events: "VIP Events",
  wellness: "Wellness",
  dining: "Fine Dining",
  travel: "Travel",
  shopping: "Personal Shopping",
  collectibles: "Collectibles",
};

const PartnerDiscoveryPanel = () => {
  const [prospects, setProspects] = useState<PartnerProspect[]>([]);
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [outreachDialogOpen, setOutreachDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [bulkOutreachDialogOpen, setBulkOutreachDialogOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<PartnerProspect | null>(null);
  const [outreachLogs, setOutreachLogs] = useState<OutreachLog[]>([]);
  
  const [newProspect, setNewProspect] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    website: "",
    category: "",
    description: "",
    priority: "medium",
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [bulkSendingProgress, setBulkSendingProgress] = useState({ sent: 0, total: 0, inProgress: false });
  
  // Bulk outreach filters
  const [bulkCategoryFilter, setBulkCategoryFilter] = useState("all");
  const [bulkStatusFilter, setBulkStatusFilter] = useState("all");
  const [bulkPriorityFilter, setBulkPriorityFilter] = useState("all");
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [customSubject, setCustomSubject] = useState("Exclusive Partnership Invitation from Aurelia");
  const [customMessage, setCustomMessage] = useState("");

  const { logAdminAction, logListAccess } = useAdminAuditLog();

  const fetchProspects = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("partner_prospects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProspects(data || []);
      logListAccess("partner", { filter: statusFilter, category: categoryFilter }, data?.length || 0);
    } catch (err) {
      console.error("Error fetching prospects:", err);
      toast({ title: "Error", description: "Failed to load prospects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("outreach_templates")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
    }
  };

  const fetchOutreachLogs = async (prospectId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from("partner_outreach_logs")
        .select("*")
        .eq("prospect_id", prospectId)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      setOutreachLogs(data || []);
    } catch (err) {
      console.error("Error fetching outreach logs:", err);
    }
  };

  useEffect(() => {
    fetchProspects();
    fetchTemplates();
  }, []);

  const filteredProspects = prospects.filter((p) => {
    const matchesSearch =
      p.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || p.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const stats = {
    total: prospects.length,
    new: prospects.filter((p) => p.status === "new").length,
    contacted: prospects.filter((p) => p.status === "contacted").length,
    interested: prospects.filter((p) => p.status === "interested").length,
    converted: prospects.filter((p) => p.status === "converted").length,
  };

  const handleAddProspect = async () => {
    if (!newProspect.company_name || !newProspect.category) {
      toast({ title: "Error", description: "Company name and category are required", variant: "destructive" });
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from("partner_prospects")
        .insert([newProspect]);

      if (error) throw error;

      toast({ title: "Success", description: "Prospect added successfully" });
      setAddDialogOpen(false);
      setNewProspect({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        website: "",
        category: "",
        description: "",
        priority: "medium",
      });
      fetchProspects();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to add prospect", variant: "destructive" });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from("partner_prospects")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setProspects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
      
      logAdminAction("admin.service_request_status_changed", "partner", id, { new_status: newStatus });
      toast({ title: "Status Updated" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template && selectedProspect) {
      let subject = template.subject;
      let body = template.body;

      // Replace variables
      const replacements: Record<string, string> = {
        "{{company_name}}": selectedProspect.company_name,
        "{{contact_name}}": selectedProspect.contact_name || "Partner Team",
        "{{sender_name}}": "The Aurelia Team",
        "{{sender_email}}": "partnerships@aurelia-concierge.com",
        "{{service_type}}": categoryLabels[selectedProspect.category] || selectedProspect.category,
      };

      Object.entries(replacements).forEach(([key, value]) => {
        subject = subject.replace(new RegExp(key, "g"), value);
        body = body.replace(new RegExp(key, "g"), value);
      });

      setEmailSubject(subject);
      setEmailBody(body);
    }
    setSelectedTemplate(templateId);
  };

  const handleSendOutreach = async () => {
    if (!selectedProspect || !emailSubject || !emailBody) {
      toast({ title: "Error", description: "Please complete the email", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      // Log the outreach
      const { error: logError } = await (supabase as any)
        .from("partner_outreach_logs")
        .insert([{
          prospect_id: selectedProspect.id,
          outreach_type: "email",
          subject: emailSubject,
          content: emailBody,
        }]);

      if (logError) throw logError;

      // Update prospect status
      await (supabase as any)
        .from("partner_prospects")
        .update({
          status: "contacted",
          last_contacted_at: new Date().toISOString(),
        })
        .eq("id", selectedProspect.id);

      // Send actual email via edge function
      if (selectedProspect.email) {
        await supabase.functions.invoke("send-email", {
          body: {
            to: selectedProspect.email,
            subject: emailSubject,
            html: emailBody.replace(/\n/g, "<br>"),
          },
        });
      }

      logAdminAction("admin.notification_sent", "partner", selectedProspect.id, {
        type: "outreach_email",
        recipient: selectedProspect.email,
      });

      toast({ title: "Outreach Sent", description: `Email sent to ${selectedProspect.company_name}` });
      setOutreachDialogOpen(false);
      setSelectedProspect(null);
      setEmailSubject("");
      setEmailBody("");
      setSelectedTemplate("");
      fetchProspects();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to send outreach", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleViewDetails = async (prospect: PartnerProspect) => {
    setSelectedProspect(prospect);
    await fetchOutreachLogs(prospect.id);
    setDetailDialogOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ["Company", "Contact", "Email", "Category", "Status", "Priority", "Website", "Created"];
    const rows = filteredProspects.map((p) => [
      p.company_name,
      p.contact_name || "",
      p.email || "",
      categoryLabels[p.category] || p.category,
      p.status,
      p.priority,
      p.website || "",
      format(new Date(p.created_at), "yyyy-MM-dd"),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `partner-prospects-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get prospects eligible for bulk outreach with filters applied
  const getFilteredEligibleProspects = () => {
    return prospects.filter((p) => {
      // Must have email and not be converted/declined
      if (!p.email || ["converted", "declined"].includes(p.status)) return false;
      
      // Apply bulk filters
      if (bulkCategoryFilter !== "all" && p.category !== bulkCategoryFilter) return false;
      if (bulkStatusFilter !== "all" && p.status !== bulkStatusFilter) return false;
      if (bulkPriorityFilter !== "all" && p.priority !== bulkPriorityFilter) return false;
      
      return true;
    });
  };

  const eligibleForOutreach = getFilteredEligibleProspects();

  const handleBulkOutreach = async () => {
    const targetProspects = getFilteredEligibleProspects();
    
    if (targetProspects.length === 0) {
      toast({ title: "No Eligible Prospects", description: "No prospects match your filters.", variant: "destructive" });
      return;
    }

    setBulkSendingProgress({ sent: 0, total: targetProspects.length, inProgress: true });

    let successCount = 0;
    let failCount = 0;

    for (const prospect of targetProspects) {
      try {
        const { data, error } = await supabase.functions.invoke("partner-invite", {
          body: {
            prospect_id: prospect.id,
            company_name: prospect.company_name,
            contact_email: prospect.email,
            contact_name: prospect.contact_name,
            category: prospect.category,
            website: prospect.website,
            description: prospect.description,
            coverage_regions: prospect.coverage_regions,
            // Custom message if enabled
            ...(useCustomMessage && customMessage && {
              custom_subject: customSubject,
              custom_message: customMessage,
            }),
          },
        });

        if (error) throw error;
        successCount++;
      } catch (err) {
        console.error(`Failed to send to ${prospect.company_name}:`, err);
        failCount++;
      }

      setBulkSendingProgress((prev) => ({ ...prev, sent: prev.sent + 1 }));
      
      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setBulkSendingProgress((prev) => ({ ...prev, inProgress: false }));
    setBulkOutreachDialogOpen(false);

    logAdminAction("admin.notification_sent", "partner", undefined, {
      type: "bulk_outreach",
      success_count: successCount,
      fail_count: failCount,
      filters: { category: bulkCategoryFilter, status: bulkStatusFilter, priority: bulkPriorityFilter },
      custom_message: useCustomMessage,
    });

    toast({
      title: "Bulk Outreach Complete",
      description: `Sent ${successCount} invitations${failCount > 0 ? `, ${failCount} failed` : ""}.`,
    });

    // Reset filters
    setBulkCategoryFilter("all");
    setBulkStatusFilter("all");
    setBulkPriorityFilter("all");
    setUseCustomMessage(false);
    setCustomMessage("");
    
    fetchProspects();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground mb-2">Partner Discovery</h1>
            <p className="text-muted-foreground">
              Find, track, and onboard luxury service partners worldwide
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setBulkOutreachDialogOpen(true)}
              disabled={eligibleForOutreach.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Broadcast to All ({eligibleForOutreach.length})
            </Button>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Prospect
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Star className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.new}</p>
                <p className="text-sm text-muted-foreground">New</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Mail className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.contacted}</p>
                <p className="text-sm text-muted-foreground">Contacted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.interested}</p>
                <p className="text-sm text-muted-foreground">Interested</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Building2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.converted}</p>
                <p className="text-sm text-muted-foreground">Converted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prospects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="negotiating">Negotiating</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full md:w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchProspects} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Prospects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Partner Prospects</CardTitle>
            <CardDescription>
              {filteredProspects.length} prospects found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : filteredProspects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No prospects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProspects.map((prospect) => (
                    <TableRow key={prospect.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{prospect.company_name}</p>
                          {prospect.website && (
                            <a
                              href={prospect.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                            >
                              <Globe className="h-3 w-3" />
                              {new URL(prospect.website).hostname}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[prospect.category] || prospect.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {prospect.contact_name && (
                            <p className="text-sm">{prospect.contact_name}</p>
                          )}
                          {prospect.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {prospect.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={prospect.status}
                          onValueChange={(v) => handleStatusChange(prospect.id, v)}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <Badge variant="outline" className={statusColors[prospect.status]}>
                              {prospect.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="responded">Responded</SelectItem>
                            <SelectItem value="interested">Interested</SelectItem>
                            <SelectItem value="negotiating">Negotiating</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[prospect.priority]}>
                          {prospect.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {prospect.last_contacted_at
                          ? format(new Date(prospect.last_contacted_at), "MMM d, yyyy")
                          : "Never"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(prospect)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedProspect(prospect);
                              setOutreachDialogOpen(true);
                            }}
                            disabled={!prospect.email}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Prospect Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Partner Prospect</DialogTitle>
            <DialogDescription>
              Add a new potential partner to track
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  value={newProspect.company_name}
                  onChange={(e) => setNewProspect({ ...newProspect, company_name: e.target.value })}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={newProspect.category}
                  onValueChange={(v) => setNewProspect({ ...newProspect, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input
                  value={newProspect.contact_name}
                  onChange={(e) => setNewProspect({ ...newProspect, contact_name: e.target.value })}
                  placeholder="Contact person"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newProspect.email}
                  onChange={(e) => setNewProspect({ ...newProspect, email: e.target.value })}
                  placeholder="email@company.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={newProspect.phone}
                  onChange={(e) => setNewProspect({ ...newProspect, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={newProspect.website}
                  onChange={(e) => setNewProspect({ ...newProspect, website: e.target.value })}
                  placeholder="https://company.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={newProspect.priority}
                onValueChange={(v) => setNewProspect({ ...newProspect, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newProspect.description}
                onChange={(e) => setNewProspect({ ...newProspect, description: e.target.value })}
                placeholder="Notes about this prospect..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProspect}>Add Prospect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Outreach Dialog */}
      <Dialog open={outreachDialogOpen} onOpenChange={setOutreachDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Outreach Email</DialogTitle>
            <DialogDescription>
              Compose and send a partnership inquiry to {selectedProspect?.company_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Template</Label>
              <Select value={selectedTemplate} onValueChange={handleSelectTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template or compose custom" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input value={selectedProspect?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Compose your message..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOutreachDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendOutreach} disabled={isSending}>
              {isSending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProspect?.company_name}</DialogTitle>
            <DialogDescription>
              {categoryLabels[selectedProspect?.category || ""] || selectedProspect?.category}
            </DialogDescription>
          </DialogHeader>
          {selectedProspect && (
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">Outreach History</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p>{selectedProspect.contact_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{selectedProspect.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{selectedProspect.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    {selectedProspect.website ? (
                      <a
                        href={selectedProspect.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p>—</p>
                    )}
                  </div>
                </div>
                {selectedProspect.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="bg-muted/30 p-3 rounded-lg text-sm">{selectedProspect.description}</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="history" className="pt-4">
                {outreachLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No outreach history yet</p>
                ) : (
                  <div className="space-y-4">
                    {outreachLogs.map((log) => (
                      <div key={log.id} className="border border-border/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{log.subject}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.sent_at), "MMM d, yyyy HH:mm")}
                          </span>
                        </div>
                        {log.response_received && (
                          <Badge className="bg-green-500/10 text-green-500">Response Received</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Outreach Dialog */}
      <Dialog open={bulkOutreachDialogOpen} onOpenChange={(open) => {
        setBulkOutreachDialogOpen(open);
        if (!open) {
          setBulkCategoryFilter("all");
          setBulkStatusFilter("all");
          setBulkPriorityFilter("all");
          setUseCustomMessage(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Broadcast Partnership Invitation
            </DialogTitle>
            <DialogDescription>
              Send customized invitations to filtered prospect segments.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="filters">
                <Filter className="h-4 w-4 mr-2" />
                Filter & Target
              </TabsTrigger>
              <TabsTrigger value="customize">
                <MessageSquare className="h-4 w-4 mr-2" />
                Customize Message
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="filters" className="space-y-4 pt-4">
              {/* Filter Controls */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <Select value={bulkCategoryFilter} onValueChange={setBulkCategoryFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={bulkStatusFilter} onValueChange={setBulkStatusFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="negotiating">Negotiating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <Select value={bulkPriorityFilter} onValueChange={setBulkPriorityFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Stats Summary */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total prospects:</span>
                  <span className="font-medium">{prospects.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">With valid email:</span>
                  <span className="font-medium">{prospects.filter(p => p.email).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Excluded (converted/declined):</span>
                  <span className="font-medium text-muted-foreground">
                    {prospects.filter(p => ["converted", "declined"].includes(p.status)).length}
                  </span>
                </div>
                <div className="border-t border-border/50 pt-3 flex justify-between text-sm">
                  <span className="text-foreground font-medium">Matching filters:</span>
                  <span className="font-semibold text-primary">{eligibleForOutreach.length}</span>
                </div>
              </div>
              
              {/* Preview matching prospects */}
              {eligibleForOutreach.length > 0 && eligibleForOutreach.length <= 10 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Recipients Preview</Label>
                  <div className="flex flex-wrap gap-2">
                    {eligibleForOutreach.map((p) => (
                      <Badge key={p.id} variant="outline" className="text-xs">
                        {p.company_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="customize" className="space-y-4 pt-4">
              {/* Toggle custom message */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Custom Message</p>
                  <p className="text-xs text-muted-foreground">Override the default Aurelia invitation template</p>
                </div>
                <input
                  type="checkbox"
                  checked={useCustomMessage}
                  onChange={(e) => setUseCustomMessage(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
              </div>
              
              {useCustomMessage ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Subject</Label>
                    <Input
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Exclusive Partnership Invitation from Aurelia"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Message Body</Label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Write your custom message here. Use {{company_name}}, {{contact_name}}, {{category}} as placeholders..."
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Available placeholders: {"{{company_name}}"}, {"{{contact_name}}"}, {"{{category}}"}, {"{{invite_link}}"}
                    </p>
                  </div>
                  
                  {/* Template quick-select */}
                  {templates.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Or use a template</Label>
                      <Select onValueChange={(id) => {
                        const template = templates.find(t => t.id === id);
                        if (template) {
                          setCustomSubject(template.subject);
                          setCustomMessage(template.body);
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-foreground font-medium mb-2">Default Aurelia Invitation</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Recipients will receive the beautifully branded Aurelia partnership invitation with gold accents, 
                    personalized greeting, category-specific content, and a unique application link.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {bulkSendingProgress.inProgress && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span>Sending invitations...</span>
                <span>{bulkSendingProgress.sent} / {bulkSendingProgress.total}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(bulkSendingProgress.sent / bulkSendingProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button 
              variant="outline" 
              onClick={() => setBulkOutreachDialogOpen(false)}
              disabled={bulkSendingProgress.inProgress}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBulkOutreach} 
              disabled={bulkSendingProgress.inProgress || eligibleForOutreach.length === 0}
            >
              {bulkSendingProgress.inProgress ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {eligibleForOutreach.length} Prospects
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerDiscoveryPanel;
