/**
 * Real-time online users counter for admin dashboard
 */

import React from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface OnlineUsersIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

const OnlineUsersIndicator = React.forwardRef<HTMLDivElement, OnlineUsersIndicatorProps>(
  ({ className, showDetails = true }, ref) => {
    const { onlineCount, onlineUsers, isConnected } = useOnlinePresence({
      channelName: 'admin-presence',
    });

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              ref={ref}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full',
                'bg-card border border-border/50',
                'transition-all duration-300',
                isConnected ? 'opacity-100' : 'opacity-60',
                className
              )}
            >
            <div className="relative">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-primary" />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              )}
              {isConnected && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                  {onlineCount}
                </span>
                {showDetails && (
                  <span className="text-xs text-muted-foreground">online</span>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {isConnected ? (
              <div className="space-y-2">
                <p className="font-medium text-sm">
                  {onlineCount} {onlineCount === 1 ? 'user' : 'users'} online
                </p>
                {onlineUsers.length > 0 && (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {onlineUsers.slice(0, 5).map((user, index) => (
                      <div key={user.user_id + index} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{user.display_name || 'Anonymous'}</span>
                        {user.page && (
                          <span className="text-muted-foreground/70">
                            • {user.page}
                          </span>
                        )}
                      </div>
                    ))}
                    {onlineUsers.length > 5 && (
                      <p className="text-muted-foreground/70">
                        +{onlineUsers.length - 5} more
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Connecting to presence...
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

OnlineUsersIndicator.displayName = 'OnlineUsersIndicator';

export default OnlineUsersIndicator;
