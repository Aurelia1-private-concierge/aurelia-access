import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Wifi,
  WifiOff,
  Database,
  Shield,
  RefreshCw,
  Check,
  AlertTriangle,
  X,
  Zap,
  Globe,
  Lock,
  Server,
  Clock,
  TrendingUp,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUnifiedHealth } from '@/hooks/useUnifiedHealth';
import { useHealthHistory } from '@/hooks/useHealthHistory';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { className: string; label: string }> = {
    healthy: { className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Healthy' },
    online: { className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Online' },
    authenticated: { className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Active' },
    warning: { className: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Warning' },
    degraded: { className: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Degraded' },
    expired: { className: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Expired' },
    critical: { className: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Critical' },
    offline: { className: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'Offline' },
    none: { className: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'None' },
    unknown: { className: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'Unknown' },
    checking: { className: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Checking' },
  };

  const config = configs[status] || configs.unknown;

  return (
    <Badge variant="outline" className={`${config.className} text-xs`}>
      {config.label}
    </Badge>
  );
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'healthy':
    case 'online':
    case 'authenticated':
      return <Check className="w-4 h-4 text-emerald-400" />;
    case 'warning':
    case 'degraded':
    case 'expired':
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case 'critical':
    case 'offline':
      return <X className="w-4 h-4 text-red-400" />;
    case 'checking':
      return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-slate-400" />;
  }
};

export const UnifiedStatusDashboard = () => {
  const navigate = useNavigate();
  const { state, runtime, infrastructure, refreshAll, isRefreshing } = useUnifiedHealth();
  const { metrics, isLoading, timeRange, setTimeRange, getRecentEvents, getLatestInfrastructureStatus } = useHealthHistory();
  
  const recentEvents = getRecentEvents(5);
  const infraStatus = getLatestInfrastructureStatus();

  const overallColors: Record<string, string> = {
    healthy: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
    offline: 'text-slate-400',
    checking: 'text-blue-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2 flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            System Health
          </h1>
          <p className="text-muted-foreground">
            Unified monitoring of runtime and infrastructure health
          </p>
        </div>
        <Button 
          onClick={refreshAll} 
          disabled={isRefreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </motion.div>

      {/* Overall Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`border-2 ${
          state.overall === 'healthy' ? 'border-emerald-500/30 bg-emerald-500/5' :
          state.overall === 'warning' ? 'border-amber-500/30 bg-amber-500/5' :
          state.overall === 'critical' ? 'border-red-500/30 bg-red-500/5' :
          'border-border'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  state.overall === 'healthy' ? 'bg-emerald-500/20' :
                  state.overall === 'warning' ? 'bg-amber-500/20' :
                  state.overall === 'critical' ? 'bg-red-500/20' :
                  'bg-slate-500/20'
                }`}>
                  <StatusIcon status={state.overall} />
                </div>
                <div>
                  <h2 className={`text-2xl font-semibold capitalize ${overallColors[state.overall]}`}>
                    {state.overall === 'healthy' ? 'All Systems Operational' :
                     state.overall === 'warning' ? 'Degraded Performance' :
                     state.overall === 'critical' ? 'Service Disruption' :
                     state.overall === 'checking' ? 'Checking Systems...' :
                     'Offline'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Last checked: {format(state.lastCheck, 'HH:mm:ss')}
                  </p>
                </div>
              </div>
              
              {metrics && (
                <div className="text-right">
                  <p className="text-3xl font-bold text-foreground">
                    {metrics.uptimePercent.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Uptime ({timeRange})</p>
                </div>
              )}
            </div>

            {/* Suggest Publication Wizard */}
            {state.suggestPublicationWizard && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-amber-300">
                    Infrastructure issues detected. Run diagnostics for detailed analysis.
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  onClick={() => navigate('/admin?tab=publication')}
                >
                  Open Publication Wizard
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Status Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Live Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Runtime Status */}
              <div className="p-4 bg-secondary/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  {state.runtime.network === 'online' ? (
                    <Wifi className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm font-medium">Network</span>
                </div>
                <StatusBadge status={state.runtime.network} />
              </div>

              <div className="p-4 bg-secondary/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Database</span>
                </div>
                <StatusBadge status={state.runtime.database} />
              </div>

              <div className="p-4 bg-secondary/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Auth</span>
                </div>
                <StatusBadge status={state.runtime.auth} />
              </div>

              {/* Infrastructure Status */}
              <div className="p-4 bg-secondary/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">DNS</span>
                </div>
                <StatusBadge status={state.infrastructure.dns} />
              </div>

              <div className="p-4 bg-secondary/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">SSL</span>
                </div>
                <StatusBadge status={state.infrastructure.ssl} />
              </div>

              <div className="p-4 bg-secondary/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">CDN</span>
                </div>
                <StatusBadge status={state.infrastructure.cdn} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics and History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Health Metrics
              </CardTitle>
              <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
                <TabsList className="h-8">
                  <TabsTrigger value="24h" className="text-xs px-2 py-1">24h</TabsTrigger>
                  <TabsTrigger value="7d" className="text-xs px-2 py-1">7d</TabsTrigger>
                  <TabsTrigger value="30d" className="text-xs px-2 py-1">30d</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : metrics ? (
                <>
                  {/* Uptime Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className={`font-medium ${
                        metrics.uptimePercent >= 99.9 ? 'text-emerald-400' :
                        metrics.uptimePercent >= 99 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {metrics.uptimePercent.toFixed(2)}%
                      </span>
                    </div>
                    <Progress 
                      value={metrics.uptimePercent} 
                      className="h-2"
                    />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-400">{metrics.successfulHeals}</p>
                      <p className="text-xs text-muted-foreground">Auto-Healed</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{metrics.totalEvents}</p>
                      <p className="text-xs text-muted-foreground">Total Events</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">
                        {metrics.averageHealTime > 0 ? `${Math.round(metrics.averageHealTime)}ms` : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Heal Time</p>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">
                        {metrics.mttr > 0 ? `${Math.round(metrics.mttr / 1000)}s` : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">MTTR</p>
                    </div>
                  </div>

                  {/* Last Incident */}
                  {metrics.lastIncident && (
                    <div className="pt-4 border-t border-border/30">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Last incident:</span>
                        <span className="text-foreground">
                          {formatDistanceToNow(metrics.lastIncident, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No health data available
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Events Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentEvents.length > 0 ? (
                <div className="space-y-3">
                  {recentEvents.map((event, index) => (
                    <div 
                      key={event.id}
                      className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg"
                    >
                      <div className={`p-1.5 rounded-full ${
                        event.status === 'success' ? 'bg-emerald-500/20' :
                        event.status === 'failure' ? 'bg-red-500/20' :
                        'bg-amber-500/20'
                      }`}>
                        {event.status === 'success' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : event.status === 'failure' ? (
                          <X className="w-3 h-3 text-red-400" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground capitalize">
                          {event.event_type.replace('_', ' ')} - {event.component}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                          {event.duration_ms && ` • ${event.duration_ms}ms`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No recent activity
                </p>
              )}

              {/* Infrastructure Status */}
              {infraStatus && (
                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-xs text-muted-foreground mb-2">Latest Infrastructure Check</p>
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="text-sm">{infraStatus.domain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={infraStatus.status} />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={() => navigate('/admin?tab=publication')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => runtime.forceHeal()}
                disabled={runtime.isHealing}
              >
                {runtime.isHealing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Force Self-Heal
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => infrastructure.runDiagnostics()}
                disabled={infrastructure.isRunning}
              >
                {infrastructure.isRunning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                Run Infrastructure Scan
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => infrastructure.clearServiceWorkers()}
              >
                <Server className="w-4 h-4" />
                Clear Service Workers
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => navigate('/status')}
              >
                <ExternalLink className="w-4 h-4" />
                Public Status Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UnifiedStatusDashboard;
