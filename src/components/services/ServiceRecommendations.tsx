import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, RefreshCw, Plane, Anchor, MapPin, UtensilsCrossed, Calendar, Heart, Building, Shield, Car, Gem } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAutoServiceMatcher, ServiceRecommendation } from '@/hooks/useAutoServiceMatcher';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  private_aviation: Plane,
  yacht_charter: Anchor,
  travel: MapPin,
  dining: UtensilsCrossed,
  events_access: Calendar,
  wellness: Heart,
  real_estate: Building,
  security: Shield,
  chauffeur: Car,
  collectibles: Gem,
  shopping: Gem,
};

const CATEGORY_COLORS: Record<string, string> = {
  private_aviation: 'from-sky-500/20 to-blue-600/20 border-sky-500/30',
  yacht_charter: 'from-cyan-500/20 to-teal-600/20 border-cyan-500/30',
  travel: 'from-violet-500/20 to-purple-600/20 border-violet-500/30',
  dining: 'from-amber-500/20 to-orange-600/20 border-amber-500/30',
  events_access: 'from-pink-500/20 to-rose-600/20 border-pink-500/30',
  wellness: 'from-emerald-500/20 to-green-600/20 border-emerald-500/30',
  real_estate: 'from-slate-500/20 to-gray-600/20 border-slate-500/30',
  security: 'from-red-500/20 to-rose-600/20 border-red-500/30',
  chauffeur: 'from-zinc-500/20 to-neutral-600/20 border-zinc-500/30',
  collectibles: 'from-yellow-500/20 to-amber-600/20 border-yellow-500/30',
  shopping: 'from-pink-500/20 to-fuchsia-600/20 border-pink-500/30',
};

interface ServiceRecommendationsProps {
  className?: string;
  maxItems?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export function ServiceRecommendations({ 
  className, 
  maxItems = 4, 
  showHeader = true,
  compact = false 
}: ServiceRecommendationsProps) {
  const { 
    recommendations, 
    isLoading, 
    fetchRecommendations, 
    createServiceRequest, 
    dismissRecommendation 
  } = useAutoServiceMatcher();
  
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRequest = async (rec: ServiceRecommendation) => {
    setProcessingId(rec.id);
    await createServiceRequest(rec);
    setProcessingId(null);
  };

  const displayedRecs = recommendations.slice(0, maxItems);

  if (!isLoading && recommendations.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Recommended for You</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchRecommendations(maxItems, true)}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn('h-4 w-4 mr-1', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      )}

      {isLoading && recommendations.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(maxItems)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full mb-3" />
                <div className="h-8 bg-muted rounded w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className={cn(
          'grid gap-4',
          compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
        )}>
          <AnimatePresence mode="popLayout">
            {displayedRecs.map((rec, index) => {
              const Icon = CATEGORY_ICONS[rec.category] || Sparkles;
              const colorClass = CATEGORY_COLORS[rec.category] || 'from-primary/20 to-primary/10 border-primary/30';
              
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    'relative overflow-hidden border bg-gradient-to-br transition-all duration-300 hover:shadow-lg',
                    colorClass
                  )}>
                    <button
                      onClick={() => dismissRecommendation(rec.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-background/50 hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Dismiss recommendation"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    
                    <CardContent className={cn('p-4', compact && 'p-3')}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-background/50 shrink-0">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground truncate">{rec.title}</h4>
                            {rec.urgency === 'high' && (
                              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                Priority
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {rec.description}
                          </p>
                          
                          <p className="text-xs text-muted-foreground/80 italic mb-3">
                            {rec.reason}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRequest(rec)}
                              disabled={processingId === rec.id}
                              className="group"
                            >
                              {processingId === rec.id ? (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  {rec.actionLabel}
                                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                                </>
                              )}
                            </Button>
                            
                            <Badge variant="secondary" className="text-xs capitalize">
                              {rec.category.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
