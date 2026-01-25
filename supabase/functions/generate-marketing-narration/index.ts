import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Marketing video narration scripts
const NARRATION_SCRIPTS = {
  full_90s: `There exists a world beyond the ordinary. A realm where time bends to your will, where doors remain open only for those who belong.

You've achieved what others only dream of. Yet you find yourself waiting. Negotiating. Compromising. The irony of success: more resources, less time to enjoy them.

Aurelia was born from a singular conviction: that those who have everything should never have to ask twice.

We are not a service. We are your invisible hand — anticipating desires before they form, securing the impossible before you realize you wanted it.

From off-market real estate in Geneva to front-row seats at sold-out performances. From rare vintage timepieces to spontaneous escapes aboard chartered yachts.

Our network spans five continents. Our discretion, absolute. Your preferences, remembered. Your privacy, sovereign.

Membership is by invitation only. We accept just fifty new members each year — not by limitation, but by commitment to those we serve.

Aurelia. Beyond service. Beyond expectation.`,

  short_30s: `There exists a world beyond the ordinary. Where doors remain open only for those who belong.

From rare vintage timepieces to spontaneous escapes aboard chartered yachts. Our network spans five continents. Our discretion, absolute.

Membership is by invitation only.

Aurelia. Beyond service. Beyond expectation.`,

  bumper_15s: `Aurelia. Where the impossible becomes inevitable. Membership by invitation only. Beyond service. Beyond expectation.`,

  tagline_6s: `Aurelia. Beyond service. Beyond expectation.`
};

// Voice options - sophisticated British voices
const VOICES = {
  george: { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", description: "Sophisticated British male" },
  charlie: { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Warm Australian male" },
  daniel: { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", description: "Authoritative British male" },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { version = 'full_90s', voice = 'george', customText } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    // Get script text
    const textToNarrate = customText || NARRATION_SCRIPTS[version as keyof typeof NARRATION_SCRIPTS];
    
    if (!textToNarrate) {
      throw new Error(`Invalid version: ${version}. Available: full_90s, short_30s, bumper_15s, tagline_6s`);
    }

    // Get voice configuration
    const selectedVoice = VOICES[voice as keyof typeof VOICES] || VOICES.george;

    console.log(`Generating marketing narration: ${version}, voice: ${selectedVoice.name}, length: ${textToNarrate.length} chars`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice.id}?output_format=mp3_44100_128`,
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
            stability: 0.70,        // Consistent, authoritative
            similarity_boost: 0.80, // Strong voice characteristics
            style: 0.35,            // Subtle stylization
            use_speaker_boost: true,
            speed: 0.88,            // Slightly slower for gravitas
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

    // Estimate duration (rough calculation)
    const wordsPerMinute = 140; // Slower narration pace
    const wordCount = textToNarrate.split(/\s+/).length;
    const estimatedDuration = Math.ceil((wordCount / wordsPerMinute) * 60);

    console.log(`Marketing narration generated: ~${estimatedDuration}s duration`);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        version,
        voice: selectedVoice.name,
        estimatedDuration,
        wordCount,
        script: textToNarrate,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Marketing narration error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
