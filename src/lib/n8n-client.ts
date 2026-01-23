import { supabase } from "@/integrations/supabase/client";

export interface N8NWorkflow {
  id: string;
  name: string;
  description: string;
  category: "lead_processing" | "partner_onboarding" | "notifications" | "data_sync";
  webhookPath: string;
  isActive: boolean;
  lastTriggeredAt?: string;
  triggerCount: number;
}

export interface N8NTriggerPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface N8NTriggerResult {
  success: boolean;
  status?: number;
  data?: unknown;
  error?: string;
}

/**
 * Trigger an n8n workflow via the CORS proxy edge function
 */
export async function triggerN8NWorkflow(
  webhookUrl: string,
  payload: N8NTriggerPayload
): Promise<N8NTriggerResult> {
  try {
    const { data, error } = await supabase.functions.invoke("n8n-proxy", {
      body: {
        webhookUrl,
        method: "POST",
        body: payload,
      },
    });

    if (error) {
      console.error("N8N proxy error:", error);
      return { success: false, error: error.message };
    }

    return {
      success: data?.success ?? false,
      status: data?.status,
      data: data?.data,
      error: data?.error,
    };
  } catch (err) {
    console.error("N8N trigger error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Pre-built workflow triggers for common automation scenarios
 */
export const n8nTriggers = {
  // Lead Processing
  async newContactSubmission(contact: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    source?: string;
  }) {
    const webhookUrl = await getWorkflowWebhook("contact_new");
    if (!webhookUrl) return null;

    return triggerN8NWorkflow(webhookUrl, {
      event: "contact.new",
      data: contact,
      timestamp: new Date().toISOString(),
      source: "aurelia_website",
    });
  },

  async leadScoreUpdated(lead: {
    id: string;
    email: string;
    previousScore: number;
    newScore: number;
    scoringFactors: Record<string, number>;
  }) {
    const webhookUrl = await getWorkflowWebhook("lead_scored");
    if (!webhookUrl) return null;

    return triggerN8NWorkflow(webhookUrl, {
      event: "lead.scored",
      data: lead,
      timestamp: new Date().toISOString(),
      source: "aurelia_automation",
    });
  },

  // Partner Onboarding
  async partnerApplicationReceived(partner: {
    id: string;
    companyName: string;
    contactEmail: string;
    category: string;
    website?: string;
  }) {
    const webhookUrl = await getWorkflowWebhook("partner_application");
    if (!webhookUrl) return null;

    return triggerN8NWorkflow(webhookUrl, {
      event: "partner.application_received",
      data: partner,
      timestamp: new Date().toISOString(),
      source: "aurelia_partners",
    });
  },

  async partnerApproved(partner: {
    id: string;
    companyName: string;
    contactEmail: string;
    category: string;
    tier?: string;
  }) {
    const webhookUrl = await getWorkflowWebhook("partner_approved");
    if (!webhookUrl) return null;

    return triggerN8NWorkflow(webhookUrl, {
      event: "partner.approved",
      data: partner,
      timestamp: new Date().toISOString(),
      source: "aurelia_partners",
    });
  },

  // Notifications
  async sendMultiChannelAlert(alert: {
    type: "urgent" | "standard" | "info";
    title: string;
    message: string;
    channels: ("email" | "sms" | "slack" | "push")[];
    recipients?: string[];
    metadata?: Record<string, unknown>;
  }) {
    const webhookUrl = await getWorkflowWebhook("multi_channel_alert");
    if (!webhookUrl) return null;

    return triggerN8NWorkflow(webhookUrl, {
      event: "notification.multi_channel",
      data: alert,
      timestamp: new Date().toISOString(),
      source: "aurelia_notifications",
    });
  },

  // Data Sync
  async syncToExternalCRM(data: {
    recordType: "contact" | "partner" | "booking";
    recordId: string;
    action: "create" | "update" | "delete";
    payload: Record<string, unknown>;
  }) {
    const webhookUrl = await getWorkflowWebhook("crm_sync");
    if (!webhookUrl) return null;

    return triggerN8NWorkflow(webhookUrl, {
      event: "sync.crm",
      data,
      timestamp: new Date().toISOString(),
      source: "aurelia_sync",
    });
  },

  async backupData(backup: {
    tables: string[];
    format: "json" | "csv";
    destination: "google_drive" | "dropbox" | "s3";
  }) {
    const webhookUrl = await getWorkflowWebhook("data_backup");
    if (!webhookUrl) return null;

    return triggerN8NWorkflow(webhookUrl, {
      event: "sync.backup",
      data: backup,
      timestamp: new Date().toISOString(),
      source: "aurelia_backup",
    });
  },
};

/**
 * Get webhook URL from app_settings
 */
async function getWorkflowWebhook(workflowKey: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", `n8n_webhook_${workflowKey}`)
      .maybeSingle();

    if (error || !data?.value) {
      console.warn(`N8N webhook not configured: ${workflowKey}`);
      return null;
    }

    return data.value;
  } catch (err) {
    console.error("Error fetching webhook:", err);
    return null;
  }
}

/**
 * Validate n8n webhook URL format
 */
export function isValidN8NWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const allowedDomains = ["n8n.cloud", "app.n8n.cloud", "hooks.n8n.cloud"];
    return allowedDomains.some((domain) => parsed.hostname.endsWith(domain));
  } catch {
    return false;
  }
}
