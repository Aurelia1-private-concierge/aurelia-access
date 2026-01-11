import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Section-specific narration scripts
const SECTION_SCRIPTS: Record<string, string> = {
  hero: "Welcome to Aurelia. Where extraordinary becomes ordinary. We are the world's most exclusive lifestyle concierge.",
  
  metrics: "Our numbers speak for themselves. Thousands of fulfilled requests, hundreds of exclusive partners, and a global presence spanning five continents.",
  
  features: "Discover our comprehensive suite of services. From private aviation and yacht charters to rare collectibles and exclusive event access. Every desire, fulfilled.",
  
  security: "Your privacy is paramount. Military-grade encryption protects every interaction. Biometric authentication ensures only you access your account.",
  
  experiences: "Curated experiences that transcend the ordinary. Private gallery viewings, Michelin-starred chefs at your residence, front-row seats to sold-out performances.",
  
  membership: "Choose your level of privilege. Silver, Gold, or Platinum. Each tier unlocks ascending levels of exclusivity and personalized service.",
  
  testimonials: "Hear from our distinguished members. Discerning individuals who have discovered what it means to live without limits.",
  
  contact: "Ready to elevate your lifestyle? Our concierge team awaits. Available around the clock, in every timezone, for every request.",
};

// Voice options
const VOICES: Record<string, { id: string; name: string; description: string }> = {
  george: { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", description: "Sophisticated British male" },
  alice: { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", description: "Elegant British female" },
  charlie: { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Warm Australian male" },
  matilda: { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", description: "Refined American female" },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { section, voice = 'george', customText } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    // Get text to narrate
    let textToNarrate = customText;
    if (!textToNarrate && section) {
      textToNarrate = SECTION_SCRIPTS[section];
    }
    
    if (!textToNarrate) {
      throw new Error("No text provided for narration");
    }

    // Get voice ID
    const selectedVoice = VOICES[voice] || VOICES.george;
    
    console.log(`Generating section narration for: ${section || 'custom'}, voice: ${selectedVoice.name}`);

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
            stability: 0.65,
            similarity_boost: 0.75,
            style: 0.35,
            use_speaker_boost: true,
            speed: 0.95,
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

    console.log('Section narration generated successfully');

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        section,
        voice: selectedVoice.name,
        textLength: textToNarrate.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Section narration error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
