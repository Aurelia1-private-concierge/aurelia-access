import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, ExternalLink, Settings, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SocialAccount, PLATFORM_INFO, SocialPlatform } from "@/hooks/useSocialAdvertising";

interface PlatformConnectorProps {
  accounts: SocialAccount[];
  onConnect?: (platform: SocialPlatform) => void;
  onDisconnect?: (accountId: string) => void;
  onRefresh?: () => void;
}

const PlatformConnector = forwardRef<HTMLDivElement, PlatformConnectorProps>(
  ({ accounts, onConnect, onDisconnect, onRefresh }, ref) => {
    const platforms = Object.entries(PLATFORM_INFO) as [SocialPlatform, typeof PLATFORM_INFO[SocialPlatform]][];

    const getAccountForPlatform = (platform: SocialPlatform) => {
      return accounts.find(a => a.platform === platform && a.is_active);
    };

    return (
      <Card ref={ref} className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-xl">Platform Connections</CardTitle>
              <CardDescription>
                Connect your social media accounts to enable automated posting
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platforms.map(([platform, info], index) => {
              const account = getAccountForPlatform(platform);
              const isConnected = !!account;

              return (
                <motion.div
                  key={platform}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isConnected 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-border/50 bg-card hover:border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{info.icon}</span>
                        <div>
                          <h3 className="font-medium text-foreground">{info.name}</h3>
                          <p className="text-xs text-muted-foreground">{info.audience}</p>
                        </div>
                      </div>
                      {isConnected ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>

                    {isConnected && account && (
                      <div className="mb-3 p-2 bg-background rounded-md">
                        <div className="flex items-center gap-2">
                          {account.avatar_url && (
                            <img 
                              src={account.avatar_url} 
                              alt="" 
                              className="h-6 w-6 rounded-full" 
                            />
                          )}
                          <span className="text-sm font-medium truncate">
                            {account.account_name}
                          </span>
                        </div>
                        {account.profile_url && (
                          <a
                            href={account.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            View Profile <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {isConnected ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => onDisconnect?.(account!.id)}
                          >
                            Disconnect
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                          onClick={() => onConnect?.(platform)}
                          style={{ 
                            backgroundColor: info.color,
                            borderColor: info.color,
                          }}
                        >
                          Connect {info.name}
                        </Button>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Max {info.maxLength} chars
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">🔐 API Credentials Required</h4>
            <p className="text-xs text-muted-foreground">
              To enable automated posting, configure your platform API credentials in the backend settings.
              Each platform requires OAuth tokens or API keys for secure access.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">TWITTER_CONSUMER_KEY</Badge>
              <Badge variant="outline" className="text-xs">LINKEDIN_CLIENT_ID</Badge>
              <Badge variant="outline" className="text-xs">META_APP_ID</Badge>
              <Badge variant="outline" className="text-xs">REDDIT_CLIENT_ID</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

PlatformConnector.displayName = "PlatformConnector";

export default PlatformConnector;
