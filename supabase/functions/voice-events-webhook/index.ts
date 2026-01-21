import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-elevenlabs-signature',
};

// Valid ElevenLabs event types for basic validation
const VALID_EVENT_TYPES = [
  'conversation.started',
  'conversation.ended',
  'transcript.final',
  'transcript.partial',
  'agent.response',
  'agent.response.started',
  'agent.response.ended',
  'error',
  'ping',
];

interface VoiceEvent {
  event_type: string;
  conversation_id?: string;
  agent_id?: string;
  timestamp?: string;
  data?: {
    transcript?: string;
    duration_seconds?: number;
    user_id?: string;
    metadata?: Record<string, unknown>;
  };
}

// HMAC signature verification for webhook security
async function verifySignature(body: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !secret) {
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    return result === 0;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Basic validation - checks event structure matches expected ElevenLabs format
function isValidEvent(event: unknown): event is VoiceEvent {
  if (!event || typeof event !== 'object') return false;
  const e = event as Record<string, unknown>;
  
  // Must have event_type string
  if (typeof e.event_type !== 'string') return false;
  
  // event_type should be a known type (or at least look reasonable)
  const eventType = e.event_type;
  if (!VALID_EVENT_TYPES.includes(eventType) && !eventType.match(/^[a-z_]+(\.[a-z_]+)*$/)) {
    return false;
  }
  
  // conversation_id if present must be string
  if (e.conversation_id !== undefined && typeof e.conversation_id !== 'string') return false;
  
  // agent_id if present must be string
  if (e.agent_id !== undefined && typeof e.agent_id !== 'string') return false;
  
  return true;
}

// Extract client IP for rate limiting
function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.text();
    
    // Verify webhook signature if secret is configured
    const webhookSecret = Deno.env.get('ELEVENLABS_WEBHOOK_SECRET');
    const signature = req.headers.get('x-elevenlabs-signature');
    
    if (webhookSecret) {
      const isValid = await verifySignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Webhook signature verified successfully');
    } else {
      console.log('No webhook secret configured, skipping signature verification');
    }
    
    let event: unknown;
    
    try {
      event = JSON.parse(body);
    } catch {
      console.error('Invalid JSON in request body');
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Rate limiting by IP
    const clientIP = getClientIP(req);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { data: rateLimitAllowed } = await supabase.rpc(
      "check_rate_limit",
      {
        p_identifier: `voice_webhook_${clientIP}`,
        p_action_type: "voice_webhook",
        p_max_requests: 100,
        p_window_minutes: 1,
      }
    );

    if (rateLimitAllowed === false) {
      console.error(`Rate limited voice webhook from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Rate limited' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate event structure
    if (!isValidEvent(event)) {
      console.error('Invalid event structure:', JSON.stringify(event).slice(0, 200));
      return new Response(
        JSON.stringify({ error: 'Invalid event structure' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Received voice event:', JSON.stringify(event, null, 2));

    // Handle different event types from ElevenLabs
    switch (event.event_type) {
      case 'conversation.started':
        console.log(`Conversation started: ${event.conversation_id}`);
        break;

      case 'conversation.ended':
        console.log(`Conversation ended: ${event.conversation_id}`);
        
        // Store conversation summary if we have transcript data
        if (event.data?.transcript && event.data?.user_id) {
          const { error } = await supabase
            .from('conversations')
            .update({
              ended_at: new Date().toISOString(),
              summary: event.data.transcript.substring(0, 500),
              metadata: {
                duration_seconds: event.data.duration_seconds,
                elevenlabs_conversation_id: event.conversation_id,
              }
            })
            .eq('user_id', event.data.user_id)
            .is('ended_at', null)
            .order('started_at', { ascending: false })
            .limit(1);

          if (error) {
            console.error('Error updating conversation:', error);
          }
        }
        break;

      case 'transcript.final':
        console.log(`Final transcript received for: ${event.conversation_id}`);
        
        // Store the transcript message
        if (event.data?.transcript && event.data?.user_id) {
          // Find the active conversation for this user
          const { data: conversation } = await supabase
            .from('conversations')
            .select('id')
            .eq('user_id', event.data.user_id)
            .is('ended_at', null)
            .order('started_at', { ascending: false })
            .limit(1)
            .single();

          if (conversation) {
            const { error } = await supabase
              .from('conversation_messages')
              .insert({
                conversation_id: conversation.id,
                role: 'user',
                content: event.data.transcript,
                metadata: {
                  source: 'elevenlabs_webhook',
                  elevenlabs_conversation_id: event.conversation_id,
                }
              });

            if (error) {
              console.error('Error storing transcript:', error);
            }
          }
        }
        break;

      case 'agent.response':
        console.log(`Agent response for: ${event.conversation_id}`);
        
        if (event.data?.transcript && event.data?.user_id) {
          const { data: conversation } = await supabase
            .from('conversations')
            .select('id')
            .eq('user_id', event.data.user_id)
            .is('ended_at', null)
            .order('started_at', { ascending: false })
            .limit(1)
            .single();

          if (conversation) {
            const { error } = await supabase
              .from('conversation_messages')
              .insert({
                conversation_id: conversation.id,
                role: 'assistant',
                content: event.data.transcript,
                metadata: {
                  source: 'elevenlabs_webhook',
                  elevenlabs_conversation_id: event.conversation_id,
                }
              });

            if (error) {
              console.error('Error storing agent response:', error);
            }
          }
        }
        break;

      case 'error':
        console.error('Voice error event:', event.data);
        break;

      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }

    // Log event for analytics
    const { error: analyticsError } = await supabase
      .from('analytics_events')
      .insert({
        event_name: `voice_${event.event_type}`,
        event_category: 'voice',
        event_data: {
          conversation_id: event.conversation_id,
          agent_id: event.agent_id,
          ...event.data
        }
      });

    if (analyticsError) {
      console.error('Error logging analytics:', analyticsError);
    }

    return new Response(
      JSON.stringify({ success: true, event_type: event.event_type }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
