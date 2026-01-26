import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloudOff, Cloud, RefreshCw, Trash2, Send } from "lucide-react";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { useMessageDrafts } from "@/hooks/useMessageDrafts";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface OfflineDashboardProps {
  onSync?: () => void;
}

export function OfflineDashboard({ onSync }: OfflineDashboardProps) {
  const { queue, isOnline, isSyncing, queueLength, syncQueue, clearQueue } = useOfflineQueue();
  const { drafts, clearAllDrafts, deleteDraft } = useMessageDrafts();

  const handleSync = async () => {
    await syncQueue();
    onSync?.();
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Cloud className="h-6 w-6 text-primary" />
          ) : (
            <CloudOff className="h-6 w-6 text-destructive animate-pulse" />
          )}
          <div>
            <h2 className="text-xl font-serif text-foreground">
              {isOnline ? "Connected" : "Offline Mode"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isOnline
                ? "All changes synced in real-time"
                : "Your work is being saved locally"}
            </p>
          </div>
        </div>
        {queueLength > 0 && (
          <Button
            onClick={handleSync}
            disabled={isSyncing || !isOnline}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            Sync Now ({queueLength})
          </Button>
        )}
      </div>

      {/* Pending Queue */}
      <Card className="bg-card/50 border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Pending Actions</CardTitle>
          {queueLength > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearQueue}
              className="text-destructive hover:text-destructive/80"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="popLayout">
            {queueLength === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground text-center py-4"
              >
                No pending actions
              </motion.p>
            ) : (
              <div className="space-y-2">
                {queue.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <Send className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium capitalize text-foreground">{item.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(item.timestamp, "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Retry {item.retries}/{item.maxRetries}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Message Drafts */}
      <Card className="bg-card/50 border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Message Drafts</CardTitle>
          {drafts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllDrafts}
              className="text-destructive hover:text-destructive/80"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="popLayout">
            {drafts.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground text-center py-4"
              >
                No saved drafts
              </motion.p>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <motion.div
                    key={draft.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {draft.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(draft.lastModified, "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-foreground truncate">
                        {draft.content.substring(0, 50)}
                        {draft.content.length > 50 ? "..." : ""}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDraft(draft.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

export default OfflineDashboard;
