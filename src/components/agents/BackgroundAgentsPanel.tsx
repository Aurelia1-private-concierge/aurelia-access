import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Plane, 
  Sparkles, 
  TrendingUp, 
  Bell, 
  Users,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBackgroundAgents } from '@/hooks/useBackgroundAgents';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  Plane,
  Sparkles,
  TrendingUp,
  Bell,
  Users,
};

const categoryColors: Record<string, string> = {
  travel: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  experiences: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  market: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  service: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  operations: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

export function BackgroundAgentsPanel() {
  const {
    agents,
    agentStates,
    runAgent,
    runAllAgents,
    travelIntelligence,
    experiences,
    marketOpportunities,
    serviceAlerts,
    partnerInsights,
  } = useBackgroundAgents();

  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const handleRunAll = async () => {
    setIsRunningAll(true);
    await runAllAgents();
    setIsRunningAll(false);
  };

  const getAgentResults = (agentId: string) => {
    switch (agentId) {
      case 'travel-intelligence':
        return travelIntelligence ? {
          count: (travelIntelligence.flightDeals?.length || 0) + 
                 (travelIntelligence.hotelAlerts?.length || 0) + 
                 (travelIntelligence.advisories?.length || 0),
          label: 'insights',
        } : null;
      case 'experience-curator':
        return experiences ? { count: experiences.length, label: 'experiences' } : null;
      case 'market-intelligence':
        return marketOpportunities ? { count: marketOpportunities.length, label: 'opportunities' } : null;
      case 'proactive-service':
        return serviceAlerts ? { count: serviceAlerts.length, label: 'alerts' } : null;
      case 'partner-operations':
        return partnerInsights ? { count: partnerInsights.length, label: 'partners' } : null;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Background Agents</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="gap-2"
          >
            {isRunningAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {agents.map((agent) => {
              const Icon = iconMap[agent.icon] || Bot;
              const state = agentStates[agent.id];
              const results = getAgentResults(agent.id);
              const isExpanded = expandedAgent === agent.id;

              return (
                <motion.div
                  key={agent.id}
                  layout
                  className={cn(
                    "border rounded-lg p-3 transition-colors cursor-pointer",
                    "bg-background/50 hover:bg-background/80",
                    isExpanded && "ring-1 ring-primary/50"
                  )}
                  onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      categoryColors[agent.category]
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{agent.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", categoryColors[agent.category])}
                        >
                          {agent.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {agent.description}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        {state?.isRunning ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Running...
                          </span>
                        ) : state?.lastRun ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(state.lastRun).toLocaleTimeString()}
                          </span>
                        ) : null}
                        
                        {state?.error ? (
                          <span className="flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            Error
                          </span>
                        ) : results ? (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <CheckCircle className="h-3 w-3" />
                            {results.count} {results.label}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          runAgent(agent.id);
                        }}
                        disabled={state?.isRunning}
                      >
                        {state?.isRunning ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <ChevronRight 
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          isExpanded && "rotate-90"
                        )} 
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 mt-3 border-t border-border/50">
                          <h5 className="text-xs font-medium text-muted-foreground mb-2">
                            Capabilities
                          </h5>
                          <ul className="space-y-1">
                            {agent.capabilities.map((cap, i) => (
                              <li key={i} className="text-xs text-foreground/80 flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-primary" />
                                {cap}
                              </li>
                            ))}
                          </ul>
                          {agent.runInterval && (
                            <p className="text-xs text-muted-foreground mt-3">
                              Auto-runs every {agent.runInterval} minutes
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
