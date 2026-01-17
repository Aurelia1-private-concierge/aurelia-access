-- Create boardroom sessions table
CREATE TABLE public.boardroom_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  room_code TEXT NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  max_participants INTEGER DEFAULT 10,
  is_waiting_room_enabled BOOLEAN DEFAULT true,
  is_recording_enabled BOOLEAN DEFAULT false,
  participant_emails TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create boardroom participants table
CREATE TABLE public.boardroom_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.boardroom_sessions(id) ON DELETE CASCADE,
  user_id UUID,
  email TEXT,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('host', 'co-host', 'participant', 'guest')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'waiting', 'joined', 'left')),
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.boardroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boardroom_participants ENABLE ROW LEVEL SECURITY;

-- Policies for boardroom_sessions
CREATE POLICY "Users can view sessions they host or are invited to"
ON public.boardroom_sessions
FOR SELECT
USING (
  auth.uid() = host_id OR
  auth.jwt()->>'email' = ANY(participant_emails)
);

CREATE POLICY "Users can create their own sessions"
ON public.boardroom_sessions
FOR INSERT
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their sessions"
ON public.boardroom_sessions
FOR UPDATE
USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their sessions"
ON public.boardroom_sessions
FOR DELETE
USING (auth.uid() = host_id);

-- Policies for boardroom_participants
CREATE POLICY "Users can view participants of sessions they have access to"
ON public.boardroom_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.boardroom_sessions s
    WHERE s.id = session_id AND (s.host_id = auth.uid() OR auth.jwt()->>'email' = ANY(s.participant_emails))
  )
);

CREATE POLICY "Session hosts can manage participants"
ON public.boardroom_participants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.boardroom_sessions s
    WHERE s.id = session_id AND s.host_id = auth.uid()
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_boardroom_sessions_updated_at
BEFORE UPDATE ON public.boardroom_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_boardroom_sessions_host ON public.boardroom_sessions(host_id);
CREATE INDEX idx_boardroom_sessions_scheduled ON public.boardroom_sessions(scheduled_at);
CREATE INDEX idx_boardroom_sessions_room_code ON public.boardroom_sessions(room_code);
CREATE INDEX idx_boardroom_participants_session ON public.boardroom_participants(session_id);