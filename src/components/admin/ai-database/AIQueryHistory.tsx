import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Clock, Zap, CheckCircle2, XCircle, 
  TrendingUp, BarChart3, Database, Bot
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIDatabaseManager } from '@/hooks/useAIDatabaseManager';
import { formatDistanceToNow } from 'date-fns';

export function AIQueryHistory() {
  const { queryLogs, fetchQueryLogs, specialists } = useAIDatabaseManager();

  useEffect(() => {
    fetchQueryLogs(100);
  }, [fetchQueryLogs]);

  const getSpecialistName = (id: string | null) => {
    if (!id) return 'Auto';
    const specialist = specialists.find(s => s.id === id);
    return specialist?.name || 'Unknown';
  };

  const successCount = queryLogs.filter(l => l.status === 'completed').length;
  const failedCount = queryLogs.filter(l => l.status === 'failed').length;
  const avgResponseTime = queryLogs.length > 0
    ? queryLogs.reduce((acc, l) => acc + (l.response_time_ms || 0), 0) / queryLogs.length
    : 0;
  const totalTokens = queryLogs.reduce((acc, l) => acc + (l.tokens_used || 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Query History & Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{queryLogs.length}</p>
                <p className="text-sm text-muted-foreground">Total Queries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {queryLogs.length > 0 ? ((successCount / queryLogs.length) * 100).toFixed(0) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(avgResponseTime / 1000).toFixed(1)}s</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Zap className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Queries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {queryLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No queries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queryLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={
                            log.status === 'completed' ? 'default' :
                            log.status === 'failed' ? 'destructive' : 'secondary'
                          }>
                            {log.status}
                          </Badge>
                          <Badge variant="outline">{log.query_type}</Badge>
                          {log.specialist_id && (
                            <Badge variant="secondary" className="gap-1">
                              <Bot className="h-3 w-3" />
                              {getSpecialistName(log.specialist_id)}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="font-medium line-clamp-1">{log.query_text}</p>
                        
                        {log.response_text && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {log.response_text}
                          </p>
                        )}
                        
                        {log.error_message && (
                          <p className="text-sm text-destructive mt-1">
                            {log.error_message}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right text-sm text-muted-foreground shrink-0">
                        <p>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</p>
                        {log.response_time_ms && (
                          <p className="text-xs">{(log.response_time_ms / 1000).toFixed(1)}s</p>
                        )}
                        {log.tokens_used && (
                          <p className="text-xs">{log.tokens_used} tokens</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
