import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { firecrawlApi, extractionSchemas, ExtractionType } from '@/lib/api/firecrawl';
import { 
  Globe, Search, Map, Loader2, FileText, Link, ExternalLink, 
  Calendar, Code, Database, Palette, Clock, Trash2, Play, RefreshCw
} from 'lucide-react';

interface ScheduledJob {
  id: string;
  url: string;
  extraction_type: string | null;
  schedule_type: string;
  next_run_at: string;
  last_run_at: string | null;
  is_active: boolean;
  run_count: number;
}

export const WebCrawlerPanel = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('scrape');
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Scrape options
  const [extractionType, setExtractionType] = useState<ExtractionType | 'none'>('none');
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [waitForJs, setWaitForJs] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Crawl options
  const [crawlLimit, setCrawlLimit] = useState(50);
  const [maxDepth, setMaxDepth] = useState(3);
  const [includePaths, setIncludePaths] = useState('');
  const [excludePaths, setExcludePaths] = useState('');
  
  // Schedule options
  const [scheduleType, setScheduleType] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  
  // Crawl job tracking
  const [crawlJobId, setCrawlJobId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'schedule') {
      loadScheduledJobs();
    }
  }, [activeTab]);

  const loadScheduledJobs = async () => {
    try {
      const response = await firecrawlApi.getScheduledJobs();
      if (response.success && response.data) {
        setScheduledJobs(response.data);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleScrape = async () => {
    if (!url) {
      toast({ title: 'Error', description: 'Please enter a URL', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    
    try {
      let response;
      
      if (extractionType !== 'none') {
        // Use structured extraction
        response = await firecrawlApi.scrapeStructured(
          url, 
          extractionType,
          undefined,
          customPrompt || undefined
        );
      } else {
        // Standard scrape with options
        const formats: any[] = ['markdown', 'links'];
        if (includeScreenshot) formats.push('screenshot');
        
        response = await firecrawlApi.scrape(url, { 
          formats,
          onlyMainContent: true,
          waitFor: waitForJs ? 2000 : 0,
        });
      }
      
      if (response.success) {
        toast({ title: 'Success', description: 'Page scraped successfully' });
        setResult(response);
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to scrape', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to scrape page', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractBranding = async () => {
    if (!url) {
      toast({ title: 'Error', description: 'Please enter a URL', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await firecrawlApi.extractBranding(url);
      if (response.success) {
        toast({ title: 'Success', description: 'Branding extracted successfully' });
        setResult(response);
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to extract branding', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to extract branding', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!url) {
      toast({ title: 'Error', description: 'Please enter a URL', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await firecrawlApi.summarize(url);
      if (response.success) {
        toast({ title: 'Success', description: 'Page summarized successfully' });
        setResult(response);
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to summarize', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to summarize page', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      toast({ title: 'Error', description: 'Please enter a search query', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await firecrawlApi.search(searchQuery, { limit: 10 });
      if (response.success) {
        toast({ title: 'Success', description: 'Search completed' });
        setResult(response);
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to search', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to search', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMap = async () => {
    if (!url) {
      toast({ title: 'Error', description: 'Please enter a URL', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await firecrawlApi.map(url, { limit: 500, includeSubdomains: true });
      if (response.success) {
        toast({ title: 'Success', description: 'Site mapped successfully' });
        setResult(response);
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to map', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to map site', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrawl = async () => {
    if (!url) {
      toast({ title: 'Error', description: 'Please enter a URL', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    setCrawlJobId(null);
    
    try {
      const options: any = { 
        limit: crawlLimit,
        maxDepth,
      };
      
      if (includePaths.trim()) {
        options.includePaths = includePaths.split(',').map(p => p.trim()).filter(Boolean);
      }
      if (excludePaths.trim()) {
        options.excludePaths = excludePaths.split(',').map(p => p.trim()).filter(Boolean);
      }
      
      // Add structured extraction if selected
      if (extractionType !== 'none') {
        options.scrapeOptions = {
          formats: ['markdown', { type: 'json', schema: extractionSchemas[extractionType] }],
          onlyMainContent: true,
          waitFor: waitForJs ? 2000 : 0,
        };
      }
      
      const response = await firecrawlApi.crawl(url, options);
      
      if (response.success) {
        toast({ title: 'Crawl Started', description: `Job ID: ${response.id}` });
        setCrawlJobId(response.id);
        setResult(response);
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to start crawl', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to start crawl', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckCrawlStatus = async () => {
    if (!crawlJobId) return;
    
    setIsLoading(true);
    try {
      const response = await firecrawlApi.getCrawlStatus(crawlJobId);
      if (response.success) {
        setResult(response);
        toast({ 
          title: 'Status Updated', 
          description: `${response.completed || 0}/${response.total || '?'} pages crawled` 
        });
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to get status', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to check status', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleJob = async () => {
    if (!url) {
      toast({ title: 'Error', description: 'Please enter a URL', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    
    try {
      const response = await firecrawlApi.scheduleJob({
        url,
        extractionType: extractionType !== 'none' ? extractionType : undefined,
        scheduleType,
        webhookUrl: webhookUrl || undefined,
      });
      
      if (response.success) {
        toast({ title: 'Success', description: response.message || 'Job scheduled successfully' });
        loadScheduledJobs();
        setUrl('');
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to schedule job', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to schedule job', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await firecrawlApi.deleteScheduledJob(jobId);
      if (response.success) {
        toast({ title: 'Success', description: 'Job deleted' });
        loadScheduledJobs();
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to delete job', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete job', variant: 'destructive' });
    }
  };

  const extractionOptions: { value: ExtractionType | 'none'; label: string }[] = [
    { value: 'none', label: 'No extraction (raw content)' },
    { value: 'product', label: 'Product details' },
    { value: 'article', label: 'Article content' },
    { value: 'contact', label: 'Contact information' },
    { value: 'pricing', label: 'Pricing tables' },
    { value: 'table', label: 'Table data' },
    { value: 'navigation', label: 'Navigation structure' },
  ];

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Web Crawler & Scraper
        </CardTitle>
        <CardDescription>
          Scrape URLs into structured JSON, crawl websites, extract data, and schedule recurring jobs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="scrape" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Scrape
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              Search
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-1">
              <Map className="h-3 w-3" />
              Map
            </TabsTrigger>
            <TabsTrigger value="crawl" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Crawl
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scrape" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>URL to Scrape</Label>
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Extraction Type</Label>
                <Select value={extractionType} onValueChange={(v) => setExtractionType(v as ExtractionType | 'none')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {extractionOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Wait for JavaScript</Label>
                  <Switch checked={waitForJs} onCheckedChange={setWaitForJs} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Include Screenshot</Label>
                  <Switch checked={includeScreenshot} onCheckedChange={setIncludeScreenshot} />
                </div>
              </div>
            </div>

            {extractionType !== 'none' && (
              <div className="space-y-2">
                <Label>Custom Extraction Prompt (optional)</Label>
                <Input
                  placeholder="Extract specific fields like..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={handleScrape} disabled={isLoading} className="flex-1">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Code className="h-4 w-4 mr-2" />}
                Scrape
              </Button>
              <Button onClick={handleExtractBranding} disabled={isLoading} variant="outline">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Palette className="h-4 w-4 mr-2" />}
                Branding
              </Button>
              <Button onClick={handleSummarize} disabled={isLoading} variant="outline">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                Summarize
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Search Query</Label>
              <Input
                placeholder="luxury concierge services"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search Web
            </Button>
          </TabsContent>

          <TabsContent value="map" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Quickly discover all URLs on a website including sitemaps, subpages, and navigation links
            </p>
            <Button onClick={handleMap} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Map className="h-4 w-4 mr-2" />}
              Map Site URLs
            </Button>
          </TabsContent>

          <TabsContent value="crawl" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Page Limit</Label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={crawlLimit}
                  onChange={(e) => setCrawlLimit(parseInt(e.target.value) || 50)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Depth</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(parseInt(e.target.value) || 3)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Include Paths (comma-separated)</Label>
                <Input
                  placeholder="/blog, /products"
                  value={includePaths}
                  onChange={(e) => setIncludePaths(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Exclude Paths (comma-separated)</Label>
                <Input
                  placeholder="/admin, /login"
                  value={excludePaths}
                  onChange={(e) => setExcludePaths(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Structured Extraction (for each page)</Label>
              <Select value={extractionType} onValueChange={(v) => setExtractionType(v as ExtractionType | 'none')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {extractionOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCrawl} disabled={isLoading} className="flex-1">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Start Crawl
              </Button>
              {crawlJobId && (
                <Button onClick={handleCheckCrawlStatus} disabled={isLoading} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Status
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Create Scheduled Job
              </h4>
              
              <div className="space-y-2">
                <Label>URL to Monitor</Label>
                <Input
                  placeholder="https://example.com/products"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Extraction Type</Label>
                  <Select value={extractionType} onValueChange={(v) => setExtractionType(v as ExtractionType | 'none')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {extractionOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={scheduleType} onValueChange={(v) => setScheduleType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Webhook URL (optional)</Label>
                <Input
                  placeholder="https://your-app.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              
              <Button onClick={handleScheduleJob} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
                Schedule Job
              </Button>
            </div>

            {scheduledJobs.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Active Jobs</h4>
                {scheduledJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate max-w-[300px]">{job.url}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{job.schedule_type}</Badge>
                        {job.extraction_type && <Badge variant="secondary">{job.extraction_type}</Badge>}
                        <span>Runs: {job.run_count}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Results
              </h4>
              <Badge variant="outline">{activeTab}</Badge>
            </div>
            <ScrollArea className="h-[400px] rounded-md border border-border/50 p-4">
              {/* Scrape results */}
              {activeTab === 'scrape' && (
                <div className="space-y-4">
                  {result.data?.json && (
                    <div className="space-y-2">
                      <Label className="text-primary">Extracted Data (JSON)</Label>
                      <pre className="bg-muted/50 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data.json, null, 2)}
                      </pre>
                    </div>
                  )}
                  {result.data?.branding && (
                    <div className="space-y-2">
                      <Label className="text-primary">Branding</Label>
                      <pre className="bg-muted/50 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data.branding, null, 2)}
                      </pre>
                    </div>
                  )}
                  {result.data?.summary && (
                    <div className="space-y-2">
                      <Label className="text-primary">Summary</Label>
                      <p className="text-sm">{result.data.summary}</p>
                    </div>
                  )}
                  {result.data?.screenshot && (
                    <div className="space-y-2">
                      <Label className="text-primary">Screenshot</Label>
                      <img 
                        src={`data:image/png;base64,${result.data.screenshot}`} 
                        alt="Page screenshot" 
                        className="rounded border max-w-full"
                      />
                    </div>
                  )}
                  {result.data?.markdown && !result.data?.json && !result.data?.branding && !result.data?.summary && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-xs">{result.data.markdown}</pre>
                    </div>
                  )}
                  {result.data?.metadata && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Metadata</Label>
                      <pre className="bg-muted/30 p-2 rounded text-xs">
                        {JSON.stringify(result.data.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              
              {/* Search results */}
              {activeTab === 'search' && result.data && Array.isArray(result.data) && (
                <div className="space-y-3">
                  {result.data.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-muted/50 space-y-1">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        {item.title || item.url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Map results */}
              {activeTab === 'map' && result.links && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground mb-3">
                    Found {result.links.length} URLs
                  </p>
                  {result.links.map((link: string, idx: number) => (
                    <a 
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary py-1"
                    >
                      <Link className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{link}</span>
                    </a>
                  ))}
                </div>
              )}
              
              {/* Crawl results */}
              {activeTab === 'crawl' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold">{result.completed || 0}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold">{result.total || '?'}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold capitalize">{result.status}</p>
                      <p className="text-xs text-muted-foreground">Status</p>
                    </div>
                  </div>
                  
                  {result.id && (
                    <p className="text-xs text-muted-foreground">
                      Job ID: <code className="bg-muted px-1 rounded">{result.id}</code>
                    </p>
                  )}
                  
                  {result.data && result.data.length > 0 && (
                    <div className="space-y-2">
                      <Label>Crawled Pages</Label>
                      {result.data.slice(0, 10).map((page: any, idx: number) => (
                        <div key={idx} className="p-2 bg-muted/30 rounded text-sm">
                          <a 
                            href={page.metadata?.sourceURL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {page.metadata?.title || page.metadata?.sourceURL}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          {page.json && (
                            <pre className="mt-2 text-xs bg-muted/50 p-2 rounded overflow-auto">
                              {JSON.stringify(page.json, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                      {result.data.length > 10 && (
                        <p className="text-xs text-muted-foreground">
                          ...and {result.data.length - 10} more pages
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
