-- Create table to store SMS/WhatsApp conversations
CREATE TABLE public.sms_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms', 'whatsapp')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message TEXT NOT NULL,
  twilio_message_sid TEXT,
  in_reply_to UUID REFERENCES public.sms_conversations(id),
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_sms_conversations_phone ON public.sms_conversations(phone_number);
CREATE INDEX idx_sms_conversations_created ON public.sms_conversations(created_at DESC);
CREATE INDEX idx_sms_conversations_user ON public.sms_conversations(user_id) WHERE user_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.sms_conversations ENABLE ROW LEVEL SECURITY;

-- Admin can see all conversations
CREATE POLICY "Admins can view all SMS conversations"
ON public.sms_conversations
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Users can view their own linked conversations
CREATE POLICY "Users can view their own SMS conversations"
ON public.sms_conversations
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can insert (for webhook)
CREATE POLICY "Service role can insert SMS"
ON public.sms_conversations
FOR INSERT
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.sms_conversations IS 'Stores all SMS and WhatsApp conversations with Orla';
