import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export type AdminAction =
  // User data access
  | "admin.user_viewed"
  | "admin.user_profile_accessed"
  | "admin.user_list_viewed"
  | "admin.user_search"
  // Data exports
  | "admin.data_exported"
  | "admin.csv_downloaded"
  | "admin.report_generated"
  // Partner management
  | "admin.partner_approved"
  | "admin.partner_rejected"
  | "admin.partner_viewed"
  | "admin.partner_list_accessed"
  // Contact & submissions
  | "admin.contact_viewed"
  | "admin.contact_status_changed"
  | "admin.submission_deleted"
  // Service requests
  | "admin.service_request_viewed"
  | "admin.service_request_assigned"
  | "admin.service_request_status_changed"
  // Trials
  | "admin.trial_approved"
  | "admin.trial_rejected"
  | "admin.trial_extended"
  // Commissions & payments
  | "admin.commission_approved"
  | "admin.commission_paid"
  | "admin.payout_initiated"
  // Settings & configuration
  | "admin.settings_changed"
  | "admin.role_granted"
  | "admin.role_revoked"
  // Notifications
  | "admin.notification_sent"
  | "admin.broadcast_sent"
  // Security
  | "admin.audit_log_accessed"
  | "admin.sensitive_data_accessed"
  | "admin.bulk_action_performed";

export type AdminResourceType =
  | "user"
  | "profile"
  | "partner"
  | "partner_application"
  | "contact_submission"
  | "service_request"
  | "trial_application"
  | "commission"
  | "notification"
  | "settings"
  | "audit_log"
  | "launch_signup"
  | "crm_record";

interface AuditLogDetails {
  resource_count?: number;
  filter_criteria?: Record<string, unknown>;
  old_value?: unknown;
  new_value?: unknown;
  reason?: string;
  [key: string]: unknown;
}

export const useAdminAuditLog = () => {
  const { user } = useAuth();

  const logAdminAction = useCallback(
    async (
      action: AdminAction,
      resourceType: AdminResourceType,
      resourceId?: string,
      details?: AuditLogDetails
    ) => {
      if (!user?.id) {
        console.warn("Cannot log admin action: no authenticated user");
        return;
      }

      try {
        const userAgent = navigator.userAgent;

        // Get approximate IP
        let ipAddress: string | null = null;
        try {
          const response = await fetch("https://api.ipify.org?format=json", {
            signal: AbortSignal.timeout(2000),
          });
          if (response.ok) {
            const data = await response.json();
            ipAddress = data.ip;
          }
        } catch {
          // IP fetch failed, continue without it
        }

        const detailsPayload: Json = {
          ...(details as Record<string, Json>),
          timestamp: new Date().toISOString(),
          admin_email: user.email || null,
        };

        const { error } = await supabase.from("audit_logs").insert([{
          user_id: user.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId || null,
          ip_address: ipAddress,
          user_agent: userAgent,
          details: detailsPayload,
        }]);

        if (error) {
          console.error("Failed to log admin action:", error);
        }
      } catch (err) {
        console.error("Admin audit log error:", err);
      }
    },
    [user]
  );

  // Convenience methods for common admin actions

  const logDataAccess = useCallback(
    (resourceType: AdminResourceType, resourceId?: string, resourceCount?: number) => {
      logAdminAction(
        resourceType === "user" ? "admin.user_viewed" : "admin.sensitive_data_accessed",
        resourceType,
        resourceId,
        { resource_count: resourceCount }
      );
    },
    [logAdminAction]
  );

  const logListAccess = useCallback(
    (resourceType: AdminResourceType, filterCriteria?: Record<string, unknown>, count?: number) => {
      logAdminAction("admin.user_list_viewed", resourceType, undefined, {
        filter_criteria: filterCriteria,
        resource_count: count,
      });
    },
    [logAdminAction]
  );

  const logExport = useCallback(
    (resourceType: AdminResourceType, format: string, recordCount: number) => {
      logAdminAction("admin.csv_downloaded", resourceType, undefined, {
        format,
        resource_count: recordCount,
      });
    },
    [logAdminAction]
  );

  const logPartnerAction = useCallback(
    (action: "approved" | "rejected", partnerId: string, reason?: string) => {
      logAdminAction(
        action === "approved" ? "admin.partner_approved" : "admin.partner_rejected",
        "partner_application",
        partnerId,
        { reason }
      );
    },
    [logAdminAction]
  );

  const logTrialAction = useCallback(
    (action: "approved" | "rejected" | "extended", trialId: string, details?: Record<string, unknown>) => {
      const actionMap = {
        approved: "admin.trial_approved" as AdminAction,
        rejected: "admin.trial_rejected" as AdminAction,
        extended: "admin.trial_extended" as AdminAction,
      };
      logAdminAction(actionMap[action], "trial_application", trialId, details);
    },
    [logAdminAction]
  );

  const logServiceRequestAction = useCallback(
    (action: "viewed" | "assigned" | "status_changed", requestId: string, details?: Record<string, unknown>) => {
      const actionMap = {
        viewed: "admin.service_request_viewed" as AdminAction,
        assigned: "admin.service_request_assigned" as AdminAction,
        status_changed: "admin.service_request_status_changed" as AdminAction,
      };
      logAdminAction(actionMap[action], "service_request", requestId, details);
    },
    [logAdminAction]
  );

  const logContactAction = useCallback(
    (action: "viewed" | "status_changed" | "deleted", contactId: string, details?: Record<string, unknown>) => {
      const actionMap = {
        viewed: "admin.contact_viewed" as AdminAction,
        status_changed: "admin.contact_status_changed" as AdminAction,
        deleted: "admin.submission_deleted" as AdminAction,
      };
      logAdminAction(actionMap[action], "contact_submission", contactId, details);
    },
    [logAdminAction]
  );

  const logNotificationSent = useCallback(
    (type: "single" | "broadcast", recipientCount: number, details?: Record<string, unknown>) => {
      logAdminAction(
        type === "broadcast" ? "admin.broadcast_sent" : "admin.notification_sent",
        "notification",
        undefined,
        { recipient_count: recipientCount, ...details }
      );
    },
    [logAdminAction]
  );

  const logCommissionAction = useCallback(
    (action: "approved" | "paid", commissionId: string, amount?: number) => {
      logAdminAction(
        action === "approved" ? "admin.commission_approved" : "admin.commission_paid",
        "commission",
        commissionId,
        { amount }
      );
    },
    [logAdminAction]
  );

  const logSettingsChange = useCallback(
    (settingName: string, oldValue: unknown, newValue: unknown) => {
      logAdminAction("admin.settings_changed", "settings", settingName, {
        old_value: oldValue,
        new_value: newValue,
      });
    },
    [logAdminAction]
  );

  const logBulkAction = useCallback(
    (resourceType: AdminResourceType, action: string, resourceIds: string[]) => {
      logAdminAction("admin.bulk_action_performed", resourceType, undefined, {
        action,
        resource_ids: resourceIds,
        resource_count: resourceIds.length,
      });
    },
    [logAdminAction]
  );

  const logAuditLogAccess = useCallback(() => {
    logAdminAction("admin.audit_log_accessed", "audit_log");
  }, [logAdminAction]);

  return {
    logAdminAction,
    logDataAccess,
    logListAccess,
    logExport,
    logPartnerAction,
    logTrialAction,
    logServiceRequestAction,
    logContactAction,
    logNotificationSent,
    logCommissionAction,
    logSettingsChange,
    logBulkAction,
    logAuditLogAccess,
  };
};

export default useAdminAuditLog;
