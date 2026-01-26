import React, { useState, useEffect, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Check,
  AlertCircle,
  Copy,
  ExternalLink,
  Lock,
  Unlock,
  Settings,
  Plus,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface APIKeyInfo {
  name: string;
  description: string;
  category: 'ai' | 'payments' | 'communication' | 'analytics' | 'storage' | 'other';
  isConfigured: boolean;
  isManaged: boolean;
  docsUrl?: string;
}

const API_KEY_DEFINITIONS: Record<string, APIKeyInfo> = {
  LOVABLE_API_KEY: {
    name: "Lovable AI Gateway",
    description: "Required for AI features via Lovable's gateway (auto-configured)",
    category: "ai",
    isConfigured: true,
    isManaged: true,
    docsUrl: "https://docs.lovable.dev/features/ai"
  },
  ELEVENLABS_API_KEY: {
    name: "ElevenLabs Voice AI",
    description: "Text-to-speech and voice conversation features",
    category: "ai",
    isConfigured: false,
    isManaged: false,
    docsUrl: "https://elevenlabs.io/docs"
  },
  ELEVENLABS_AGENT_ID: {
    name: "ElevenLabs Agent ID",
    description: "Voice agent identifier for conversational AI",
    category: "ai",
    isConfigured: false,
    isManaged: false
  },
  STRIPE_SECRET_KEY: {
    name: "Stripe Secret Key",
    description: "Payment processing and subscription management",
    category: "payments",
    isConfigured: true,
    isManaged: true,
    docsUrl: "https://docs.stripe.com/keys"
  },
  STRIPE_WEBHOOK_SECRET: {
    name: "Stripe Webhook Secret",
    description: "Validates incoming Stripe webhooks",
    category: "payments",
    isConfigured: false,
    isManaged: false
  },
  RESEND_API_KEY: {
    name: "Resend Email",
    description: "Transactional email delivery service",
    category: "communication",
    isConfigured: false,
    isManaged: false,
    docsUrl: "https://resend.com/docs"
  },
  TWILIO_ACCOUNT_SID: {
    name: "Twilio Account SID",
    description: "SMS and voice communication services",
    category: "communication",
    isConfigured: false,
    isManaged: false,
    docsUrl: "https://www.twilio.com/docs"
  },
  TWILIO_API_KEY_SID: {
    name: "Twilio API Key SID",
    description: "Twilio API authentication",
    category: "communication",
    isConfigured: false,
    isManaged: false
  },
  TWILIO_API_KEY_SECRET: {
    name: "Twilio API Key Secret",
    description: "Twilio API secret key",
    category: "communication",
    isConfigured: false,
    isManaged: false
  },
  FIRECRAWL_API_KEY: {
    name: "Firecrawl",
    description: "Web scraping and crawling service (managed by connector)",
    category: "analytics",
    isConfigured: false,
    isManaged: true,
    docsUrl: "https://firecrawl.dev/docs"
  },
  VITE_SENTRY_DSN: {
    name: "Sentry DSN",
    description: "Error monitoring and performance tracking",
    category: "analytics",
    isConfigured: false,
    isManaged: false,
    docsUrl: "https://docs.sentry.io"
  },
  ADMIN_NOTIFICATION_EMAIL: {
    name: "Admin Notification Email",
    description: "Email address for system notifications",
    category: "other",
    isConfigured: false,
    isManaged: false
  },
  IONOS_API_PUBLIC_PREFIX: {
    name: "IONOS API Prefix",
    description: "IONOS cloud service identifier",
    category: "storage",
    isConfigured: false,
    isManaged: false
  },
  IONOS_API_SECRET: {
    name: "IONOS API Secret",
    description: "IONOS cloud service authentication",
    category: "storage",
    isConfigured: false,
    isManaged: false
  }
};

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  ai: { label: "AI & Machine Learning", icon: <Settings className="w-4 h-4" /> },
  payments: { label: "Payments & Billing", icon: <Key className="w-4 h-4" /> },
  communication: { label: "Communication", icon: <Shield className="w-4 h-4" /> },
  analytics: { label: "Analytics & Monitoring", icon: <RefreshCw className="w-4 h-4" /> },
  storage: { label: "Storage & Hosting", icon: <Lock className="w-4 h-4" /> },
  other: { label: "Other", icon: <Settings className="w-4 h-4" /> }
};

interface ConfiguredSecret {
  name: string;
  isManaged: boolean;
  canDelete: boolean;
}

