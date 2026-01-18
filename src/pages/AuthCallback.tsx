import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for errors in callback
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const error = hashParams.get("error") || queryParams.get("error");
        if (error) {
          console.error("OAuth error:", error);
          navigate("/auth?error=oauth_failed", { replace: true });
          return;
        }

        // Wait for session to be established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          navigate("/auth?error=session_failed", { replace: true });
          return;
        }

        if (session) {
          navigate("/dashboard", { replace: true });
        } else {
          // Give auth state time to propagate
          setTimeout(() => navigate("/dashboard", { replace: true }), 500);
        }
      } catch (err) {
        console.error("Callback error:", err);
        navigate("/auth?error=callback_failed", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
