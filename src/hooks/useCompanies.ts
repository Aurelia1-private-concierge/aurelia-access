import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  industry: string | null;
  company_size: string | null;
  website: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  location: string | null;
  founded_year: number | null;
  is_verified: boolean;
  is_featured: boolean;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: string;
  title: string | null;
  is_verified: boolean;
  joined_at: string;
}

interface CreateCompanyInput {
  name: string;
  description?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  location?: string;
  founded_year?: number;
}

interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  logo_url?: string;
  cover_image_url?: string;
}

export function useCompanies() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [myCompanies, setMyCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Math.random().toString(36).substring(2, 8);
  };

  const fetchCompanies = useCallback(async (filters?: {
    industry?: string;
    location?: string;
    search?: string;
    limit?: number;
  }) => {
    try {
      let query = supabase
        .from('companies')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.industry) {
        query = query.eq('industry', filters.industry);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCompanies((data || []) as Company[]);
      return data as Company[];
    } catch (err) {
      console.error('Error fetching companies:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyCompanies = useCallback(async () => {
    if (!user) return [];
    
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberData || memberData.length === 0) {
        setMyCompanies([]);
        return [];
      }

      const companyIds = memberData.map(m => m.company_id);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds);

      if (error) throw error;
      setMyCompanies((data || []) as Company[]);
      return data as Company[];
    } catch (err) {
      console.error('Error fetching my companies:', err);
      return [];
    }
  }, [user]);

  const getCompany = useCallback(async (idOrSlug: string): Promise<Company | null> => {
    try {
      let query = supabase.from('companies').select('*');
      
      // Check if it's a UUID or slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      query = isUuid ? query.eq('id', idOrSlug) : query.eq('slug', idOrSlug);
      
      const { data, error } = await query.single();
      if (error) throw error;
      return data as Company;
    } catch (err) {
      console.error('Error fetching company:', err);
      return null;
    }
  }, []);

  const createCompany = useCallback(async (input: CreateCompanyInput): Promise<Company | null> => {
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please sign in to create a company.', variant: 'destructive' });
      return null;
    }

    try {
      const slug = generateSlug(input.name);
      
      const { data, error } = await supabase
        .from('companies')
        .insert({
          ...input,
          slug,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add owner as company member
      await supabase.from('company_members').insert({
        company_id: data.id,
        user_id: user.id,
        role: 'owner',
      });

      toast({ title: 'Company Created', description: `${input.name} has been created successfully.` });
      await fetchMyCompanies();
      return data as Company;
    } catch (err: any) {
      console.error('Error creating company:', err);
      toast({ title: 'Error', description: err.message || 'Failed to create company.', variant: 'destructive' });
      return null;
    }
  }, [user, fetchMyCompanies]);

  const updateCompany = useCallback(async (id: string, input: UpdateCompanyInput): Promise<Company | null> => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Company Updated', description: 'Changes saved successfully.' });
      await fetchMyCompanies();
      return data as Company;
    } catch (err: any) {
      console.error('Error updating company:', err);
      toast({ title: 'Error', description: err.message || 'Failed to update company.', variant: 'destructive' });
      return null;
    }
  }, [fetchMyCompanies]);

  const deleteCompany = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Company Archived', description: 'Company has been archived.' });
      await fetchMyCompanies();
      return true;
    } catch (err: any) {
      console.error('Error archiving company:', err);
      toast({ title: 'Error', description: err.message || 'Failed to archive company.', variant: 'destructive' });
      return false;
    }
  }, [fetchMyCompanies]);

  const followCompany = useCallback(async (companyId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('company_followers')
        .insert({ company_id: companyId, user_id: user.id });

      if (error) throw error;
      toast({ title: 'Following', description: 'You are now following this company.' });
      return true;
    } catch (err: any) {
      if (err.code === '23505') {
        // Already following
        await supabase.from('company_followers').delete()
          .eq('company_id', companyId)
          .eq('user_id', user.id);
        toast({ title: 'Unfollowed', description: 'You have unfollowed this company.' });
        return false;
      }
      console.error('Error following company:', err);
      return false;
    }
  }, [user]);

  const isFollowing = useCallback(async (companyId: string): Promise<boolean> => {
    if (!user) return false;
    
    const { data } = await supabase
      .from('company_followers')
      .select('id')
      .eq('company_id', companyId)
      .eq('user_id', user.id)
      .maybeSingle();
    
    return !!data;
  }, [user]);

  useEffect(() => {
    fetchCompanies();
    if (user) {
      fetchMyCompanies();
    }
  }, [fetchCompanies, fetchMyCompanies, user]);

  return {
    companies,
    myCompanies,
    loading,
    fetchCompanies,
    fetchMyCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    followCompany,
    isFollowing,
  };
}
