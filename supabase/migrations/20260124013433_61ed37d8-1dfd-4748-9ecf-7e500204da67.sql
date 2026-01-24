-- Create concierge_requests table for managing guest and member requests
CREATE TABLE public.concierge_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email TEXT,
  guest_name TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_range TEXT,
  preferred_date TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'normal',
  internal_notes TEXT,
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.concierge_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (admins can manage all requests)
CREATE POLICY "Admins can view all concierge requests" 
ON public.concierge_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update all concierge requests" 
ON public.concierge_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete concierge requests" 
ON public.concierge_requests 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Users can view their own requests
CREATE POLICY "Users can view their own requests" 
ON public.concierge_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Anyone can create a request (for guest submissions)
CREATE POLICY "Anyone can create concierge requests" 
ON public.concierge_requests 
FOR INSERT 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_concierge_requests_status ON public.concierge_requests(status);
CREATE INDEX idx_concierge_requests_user_id ON public.concierge_requests(user_id);
CREATE INDEX idx_concierge_requests_created_at ON public.concierge_requests(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_concierge_requests_updated_at
BEFORE UPDATE ON public.concierge_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();