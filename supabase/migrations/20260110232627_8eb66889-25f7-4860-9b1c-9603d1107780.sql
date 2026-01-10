-- Commission Tracking System
CREATE TABLE public.partner_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
  client_id UUID NOT NULL,
  service_title TEXT NOT NULL,
  booking_amount NUMERIC(12,2) NOT NULL,
  commission_rate NUMERIC(5,2) DEFAULT 15.00,
  commission_amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.partner_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their own commissions"
ON public.partner_commissions FOR SELECT
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all commissions"
ON public.partner_commissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Concierge Fee Tracking
CREATE TABLE public.concierge_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  fee_type TEXT DEFAULT 'standard' CHECK (fee_type IN ('standard', 'rush', 'complex', 'vip')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invoiced', 'paid', 'waived')),
  invoiced_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.concierge_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fees"
ON public.concierge_fees FOR SELECT
USING (client_id = auth.uid());

CREATE POLICY "Admins can manage all fees"
ON public.concierge_fees FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- CRM/Client Notes System
CREATE TABLE public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  created_by UUID NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'preference', 'complaint', 'vip', 'follow_up')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage client notes"
ON public.client_notes FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Lifestyle Calendar Events
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'personal' CHECK (event_type IN ('personal', 'travel', 'booking', 'reminder', 'vip_access')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_all_day BOOLEAN DEFAULT false,
  reminder_minutes INTEGER DEFAULT 60,
  service_request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events"
ON public.calendar_events FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all events"
ON public.calendar_events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Analytics Events Tracking
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_data JSONB,
  page_path TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view analytics"
ON public.analytics_events FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert analytics"
ON public.analytics_events FOR INSERT
WITH CHECK (true);

-- Secure Messages (real-time chat)
CREATE TABLE public.secure_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID,
  conversation_type TEXT DEFAULT 'concierge' CHECK (conversation_type IN ('concierge', 'partner', 'admin')),
  message TEXT NOT NULL,
  attachments TEXT[],
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.secure_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
ON public.secure_messages FOR SELECT
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
ON public.secure_messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Admins can view all messages"
ON public.secure_messages FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.secure_messages;

-- Create indexes for performance
CREATE INDEX idx_partner_commissions_partner ON public.partner_commissions(partner_id);
CREATE INDEX idx_partner_commissions_status ON public.partner_commissions(status);
CREATE INDEX idx_concierge_fees_client ON public.concierge_fees(client_id);
CREATE INDEX idx_client_notes_client ON public.client_notes(client_id);
CREATE INDEX idx_calendar_events_user ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_dates ON public.calendar_events(start_date, end_date);
CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX idx_secure_messages_conversation ON public.secure_messages(sender_id, recipient_id);