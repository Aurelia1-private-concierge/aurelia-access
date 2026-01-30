import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Job {
  id: string;
  company_id: string;
  posted_by: string | null;
  title: string;
  slug: string;
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  job_type: string | null;
  experience_level: string | null;
  location: string | null;
  is_remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_period: string;
  skills: string[] | null;
  benefits: string[] | null;
  application_url: string | null;
  application_email: string | null;
  status: string;
  is_featured: boolean;
  views_count: number;
  applications_count: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    location: string | null;
  };
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  portfolio_url: string | null;
  status: string;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  job?: Job;
}

interface CreateJobInput {
  company_id: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  job_type?: string;
  experience_level?: string;
  location?: string;
  is_remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;
  skills?: string[];
  benefits?: string[];
  application_url?: string;
  application_email?: string;
  expires_at?: string;
}

interface JobFilters {
  company_id?: string;
  job_type?: string;
  experience_level?: string;
  is_remote?: boolean;
  location?: string;
  search?: string;
  limit?: number;
}

export function useJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Math.random().toString(36).substring(2, 8);
  };

  const fetchJobs = useCallback(async (filters?: JobFilters) => {
    try {
      setLoading(true);
      let query = supabase
        .from('jobs')
        .select(`
          *,
          company:companies!jobs_company_id_fkey (
            id, name, slug, logo_url, location
          )
        `)
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.company_id) {
        query = query.eq('company_id', filters.company_id);
      }
      if (filters?.job_type) {
        query = query.eq('job_type', filters.job_type);
      }
      if (filters?.experience_level) {
        query = query.eq('experience_level', filters.experience_level);
      }
      if (filters?.is_remote !== undefined) {
        query = query.eq('is_remote', filters.is_remote);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      setJobs((data || []) as Job[]);
      return data as Job[];
    } catch (err) {
      console.error('Error fetching jobs:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getJob = useCallback(async (id: string): Promise<Job | null> => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies!jobs_company_id_fkey (
            id, name, slug, logo_url, location, description, website, company_size
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Increment view count
      await supabase.from('jobs').update({ views_count: (data.views_count || 0) + 1 }).eq('id', id);

      return data as Job;
    } catch (err) {
      console.error('Error fetching job:', err);
      return null;
    }
  }, []);

  const createJob = useCallback(async (input: CreateJobInput): Promise<Job | null> => {
    if (!user) {
      toast({ title: 'Authentication Required', variant: 'destructive' });
      return null;
    }

    try {
      const slug = generateSlug(input.title);
      
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...input,
          slug,
          posted_by: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Job Posted', description: `${input.title} has been posted successfully.` });
      return data as Job;
    } catch (err: any) {
      console.error('Error creating job:', err);
      toast({ title: 'Error', description: err.message || 'Failed to post job.', variant: 'destructive' });
      return null;
    }
  }, [user]);

  const updateJob = useCallback(async (id: string, input: Partial<CreateJobInput>): Promise<Job | null> => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Job Updated', description: 'Changes saved successfully.' });
      return data as Job;
    } catch (err: any) {
      console.error('Error updating job:', err);
      toast({ title: 'Error', description: err.message || 'Failed to update job.', variant: 'destructive' });
      return null;
    }
  }, []);

  const closeJob = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'closed' })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Job Closed', description: 'Job listing has been closed.' });
      return true;
    } catch (err) {
      console.error('Error closing job:', err);
      return false;
    }
  }, []);

  // Applications
  const applyToJob = useCallback(async (jobId: string, input: {
    cover_letter?: string;
    resume_url?: string;
    portfolio_url?: string;
  }): Promise<boolean> => {
    if (!user) {
      toast({ title: 'Authentication Required', variant: 'destructive' });
      return false;
    }

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          applicant_id: user.id,
          ...input,
        });

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already Applied', description: 'You have already applied to this job.', variant: 'destructive' });
        }
        throw error;
      }

      toast({ title: 'Application Submitted', description: 'Your application has been sent.' });
      await fetchMyApplications();
      return true;
    } catch (err: any) {
      console.error('Error applying to job:', err);
      return false;
    }
  }, [user]);

  const fetchMyApplications = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs (
            id, title, company_id, status,
            company:companies!jobs_company_id_fkey (name, logo_url)
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyApplications((data || []) as JobApplication[]);
      return data as JobApplication[];
    } catch (err) {
      console.error('Error fetching applications:', err);
      return [];
    }
  }, [user]);

  const withdrawApplication = useCallback(async (applicationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: 'withdrawn' })
        .eq('id', applicationId);

      if (error) throw error;
      toast({ title: 'Application Withdrawn' });
      await fetchMyApplications();
      return true;
    } catch (err) {
      console.error('Error withdrawing application:', err);
      return false;
    }
  }, [fetchMyApplications]);

  // Saved jobs
  const saveJob = useCallback(async (jobId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const isSaved = savedJobs.includes(jobId);
      
      if (isSaved) {
        await supabase.from('saved_jobs').delete()
          .eq('job_id', jobId)
          .eq('user_id', user.id);
        setSavedJobs(prev => prev.filter(id => id !== jobId));
        toast({ title: 'Job Removed', description: 'Removed from saved jobs.' });
      } else {
        await supabase.from('saved_jobs').insert({ job_id: jobId, user_id: user.id });
        setSavedJobs(prev => [...prev, jobId]);
        toast({ title: 'Job Saved', description: 'Added to saved jobs.' });
      }
      return true;
    } catch (err) {
      console.error('Error saving job:', err);
      return false;
    }
  }, [user, savedJobs]);

  const fetchSavedJobs = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('saved_jobs')
      .select('job_id')
      .eq('user_id', user.id);

    setSavedJobs((data || []).map(s => s.job_id));
  }, [user]);

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchMyApplications();
      fetchSavedJobs();
    }
  }, [fetchJobs, fetchMyApplications, fetchSavedJobs, user]);

  return {
    jobs,
    myApplications,
    savedJobs,
    loading,
    fetchJobs,
    getJob,
    createJob,
    updateJob,
    closeJob,
    applyToJob,
    fetchMyApplications,
    withdrawApplication,
    saveJob,
    isJobSaved: (jobId: string) => savedJobs.includes(jobId),
  };
}
