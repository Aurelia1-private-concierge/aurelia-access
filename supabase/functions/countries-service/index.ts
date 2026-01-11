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
    const { country, region } = await req.json();
    
    let url = 'https://restcountries.com/v3.1';
    
    if (country) {
      // Search by country name
      url += `/name/${encodeURIComponent(country)}?fields=name,capital,currencies,languages,population,region,subregion,flags,timezones,borders,area,latlng`;
      console.log(`Fetching country data for: ${country}`);
    } else if (region) {
      // Get all countries in a region
      url += `/region/${encodeURIComponent(region)}?fields=name,capital,currencies,population,flags`;
      console.log(`Fetching countries in region: ${region}`);
    } else {
      // Get all countries (limited fields for performance)
      url += '/all?fields=name,capital,currencies,population,region,flags';
      console.log('Fetching all countries');
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Country or region not found`);
      }
      throw new Error(`Failed to fetch country data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format the data for easier consumption
    const formatCountry = (c: any) => ({
      name: c.name?.common || c.name,
      official_name: c.name?.official,
      capital: c.capital?.[0] || null,
      currencies: c.currencies ? Object.entries(c.currencies).map(([code, info]: [string, any]) => ({
        code,
        name: info.name,
        symbol: info.symbol,
      })) : [],
      languages: c.languages ? Object.values(c.languages) : [],
      population: c.population,
      region: c.region,
      subregion: c.subregion,
      flag: c.flags?.svg || c.flags?.png,
      flag_alt: c.flags?.alt,
      timezones: c.timezones,
      borders: c.borders,
      area: c.area,
      coordinates: c.latlng ? { lat: c.latlng[0], lng: c.latlng[1] } : null,
    });
    
    const result = Array.isArray(data) 
      ? { countries: data.map(formatCountry), count: data.length }
      : { country: formatCountry(data) };
    
    console.log('Country data fetched successfully');
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Countries service error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
