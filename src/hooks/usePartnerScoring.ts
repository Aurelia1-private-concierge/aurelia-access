import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PartnerScore {
  id: string;
  partner_id: string;
  score_type: 'overall' | 'response_time' | 'satisfaction' | 'reliability' | 'quality';
  score: number;
  sample_size: number;
  period_start: string;
  period_end: string;
  breakdown: Record<string, unknown> | null;
  created_at: string;
}

export interface PartnerPerformance {
  partnerId: string;
  partnerName: string;
  overallScore: number;
  scores: {
    response_time: number;
    satisfaction: number;
    reliability: number;
    quality: number;
  };
  totalRequests: number;
  completedRequests: number;
  avgResponseTime: number;
  trend: 'up' | 'down' | 'stable';
}

export function usePartnerScoring(partnerId?: string) {
  const { user } = useAuth();
  const [scores, setScores] = useState<PartnerScore[]>([]);
  const [performance, setPerformance] = useState<PartnerPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async () => {
    if (!partnerId) return;

    const { data } = await supabase
      .from('partner_performance_scores')
      .select('*')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false });

    if (data) setScores(data as PartnerScore[]);
  }, [partnerId]);

  const calculatePerformance = useCallback(async () => {
    if (!partnerId) return;

    // Get partner info
    const { data: partner } = await supabase
      .from('partners')
      .select('id, company_name, rating')
      .eq('id', partnerId)
      .single();

    if (!partner) return;

    // Get service request stats
    const { data: requests, count } = await supabase
      .from('service_requests')
      .select('id, status, created_at, updated_at', { count: 'exact' })
      .eq('partner_id', partnerId);

    const completedRequests = requests?.filter(r => r.status === 'completed').length || 0;
    const totalRequests = count || 0;

    // Get latest scores by type
    const latestScores = scores.reduce((acc, score) => {
      if (!acc[score.score_type] || new Date(score.created_at) > new Date(acc[score.score_type].created_at)) {
        acc[score.score_type] = score;
      }
      return acc;
    }, {} as Record<string, PartnerScore>);

    // Calculate overall from components if not present
    const responseTimeScore = latestScores.response_time?.score ?? 80;
    const satisfactionScore = latestScores.satisfaction?.score ?? 85;
    const reliabilityScore = latestScores.reliability?.score ?? 90;
    const qualityScore = latestScores.quality?.score ?? 85;

    const overallScore = latestScores.overall?.score ?? 
      (responseTimeScore * 0.2 + satisfactionScore * 0.3 + reliabilityScore * 0.3 + qualityScore * 0.2);

    // Determine trend based on last two overall scores
    const overallScores = scores
      .filter(s => s.score_type === 'overall')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (overallScores.length >= 2) {
      const diff = overallScores[0].score - overallScores[1].score;
      trend = diff > 2 ? 'up' : diff < -2 ? 'down' : 'stable';
    }

    // Calculate avg response time from bids
    const { data: bids } = await supabase
      .from('service_request_bids')
      .select('created_at, service_request_id')
      .eq('partner_id', partnerId)
      .limit(50);

    let avgResponseTime = 0;
    if (bids && bids.length > 0) {
      // This is a simplified calculation - in reality, we'd compare to request creation time
      avgResponseTime = 2.5; // hours placeholder
    }

    setPerformance({
      partnerId,
      partnerName: partner.company_name || 'Unknown Partner',
      overallScore: Math.round(overallScore * 10) / 10,
      scores: {
        response_time: responseTimeScore,
        satisfaction: satisfactionScore,
        reliability: reliabilityScore,
        quality: qualityScore,
      },
      totalRequests,
      completedRequests,
      avgResponseTime,
      trend,
    });
  }, [partnerId, scores]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchScores();
      setLoading(false);
    };
    load();
  }, [fetchScores]);

  useEffect(() => {
    if (scores.length > 0) {
      calculatePerformance();
    }
  }, [scores, calculatePerformance]);

  const recordScore = useCallback(async (
    scoreType: PartnerScore['score_type'],
    score: number,
    periodStart: Date,
    periodEnd: Date,
    breakdown?: Record<string, unknown>
  ) => {
    if (!partnerId) return { error: 'No partner ID' };

    const { data, error } = await supabase
      .from('partner_performance_scores')
      .insert({
        partner_id: partnerId,
        score_type: scoreType,
        score: Math.max(0, Math.min(100, score)),
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        breakdown,
        sample_size: 1,
      })
      .select()
      .single();

    if (!error && data) {
      setScores(prev => [data as PartnerScore, ...prev]);
    }

    return { data, error };
  }, [partnerId]);

  // Calculate all partner scores (admin function)
  const calculateAllPartnerScores = useCallback(async () => {
    const { data: partners } = await supabase
      .from('partners')
      .select('id')
      .eq('status', 'approved');

    if (!partners) return;

    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setMonth(periodStart.getMonth() - 1);

    for (const partner of partners) {
      // Get completed requests in period
      const { data: requests } = await supabase
        .from('service_requests')
        .select('id, status, created_at, updated_at')
        .eq('partner_id', partner.id)
        .gte('created_at', periodStart.toISOString())
        .lte('created_at', periodEnd.toISOString());

      if (!requests || requests.length === 0) continue;

      const completed = requests.filter(r => r.status === 'completed').length;
      const reliabilityScore = (completed / requests.length) * 100;

      // Insert reliability score
      await supabase.from('partner_performance_scores').insert({
        partner_id: partner.id,
        score_type: 'reliability',
        score: reliabilityScore,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        sample_size: requests.length,
      });

      // Calculate and insert overall score
      const overall = reliabilityScore; // Simplified - would combine multiple scores
      await supabase.from('partner_performance_scores').insert({
        partner_id: partner.id,
        score_type: 'overall',
        score: overall,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        sample_size: requests.length,
      });
    }
  }, []);

  return {
    scores,
    performance,
    loading,
    recordScore,
    calculateAllPartnerScores,
    refresh: fetchScores,
  };
}
