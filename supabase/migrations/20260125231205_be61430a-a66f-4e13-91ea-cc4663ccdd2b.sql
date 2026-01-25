-- =====================================================
-- AURELIA CIRCLE: UHNWI COMMUNITY PLATFORM
-- Exclusive networking, co-investment, secure messaging
-- =====================================================

-- Member connection/networking status
CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');
CREATE TYPE public.opportunity_type AS ENUM ('co_investment', 'experience', 'deal_flow', 'introduction');
CREATE TYPE public.opportunity_status AS ENUM ('open', 'filled', 'closed', 'cancelled');

-- Circle member profiles (enhanced profiles for community)
CREATE TABLE public.circle_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  title TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  interests TEXT[] DEFAULT '{}',
  assets TEXT[] DEFAULT '{}', -- yacht, jet, art, real estate categories
  net_worth_tier TEXT DEFAULT 'uhnwi', -- uhnwi, hnwi, verified
  verification_status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  is_discoverable BOOLEAN DEFAULT true,
  privacy_level TEXT DEFAULT 'members_only', -- members_only, connections_only, private
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Member connections (networking)
CREATE TABLE public.circle_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'pending',
  introduction_note TEXT,
  ai_match_score INTEGER, -- 0-100 compatibility score
  ai_match_reasons JSONB DEFAULT '[]',
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, recipient_id),
  CHECK (requester_id != recipient_id)
);

-- Lifestyle co-investment opportunities
CREATE TABLE public.circle_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  opportunity_type opportunity_type NOT NULL,
  category TEXT, -- yacht, jet, art, event, property, etc.
  location TEXT,
  min_contribution NUMERIC,
  max_contribution NUMERIC,
  currency TEXT DEFAULT 'USD',
  total_slots INTEGER DEFAULT 1,
  filled_slots INTEGER DEFAULT 0,
  target_date TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status opportunity_status NOT NULL DEFAULT 'open',
  images TEXT[] DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  visibility TEXT DEFAULT 'members', -- members, connections, invite_only
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Opportunity interest/participation
CREATE TABLE public.circle_opportunity_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.circle_opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_level TEXT DEFAULT 'interested', -- interested, committed, withdrawn
  contribution_amount NUMERIC,
  message TEXT,
  approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(opportunity_id, user_id)
);

-- E2E encrypted direct messages between members
CREATE TABLE public.circle_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- encrypted content
  is_encrypted BOOLEAN DEFAULT true,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  reply_to_id UUID REFERENCES public.circle_messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI-powered introduction suggestions
CREATE TABLE public.circle_introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggested_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL, -- 0-100
  match_reasons JSONB DEFAULT '[]',
  common_interests TEXT[] DEFAULT '{}',
  suggested_talking_points JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending', -- pending, viewed, connected, dismissed
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, suggested_member_id)
);

-- Circle activity feed
CREATE TABLE public.circle_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- new_member, new_opportunity, connection_made, etc.
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  visibility TEXT DEFAULT 'members',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.circle_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_opportunity_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Circle profiles: members can view discoverable profiles
CREATE POLICY "Members can view discoverable profiles"
ON public.circle_profiles FOR SELECT
TO authenticated
USING (is_discoverable = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own profile"
ON public.circle_profiles FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Connections: users can view their own connections
CREATE POLICY "Users can view own connections"
ON public.circle_connections FOR SELECT
TO authenticated
USING (requester_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create connection requests"
ON public.circle_connections FOR INSERT
TO authenticated
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update connections they're part of"
ON public.circle_connections FOR UPDATE
TO authenticated
USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- Opportunities: members can view public opportunities
CREATE POLICY "Members can view opportunities"
ON public.circle_opportunities FOR SELECT
TO authenticated
USING (visibility = 'members' OR creator_id = auth.uid());

CREATE POLICY "Members can create opportunities"
ON public.circle_opportunities FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update own opportunities"
ON public.circle_opportunities FOR UPDATE
TO authenticated
USING (creator_id = auth.uid());

-- Opportunity interests
CREATE POLICY "Users can view own interests"
ON public.circle_opportunity_interests FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.circle_opportunities o 
  WHERE o.id = opportunity_id AND o.creator_id = auth.uid()
));

CREATE POLICY "Users can express interest"
ON public.circle_opportunity_interests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Messages: only sender/recipient can access
CREATE POLICY "Users can view own messages"
ON public.circle_messages FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
ON public.circle_messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update message read status"
ON public.circle_messages FOR UPDATE
TO authenticated
USING (recipient_id = auth.uid());

-- Introductions: users see their own suggestions
CREATE POLICY "Users can view own introductions"
ON public.circle_introductions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own introduction status"
ON public.circle_introductions FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Activities: members can view community activities
CREATE POLICY "Members can view activities"
ON public.circle_activities FOR SELECT
TO authenticated
USING (visibility = 'members' OR user_id = auth.uid());

-- Enable realtime for messages and connections
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_connections;

-- Indexes for performance
CREATE INDEX idx_circle_connections_users ON public.circle_connections(requester_id, recipient_id);
CREATE INDEX idx_circle_messages_conversation ON public.circle_messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX idx_circle_opportunities_status ON public.circle_opportunities(status, created_at DESC);
CREATE INDEX idx_circle_introductions_user ON public.circle_introductions(user_id, status);

-- Trigger for updated_at
CREATE TRIGGER update_circle_profiles_updated_at
  BEFORE UPDATE ON public.circle_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_circle_connections_updated_at
  BEFORE UPDATE ON public.circle_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_circle_opportunities_updated_at
  BEFORE UPDATE ON public.circle_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();