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
  'Caribbean',
  'Mediterranean',
  'Scandinavia',
  'Southeast Asia',
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

  const [activeTab, setActiveTab] = useState('ai');
  const [criteria, setCriteria] = useState<PartnerSearchCriteria>({
    limit: 20,
    minScore: 30,
  });
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [keywords, setKeywords] = useState('');
  const [aiRequirements, setAiRequirements] = useState('');
  const [aiCategory, setAiCategory] = useState<string>('');
  const [aiRegions, setAiRegions] = useState<string[]>([]);
  const [autoOutreach, setAutoOutreach] = useState(false);
  const [autoOutreachResults, setAutoOutreachResults] = useState<any[]>([]);
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
    const result = await generateAISuggestions(aiRequirements, {
      regions: aiRegions.length > 0 ? aiRegions : undefined,
      category: aiCategory || undefined,
      autoOutreach: autoOutreach,
    });
    setAiSuggestions(result.suggestions || []);
    setAutoOutreachResults(result.autoOutreachResults || []);
  };

  const toggleAiRegion = (region: string) => {
    setAiRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const handleAddSuggestion = async (suggestion: any) => {
    await addProspect({
      company_name: suggestion.company_name || suggestion.name,
      description: suggestion.description,
      category: suggestion.category,
      subcategory: suggestion.subcategory,
      website: suggestion.website,
      coverage_regions: suggestion.coverage_regions || suggestion.regions,
      priority: suggestion.priority,
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
                    value={criteria.category || "all"}
                    onValueChange={(value) =>
                      setCriteria({ ...criteria, category: value === "all" ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
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
          <Card className="bg-card/50 border-border/50 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <Zap className="h-5 w-5 text-primary" />
                Global AI-Powered Discovery
              </CardTitle>
              <CardDescription>
                Describe your requirements and let AI search globally for the perfect partners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Describe Your Ideal Partner</label>
                <Textarea
                  placeholder="E.g., Looking for luxury yacht charter companies operating in the Mediterranean with a fleet of superyachts over 50 meters, excellent crew, and experience with celebrity clients..."
                  value={aiRequirements}
                  onChange={(e) => setAiRequirements(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category Focus</label>
                  <Select value={aiCategory || "any"} onValueChange={(val) => setAiCategory(val === "any" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Regions (Global if none selected)</label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map((region) => (
                    <Badge
                      key={region}
                      variant={aiRegions.includes(region) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => toggleAiRegion(region)}
                    >
                      {aiRegions.includes(region) && <CheckCircle className="w-3 h-3 mr-1" />}
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Auto-outreach Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Auto-Invite High-Match Partners</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically send partnership invitations to 80%+ match partners
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoOutreach}
                    onChange={(e) => setAutoOutreach(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>

              <Button
                onClick={handleAIDiscovery}
                disabled={isGenerating || !aiRequirements.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {autoOutreach ? 'Discovering & Inviting...' : 'Searching globally...'}
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    <Sparkles className="h-4 w-4 mr-2" />
                    {autoOutreach ? 'Discover & Auto-Invite' : 'Discover Partners Globally'}
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Powered by AI + Web Search • Finds real companies worldwide
                {autoOutreach && ' • Auto-sends invite emails'}
              </p>

              {/* Auto-outreach Results */}
              <AnimatePresence>
                {autoOutreachResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30"
                  >
                    <h4 className="text-sm font-medium text-green-400 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Auto-Invites Sent
                    </h4>
                    <div className="space-y-1">
                      {autoOutreachResults.map((result, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          {result.success ? (
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          ) : (
                            <Clock className="h-3 w-3 text-yellow-400" />
                          )}
                          <span className={result.success ? 'text-green-300' : 'text-yellow-300'}>
                            {result.company}: {result.success ? `Invited at ${result.email}` : result.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Suggestions */}
              <AnimatePresence>
                {aiSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3 mt-4"
                  >
                    <Separator />
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Found {aiSuggestions.length} Potential Partners
                    </h4>
                    {aiSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">{suggestion.company_name || suggestion.name}</h5>
                              <Badge 
                                variant={suggestion.priority === 'high' ? 'default' : 'outline'}
                                className={suggestion.priority === 'high' ? 'bg-green-500/20 text-green-400' : ''}
                              >
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {suggestion.description}
                            </p>
                            {suggestion.match_reason && (
                              <p className="text-xs text-primary mt-1 italic">
                                ✓ {suggestion.match_reason}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="outline">{suggestion.category}</Badge>
                              {suggestion.subcategory && (
                                <Badge variant="secondary" className="text-xs">{suggestion.subcategory}</Badge>
                              )}
                              {(suggestion.coverage_regions || suggestion.regions)?.slice(0, 3).map((region: string) => (
                                <Badge key={region} variant="secondary" className="text-xs">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {region}
                                </Badge>
                              ))}
                            </div>
                            {suggestion.website && (
                              <a 
                                href={suggestion.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {suggestion.website}
                              </a>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddSuggestion(suggestion)}
                            className="shrink-0"
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
