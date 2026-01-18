import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { toast } from "sonner";

export interface SurprisePackage {
  id: string;
  name: string;
  tagline: string;
  description: string;
  creditCost: number;
  minValue: number;
  maxValue: number;
  tier: "silver" | "gold" | "platinum" | "all";
  categories: string[];
  frequency: string;
}

export interface SurpriseRequest {
  id: string;
  package_id: string;
  package_name: string;
  credits_spent: number;
  status: "pending" | "processing" | "revealed" | "fulfilled" | "cancelled";
  experience_title?: string;
  experience_description?: string;
  estimated_value_min?: number;
  estimated_value_max?: number;
  revealed_at?: string;
  fulfilled_at?: string;
  user_rating?: number;
  user_feedback?: string;
  created_at: string;
}

export interface SurprisePreferences {
  preferred_categories: string[];
  excluded_categories: string[];
  budget_comfort_level: "conservative" | "moderate" | "adventurous" | "unlimited";
  surprise_frequency: "weekly" | "monthly" | "occasional" | "special_occasions";
  dietary_restrictions: string[];
  accessibility_needs?: string;
  travel_radius_km: number;
  preferred_days: string[];
  notes?: string;
}

export const SURPRISE_PACKAGES: SurprisePackage[] = [
  {
    id: "taste",
    name: "Taste of Luxury",
    tagline: "Epicurean delights await",
    description: "A curated culinary or beverage experience that will tantalize your senses.",
    creditCost: 15,
    minValue: 500,
    maxValue: 2000,
    tier: "all",
    categories: ["Dining", "Wine", "Culinary"],
    frequency: "Available anytime",
  },
  {
    id: "escape",
    name: "The Escape",
    tagline: "Adventure beyond imagination",
    description: "A surprise getaway or adventure that takes you beyond the ordinary.",
    creditCost: 50,
    minValue: 5000,
    maxValue: 15000,
    tier: "gold",
    categories: ["Travel", "Adventure", "Wellness"],
    frequency: "2-4 weeks notice",
  },
  {
    id: "culture",
    name: "Cultural Immersion",
    tagline: "Art, music, and beyond",
    description: "Exclusive access to cultural experiences that money normally can't buy.",
    creditCost: 75,
    minValue: 8000,
    maxValue: 25000,
    tier: "gold",
    categories: ["Art", "Music", "Theater"],
    frequency: "Based on events",
  },
  {
    id: "extraordinary",
    name: "The Extraordinary",
    tagline: "Once in a lifetime",
    description: "The pinnacle of curated experiences. Moments that redefine what's possible.",
    creditCost: 150,
    minValue: 25000,
    maxValue: 100000,
    tier: "platinum",
    categories: ["Exclusive", "VIP", "Bespoke"],
    frequency: "Rare opportunities",
  },
  {
    id: "monthly",
    name: "Monthly Mystery",
    tagline: "Recurring wonder",
    description: "Subscribe to monthly surprises curated based on your evolving preferences.",
    creditCost: 25,
    minValue: 1500,
    maxValue: 5000,
    tier: "silver",
    categories: ["Subscription", "Variety", "Discovery"],
    frequency: "Monthly delivery",
  },
];

const DEFAULT_PREFERENCES: SurprisePreferences = {
  preferred_categories: [],
  excluded_categories: [],
  budget_comfort_level: "moderate",
  surprise_frequency: "occasional",
  dietary_restrictions: [],
  travel_radius_km: 100,
  preferred_days: [],
};

