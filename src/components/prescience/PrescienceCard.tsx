import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Check, 
  X, 
  ChevronDown,
  Plane,
  UtensilsCrossed,
  Ticket,
  Heart,
  ShoppingBag,
  Compass,
  Clock,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { LifestyleOpportunity } from '@/hooks/usePrescience';

interface PrescienceCardProps {
  opportunity: LifestyleOpportunity;
  onApprove: (id: string, feedback?: string) => void;
  onDecline: (id: string, feedback?: string) => void;
  isLoading?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  travel: Plane,
  dining: UtensilsCrossed,
  events: Ticket,
  wellness: Heart,
  shopping: ShoppingBag,
  experiences: Compass,
};

const OPPORTUNITY_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  time_sensitive: { label: 'Time Sensitive', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  calendar_match: { label: 'Calendar Match', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  preference_match: { label: 'Perfect Match', color: 'bg-gold/20 text-gold border-gold/30' },
  serendipity: { label: 'Serendipity', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
};

export function PrescienceCard({ opportunity, onApprove, onDecline, isLoading }: PrescienceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const CategoryIcon = CATEGORY_ICONS[opportunity.category] || Compass;
  const typeInfo = OPPORTUNITY_TYPE_LABELS[opportunity.opportunity_type] || OPPORTUNITY_TYPE_LABELS.preference_match;

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleApprove = () => {
    onApprove(opportunity.id, feedback || undefined);
  };

  const handleDecline = () => {
    if (showFeedback) {
      onDecline(opportunity.id, feedback || undefined);
    } else {
      setShowFeedback(true);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl",
        "shadow-lg shadow-gold/5 hover:shadow-gold/10 transition-all duration-500"
      )}
    >
      {/* Prescience glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      {/* Priority indicator */}
      {opportunity.priority >= 8 && (
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
          <div className="absolute top-4 -right-8 rotate-45 bg-gold text-black text-xs font-bold py-1 px-8">
            PRIORITY
          </div>
        </div>
      )}

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gold/10 border border-gold/20">
              <CategoryIcon className="w-5 h-5 text-gold" />
            </div>
            <div>
              <Badge variant="outline" className={cn("mb-1 text-xs", typeInfo.color)}>
                {typeInfo.label}
              </Badge>
              <h3 className="text-lg font-semibold text-foreground">{opportunity.title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gold">
            <Star className="w-4 h-4 fill-gold" />
            <span className="text-sm font-medium">{opportunity.match_score}%</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-4 line-clamp-2">{opportunity.description}</p>

        {/* Quick info */}
        <div className="flex flex-wrap gap-3 mb-4">
          {opportunity.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-gold/70" />
              <span>{opportunity.location}</span>
            </div>
          )}
          {opportunity.estimated_cost && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 text-gold/70" />
              <span>{formatCurrency(opportunity.estimated_cost, opportunity.currency)}</span>
            </div>
          )}
          {opportunity.available_until && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-gold/70" />
              <span>Until {new Date(opportunity.available_until).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Match reasons toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-gold/80 hover:text-gold transition-colors mb-4"
        >
          <Sparkles className="w-4 h-4" />
          <span>Why this matches you</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-gold/5 border border-gold/10 mb-4">
                <ul className="space-y-2">
                  {opportunity.match_reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Sparkles className="w-3 h-3 text-gold mt-1 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback input */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <Textarea
                placeholder="Help us understand your preferences better... (optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-muted/50 border-gold/20 focus:border-gold/40"
                rows={2}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleApprove}
            disabled={isLoading}
            className="flex-1 bg-gold hover:bg-gold/90 text-black font-medium gap-2"
          >
            <Check className="w-4 h-4" />
            Approve
          </Button>
          <Button
            onClick={handleDecline}
            disabled={isLoading}
            variant="outline"
            className="flex-1 border-muted hover:border-destructive hover:text-destructive gap-2"
          >
            <X className="w-4 h-4" />
            {showFeedback ? 'Confirm Decline' : 'Decline'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
