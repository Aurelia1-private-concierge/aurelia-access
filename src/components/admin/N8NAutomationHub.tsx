import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Users,
  UserPlus,
  Bell,
  Database,
  Plus,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Settings,
  Activity,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { triggerN8NWorkflow, isValidN8NWebhookUrl } from "@/lib/n8n-client";
import { formatDistanceToNow } from "date-fns";

interface WorkflowConfig {
  id: string;
  key: string;
  name: string;
  description: string;
  category: "lead_processing" | "partner_onboarding" | "notifications" | "data_sync";
  webhookUrl: string | null;
  isActive: boolean;
  lastTriggeredAt: string | null;
  triggerCount: number;
}

interface AutomationLog {
  id: string;
  workflow_key: string;
  event: string;
  status: "success" | "failed" | "pending";
  response_time_ms: number | null;
  error_message: string | null;
  created_at: string;
}

const WORKFLOW_TEMPLATES: Omit<WorkflowConfig, "id" | "webhookUrl" | "lastTriggeredAt" | "triggerCount">[] = [
  // Lead Processing
  {
    key: "contact_new",
    name: "New Contact Lead",
    description: "Triggers when a new contact form is submitted",
    category: "lead_processing",
    isActive: false,
  },
  {
    key: "lead_scored",
    name: "Lead Score Updated",
    description: "Triggers when a lead score changes significantly",
    category: "lead_processing",
    isActive: false,
  },
  {
    key: "lead_enrichment",
    name: "Lead Enrichment",
    description: "Enrich lead data with external APIs",
    category: "lead_processing",
    isActive: false,
  },
  // Partner Onboarding
  {
    key: "partner_application",
    name: "Partner Application",
    description: "Triggers when a new partner applies",
    category: "partner_onboarding",
    isActive: false,
  },
  {
    key: "partner_approved",
    name: "Partner Approved",
    description: "Triggers when a partner is approved",
    category: "partner_onboarding",
    isActive: false,
  },
  {
    key: "partner_onboarding",
    name: "Partner Onboarding Flow",
    description: "Multi-step onboarding automation",
    category: "partner_onboarding",
    isActive: false,
  },
  // Notifications
  {
    key: "multi_channel_alert",
    name: "Multi-Channel Alert",
    description: "Send alerts via email, SMS, Slack",
    category: "notifications",
    isActive: false,
  },
  {
    key: "daily_digest",
    name: "Daily Digest",
    description: "Send daily summary notifications",
    category: "notifications",
    isActive: false,
  },
  {
    key: "urgent_escalation",
    name: "Urgent Escalation",
    description: "Escalate urgent requests to on-call",
    category: "notifications",
    isActive: false,
  },
  // Data Sync
  {
    key: "crm_sync",
    name: "CRM Sync",
    description: "Sync data to external CRM",
    category: "data_sync",
    isActive: false,
  },
  {
    key: "data_backup",
    name: "Data Backup",
    description: "Automated backup to cloud storage",
    category: "data_sync",
    isActive: false,
  },
  {
    key: "analytics_export",
    name: "Analytics Export",
    description: "Export analytics to Google Sheets",
    category: "data_sync",
    isActive: false,
  },
];

const categoryIcons = {
  lead_processing: Users,
  partner_onboarding: UserPlus,
  notifications: Bell,
  data_sync: Database,
};

const categoryLabels = {
  lead_processing: "Lead Processing",
  partner_onboarding: "Partner Onboarding",
  notifications: "Notifications",
  data_sync: "Data Sync",
};

