import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PreLaunchGateProps {
  children: React.ReactNode;
}

// Routes that should always be accessible
const ALLOWED_ROUTES = [
  "/coming-soon",
  "/auth",
  "/auth/callback",
  "/reset-password",
  "/admin",
];

const PreLaunchGate = ({ children }: PreLaunchGateProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasChecked, setHasChecked] = useState(false);

  // Single async check that doesn't block rendering
  useEffect(() => {
    if (hasChecked) return;

    const checkPreLaunch = async () => {
      try {
        // Set a timeout to prevent hanging
        const timeoutPromise = new Promise<null>((resolve) => 
          setTimeout(() => resolve(null), 2000)
        );

        const fetchPromise = supabase
          .from("app_settings")
          .select("value")
          .eq("key", "pre_launch_mode")
          .maybeSingle();

        const result = await Promise.race([fetchPromise, timeoutPromise]);
        
        // Timeout or error - allow access
        if (!result || result === null) {
          setHasChecked(true);
          return;
        }

        const setting = (result as { data: { value: string } | null }).data;

        // If pre-launch mode is not enabled, do nothing
        if (setting?.value !== "true") {
          setHasChecked(true);
          return;
        }

        // Check if on allowed route
        const currentPath = location.pathname;
        const isAllowedRoute = ALLOWED_ROUTES.some(
          (route) => currentPath === route || currentPath.startsWith(route + "/")
        );

        if (isAllowedRoute) {
          setHasChecked(true);
          return;
        }

        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();

          if (roleData) {
            setHasChecked(true);
            return; // Admin - allow access
          }
        }

        // Pre-launch active, not admin, not allowed route - redirect
        navigate("/coming-soon", { replace: true });
      } catch (err) {
        // On any error, allow access (fail open)
        console.warn("PreLaunch check failed:", err);
      } finally {
        setHasChecked(true);
      }
    };

    checkPreLaunch();
  }, [hasChecked, location.pathname, navigate]);

  // Always render children immediately - never block
  return <>{children}</>;
};

export default PreLaunchGate;
