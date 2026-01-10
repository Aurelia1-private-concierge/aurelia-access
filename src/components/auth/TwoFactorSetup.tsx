import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Copy, Check, Loader2, Smartphone, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface TwoFactorSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const TwoFactorSetup = ({ onComplete, onCancel }: TwoFactorSetupProps) => {
  const [step, setStep] = useState<"intro" | "qr" | "verify">("intro");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const enrollMFA = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });

      if (error) {
        toast({
          title: "Setup Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.totp) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
        setStep("qr");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to initialize 2FA setup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndActivate = async () => {
    if (verifyCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter all 6 digits",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Challenge the factor
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) {
        toast({
          title: "Challenge Failed",
          description: challengeError.message,
          variant: "destructive",
        });
        return;
      }

      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });

      if (verifyError) {
        toast({
          title: "Verification Failed",
          description: "Invalid code. Please try again.",
          variant: "destructive",
        });
        setVerifyCode("");
        return;
      }

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication is now active on your account.",
      });
      onComplete();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Secret key copied to clipboard",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl">
        {step === "intro" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-2">
              Enable Two-Factor Authentication
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Add an extra layer of security to your account using an authenticator app like Google Authenticator or Authy.
            </p>
            <div className="space-y-3">
              <button
                onClick={enrollMFA}
                disabled={isLoading}
                className="w-full py-3 bg-primary text-primary-foreground font-medium text-sm tracking-widest uppercase rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    Set Up 2FA
                  </>
                )}
              </button>
              <button
                onClick={onCancel}
                className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {step === "qr" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-xl text-foreground mb-2">
              Scan QR Code
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Scan this code with your authenticator app
            </p>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>

            {/* Manual Entry */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">
                Or enter this code manually:
              </p>
              <div className="flex items-center justify-center gap-2">
                <code className="bg-muted/50 px-3 py-2 rounded text-sm font-mono text-foreground break-all">
                  {secret}
                </code>
                <button
                  onClick={copySecret}
                  className="p-2 hover:bg-muted/50 rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep("verify")}
              className="w-full py-3 bg-primary text-primary-foreground font-medium text-sm tracking-widest uppercase rounded-lg hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === "verify" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-xl text-foreground mb-2">
              Verify Setup
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Enter the 6-digit code from your authenticator app
            </p>

            {/* OTP Input */}
            <div className="flex justify-center mb-6">
              <InputOTP
                value={verifyCode}
                onChange={setVerifyCode}
                maxLength={6}
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

            <div className="space-y-3">
              <button
                onClick={verifyAndActivate}
                disabled={isLoading || verifyCode.length !== 6}
                className="w-full py-3 bg-primary text-primary-foreground font-medium text-sm tracking-widest uppercase rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Activate 2FA"
                )}
              </button>
              <button
                onClick={() => setStep("qr")}
                className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Back
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TwoFactorSetup;