const APIKeysPanel = forwardRef<HTMLDivElement>((props, ref) => {
  const [secrets, setSecrets] = useState<ConfiguredSecret[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSecretName, setNewSecretName] = useState("");
  const [newSecretValue, setNewSecretValue] = useState("");
  const [showValue, setShowValue] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSecrets();
  }, []);

  const fetchSecrets = async () => {
    setIsLoading(true);
    try {
      // Fetch app_settings for any custom keys stored there
      const { data: settingsData } = await supabase
        .from("app_settings")
        .select("key, value")
        .like("key", "API_%");

      // Build the secrets list from our definitions
      const configuredSecrets: ConfiguredSecret[] = Object.entries(API_KEY_DEFINITIONS).map(([key, info]) => ({
        name: key,
        isManaged: info.isManaged,
        canDelete: !info.isManaged
      }));

      setSecrets(configuredSecrets);
    } catch (error) {
      console.error("Error fetching secrets:", error);
      toast.error("Failed to load API keys configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSecrets();
    setIsRefreshing(false);
    toast.success("Configuration refreshed");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const groupedKeys = Object.entries(API_KEY_DEFINITIONS).reduce((acc, [key, info]) => {
    if (!acc[info.category]) {
      acc[info.category] = [];
    }
    acc[info.category].push({ key, ...info });
    return acc;
  }, {} as Record<string, (APIKeyInfo & { key: string })[]>);

  const configuredCount = Object.values(API_KEY_DEFINITIONS).filter(k => k.isConfigured).length;
  const totalCount = Object.keys(API_KEY_DEFINITIONS).length;

  return (
    <div ref={ref} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Key className="w-6 h-6 text-primary" />
            API Keys & Secrets
          </h2>
          <p className="text-muted-foreground">
            Manage API keys, environment variables, and service integrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {configuredCount}/{totalCount} configured
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground">Secure Secret Management</h4>
              <p className="text-sm text-muted-foreground mt-1">
                API keys are stored securely in Lovable Cloud and injected as environment variables into edge functions. 
                Values are encrypted and never exposed in client-side code.
              </p>
              <div className="flex items-center gap-4 mt-3">
                <a 
                  href="https://docs.lovable.dev/features/cloud" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Services</CardTitle>
          <CardDescription>
            Review and manage API keys for connected services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Accordion type="multiple" className="w-full" defaultValue={["ai", "payments"]}>
              {Object.entries(CATEGORY_LABELS).map(([category, { label, icon }]) => {
                const keys = groupedKeys[category] || [];
                if (keys.length === 0) return null;

                const configuredInCategory = keys.filter(k => 
                  secrets.some(s => s.name === k.key)
                ).length;

                return (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {icon}
                        </div>
                        <div className="text-left">
                          <span className="font-medium">{label}</span>
                          <p className="text-xs text-muted-foreground">
                            {configuredInCategory}/{keys.length} configured
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {keys.map((keyInfo) => (
                          <div 
                            key={keyInfo.key}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${keyInfo.isConfigured ? 'bg-primary/10' : 'bg-muted'}`}>
                                {keyInfo.isConfigured ? (
                                  <Check className="w-4 h-4 text-primary" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground">{keyInfo.name}</span>
                                  {keyInfo.isManaged && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Lock className="w-3 h-3 mr-1" />
                                      Managed
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{keyInfo.description}</p>
                                <code className="text-xs text-muted-foreground font-mono mt-1 block">
                                  {keyInfo.key}
                                </code>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(keyInfo.key)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copy key name</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {keyInfo.docsUrl && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(keyInfo.docsUrl, '_blank')}
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View documentation</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Environment Variables Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Environment Variables
          </CardTitle>
          <CardDescription>
            System-provided variables available in edge functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "SUPABASE_URL", desc: "Lovable Cloud database URL", auto: true },
              { name: "SUPABASE_ANON_KEY", desc: "Public anonymous key for client access", auto: true },
              { name: "SUPABASE_SERVICE_ROLE_KEY", desc: "Service role key for admin operations", auto: true },
              { name: "SUPABASE_DB_URL", desc: "Direct database connection string", auto: true }
            ].map((env) => (
              <div 
                key={env.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary" />
                  <div>
                    <code className="text-sm font-mono text-foreground">{env.name}</code>
                    <p className="text-xs text-muted-foreground">{env.desc}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Auto-configured
                </Badge>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Need to add a new API key?
            </span>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://docs.lovable.dev/features/cloud#secrets-management" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add via Lovable Settings
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Usage in Edge Functions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4">
            <pre className="text-sm font-mono text-foreground overflow-x-auto">
{`// Access secrets in Supabase Edge Functions
const apiKey = Deno.env.get('YOUR_API_KEY_NAME');

// Example: Using Resend for email
const resendKey = Deno.env.get('RESEND_API_KEY');
const resend = new Resend(resendKey);

// Example: Using Stripe
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
const stripe = new Stripe(stripeKey);`}
            </pre>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Secrets are securely injected into edge function runtime and are never exposed to the client.
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

APIKeysPanel.displayName = "APIKeysPanel";

export default APIKeysPanel;