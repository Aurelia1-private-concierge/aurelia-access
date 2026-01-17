import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Users, 
  Building2, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Mail,
  Globe,
  TrendingUp,
  Clock,
  Zap
} from "lucide-react";

interface PotentialPartner {
  id: string;
  company_name: string;
  website: string | null;
  category: string;
  contact_email: string | null;
  description: string | null;
  score: number;
  status: string;
  source: string | null;
  discovered_at: string;
}

interface PotentialUser {
  id: string;
  full_name: string | null;
  email: string | null;
  company: string | null;
  title: string | null;
  linkedin_url: string | null;
  score: number;
  status: string;
  source: string | null;
  discovered_at: string;
}

interface DiscoveryLog {
  id: string;
  kind: string;
  source: string | null;
  partners_found: number;
  users_found: number;
  error: string | null;
  created_at: string;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "aviation", label: "Aviation" },
  { value: "yacht", label: "Yacht" },
  { value: "hospitality", label: "Hospitality" },
  { value: "dining", label: "Dining" },
  { value: "events", label: "Events" },
  { value: "security", label: "Security" },
  { value: "real_estate", label: "Real Estate" },
  { value: "automotive", label: "Automotive" },
  { value: "wellness", label: "Wellness" },
  { value: "art_collectibles", label: "Art & Collectibles" }
];

const AutoDiscoveryPanel: React.FC = () => {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [partners, setPartners] = useState<PotentialPartner[]>([]);
  const [users, setUsers] = useState<PotentialUser[]>([]);
  const [logs, setLogs] = useState<DiscoveryLog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [discoveryMode, setDiscoveryMode] = useState<"both" | "partners" | "users">("both");
  const [dryRun, setDryRun] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    // Fetch partners
    let partnerQuery = supabase
      .from("potential_partners")
      .select("*")
      .order("score", { ascending: false })
      .limit(50);

    if (selectedCategory !== "all") {
      partnerQuery = partnerQuery.eq("category", selectedCategory);
    }

    const { data: partnerData } = await partnerQuery;
    if (partnerData) setPartners(partnerData);

    // Fetch users
    const { data: userData } = await supabase
      .from("potential_users")
      .select("*")
      .order("score", { ascending: false })
      .limit(50);
    if (userData) setUsers(userData);

    // Fetch logs
    const { data: logData } = await supabase
      .from("discovery_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (logData) setLogs(logData);
  };

  const runDiscovery = async () => {
    setIsDiscovering(true);
    try {
      const categories = selectedCategory === "all" 
        ? CATEGORIES.filter(c => c.value !== "all").map(c => c.value)
        : [selectedCategory];

      const { data, error } = await supabase.functions.invoke("auto-discover", {
        body: {
          mode: discoveryMode,
          categories,
          limit: 10,
          dryRun
        }
      });

      if (error) throw error;

      toast.success(
        `Discovery complete: ${data.partnersInserted || 0} partners, ${data.usersInserted || 0} users found`
      );

      fetchData();
    } catch (err) {
      console.error("Discovery error:", err);
      toast.error("Discovery failed. Check console for details.");
    } finally {
      setIsDiscovering(false);
    }
  };

  const updatePartnerStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("potential_partners")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      fetchData();
    }
  };

  const updateUserStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("potential_users")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      fetchData();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary">New</Badge>;
      case "contacted":
        return <Badge className="bg-blue-500/20 text-blue-400">Contacted</Badge>;
      case "qualified":
        return <Badge className="bg-green-500/20 text-green-400">Qualified</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    totalPartners: partners.length,
    avgPartnerScore: partners.length ? Math.round(partners.reduce((a, b) => a + b.score, 0) / partners.length) : 0,
    totalUsers: users.length,
    avgUserScore: users.length ? Math.round(users.reduce((a, b) => a + b.score, 0) / users.length) : 0,
    recentRuns: logs.filter(l => new Date(l.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Auto Discovery
          </h2>
          <p className="text-muted-foreground">
            Automatically find and qualify partners and high-value prospects
          </p>
        </div>
        <Button 
          onClick={runDiscovery} 
          disabled={isDiscovering}
          className="gap-2"
        >
          {isDiscovering ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Discovering...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Discovery
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary opacity-80" />
              <div>
                <p className="text-2xl font-bold">{stats.totalPartners}</p>
                <p className="text-xs text-muted-foreground">Partners Found</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500 opacity-80" />
              <div>
                <p className="text-2xl font-bold">{stats.avgPartnerScore}%</p>
                <p className="text-xs text-muted-foreground">Avg Partner Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500 opacity-80" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Users Found</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-yellow-500 opacity-80" />
              <div>
                <p className="text-2xl font-bold">{stats.avgUserScore}%</p>
                <p className="text-xs text-muted-foreground">Avg User Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-muted-foreground opacity-80" />
              <div>
                <p className="text-2xl font-bold">{stats.recentRuns}</p>
                <p className="text-xs text-muted-foreground">Runs (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Label>Category:</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Mode:</Label>
              <Select value={discoveryMode} onValueChange={(v) => setDiscoveryMode(v as typeof discoveryMode)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="partners">Partners Only</SelectItem>
                  <SelectItem value="users">Users Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch 
                id="dry-run" 
                checked={dryRun} 
                onCheckedChange={setDryRun}
              />
              <Label htmlFor="dry-run">Dry Run (Preview Only)</Label>
            </div>

            <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="partners">
        <TabsList>
          <TabsTrigger value="partners" className="gap-2">
            <Building2 className="w-4 h-4" />
            Partners ({partners.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Clock className="w-4 h-4" />
            Discovery Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="mt-4">
          <Card>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map(partner => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{partner.company_name}</p>
                          {partner.website && (
                            <a 
                              href={partner.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Globe className="w-3 h-3" />
                              {new URL(partner.website).hostname}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {partner.category.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${getScoreColor(partner.score)}`}>
                          {partner.score}
                        </span>
                      </TableCell>
                      <TableCell>
                        {partner.contact_email ? (
                          <a 
                            href={`mailto:${partner.contact_email}`}
                            className="text-primary hover:underline flex items-center gap-1 text-sm"
                          >
                            <Mail className="w-3 h-3" />
                            {partner.contact_email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(partner.status)}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {partner.source || "unknown"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => updatePartnerStatus(partner.id, "qualified")}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => updatePartnerStatus(partner.id, "rejected")}
                          >
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {partners.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No partners discovered yet. Run a discovery to find potential partners.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.full_name || "Unknown"}</p>
                          {user.linkedin_url && (
                            <a 
                              href={user.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              LinkedIn Profile
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.company || "-"}</TableCell>
                      <TableCell>{user.title || "-"}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${getScoreColor(user.score)}`}>
                          {user.score}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.email ? (
                          <a 
                            href={`mailto:${user.email}`}
                            className="text-primary hover:underline flex items-center gap-1 text-sm"
                          >
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => updateUserStatus(user.id, "qualified")}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => updateUserStatus(user.id, "rejected")}
                          >
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users discovered yet. Run a discovery to find potential high-value users.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Partners</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.kind}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.partners_found}</TableCell>
                      <TableCell>{log.users_found}</TableCell>
                      <TableCell>
                        {log.error ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-400">Success</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No discovery runs yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutoDiscoveryPanel;
