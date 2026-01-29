import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, AlertTriangle, Info, CheckCircle2, 
  Eye, EyeOff, Check, X, Filter, Bell, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAIDatabaseManager, AIInsight } from '@/hooks/useAIDatabaseManager';
import { formatDistanceToNow } from 'date-fns';

const SEVERITY_CONFIG = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  critical: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

const CATEGORY_LABELS: Record<string, string> = {
  members: 'Members',
  requests: 'Requests',
  partners: 'Partners',
  revenue: 'Revenue',
};

export function AIInsightsPanel() {
  const { insights, fetchInsights, markInsightRead, takeInsightAction, isLoading } = useAIDatabaseManager();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [actionDialog, setActionDialog] = useState<AIInsight | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    fetchInsights(categoryFilter === 'all' ? undefined : categoryFilter);
  }, [categoryFilter, fetchInsights]);

  const filteredInsights = insights.filter(i => {
    if (showUnreadOnly && i.is_read) return false;
    return true;
  });

  const handleMarkRead = async (insight: AIInsight) => {
    await markInsightRead(insight.id);
  };

  const handleTakeAction = async () => {
    if (!actionDialog) return;
    await takeInsightAction(actionDialog.id, actionNotes);
    setActionDialog(null);
    setActionNotes('');
  };

  const unreadCount = insights.filter(i => !i.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">AI Insights</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showUnreadOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            <Bell className="h-4 w-4 mr-1" />
            Unread Only
          </Button>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredInsights.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Insights Available</h3>
            <p className="text-muted-foreground text-center">
              AI-generated insights will appear here as patterns are detected
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map((insight, index) => {
            const severity = SEVERITY_CONFIG[insight.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
            const SeverityIcon = severity.icon;
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`relative overflow-hidden ${!insight.is_read ? 'border-primary/50' : ''}`}>
                  {!insight.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${severity.bg}`}>
                        <SeverityIcon className={`h-5 w-5 ${severity.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{insight.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {CATEGORY_LABELS[insight.category] || insight.category}
                              </Badge>
                              <Badge 
                                variant={insight.insight_type === 'trend' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {insight.insight_type}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">{insight.description}</p>
                          </div>
                          
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        {insight.action_taken && (
                          <div className="mt-3 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="font-medium">Action taken</span>
                            </div>
                            {insight.action_notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {insight.action_notes}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          {!insight.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkRead(insight)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          
                          {insight.is_actionable && !insight.action_taken && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setActionDialog(insight);
                                setActionNotes('');
                              }}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Action Taken</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {actionDialog && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium">{actionDialog.title}</p>
                <p className="text-sm text-muted-foreground">{actionDialog.description}</p>
              </div>
            )}
            
            <Textarea
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Describe the action you took..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleTakeAction}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
