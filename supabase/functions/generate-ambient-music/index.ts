import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Genre prompts optimized for Sound Effects API (max 22 seconds, will be looped)
const GENRE_PROMPTS: Record<string, string> = {
  // Luxury & Elegant
  luxury: "Elegant ambient soundscape with soft piano notes, gentle string harmonics, luxury hotel lobby atmosphere, sophisticated and calm, seamless loop",
  
  classical: "Romantic orchestral ambience with sweeping violin harmonics and rich viola tones, Debussy-inspired dreamlike impressionism, elegant and timeless, seamless loop",
  
  piano: "Solo grand piano ambient, contemplative minimalist melody in style of Ludovico Einaudi, emotional depth with gentle arpeggios, intimate atmosphere, seamless loop",
  
  // Jazz & Lounge
  jazz: "Smooth jazz lounge ambience with sultry saxophone and soft brushed drums, warm upright bass, intimate club atmosphere, sophisticated, seamless loop",
  
  bossa: "Elegant bossa nova ambience with nylon guitar and soft percussion, Brazilian café warmth, gentle shakers, romantic atmosphere, seamless loop",
  
  lounge: "Modern electronic chill lounge with deep bassline, atmospheric synth pads, lo-fi textures, downtempo rooftop bar sunset vibes, seamless loop",
  
  // Nature & Ambient
  nature: "Immersive forest soundscape with gentle rain on leaves, distant birdsong, soft wind through trees, meditative ambient, seamless loop",
  
  ocean: "Calming ocean waves on sandy beach, seagulls in distance, gentle wind, ethereal ambient pads, hypnotic soothing rhythm, seamless loop",
  
  rain: "Steady rainfall on windows with distant thunder, cozy indoor warmth, extremely soft piano undertones, ASMR quality, seamless loop",
  
  fireplace: "Warm crackling fireplace with gentle wood pops, cozy cabin winter atmosphere, subtle warmth, intimate and comforting, seamless loop",
  
  // World & Cultural
  mediterranean: "Mediterranean sunset with acoustic guitar, soft hand percussion, coastal taverna evening, relaxed and romantic, seamless loop",
  
  arabic: "Elegant Middle Eastern oud and kanun melodies, gentle frame drum, modal exotic atmosphere, luxurious Moroccan riad, seamless loop",
  
  asian: "Zen garden koto over bamboo flute, gentle water features and wind chimes, Japanese meditative serenity, seamless loop",
  
  // Modern & Electronic
  cinematic: "Epic cinematic orchestral ambient with sweeping strings, French horns, ethereal choir, majestic and inspiring, seamless loop",
  
  synthwave: "Retro-futuristic synthwave ambient with warm analog pads, gentle arpeggios, neon cityscape at night, dreamy atmospheric, seamless loop",
  
  minimal: "Ultra-minimalist ambient drones in style of Brian Eno, slowly evolving synth, vast stillness, deep focus meditation, seamless loop",
  
  // Additional moods
  meditation: "Deep meditation drone with tibetan singing bowls, peaceful zen atmosphere, spiritual calm energy, seamless loop",
  
  forest: "Forest ambience with birds chirping, gentle creek flowing, morning woodland serenity, natural calm, seamless loop",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { genre = 'luxury', duration = 22 } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    // Get the prompt for the genre, fallback to luxury
    const soundPrompt = GENRE_PROMPTS[genre] || GENRE_PROMPTS.luxury;
    
    // Sound Effects API max is 22 seconds - tracks can be looped on client
    const clampedDuration = Math.min(Math.max(duration, 5), 22);

    console.log(`Generating ${genre} ambient sound for ${clampedDuration} seconds`);
    console.log(`Prompt: ${soundPrompt.substring(0, 80)}...`);

    // Use Sound Effects API which has broader permissions than Music API
    const response = await fetch(
      "https://api.elevenlabs.io/v1/sound-generation",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: soundPrompt,
          duration_seconds: clampedDuration,
          prompt_influence: 0.4,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs Sound API error:', errorText);
      throw new Error(`Sound generation failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    console.log(`Generated ${genre} ambient sound successfully (${(audioBuffer.byteLength / 1024).toFixed(1)}KB)`);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        genre,
        duration: clampedDuration,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Ambient sound generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
