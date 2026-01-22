import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VettingRequest {
  application_id: string;
  company_name: string;
  website?: string;
  email: string;
  description?: string;
  categories: string[];
  experience_years?: number;
  notable_clients?: string;
  coverage_regions?: string[];
}

interface RiskIndicator {
  type: 'critical' | 'warning' | 'info';
  category: string;
  description: string;
  score_impact: number;
}

interface VettingResult {
  overall_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  verification_checks: {
    website_analysis: WebsiteAnalysis | null;
    business_legitimacy: BusinessLegitimacy;
    fraud_detection: FraudDetection;
    category_fit: CategoryFit;
    contact_verification: ContactVerification;
  };
  risk_indicators: RiskIndicator[];
  ai_recommendation: 'approve' | 'manual_review' | 'reject';
  recommendation_reason: string;
  auto_vetting_items: Record<string, boolean>;
}

interface WebsiteAnalysis {
  is_accessible: boolean;
  has_ssl: boolean;
  domain_age_indicator: 'new' | 'established' | 'unknown';
  professional_score: number;
  content_relevance: number;
  contact_info_found: boolean;
  social_presence: string[];
}

interface BusinessLegitimacy {
  company_mentioned_online: boolean;
  consistent_branding: boolean;
  address_verifiable: boolean;
  phone_format_valid: boolean;
  registration_indicators: string[];
}

interface FraudDetection {
  email_domain_match: boolean;
  disposable_email: boolean;
  suspicious_patterns: string[];
  duplicate_application: boolean;
  blacklist_match: boolean;
}

interface CategoryFit {
  primary_category_match: number;
  service_alignment: number;
  experience_credibility: number;
  market_presence: number;
}

interface ContactVerification {
  email_format_valid: boolean;
  email_domain_exists: boolean;
  phone_format_valid: boolean;
  professional_email: boolean;
}

// Known disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
  'mailinator.com', 'yopmail.com', 'temp-mail.org', 'fakeinbox.com',
  'trashmail.com', 'getnada.com', 'maildrop.cc', 'sharklasers.com'
];

// Suspicious patterns in company names
const SUSPICIOUS_PATTERNS = [
  /test/i, /fake/i, /demo/i, /sample/i, /asdf/i, /qwerty/i,
  /123456/i, /xxxxx/i, /aaaaa/i
];

function validateEmail(email: string): { valid: boolean; professional: boolean } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = emailRegex.test(email);
  
  const domain = email.split('@')[1]?.toLowerCase() || '';
  const freeEmailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
  const professional = valid && !freeEmailProviders.includes(domain) && !DISPOSABLE_EMAIL_DOMAINS.includes(domain);
  
  return { valid, professional };
}

function validatePhoneFormat(phone: string | null): boolean {
  if (!phone) return false;
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Check if it's a reasonable phone number (7-15 digits, optionally starting with +)
  return /^\+?\d{7,15}$/.test(cleaned);
}

function checkSuspiciousPatterns(text: string): string[] {
  const found: string[] = [];
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      found.push(`Matches suspicious pattern: ${pattern.source}`);
    }
  }
  return found;
}

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

async function checkWebsite(website: string | undefined): Promise<WebsiteAnalysis | null> {
  if (!website) return null;

  try {
    // Normalize URL
    let url = website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AureliaPartnerBot/1.0)'
      }
    });

    clearTimeout(timeoutId);

    const hasSSL = url.startsWith('https://');
    const isAccessible = response.ok || response.status === 403; // 403 might be geo-blocked but site exists

    return {
      is_accessible: isAccessible,
      has_ssl: hasSSL,
      domain_age_indicator: 'unknown', // Would need WHOIS API for actual check
      professional_score: isAccessible ? (hasSSL ? 80 : 60) : 20,
      content_relevance: isAccessible ? 70 : 0,
      contact_info_found: isAccessible,
      social_presence: []
    };
  } catch (error) {
    console.error('Website check failed:', error);
    return {
      is_accessible: false,
      has_ssl: false,
      domain_age_indicator: 'unknown',
      professional_score: 0,
      content_relevance: 0,
      contact_info_found: false,
      social_presence: []
    };
  }
}

async function aiAnalysis(
  request: VettingRequest,
  websiteAnalysis: WebsiteAnalysis | null,
  apiKey: string
): Promise<{
  category_fit: CategoryFit;
  business_signals: string[];
  recommendation: 'approve' | 'manual_review' | 'reject';
  recommendation_reason: string;
  experience_credibility: number;
}> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert business analyst specializing in vetting luxury service partners. 
Analyze the provided business information and provide a thorough assessment.
Be skeptical but fair - look for genuine business signals while identifying red flags.

