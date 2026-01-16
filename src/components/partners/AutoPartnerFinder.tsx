import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  Building2,
  Globe,
  Mail,
  Phone,
  Star,
  TrendingUp,
  Filter,
  RefreshCw,
  UserPlus,
  CheckCircle,
  Clock,
  MapPin,
  ExternalLink,
  Loader2,
  Zap,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { usePartnerMatching, PartnerMatch, PartnerSearchCriteria } from '@/hooks/usePartnerMatching';

const REGIONS = [
  'North America',
  'Europe',
  'Middle East',
  'Asia Pacific',
  'Latin America',
  'Africa',
];

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  qualified: 'bg-green-500/20 text-green-400',
  negotiating: 'bg-purple-500/20 text-purple-400',
  converted: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-red-500/20 text-red-400',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-gray-500/20 text-gray-400',
};

interface AutoPartnerFinderProps {
  onPartnerSelect?: (partner: PartnerMatch) => void;
}

export function AutoPartnerFinder({ onPartnerSelect }: AutoPartnerFinderProps) {
  const {
    matches,
    isSearching,
    isGenerating,
    searchPartners,
    generateAISuggestions,
    addProspect,
    updateProspectStatus,
    categories,
  } = usePartnerMatching();

  const [activeTab, setActiveTab] = useState('search');
  const [criteria, setCriteria] = useState<PartnerSearchCriteria>({
    limit: 20,
    minScore: 30,
  });
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [keywords, setKeywords] = useState('');
  const [aiRequirements, setAiRequirements] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<PartnerMatch | null>(null);

  useEffect(() => {
    // Initial search on mount
    searchPartners({ limit: 10 });
  }, [searchPartners]);

  const handleSearch = () => {
    const searchCriteria: PartnerSearchCriteria = {
      ...criteria,
      regions: selectedRegions.length > 0 ? selectedRegions : undefined,
      keywords: keywords ? keywords.split(',').map((k) => k.trim()) : undefined,
    };
    searchPartners(searchCriteria);
  };

  const handleAIDiscovery = async () => {
    if (!aiRequirements.trim()) return;
    const suggestions = await generateAISuggestions(aiRequirements);
    setAiSuggestions(suggestions);
  };

  const handleAddSuggestion = async (suggestion: any) => {
    await addProspect({
      company_name: suggestion.name,
      description: suggestion.description,
      category: suggestion.category,
      website: suggestion.website,
      coverage_regions: suggestion.regions,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Automatic Partner Discovery
          </h2>
          <p className="text-muted-foreground mt-1">
            Find and qualify premium service partners using AI-powered matching
          </p>
        </div>
        <Button onClick={handleSearch} disabled={isSearching} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isSearching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Smart Search
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Discovery
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Matches ({matches.length})
          </TabsTrigger>
        </TabsList>

        {/* Smart Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Search Criteria
              </CardTitle>
              <CardDescription>
                Define your ideal partner profile for intelligent matching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Select */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Category</label>
                  <Select
                    value={criteria.category || ''}
                    onValueChange={(value) =>
                      setCriteria({ ...criteria, category: value || undefined })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Minimum Score */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Minimum Match Score: {criteria.minScore}%
                  </label>
                  <Progress value={criteria.minScore} className="h-2" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={criteria.minScore}
                    onChange={(e) =>
                      setCriteria({ ...criteria, minScore: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Regions */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Coverage Regions</label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((region) => (
                    <label
                      key={region}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={selectedRegions.includes(region)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRegions([...selectedRegions, region]);
                          } else {
                            setSelectedRegions(selectedRegions.filter((r) => r !== region));
                          }
                        }}
                      />
                      <span className="text-sm">{region}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Keywords (comma-separated)</label>
                <Input
                  placeholder="luxury, exclusive, vip, premium..."
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>

              {/* Options */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={criteria.excludeContacted}
                    onCheckedChange={(checked) =>
                      setCriteria({ ...criteria, excludeContacted: !!checked })
                    }
                  />
                  <span className="text-sm">Exclude previously contacted</span>
                </label>
              </div>

              <Button onClick={handleSearch} disabled={isSearching} className="w-full">
                {isSearching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Find Partners
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Discovery Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                AI-Powered Discovery
              </CardTitle>
              <CardDescription>
                Describe your requirements and let AI find the perfect partners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe your ideal partner... e.g., 'We need a luxury yacht charter company operating in the Mediterranean with experience serving ultra-high-net-worth clients. Must have vessels over 50m and offer full crew services.'"
                value={aiRequirements}
                onChange={(e) => setAiRequirements(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <Button
                onClick={handleAIDiscovery}
                disabled={isGenerating || !aiRequirements.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate Suggestions
              </Button>

              {/* AI Suggestions */}
              <AnimatePresence>
                {aiSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3 mt-4"
                  >
                    <h4 className="font-medium text-sm text-muted-foreground">
                      AI Suggestions ({aiSuggestions.length})
                    </h4>
                    {aiSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium">{suggestion.name}</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              {suggestion.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{suggestion.category}</Badge>
                              {suggestion.regions?.map((region: string) => (
                                <Badge key={region} variant="secondary" className="text-xs">
                                  {region}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddSuggestion(suggestion)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              <AnimatePresence>
                {matches.map((partner, index) => (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`bg-card/50 border-border/50 hover:border-primary/50 transition-all cursor-pointer ${
                        selectedPartner?.id === partner.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedPartner(partner);
                        onPartnerSelect?.(partner);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold">{partner.company_name}</h3>
                              <Badge className={STATUS_COLORS[partner.status] || ''}>
                                {partner.status}
                              </Badge>
                              {partner.priority && (
                                <Badge className={PRIORITY_COLORS[partner.priority] || ''}>
                                  {partner.priority}
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {partner.description || 'No description available'}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                              {partner.category && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-3.5 w-3.5" />
                                  {partner.category}
                                </span>
                              )}
                              {partner.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3.5 w-3.5" />
                                  {partner.email}
                                </span>
                              )}
                              {partner.website && (
                                <a
                                  href={partner.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 hover:text-primary"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Globe className="h-3.5 w-3.5" />
                                  Website
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {partner.coverage_regions && partner.coverage_regions.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {partner.coverage_regions.slice(0, 2).join(', ')}
                                  {partner.coverage_regions.length > 2 &&
                                    ` +${partner.coverage_regions.length - 2}`}
                                </span>
                              )}
                            </div>

                            {/* Match Reasons */}
                            {partner.match_reasons.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {partner.match_reasons.map((reason, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {reason}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Match Score */}
                          <div className="text-center ml-4">
                            <div
                              className={`text-2xl font-bold ${getScoreColor(partner.match_score)}`}
                            >
                              {partner.match_score}
                            </div>
                            <div className="text-xs text-muted-foreground">Match</div>
                            <Progress
                              value={partner.match_score}
                              className="h-1.5 w-16 mt-1"
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateProspectStatus(partner.id, 'contacted');
                            }}
                          >
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Mark Contacted
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateProspectStatus(partner.id, 'qualified');
                            }}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Qualify
                          </Button>
                          {partner.email && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`mailto:${partner.email}`, '_blank');
                              }}
                            >
                              <Mail className="h-3.5 w-3.5 mr-1" />
                              Contact
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {matches.length === 0 && !isSearching && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium text-lg">No matches found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search criteria or use AI discovery
                  </p>
                </div>
              )}

              {isSearching && (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Searching for partners...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
