import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CircleProfile {
  id: string;
  user_id: string;
  display_name: string;
  title: string | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  interests: string[];
  assets: string[];
  net_worth_tier: string;
  verification_status: string;
  is_discoverable: boolean;
  privacy_level: string;
  created_at: string;
}

export interface CircleConnection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  introduction_note: string | null;
  ai_match_score: number | null;
  ai_match_reasons: unknown[];
  connected_at: string | null;
  created_at: string;
  profile?: CircleProfile;
}

export interface CircleOpportunity {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  opportunity_type: 'co_investment' | 'experience' | 'deal_flow' | 'introduction';
  category: string | null;
  location: string | null;
  min_contribution: number | null;
  max_contribution: number | null;
  currency: string;
  total_slots: number;
  filled_slots: number;
  target_date: string | null;
  expires_at: string | null;
  status: 'open' | 'filled' | 'closed' | 'cancelled';
  images: string[];
  visibility: string;
  created_at: string;
  creator?: CircleProfile;
}

export interface CircleMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender?: CircleProfile;
}

export interface CircleIntroduction {
  id: string;
  user_id: string;
  suggested_member_id: string;
  match_score: number;
  match_reasons: unknown[];
  common_interests: string[];
  suggested_talking_points: unknown[];
  status: string;
  created_at: string;
  suggested_member?: CircleProfile;
}

export const useCircle = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<CircleProfile | null>(null);
  const [members, setMembers] = useState<CircleProfile[]>([]);
  const [connections, setConnections] = useState<CircleConnection[]>([]);
  const [opportunities, setOpportunities] = useState<CircleOpportunity[]>([]);
  const [introductions, setIntroductions] = useState<CircleIntroduction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch or create user's Circle profile
  const fetchProfile = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('circle_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('[Circle] Error fetching profile:', error);
      return null;
    }

    if (data) {
      setProfile(data as unknown as CircleProfile);
      return data;
    }

    // Auto-create profile for new members
    const { data: newProfile, error: createError } = await supabase
      .from('circle_profiles')
      .insert({
        user_id: user.id,
        display_name: user.email?.split('@')[0] || 'Member',
      })
      .select()
      .single();

    if (createError) {
      console.error('[Circle] Error creating profile:', createError);
      return null;
    }

    setProfile(newProfile as unknown as CircleProfile);
    return newProfile;
  }, [user]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<CircleProfile>) => {
    if (!user || !profile) return false;

    const { error } = await supabase
      .from('circle_profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile' });
      return false;
    }

    setProfile(prev => prev ? { ...prev, ...updates } : null);
    toast({ title: 'Profile Updated' });
    return true;
  }, [user, profile, toast]);

  // Fetch discoverable members
  const fetchMembers = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('circle_profiles')
      .select('*')
      .eq('is_discoverable', true)
      .neq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Circle] Error fetching members:', error);
      return;
    }

    setMembers((data || []) as unknown as CircleProfile[]);
  }, [user]);

  // Fetch connections
  const fetchConnections = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('circle_connections')
      .select('*')
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Circle] Error fetching connections:', error);
      return;
    }

    setConnections((data || []) as unknown as CircleConnection[]);
  }, [user]);

  // Send connection request
  const sendConnectionRequest = useCallback(async (recipientId: string, note?: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('circle_connections')
      .insert({
        requester_id: user.id,
        recipient_id: recipientId,
        introduction_note: note,
        status: 'pending',
      });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send connection request' });
      return false;
    }

    toast({ title: 'Connection Request Sent' });
    await fetchConnections();
    return true;
  }, [user, toast, fetchConnections]);

  // Respond to connection request
  const respondToConnection = useCallback(async (connectionId: string, accept: boolean) => {
    if (!user) return false;

    const { error } = await supabase
      .from('circle_connections')
      .update({
        status: accept ? 'accepted' : 'declined',
        connected_at: accept ? new Date().toISOString() : null,
      })
      .eq('id', connectionId);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to respond to request' });
      return false;
    }

    toast({ title: accept ? 'Connection Accepted' : 'Connection Declined' });
    await fetchConnections();
    return true;
  }, [user, toast, fetchConnections]);

  // Fetch opportunities
  const fetchOpportunities = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('circle_opportunities')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[Circle] Error fetching opportunities:', error);
      return;
    }

    setOpportunities((data || []) as unknown as CircleOpportunity[]);
  }, [user]);

  // Create opportunity
  const createOpportunity = useCallback(async (opportunity: Omit<Partial<CircleOpportunity>, 'id' | 'creator_id' | 'created_at'>) => {
    if (!user) return null;

    const insertData = {
      title: opportunity.title || 'Untitled Opportunity',
      opportunity_type: opportunity.opportunity_type || 'co_investment',
      description: opportunity.description,
      category: opportunity.category,
      location: opportunity.location,
      min_contribution: opportunity.min_contribution,
      max_contribution: opportunity.max_contribution,
      currency: opportunity.currency || 'USD',
      total_slots: opportunity.total_slots || 1,
      target_date: opportunity.target_date,
      expires_at: opportunity.expires_at,
      images: opportunity.images || [],
      visibility: opportunity.visibility || 'members',
      creator_id: user.id,
    };

    const { data, error } = await supabase
      .from('circle_opportunities')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create opportunity' });
      return null;
    }

    toast({ title: 'Opportunity Created' });
    await fetchOpportunities();
    return data;
  }, [user, toast, fetchOpportunities]);

  // Express interest in opportunity
  const expressInterest = useCallback(async (opportunityId: string, amount?: number, message?: string) => {
    if (!user) return false;

    const { error } = await supabase
      .from('circle_opportunity_interests')
      .insert({
        opportunity_id: opportunityId,
        user_id: user.id,
        contribution_amount: amount,
        message,
        interest_level: 'interested',
      });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to express interest' });
      return false;
    }

    toast({ title: 'Interest Registered' });
    return true;
  }, [user, toast]);

  // Fetch AI introductions
  const fetchIntroductions = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('circle_introductions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('match_score', { ascending: false })
      .limit(5);

    if (error) {
      console.error('[Circle] Error fetching introductions:', error);
      return;
    }

    setIntroductions((data || []) as unknown as CircleIntroduction[]);
  }, [user]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`circle-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'circle_connections',
        filter: `recipient_id=eq.${user.id}`,
      }, () => fetchConnections())
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConnections]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      await Promise.all([
        fetchProfile(),
        fetchMembers(),
        fetchConnections(),
        fetchOpportunities(),
        fetchIntroductions(),
      ]);
      setIsLoading(false);
    };

    init();
  }, [user, fetchProfile, fetchMembers, fetchConnections, fetchOpportunities, fetchIntroductions]);

  return {
    profile,
    members,
    connections,
    opportunities,
    introductions,
    isLoading,
    updateProfile,
    sendConnectionRequest,
    respondToConnection,
    createOpportunity,
    expressInterest,
    fetchMembers,
    fetchConnections,
    fetchOpportunities,
    fetchIntroductions,
  };
};

export default useCircle;
