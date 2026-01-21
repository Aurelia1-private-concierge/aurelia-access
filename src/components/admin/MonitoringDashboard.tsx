import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Server,
  TrendingUp,
  XCircle,
  Zap
} from 'lucide-react';
import { useMonitoring, type Incident, type ErrorLog } from '@/hooks/useMonitoring';
import { format, formatDistanceToNow } from 'date-fns';

const statusColors = {
  healthy: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  down: 'bg-red-500',
  unknown: 'bg-muted',
};

const severityColors = {
  critical: 'text-red-500 bg-red-500/10 border-red-500/20',
  major: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  minor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
};

const incidentStatusColors = {
  investigating: 'bg-amber-500',
  identified: 'bg-blue-500',
  monitoring: 'bg-purple-500',
  resolved: 'bg-emerald-500',
};

export function MonitoringDashboard() {
  const { 
    uptimeChecks, 
    incidents, 
    performanceMetrics, 
    errorLogs, 
    stats, 
    loading,
    resolveIncident,
    resolveError,
    refresh 
  } = useMonitoring();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Get unique endpoints with latest status
  const endpoints = uptimeChecks.reduce((acc, check) => {
    if (!acc[check.endpoint_name]) {
      acc[check.endpoint_name] = check;
    }
    return acc;
  }, {} as Record<string, typeof uptimeChecks[0]>);

  // Group performance metrics
  const metricsByType = performanceMetrics.reduce((acc, metric) => {
    if (!acc[metric.metric_type]) acc[metric.metric_type] = [];
    acc[metric.metric_type].push(metric);
    return acc;
  }, {} as Record<string, typeof performanceMetrics>);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stats.uptime_percentage >= 99 ? 'bg-emerald-500/20 text-emerald-500' :
                stats.uptime_percentage >= 95 ? 'bg-amber-500/20 text-amber-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{stats.uptime_percentage.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{stats.avg_response_time}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stats.total_errors_24h === 0 ? 'bg-emerald-500/20 text-emerald-500' :
                stats.total_errors_24h < 10 ? 'bg-amber-500/20 text-amber-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Errors (24h)</p>
                <p className="text-2xl font-bold">{stats.total_errors_24h}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stats.active_incidents === 0 ? 'bg-emerald-500/20 text-emerald-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Incidents</p>
                <p className="text-2xl font-bold">{stats.active_incidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            System Monitoring
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="endpoints">
            <TabsList className="mb-4">
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
            </TabsList>

            <TabsContent value="endpoints">
              <div className="space-y-3">
                {Object.values(endpoints).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No uptime checks recorded yet
                  </p>
                ) : (
                  Object.values(endpoints).map((endpoint) => (
                    <div 
                      key={endpoint.endpoint_name}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${statusColors[endpoint.status]}`} />
                        <div>
                          <p className="font-medium">{endpoint.endpoint_name}</p>
                          <p className="text-sm text-muted-foreground">{endpoint.endpoint_url}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">
                          {endpoint.response_time_ms ? `${endpoint.response_time_ms}ms` : '-'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(endpoint.checked_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="incidents">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {incidents.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <p className="text-muted-foreground">No incidents recorded</p>
                    </div>
                  ) : (
                    incidents.map((incident) => (
                      <IncidentCard 
                        key={incident.id} 
                        incident={incident}
                        onResolve={() => resolveIncident(incident.id)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="performance">
              <div className="space-y-6">
                {Object.entries(metricsByType).map(([type, metrics]) => (
                  <div key={type}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
                      {type.replace('_', ' ')}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {metrics.slice(0, 8).map((metric) => (
                        <div 
                          key={metric.id}
                          className="p-3 rounded-lg bg-muted/30"
                        >
                          <p className="text-xs text-muted-foreground truncate">
                            {metric.metric_name}
                          </p>
                          <p className="text-lg font-mono font-bold">
                            {Math.round(metric.value_ms)}ms
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(metricsByType).length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No performance metrics recorded yet
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="errors">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {errorLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <p className="text-muted-foreground">No errors in the last 24 hours</p>
                    </div>
                  ) : (
                    errorLogs.map((error) => (
                      <ErrorCard 
                        key={error.id} 
                        error={error}
                        onResolve={() => resolveError(error.id)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function IncidentCard({ incident, onResolve }: { incident: Incident; onResolve: () => void }) {
  return (
    <div className={`p-4 rounded-lg border ${severityColors[incident.severity]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`${incidentStatusColors[incident.status]} text-white text-xs`}>
              {incident.status}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {incident.severity}
            </Badge>
          </div>
          <h4 className="font-medium">{incident.title}</h4>
          {incident.description && (
            <p className="text-sm text-muted-foreground mt-1">{incident.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Started {formatDistanceToNow(new Date(incident.started_at), { addSuffix: true })}
            </span>
            {incident.affected_services && (
              <span>Affects: {incident.affected_services.join(', ')}</span>
            )}
          </div>
        </div>
        {incident.status !== 'resolved' && (
          <Button size="sm" variant="outline" onClick={onResolve}>
            Resolve
          </Button>
        )}
      </div>
    </div>
  );
}

function ErrorCard({ error, onResolve }: { error: ErrorLog; onResolve: () => void }) {
  return (
    <div className={`p-4 rounded-lg bg-muted/30 ${error.resolved ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs capitalize">
              {error.error_type}
            </Badge>
            {error.component && (
              <Badge variant="secondary" className="text-xs">
                {error.component}
              </Badge>
            )}
            {error.resolved && (
              <Badge className="bg-emerald-500 text-xs">Resolved</Badge>
            )}
          </div>
          <p className="font-mono text-sm truncate">{error.error_message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(error.created_at), 'MMM d, HH:mm:ss')}
          </p>
        </div>
        {!error.resolved && (
          <Button size="sm" variant="ghost" onClick={onResolve}>
            Mark Resolved
          </Button>
        )}
      </div>
    </div>
  );
}

export default MonitoringDashboard;
