import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Hotel,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  Settings,
  Wifi,
  WifiOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PMSIntegration {
  id: string;
  provider: string;
  property_code: string;
  api_endpoint: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: string;
  sync_error: string | null;
  created_at: string;
}

interface SyncLog {
  id: string;
  sync_type: string;
  rooms_synced: number;
  status: string;
  error_message: string | null;
  duration_ms: number;
  created_at: string;
}

interface SiteMinderIntegrationProps {
  partnerId: string;
}

export const SiteMinderIntegration = ({ partnerId }: SiteMinderIntegrationProps) => {
  const [integrations, setIntegrations] = useState<PMSIntegration[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPropertyCode, setNewPropertyCode] = useState("");
  const [newApiEndpoint, setNewApiEndpoint] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("siteminder");
  const [adding, setAdding] = useState(false);

  const providers = [
    { id: "siteminder", name: "SiteMinder", logo: "🏨" },
    { id: "cloudbeds", name: "Cloudbeds", logo: "☁️" },
    { id: "opera", name: "Oracle Opera", logo: "🏢" },
    { id: "mews", name: "Mews", logo: "🔑" },
  ];

  useEffect(() => {
    fetchIntegrations();
  }, [partnerId]);

  const fetchIntegrations = async () => {
    try {
      const { data: integrationsData, error } = await supabase
        .from("partner_pms_integrations")
        .select("*")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIntegrations(integrationsData || []);

      // Fetch recent sync logs
      if (integrationsData && integrationsData.length > 0) {
        const integrationIds = integrationsData.map((i) => i.id);
        const { data: logsData } = await supabase
          .from("pms_sync_logs")
          .select("*")
          .in("integration_id", integrationIds)
          .order("created_at", { ascending: false })
          .limit(10);

        setSyncLogs(logsData || []);
      }
    } catch (error) {
      console.error("Error fetching integrations:", error);
      toast.error("Failed to load integrations");
    } finally {
      setLoading(false);
    }
  };

  const addIntegration = async () => {
    if (!newPropertyCode.trim()) {
      toast.error("Property code is required");
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase.from("partner_pms_integrations").insert({
        partner_id: partnerId,
        provider: selectedProvider,
        property_code: newPropertyCode.trim(),
        api_endpoint: newApiEndpoint.trim() || null,
        is_active: true,
        sync_status: "pending",
      });

      if (error) throw error;

      toast.success("Integration added successfully");
      setAddDialogOpen(false);
      setNewPropertyCode("");
      setNewApiEndpoint("");
      fetchIntegrations();
    } catch (error: any) {
      console.error("Error adding integration:", error);
      if (error.code === "23505") {
        toast.error("This property is already connected");
      } else {
        toast.error("Failed to add integration");
      }
    } finally {
      setAdding(false);
    }
  };

  const toggleIntegration = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("partner_pms_integrations")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;

      toast.success(isActive ? "Integration paused" : "Integration activated");
      fetchIntegrations();
    } catch (error) {
      console.error("Error toggling integration:", error);
      toast.error("Failed to update integration");
    }
  };

  const deleteIntegration = async (id: string) => {
    if (!confirm("Are you sure you want to remove this integration?")) return;

    try {
      const { error } = await supabase
        .from("partner_pms_integrations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Integration removed");
      fetchIntegrations();
    } catch (error) {
      console.error("Error deleting integration:", error);
      toast.error("Failed to remove integration");
    }
  };

  const syncAll = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("siteminder-availability", {
        body: {},
        headers: { "Content-Type": "application/json" },
      });

      // Use query params for action
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/siteminder-availability?action=sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Sync failed");
      }

      const result = await response.json();
      toast.success(`Synced ${result.synced?.length || 0} properties`);
      fetchIntegrations();
    } catch (error: any) {
      console.error("Error syncing:", error);
      toast.error(error.message || "Failed to sync inventory");
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="secondary">Paused</Badge>;
    }
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="w-5 h-5 text-primary" />
              Channel Manager Integrations
            </CardTitle>
            <CardDescription>
              Connect your property management system for real-time inventory sync
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {integrations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={syncAll}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Sync All
              </Button>
            )}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Integration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect Property Management System</DialogTitle>
                  <DialogDescription>
                    Link your PMS or channel manager for automatic inventory synchronization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <span className="flex items-center gap-2">
                              <span>{p.logo}</span>
                              <span>{p.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyCode">Property Code / Hotel ID</Label>
                    <Input
                      id="propertyCode"
                      value={newPropertyCode}
                      onChange={(e) => setNewPropertyCode(e.target.value)}
                      placeholder="e.g., HOTEL123"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your unique property identifier in {providers.find((p) => p.id === selectedProvider)?.name}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiEndpoint">API Endpoint (Optional)</Label>
                    <Input
                      id="apiEndpoint"
                      value={newApiEndpoint}
                      onChange={(e) => setNewApiEndpoint(e.target.value)}
                      placeholder="https://api.siteminder.com/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Custom API endpoint if using private instance
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addIntegration} disabled={adding}>
                      {adding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Connect
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {integrations.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <Wifi className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No Integrations Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your channel manager to sync room availability automatically
            </p>
            <Button size="sm" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Integration
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {integrations.map((integration) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                    {providers.find((p) => p.id === integration.provider)?.logo || "🏨"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {integration.property_code}
                      </span>
                      {getStatusBadge(integration.sync_status, integration.is_active)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {providers.find((p) => p.id === integration.provider)?.name} •
                      Last synced: {formatDate(integration.last_sync_at)}
                    </div>
                    {integration.sync_error && (
                      <p className="text-xs text-red-400 mt-1">{integration.sync_error}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleIntegration(integration.id, integration.is_active)}
                    title={integration.is_active ? "Pause" : "Activate"}
                  >
                    {integration.is_active ? (
                      <Wifi className="w-4 h-4" />
                    ) : (
                      <WifiOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteIntegration(integration.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {syncLogs.length > 0 && (
          <div className="pt-6 border-t">
            <h4 className="text-sm font-medium text-foreground mb-3">Recent Sync Activity</h4>
            <div className="space-y-2">
              {syncLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-sm p-2 rounded bg-secondary/30"
                >
                  <div className="flex items-center gap-2">
                    {log.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-muted-foreground">{log.sync_type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{log.rooms_synced} rooms</span>
                    <span>{log.duration_ms}ms</span>
                    <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <a
            href="https://www.siteminder.com/platform/channel-manager/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Learn more about SiteMinder integration
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteMinderIntegration;