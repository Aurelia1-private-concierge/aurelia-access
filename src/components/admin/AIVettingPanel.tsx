import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, 
  Globe, Mail, Building2, Loader2, Sparkles,
  TrendingUp, TrendingDown, Minus, Brain,
  Lock, Unlock, AlertCircle, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { VettingResult } from "@/hooks/useAIVetting";

interface AIVettingPanelProps {
  isVetting: boolean;
  result: VettingResult | null;
  onRunVetting: () => void;
  onApplyRecommendation: (items: Record<string, boolean>) => void;
}

const riskLevelConfig = {
  low: { color: "text-success", bg: "bg-success/10", border: "border-success/30", icon: CheckCircle },
  medium: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", icon: AlertCircle },
  high: { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: AlertTriangle },
  critical: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: XCircle },
};

const recommendationConfig = {
  approve: { 
    color: "text-success", 
    bg: "bg-success/10", 
    label: "Recommend Approve",
    icon: CheckCircle 
  },
  manual_review: { 
    color: "text-warning", 
    bg: "bg-warning/10", 
    label: "Manual Review",
    icon: AlertCircle 
  },
  reject: { 
    color: "text-destructive", 
    bg: "bg-destructive/10", 
    label: "Recommend Reject",
    icon: XCircle 
  },
};

export default function AIVettingPanel({ 
  isVetting, 
  result, 
  onRunVetting,
  onApplyRecommendation 
}: AIVettingPanelProps) {
  if (!result && !isVetting) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-dashed border-primary/30 rounded-xl p-6 text-center bg-primary/5"
      >
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <h4 className="text-lg font-medium text-foreground mb-2">AI-Powered Vetting</h4>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          Run automated verification checks including website analysis, fraud detection, and business legitimacy assessment.
        </p>
        <Button onClick={onRunVetting} className="gap-2">
          <Sparkles className="w-4 h-4" />
          Run AI Vetting
        </Button>
      </motion.div>
    );
  }

  if (isVetting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-primary/30 rounded-xl p-6 bg-primary/5"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-primary/20 animate-ping" />
          </div>
          <div>
            <h4 className="text-lg font-medium text-foreground">AI Vetting in Progress</h4>
            <p className="text-sm text-muted-foreground">
              Analyzing website, verifying business, detecting fraud patterns...
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {["Checking website accessibility", "Analyzing business legitimacy", "Running fraud detection", "Generating recommendation"].map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.3 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              {step}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (!result) return null;

  const riskConfig = riskLevelConfig[result.risk_level];
  const recConfig = recommendationConfig[result.ai_recommendation];
  const RiskIcon = riskConfig.icon;
  const RecIcon = recConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Score Overview */}
      <div className={cn("rounded-xl p-4 border", riskConfig.bg, riskConfig.border)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", riskConfig.bg)}>
              <RiskIcon className={cn("w-5 h-5", riskConfig.color)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">{result.overall_score}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <p className={cn("text-sm font-medium capitalize", riskConfig.color)}>
                {result.risk_level} Risk
              </p>
            </div>
          </div>
          <Badge variant="outline" className={cn("gap-1", recConfig.bg, recConfig.color)}>
            <RecIcon className="w-3 h-3" />
            {recConfig.label}
          </Badge>
        </div>
        <Progress value={result.overall_score} className="h-2" />
        <p className="text-sm text-muted-foreground mt-3 italic">
          "{result.recommendation_reason}"
        </p>
      </div>

      {/* Verification Checks Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Website */}
        <div className="bg-card border border-border/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Website</span>
          </div>
          {result.verification_checks.website_analysis ? (
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Accessible</span>
                {result.verification_checks.website_analysis.is_accessible ? (
                  <CheckCircle className="w-3 h-3 text-success" />
                ) : (
                  <XCircle className="w-3 h-3 text-destructive" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">SSL/HTTPS</span>
                {result.verification_checks.website_analysis.has_ssl ? (
                  <Lock className="w-3 h-3 text-success" />
                ) : (
                  <Unlock className="w-3 h-3 text-warning" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Professional</span>
                <span className="text-foreground">{result.verification_checks.website_analysis.professional_score}%</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No website provided</p>
          )}
        </div>

        {/* Fraud Detection */}
        <div className="bg-card border border-border/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Fraud Check</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email Valid</span>
              {result.verification_checks.fraud_detection.email_domain_match ? (
                <CheckCircle className="w-3 h-3 text-success" />
              ) : (
                <Minus className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Disposable</span>
              {result.verification_checks.fraud_detection.disposable_email ? (
                <XCircle className="w-3 h-3 text-destructive" />
              ) : (
                <CheckCircle className="w-3 h-3 text-success" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Duplicate</span>
              {result.verification_checks.fraud_detection.duplicate_application ? (
                <AlertTriangle className="w-3 h-3 text-warning" />
              ) : (
                <CheckCircle className="w-3 h-3 text-success" />
              )}
            </div>
          </div>
        </div>

        {/* Category Fit */}
        <div className="bg-card border border-border/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Category Fit</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Match</span>
              <span className="text-foreground">{result.verification_checks.category_fit.primary_category_match}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Alignment</span>
              <span className="text-foreground">{result.verification_checks.category_fit.service_alignment}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Experience</span>
              <span className="text-foreground">{result.verification_checks.category_fit.experience_credibility}%</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card border border-border/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Contact</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email Valid</span>
              {result.verification_checks.contact_verification.email_format_valid ? (
                <CheckCircle className="w-3 h-3 text-success" />
              ) : (
                <XCircle className="w-3 h-3 text-destructive" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Professional</span>
              {result.verification_checks.contact_verification.professional_email ? (
                <CheckCircle className="w-3 h-3 text-success" />
              ) : (
                <Minus className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      <AnimatePresence>
        {result.risk_indicators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Risk Indicators
            </h5>
            <div className="space-y-1">
              {result.risk_indicators.map((indicator, i) => {
                const IconType = indicator.type === 'critical' ? XCircle 
                  : indicator.type === 'warning' ? AlertTriangle 
                  : Info;
                const colorClass = indicator.type === 'critical' ? 'text-destructive' 
                  : indicator.type === 'warning' ? 'text-warning' 
                  : 'text-blue-500';
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 text-sm p-2 rounded-lg bg-secondary/30"
                  >
                    <IconType className={cn("w-4 h-4 shrink-0", colorClass)} />
                    <span className="text-muted-foreground flex-1">{indicator.description}</span>
                    <span className={cn(
                      "text-xs font-mono",
                      indicator.score_impact > 0 ? "text-success" : "text-destructive"
                    )}>
                      {indicator.score_impact > 0 ? '+' : ''}{indicator.score_impact}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRunVetting}
          className="flex-1"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Re-run Vetting
        </Button>
        <Button
          size="sm"
          onClick={() => onApplyRecommendation(result.auto_vetting_items)}
          className="flex-1"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Apply to Checklist
        </Button>
      </div>
    </motion.div>
  );
}
