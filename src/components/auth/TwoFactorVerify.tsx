import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface TwoFactorVerifyProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const TwoFactorVerify = ({ onSuccess, onCancel }: TwoFactorVerifyProps) => {
  const [verifyCode, setVerifyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (verifyCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Get TOTP factors
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        setError(factorsError.message);
        return;
      }

      const totpFactor = factors.totp[0];
      
      if (!totpFactor) {
        setError("No 2FA factors found");
        return;
      }

      // Create challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challengeError) {
        setError(challengeError.message);
        return;
      }

      // Verify code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: verifyCode,
      });

      if (verifyError) {
        setError("Invalid code. Please try again.");
        setVerifyCode("");
        return;
      }

      toast({
        title: "Verification Successful",
        description: "You have been securely authenticated.",
      });
      onSuccess();
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-submit when 6 digits are entered
  const handleCodeChange = (code: string) => {
    setVerifyCode(code);
    setError("");
    if (code.length === 6) {
      setTimeout(() => handleVerify(), 100);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
        <Shield className="w-8 h-8 text-primary" />
      </div>
      
      <h2 className="font-serif text-2xl text-foreground mb-2">
        Two-Factor Authentication
      </h2>
      <p className="text-muted-foreground text-sm mb-8">
        Enter the 6-digit code from your authenticator app
      </p>

      {/* OTP Input */}
      <div className="flex justify-center mb-4">
        <InputOTP
          value={verifyCode}
          onChange={handleCodeChange}
          maxLength={6}
          disabled={isLoading}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive mb-4">{error}</p>
      )}

      {/* Submit button */}
      <button
        onClick={handleVerify}
        disabled={isLoading || verifyCode.length !== 6}
        className="w-full py-3 bg-primary text-primary-foreground font-medium text-sm tracking-widest uppercase rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify"
        )}
      </button>

      {/* Back button */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sign In
      </button>

      <p className="text-xs text-muted-foreground mt-6">
        Lost access to your authenticator? Contact support for account recovery.
      </p>
    </motion.div>
  );
};

export default TwoFactorVerify;
