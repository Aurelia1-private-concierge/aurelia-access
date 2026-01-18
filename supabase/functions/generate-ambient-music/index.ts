import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GENRE_PROMPTS: Record<string, string> = {
  luxury: "Elegant ambient piano with soft orchestral strings, sophisticated and refined, perfect for a luxury brand experience. Gentle, flowing, and premium feeling.",
  adventure: "Inspiring cinematic orchestral music with soaring melodies, sense of wonder and exploration, uplifting and motivational.",
  professional: "Sophisticated smooth jazz with soft saxophone and piano, elegant and refined, perfect for business and professional settings.",
  trust: "Calm and reassuring ambient music with soft pads and gentle piano, creates feelings of safety and reliability.",
  warm: "Soft emotional strings with gentle piano accompaniment, heartfelt and touching, creates feelings of connection and warmth.",
  welcoming: "Gentle ambient piano with soft atmospheric textures, inviting and comfortable, perfect for hospitality.",
  exclusive: "Premium lounge electronica with sophisticated beats and smooth synths, exclusive club atmosphere, refined and modern.",
  worldly: "Cultural fusion world music with subtle ethnic instruments, sophisticated global sound, elegant international atmosphere.",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { genre = 'luxury', duration = 45 } = await req.json();
    
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = GENRE_PROMPTS[genre] || GENRE_PROMPTS.luxury;
    console.log(`Generating ${genre} music with duration ${duration}s`);
    console.log(`Prompt: ${prompt}`);

    const response = await fetch("https://api.elevenlabs.io/v1/music", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        duration_seconds: Math.min(duration, 60), // Max 60 seconds
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Music generation failed: ${response.status}`, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);
    
    console.log(`Successfully generated ${genre} music, size: ${audioBuffer.byteLength} bytes`);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        genre,
        duration,
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error generating ambient music:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
