import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageSquare, Lightbulb, History, BarChart3 } from 'lucide-react';
import { AISpecialistsPanel } from './AISpecialistsPanel';
import { AIDatabaseChat } from './AIDatabaseChat';
import { AIInsightsPanel } from './AIInsightsPanel';
import { AIQueryHistory } from './AIQueryHistory';
import { useAIDatabaseManager } from '@/hooks/useAIDatabaseManager';
import { Badge } from '@/components/ui/badge';

export function AIDatabaseManagementPanel() {
  const { getAnalytics, fetchSpecialists } = useAIDatabaseManager();
  const [analytics, setAnalytics] = useState({
    totalQueries: 0,
    activeSpecialists: 0,
    unreadInsights: 0,
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      const data = await getAnalytics();
      setAnalytics(data);
    };
    loadAnalytics();
    fetchSpecialists();
  }, [getAnalytics, fetchSpecialists]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Database Management</h1>
        <p className="text-muted-foreground">
          Manage AI specialists, query your database with natural language, and view AI-generated insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.activeSpecialists}</p>
              <p className="text-sm text-muted-foreground">Active Specialists</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.totalQueries}</p>
              <p className="text-sm text-muted-foreground">Total Queries</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Lightbulb className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.unreadInsights}</p>
              <p className="text-sm text-muted-foreground">Unread Insights</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="specialists" className="gap-2">
            <Bot className="h-4 w-4" />
            Specialists
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
            {analytics.unreadInsights > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1 text-xs">
                {analytics.unreadInsights}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <AIDatabaseChat />
        </TabsContent>

        <TabsContent value="specialists">
          <AISpecialistsPanel />
        </TabsContent>

        <TabsContent value="insights">
          <AIInsightsPanel />
        </TabsContent>

        <TabsContent value="history">
          <AIQueryHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
