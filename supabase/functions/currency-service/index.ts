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
    const { from, to, amount } = await req.json();
    
    const fromCurrency = (from || 'USD').toUpperCase();
    const toCurrency = to?.toUpperCase();
    const convertAmount = amount || 1;
    
    console.log(`Currency conversion: ${convertAmount} ${fromCurrency} to ${toCurrency || 'all'}`);
    
    // Fetch exchange rates from Frankfurter API (completely free, no API key needed)
    let url = `https://api.frankfurter.app/latest?from=${fromCurrency}`;
    if (toCurrency) {
      url += `&to=${toCurrency}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Calculate converted amounts
    const conversions: Record<string, number> = {};
    for (const [currency, rate] of Object.entries(data.rates)) {
      conversions[currency] = Number((convertAmount * (rate as number)).toFixed(2));
    }
    
    const result = {
      base: fromCurrency,
      amount: convertAmount,
      date: data.date,
      rates: data.rates,
      conversions,
    };
    
    console.log('Currency data fetched successfully');
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Currency service error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
