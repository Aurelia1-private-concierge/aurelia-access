import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Fingerprint, Shield, Loader2 } from "lucide-react";
import { QuantumInput, QuantumButton, QuantumBiometric, QuantumLoader } from "@/components/quantum";
import { cn } from "@/lib/utils";
import { lovable } from "@/integrations/lovable";

interface QuantumAuthFormProps {
  mode: "login" | "signup" | "reset";
  onSubmit: (email: string, password: string) => Promise<void>;
  onModeChange?: (mode: "login" | "signup" | "reset") => void;
  isLoading?: boolean;
  showBiometric?: boolean;
  onBiometricAuth?: () => void;
  className?: string;
}

export const QuantumAuthForm = ({
  mode,
  onSubmit,
  onModeChange,
  isLoading = false,
  showBiometric = false,
  onBiometricAuth,
  className,
}: QuantumAuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showBiometricScan, setShowBiometricScan] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        console.error("Google sign-in error:", error);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        console.error("Apple sign-in error:", error);
      }
    } catch (err) {
      console.error("Apple sign-in error:", err);
    } finally {
      setAppleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === "signup" && password !== confirmPassword) {
      return;
    }
    await onSubmit(email, password);
  };

  const handleBiometricClick = () => {
    setShowBiometricScan(true);
  };

  const handleBiometricComplete = () => {
    setShowBiometricScan(false);
    onBiometricAuth?.();
  };

  if (showBiometricScan) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn("flex flex-col items-center gap-6", className)}
      >
        <QuantumBiometric
          type="fingerprint"
          autoStart
          scanDuration={2500}
          onScanComplete={handleBiometricComplete}
          size="lg"
        />
        <button
          onClick={() => setShowBiometricScan(false)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          Cancel biometric authentication
        </button>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <QuantumLoader variant="superposition" size="lg" />
        <p className="mt-4 text-sm font-mono text-muted-foreground">
          {mode === "login" ? "Authenticating..." : mode === "signup" ? "Creating account..." : "Sending reset link..."}
        </p>
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className={cn("space-y-6", className)}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center"
        >
          <Shield className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="font-serif text-2xl text-foreground mb-2">
          {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Reset Password"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === "login"
            ? "Enter your credentials to access your dashboard"
            : mode === "signup"
            ? "Join Aurelia's exclusive membership"
            : "We'll send you a secure reset link"}
        </p>
      </div>

      {/* Email input */}
      <QuantumInput
        type="email"
        label="Email Address"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail className="w-4 h-4" />}
        required
      />

      {/* Password input (not for reset mode) */}
      {mode !== "reset" && (
        <div className="relative">
          <QuantumInput
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Confirm password (signup only) */}
      <AnimatePresence>
        {mode === "signup" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <QuantumInput
              type={showPassword ? "text" : "password"}
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              error={password !== confirmPassword && confirmPassword.length > 0 ? "Passwords do not match" : undefined}
              required
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <QuantumButton
        variant="primary"
        size="lg"
        className="w-full"
        showParticles
        onClick={handleSubmit}
      >
        {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
      </QuantumButton>

      {/* Social login divider */}
      {mode !== "reset" && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-primary/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-mono">or continue with</span>
          </div>
        </div>
      )}

      {/* Social sign-in buttons */}
      {mode !== "reset" && (
        <div className="space-y-3">
          <QuantumButton
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || appleLoading}
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </QuantumButton>

          <QuantumButton
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleAppleSignIn}
            disabled={appleLoading || googleLoading}
          >
            {appleLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                />
              </svg>
            )}
            Continue with Apple
          </QuantumButton>
        </div>
      )}

      {/* Biometric option */}
      {showBiometric && mode === "login" && (
        <QuantumButton
          variant="secondary"
          size="lg"
          className="w-full"
          icon={<Fingerprint className="w-5 h-5" />}
          onClick={handleBiometricClick}
        >
          Use Biometric Authentication
        </QuantumButton>
      )}

      {/* Mode switcher */}
      <div className="text-center space-y-2 pt-4">
        {mode === "login" && (
          <>
            <button
              type="button"
              onClick={() => onModeChange?.("reset")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono"
            >
              Forgot your password?
            </button>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => onModeChange?.("signup")}
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Create one
              </button>
            </p>
          </>
        )}
        {mode === "signup" && (
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onModeChange?.("login")}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Sign in
            </button>
          </p>
        )}
        {mode === "reset" && (
          <button
            type="button"
            onClick={() => onModeChange?.("login")}
            className="text-sm text-primary hover:text-primary/80 transition-colors font-mono"
          >
            Back to sign in
          </button>
        )}
      </div>
    </motion.form>
  );
};

export default QuantumAuthForm;
