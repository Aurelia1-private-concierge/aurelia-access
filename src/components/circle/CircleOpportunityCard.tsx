import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Plane, 
  Anchor, 
  Palette, 
  Building,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { CircleOpportunity } from '@/hooks/useCircle';

interface CircleOpportunityCardProps {
  opportunity: CircleOpportunity;
  onExpressInterest: () => void;
  onViewDetails?: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  yacht: <Anchor className="w-5 h-5" />,
  jet: <Plane className="w-5 h-5" />,
  art: <Palette className="w-5 h-5" />,
  property: <Building className="w-5 h-5" />,
  default: <Sparkles className="w-5 h-5" />,
};

const typeLabels: Record<string, { label: string; color: string }> = {
  co_investment: { label: 'Co-Investment', color: 'bg-emerald-500/20 text-emerald-400' },
  experience: { label: 'Experience', color: 'bg-purple-500/20 text-purple-400' },
  deal_flow: { label: 'Deal Flow', color: 'bg-blue-500/20 text-blue-400' },
  introduction: { label: 'Introduction', color: 'bg-amber-500/20 text-amber-400' },
};

const CircleOpportunityCard = ({
  opportunity,
  onExpressInterest,
  onViewDetails,
}: CircleOpportunityCardProps) => {
  const icon = categoryIcons[opportunity.category || 'default'] || categoryIcons.default;
  const typeInfo = typeLabels[opportunity.opportunity_type] || typeLabels.co_investment;
  const slotsProgress = (opportunity.filled_slots / opportunity.total_slots) * 100;
  const availableSlots = opportunity.total_slots - opportunity.filled_slots;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toFixed(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="relative group overflow-hidden bg-card/50 backdrop-blur-xl border border-border/30 rounded-2xl hover:border-gold/30 transition-all duration-300"
    >
      {/* Image or gradient header */}
      {opportunity.images && opportunity.images.length > 0 ? (
        <div className="h-40 overflow-hidden">
          <img
            src={opportunity.images[0]}
            alt={opportunity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        </div>
      ) : (
        <div className="h-24 bg-gradient-to-br from-gold/20 via-purple-500/10 to-transparent relative">
          <div className="absolute inset-0 flex items-center justify-center text-gold/40">
            {icon}
          </div>
        </div>
      )}

      {/* Type Badge */}
      <div className="absolute top-4 left-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 
          className="font-semibold text-lg text-foreground mb-2 cursor-pointer hover:text-gold transition-colors line-clamp-2"
          onClick={onViewDetails}
        >
          {opportunity.title}
        </h3>

        {opportunity.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {opportunity.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
          {opportunity.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{opportunity.location}</span>
            </div>
          )}
          {opportunity.target_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(opportunity.target_date), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Investment range */}
        {(opportunity.min_contribution || opportunity.max_contribution) && (
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">
              {opportunity.min_contribution && opportunity.max_contribution ? (
                `${formatCurrency(opportunity.min_contribution)} - ${formatCurrency(opportunity.max_contribution)} ${opportunity.currency}`
              ) : opportunity.min_contribution ? (
                `From ${formatCurrency(opportunity.min_contribution)} ${opportunity.currency}`
              ) : (
                `Up to ${formatCurrency(opportunity.max_contribution!)} ${opportunity.currency}`
              )}
            </span>
          </div>
        )}

        {/* Slots progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{availableSlots} of {opportunity.total_slots} slots available</span>
            </div>
            <span className="text-xs text-gold">{Math.round(slotsProgress)}% filled</span>
          </div>
          <Progress value={slotsProgress} className="h-1.5" />
        </div>

        {/* Action */}
        <Button
          className="w-full bg-gold hover:bg-gold/90 text-black gap-2"
          onClick={onExpressInterest}
          disabled={availableSlots === 0}
        >
          {availableSlots === 0 ? 'Fully Subscribed' : 'Express Interest'}
          {availableSlots > 0 && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </motion.div>
  );
};

export default CircleOpportunityCard;
