import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TravelDNAProfile {
  id: string;
  user_id: string;
  traveler_archetype: string | null;
  pace_preference: string | null;
  accommodation_tier: string | null;
  cuisine_affinities: string[] | null;
  activity_preferences: Record<string, boolean> | null;
  seasonal_patterns: Record<string, unknown> | null;
  budget_comfort_zone: Record<string, unknown> | null;
  special_requirements: string[] | null;
  onboarding_completed: boolean;
  last_computed_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  category: string;
  preference_key: string;
  preference_value: unknown;
  confidence_score: number;
  source: string;
}

export const TRAVELER_ARCHETYPES = [
  { id: "epicurean", label: "The Epicurean", description: "Fine dining, wine regions, culinary experiences" },
  { id: "adventurer", label: "The Adventurer", description: "Expeditions, unique destinations, thrill-seeking" },
  { id: "culturalist", label: "The Culturalist", description: "Art, history, museums, local immersion" },
  { id: "wellness_seeker", label: "The Wellness Seeker", description: "Spas, retreats, health-focused travel" },
  { id: "collector", label: "The Collector", description: "Art, watches, wine, rare acquisitions" },
  { id: "social_maven", label: "The Social Maven", description: "Events, galas, exclusive gatherings" },
];

export const PACE_PREFERENCES = [
  { id: "relaxed", label: "Relaxed", description: "Unhurried, minimal scheduling" },
  { id: "moderate", label: "Balanced", description: "Mix of activities and leisure" },
  { id: "intensive", label: "Intensive", description: "Packed itineraries, maximize experiences" },
];

export const ACCOMMODATION_TIERS = [
  { id: "ultra_luxury", label: "Ultra-Luxury", description: "Aman, Four Seasons, Rosewood" },
  { id: "luxury", label: "Luxury", description: "Leading Hotels, Relais & Châteaux" },
  { id: "boutique", label: "Boutique", description: "Unique, design-forward properties" },
  { id: "private", label: "Private", description: "Villas, estates, yachts" },
];

export const CUISINE_OPTIONS = [
  "French", "Italian", "Japanese", "Mediterranean", "Farm-to-Table",
  "Michelin-Starred", "Wine-Focused", "Plant-Based", "Seafood", "Steakhouse"
];

export const ACTIVITY_OPTIONS = [
  { id: "private_aviation", label: "Private Aviation" },
  { id: "yacht_charters", label: "Yacht Charters" },
  { id: "art_collecting", label: "Art Collecting" },
  { id: "wine_experiences", label: "Wine Experiences" },
  { id: "golf", label: "Golf" },
  { id: "spa_wellness", label: "Spa & Wellness" },
  { id: "cultural_tours", label: "Cultural Tours" },
  { id: "adventure_sports", label: "Adventure Sports" },
  { id: "shopping", label: "Personal Shopping" },
  { id: "events_galas", label: "Events & Galas" },
];

export const useTravelDNA = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TravelDNAProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setPreferences([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch travel DNA profile
      const { data: dnaData, error: dnaError } = await supabase
        .from("travel_dna_profile")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (dnaError && dnaError.code !== "PGRST116") {
        throw dnaError;
      }

      if (dnaData) {
        setProfile({
          ...dnaData,
          activity_preferences: dnaData.activity_preferences as Record<string, boolean> | null,
        } as TravelDNAProfile);
      } else {
        setProfile(null);
      }

      // Fetch preferences
      const { data: prefData, error: prefError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id);

      if (prefError) throw prefError;
      setPreferences((prefData as UserPreference[]) || []);
    } catch (err) {
      console.error("Error fetching Travel DNA:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (data: Partial<TravelDNAProfile>) => {
    if (!user) return { error: "Not authenticated" };

    try {
      // Check if profile exists
      const { data: existing } = await supabase
        .from("travel_dna_profile")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const profileData = {
        traveler_archetype: data.traveler_archetype,
        pace_preference: data.pace_preference,
        accommodation_tier: data.accommodation_tier,
        cuisine_affinities: data.cuisine_affinities,
        activity_preferences: data.activity_preferences as never,
        seasonal_patterns: data.seasonal_patterns as never,
        budget_comfort_zone: data.budget_comfort_zone as never,
        special_requirements: data.special_requirements,
        onboarding_completed: data.onboarding_completed,
        last_computed_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from("travel_dna_profile")
          .update(profileData)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("travel_dna_profile")
          .insert({ 
            user_id: user.id,
            ...profileData,
          } as never);
        if (error) throw error;
      }

      await fetchProfile();
      return { error: null };
    } catch (err) {
      console.error("Error saving Travel DNA:", err);
      return { error: err instanceof Error ? err.message : "Failed to save" };
    }
  };

  const savePreference = async (
    category: string,
    key: string,
    value: Record<string, unknown> | string | number | boolean,
    source: string = "explicit"
  ) => {
    if (!user) return { error: "Not authenticated" };

    try {
      // First try to find existing preference
      const { data: existing } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.id)
        .eq("category", category)
        .eq("preference_key", key)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("user_preferences")
          .update({
            preference_value: value as never,
            source,
            confidence_score: source === "explicit" ? 1.0 : 0.5,
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user.id,
            category,
            preference_key: key,
            preference_value: value as never,
            source,
            confidence_score: source === "explicit" ? 1.0 : 0.5,
          });
        if (error) throw error;
      }

      await fetchProfile();
      return { error: null };
    } catch (err) {
      console.error("Error saving preference:", err);
      return { error: err instanceof Error ? err.message : "Failed to save" };
    }
  };

  const completeOnboarding = async () => {
    return saveProfile({ onboarding_completed: true });
  };

  return {
    profile,
    preferences,
    isLoading,
    error,
    saveProfile,
    savePreference,
    completeOnboarding,
    refetch: fetchProfile,
  };
};
