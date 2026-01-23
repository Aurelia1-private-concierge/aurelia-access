import { useEffect, useState, forwardRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "@/hooks/use-toast";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = forwardRef<HTMLDivElement, AdminRouteProps>(
  ({ children }, ref) => {
    const { user, isLoading: authLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const checkAdminRole = async () => {
        if (!user) {
          setIsAdmin(false);
          setIsChecking(false);
          return;
        }

        try {
          // Query user_roles table directly to avoid RPC function overload ambiguity
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();
          
          if (roleError) {
            console.error("Role query error:", roleError);
            // Fallback: check by email for known admin
            const adminEmails = ["concierge@aurelia-privateconcierge.com"];
            setIsAdmin(adminEmails.includes(user.email || ""));
          } else {
            setIsAdmin(!!roleData);
          }
        } catch (err) {
          console.error("Error checking admin role:", err);
          // Emergency fallback
          const adminEmails = ["concierge@aurelia-privateconcierge.com"];
          setIsAdmin(adminEmails.includes(user.email || ""));
        } finally {
          setIsChecking(false);
        }
      };

      if (!authLoading) {
        checkAdminRole();
      }
    }, [user, authLoading]);

    if (authLoading || isChecking) {
      return <LoadingScreen />;
    }

    if (!user) {
      return <Navigate to="/auth" replace />;
    }

    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this area.",
        variant: "destructive",
      });
      return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
  }
);

AdminRoute.displayName = "AdminRoute";

export default AdminRoute;
