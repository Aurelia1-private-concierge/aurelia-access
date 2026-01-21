import { createContext, useContext, useEffect, useState, ReactNode, forwardRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Production debugging
const log = (msg: string) => console.log(`[Auth ${Date.now()}] ${msg}`);

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = forwardRef<HTMLDivElement, AuthProviderProps>(
  ({ children }, ref) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    log("AuthProvider rendering, isLoading: " + isLoading);

    useEffect(() => {
      let isMounted = true;
      log("AuthProvider useEffect starting");
      
      // Failsafe: ensure loading state clears within 1.5 seconds max
      const loadingTimeout = setTimeout(() => {
        if (isMounted) {
          log("Auth loading timeout triggered - forcing ready state");
          setIsLoading(false);
        }
      }, 1500);

      // Set up auth state listener FIRST
      log("Setting up onAuthStateChange listener");
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          log(`onAuthStateChange: event=${event}, hasSession=${!!session}`);
          if (!isMounted) return;
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      );

      // THEN check for existing session
      log("Calling getSession...");
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          log(`getSession completed: hasSession=${!!session}`);
          if (!isMounted) return;
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        })
        .catch((err) => {
          log(`getSession error: ${err?.message}`);
          if (isMounted) setIsLoading(false);
        });

      return () => {
        log("AuthProvider cleanup");
        isMounted = false;
        clearTimeout(loadingTimeout);
        subscription.unsubscribe();
      };
    }, []); // Empty dependency array - run once on mount only

    const signUp = async (email: string, password: string) => {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      
      return { error: error as Error | null };
    };

    const signIn = async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error: error as Error | null };
    };

    const signOut = async () => {
      await supabase.auth.signOut();
    };

    log("AuthProvider render complete, providing context");

    return (
      <AuthContext.Provider
        value={{
          user,
          session,
          isLoading,
          signUp,
          signIn,
          signOut,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
);

AuthProvider.displayName = "AuthProvider";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
