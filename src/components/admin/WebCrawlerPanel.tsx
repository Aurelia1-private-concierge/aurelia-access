import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { Globe, Search, Map, Loader2, FileText, Link, ExternalLink } from 'lucide-react';

export const WebCrawlerPanel = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('scrape');
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [crawlLimit, setCrawlLimit] = useState(50);

  const handleScrape = async () => {
    if (!url) {
      toast({ title: 'Error', description: 'Please enter a URL', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await firecrawlApi.scrape(url, { formats: ['markdown', 'links'] });
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
      const response = await firecrawlApi.map(url, { limit: 100 });
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
    try {
      const response = await firecrawlApi.crawl(url, { limit: crawlLimit });
      if (response.success) {
        toast({ title: 'Crawl Started', description: 'The crawl job has been initiated' });
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

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Web Crawler
        </CardTitle>
        <CardDescription>
          Scrape, search, map, and crawl websites using Firecrawl
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
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
            <Button onClick={handleScrape} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Scrape Page
            </Button>
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
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
            <Button onClick={handleMap} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
            <Button onClick={handleCrawl} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Start Crawl
            </Button>
          </TabsContent>
        </Tabs>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Results</h4>
              <Badge variant="outline">{activeTab}</Badge>
            </div>
            <ScrollArea className="h-[300px] rounded-md border border-border/50 p-4">
              {activeTab === 'scrape' && result.data?.markdown && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-xs">{result.data.markdown}</pre>
                </div>
              )}
              {activeTab === 'search' && result.data && (
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
              {activeTab === 'map' && result.links && (
                <div className="space-y-1">
                  {result.links.map((link: string, idx: number) => (
                    <a 
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                    >
                      <Link className="h-3 w-3" />
                      {link}
                    </a>
                  ))}
                </div>
              )}
              {activeTab === 'crawl' && (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Status:</span> {result.status}
                  </p>
                  {result.id && (
                    <p className="text-sm">
                      <span className="font-medium">Job ID:</span> {result.id}
                    </p>
                  )}
                  {result.data && (
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
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
