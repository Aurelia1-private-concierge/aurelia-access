import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  Target, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle,
  ExternalLink,
  TrendingUp,
  Building2,
  Globe
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  MARKETING_PACKAGES, 
  UHNW_NETWORKS, 
  SOCIAL_STRATEGY,
  calculateMarketingBudget 
} from "@/lib/marketing-packages";

const MarketingPackagesPanel = () => {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  
  const togglePackage = (id: string) => {
    setSelectedPackages(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const budget = calculateMarketingBudget(selectedPackages);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      {selectedPackages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Selected Packages Budget</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(budget.min)} - {formatCurrency(budget.max)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{selectedPackages.length} packages selected</p>
              <Button size="sm" className="mt-2">
                Request Proposal
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="packages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="packages">Marketing Packages</TabsTrigger>
          <TabsTrigger value="networks">UHNW Networks</TabsTrigger>
          <TabsTrigger value="social">Social Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {MARKETING_PACKAGES.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedPackages.includes(pkg.id) 
                      ? 'border-primary bg-primary/5' 
                      : ''
                  }`}
                  onClick={() => togglePackage(pkg.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-primary" />
                          {pkg.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {pkg.description}
                        </CardDescription>
                      </div>
                      {selectedPackages.includes(pkg.id) && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {pkg.channels.slice(0, 3).map(channel => (
                        <Badge key={channel} variant="secondary" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                      {pkg.channels.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pkg.channels.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {formatCurrency(pkg.budget.min)} - {formatCurrency(pkg.budget.max)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{pkg.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{pkg.expectedReach}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{pkg.roi}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Key Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {pkg.features.slice(0, 3).map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="networks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {UHNW_NETWORKS.map((network, index) => (
              <motion.div
                key={network.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                      {network.name}
                    </CardTitle>
                    <CardDescription>{network.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Member Requirement</p>
                      <p className="text-sm font-medium">{network.memberRequirement}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Access Method</p>
                      <Badge variant="secondary">{network.accessMethod}</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          {Object.entries(SOCIAL_STRATEGY).map(([platform, strategy]) => (
            <Card key={platform}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <Globe className="w-5 h-5 text-primary" />
                  {platform} Strategy
                </CardTitle>
                <CardDescription>
                  Posting: {strategy.postingFrequency} | Budget: {strategy.budget}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Targeting
                    </p>
                    <ul className="space-y-1">
                      {strategy.targeting.map(target => (
                        <li key={target} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {target}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Content Types</p>
                    <div className="flex flex-wrap gap-2">
                      {strategy.contentTypes.map(content => (
                        <Badge key={content} variant="outline" className="text-xs">
                          {content}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingPackagesPanel;
