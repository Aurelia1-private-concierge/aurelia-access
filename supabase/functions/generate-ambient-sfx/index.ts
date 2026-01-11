import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Ambient mood prompts for sound generation
const MOOD_PROMPTS: Record<string, string> = {
  luxury: "Soft elegant ambient soundscape with gentle piano notes and strings, luxury hotel lobby atmosphere, calm and sophisticated",
  jazz: "Smooth jazz lounge music, soft saxophone and piano, upscale bar ambiance, relaxing evening atmosphere",
  nature: "Peaceful nature sounds with gentle rain, soft wind through trees, calming water stream, meditation atmosphere",
  ocean: "Ocean waves gently rolling onto shore, seagulls in distance, peaceful beach ambiance, relaxing coastal sounds",
  fireplace: "Crackling fireplace sounds, warm cozy winter cabin atmosphere, gentle flames, relaxing indoor ambiance",
  piano: "Solo piano ambient music, soft melancholic keys, elegant and emotional, concert hall atmosphere",
  lounge: "Electronic chill lounge music, soft beats, modern luxury spa atmosphere, relaxing downtempo",
  classical: "Gentle classical orchestra, soft strings and woodwinds, elegant ballroom atmosphere, sophisticated ambiance",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mood = 'luxury', duration = 22 } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    const prompt = MOOD_PROMPTS[mood] || MOOD_PROMPTS.luxury;
    console.log(`Generating ambient SFX with mood: ${mood}`);

    // Use Sound Effects API which has broader permissions
    const response = await fetch(
      "https://api.elevenlabs.io/v1/sound-generation",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: prompt,
          duration_seconds: Math.min(duration, 22), // Max 22 seconds for SFX
          prompt_influence: 0.4,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs SFX API error:', errorText);
      throw new Error(`SFX generation failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    console.log('Ambient SFX generated successfully');

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        mood,
        duration: Math.min(duration, 22)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Ambient SFX generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
