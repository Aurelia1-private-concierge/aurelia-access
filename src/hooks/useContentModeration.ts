import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ContentReport {
  id: string;
  reporter_id: string | null;
  content_type: string;
  content_id: string;
  reason: string;
  description: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  action_taken: string | null;
  created_at: string;
  reporter?: {
    display_name: string;
  };
}

export function useContentModeration() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(false);

  const reportContent = useCallback(async (input: {
    content_type: 'post' | 'comment' | 'job' | 'company' | 'user';
    content_id: string;
    reason: 'spam' | 'harassment' | 'hate_speech' | 'misinformation' | 'inappropriate' | 'copyright' | 'other';
    description?: string;
  }): Promise<boolean> => {
    if (!user) {
      toast({ title: 'Please sign in to report content', variant: 'destructive' });
      return false;
    }

    try {
      const { error } = await supabase
        .from('content_reports')
        .insert({
          ...input,
          reporter_id: user.id,
        });

      if (error) throw error;
      toast({ title: 'Report Submitted', description: 'Thank you for helping keep our community safe.' });
      return true;
    } catch (err: any) {
      console.error('Error reporting content:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    }
  }, [user]);

  const fetchReports = useCallback(async (filters?: {
    status?: string;
    content_type?: string;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('content_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.content_type) {
        query = query.eq('content_type', filters.content_type);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch reporter profiles separately
      if (data && data.length > 0) {
        const reporterIds = [...new Set(data.filter(r => r.reporter_id).map(r => r.reporter_id!))];
        
        if (reporterIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, display_name')
            .in('user_id', reporterIds);

          const reportsWithProfiles = data.map(r => ({
            ...r,
            reporter: r.reporter_id && profiles?.find(p => p.user_id === r.reporter_id) 
              ? { display_name: profiles.find(p => p.user_id === r.reporter_id)!.display_name }
              : undefined,
          }));

          setReports(reportsWithProfiles as ContentReport[]);
          return reportsWithProfiles as ContentReport[];
        }
      }

      setReports((data || []) as ContentReport[]);
      return (data || []) as ContentReport[];
    } catch (err) {
      console.error('Error fetching reports:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const reviewReport = useCallback(async (reportId: string, action: {
    status: 'resolved' | 'dismissed';
    action_taken?: string;
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('content_reports')
        .update({
          status: action.status,
          action_taken: action.action_taken,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;
      toast({ title: 'Report Updated' });
      await fetchReports();
      return true;
    } catch (err) {
      console.error('Error reviewing report:', err);
      return false;
    }
  }, [user, fetchReports]);

  const removeContent = useCallback(async (contentType: string, contentId: string): Promise<boolean> => {
    try {
      let table: string;
      let updateField: string = 'status';
      let updateValue: string = 'removed';

      switch (contentType) {
        case 'post':
          table = 'posts';
          break;
        case 'comment':
          table = 'post_comments';
          break;
        case 'job':
          table = 'jobs';
          updateValue = 'closed';
          break;
        case 'company':
          table = 'companies';
          updateValue = 'suspended';
          break;
        default:
          throw new Error('Invalid content type');
      }

      const { error } = await supabase
        .from(table as any)
        .update({ [updateField]: updateValue })
        .eq('id', contentId);

      if (error) throw error;
      toast({ title: 'Content Removed' });
      return true;
    } catch (err) {
      console.error('Error removing content:', err);
      return false;
    }
  }, []);

  return {
    reports,
    loading,
    reportContent,
    fetchReports,
    reviewReport,
    removeContent,
  };
}
