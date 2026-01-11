import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extended genre library with rich, detailed prompts for variety
const GENRE_PROMPTS: Record<string, string> = {
  // Luxury & Elegant
  luxury: "Sophisticated ambient music with elegant grand piano melodies interweaving with lush string orchestra. Gentle harp arpeggios and subtle celesta sparkles. Refined, opulent atmosphere perfect for a five-star hotel lobby or private members club. Slow tempo, major key, incredibly smooth and polished. No percussion.",
  
  classical: "Romantic era classical orchestral piece with sweeping violin melodies and rich viola harmonies. Gentle crescendos and diminuendos creating emotional depth. Reminiscent of Debussy's dreamlike impressionism. Full symphony orchestra with delicate woodwind accents. Elegant and timeless.",
  
  piano: "Solo grand piano performance in the style of modern classical composers like Ludovico Einaudi or Nils Frahm. Contemplative, minimalist melodies with emotional depth. Gentle arpeggios and sustained notes creating space and atmosphere. Intimate recording with subtle room ambiance.",
  
  // Jazz & Lounge
  jazz: "Smooth late-night jazz lounge with sultry saxophone lead over warm upright bass and brushed drums. Soft piano comping and gentle guitar voicings. Intimate club atmosphere, slightly smoky and sophisticated. Medium slow tempo, relaxed swing feel. Perfect for a whiskey bar.",
  
  bossa: "Elegant bossa nova with nylon string guitar and soft percussion. Gentle saxophone or flute melodies floating over the groove. Brazilian café atmosphere, warm and romantic. Subtle shakers and light brushwork. Sophisticated and worldly.",
  
  lounge: "Modern electronic chill lounge with deep warm basslines and atmospheric synth pads. Subtle lo-fi textures and vinyl crackle. Downtempo beats with jazz-influenced chord progressions. Perfect for a rooftop bar at sunset. Sophisticated and contemporary.",
  
  // Nature & Ambient
  nature: "Immersive forest soundscape with gentle rain falling on leaves, distant birdsong, and soft wind through trees. Occasional thunder in the far distance. Layered with subtle drones and ambient tones for a meditative quality. Peaceful and grounding.",
  
  ocean: "Calming ocean waves rolling onto a sandy beach with seagulls in the distance. Subtle underwater ambience and gentle wind. Layered with ethereal synth pads and soft piano notes. Perfect for relaxation and sleep. Hypnotic and soothing rhythm.",
  
  rain: "Steady rainfall on windows with occasional distant thunder. Cozy indoor atmosphere with subtle warmth. Layered with extremely soft piano notes barely audible beneath the rain. Perfect for focus and relaxation. ASMR quality recording.",
  
  fireplace: "Warm crackling fireplace with gentle wood pops and sizzles. Cozy cabin atmosphere on a winter night. Subtle wind outside. Layered with very soft cello or violin long tones for emotional warmth. Intimate and comforting.",
  
  // World & Cultural
  mediterranean: "Mediterranean sunset ambience with acoustic guitar, soft hand percussion, and gentle accordion or bouzouki. Warm evening atmosphere at a coastal taverna. Olive groves and sea breeze. Relaxed and romantic.",
  
  arabic: "Elegant Middle Eastern inspired ambient with oud and kanun melodies over gentle frame drum. Modal scales creating exotic atmosphere. Luxurious Dubai or Moroccan riad evening. Sophisticated and mysterious.",
  
  asian: "Zen garden ambience with koto or guzheng over bamboo flute melodies. Gentle water features and wind chimes. Japanese or Chinese classical influence with modern ambient production. Meditative and serene.",
  
  // Modern & Electronic
  cinematic: "Epic cinematic orchestral ambient with sweeping strings, French horns, and ethereal choir pads. Building slowly with emotional intensity. Film score quality production. Majestic mountain vistas or starlit skies. Inspiring and grand.",
  
  synthwave: "Retro-futuristic synthwave ambient with warm analog synthesizer pads and gentle arpeggios. 1980s nostalgia meets modern production. Neon-lit cityscape at night. Dreamy and atmospheric without heavy beats.",
  
  minimal: "Ultra-minimalist ambient in the style of Brian Eno or Stars of the Lid. Slowly evolving synth drones and subtle harmonic shifts. Vast open spaces and stillness. Perfect for deep focus or meditation. Barely perceptible evolution.",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { genre = 'luxury', duration = 120 } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    // Get the prompt for the genre, fallback to luxury
    const musicPrompt = GENRE_PROMPTS[genre] || GENRE_PROMPTS.luxury;
    
    // Clamp duration between 30 and 300 seconds (5 minutes max)
    const clampedDuration = Math.max(30, Math.min(300, duration));

    console.log(`Generating ${genre} music for ${clampedDuration} seconds`);
    console.log(`Prompt: ${musicPrompt.substring(0, 100)}...`);

    const response = await fetch(
      "https://api.elevenlabs.io/v1/music",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: musicPrompt,
          duration_seconds: clampedDuration,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs Music API error:', errorText);
      throw new Error(`Music generation failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    console.log(`Generated ${genre} music successfully (${(audioBuffer.byteLength / 1024).toFixed(1)}KB)`);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        genre,
        duration: clampedDuration,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Music generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
