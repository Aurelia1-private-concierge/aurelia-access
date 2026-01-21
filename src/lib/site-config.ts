/**
 * Centralized Site Configuration
 * 
 * All domain and URL references should use this configuration
 * to ensure consistency across the application.
 */

export const SITE_CONFIG = {
  // Primary domains
  productionDomain: 'https://aurelia-privateconcierge.com',
  stagingDomain: 'https://aureliaprivateconcierge.lovable.app',
  previewDomain: 'https://id-preview--d6b1aa67-0275-4e1e-870d-b637562af4e0.lovable.app',
  
  // Legacy domains (for migration tracking)
  legacyDomains: [
    'aurelia-access.lovable.app',
  ],
  
  // Brand information
  brand: {
    name: 'Aurelia Private Concierge',
    shortName: 'Aurelia',
    tagline: 'Ultra-Premium Lifestyle Management',
    company: 'Aurelia Holdings Ltd.',
  },
  
  // Contact information
  contact: {
    phone: '+44-7309-935106',
    email: 'concierge@aurelia-privateconcierge.com',
    supportEmail: 'support@aurelia-privateconcierge.com',
  },
  
  // Social media handles
  social: {
    linkedin: 'https://www.linkedin.com/company/aurelia-concierge',
    instagram: 'https://www.instagram.com/aurelia.concierge',
    twitter: 'https://twitter.com/AureliaConcierge',
  },
  
  // SEO defaults
  seo: {
    defaultTitle: 'Aurelia | #1 Private Concierge for Billionaires',
    defaultDescription: "The world's most exclusive private concierge for billionaires & UHNW families. 24/7 access to private jets, superyachts, off-market properties. By invitation only.",
    defaultImage: '/og-image-new.png',
    defaultKeywords: 'private concierge, luxury lifestyle, bespoke travel, VIP access, premium services, wealth management, exclusive experiences',
  },
  
  // Location
  location: {
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'GB-LND',
    coordinates: {
      latitude: 51.5074,
      longitude: -0.1278,
    },
  },
  
  // Service areas
  serviceAreas: ['GB', 'EU', 'US', 'AE', 'SG'],
  supportedLanguages: ['English', 'French', 'German', 'Arabic', 'Mandarin', 'Russian', 'Spanish', 'Italian'],
  
  /**
   * Check if currently running in production environment
   */
  isProduction: (): boolean => {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname;
    return hostname === 'aurelia-privateconcierge.com' || 
           hostname === 'www.aurelia-privateconcierge.com';
  },
  
  /**
   * Check if running on staging (lovable.app domain)
   */
  isStaging: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.location.hostname.includes('lovable.app');
  },
  
  /**
   * Check if running on preview domain
   */
  isPreview: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.location.hostname.includes('id-preview--');
  },
  
  /**
   * Get the appropriate base URL for the current environment
   */
  getBaseUrl: (): string => {
    if (typeof window === 'undefined') {
      return SITE_CONFIG.productionDomain;
    }
    
    if (SITE_CONFIG.isProduction()) {
      return SITE_CONFIG.productionDomain;
    }
    
    if (SITE_CONFIG.isPreview()) {
      return SITE_CONFIG.previewDomain;
    }
    
    if (SITE_CONFIG.isStaging()) {
      return SITE_CONFIG.stagingDomain;
    }
    
    // Default to current origin for local development
    return window.location.origin;
  },
  
  /**
   * Get the canonical URL for a given path
   */
  getCanonicalUrl: (path: string = ''): string => {
    const baseUrl = SITE_CONFIG.getBaseUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  },
  
  /**
   * Get the full URL for an asset (image, etc.)
   */
  getAssetUrl: (assetPath: string): string => {
    if (assetPath.startsWith('http')) {
      return assetPath;
    }
    const baseUrl = SITE_CONFIG.getBaseUrl();
    const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
    return `${baseUrl}${cleanPath}`;
  },
  
  /**
   * DNS Records required for custom domain
   */
  requiredDNSRecords: [
    {
      type: 'A',
      name: '@',
      value: '185.158.133.1',
      description: 'Root domain pointing to Lovable',
    },
    {
      type: 'A',
      name: 'www',
      value: '185.158.133.1',
      description: 'WWW subdomain pointing to Lovable',
    },
    {
      type: 'TXT',
      name: '_lovable',
      value: 'lovable_verify=...',
      description: 'Domain verification record',
    },
  ],
  
  /**
   * Expected security headers
   */
  securityHeaders: [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'X-XSS-Protection',
    'Referrer-Policy',
    'Permissions-Policy',
    'Strict-Transport-Security',
  ],
} as const;

export default SITE_CONFIG;
