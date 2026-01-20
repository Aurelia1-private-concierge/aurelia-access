import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const SETTING_KEY = "pre_launch_mode";

export const usePreLaunchMode = () => {
  const [isPreLaunch, setIsPreLaunch] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreLaunchMode = useCallback(async () => {
    // Create a timeout promise to prevent hanging
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 3000);
    });

    try {
      const fetchPromise = supabase
        .from("app_settings")
        .select("value")
        .eq("key", SETTING_KEY)
        .maybeSingle();

      // Race between fetch and timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]);

      if (result === null) {
        // Timeout hit - default to showing the site
        console.warn("Pre-launch mode check timed out - defaulting to live");
        setIsPreLaunch(false);
      } else if (result.error) {
        console.error("Error fetching pre-launch mode:", result.error);
        setIsPreLaunch(false);
      } else {
        setIsPreLaunch(result.data?.value === "true");
      }
    } catch (err) {
      console.error("Error:", err);
      setIsPreLaunch(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePreLaunchMode = async (enabled: boolean) => {
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from("app_settings")
        .select("id")
        .eq("key", SETTING_KEY)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("app_settings")
          .update({ value: enabled ? "true" : "false" })
          .eq("key", SETTING_KEY);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("app_settings")
          .insert({
            key: SETTING_KEY,
            value: enabled ? "true" : "false",
            description: "When enabled, shows Under Construction page to all visitors",
          });

        if (error) throw error;
      }

      setIsPreLaunch(enabled);
      return { success: true };
    } catch (err) {
      console.error("Error toggling pre-launch mode:", err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchPreLaunchMode();
  }, [fetchPreLaunchMode]);

  return {
    isPreLaunch,
    loading,
    togglePreLaunchMode,
    refetch: fetchPreLaunchMode,
  };
};
