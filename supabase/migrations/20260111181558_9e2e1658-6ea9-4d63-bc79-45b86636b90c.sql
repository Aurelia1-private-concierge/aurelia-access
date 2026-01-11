-- Create messages table for real-time chat between members and concierge
CREATE TABLE public.concierge_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('member', 'concierge', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'service_request', 'notification')),
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service request updates table for workflow tracking
CREATE TABLE public.service_request_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL CHECK (update_type IN ('status_change', 'assignment', 'message', 'document', 'completion', 'cancellation')),
  previous_status TEXT,
  new_status TEXT,
  title TEXT NOT NULL,
  description TEXT,
  updated_by UUID,
  updated_by_role TEXT CHECK (updated_by_role IN ('client', 'concierge', 'partner', 'system')),
  metadata JSONB DEFAULT '{}',
  is_visible_to_client BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email notifications queue table
CREATE TABLE public.email_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_concierge_messages_conversation ON public.concierge_messages(conversation_id);
CREATE INDEX idx_concierge_messages_sender ON public.concierge_messages(sender_id);
CREATE INDEX idx_concierge_messages_created ON public.concierge_messages(created_at DESC);
CREATE INDEX idx_concierge_messages_unread ON public.concierge_messages(conversation_id) WHERE is_read = false;

CREATE INDEX idx_service_request_updates_request ON public.service_request_updates(service_request_id);
CREATE INDEX idx_service_request_updates_created ON public.service_request_updates(created_at DESC);

CREATE INDEX idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX idx_email_notifications_user ON public.email_notifications(user_id);

-- Enable RLS
ALTER TABLE public.concierge_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for concierge_messages
-- Users can view messages in their own conversations
CREATE POLICY "Users can view messages in their conversations"
ON public.concierge_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Users can send messages in their own conversations
CREATE POLICY "Users can send messages in their conversations"
ON public.concierge_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update messages in their conversations"
ON public.concierge_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND c.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for service_request_updates
-- Clients can view updates for their own service requests
CREATE POLICY "Clients can view their service request updates"
ON public.service_request_updates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.id = service_request_id AND sr.client_id = auth.uid()
  )
  AND is_visible_to_client = true
);

-- Admins can view all updates
CREATE POLICY "Admins can view all service request updates"
ON public.service_request_updates
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert updates
CREATE POLICY "Admins can insert service request updates"
ON public.service_request_updates
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Partners can view updates for assigned requests
CREATE POLICY "Partners can view assigned request updates"
ON public.service_request_updates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.service_requests sr
    JOIN public.partners p ON p.id = sr.partner_id
    WHERE sr.id = service_request_id AND p.user_id = auth.uid()
  )
);

-- Partners can insert updates for their assigned requests
CREATE POLICY "Partners can insert updates for assigned requests"
ON public.service_request_updates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.service_requests sr
    JOIN public.partners p ON p.id = sr.partner_id
    WHERE sr.id = service_request_id AND p.user_id = auth.uid()
  )
);

-- RLS Policies for email_notifications
-- Users can view their own email notifications
CREATE POLICY "Users can view their own email notifications"
ON public.email_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all notifications
CREATE POLICY "Admins can manage all email notifications"
ON public.email_notifications
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.concierge_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_request_updates;