const categoryColors = {
  lead_processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  partner_onboarding: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  notifications: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  data_sync: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const N8NAutomationHub = () => {
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowConfig | null>(null);
  const [webhookInput, setWebhookInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [testPayload, setTestPayload] = useState("{}");
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    fetchWorkflows();
    fetchLogs();
  }, []);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      // Get all n8n webhook settings
      const { data: settings, error } = await supabase
        .from("app_settings")
        .select("*")
        .like("key", "n8n_%");

      if (error) throw error;

      // Map templates to configs with saved webhooks
      const configuredWorkflows = WORKFLOW_TEMPLATES.map((template) => {
        const setting = settings?.find((s) => s.key === `n8n_webhook_${template.key}`);
        const activeSetting = settings?.find((s) => s.key === `n8n_active_${template.key}`);
        const countSetting = settings?.find((s) => s.key === `n8n_count_${template.key}`);
        const lastTriggerSetting = settings?.find((s) => s.key === `n8n_last_${template.key}`);

        return {
          ...template,
          id: template.key,
          webhookUrl: setting?.value || null,
          isActive: activeSetting?.value === "true",
          triggerCount: parseInt(countSetting?.value || "0", 10),
          lastTriggeredAt: lastTriggerSetting?.value || null,
        };
      });

      setWorkflows(configuredWorkflows);
    } catch (err) {
      console.error("Error fetching workflows:", err);
      toast.error("Failed to load workflows");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_automation_logs")
        .select("*")
        .like("automation_type", "n8n_%")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setLogs(
        (data || []).map((log) => ({
          id: log.id,
          workflow_key: log.automation_type.replace("n8n_", ""),
          event: (log.details as Record<string, unknown>)?.event as string || "unknown",
          status: log.status as "success" | "failed" | "pending",
          response_time_ms: (log.details as Record<string, unknown>)?.response_time_ms as number || null,
          error_message: log.error_message,
          created_at: log.created_at,
        }))
      );
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const saveWorkflow = async (workflow: WorkflowConfig, webhookUrl: string) => {
    if (webhookUrl && !isValidN8NWebhookUrl(webhookUrl)) {
      toast.error("Invalid n8n webhook URL. Must be from n8n.cloud domain.");
      return;
    }

    try {
      // Save webhook URL
      await supabase.from("app_settings").upsert(
        {
          key: `n8n_webhook_${workflow.key}`,
          value: webhookUrl || null,
          description: `N8N webhook for ${workflow.name}`,
        },
        { onConflict: "key" }
      );

      toast.success("Workflow saved");
      setIsDialogOpen(false);
      fetchWorkflows();
    } catch (err) {
      console.error("Error saving workflow:", err);
      toast.error("Failed to save workflow");
    }
  };

  const toggleWorkflow = async (workflow: WorkflowConfig) => {
    if (!workflow.webhookUrl && !workflow.isActive) {
      toast.error("Configure webhook URL before enabling");
      return;
    }

    try {
      await supabase.from("app_settings").upsert(
        {
          key: `n8n_active_${workflow.key}`,
          value: (!workflow.isActive).toString(),
          description: `Active status for ${workflow.name}`,
        },
        { onConflict: "key" }
      );

      toast.success(workflow.isActive ? "Workflow paused" : "Workflow activated");
      fetchWorkflows();
    } catch (err) {
      console.error("Error toggling workflow:", err);
      toast.error("Failed to update workflow");
    }
  };

  const testWorkflow = async (workflow: WorkflowConfig) => {
    if (!workflow.webhookUrl) {
      toast.error("No webhook URL configured");
      return;
    }

    setIsTesting(true);
    const startTime = Date.now();

    try {
      let payload;
      try {
        payload = JSON.parse(testPayload);
      } catch {
        payload = {};
      }

      const result = await triggerN8NWorkflow(workflow.webhookUrl, {
        event: `test.${workflow.key}`,
        data: { test: true, ...payload },
        timestamp: new Date().toISOString(),
        source: "aurelia_admin_test",
      });

      const responseTime = Date.now() - startTime;

      // Log the test
      await supabase.from("contact_automation_logs").insert([{
        automation_type: `n8n_${workflow.key}`,
        status: result.success ? "success" : "failed",
        details: JSON.parse(JSON.stringify({
          event: `test.${workflow.key}`,
          response_time_ms: responseTime,
          response: result.data,
        })),
        error_message: result.error || null,
      }]);

      if (result.success) {
        toast.success(`Test successful (${responseTime}ms)`);
      } else {
        toast.error(`Test failed: ${result.error}`);
      }

      fetchLogs();
    } catch (err) {
      console.error("Test error:", err);
      toast.error("Test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const stats = {
    total: workflows.length,
    active: workflows.filter((w) => w.isActive).length,
    configured: workflows.filter((w) => w.webhookUrl).length,
    totalTriggers: workflows.reduce((sum, w) => sum + w.triggerCount, 0),
  };

  const groupedWorkflows = {
    lead_processing: workflows.filter((w) => w.category === "lead_processing"),
    partner_onboarding: workflows.filter((w) => w.category === "partner_onboarding"),
    notifications: workflows.filter((w) => w.category === "notifications"),
    data_sync: workflows.filter((w) => w.category === "data_sync"),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            N8N Automation Hub
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure and manage automated workflows
          </p>
        </div>
        <Button variant="outline" onClick={fetchWorkflows}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.configured}</p>
                <p className="text-xs text-muted-foreground">Configured</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.totalTriggers}</p>
                <p className="text-xs text-muted-foreground">Total Triggers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{logs.length}</p>
                <p className="text-xs text-muted-foreground">Recent Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows by Category */}
      <Tabs defaultValue="lead_processing" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          {Object.entries(categoryLabels).map(([key, label]) => {
            const Icon = categoryIcons[key as keyof typeof categoryIcons];
            const count = groupedWorkflows[key as keyof typeof groupedWorkflows].filter(
              (w) => w.webhookUrl
            ).length;
            return (
              <TabsTrigger key={key} value={key} className="gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(groupedWorkflows).map(([category, categoryWorkflows]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {categoryWorkflows.map((workflow, index) => (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-card/50 hover:bg-card/70 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className={`p-2 rounded-lg border ${
                                categoryColors[category as keyof typeof categoryColors]
                              }`}
                            >
                              {(() => {
                                const Icon = categoryIcons[category as keyof typeof categoryIcons];
                                return <Icon className="w-5 h-5" />;
                              })()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{workflow.name}</h4>
                                {workflow.isActive && (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    Active
                                  </Badge>
                                )}
                                {!workflow.webhookUrl && (
                                  <Badge variant="outline" className="text-muted-foreground">
                                    Not configured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {workflow.description}
                              </p>
                              {workflow.lastTriggeredAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Last triggered{" "}
                                  {formatDistanceToNow(new Date(workflow.lastTriggeredAt), {
                                    addSuffix: true,
                                  })}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {workflow.triggerCount > 0 && (
                              <Badge variant="outline">{workflow.triggerCount} triggers</Badge>
                            )}

                            <Switch
                              checked={workflow.isActive}
                              onCheckedChange={() => toggleWorkflow(workflow)}
                              disabled={!workflow.webhookUrl}
                            />

                            <Dialog
                              open={isDialogOpen && selectedWorkflow?.id === workflow.id}
                              onOpenChange={(open) => {
                                setIsDialogOpen(open);
                                if (open) {
                                  setSelectedWorkflow(workflow);
                                  setWebhookInput(workflow.webhookUrl || "");
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle>Configure {workflow.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div className="space-y-2">
                                    <Label>Webhook URL</Label>
                                    <Input
                                      value={webhookInput}
                                      onChange={(e) => setWebhookInput(e.target.value)}
                                      placeholder="https://your-instance.app.n8n.cloud/webhook/..."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Must be from n8n.cloud domain
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Test Payload (JSON)</Label>
                                    <Textarea
                                      value={testPayload}
                                      onChange={(e) => setTestPayload(e.target.value)}
                                      placeholder="{}"
                                      rows={3}
                                      className="font-mono text-sm"
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => saveWorkflow(workflow, webhookInput)}
                                      className="flex-1"
                                    >
                                      Save Configuration
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => testWorkflow({ ...workflow, webhookUrl: webhookInput })}
                                      disabled={!webhookInput || isTesting}
                                    >
                                      {isTesting ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Play className="w-4 h-4" />
                                      )}
                                      Test
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity yet. Configure and test a workflow to see logs.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.slice(0, 20).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {log.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : log.status === "failed" ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{log.workflow_key}</p>
                      <p className="text-xs text-muted-foreground">{log.event}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {log.response_time_ms && (
                      <p className="text-xs text-muted-foreground">{log.response_time_ms}ms</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Need help setting up n8n?</h4>
              <p className="text-sm text-muted-foreground">
                Learn how to create workflows and connect them to Aurelia
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://docs.n8n.io/workflows/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                n8n Docs
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default N8NAutomationHub;
