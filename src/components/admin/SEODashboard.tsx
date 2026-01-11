import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  TrendingUp, 
  Globe, 
  Target, 
  Copy,
  Check,
  ExternalLink,
  BarChart3,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { SEO_KEYWORDS, META_DESCRIPTIONS, STRUCTURED_DATA, generateKeywordString } from "@/lib/seo-keywords";

const SEODashboard = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const keywordCategories = Object.entries(SEO_KEYWORDS).map(([key, keywords]) => ({
    id: key,
    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    keywords,
    count: keywords.length,
  }));

  // Mock SEO metrics
  const seoMetrics = [
    { name: "Domain Authority", value: 42, max: 100, status: "good" },
    { name: "Page Speed (Desktop)", value: 92, max: 100, status: "excellent" },
    { name: "Page Speed (Mobile)", value: 78, max: 100, status: "good" },
    { name: "Core Web Vitals", value: 85, max: 100, status: "good" },
    { name: "Indexed Pages", value: 24, max: 50, status: "building" },
    { name: "Backlinks", value: 156, max: 1000, status: "growing" },
  ];

  return (
    <div className="space-y-6">
      {/* SEO Health Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {seoMetrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">{metric.name}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
                <Progress 
                  value={(metric.value / metric.max) * 100} 
                  className="h-1 mt-2" 
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="keywords" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keywords">Premium Keywords</TabsTrigger>
          <TabsTrigger value="meta">Meta Descriptions</TabsTrigger>
          <TabsTrigger value="structured">Structured Data</TabsTrigger>
          <TabsTrigger value="audit">SEO Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {keywordCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Search className="w-4 h-4 text-primary" />
                        {category.name}
                      </CardTitle>
                      <Badge variant="secondary">{category.count} keywords</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {category.keywords.slice(0, 6).map(keyword => (
                        <Badge 
                          key={keyword} 
                          variant="outline" 
                          className="text-xs cursor-pointer hover:bg-primary/10"
                          onClick={() => handleCopy(keyword, keyword)}
                        >
                          {copiedId === keyword ? <Check className="w-3 h-3" /> : keyword}
                        </Badge>
                      ))}
                      {category.keywords.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{category.keywords.length - 6} more
                        </Badge>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleCopy(category.keywords.join(", "), category.id)}
                    >
                      {copiedId === category.id ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy All Keywords
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Copy Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Quick Keyword Combinations
              </CardTitle>
              <CardDescription>
                Pre-built keyword combinations for different campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-2">Google Ads - Aviation</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {generateKeywordString(['privateAviation', 'primary']).slice(0, 100)}...
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCopy(
                      generateKeywordString(['privateAviation', 'primary']), 
                      'aviation-combo'
                    )}
                  >
                    {copiedId === 'aviation-combo' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-2">LinkedIn Ads - Executives</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {generateKeywordString(['lifestyle', 'security']).slice(0, 100)}...
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCopy(
                      generateKeywordString(['lifestyle', 'security']), 
                      'linkedin-combo'
                    )}
                  >
                    {copiedId === 'linkedin-combo' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(META_DESCRIPTIONS).map(([page, description], index) => (
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm capitalize flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        {page} Page
                      </CardTitle>
                      <Badge 
                        variant={description.length <= 160 ? "secondary" : "destructive"}
                      >
                        {description.length}/160 chars
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{description}</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCopy(description, `meta-${page}`)}
                    >
                      {copiedId === `meta-${page}` ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Description
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="structured" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Structured Data Status
              </CardTitle>
              <CardDescription>
                Schema.org markup for rich search results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Organization</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Company info, logo, contact details
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Service</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Service offerings with detailed descriptions
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="font-medium">FAQPage</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    FAQ section with Q&A markup
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Service Areas</p>
                <div className="flex flex-wrap gap-2">
                  {STRUCTURED_DATA.serviceAreas.map(area => (
                    <Badge key={area} variant="outline">{area}</Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Aggregate Rating</p>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-primary">
                    {STRUCTURED_DATA.aggregateRating.ratingValue}
                  </span>
                  <span className="text-muted-foreground">
                    Based on {STRUCTURED_DATA.aggregateRating.reviewCount} reviews
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                SEO Audit Checklist
              </CardTitle>
              <CardDescription>
                Technical SEO health check
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { item: "SSL Certificate", status: "pass", note: "Valid HTTPS" },
                  { item: "Mobile Responsiveness", status: "pass", note: "Fully responsive" },
                  { item: "Meta Titles", status: "pass", note: "All pages optimized" },
                  { item: "Meta Descriptions", status: "pass", note: "Under 160 chars" },
                  { item: "H1 Tags", status: "pass", note: "Single H1 per page" },
                  { item: "Image Alt Tags", status: "warning", note: "85% complete" },
                  { item: "Sitemap.xml", status: "pass", note: "Updated automatically" },
                  { item: "Robots.txt", status: "pass", note: "Properly configured" },
                  { item: "Canonical URLs", status: "pass", note: "Self-referencing" },
                  { item: "Core Web Vitals", status: "pass", note: "All green" },
                  { item: "Structured Data", status: "pass", note: "No errors" },
                  { item: "Open Graph Tags", status: "pass", note: "All pages" },
                ].map(check => (
                  <div 
                    key={check.item}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {check.status === "pass" ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <span className="text-xs text-yellow-500">!</span>
                        </div>
                      )}
                      <span className="font-medium">{check.item}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{check.note}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEODashboard;
