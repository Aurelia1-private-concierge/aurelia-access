import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthMFAGetAuthenticatorAssuranceLevelResponse } from "@supabase/supabase-js";

interface MFAState {
  isEnrolled: boolean;
  isVerified: boolean;
  needsVerification: boolean;
  isLoading: boolean;
  factors: Array<{ id: string; friendlyName: string; status: string }>;
}

export const useMFA = () => {
  const [state, setState] = useState<MFAState>({
    isEnrolled: false,
    isVerified: false,
    needsVerification: false,
    isLoading: true,
    factors: [],
  });

  const checkMFAStatus = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        setState({
          isEnrolled: false,
          isVerified: false,
          needsVerification: false,
          isLoading: false,
          factors: [],
        });
        return;
      }

      // Get AAL (Authentication Assurance Level)
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (aalError) {
        console.error("Error getting AAL:", aalError);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Get enrolled factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        console.error("Error listing factors:", factorsError);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const verifiedFactors = factorsData.totp.filter(f => f.status === "verified");
      const isEnrolled = verifiedFactors.length > 0;
      
      // Check if user needs to verify MFA
      // aal1 = password only, aal2 = password + MFA verified
      const needsVerification = isEnrolled && aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2";
      const isVerified = aalData.currentLevel === "aal2";

      setState({
        isEnrolled,
        isVerified,
        needsVerification,
        isLoading: false,
        factors: verifiedFactors.map(f => ({
          id: f.id,
          friendlyName: f.friendly_name || "Authenticator App",
          status: f.status,
        })),
      });
    } catch (err) {
      console.error("Error checking MFA status:", err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const unenrollMFA = async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;
    await checkMFAStatus();
  };

  useEffect(() => {
    checkMFAStatus();
  }, [checkMFAStatus]);

  return {
    ...state,
    checkMFAStatus,
    unenrollMFA,
  };
};

export default useMFA;