Scoring guidelines:
- Experience credibility (0-100): Based on claimed years, notable clients, description quality
- Category match (0-100): How well they fit their stated category
- Service alignment (0-100): How their services align with luxury concierge needs
- Market presence (0-100): Evidence of established business operations`
          },
          {
            role: 'user',
            content: `Analyze this partner application:

Company: ${request.company_name}
Email: ${request.email}
Website: ${request.website || 'Not provided'}
Website accessible: ${websiteAnalysis?.is_accessible ? 'Yes' : 'No'}
Categories: ${request.categories.join(', ')}
Experience: ${request.experience_years || 'Not specified'} years
Description: ${request.description || 'Not provided'}
Notable clients: ${request.notable_clients || 'Not provided'}
Coverage regions: ${request.coverage_regions?.join(', ') || 'Not specified'}

Provide your analysis as JSON with this structure:
{
  "category_fit": {
    "primary_category_match": 0-100,
    "service_alignment": 0-100,
    "experience_credibility": 0-100,
    "market_presence": 0-100
  },
  "business_signals": ["list of positive or negative business signals identified"],
  "recommendation": "approve" | "manual_review" | "reject",
  "recommendation_reason": "brief explanation"
}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('AI analysis request failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        category_fit: parsed.category_fit || {
          primary_category_match: 50,
          service_alignment: 50,
          experience_credibility: 50,
          market_presence: 50
        },
        business_signals: parsed.business_signals || [],
        recommendation: parsed.recommendation || 'manual_review',
        recommendation_reason: parsed.recommendation_reason || 'AI analysis inconclusive',
        experience_credibility: parsed.category_fit?.experience_credibility || 50
      };
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      category_fit: {
        primary_category_match: 50,
        service_alignment: 50,
        experience_credibility: 50,
        market_presence: 50
      },
      business_signals: ['AI analysis unavailable - manual review required'],
      recommendation: 'manual_review',
      recommendation_reason: 'AI analysis could not be completed',
      experience_credibility: 50
    };
  }
}

