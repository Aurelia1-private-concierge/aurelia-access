import React, { useEffect, useState, useCallback } from "react";
import { Users, Activity, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const VisitorCountPanel: React.FC = () => {
  const [today, setToday] = useState<number>(0);
  const [realtime, setRealtime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const fetchCounts = useCallback(async () => {
    try {
      const [todayRes, realtimeRes] = await Promise.all([
        fetch(`${supabaseUrl}/functions/v1/visitor-tracking?action=count&type=today`, {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${supabaseUrl}/functions/v1/visitor-tracking?action=count&type=realtime`, {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (todayRes.ok) {
        const todayData = await todayRes.json();
        setToday(Number(todayData.count) || 0);
      }

      if (realtimeRes.ok) {
        const realtimeData = await realtimeRes.json();
        setRealtime(Number(realtimeData.count) || 0);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch visitor counts:', error);
    } finally {
      setLoading(false);
    }
  }, [supabaseUrl, supabaseKey]);

  const trackPageView = useCallback(async () => {
    try {
      const sessionId = sessionStorage.getItem('aurelia_visitor_session') || 
        `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      
      if (!sessionStorage.getItem('aurelia_visitor_session')) {
        sessionStorage.setItem('aurelia_visitor_session', sessionId);
      }

      await fetch(`${supabaseUrl}/functions/v1/visitor-tracking?action=track`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: window.location.pathname,
          sessionId,
          referrer: document.referrer || undefined,
        }),
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }, [supabaseUrl, supabaseKey]);

  useEffect(() => {
    // Track this page view
    trackPageView();

    // Fetch initial counts
    fetchCounts();

    // Refresh counts every 10 seconds
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, [fetchCounts, trackPageView]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gradient-to-br from-primary/10 to-card border border-border/50 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <p className="text-lg font-semibold">Visitor Activity</p>
        </div>
        <button 
          onClick={fetchCounts}
          className="p-1.5 hover:bg-muted rounded-md transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex gap-8">
        <div className="flex-1">
          <motion.p 
            key={today}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-foreground"
          >
            {loading ? '...' : today.toLocaleString()}
          </motion.p>
          <span className="text-xs text-muted-foreground">Today</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <motion.p 
              key={realtime}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-foreground"
            >
              {loading ? '...' : realtime.toLocaleString()}
            </motion.p>
            {realtime > 0 && (
              <Activity className="h-4 w-4 text-green-500 animate-pulse" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">Active now<sup>*</sup></span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        <span className="text-[.75em] text-muted-foreground/70">* active in last 5 min</span>
        {lastUpdated && (
          <span className="text-[.7em] text-muted-foreground/50">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default VisitorCountPanel;
