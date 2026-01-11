import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback to curated royalty-free ambient audio URLs
// These are publicly available ambient/relaxation tracks
const GENRE_AUDIO_URLS: Record<string, string[]> = {
  luxury: [
    "https://cdn.pixabay.com/audio/2024/11/04/audio_0ae1d23ac8.mp3", // Elegant piano
    "https://cdn.pixabay.com/audio/2024/09/17/audio_de9c3c51e9.mp3", // Ambient luxury
  ],
  classical: [
    "https://cdn.pixabay.com/audio/2024/02/07/audio_77c54e4bf5.mp3", // Classical piano
    "https://cdn.pixabay.com/audio/2023/10/16/audio_f7a4b46cff.mp3", // Orchestra
  ],
  piano: [
    "https://cdn.pixabay.com/audio/2024/11/04/audio_0ae1d23ac8.mp3",
    "https://cdn.pixabay.com/audio/2024/02/07/audio_77c54e4bf5.mp3",
  ],
  jazz: [
    "https://cdn.pixabay.com/audio/2024/09/12/audio_c0edf3e2f2.mp3", // Jazz lounge
    "https://cdn.pixabay.com/audio/2022/10/25/audio_946945cdec.mp3", // Smooth jazz
  ],
  lounge: [
    "https://cdn.pixabay.com/audio/2024/09/17/audio_de9c3c51e9.mp3",
    "https://cdn.pixabay.com/audio/2024/09/12/audio_c0edf3e2f2.mp3",
  ],
  nature: [
    "https://cdn.pixabay.com/audio/2022/08/23/audio_d12fe0bce3.mp3", // Forest
    "https://cdn.pixabay.com/audio/2022/03/15/audio_8cb749d484.mp3", // Nature sounds
  ],
  ocean: [
    "https://cdn.pixabay.com/audio/2022/06/07/audio_80b975e245.mp3", // Ocean waves
    "https://cdn.pixabay.com/audio/2024/04/04/audio_eff09bede0.mp3", // Beach
  ],
  rain: [
    "https://cdn.pixabay.com/audio/2022/04/12/audio_37d6c5c76b.mp3", // Rain
    "https://cdn.pixabay.com/audio/2024/01/15/audio_59b0e8989c.mp3", // Rain ambient
  ],
  minimal: [
    "https://cdn.pixabay.com/audio/2023/03/20/audio_30db0b08cd.mp3", // Minimal ambient
    "https://cdn.pixabay.com/audio/2022/10/16/audio_7a6f9e3cf5.mp3", // Drone
  ],
  cinematic: [
    "https://cdn.pixabay.com/audio/2024/07/19/audio_a24b03dd11.mp3", // Cinematic
    "https://cdn.pixabay.com/audio/2023/10/16/audio_f7a4b46cff.mp3", // Epic
  ],
  synthwave: [
    "https://cdn.pixabay.com/audio/2024/08/15/audio_97ebe2f7a5.mp3", // Synthwave
    "https://cdn.pixabay.com/audio/2023/05/16/audio_166b9c7424.mp3", // Retro
  ],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { genre = 'luxury' } = await req.json();

    // Get audio URLs for the genre, fallback to luxury
    const audioUrls = GENRE_AUDIO_URLS[genre] || GENRE_AUDIO_URLS.luxury;
    
    // Pick a random track from the available options
    const selectedUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];

    console.log(`Returning ${genre} ambient audio URL: ${selectedUrl}`);

    return new Response(
      JSON.stringify({ 
        audioUrl: selectedUrl,
        genre,
        source: 'curated',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Ambient audio error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});