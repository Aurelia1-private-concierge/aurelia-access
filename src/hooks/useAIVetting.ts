import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

interface WebsiteAnalysis {
  is_accessible: boolean;
  has_ssl: boolean;
  domain_age_indicator: 'new' | 'established' | 'unknown';
  professional_score: number;
  content_relevance: number;
  contact_info_found: boolean;
  social_presence: string[];
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

interface FraudDetection {
  email_domain_match: boolean;
  disposable_email: boolean;
  suspicious_patterns: string[];
  duplicate_application: boolean;
  blacklist_match: boolean;
}

interface BusinessLegitimacy {
  company_mentioned_online: boolean;
  consistent_branding: boolean;
  address_verifiable: boolean;
  phone_format_valid: boolean;
  registration_indicators: string[];
}

export interface VettingResult {
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

export function useAIVetting() {
  const [isVetting, setIsVetting] = useState(false);
  const [vettingResult, setVettingResult] = useState<VettingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runVetting = async (application: VettingRequest): Promise<VettingResult | null> => {
    setIsVetting(true);
    setError(null);
    setVettingResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-partner-vetting', {
        body: application
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Vetting failed');
      }

      const result = data.result as VettingResult;
      setVettingResult(result);

      // Show toast based on result
      const toastVariant = result.ai_recommendation === 'approve' 
        ? 'default' 
        : result.ai_recommendation === 'reject' 
          ? 'destructive' 
          : 'default';

      toast({
        title: `AI Vetting Complete`,
        description: `Score: ${result.overall_score}/100 • ${result.ai_recommendation.replace('_', ' ').toUpperCase()}`,
        variant: toastVariant,
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Vetting process failed';
      setError(message);
      toast({
        title: 'Vetting Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsVetting(false);
    }
  };

  const clearResult = () => {
    setVettingResult(null);
    setError(null);
  };

  return {
    isVetting,
    vettingResult,
    error,
    runVetting,
    clearResult
  };
}
