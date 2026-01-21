import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Webhook, Plus, Trash2, ToggleLeft, ToggleRight, 
  Mail, Bell, Activity, TrendingUp, CheckCircle, XCircle,
  MessageSquare, Database, Zap, Send, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  endpoint_type: string;
  events: string[];
  headers: Record<string, string> | null;
  is_active: boolean;
  created_at: string;
  last_triggered_at?: string;
}

interface AutomationLog {
  id: string;
  contact_id: string;
  automation_type: string;
  status: string;
  details: any;
  error_message: string | null;
  created_at: string;
}

interface AutomationStats {
  total: number;
  autoResponseSuccess: number;
  adminNotificationSuccess: number;
  webhooksSent: number;
  avgLeadScore: number;
}

const endpointTypeIcons: Record<string, React.ElementType> = {
  n8n: Zap,
  slack: MessageSquare,
  crm: Database,
  custom: Webhook,
};

const ContactAutomationPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    endpoint_type: "n8n",
    auth_header: "",
  });

  // Fetch webhooks
  const { data: webhooks, isLoading: webhooksLoading } = useQuery({
    queryKey: ["webhook-endpoints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webhook_endpoints")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as WebhookEndpoint[];
    },
  });

  // Fetch recent automation logs
  const { data: logs } = useQuery({
    queryKey: ["automation-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_automation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as AutomationLog[];
    },
  });

  // Fetch contact stats
  const { data: stats } = useQuery({
    queryKey: ["contact-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("lead_score, auto_response_sent, admin_notified, webhook_sent")
        .not("processed_at", "is", null);
      
      if (error) throw error;
      
      const total = data?.length || 0;
      const autoResponseSuccess = data?.filter(d => d.auto_response_sent).length || 0;
      const adminNotificationSuccess = data?.filter(d => d.admin_notified).length || 0;
      const webhooksSent = data?.filter(d => d.webhook_sent).length || 0;
      const avgLeadScore = total > 0 
        ? Math.round(data.reduce((sum, d) => sum + (d.lead_score || 0), 0) / total)
        : 0;
      
      return { total, autoResponseSuccess, adminNotificationSuccess, webhooksSent, avgLeadScore } as AutomationStats;
    },
  });

  // Add webhook mutation
  const addWebhookMutation = useMutation({
    mutationFn: async (webhook: typeof newWebhook) => {
      const headers: Record<string, string> = {};
      if (webhook.auth_header) {
        headers['Authorization'] = webhook.auth_header;
      }
      
      const { data, error } = await supabase
        .from("webhook_endpoints")
        .insert({
          name: webhook.name,
          url: webhook.url,
          endpoint_type: webhook.endpoint_type,
          events: ["contact_form"],
          headers: Object.keys(headers).length > 0 ? headers : null,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-endpoints"] });
      setIsAddingWebhook(false);
      setNewWebhook({ name: "", url: "", endpoint_type: "n8n", auth_header: "" });
      toast({ title: "Webhook added", description: "The webhook endpoint has been configured." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Toggle webhook active status
  const toggleWebhookMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("webhook_endpoints")
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-endpoints"] });
    },
  });

  // Delete webhook
  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("webhook_endpoints")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-endpoints"] });
      toast({ title: "Webhook deleted" });
    },
  });

  // Test webhook
  const testWebhookMutation = useMutation({
    mutationFn: async (webhook: WebhookEndpoint) => {
      setTestingWebhookId(webhook.id);
      
      const testPayload = {
        event: 'contact_form_submission',
        timestamp: new Date().toISOString(),
        test: true,
        data: {
          id: 'test-' + Date.now(),
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
          message: 'This is a test webhook delivery from Aurelia admin panel.',
          source: 'admin_test',
          lead_score: 75,
          created_at: new Date().toISOString(),
        }
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Aurelia-Webhook/1.0',
        'X-Webhook-Test': 'true',
        ...(webhook.headers || {})
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPayload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No response body');
        throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 200)}`);
      }

      return response.status;
    },
    onSuccess: (status) => {
      setTestingWebhookId(null);
      queryClient.invalidateQueries({ queryKey: ["webhook-endpoints"] });
      toast({ 
        title: "✓ Webhook test successful", 
        description: `Received HTTP ${status} response` 
      });
    },
    onError: (error: any) => {
      setTestingWebhookId(null);
      toast({ 
        title: "Webhook test failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Mail className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats?.autoResponseSuccess || 0}</p>
                <p className="text-xs text-muted-foreground">Auto-Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/50">
                <Bell className="w-4 h-4 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats?.adminNotificationSuccess || 0}</p>
                <p className="text-xs text-muted-foreground">Admin Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Webhook className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats?.webhooksSent || 0}</p>
                <p className="text-xs text-muted-foreground">Webhooks Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/15">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats?.avgLeadScore || 0}</p>
                <p className="text-xs text-muted-foreground">Avg Lead Score</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth">Authorization Header (optional)</Label>
                  <Input
                    id="auth"
                    type="password"
                    placeholder="Bearer your-secret-token"
                    value={newWebhook.auth_header}
                    onChange={(e) => setNewWebhook({ ...newWebhook, auth_header: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    For n8n, use your webhook authentication token
                  </p>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Endpoints */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-primary" />
              Webhook Endpoints
            </CardTitle>
            <CardDescription>
              Configure n8n, Slack, CRM, or custom webhook integrations
            </CardDescription>
          </div>
          <Dialog open={isAddingWebhook} onOpenChange={setIsAddingWebhook}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Webhook Endpoint</DialogTitle>
                <DialogDescription>
                  Configure a new webhook to receive contact form submissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., n8n Contact Flow"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Webhook URL</Label>
                  <Input
                    id="url"
                    placeholder="https://your-n8n.app.n8n.cloud/webhook/..."
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newWebhook.endpoint_type}
                    onValueChange={(value) => setNewWebhook({ ...newWebhook, endpoint_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="n8n">n8n Workflow</SelectItem>
                      <SelectItem value="slack">Slack Incoming Webhook</SelectItem>
                      <SelectItem value="crm">CRM Integration</SelectItem>
                      <SelectItem value="custom">Custom Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingWebhook(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => addWebhookMutation.mutate(newWebhook)}
                  disabled={!newWebhook.name || !newWebhook.url || addWebhookMutation.isPending}
                >
                  {addWebhookMutation.isPending ? "Adding..." : "Add Webhook"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {webhooksLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : webhooks?.length === 0 ? (
            <div className="text-center py-8">
              <Webhook className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No webhooks configured</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add a webhook to send contact submissions to n8n, Slack, or your CRM
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks?.map((webhook) => {
                const TypeIcon = endpointTypeIcons[webhook.endpoint_type] || Webhook;
                return (
                  <motion.div
                    key={webhook.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border transition-colors ${
                      webhook.is_active 
                        ? "border-primary/30 bg-primary/5" 
                        : "border-border/30 bg-muted/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${webhook.is_active ? "bg-primary/10" : "bg-muted"}`}>
                          <TypeIcon className={`w-4 h-4 ${webhook.is_active ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{webhook.name}</p>
                            <Badge variant={webhook.is_active ? "default" : "secondary"} className="text-[10px]">
                              {webhook.endpoint_type}
                            </Badge>
                            {webhook.headers && Object.keys(webhook.headers).length > 0 && (
                              <Badge variant="outline" className="text-[10px]">
                                Auth
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {webhook.url}
                          </p>
                          {webhook.last_triggered_at && (
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                              Last triggered: {new Date(webhook.last_triggered_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Test webhook"
                          disabled={testingWebhookId === webhook.id}
                          onClick={() => testWebhookMutation.mutate(webhook)}
                        >
                          {testingWebhookId === webhook.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleWebhookMutation.mutate({ 
                            id: webhook.id, 
                            is_active: !webhook.is_active 
                          })}
                        >
                          {webhook.is_active ? (
                            <ToggleRight className="w-4 h-4 text-primary" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Automation Logs */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Automation Activity
          </CardTitle>
          <CardDescription>
            Latest automation events from contact form submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No automation activity yet
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {logs?.slice(0, 20).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-background/50"
                >
                  <div className="flex items-center gap-3">
                    {log.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    ) : log.status === "partial" ? (
                      <Activity className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {log.automation_type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={log.status === "success" ? "default" : "secondary"}>
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactAutomationPanel;
