import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Eye, 
  MousePointer, 
  Clock, 
  ArrowDown,
  Users,
  TrendingUp,
  MapPin,
  Globe,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface PageStats {
  page_path: string;
  views: number;
  clicks: number;
  avg_time: number;
  avg_scroll: number;
}

interface HeatmapData {
  element_id: string;
  element_class: string;
  click_count: number;
}

interface SessionData {
  session_id: string;
  pages_visited: number;
  total_events: number;
  session_start: string;
  referrer: string;
}

const BehaviorAnalytics = () => {
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionData[]>([]);
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState("/");

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch page view stats
      const { data: events } = await supabase
        .from("user_behavior_events")
        .select("*")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false });

      if (events) {
        // Process page stats
        const pageMap = new Map<string, { views: number; clicks: number; times: number[]; scrolls: number[] }>();
        
        events.forEach(event => {
          const path = event.page_path;
          if (!pageMap.has(path)) {
            pageMap.set(path, { views: 0, clicks: 0, times: [], scrolls: [] });
          }
          const stats = pageMap.get(path)!;
          
          if (event.event_type === "page_view") stats.views++;
          if (event.event_type === "click") stats.clicks++;
          if (event.time_on_page) stats.times.push(event.time_on_page);
          if (event.scroll_depth) stats.scrolls.push(event.scroll_depth);
        });

        const processed: PageStats[] = Array.from(pageMap.entries()).map(([path, data]) => ({
          page_path: path,
          views: data.views,
          clicks: data.clicks,
          avg_time: data.times.length > 0 
            ? Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length) 
            : 0,
          avg_scroll: data.scrolls.length > 0 
            ? Math.round(data.scrolls.reduce((a, b) => a + b, 0) / data.scrolls.length) 
            : 0,
        })).sort((a, b) => b.views - a.views);

        setPageStats(processed);

        // Get heatmap data for selected page
        const clickEvents = events.filter(
          e => e.event_type === "click" && e.page_path === selectedPage && e.element_id
        );
        
        const elementMap = new Map<string, { class: string; count: number }>();
        clickEvents.forEach(e => {
          const id = e.element_id!;
          if (!elementMap.has(id)) {
            elementMap.set(id, { class: e.element_class || "", count: 0 });
          }
          elementMap.get(id)!.count++;
        });

        const heatmap: HeatmapData[] = Array.from(elementMap.entries())
          .map(([id, data]) => ({
            element_id: id,
            element_class: data.class,
            click_count: data.count,
          }))
          .sort((a, b) => b.click_count - a.click_count)
          .slice(0, 20);

        setHeatmapData(heatmap);

        // Get unique sessions
        const sessionMap = new Map<string, SessionData>();
        events.forEach(e => {
          if (!sessionMap.has(e.session_id)) {
            sessionMap.set(e.session_id, {
              session_id: e.session_id,
              pages_visited: 0,
              total_events: 0,
              session_start: e.created_at,
              referrer: e.referrer || "Direct",
            });
          }
          const session = sessionMap.get(e.session_id)!;
          session.total_events++;
          if (e.event_type === "page_view") session.pages_visited++;
        });

        setRecentSessions(
          Array.from(sessionMap.values())
            .sort((a, b) => new Date(b.session_start).getTime() - new Date(a.session_start).getTime())
            .slice(0, 20)
        );

        // Calculate live visitors (sessions in last 5 minutes)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const liveSessions = new Set(
          events
            .filter(e => new Date(e.created_at).getTime() > fiveMinutesAgo)
            .map(e => e.session_id)
        );
        setLiveVisitors(liveSessions.size);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("behavior_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_behavior_events" },
        () => {
          // Refresh on new events
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPage]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const totalViews = pageStats.reduce((sum, p) => sum + p.views, 0);
  const totalClicks = pageStats.reduce((sum, p) => sum + p.clicks, 0);
  const avgScrollDepth = pageStats.length > 0
    ? Math.round(pageStats.reduce((sum, p) => sum + p.avg_scroll, 0) / pageStats.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Live Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { 
            label: "Live Visitors", 
            value: liveVisitors, 
            icon: Users, 
            color: "text-green-500",
            live: true 
          },
          { 
            label: "Total Page Views (7d)", 
            value: totalViews, 
            icon: Eye, 
            color: "text-blue-500" 
          },
          { 
            label: "Total Clicks (7d)", 
            value: totalClicks, 
            icon: MousePointer, 
            color: "text-primary" 
          },
          { 
            label: "Avg Scroll Depth", 
            value: `${avgScrollDepth}%`, 
            icon: ArrowDown, 
            color: "text-purple-500" 
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={stat.live ? "border-green-500/50" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  {stat.live && (
                    <span className="flex items-center gap-1 text-xs text-green-500">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pages">Page Analytics</TabsTrigger>
          <TabsTrigger value="heatmap">Click Heatmap</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Page Performance (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pageStats.slice(0, 10).map((page, index) => (
                  <motion.div
                    key={page.page_path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedPage(page.page_path)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{page.page_path}</p>
                        <p className="text-sm text-muted-foreground">
                          {page.views} views • {page.clicks} clicks
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(page.avg_time)}
                        </p>
                        <p className="text-muted-foreground">Avg time</p>
                      </div>
                      <div className="text-right">
                        <p className="flex items-center gap-1">
                          <ArrowDown className="w-3 h-3" />
                          {page.avg_scroll}%
                        </p>
                        <p className="text-muted-foreground">Scroll depth</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="w-5 h-5 text-primary" />
                Click Heatmap: {selectedPage}
              </CardTitle>
              <CardDescription>
                Most clicked elements on this page
              </CardDescription>
            </CardHeader>
            <CardContent>
              {heatmapData.length > 0 ? (
                <div className="space-y-3">
                  {heatmapData.map((item, index) => (
                    <div
                      key={item.element_id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded flex items-center justify-center font-bold text-white"
                          style={{
                            backgroundColor: `hsl(${Math.max(0, 60 - index * 10)}, 80%, 50%)`,
                          }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium font-mono text-sm">
                            #{item.element_id}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {item.element_class || "No class"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress 
                          value={(item.click_count / heatmapData[0].click_count) * 100} 
                          className="w-24"
                        />
                        <Badge variant="secondary">
                          {item.click_count} clicks
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No click data for this page yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.map((session, index) => (
                  <motion.div
                    key={session.session_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Session {session.session_id.substring(0, 8)}...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.session_start), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">
                        {session.pages_visited} pages
                      </Badge>
                      <Badge variant="secondary">
                        {session.total_events} events
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">
                          {session.referrer.replace(/https?:\/\//, "").split("/")[0]}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BehaviorAnalytics;
