import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ImpactProject {
  id: string;
  title: string;
  description: string | null;
  category: string;
  region: string;
  target_amount: number;
  current_amount: number;
  carbon_offset_tons: number;
  people_helped: number;
  status: string;
  image_url: string | null;
  partner_name: string | null;
}

export interface ImpactInvestment {
  id: string;
  project_id: string;
  amount: number;
  currency: string;
  carbon_offset_tons: number;
  people_impacted: number;
  investment_date: string;
  status: string;
  project?: ImpactProject;
}

export interface ImpactMetrics {
  totalInvested: number;
  carbonOffset: number;
  peopleHelped: number;
  projectsFunded: number;
}

export const useImpactPortfolio = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<ImpactInvestment[]>([]);
  const [projects, setProjects] = useState<ImpactProject[]>([]);
  const [metrics, setMetrics] = useState<ImpactMetrics>({
    totalInvested: 0,
    carbonOffset: 0,
    peopleHelped: 0,
    projectsFunded: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch user's investments
      const { data: investmentData, error: investmentError } = await supabase
        .from('impact_investments')
        .select('*')
        .eq('user_id', user.id)
        .order('investment_date', { ascending: false });

      if (investmentError) throw investmentError;

      // Fetch all active projects
      const { data: projectData, error: projectError } = await supabase
        .from('impact_projects')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (projectError) throw projectError;

      // Map projects to investments
      const investmentsWithProjects = (investmentData || []).map(inv => ({
        ...inv,
        project: projectData?.find(p => p.id === inv.project_id),
      }));

      setInvestments(investmentsWithProjects);
      setProjects(projectData || []);

      // Calculate metrics
      const totalInvested = investmentData?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      const carbonOffset = investmentData?.reduce((sum, inv) => sum + Number(inv.carbon_offset_tons), 0) || 0;
      const peopleHelped = investmentData?.reduce((sum, inv) => sum + Number(inv.people_impacted), 0) || 0;
      const projectsFunded = new Set(investmentData?.map(inv => inv.project_id)).size;

      setMetrics({
        totalInvested,
        carbonOffset,
        peopleHelped,
        projectsFunded,
      });
    } catch (error) {
      console.error('Error fetching impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addInvestment = async (projectId: string, amount: number, carbonOffset: number = 0, peopleImpacted: number = 0) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('impact_investments')
      .insert({
        user_id: user.id,
        project_id: projectId,
        amount,
        carbon_offset_tons: carbonOffset,
        people_impacted: peopleImpacted,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding investment:', error);
      return null;
    }

    await fetchData();
    return data;
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    investments,
    projects,
    metrics,
    loading,
    addInvestment,
    refetch: fetchData,
  };
};
