import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Full Aurelia tour script
const TOUR_SCRIPT = `Welcome to Aurelia, where extraordinary becomes ordinary.

We are the world's most exclusive lifestyle concierge, serving discerning individuals who expect nothing but the exceptional.

With presence across five continents and partnerships spanning the globe, Aurelia opens doors that remain closed to others. From securing impossible restaurant reservations to arranging private jet charters at a moment's notice, our network delivers the impossible.

Our intelligent platform learns your preferences, anticipates your desires, and curates experiences tailored precisely to your unique lifestyle. Whether it's a private viewing at a prestigious auction house, access to sold-out events, or a spontaneous getaway to a secluded paradise, Aurelia makes it happen.

Our membership tiers, Silver, Gold, and Platinum, offer ascending levels of privilege. Platinum members enjoy unlimited requests, dedicated concierge teams, and access to the world's most exclusive experiences.

Security and discretion are paramount. Every interaction is encrypted, every preference protected, and every request handled with the utmost confidentiality.

Join the select few who experience life without limits. Welcome to Aurelia.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { section } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    const textToNarrate = section || TOUR_SCRIPT;
    
    // Use a sophisticated British voice for luxury feel
    // George - JBFqnCBsd6RMkjVDRZzb (sophisticated British male)
    const voiceId = "JBFqnCBsd6RMkjVDRZzb";

    console.log(`Generating narration, text length: ${textToNarrate.length}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textToNarrate,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.65,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
            speed: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs TTS error:', errorText);
      throw new Error(`TTS generation failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    console.log('Tour narration generated successfully');

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        duration: Math.ceil(textToNarrate.length / 15), // Rough estimate in seconds
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Tour narration error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
