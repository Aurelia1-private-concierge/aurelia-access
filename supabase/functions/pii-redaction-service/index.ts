import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * PII Redaction Service
 * 
 * Protects client privacy when sharing service requests with partners.
 * Applies configurable redaction rules based on viewer role.
 * 
 * Features:
 * - Field-level redaction (email, phone, name, address)
 * - Pattern matching with regex support
 * - Pseudonymization for names (initials only)
 * - Audit logging for compliance
 * - Role-based exception handling
 */

interface RedactionRequest {
  entity_type: "service_request" | "profile" | "message" | "event";
  entity_id: string;
  viewer_role: "partner" | "member" | "admin" | "guest";
  viewer_id?: string;
  fields?: string[]; // Optional: only redact specific fields
}

interface RedactionRule {
  id: string;
  rule_name: string;
  field_names: string[];
  pattern_type: string;
  regex_pattern?: string;
  redaction_type: string;
  mask_character: string;
  preserve_length: boolean;
  show_last_n: number;
  applies_to_roles: string[];
  exception_roles: string[];
  is_active: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { entity_type, entity_id, viewer_role, viewer_id, fields }: RedactionRequest = await req.json();

    if (!entity_type || !entity_id || !viewer_role) {
      return new Response(
        JSON.stringify({ error: "entity_type, entity_id, and viewer_role are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[PII-Redact] Processing ${entity_type}:${entity_id} for ${viewer_role}`);

    // Get active redaction rules for this role
    const { data: rules, error: rulesError } = await supabase
      .from("redaction_rules")
      .select("*")
      .eq("is_active", true)
      .contains("applies_to_roles", [viewer_role]);

    if (rulesError) throw rulesError;

    const activeRules = (rules as RedactionRule[]) || [];
    console.log(`[PII-Redact] Found ${activeRules.length} applicable rules`);

    // Fetch the entity data
    let entityData: Record<string, unknown> | null = null;
    let tableName = "";

    switch (entity_type) {
      case "service_request":
        tableName = "service_requests";
        const { data: request } = await supabase
          .from("service_requests")
          .select("*, profiles!service_requests_client_id_fkey(display_name, email, phone)")
          .eq("id", entity_id)
          .single();
        entityData = request;
        break;

      case "profile":
        tableName = "profiles";
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", entity_id)
          .single();
        entityData = profile;
        break;

      case "message":
        tableName = "concierge_messages";
        const { data: message } = await supabase
          .from("concierge_messages")
          .select("*")
          .eq("id", entity_id)
          .single();
        entityData = message;
        break;

      case "event":
        tableName = "events";
        const { data: event } = await supabase
          .from("events")
          .select("*")
          .eq("id", entity_id)
          .single();
        entityData = event;
        break;
    }

    if (!entityData) {
      return new Response(
        JSON.stringify({ error: "Entity not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Apply redaction rules
    const redactedData = { ...entityData };
    const redactionsApplied: { field: string; rule: string; type: string }[] = [];

    for (const rule of activeRules) {
      // Check if viewer is in exception roles
      if (rule.exception_roles.includes(viewer_role)) {
        continue;
      }

      for (const fieldName of rule.field_names) {
        // Check if we should process this field
        if (fields && !fields.includes(fieldName)) {
          continue;
        }

        // Check if field exists in entity data (direct or nested)
        const fieldValue = getNestedValue(entityData, fieldName);
        
        if (fieldValue !== undefined && fieldValue !== null) {
          const redactedValue = applyRedaction(
            String(fieldValue),
            rule.redaction_type,
            rule.mask_character,
            rule.preserve_length,
            rule.show_last_n,
            rule.regex_pattern
          );

          setNestedValue(redactedData, fieldName, redactedValue);
          redactionsApplied.push({
            field: fieldName,
            rule: rule.rule_name,
            type: rule.redaction_type,
          });
        }
      }
    }

    // Log redaction for audit
    if (redactionsApplied.length > 0 && viewer_id) {
      const logEntries = redactionsApplied.map(r => ({
        entity_type,
        entity_id,
        field_name: r.field,
        viewer_id,
        viewer_role,
        rule_id: activeRules.find(rule => rule.rule_name === r.rule)?.id,
        redaction_type: r.type,
      }));

      await supabase.from("redaction_logs").insert(logEntries);
    }

    console.log(`[PII-Redact] Applied ${redactionsApplied.length} redactions`);

    return new Response(
      JSON.stringify({
        success: true,
        original_entity_type: entity_type,
        original_entity_id: entity_id,
        viewer_role,
        data: redactedData,
        redactions_applied: redactionsApplied.length,
        redaction_details: redactionsApplied,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[PII-Redact] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Apply redaction based on type
 */
function applyRedaction(
  value: string,
  type: string,
  maskChar: string = "*",
  preserveLength: boolean = false,
  showLastN: number = 0,
  regexPattern?: string
): string {
  if (!value) return value;

  switch (type) {
    case "mask":
      return maskValue(value, maskChar, preserveLength, showLastN);

    case "hash":
      // Return a consistent but non-reversible hash
      return `[REDACTED-${hashCode(value).toString(16)}]`;

    case "remove":
      return "[REDACTED]";

    case "pseudonymize":
      // For names, show initials only
      return pseudonymizeName(value);

    case "regex":
      if (regexPattern) {
        try {
          const regex = new RegExp(regexPattern, "g");
          return value.replace(regex, maskChar.repeat(4));
        } catch {
          return maskValue(value, maskChar, preserveLength, showLastN);
        }
      }
      return maskValue(value, maskChar, preserveLength, showLastN);

    default:
      return maskValue(value, maskChar, preserveLength, showLastN);
  }
}

/**
 * Mask a value with specified character
 */
function maskValue(
  value: string,
  maskChar: string,
  preserveLength: boolean,
  showLastN: number
): string {
  if (showLastN > 0 && value.length > showLastN) {
    const visible = value.slice(-showLastN);
    const maskedPart = preserveLength
      ? maskChar.repeat(value.length - showLastN)
      : maskChar.repeat(4);
    return maskedPart + visible;
  }

  if (preserveLength) {
    return maskChar.repeat(value.length);
  }

  return maskChar.repeat(Math.min(8, value.length));
}

/**
 * Convert name to initials
 */
function pseudonymizeName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "[REDACTED]";
  
  const initials = parts
    .map(part => part.charAt(0).toUpperCase())
    .join(".");
  
  return initials + ".";
}

/**
 * Simple hash code for consistent anonymization
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  
  return current;
}

/**
 * Set nested value in object using dot notation
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  
  current[keys[keys.length - 1]] = value;
}
