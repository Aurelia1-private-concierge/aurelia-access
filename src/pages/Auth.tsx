import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, ArrowLeft, Loader2, Shield, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { AnimatedLogo } from "@/components/brand";
import { TwoFactorVerify } from "@/components/auth/TwoFactorVerify";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { useLoginRateLimit } from "@/hooks/useLoginRateLimit";
import { useMFA } from "@/hooks/useMFA";
import { useAuthAuditLog } from "@/hooks/useAuthAuditLog";
import { useFunnelTracking } from "@/hooks/useFunnelTracking";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, isLoading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showMFAVerify, setShowMFAVerify] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [lastResetRequest, setLastResetRequest] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  
  const { 
    isLimited, 
    attemptsRemaining, 
    cooldownSeconds, 
    recordFailedAttempt, 
    recordSuccessfulLogin,
    formatCooldown 
  } = useLoginRateLimit();
  
  const { needsVerification, checkMFAStatus } = useMFA();
  const { logLogin, logLogout, logSignup, logPasswordReset, logMFAEvent, logOAuthLogin } = useAuthAuditLog();
  const { trackSignupStarted, trackSignupCompleted } = useFunnelTracking();

  const RESET_COOLDOWN_MS = 60000; // 60 seconds

  // Check for MFA verification needed and redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      // Check MFA status
      checkMFAStatus();
      if (needsVerification) {
        setShowMFAVerify(true);
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, authLoading, navigate, needsVerification, checkMFAStatus]);

  // Countdown timer for password reset cooldown
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Don't render the form if user is already logged in (redirect will happen via useEffect)
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    if (!isForgotPassword) {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }

      if (!isLogin && password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check cooldown to prevent email bombing
    const now = Date.now();
    if (now - lastResetRequest < RESET_COOLDOWN_MS) {
      const remaining = Math.ceil((RESET_COOLDOWN_MS - (now - lastResetRequest)) / 1000);
      toast({
        title: "Please Wait",
        description: `You can request another reset link in ${remaining} seconds.`,
        variant: "destructive",
      });
      return;
    }
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Set cooldown after successful request
        setLastResetRequest(now);
        setCooldownRemaining(60);
        setResetEmailSent(true);
        toast({
          title: "Email Sent",
          description: "Check your inbox for a password reset link.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      logOAuthLogin("google");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        toast({
          title: "Google Sign-In Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check rate limit before attempting login
    if (isLogin && isLimited) {
      toast({
        title: "Too Many Attempts",
        description: `Please wait ${formatCooldown(cooldownSeconds)} before trying again.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          // Record failed attempt for rate limiting and audit log
          await recordFailedAttempt(email);
          logLogin(false, email);
          
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Invalid Credentials",
              description: attemptsRemaining > 1 
                ? `The email or password you entered is incorrect. ${attemptsRemaining - 1} attempts remaining.`
                : "The email or password you entered is incorrect.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          // Record successful login and audit log
          recordSuccessfulLogin();
          logLogin(true, email);
          
          // Check if MFA verification is needed
          await checkMFAStatus();
          const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          const { data: factorsData } = await supabase.auth.mfa.listFactors();
          
          const hasVerifiedFactors = factorsData?.totp?.some(f => f.status === "verified");
          const needsMFA = hasVerifiedFactors && aalData?.currentLevel === "aal1";
          
          if (needsMFA) {
            setShowMFAVerify(true);
          } else {
            toast({
              title: "Welcome Back",
              description: "You have successfully signed in.",
            });
            navigate("/dashboard");
          }
        }
      } else {
        trackSignupStarted();
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Account Exists",
              description: "An account with this email already exists. Please sign in.",
              variant: "destructive",
            });
            setIsLogin(true);
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          // Log signup event and track funnel
          logSignup(email);
          trackSignupCompleted(email);
          toast({
            title: "Account Created",
            description: "Welcome! Let's personalize your experience.",
          });
          // Redirect new signups to onboarding
          navigate("/onboarding");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle MFA verification success
  const handleMFASuccess = () => {
    setShowMFAVerify(false);
    logMFAEvent("verify");
    toast({
      title: "Welcome Back",
      description: "You have successfully signed in with 2FA.",
    });
    navigate("/dashboard");
  };

  // Handle MFA verification cancel
  const handleMFACancel = async () => {
    setShowMFAVerify(false);
    logLogout("mfa_cancelled");
    await supabase.auth.signOut();
    setEmail("");
    setPassword("");
  };

  // Show MFA verification screen
  if (showMFAVerify) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <TwoFactorVerify
            onSuccess={handleMFASuccess}
            onCancel={handleMFACancel}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mx-auto"
        >
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <AnimatedLogo size="sm" showWordmark={false} />
            <div>
              <h1 className="font-serif text-2xl text-foreground tracking-wider">AURELIA</h1>
              <p className="text-xs text-primary tracking-widest uppercase">Private Concierge</p>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="font-serif text-3xl text-foreground mb-2">
              {isForgotPassword 
                ? "Reset Password" 
                : isLogin 
                  ? "Welcome Back" 
                  : "Request Access"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isForgotPassword
                ? "Enter your email and we'll send you a reset link"
                : isLogin
                  ? "Sign in to access your private dashboard"
                  : "Create your account to join our exclusive membership"}
            </p>
          </div>

          {/* Reset Email Sent Success */}
          {resetEmailSent && isForgotPassword ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-serif text-xl text-foreground mb-2">Check Your Email</h3>
              <p className="text-muted-foreground text-sm mb-6">
                We've sent a password reset link to <strong className="text-foreground">{email}</strong>
              </p>
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetEmailSent(false);
                  setEmail("");
                }}
                className="text-primary hover:text-primary/80 transition-colors font-medium text-sm"
              >
                Back to Sign In
              </button>
            </motion.div>
          ) : isForgotPassword ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="your@email.com"
                    className={`w-full bg-muted/30 border ${
                      errors.email ? "border-destructive" : "border-border/50"
                    } rounded-lg py-3 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || cooldownRemaining > 0}
                className="w-full py-3 bg-primary text-primary-foreground font-medium text-sm tracking-widest uppercase rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : cooldownRemaining > 0 ? (
                  `Wait ${cooldownRemaining}s`
                ) : (
                  "Send Reset Link"
                )}
              </button>

              {/* Cooldown notice */}
              {cooldownRemaining > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Please wait {cooldownRemaining} seconds before requesting another reset
                </p>
              )}

              {/* Back to login */}
              <p className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setErrors({});
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3 inline mr-1" />
                  Back to Sign In
                </button>
              </p>
            </form>
          ) : (
            /* Login/Signup Form */
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="your@email.com"
                      className={`w-full bg-muted/30 border ${
                        errors.email ? "border-destructive" : "border-border/50"
                      } rounded-lg py-3 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setErrors({});
                        }}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      placeholder="••••••••"
                      className={`w-full bg-muted/30 border ${
                        errors.password ? "border-destructive" : "border-border/50"
                      } rounded-lg py-3 pl-12 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">{errors.password}</p>
                  )}
                  
                  {/* Password strength meter (signup only) */}
                  {!isLogin && <PasswordStrengthMeter password={password} />}
                </div>

                {/* Confirm Password (signup only) */}
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        }}
                        placeholder="••••••••"
                        className={`w-full bg-muted/30 border ${
                          errors.confirmPassword ? "border-destructive" : "border-border/50"
                        } rounded-lg py-3 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors`}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
                    )}
                  </motion.div>
                )}

              {/* Rate limit warning */}
              {isLogin && isLimited && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                >
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Too many failed attempts</p>
                    <p className="text-xs text-destructive/80">
                      Please wait {formatCooldown(cooldownSeconds)} before trying again
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Attempts warning */}
              {isLogin && !isLimited && attemptsRemaining < 3 && attemptsRemaining > 0 && (
                <p className="text-xs text-amber-500 text-center">
                  {attemptsRemaining} login {attemptsRemaining === 1 ? "attempt" : "attempts"} remaining
                </p>
              )}

              {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading || (isLogin && isLimited)}
                  className="w-full py-3 bg-primary text-primary-foreground font-medium text-sm tracking-widest uppercase rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </>
                  ) : isLimited && isLogin ? (
                    `Locked (${formatCooldown(cooldownSeconds)})`
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 text-muted-foreground tracking-widest">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 bg-muted/30 border border-border/50 text-foreground font-medium text-sm rounded-lg hover:bg-muted/50 hover:border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  Continue with Google
                </button>
              </form>

              {/* Toggle */}
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  {isLogin ? "Request Access" : "Sign In"}
                </button>
              </p>
            </>
          )}

          {/* Security note */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span>256-bit encryption • SOC 2 Compliant</span>
          </div>
        </motion.div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:block lg:w-1/2 xl:w-2/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <img
          src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1280&auto=format&fit=crop&q=75"
          srcSet="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=640&auto=format&fit=crop&q=75 640w, https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1024&auto=format&fit=crop&q=75 1024w, https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1536&auto=format&fit=crop&q=75 1536w"
          sizes="50vw"
          alt="Luxury"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-primary font-medium">
                By Invitation Only
              </span>
            </div>
            <h3 className="font-serif text-4xl text-foreground mb-4">
              The World's Most
              <br />
              <span className="text-primary italic">Exclusive</span> Service
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
              Access portfolio management, secure messaging, and document vaults
              designed for the world's most discerning clients.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
