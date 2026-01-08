-- Create enum for partner status
CREATE TYPE public.partner_status AS ENUM ('pending', 'approved', 'suspended', 'rejected');

-- Create enum for service categories
CREATE TYPE public.service_category AS ENUM (
  'private_aviation', 
  'yacht_charter', 
  'real_estate', 
  'collectibles', 
  'events_access', 
  'security', 
  'dining', 
  'travel', 
  'wellness', 
  'shopping'
);

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');

-- Create enum for user/partner roles
CREATE TYPE public.app_role AS ENUM ('admin', 'partner', 'member');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Partners table
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  website text,
  description text,
  logo_url text,
  categories service_category[] NOT NULL DEFAULT '{}',
  status partner_status NOT NULL DEFAULT 'pending',
  verification_documents text[],
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Partner services catalog
CREATE TABLE public.partner_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  category service_category NOT NULL,
  title text NOT NULL,
  description text,
  highlights text[],
  min_price numeric,
  max_price numeric,
  currency text DEFAULT 'USD',
  availability_notes text,
  images text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_services ENABLE ROW LEVEL SECURITY;

-- Client service requests
CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.partner_services(id) ON DELETE SET NULL,
  category service_category NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  requirements jsonb,
  preferred_date timestamptz,
  budget_min numeric,
  budget_max numeric,
  status request_status NOT NULL DEFAULT 'pending',
  partner_response text,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Partner messages (between partners and Aurelia staff/clients)
CREATE TABLE public.partner_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.service_requests(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  attachments text[],
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for partners
CREATE POLICY "Partners can view their own profile"
  ON public.partners FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Partners can update their own profile"
  ON public.partners FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can apply as partner"
  ON public.partners FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all partners"
  ON public.partners FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all partners"
  ON public.partners FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for partner_services
CREATE POLICY "Partners can manage their own services"
  ON public.partner_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.partners 
      WHERE partners.id = partner_services.partner_id 
      AND partners.user_id = auth.uid()
    )
  );

CREATE POLICY "Active services are viewable by members"
  ON public.partner_services FOR SELECT
  USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM public.partners 
      WHERE partners.id = partner_services.partner_id 
      AND partners.status = 'approved'
    )
  );

CREATE POLICY "Admins can manage all services"
  ON public.partner_services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for service_requests
CREATE POLICY "Clients can view their own requests"
  ON public.service_requests FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can create requests"
  ON public.service_requests FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Partners can view assigned requests"
  ON public.service_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partners 
      WHERE partners.id = service_requests.partner_id 
      AND partners.user_id = auth.uid()
    )
  );

CREATE POLICY "Partners can update assigned requests"
  ON public.service_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.partners 
      WHERE partners.id = service_requests.partner_id 
      AND partners.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all requests"
  ON public.service_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for partner_messages
CREATE POLICY "Users can view their own messages"
  ON public.partner_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.partner_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark messages as read"
  ON public.partner_messages FOR UPDATE
  USING (auth.uid() = recipient_id);

CREATE POLICY "Admins can view all messages"
  ON public.partner_messages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_services_updated_at
  BEFORE UPDATE ON public.partner_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();