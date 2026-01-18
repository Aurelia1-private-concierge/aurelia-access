import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePreLaunchMode } from "@/hooks/usePreLaunchMode";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PreLaunchGateProps {
  children: React.ReactNode;
}

// Routes that should always be accessible (even in pre-launch mode)
const ALLOWED_ROUTES = [
  "/coming-soon",
  "/auth",
  "/auth/callback",
  "/reset-password",
  "/admin",
];

const PreLaunchGate = ({ children }: PreLaunchGateProps) => {
  const { isPreLaunch, loading } = usePreLaunchMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        // Query user_roles directly to avoid function overload ambiguity
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (err) {
        console.error("Error:", err);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  // Redirect logic
  useEffect(() => {
    if (loading || checkingAdmin) return;

    const currentPath = location.pathname;
    const isAllowedRoute = ALLOWED_ROUTES.some(
      (route) => currentPath === route || currentPath.startsWith(route + "/")
    );

    // If pre-launch mode is enabled and user is not admin and not on allowed route
    if (isPreLaunch && !isAdmin && !isAllowedRoute) {
      navigate("/coming-soon", { replace: true });
    }
  }, [isPreLaunch, isAdmin, loading, checkingAdmin, location.pathname, navigate]);

  // Show children while checking to prevent black screen
  // The redirect will happen after checks complete if needed
  if (loading || checkingAdmin) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default PreLaunchGate;