export const useSurpriseMe = () => {
  const { user } = useAuth();
  const { balance, isUnlimited, useCredit } = useCredits();
  
  const [requests, setRequests] = useState<SurpriseRequest[]>([]);
  const [preferences, setPreferences] = useState<SurprisePreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch user's surprise history
  const fetchRequests = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("surprise_me_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests((data as SurpriseRequest[]) || []);
    } catch (error) {
      console.error("Failed to fetch surprise requests:", error);
    }
  }, [user]);

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_surprise_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setPreferences({
          preferred_categories: data.preferred_categories || [],
          excluded_categories: data.excluded_categories || [],
          budget_comfort_level: (data.budget_comfort_level as SurprisePreferences["budget_comfort_level"]) || "moderate",
          surprise_frequency: (data.surprise_frequency as SurprisePreferences["surprise_frequency"]) || "occasional",
          dietary_restrictions: data.dietary_restrictions || [],
          accessibility_needs: data.accessibility_needs,
          travel_radius_km: data.travel_radius_km || 100,
          preferred_days: data.preferred_days || [],
          notes: data.notes,
        });
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    }
  }, [user]);

  // Save preferences
  const savePreferences = async (newPrefs: Partial<SurprisePreferences>) => {
    if (!user) return;

    const updatedPrefs = { ...preferences, ...newPrefs };
    
    try {
      const { error } = await supabase
        .from("user_surprise_preferences")
        .upsert({
          user_id: user.id,
          ...updatedPrefs,
        });

      if (error) throw error;
      
      setPreferences(updatedPrefs);
      toast.success("Preferences saved", {
        description: "Your surprise preferences have been updated.",
      });
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to save preferences");
    }
  };

  // Book a surprise
  const bookSurprise = async (packageId: string): Promise<boolean> => {
    if (!user) {
      toast.error("Please sign in to book a surprise");
      return false;
    }

    const pkg = SURPRISE_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      toast.error("Package not found");
      return false;
    }

    if (!isUnlimited && balance < pkg.creditCost) {
      toast.error("Insufficient credits", {
        description: `You need ${pkg.creditCost} credits for this package.`,
      });
      return false;
    }

    setIsProcessing(true);

    try {
      // Deduct credits
      await useCredit(pkg.creditCost, `Surprise Me: ${pkg.name}`);

      // Create request record
      const { error } = await supabase.from("surprise_me_requests").insert([{
        user_id: user.id,
        package_id: pkg.id,
        package_name: pkg.name,
        credits_spent: pkg.creditCost,
        status: "pending",
        estimated_value_min: pkg.minValue,
        estimated_value_max: pkg.maxValue,
        metadata: JSON.parse(JSON.stringify({
          preferences: preferences,
          booked_at: new Date().toISOString(),
        })),
      }]);

      if (error) throw error;

      await fetchRequests();
      
      toast.success("🎁 Your surprise is being curated!", {
        description: "Orla is crafting something extraordinary. Details within 24-48 hours.",
        duration: 8000,
      });

      return true;
    } catch (error) {
      console.error("Failed to book surprise:", error);
      toast.error("Failed to process surprise", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Rate a fulfilled surprise
  const rateSurprise = async (requestId: string, rating: number, feedback?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("surprise_me_requests")
        .update({
          user_rating: rating,
          user_feedback: feedback,
        })
        .eq("id", requestId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      await fetchRequests();
      toast.success("Thank you for your feedback!");
    } catch (error) {
      console.error("Failed to rate surprise:", error);
      toast.error("Failed to save rating");
    }
  };

  // Check if user can afford a package
  const canAfford = (creditCost: number) => isUnlimited || balance >= creditCost;

  // Get stats
  const getStats = () => {
    const totalSpent = requests.reduce((sum, r) => sum + r.credits_spent, 0);
    const averageRating = requests
      .filter((r) => r.user_rating)
      .reduce((sum, r, _, arr) => sum + (r.user_rating || 0) / arr.length, 0);
    
    return {
      totalRequests: requests.length,
      pendingRequests: requests.filter((r) => r.status === "pending" || r.status === "processing").length,
      fulfilledRequests: requests.filter((r) => r.status === "fulfilled").length,
      totalCreditsSpent: totalSpent,
      averageRating: averageRating || null,
    };
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchRequests(), fetchPreferences()]);
      setIsLoading(false);
    };
    
    if (user) {
      init();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchRequests, fetchPreferences]);

  return {
    packages: SURPRISE_PACKAGES,
    requests,
    preferences,
    isLoading,
    isProcessing,
    bookSurprise,
    savePreferences,
    rateSurprise,
    canAfford,
    getStats,
    refetch: fetchRequests,
  };
};
