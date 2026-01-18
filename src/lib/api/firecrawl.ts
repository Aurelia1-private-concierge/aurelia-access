import { supabase } from '@/integrations/supabase/client';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
  // Additional fields for specific responses
  id?: string;
  status?: string;
  completed?: number;
  total?: number;
  creditsUsed?: number;
  expiresAt?: string;
  links?: string[];
  message?: string;
};

type JsonExtractionFormat = {
  type: 'json';
  schema?: object;
  prompt?: string;
};

type ScrapeFormat = 
  | 'markdown' 
  | 'html' 
  | 'rawHtml' 
  | 'links' 
  | 'screenshot' 
  | 'branding' 
  | 'summary'
  | JsonExtractionFormat;

type ScrapeOptions = {
  formats?: ScrapeFormat[];
  onlyMainContent?: boolean;
  waitFor?: number;
  location?: { country?: string; languages?: string[] };
  // Advanced options for JS-heavy sites
  actions?: Array<{
    type: 'click' | 'scroll' | 'wait' | 'screenshot';
    selector?: string;
    milliseconds?: number;
  }>;
  // Cookie/popup handling
  removeTags?: string[];
  headers?: Record<string, string>;
};

type SearchOptions = {
  limit?: number;
  lang?: string;
  country?: string;
  tbs?: string; // Time filter: 'qdr:h' (hour), 'qdr:d' (day), 'qdr:w' (week), 'qdr:m' (month), 'qdr:y' (year)
  scrapeOptions?: { formats?: ('markdown' | 'html')[] };
};

type MapOptions = {
  search?: string;
  limit?: number;
  includeSubdomains?: boolean;
};

type CrawlOptions = {
  limit?: number;
  maxDepth?: number;
  includePaths?: string[];
  excludePaths?: string[];
  // Advanced crawl options
  scrapeOptions?: {
    formats?: ScrapeFormat[];
    onlyMainContent?: boolean;
    waitFor?: number;
  };
};

// Structured data extraction schemas
export const extractionSchemas = {
  product: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      price: { type: 'string' },
      currency: { type: 'string' },
      description: { type: 'string' },
      images: { type: 'array', items: { type: 'string' } },
      availability: { type: 'string' },
      brand: { type: 'string' },
      sku: { type: 'string' },
      rating: { type: 'number' },
      reviewCount: { type: 'number' },
    },
  },
  article: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      author: { type: 'string' },
      publishDate: { type: 'string' },
      content: { type: 'string' },
      summary: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      images: { type: 'array', items: { type: 'string' } },
    },
  },
  contact: {
    type: 'object',
    properties: {
      companyName: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      address: { type: 'string' },
      socialLinks: { 
        type: 'object',
        properties: {
          linkedin: { type: 'string' },
          twitter: { type: 'string' },
          facebook: { type: 'string' },
          instagram: { type: 'string' },
        }
      },
    },
  },
  pricing: {
    type: 'object',
    properties: {
      plans: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'string' },
            period: { type: 'string' },
            features: { type: 'array', items: { type: 'string' } },
            cta: { type: 'string' },
          }
        }
      }
    }
  },
  table: {
    type: 'object',
    properties: {
      headers: { type: 'array', items: { type: 'string' } },
      rows: { 
        type: 'array', 
        items: { 
          type: 'array', 
          items: { type: 'string' } 
        } 
      },
    },
  },
  navigation: {
    type: 'object',
    properties: {
      mainMenu: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            url: { type: 'string' },
            children: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  url: { type: 'string' },
                }
              }
            }
          }
        }
      },
      footerLinks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            links: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  url: { type: 'string' },
                }
              }
            }
          }
        }
      }
    }
  },
};

export type ExtractionType = keyof typeof extractionSchemas;

export const firecrawlApi = {
  // Scrape a single URL with advanced options
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Scrape with structured JSON extraction
  async scrapeStructured(
    url: string, 
    extractionType: ExtractionType | 'custom',
    customSchema?: object,
    customPrompt?: string
  ): Promise<FirecrawlResponse> {
    const schema = extractionType === 'custom' ? customSchema : extractionSchemas[extractionType];
    
    const formats: ScrapeFormat[] = [
      'markdown',
      { 
        type: 'json', 
        schema,
        prompt: customPrompt
      }
    ];

    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { 
        url, 
        options: { 
          formats,
          onlyMainContent: true,
          waitFor: 2000, // Wait for JS content
        } 
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Extract branding/design system from a site
  async extractBranding(url: string): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { 
        url, 
        options: { 
          formats: ['branding', 'screenshot'],
          onlyMainContent: false,
        } 
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Get AI summary of a page
  async summarize(url: string): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { 
        url, 
        options: { 
          formats: ['summary', 'markdown'],
          onlyMainContent: true,
        } 
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Search the web and optionally scrape results
  async search(query: string, options?: SearchOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Map a website to discover all URLs (fast sitemap)
  async map(url: string, options?: MapOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-map', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Crawl an entire website with advanced options
  async crawl(url: string, options?: CrawlOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-crawl', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Crawl with structured extraction for all pages
  async crawlStructured(
    url: string,
    extractionType: ExtractionType,
    crawlOptions?: Omit<CrawlOptions, 'scrapeOptions'>
  ): Promise<FirecrawlResponse> {
    const schema = extractionSchemas[extractionType];
    
    const { data, error } = await supabase.functions.invoke('firecrawl-crawl', {
      body: { 
        url, 
        options: {
          ...crawlOptions,
          scrapeOptions: {
            formats: ['markdown', { type: 'json', schema }],
            onlyMainContent: true,
            waitFor: 2000,
          }
        } 
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Get crawl job status
  async getCrawlStatus(jobId: string): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-crawl-status', {
      body: { jobId },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Schedule a recurring scrape job
  async scheduleJob(config: {
    url: string;
    extractionType?: ExtractionType;
    customSchema?: object;
    scheduleType: 'hourly' | 'daily' | 'weekly' | 'monthly';
    webhookUrl?: string;
  }): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-schedule', {
      body: config,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Get all scheduled jobs
  async getScheduledJobs(): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-schedule', {
      body: { action: 'list' },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Delete a scheduled job
  async deleteScheduledJob(jobId: string): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-schedule', {
      body: { action: 'delete', jobId },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
