import React, { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Settings, ExternalLink, Key, RefreshCw, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { SocialPlatform, PLATFORM_INFO } from "@/hooks/useSocialAdvertising";

interface CredentialStatus {
  platform: SocialPlatform;
  isConfigured: boolean;
  lastChecked: string;
  requiredKeys: string[];
}

interface PlatformCredentialStatusProps {
  onConfigureClick?: () => void;
}

const PLATFORM_CREDENTIALS: Record<SocialPlatform, string[]> = {
  twitter: ["TWITTER_CONSUMER_KEY", "TWITTER_CONSUMER_SECRET", "TWITTER_ACCESS_TOKEN", "TWITTER_ACCESS_TOKEN_SECRET"],
  linkedin: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET", "LINKEDIN_ACCESS_TOKEN"],
  instagram: ["META_APP_ID", "META_APP_SECRET", "INSTAGRAM_ACCESS_TOKEN"],
  facebook: ["META_APP_ID", "META_APP_SECRET", "FACEBOOK_PAGE_ACCESS_TOKEN"],
  reddit: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_REFRESH_TOKEN"],
  threads: ["THREADS_APP_ID", "THREADS_APP_SECRET", "THREADS_ACCESS_TOKEN"],
};

const PlatformCredentialStatus = forwardRef<HTMLDivElement, PlatformCredentialStatusProps>(
  ({ onConfigureClick }, ref) => {
    const [credentials, setCredentials] = useState<CredentialStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const checkCredentials = async () => {
      setLoading(true);
      try {
        // Call edge function to check which credentials are configured
        const { data, error } = await supabase.functions.invoke("check-social-credentials", {
          body: {},
        });

        if (error) {
          console.error("Error checking credentials:", error);
          // Return default unconfigured status
          const defaultStatus: CredentialStatus[] = Object.entries(PLATFORM_CREDENTIALS).map(
            ([platform, keys]) => ({
              platform: platform as SocialPlatform,
              isConfigured: false,
              lastChecked: new Date().toISOString(),
              requiredKeys: keys,
            })
          );
          setCredentials(defaultStatus);
        } else {
          setCredentials(data?.platforms || []);
        }
      } catch (err) {
        console.error("Credential check failed:", err);
        // Fallback to showing all as unconfigured
        const fallbackStatus: CredentialStatus[] = Object.entries(PLATFORM_CREDENTIALS).map(
          ([platform, keys]) => ({
            platform: platform as SocialPlatform,
            isConfigured: false,
            lastChecked: new Date().toISOString(),
            requiredKeys: keys,
          })
        );
        setCredentials(fallbackStatus);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      checkCredentials();
    }, []);

    const configuredCount = credentials.filter((c) => c.isConfigured).length;
    const totalPlatforms = credentials.length || Object.keys(PLATFORM_CREDENTIALS).length;

    return (
      <Card ref={ref} className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                API Credential Status
              </CardTitle>
              <CardDescription>
                {configuredCount}/{totalPlatforms} platforms configured for automated posting
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={checkCredentials} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Check Status
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Alert */}
          {configuredCount === 0 && !loading && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Platforms Configured</AlertTitle>
              <AlertDescription>
                Social publishing requires API credentials for each platform. Please configure at least one platform to enable automated posting.
              </AlertDescription>
            </Alert>
          )}

          {configuredCount > 0 && configuredCount < totalPlatforms && !loading && (
            <Alert className="border-primary/50 bg-primary/5">
              <Info className="h-4 w-4" />
              <AlertTitle>Partial Configuration</AlertTitle>
              <AlertDescription>
                {configuredCount} platform(s) ready. Configure remaining platforms to expand your reach.
              </AlertDescription>
            </Alert>
          )}

          {configuredCount === totalPlatforms && !loading && (
            <Alert className="border-green-500/50 bg-green-500/5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">All Platforms Configured</AlertTitle>
              <AlertDescription>
                Your social advertising suite is fully operational across all platforms.
              </AlertDescription>
            </Alert>
          )}

          {/* Platform Status Grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(credentials.length > 0 ? credentials : Object.entries(PLATFORM_CREDENTIALS).map(([platform, keys]) => ({
              platform: platform as SocialPlatform,
              isConfigured: false,
              lastChecked: "",
              requiredKeys: keys,
            }))).map((cred, index) => {
              const info = PLATFORM_INFO[cred.platform];
              return (
                <motion.div
                  key={cred.platform}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border ${
                    cred.isConfigured
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-border/50 bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{info.icon}</span>
                      <span className="font-medium text-sm">{info.name}</span>
                    </div>
                    {cred.isConfigured ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        Not Configured
                      </Badge>
                    )}
                  </div>
                  {!cred.isConfigured && (
                    <div className="text-xs text-muted-foreground">
                      Requires: {cred.requiredKeys.slice(0, 2).join(", ")}
                      {cred.requiredKeys.length > 2 && ` +${cred.requiredKeys.length - 2} more`}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Setup Instructions */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Setup Instructions
                </span>
                <span className="text-xs text-muted-foreground">
                  {isExpanded ? "Hide" : "Show"}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    🐦 X (Twitter) Setup
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Go to <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Twitter Developer Portal</a></li>
                    <li>Create an app with OAuth 1.0a User Context</li>
                    <li>Copy Consumer Key, Consumer Secret, Access Token, Access Token Secret</li>
                    <li>Add secrets via Lovable Cloud dashboard</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    💼 LinkedIn Setup
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Go to <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn Developer Portal</a></li>
                    <li>Create an app with "Share on LinkedIn" permissions</li>
                    <li>Generate OAuth 2.0 credentials</li>
                    <li>Add LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_ACCESS_TOKEN</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    📸 Meta (Instagram/Facebook) Setup
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meta for Developers</a></li>
                    <li>Create a business app with Instagram and Pages permissions</li>
                    <li>Complete business verification</li>
                    <li>Generate long-lived access tokens</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    🔴 Reddit Setup
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Go to <a href="https://www.reddit.com/prefs/apps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Reddit App Preferences</a></li>
                    <li>Create a "script" type application</li>
                    <li>Copy client ID and secret</li>
                    <li>Generate refresh token via OAuth flow</li>
                  </ol>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <a href="https://docs.lovable.dev/features/cloud" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Backend Secrets Guide
                  </a>
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    );
  }
);

PlatformCredentialStatus.displayName = "PlatformCredentialStatus";

export default PlatformCredentialStatus;
