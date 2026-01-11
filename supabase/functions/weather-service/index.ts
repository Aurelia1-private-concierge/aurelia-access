import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, city } = await req.json();
    
    let lat = latitude;
    let lon = longitude;
    
    // If city provided, geocode it first using Open-Meteo's geocoding
    if (city && (!lat || !lon)) {
      console.log(`Geocoding city: ${city}`);
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();
      
      if (geoData.results && geoData.results.length > 0) {
        lat = geoData.results[0].latitude;
        lon = geoData.results[0].longitude;
        console.log(`Found coordinates: ${lat}, ${lon}`);
      } else {
        throw new Error(`City not found: ${city}`);
      }
    }
    
    if (!lat || !lon) {
      throw new Error('Latitude and longitude are required');
    }
    
    // Fetch weather from Open-Meteo (completely free, no API key needed)
    console.log(`Fetching weather for coordinates: ${lat}, ${lon}`);
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto`
    );
    
    const weatherData = await weatherResponse.json();
    
    // Map weather codes to descriptions
    const weatherDescriptions: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail',
    };
    
    const currentCode = weatherData.current?.weather_code || 0;
    
    const formattedData = {
      current: {
        temperature: weatherData.current?.temperature_2m,
        feels_like: weatherData.current?.apparent_temperature,
        humidity: weatherData.current?.relative_humidity_2m,
        wind_speed: weatherData.current?.wind_speed_10m,
        uv_index: weatherData.current?.uv_index,
        description: weatherDescriptions[currentCode] || 'Unknown',
        weather_code: currentCode,
      },
      forecast: weatherData.daily?.time?.map((date: string, i: number) => ({
        date,
        temp_max: weatherData.daily.temperature_2m_max[i],
        temp_min: weatherData.daily.temperature_2m_min[i],
        precipitation_chance: weatherData.daily.precipitation_probability_max[i],
        description: weatherDescriptions[weatherData.daily.weather_code[i]] || 'Unknown',
      })) || [],
      location: {
        latitude: lat,
        longitude: lon,
        timezone: weatherData.timezone,
      },
    };
    
    console.log('Weather data fetched successfully');
    
    return new Response(JSON.stringify(formattedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Weather service error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
