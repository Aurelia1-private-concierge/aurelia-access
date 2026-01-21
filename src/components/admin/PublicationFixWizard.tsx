import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Shield,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Copy,
  Trash2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { usePublicationDiagnostics, DiagnosticCheck } from "@/hooks/usePublicationDiagnostics";
import { SITE_CONFIG } from "@/lib/site-config";

const STEPS = [
  { id: 'domain', title: 'Domain Configuration', icon: Globe },
  { id: 'ssl', title: 'SSL & Security', icon: Shield },
  { id: 'cdn', title: 'CDN & Caching', icon: RefreshCw },
  { id: 'seo', title: 'SEO Validation', icon: Search },
];

const StatusIcon = ({ status }: { status: DiagnosticCheck['status'] }) => {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'warn':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'fail':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'running':
      return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
    default:
      return <div className="h-5 w-5 rounded-full bg-muted" />;
  }
};

const StatusBadge = ({ status }: { status: DiagnosticCheck['status'] }) => {
  const variants: Record<string, string> = {
    pass: 'bg-green-500/10 text-green-500 border-green-500/20',
    warn: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    fail: 'bg-red-500/10 text-red-500 border-red-500/20',
    running: 'bg-primary/10 text-primary border-primary/20',
    pending: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <Badge variant="outline" className={variants[status] || variants.pending}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export const PublicationFixWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [customDomain, setCustomDomain] = useState(SITE_CONFIG.productionDomain.replace('https://', ''));
  const { isRunning, result, error, runDiagnostics, clearServiceWorkers, forceRefresh } = usePublicationDiagnostics();

  const handleRunDiagnostics = () => {
    runDiagnostics(customDomain);
  };

  const handleClearServiceWorkers = async () => {
    try {
      await clearServiceWorkers();
      toast.success('Service workers and caches cleared');
    } catch (err) {
      toast.error('Failed to clear service workers');
    }
  };

  const handleCopyDNS = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getChecksByCategory = (category: string): DiagnosticCheck[] => {
    if (!result) return [];
    return result.checks.filter(c => c.category === category);
  };

  const getCategoryStatus = (category: string): 'pass' | 'warn' | 'fail' | 'pending' => {
    const checks = getChecksByCategory(category);
    if (checks.length === 0) return 'pending';
    if (checks.some(c => c.status === 'fail')) return 'fail';
    if (checks.some(c => c.status === 'warn')) return 'warn';
    if (checks.every(c => c.status === 'pass')) return 'pass';
    return 'pending';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Domain Configuration
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Custom Domain</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="aurelia-privateconcierge.com"
                    className="flex-1"
                  />
                  <Button onClick={handleRunDiagnostics} disabled={isRunning}>
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Diagnose
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Card className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Required DNS Records</CardTitle>
                  <CardDescription>Add these records at your domain registrar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {SITE_CONFIG.requiredDNSRecords.map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">{record.type}</Badge>
                        <span className="font-mono text-sm">{record.name}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-mono text-sm text-primary">{record.value}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyDNS(`${record.type} ${record.name} ${record.value}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* DNS Check Results */}
            {result && (
              <div className="space-y-3">
                <h4 className="font-medium">DNS Check Results</h4>
                {getChecksByCategory('dns').map((check) => (
                  <div key={check.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <StatusIcon status={check.status} />
                      <div>
                        <p className="font-medium text-sm">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.message}</p>
                        {check.details && (
                          <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={check.status} />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
              <a
                href="https://dnschecker.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Check DNS propagation at dnschecker.org →
              </a>
            </div>
          </div>
        );

      case 1: // SSL & Security
        return (
          <div className="space-y-6">
            {result ? (
              <>
                <div className="space-y-3">
                  <h4 className="font-medium">SSL Certificate</h4>
                  {getChecksByCategory('ssl').map((check) => (
                    <div key={check.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <StatusIcon status={check.status} />
                        <div>
                          <p className="font-medium text-sm">{check.name}</p>
                          <p className="text-sm text-muted-foreground">{check.message}</p>
                        </div>
                      </div>
                      <StatusBadge status={check.status} />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Security Headers</h4>
                  {getChecksByCategory('security').map((check) => (
                    <div key={check.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <StatusIcon status={check.status} />
                        <div>
                          <p className="font-medium text-sm">{check.name}</p>
                          <p className="text-sm text-muted-foreground">{check.message}</p>
                          {check.details && (
                            <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={check.status} />
                    </div>
                  ))}
                </div>

                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Security headers are configured in <code className="bg-muted px-1 rounded">public/_headers</code>.
                      SSL certificates are automatically provisioned by Lovable when DNS is properly configured.
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Run diagnostics on Step 1 to see SSL & Security results
              </div>
            )}
          </div>
        );

      case 2: // CDN & Caching
        return (
          <div className="space-y-6">
            {result ? (
              <div className="space-y-3">
                <h4 className="font-medium">Cache & CDN Status</h4>
                {getChecksByCategory('cdn').map((check) => (
                  <div key={check.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <StatusIcon status={check.status} />
                      <div>
                        <p className="font-medium text-sm">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.message}</p>
                        {check.details && (
                          <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={check.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Run diagnostics on Step 1 to see CDN results
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Quick Fixes</h4>
              
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={handleClearServiceWorkers}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Service Workers & Caches
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={forceRefresh}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Force Hard Refresh
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open(`https://${customDomain}?nocache=${Date.now()}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open with Cache Bypass
                </Button>
              </div>

              <Card className="bg-amber-500/10 border-amber-500/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-amber-200">
                    <strong>Tip:</strong> Test in an incognito window to bypass local browser cache and service workers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3: // SEO Validation
        return (
          <div className="space-y-6">
            {result ? (
              <div className="space-y-3">
                <h4 className="font-medium">SEO Check Results</h4>
                {getChecksByCategory('seo').map((check) => (
                  <div key={check.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <StatusIcon status={check.status} />
                      <div>
                        <p className="font-medium text-sm">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.message}</p>
                        {check.details && (
                          <p className="text-xs text-muted-foreground mt-1 break-all">{check.details}</p>
                        )}
                        {check.fix && (
                          <p className="text-xs text-primary mt-1">Fix: {check.fix}</p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={check.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Run diagnostics on Step 1 to see SEO results
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">External SEO Tools</h4>
              
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open(`https://search.google.com/search-console`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Search Console
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open(`https://pagespeed.web.dev/analysis?url=https://${customDomain}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  PageSpeed Insights
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open(`https://cards-dev.twitter.com/validator`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Twitter Card Validator
                </Button>

                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => window.open(`https://developers.facebook.com/tools/debug/?q=https://${customDomain}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Facebook Sharing Debugger
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl text-foreground">Publication Fix Wizard</h2>
        <p className="text-muted-foreground">Diagnose and fix domain, SSL, and publication issues</p>
      </div>

      {/* Overall Status */}
      {result && (
        <Card className={`${
          result.overallStatus === 'healthy' ? 'bg-green-500/10 border-green-500/20' :
          result.overallStatus === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
          result.overallStatus === 'critical' ? 'bg-red-500/10 border-red-500/20' :
          'bg-muted/50'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {result.overallStatus === 'healthy' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                {result.overallStatus === 'warning' && <AlertTriangle className="h-6 w-6 text-yellow-500" />}
                {result.overallStatus === 'critical' && <XCircle className="h-6 w-6 text-red-500" />}
                <div>
                  <p className="font-medium">
                    {result.overallStatus === 'healthy' ? 'All Systems Healthy' :
                     result.overallStatus === 'warning' ? 'Some Issues Detected' :
                     result.overallStatus === 'critical' ? 'Critical Issues Found' :
                     'Unknown Status'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.checks.filter(c => c.status === 'pass').length} passed,{' '}
                    {result.checks.filter(c => c.status === 'warn').length} warnings,{' '}
                    {result.checks.filter(c => c.status === 'fail').length} failures
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleRunDiagnostics} disabled={isRunning}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                Re-run
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="pt-4">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(idx)}
            className={`flex-1 flex flex-col items-center p-4 rounded-lg transition-colors ${
              currentStep === idx
                ? 'bg-primary/10 border border-primary/30'
                : 'hover:bg-muted/50'
            }`}
          >
            <div className={`p-2 rounded-full mb-2 ${
              currentStep === idx ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              <step.icon className="h-5 w-5" />
            </div>
            <span className={`text-sm font-medium ${
              currentStep === idx ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {step.title}
            </span>
            {result && (
              <div className="mt-1">
                <StatusBadge status={getCategoryStatus(step.id === 'ssl' ? 'ssl' : step.id)} />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const StepIcon = STEPS[currentStep].icon;
              return <StepIcon className="h-5 w-5 text-primary" />;
            })()}
            {STEPS[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(prev => prev + 1)}
          disabled={currentStep === STEPS.length - 1}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Recommendations */}
      {result && result.recommendations.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicationFixWizard;
