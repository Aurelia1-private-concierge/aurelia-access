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
      .from('partner_performance_scores' as any)
      .select('*')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false });

    if (data) setScores(data as unknown as PartnerScore[]);
  }, [partnerId]);

  const calculatePerformance = useCallback(async () => {
    if (!partnerId) return;

    const { data: partner } = await supabase
      .from('partners')
      .select('id, company_name')
      .eq('id', partnerId)
      .single();

    if (!partner) return;

    const { data: requests, count } = await supabase
      .from('service_requests')
      .select('id, status, created_at, updated_at', { count: 'exact' })
      .eq('partner_id', partnerId);

    const completedRequests = requests?.filter(r => r.status === 'completed').length || 0;
    const totalRequests = count || 0;

    const latestScores = scores.reduce((acc, score) => {
      if (!acc[score.score_type] || new Date(score.created_at) > new Date(acc[score.score_type].created_at)) {
        acc[score.score_type] = score;
      }
      return acc;
    }, {} as Record<string, PartnerScore>);

    const responseTimeScore = latestScores.response_time?.score ?? 80;
    const satisfactionScore = latestScores.satisfaction?.score ?? 85;
    const reliabilityScore = latestScores.reliability?.score ?? 90;
    const qualityScore = latestScores.quality?.score ?? 85;

    const overallScore = latestScores.overall?.score ?? 
      (responseTimeScore * 0.2 + satisfactionScore * 0.3 + reliabilityScore * 0.3 + qualityScore * 0.2);

    const overallScores = scores
      .filter(s => s.score_type === 'overall')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (overallScores.length >= 2) {
      const diff = overallScores[0].score - overallScores[1].score;
      trend = diff > 2 ? 'up' : diff < -2 ? 'down' : 'stable';
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
      avgResponseTime: 2.5, // Placeholder
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

    const { data, error } = await (supabase.from('partner_performance_scores' as any) as any)
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
      const { data: requests } = await supabase
        .from('service_requests')
        .select('id, status, created_at, updated_at')
        .eq('partner_id', partner.id)
        .gte('created_at', periodStart.toISOString())
        .lte('created_at', periodEnd.toISOString());

      if (!requests || requests.length === 0) continue;

      const completed = requests.filter(r => r.status === 'completed').length;
      const reliabilityScore = (completed / requests.length) * 100;

      await (supabase.from('partner_performance_scores' as any) as any).insert({
        partner_id: partner.id,
        score_type: 'reliability',
        score: reliabilityScore,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        sample_size: requests.length,
      });

      await (supabase.from('partner_performance_scores' as any) as any).insert({
        partner_id: partner.id,
        score_type: 'overall',
        score: reliabilityScore,
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
