import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface WeatherData {
  current: {
    temperature: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    uv_index: number;
    description: string;
  };
  forecast: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    precipitation_chance: number;
    description: string;
  }>;
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

interface CurrencyData {
  base: string;
  amount: number;
  date: string;
  rates: Record<string, number>;
  conversions: Record<string, number>;
}

interface CountryData {
  name: string;
  official_name: string;
  capital: string | null;
  currencies: Array<{ code: string; name: string; symbol: string }>;
  languages: string[];
  population: number;
  region: string;
  subregion: string;
  flag: string;
  timezones: string[];
  coordinates: { lat: number; lng: number } | null;
}

interface AIInsight {
  type: string;
  insight: string;
  generated_at?: string;
  curated?: boolean;
}

export function useSmartIntegrations() {
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [currencyData, setCurrencyData] = useState<CurrencyData | null>(null);
  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const [aiInsight, setAIInsight] = useState<AIInsight | null>(null);

  const fetchWeather = useCallback(async (params: { city?: string; latitude?: number; longitude?: number }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('weather-service', {
        body: params,
      });
      
      if (error) throw error;
      setWeatherData(data);
      return data;
    } catch (error: any) {
      console.error('Weather fetch error:', error);
      toast({
        title: 'Weather Error',
        description: error.message || 'Failed to fetch weather data',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const convertCurrency = useCallback(async (from: string, to?: string, amount?: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('currency-service', {
        body: { from, to, amount },
      });
      
      if (error) throw error;
      setCurrencyData(data);
      return data;
    } catch (error: any) {
      console.error('Currency fetch error:', error);
      toast({
        title: 'Currency Error',
        description: error.message || 'Failed to fetch exchange rates',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCountryInfo = useCallback(async (country?: string, region?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('countries-service', {
        body: { country, region },
      });
      
      if (error) throw error;
      
      // Check if the response contains an error message
      if (data?.error) {
        throw new Error(data.error);
      }
      
      if (data.country) {
        setCountryData(data.country);
      }
      return data;
    } catch (error: any) {
      console.error('Country fetch error:', error);
      toast({
        title: 'Country Not Found',
        description: error.message || 'Failed to fetch country data. Please enter a valid country name.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAIInsight = useCallback(async (type: 'travel' | 'wellness' | 'lifestyle' | 'investment', context?: any, preferences?: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { type, context, preferences },
      });
      
      if (error) throw error;
      setAIInsight(data);
      return data;
    } catch (error: any) {
      console.error('AI insight error:', error);
      toast({
        title: 'Insight Error',
        description: error.message || 'Failed to generate insight',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserLocation = useCallback((): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }, []);

  return {
    isLoading,
    weatherData,
    currencyData,
    countryData,
    aiInsight,
    fetchWeather,
    convertCurrency,
    fetchCountryInfo,
    getAIInsight,
    getUserLocation,
  };
}
