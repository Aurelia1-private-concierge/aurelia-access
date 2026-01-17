import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-elevenlabs-signature',
};

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const event: VoiceEvent = await req.json();
    
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
