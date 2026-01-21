import { corsHeaders, createSuccessResponse, createErrorResponse } from '../_shared/error-handler.ts';

interface DiagnosticCheck {
  id: string;
  category: 'dns' | 'ssl' | 'cdn' | 'security' | 'seo';
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: string;
  fix?: string;
  autoFixable: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();
    
    if (!domain) {
      return createErrorResponse('Domain is required', 'validation_error', 400);
    }

    console.log(`[publication-diagnostics] Running diagnostics for domain: ${domain}`);

    const checks: DiagnosticCheck[] = [];
    const fullDomain = domain.startsWith('http') ? domain : `https://${domain}`;

    // 1. DNS Check - Try to fetch the domain
    try {
      const dnsCheck = await fetch(fullDomain, {
        method: 'HEAD',
        redirect: 'follow',
      });

      if (dnsCheck.ok) {
        checks.push({
          id: 'dns-reachable',
          category: 'dns',
          name: 'Domain Reachability',
          status: 'pass',
          message: `Domain is reachable (${dnsCheck.status})`,
          autoFixable: false,
        });

        // Check SSL
        if (dnsCheck.url.startsWith('https://')) {
          checks.push({
            id: 'ssl-valid',
            category: 'ssl',
            name: 'SSL Certificate',
            status: 'pass',
            message: 'SSL certificate is valid',
            autoFixable: false,
          });
        } else {
          checks.push({
            id: 'ssl-valid',
            category: 'ssl',
            name: 'SSL Certificate',
            status: 'fail',
            message: 'Site not served over HTTPS',
            fix: 'Ensure SSL certificate is provisioned',
            autoFixable: false,
          });
        }

        // Check security headers
        const securityHeaders = [
          'x-frame-options',
          'x-content-type-options',
          'x-xss-protection',
          'content-security-policy',
          'referrer-policy',
          'strict-transport-security',
        ];

        const presentHeaders = securityHeaders.filter(h => dnsCheck.headers.has(h));
        const missingHeaders = securityHeaders.filter(h => !dnsCheck.headers.has(h));

        if (missingHeaders.length === 0) {
          checks.push({
            id: 'security-headers',
            category: 'security',
            name: 'Security Headers',
            status: 'pass',
            message: `All ${securityHeaders.length} security headers present`,
            autoFixable: false,
          });
        } else if (presentHeaders.length >= 3) {
          checks.push({
            id: 'security-headers',
            category: 'security',
            name: 'Security Headers',
            status: 'warn',
            message: `${presentHeaders.length}/${securityHeaders.length} security headers present`,
            details: `Missing: ${missingHeaders.join(', ')}`,
            fix: 'Add missing security headers in _headers file',
            autoFixable: true,
          });
        } else {
          checks.push({
            id: 'security-headers',
            category: 'security',
            name: 'Security Headers',
            status: 'fail',
            message: 'Most security headers missing',
            details: `Missing: ${missingHeaders.join(', ')}`,
            fix: 'Configure security headers in _headers file',
            autoFixable: true,
          });
        }

        // Check CSP specifically
        const csp = dnsCheck.headers.get('content-security-policy');
        if (csp) {
          checks.push({
            id: 'csp-header',
            category: 'security',
            name: 'Content Security Policy',
            status: 'pass',
            message: 'CSP header is configured',
            autoFixable: false,
          });
        } else {
          checks.push({
            id: 'csp-header',
            category: 'security',
            name: 'Content Security Policy',
            status: 'warn',
            message: 'CSP header not found',
            fix: 'Add Content-Security-Policy header',
            autoFixable: true,
          });
        }

        // Check cache headers
        const cacheControl = dnsCheck.headers.get('cache-control');
        if (cacheControl) {
          if (cacheControl.includes('no-cache') || cacheControl.includes('must-revalidate')) {
            checks.push({
              id: 'cdn-cache',
              category: 'cdn',
              name: 'CDN Cache Headers',
              status: 'pass',
              message: 'Cache-Control header properly configured',
              details: cacheControl,
              autoFixable: false,
            });
          } else if (cacheControl.includes('max-age')) {
            checks.push({
              id: 'cdn-cache',
              category: 'cdn',
              name: 'CDN Cache Headers',
              status: 'pass',
              message: 'Cache-Control with max-age set',
              details: cacheControl,
              autoFixable: false,
            });
          }
        } else {
          checks.push({
            id: 'cdn-cache',
            category: 'cdn',
            name: 'CDN Cache Headers',
            status: 'warn',
            message: 'No Cache-Control header found',
            fix: 'Configure cache headers for optimal performance',
            autoFixable: true,
          });
        }

      } else {
        checks.push({
          id: 'dns-reachable',
          category: 'dns',
          name: 'Domain Reachability',
          status: 'fail',
          message: `Domain returned status ${dnsCheck.status}`,
          fix: 'Check DNS configuration and ensure domain points to correct IP',
          autoFixable: false,
        });
      }
    } catch (dnsError) {
      console.error('[publication-diagnostics] DNS check error:', dnsError);
      checks.push({
        id: 'dns-reachable',
        category: 'dns',
        name: 'Domain Reachability',
        status: 'fail',
        message: 'Unable to reach domain',
        details: dnsError instanceof Error ? dnsError.message : 'Unknown error',
        fix: 'Verify DNS A record points to 185.158.133.1',
        autoFixable: false,
      });
    }

