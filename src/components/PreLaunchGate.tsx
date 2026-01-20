import { useEffect, useState, useRef } from "react";
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

// Maximum time to wait for all checks before rendering anyway
const MAX_WAIT_TIME = 4000;

const PreLaunchGate = ({ children }: PreLaunchGateProps) => {
  const { isPreLaunch, loading } = usePreLaunchMode();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [forceReady, setForceReady] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Failsafe: Force ready after MAX_WAIT_TIME
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (!forceReady) {
        console.warn("PreLaunchGate timeout - forcing render");
        setForceReady(true);
      }
    }, MAX_WAIT_TIME);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [forceReady]);

  // Check if user is admin - only when we have a user
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      setCheckingAdmin(true);
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

    // Only check admin status once auth is done loading
    if (!authLoading) {
      checkAdmin();
    }
  }, [user, authLoading]);

  // Redirect logic - only run after all loading is complete OR force ready
  useEffect(() => {
    // If forced ready, skip all checks
    if (forceReady) return;
    
    // Wait for all checks to complete
    if (loading || authLoading || checkingAdmin) return;
    
    // If isPreLaunch is still null, wait
    if (isPreLaunch === null) return;

    const currentPath = location.pathname;
    const isAllowedRoute = ALLOWED_ROUTES.some(
      (route) => currentPath === route || currentPath.startsWith(route + "/")
    );

    // If pre-launch mode is enabled and user is not admin and not on allowed route
    if (isPreLaunch && !isAdmin && !isAllowedRoute) {
      navigate("/coming-soon", { replace: true });
    }
  }, [isPreLaunch, isAdmin, loading, authLoading, checkingAdmin, location.pathname, navigate, forceReady]);

  // Always render children - redirects happen via navigate()
  return <>{children}</>;
};

export default PreLaunchGate;
