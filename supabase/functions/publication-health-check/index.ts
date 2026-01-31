import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DiagnosticCheck {
  id: string;
  category: "dns" | "ssl" | "cdn" | "security" | "seo";
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  details?: string;
}

interface HealthCheckResult {
  domain: string;
  overall_status: "healthy" | "warning" | "critical" | "unknown";
  checks: DiagnosticCheck[];
  recommendations: string[];
  triggered_by: "scheduled" | "manual" | "auto";
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, triggered_by = "scheduled", notify_admins = true } = await req.json().catch(() => ({}));

    // Default to production domain
    const targetDomain = domain || "aurelia-privateconcierge.com";

    console.log(`[publication-health-check] Starting health check for ${targetDomain}`);

    const checks: DiagnosticCheck[] = [];
    const recommendations: string[] = [];

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. DNS Check - Verify domain resolves
    try {
      const dnsResponse = await fetch(`https://${targetDomain}`, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });

      if (dnsResponse.ok) {
        checks.push({
          id: "dns-resolution",
          category: "dns",
          name: "DNS Resolution",
          status: "pass",
          message: `Domain ${targetDomain} resolves successfully`,
        });
      } else {
        checks.push({
          id: "dns-resolution",
          category: "dns",
          name: "DNS Resolution",
          status: "warn",
          message: `Domain returned status ${dnsResponse.status}`,
          details: `HTTP Status: ${dnsResponse.status} ${dnsResponse.statusText}`,
        });
        recommendations.push("Check DNS configuration and server response");
      }
    } catch (error) {
      checks.push({
        id: "dns-resolution",
        category: "dns",
        name: "DNS Resolution",
        status: "fail",
        message: "Domain is not reachable",
        details: error instanceof Error ? error.message : "Unknown error",
      });
      recommendations.push("Verify DNS A record points to correct IP");
    }

    // 2. SSL Check - Verify HTTPS works
    try {
      const sslResponse = await fetch(`https://${targetDomain}`, {
        method: "HEAD",
        signal: AbortSignal.timeout(10000),
      });

      const securityHeaders = {
        "strict-transport-security": sslResponse.headers.get("strict-transport-security"),
        "content-security-policy": sslResponse.headers.get("content-security-policy"),
      };

      if (sslResponse.ok) {
        checks.push({
          id: "ssl-valid",
          category: "ssl",
          name: "SSL Certificate",
          status: "pass",
          message: "SSL certificate is valid",
        });

        // Check HSTS header
        if (securityHeaders["strict-transport-security"]) {
          checks.push({
            id: "ssl-hsts",
            category: "ssl",
            name: "HSTS Header",
            status: "pass",
            message: "HSTS is enabled",
          });
        } else {
          checks.push({
            id: "ssl-hsts",
            category: "ssl",
            name: "HSTS Header",
            status: "warn",
            message: "HSTS header is not set",
            details: "Consider adding Strict-Transport-Security header",
          });
          recommendations.push("Enable HSTS header for enhanced security");
        }
      }
    } catch (error) {
      checks.push({
        id: "ssl-valid",
        category: "ssl",
        name: "SSL Certificate",
        status: "fail",
        message: "SSL certificate issue detected",
        details: error instanceof Error ? error.message : "Unknown error",
      });
      recommendations.push("Review SSL certificate configuration");
    }

    // 3. CDN/Cache Check
    try {
      const cdnResponse = await fetch(`https://${targetDomain}`, {
        method: "GET",
        headers: { "Accept": "text/html" },
        signal: AbortSignal.timeout(10000),
      });

      const cacheControl = cdnResponse.headers.get("cache-control");
      const cfRay = cdnResponse.headers.get("cf-ray");
      const xCache = cdnResponse.headers.get("x-cache");

      // Check if CDN is active
      if (cfRay) {
        checks.push({
          id: "cdn-active",
          category: "cdn",
          name: "CDN Active",
          status: "pass",
          message: "Cloudflare CDN is active",
          details: `CF-Ray: ${cfRay}`,
        });
      } else if (xCache) {
        checks.push({
          id: "cdn-active",
          category: "cdn",
          name: "CDN Active",
          status: "pass",
          message: "CDN caching detected",
          details: `X-Cache: ${xCache}`,
        });
      } else {
        checks.push({
          id: "cdn-active",
          category: "cdn",
          name: "CDN Active",
          status: "warn",
          message: "No CDN headers detected",
          details: "Consider using a CDN for better performance",
        });
        recommendations.push("Configure CDN for improved global performance");
      }

      // Check cache headers
      if (cacheControl && cacheControl.includes("max-age")) {
        checks.push({
          id: "cdn-cache",
          category: "cdn",
          name: "Cache Headers",
          status: "pass",
          message: "Cache-Control headers are set",
          details: `Cache-Control: ${cacheControl}`,
        });
      } else {
        checks.push({
          id: "cdn-cache",
          category: "cdn",
          name: "Cache Headers",
          status: "warn",
          message: "Cache-Control headers not optimized",
          details: cacheControl || "No Cache-Control header",
        });
        recommendations.push("Optimize Cache-Control headers for static assets");
      }
    } catch (error) {
      checks.push({
        id: "cdn-active",
        category: "cdn",
        name: "CDN Check",
        status: "fail",
        message: "Unable to check CDN status",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // 4. SEO Check - Verify meta tags and structured data
    try {
      const seoResponse = await fetch(`https://${targetDomain}`, {
        method: "GET",
        headers: {
          "Accept": "text/html",
          "User-Agent": "Aurelia-HealthCheck/1.0",
        },
        signal: AbortSignal.timeout(15000),
      });

      const html = await seoResponse.text();

      // Check for title tag
      const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(html);
      checks.push({
        id: "seo-title",
        category: "seo",
        name: "Title Tag",
        status: hasTitle ? "pass" : "fail",
        message: hasTitle ? "Title tag is present" : "Title tag is missing",
      });

      // Check for meta description
      const hasMetaDesc = /<meta[^>]*name=["']description["'][^>]*>/i.test(html);
      checks.push({
        id: "seo-description",
        category: "seo",
        name: "Meta Description",
        status: hasMetaDesc ? "pass" : "warn",
        message: hasMetaDesc ? "Meta description is present" : "Meta description is missing",
      });

      // Check for OG tags
      const hasOgImage = /<meta[^>]*property=["']og:image["'][^>]*>/i.test(html);
      checks.push({
        id: "seo-og-image",
        category: "seo",
        name: "OG Image",
        status: hasOgImage ? "pass" : "warn",
        message: hasOgImage ? "Open Graph image is set" : "Open Graph image is missing",
      });

      // Check for canonical URL
      const hasCanonical = /<link[^>]*rel=["']canonical["'][^>]*>/i.test(html);
      checks.push({
        id: "seo-canonical",
        category: "seo",
        name: "Canonical URL",
        status: hasCanonical ? "pass" : "warn",
        message: hasCanonical ? "Canonical URL is set" : "Canonical URL is missing",
      });

      // Check for structured data
      const hasJsonLd = /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html);
      checks.push({
        id: "seo-structured-data",
        category: "seo",
        name: "Structured Data",
        status: hasJsonLd ? "pass" : "warn",
        message: hasJsonLd ? "JSON-LD structured data found" : "No structured data detected",
      });

      if (!hasMetaDesc || !hasOgImage || !hasCanonical) {
        recommendations.push("Complete all SEO meta tags for better search visibility");
      }
    } catch (error) {
      checks.push({
        id: "seo-check",
        category: "seo",
        name: "SEO Analysis",
        status: "fail",
        message: "Unable to analyze SEO",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Determine overall status
    const failCount = checks.filter((c) => c.status === "fail").length;
    const warnCount = checks.filter((c) => c.status === "warn").length;

    let overall_status: HealthCheckResult["overall_status"];
    if (failCount > 0) {
      overall_status = "critical";
    } else if (warnCount > 2) {
      overall_status = "warning";
    } else if (warnCount > 0) {
      overall_status = "warning";
    } else {
      overall_status = "healthy";
    }

    const result: HealthCheckResult = {
      domain: targetDomain,
      overall_status,
      checks,
      recommendations,
      triggered_by: triggered_by as "scheduled" | "manual" | "auto",
    };

    // Store result in database
    const { error: insertError } = await supabase
      .from("publication_health_logs")
      .insert({
        domain: result.domain,
        overall_status: result.overall_status,
        checks: result.checks,
        recommendations: result.recommendations,
        triggered_by: result.triggered_by,
      });

    if (insertError) {
      console.error("[publication-health-check] Failed to store result:", insertError);
    }

    // Notify admins if critical issues found
    if (notify_admins && overall_status === "critical") {
      const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
      const resendApiKey = Deno.env.get("RESEND_API_KEY");

      if (adminEmail && resendApiKey) {
        try {
          const failedChecks = checks.filter((c) => c.status === "fail");
          const emailBody = `
            <h2>🚨 Critical Infrastructure Issue Detected</h2>
            <p><strong>Domain:</strong> ${targetDomain}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <h3>Failed Checks:</h3>
            <ul>
              ${failedChecks.map((c) => `<li><strong>${c.name}</strong>: ${c.message}</li>`).join("")}
            </ul>
            <h3>Recommendations:</h3>
            <ul>
              ${recommendations.map((r) => `<li>${r}</li>`).join("")}
            </ul>
            <p><a href="https://aureliaprivateconcierge.lovable.app/admin?tab=publication">View in Admin Dashboard</a></p>
          `;

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Aurelia Health Monitor <concierge@aurelia-privateconcierge.com>",
              to: [adminEmail],
              subject: `🚨 Critical: ${targetDomain} Infrastructure Alert`,
              html: emailBody,
            }),
          });

          if (!emailResponse.ok) {
            console.error("[publication-health-check] Failed to send admin alert email");
          } else {
            console.log("[publication-health-check] Admin alert email sent");
          }
        } catch (emailError) {
          console.error("[publication-health-check] Error sending admin email:", emailError);
        }
      }
    }

    console.log(`[publication-health-check] Completed: ${overall_status}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[publication-health-check] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
