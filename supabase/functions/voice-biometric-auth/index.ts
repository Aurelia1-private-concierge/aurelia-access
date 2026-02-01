import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VoiceSessionRequest {
  action: "start" | "end" | "log_command" | "verify_voiceprint" | "enroll_voiceprint";
  session_id?: string;
  transcript?: string;
  intent?: string;
  confidence?: number;
  entities?: Record<string, unknown>;
  action_taken?: string;
  action_result?: Record<string, unknown>;
  response_text?: string;
  latency_ms?: number;
  voiceprint_sample?: string; // Base64 encoded audio
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    if (token === SUPABASE_ANON_KEY) {
      return new Response(
        JSON.stringify({ error: "User authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: VoiceSessionRequest = await req.json();
    const { action } = body;

    console.log(`Voice action: ${action} for user ${user.id}`);

    switch (action) {
      case "start": {
        // Create a new voice session
        const { data: session, error } = await supabase
          .from("voice_sessions")
          .insert({
            user_id: user.id,
            session_type: "standard",
            started_at: new Date().toISOString(),
            provider: "elevenlabs",
          })
          .select()
          .single();

        if (error) {
          console.error("Failed to create voice session:", error);
          throw new Error("Failed to start voice session");
        }

        console.log(`Voice session started: ${session.id}`);

        return new Response(
          JSON.stringify({
            session_id: session.id,
            started_at: session.started_at,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "end": {
        if (!body.session_id) {
          return new Response(
            JSON.stringify({ error: "session_id required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const endedAt = new Date();
        
        // Get session start time
        const { data: session } = await supabase
          .from("voice_sessions")
          .select("started_at, commands_executed")
          .eq("id", body.session_id)
          .eq("user_id", user.id)
          .single();

        if (!session) {
          return new Response(
            JSON.stringify({ error: "Session not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const startedAt = new Date(session.started_at);
        const durationSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);

        // Get summary of intents from commands
        const { data: commands } = await supabase
          .from("voice_commands")
          .select("intent")
          .eq("session_id", body.session_id);

        const intentsDetected = commands
          ? [...new Set(commands.map((c) => c.intent).filter(Boolean))]
          : [];

        // Update session
        const { error: updateError } = await supabase
          .from("voice_sessions")
          .update({
            ended_at: endedAt.toISOString(),
            duration_seconds: durationSeconds,
            intents_detected: intentsDetected,
          })
          .eq("id", body.session_id)
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Failed to end session:", updateError);
          throw new Error("Failed to end session");
        }

        console.log(`Voice session ended: ${body.session_id}, duration: ${durationSeconds}s`);

        return new Response(
          JSON.stringify({
            session_id: body.session_id,
            duration_seconds: durationSeconds,
            commands_executed: session.commands_executed,
            intents_detected: intentsDetected,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "log_command": {
        if (!body.session_id || !body.transcript) {
          return new Response(
            JSON.stringify({ error: "session_id and transcript required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Insert command
        const { data: command, error: commandError } = await supabase
          .from("voice_commands")
          .insert({
            session_id: body.session_id,
            user_id: user.id,
            transcript: body.transcript,
            intent: body.intent,
            confidence: body.confidence,
            entities: body.entities || {},
            action_taken: body.action_taken,
            action_result: body.action_result,
            response_text: body.response_text,
            latency_ms: body.latency_ms,
          })
          .select()
          .single();

        if (commandError) {
          console.error("Failed to log command:", commandError);
          throw new Error("Failed to log command");
        }

        // Increment commands_executed counter
        // Get current count and increment
        const { data: currentSession } = await supabase
          .from("voice_sessions")
          .select("commands_executed")
          .eq("id", body.session_id)
          .single();

        const currentCount = (currentSession as { commands_executed?: number } | null)?.commands_executed || 0;
        
        await supabase
          .from("voice_sessions")
          .update({ commands_executed: currentCount + 1 })
          .eq("id", body.session_id);

        console.log(`Command logged: ${command.id}, intent: ${body.intent}`);

        return new Response(
          JSON.stringify({
            command_id: command.id,
            intent: body.intent,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "verify_voiceprint": {
        // Check if user has enrolled voiceprint
        const { data: voiceprint } = await supabase
          .from("voiceprint_registry")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (!voiceprint) {
          return new Response(
            JSON.stringify({
              verified: false,
              reason: "no_voiceprint_enrolled",
              message: "Please enroll your voiceprint first",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // In production, this would call an external voice biometric API
        // For now, we simulate verification based on enrollment status
        const simulatedConfidence = 0.85 + Math.random() * 0.1; // 0.85-0.95
        const verified = simulatedConfidence >= voiceprint.verification_threshold;

        if (verified) {
          await supabase
            .from("voiceprint_registry")
            .update({ last_verified_at: new Date().toISOString() })
            .eq("id", voiceprint.id);
        }

        // Update session if session_id provided
        if (body.session_id) {
          await supabase
            .from("voice_sessions")
            .update({
              session_type: "biometric",
              voiceprint_verified: verified,
              voiceprint_confidence: simulatedConfidence,
            })
            .eq("id", body.session_id)
            .eq("user_id", user.id);
        }

        console.log(`Voiceprint verification: ${verified ? "success" : "failed"}, confidence: ${simulatedConfidence}`);

        return new Response(
          JSON.stringify({
            verified,
            confidence: simulatedConfidence,
            threshold: voiceprint.verification_threshold,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "enroll_voiceprint": {
        // Check for existing voiceprint
        const { data: existing } = await supabase
          .from("voiceprint_registry")
          .select("id, enrollment_samples")
          .eq("user_id", user.id)
          .single();

        // In production, this would process the audio sample and create a voiceprint hash
        // For now, we simulate the enrollment process
        const simulatedHash = `vp_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        if (existing) {
          // Add to existing enrollment
          const { error } = await supabase
            .from("voiceprint_registry")
            .update({
              voiceprint_hash: simulatedHash,
              enrollment_samples: existing.enrollment_samples + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (error) throw new Error("Failed to update voiceprint");

          console.log(`Voiceprint updated for user ${user.id}, samples: ${existing.enrollment_samples + 1}`);

          return new Response(
            JSON.stringify({
              enrolled: true,
              samples_collected: existing.enrollment_samples + 1,
              message: "Voiceprint sample added",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          // Create new enrollment
          const { error } = await supabase.from("voiceprint_registry").insert({
            user_id: user.id,
            voiceprint_hash: simulatedHash,
            enrollment_samples: 1,
          });

          if (error) throw new Error("Failed to enroll voiceprint");

          console.log(`Voiceprint enrolled for user ${user.id}`);

          return new Response(
            JSON.stringify({
              enrolled: true,
              samples_collected: 1,
              message: "Voiceprint enrollment started. Provide 3+ samples for optimal accuracy.",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Voice biometric auth error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
