import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Webhook, Save, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ZapierSettings = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "zapier_partner_webhook")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching settings:", error);
      }

      if (data?.value) {
        setWebhookUrl(data.value);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("app_settings")
        .upsert({
          key: "zapier_partner_webhook",
          value: webhookUrl || null,
          description: "Zapier webhook URL for partner onboarding events",
        }, {
          onConflict: "key",
        });

      if (error) throw error;

      toast.success("Zapier webhook settings saved");
    } catch (error: unknown) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL first");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const { error } = await supabase.functions.invoke("zapier-webhook", {
        body: {
          event: "test_webhook",
          webhookUrl,
          data: {
            test: true,
            message: "This is a test from Aurelia Concierge",
            timestamp: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      setTestResult("success");
      toast.success("Test webhook sent! Check your Zap history.");
    } catch (error) {
      console.error("Test failed:", error);
      setTestResult("error");
      toast.error("Failed to send test webhook");
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-secondary/50 rounded w-1/3" />
        <div className="h-10 bg-secondary/50 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/50 border border-border/30 rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <Webhook className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Zapier Integration</h3>
          <p className="text-sm text-muted-foreground">
            Automate partner onboarding workflows
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input
            id="webhookUrl"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            className="mt-1.5 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Create a Zap with a "Webhooks by Zapier" trigger to get this URL
          </p>
        </div>

        <div className="bg-secondary/30 rounded-lg p-4 text-sm">
          <p className="font-medium text-foreground mb-2">Webhook Events:</p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">partner_application_submitted</code>
              <span>- New partner applies</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">partner_approved</code>
              <span>- Partner is approved</span>
            </li>
          </ul>
        </div>

        {testResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-2 p-3 rounded-lg ${
              testResult === "success"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {testResult === "success" ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Test webhook sent successfully</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Failed to send test webhook</span>
              </>
            )}
          </motion.div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isTesting || !webhookUrl}
          >
            {isTesting ? "Sending..." : "Test Webhook"}
          </Button>
        </div>

        <a
          href="https://zapier.com/apps/webhook/integrations"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
        >
          Learn how to create a Zapier webhook
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
};

export default ZapierSettings;
