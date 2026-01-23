import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Fingerprint, Shield, Loader2 } from "lucide-react";
import { QuantumInput, QuantumButton, QuantumBiometric, QuantumLoader } from "@/components/quantum";
import { cn } from "@/lib/utils";

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

      {/* Biometric option */}
      {showBiometric && mode === "login" && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-primary/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-mono">or</span>
          </div>
        </div>
      )}

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
