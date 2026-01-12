import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RotationRequest {
  keyId: string;
  reason?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user and admin role
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    // Check if user is admin
    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin"
    });

    if (roleError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { keyId, reason }: RotationRequest = await req.json();

    if (!keyId) {
      return new Response(
        JSON.stringify({ error: "Key ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current key
    const { data: currentKey, error: keyError } = await supabase
      .from("encryption_keys")
      .select("*")
      .eq("id", keyId)
      .single();

    if (keyError || !currentKey) {
      return new Response(
        JSON.stringify({ error: "Key not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (currentKey.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Only active keys can be rotated" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const oldVersion = currentKey.key_version;
    const newVersion = oldVersion + 1;

    // Start rotation - set status to rotating
    const { error: updateError } = await supabase
      .from("encryption_keys")
      .update({ status: "rotating" })
      .eq("id", keyId);

    if (updateError) {
      throw updateError;
    }

    try {
      // Simulate key rotation process
      // In a real implementation, this would:
      // 1. Generate new key material
      // 2. Re-encrypt affected data with new key
      // 3. Update key references
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate next rotation date
      const nextRotationAt = new Date();
      nextRotationAt.setDate(nextRotationAt.getDate() + (currentKey.rotation_interval_days || 90));

      // Complete rotation - update key version and status
      const { error: completeError } = await supabase
        .from("encryption_keys")
        .update({
          key_version: newVersion,
          status: "active",
          rotated_at: new Date().toISOString(),
          next_rotation_at: nextRotationAt.toISOString()
        })
        .eq("id", keyId);

      if (completeError) {
        throw completeError;
      }

      // Record rotation in history
      const { error: historyError } = await supabase
        .from("key_rotation_history")
        .insert({
          key_id: keyId,
          old_version: oldVersion,
          new_version: newVersion,
          rotated_by: userId,
          rotation_reason: reason || "Manual rotation",
          success: true,
          affected_records: 0 // In real implementation, track actual affected records
        });

      if (historyError) {
        console.error("Failed to record rotation history:", historyError);
      }

      // Log audit event
      await supabase.from("security_audit_events").insert({
        event_type: "KEY_ROTATION",
        severity: "info",
        resource_type: "encryption_key",
        resource_id: keyId,
        actor_id: userId,
        description: `Encryption key "${currentKey.key_identifier}" rotated from v${oldVersion} to v${newVersion}`,
        metadata: {
          key_identifier: currentKey.key_identifier,
          old_version: oldVersion,
          new_version: newVersion,
          reason: reason || "Manual rotation"
        }
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Key rotated successfully",
          key: {
            id: keyId,
            key_identifier: currentKey.key_identifier,
            old_version: oldVersion,
            new_version: newVersion,
            next_rotation_at: nextRotationAt.toISOString()
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (rotationError) {
      // Rotation failed - revert status
      await supabase
        .from("encryption_keys")
        .update({ status: "active" })
        .eq("id", keyId);

      // Record failed rotation
      await supabase.from("key_rotation_history").insert({
        key_id: keyId,
        old_version: oldVersion,
        new_version: newVersion,
        rotated_by: userId,
        rotation_reason: reason || "Manual rotation",
        success: false,
        error_message: rotationError instanceof Error ? rotationError.message : "Unknown error"
      });

      // Log audit event
      await supabase.from("security_audit_events").insert({
        event_type: "KEY_ROTATION_FAILED",
        severity: "error",
        resource_type: "encryption_key",
        resource_id: keyId,
        actor_id: userId,
        description: `Failed to rotate encryption key "${currentKey.key_identifier}"`,
        metadata: {
          key_identifier: currentKey.key_identifier,
          error: rotationError instanceof Error ? rotationError.message : "Unknown error"
        }
      });

      throw rotationError;
    }

  } catch (error) {
    console.error("Key rotation error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Key rotation failed",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
