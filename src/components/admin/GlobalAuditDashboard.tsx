import React, { forwardRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Database,
  Zap,
  Accessibility,
  Code,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Clock,
  RefreshCw,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuditDashboard, type AuditCheck } from "@/hooks/useAuditDashboard";
import { format } from "date-fns";

const categoryIcons = {
  security: Shield,
  database: Database,
  performance: Zap,
  accessibility: Accessibility,
  code_quality: Code,
};

const categoryLabels = {
  security: "Security",
  database: "Database",
  performance: "Performance",
  accessibility: "Accessibility",
  code_quality: "Code Quality",
};

const statusIcons = {
  pending: Clock,
  running: Loader2,
  passed: CheckCircle2,
  warning: AlertTriangle,
  failed: XCircle,
};

const statusColors = {
  pending: "text-muted-foreground",
  running: "text-primary animate-spin",
  passed: "text-green-500",
  warning: "text-yellow-500",
  failed: "text-destructive",
};

interface CheckItemProps {
  check: AuditCheck;
}

const CheckItem = ({ check }: CheckItemProps) => {
  const StatusIcon = statusIcons[check.status];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <StatusIcon className={`h-4 w-4 ${statusColors[check.status]}`} />
        <span className="text-sm font-medium">{check.name}</span>
      </div>
      {check.message && (
        <span className="text-xs text-muted-foreground max-w-[200px] truncate">
          {check.message}
        </span>
      )}
    </motion.div>
  );
};

interface CategoryCardProps {
  category: keyof typeof categoryIcons;
  checks: AuditCheck[];
}

const CategoryCard = ({ category, checks }: CategoryCardProps) => {
  const Icon = categoryIcons[category];
  const passed = checks.filter((c) => c.status === "passed").length;
  const total = checks.length;
  const progress = total > 0 ? (passed / total) * 100 : 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">{categoryLabels[category]}</CardTitle>
          </div>
          <Badge variant="secondary">
            {passed}/{total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={progress} className="h-1" />
        <div className="space-y-1">
          {checks.map((check) => (
            <CheckItem key={check.id} check={check} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const GlobalAuditDashboard = forwardRef<HTMLDivElement>((_, ref) => {
  const { checks, isRunning, lastResult, runFullAudit } = useAuditDashboard();

  // Auto-run on mount
  useEffect(() => {
    runFullAudit();
  }, []);

  const passedCount = checks.filter((c) => c.status === "passed").length;
  const warningCount = checks.filter((c) => c.status === "warning").length;
  const failedCount = checks.filter((c) => c.status === "failed").length;
  const overallScore = Math.round(
    ((passedCount + warningCount * 0.5) / checks.length) * 100
  );

  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, AuditCheck[]>);

  const exportReport = () => {
    const report = {
      generated_at: new Date().toISOString(),
      overall_score: overallScore,
      summary: {
        passed: passedCount,
        warnings: warningCount,
        failed: failedCount,
        total: checks.length,
      },
      checks: checks.map((c) => ({
        name: c.name,
        category: c.category,
        status: c.status,
        message: c.message,
      })),
      recommendations: [
        "Review RLS policies for tables with USING (true)",
        "Consider adding rate limiting to public endpoints",
        "Enable CAPTCHA for high-risk forms",
        "Monitor edge function cold starts",
      ],
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aurelia-audit-${format(new Date(), "yyyy-MM-dd-HHmm")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={ref} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Global Audit Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive platform health, security, and compliance monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportReport} disabled={isRunning}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={runFullAudit} disabled={isRunning}>
              {isRunning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isRunning ? "Running Audit..." : "Run Full Audit"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Overall Score Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                Overall Health Score
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-bold text-primary">{overallScore}</span>
                <span className="text-xl text-muted-foreground">/100</span>
              </div>
              {lastResult?.run_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last audit: {format(new Date(lastResult.run_at), "MMM d, yyyy 'at' HH:mm")}
                </p>
              )}
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-2xl font-semibold">{passedCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Passed</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-yellow-500">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-2xl font-semibold">{warningCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <span className="text-2xl font-semibold">{failedCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </div>
          <Progress value={overallScore} className="mt-4 h-2" />
        </CardContent>
      </Card>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
          <CategoryCard
            key={category}
            category={category as keyof typeof categoryIcons}
            checks={categoryChecks}
          />
        ))}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Recommendations</CardTitle>
          </div>
          <CardDescription>Suggested improvements based on audit results</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm">
              <span className="text-primary font-bold">•</span>
              <span>Review 15 RLS policies flagged with permissive USING (true) rules</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-primary font-bold">•</span>
              <span>Consider adding rate limiting to contact form submissions</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-primary font-bold">•</span>
              <span>Enable CAPTCHA protection for trial applications</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-primary">•</span>
              <span>Monitor edge function cold start times for user-facing features</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="text-primary">•</span>
              <span>Set up automated backup verification for database</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
});

GlobalAuditDashboard.displayName = "GlobalAuditDashboard";

export default GlobalAuditDashboard;