async function checkDuplicateApplication(
  supabase: any,
  email: string,
  companyName: string,
  applicationId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('partner_applications')
      .select('id')
      .or(`email.eq.${email},company_name.ilike.%${companyName}%`)
      .neq('id', applicationId)
      .limit(1);

    if (error) {
      console.error('Duplicate check error:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (e) {
    console.error('Duplicate check failed:', e);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const request: VettingRequest = await req.json();

    if (!request.application_id || !request.company_name || !request.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting AI vetting for:', request.company_name);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Run checks in parallel for speed
    const [websiteAnalysis, duplicateCheck, aiAnalysisResult] = await Promise.all([
      checkWebsite(request.website),
      checkDuplicateApplication(supabase, request.email, request.company_name, request.application_id),
      aiAnalysis(request, null, LOVABLE_API_KEY) // Run initial AI analysis
    ]);

    // Get AI analysis with website data if available
    const finalAiAnalysis = websiteAnalysis?.is_accessible 
      ? await aiAnalysis(request, websiteAnalysis, LOVABLE_API_KEY)
      : aiAnalysisResult;

    // Contact verification
    const emailValidation = validateEmail(request.email);
    const emailDomainMatch = request.website 
      ? request.email.split('@')[1]?.toLowerCase().includes(
          new URL(request.website.startsWith('http') ? request.website : `https://${request.website}`).hostname.replace('www.', '')
        )
      : false;

    const contactVerification: ContactVerification = {
      email_format_valid: emailValidation.valid,
      email_domain_exists: true, // Would need DNS check for actual verification
      phone_format_valid: validatePhoneFormat(null), // Phone not in current interface
      professional_email: emailValidation.professional
    };

    // Fraud detection
    const suspiciousPatterns = [
      ...checkSuspiciousPatterns(request.company_name),
      ...checkSuspiciousPatterns(request.description || '')
    ];

    const fraudDetection: FraudDetection = {
      email_domain_match: emailDomainMatch,
      disposable_email: isDisposableEmail(request.email),
      suspicious_patterns: suspiciousPatterns,
      duplicate_application: duplicateCheck,
      blacklist_match: false // Would need blacklist database
    };

    // Business legitimacy
    const businessLegitimacy: BusinessLegitimacy = {
      company_mentioned_online: websiteAnalysis?.is_accessible || false,
      consistent_branding: emailDomainMatch,
      address_verifiable: false, // Would need address verification API
      phone_format_valid: false,
      registration_indicators: finalAiAnalysis.business_signals
    };

    // Calculate risk indicators
    const riskIndicators: RiskIndicator[] = [];

    if (fraudDetection.disposable_email) {
      riskIndicators.push({
        type: 'critical',
        category: 'Email',
        description: 'Disposable email address detected',
        score_impact: -30
      });
    }

    if (fraudDetection.duplicate_application) {
      riskIndicators.push({
        type: 'warning',
        category: 'Application',
        description: 'Possible duplicate application found',
        score_impact: -15
      });
    }

    if (!websiteAnalysis?.is_accessible && request.website) {
      riskIndicators.push({
        type: 'warning',
        category: 'Website',
        description: 'Website not accessible or invalid',
        score_impact: -10
      });
    }

    if (!websiteAnalysis?.has_ssl && websiteAnalysis?.is_accessible) {
      riskIndicators.push({
        type: 'warning',
        category: 'Security',
        description: 'Website lacks SSL certificate',
        score_impact: -5
      });
    }

    if (suspiciousPatterns.length > 0) {
      riskIndicators.push({
        type: 'warning',
        category: 'Content',
        description: `Suspicious patterns detected: ${suspiciousPatterns.length}`,
        score_impact: -20
      });
    }

    if (!emailValidation.professional) {
      riskIndicators.push({
        type: 'info',
        category: 'Email',
        description: 'Using free email provider instead of business domain',
        score_impact: -5
      });
    }

    if (request.experience_years && request.experience_years > 5) {
      riskIndicators.push({
        type: 'info',
        category: 'Experience',
        description: `${request.experience_years}+ years experience claimed`,
        score_impact: 10
      });
    }

    if (request.notable_clients && request.notable_clients.length > 20) {
      riskIndicators.push({
        type: 'info',
        category: 'Credibility',
        description: 'Notable clients listed',
        score_impact: 5
      });
    }

    // Calculate overall score
    let baseScore = 60;
    
    // Website contribution (max 15 points)
    if (websiteAnalysis?.is_accessible) {
      baseScore += websiteAnalysis.has_ssl ? 15 : 10;
    }
    
    // AI analysis contribution (max 25 points)
    const categoryFitAvg = (
      finalAiAnalysis.category_fit.primary_category_match +
      finalAiAnalysis.category_fit.service_alignment +
      finalAiAnalysis.category_fit.experience_credibility +
      finalAiAnalysis.category_fit.market_presence
    ) / 4;
    baseScore += Math.round(categoryFitAvg * 0.25);

    // Apply risk indicator impacts
    const riskImpact = riskIndicators.reduce((sum, r) => sum + r.score_impact, 0);
    const overallScore = Math.max(0, Math.min(100, baseScore + riskImpact));

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (overallScore >= 80) riskLevel = 'low';
    else if (overallScore >= 60) riskLevel = 'medium';
    else if (overallScore >= 40) riskLevel = 'high';
    else riskLevel = 'critical';

    // Determine recommendation
    let recommendation: 'approve' | 'manual_review' | 'reject' = finalAiAnalysis.recommendation;
    let recommendationReason = finalAiAnalysis.recommendation_reason;

    // Override based on critical risks
    if (riskIndicators.some(r => r.type === 'critical')) {
      recommendation = 'reject';
      recommendationReason = 'Critical risk indicators detected - ' + 
        riskIndicators.filter(r => r.type === 'critical').map(r => r.description).join(', ');
    } else if (overallScore >= 80 && !riskIndicators.some(r => r.type === 'warning')) {
      recommendation = 'approve';
      recommendationReason = 'All verification checks passed with high confidence';
    } else if (overallScore < 40) {
      recommendation = 'reject';
      recommendationReason = 'Low confidence score with multiple risk factors';
    }

    // Auto-vetting items (for UI checklist)
    const autoVettingItems: Record<string, boolean> = {
      websiteVerified: Boolean(websiteAnalysis?.is_accessible && websiteAnalysis.professional_score >= 60),
      businessLegitimate: !fraudDetection.duplicate_application && !fraudDetection.disposable_email && suspiciousPatterns.length === 0,
      experienceConfirmed: finalAiAnalysis.experience_credibility >= 60,
      categoriesMatch: finalAiAnalysis.category_fit.primary_category_match >= 70,
      noRedFlags: riskIndicators.filter(r => r.type === 'critical' || r.type === 'warning').length === 0
    };

    const result: VettingResult = {
      overall_score: overallScore,
      risk_level: riskLevel,
      verification_checks: {
        website_analysis: websiteAnalysis,
        business_legitimacy: businessLegitimacy,
        fraud_detection: fraudDetection,
        category_fit: finalAiAnalysis.category_fit,
        contact_verification: contactVerification
      },
      risk_indicators: riskIndicators,
      ai_recommendation: recommendation,
      recommendation_reason: recommendationReason,
      auto_vetting_items: autoVettingItems
    };

    console.log(`Vetting completed in ${Date.now() - startTime}ms. Score: ${overallScore}, Risk: ${riskLevel}`);

    return new Response(
      JSON.stringify({
        success: true,
        result,
        processing_time_ms: Date.now() - startTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Vetting error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Vetting process failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
