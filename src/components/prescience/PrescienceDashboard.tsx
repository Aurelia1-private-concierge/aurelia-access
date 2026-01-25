import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Brain, 
  RefreshCw, 
  TrendingUp,
  Target,
  Zap,
  Shield,
  Users,
  ChevronRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { usePrescience } from '@/hooks/usePrescience';
import { PrescienceCard } from './PrescienceCard';

export function PrescienceDashboard() {
  const {
    opportunities,
    preferenceDNA,
    isLoading,
    isGenerating,
    generateOpportunities,
    respondToOpportunity,
  } = usePrescience();

  const [activeTab, setActiveTab] = useState<'opportunities' | 'dna'>('opportunities');

  const dnaMetrics = [
    { 
      key: 'adventure_score', 
      label: 'Adventure', 
      icon: Zap, 
      value: preferenceDNA?.adventure_score || 50,
      description: 'Your appetite for thrilling and novel experiences'
    },
    { 
      key: 'luxury_threshold', 
      label: 'Luxury Standard', 
      icon: Target, 
      value: preferenceDNA?.luxury_threshold || 70,
      description: 'The quality threshold you expect from experiences'
    },
    { 
      key: 'spontaneity_score', 
      label: 'Spontaneity', 
      icon: RefreshCw, 
      value: preferenceDNA?.spontaneity_score || 50,
      description: 'Your comfort with last-minute opportunities'
    },
    { 
      key: 'privacy_preference', 
      label: 'Privacy', 
      icon: Shield, 
      value: preferenceDNA?.privacy_preference || 80,
      description: 'Your preference for exclusive, private experiences'
    },
    { 
      key: 'social_preference', 
      label: 'Social', 
      icon: Users, 
      value: preferenceDNA?.social_preference || 50,
      description: 'Your inclination toward social gatherings'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-gold/20 to-purple-500/20 border border-gold/30">
              <Brain className="w-6 h-6 text-gold" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">
              Aurelia Prescience
            </h2>
          </div>
          <p className="text-muted-foreground">
            Anticipating your desires before you know them
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={cn(
              "border-gold/30",
              preferenceDNA?.confidence_score && preferenceDNA.confidence_score > 50 
                ? "bg-gold/10 text-gold" 
                : "bg-muted text-muted-foreground"
            )}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {preferenceDNA?.data_points_analyzed || 0} signals analyzed
          </Badge>
          <Button
            onClick={generateOpportunities}
            disabled={isGenerating}
            className="bg-gradient-to-r from-gold to-amber-500 hover:from-gold/90 hover:to-amber-500/90 text-black gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Opportunities'}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('opportunities')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'opportunities' 
              ? "bg-card text-foreground shadow-md" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Opportunities ({opportunities.length})
        </button>
        <button
          onClick={() => setActiveTab('dna')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === 'dna' 
              ? "bg-card text-foreground shadow-md" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Brain className="w-4 h-4" />
          Your Taste DNA
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'opportunities' ? (
          <motion.div
            key="opportunities"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {opportunities.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="inline-flex p-4 rounded-full bg-gold/10 border border-gold/20 mb-4">
                  <Sparkles className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Pending Opportunities</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Our AI is constantly monitoring for perfect opportunities. Generate new ones or check back soon.
                </p>
                <Button
                  onClick={generateOpportunities}
                  disabled={isGenerating}
                  className="bg-gold hover:bg-gold/90 text-black gap-2"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate Now
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {opportunities.map((opp) => (
                  <PrescienceCard
                    key={opp.id}
                    opportunity={opp}
                    onApprove={(id, feedback) => respondToOpportunity(id, 'approved', feedback)}
                    onDecline={(id, feedback) => respondToOpportunity(id, 'declined', feedback)}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dna"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Confidence indicator */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-gold/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-gold" />
                  <span className="font-medium">Preference Confidence</span>
                </div>
                <span className="text-2xl font-bold text-gold">
                  {preferenceDNA?.confidence_score || 0}%
                </span>
              </div>
              <Progress 
                value={preferenceDNA?.confidence_score || 0} 
                className="h-2 bg-muted"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {preferenceDNA?.confidence_score && preferenceDNA.confidence_score >= 70
                  ? "Prescience is highly attuned to your preferences."
                  : preferenceDNA?.confidence_score && preferenceDNA.confidence_score >= 40
                    ? "Building understanding. Continue using Aurelia for better predictions."
                    : "Just getting started. Use Aurelia services to train Prescience."}
              </p>
            </div>

            {/* DNA Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <TooltipProvider>
                {dnaMetrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={metric.key}
                      className="p-5 rounded-xl bg-card/50 border border-gold/10 hover:border-gold/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gold/70" />
                          <span className="text-sm font-medium">{metric.label}</span>
                        </div>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3.5 h-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{metric.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-bold text-foreground">
                          {metric.value}
                        </span>
                        <Progress 
                          value={metric.value} 
                          className="w-24 h-1.5 bg-muted"
                        />
                      </div>
                    </div>
                  );
                })}
              </TooltipProvider>
            </div>

            {/* Learned Preferences */}
            {preferenceDNA && (
              <div className="grid md:grid-cols-3 gap-4">
                {preferenceDNA.preferred_destinations.length > 0 && (
                  <div className="p-5 rounded-xl bg-card/50 border border-gold/10">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Preferred Destinations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {preferenceDNA.preferred_destinations.map((dest, i) => (
                        <Badge key={i} variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                          {dest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {preferenceDNA.preferred_cuisines.length > 0 && (
                  <div className="p-5 rounded-xl bg-card/50 border border-gold/10">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Preferred Cuisines
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {preferenceDNA.preferred_cuisines.map((cuisine, i) => (
                        <Badge key={i} variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {preferenceDNA.preferred_experiences.length > 0 && (
                  <div className="p-5 rounded-xl bg-card/50 border border-gold/10">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Preferred Experiences
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {preferenceDNA.preferred_experiences.map((exp, i) => (
                        <Badge key={i} variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* How it works */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-gold/5 to-purple-500/5 border border-gold/10">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-gold" />
                How Prescience Learns
              </h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-gold text-xs font-bold">1</span>
                  </div>
                  <p>Every service request, inquiry, and rating becomes a preference signal</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-gold text-xs font-bold">2</span>
                  </div>
                  <p>AI analyzes patterns to build your unique Taste DNA profile</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-gold text-xs font-bold">3</span>
                  </div>
                  <p>Prescience proactively suggests opportunities before you search</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