    // 2. Check SEO - Fetch HTML and parse meta tags
    try {
      const htmlResponse = await fetch(fullDomain, {
        headers: {
          'User-Agent': 'Aurelia-Diagnostics/1.0',
        },
      });

      if (htmlResponse.ok) {
        const html = await htmlResponse.text();

        // Check canonical URL
        const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
        if (canonicalMatch) {
          const canonicalUrl = canonicalMatch[1];
          if (canonicalUrl.includes(domain) || canonicalUrl.includes('aurelia-privateconcierge.com')) {
            checks.push({
              id: 'seo-canonical',
              category: 'seo',
              name: 'Canonical URL',
              status: 'pass',
              message: 'Canonical URL correctly set',
              details: canonicalUrl,
              autoFixable: false,
            });
          } else {
            checks.push({
              id: 'seo-canonical',
              category: 'seo',
              name: 'Canonical URL',
              status: 'warn',
              message: 'Canonical URL may be incorrect',
              details: `Found: ${canonicalUrl}`,
              fix: 'Update canonical URL to use production domain',
              autoFixable: true,
            });
          }
        } else {
          checks.push({
            id: 'seo-canonical',
            category: 'seo',
            name: 'Canonical URL',
            status: 'warn',
            message: 'No canonical URL found',
            fix: 'Add canonical link tag',
            autoFixable: true,
          });
        }

        // Check OG image
        const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        if (ogImageMatch) {
          const ogImage = ogImageMatch[1];
          try {
            const imageCheck = await fetch(ogImage, { method: 'HEAD' });
            if (imageCheck.ok) {
              checks.push({
                id: 'seo-og-image',
                category: 'seo',
                name: 'Open Graph Image',
                status: 'pass',
                message: 'OG image is accessible',
                details: ogImage,
                autoFixable: false,
              });
            } else {
              checks.push({
                id: 'seo-og-image',
                category: 'seo',
                name: 'Open Graph Image',
                status: 'fail',
                message: `OG image returned ${imageCheck.status}`,
                details: ogImage,
                fix: 'Ensure OG image URL is valid and accessible',
                autoFixable: true,
              });
            }
          } catch {
            checks.push({
              id: 'seo-og-image',
              category: 'seo',
              name: 'Open Graph Image',
              status: 'warn',
              message: 'Could not verify OG image accessibility',
              details: ogImage,
              autoFixable: false,
            });
          }
        } else {
          checks.push({
            id: 'seo-og-image',
            category: 'seo',
            name: 'Open Graph Image',
            status: 'warn',
            message: 'No OG image meta tag found',
            fix: 'Add og:image meta tag',
            autoFixable: true,
          });
        }

        // Check structured data
        const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
        if (jsonLdMatches && jsonLdMatches.length > 0) {
          checks.push({
            id: 'seo-structured-data',
            category: 'seo',
            name: 'Structured Data',
            status: 'pass',
            message: `${jsonLdMatches.length} structured data block(s) found`,
            autoFixable: false,
          });
        } else {
          checks.push({
            id: 'seo-structured-data',
            category: 'seo',
            name: 'Structured Data',
            status: 'warn',
            message: 'No structured data (JSON-LD) found',
            fix: 'Add Organization and LocalBusiness schema',
            autoFixable: true,
          });
        }
      }
    } catch (seoError) {
      console.error('[publication-diagnostics] SEO check error:', seoError);
    }

    console.log(`[publication-diagnostics] Completed ${checks.length} checks for ${domain}`);

    return createSuccessResponse({
      domain,
      timestamp: new Date().toISOString(),
      checks,
      summary: {
        total: checks.length,
        passed: checks.filter(c => c.status === 'pass').length,
        warnings: checks.filter(c => c.status === 'warn').length,
        failures: checks.filter(c => c.status === 'fail').length,
      },
    });

  } catch (error) {
    console.error('[publication-diagnostics] Error:', error);
    return createErrorResponse(error, 'server_error', 500, 'publication-diagnostics');
  }
});
