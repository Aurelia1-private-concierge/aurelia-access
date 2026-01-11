-- Create partner prospects table for tracking potential partners
CREATE TABLE public.partner_prospects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  coverage_regions TEXT[],
  description TEXT,
  source TEXT DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT DEFAULT 'medium',
  notes TEXT,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  follow_up_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  converted_partner_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create partner outreach logs table
CREATE TABLE public.partner_outreach_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID NOT NULL REFERENCES public.partner_prospects(id) ON DELETE CASCADE,
  outreach_type TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  sent_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_received BOOLEAN DEFAULT false,
  response_at TIMESTAMP WITH TIME ZONE,
  response_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email templates table
CREATE TABLE public.outreach_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_outreach_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_prospects (admin only)
CREATE POLICY "Admins can manage partner prospects" 
ON public.partner_prospects 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for partner_outreach_logs (admin only)
CREATE POLICY "Admins can manage outreach logs" 
ON public.partner_outreach_logs 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for outreach_templates (admin only)
CREATE POLICY "Admins can manage outreach templates" 
ON public.outreach_templates 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at triggers
CREATE TRIGGER update_partner_prospects_updated_at
  BEFORE UPDATE ON public.partner_prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_outreach_templates_updated_at
  BEFORE UPDATE ON public.outreach_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates
INSERT INTO public.outreach_templates (name, category, subject, body, variables) VALUES
('Initial Outreach - Aviation', 'private_aviation', 
 'Partnership Opportunity with Aurelia Private Concierge',
 E'Dear {{contact_name}},\n\nI hope this message finds you well. My name is {{sender_name}}, and I am reaching out on behalf of Aurelia Private Concierge, an exclusive lifestyle management service catering to ultra-high-net-worth individuals worldwide.\n\nWe have been following {{company_name}}''s exceptional reputation in private aviation and believe there is a compelling opportunity for partnership. Our discerning clientele frequently requires premium aviation services, and we are seeking world-class providers to join our curated network.\n\nAs a partner, you would benefit from:\n• Direct access to qualified UHNW clients\n• Priority referrals from our concierge team\n• Streamlined booking processes\n• Commission-based revenue opportunities\n\nI would welcome the opportunity to discuss how we might collaborate. Would you be available for a brief call this week?\n\nWarm regards,\n{{sender_name}}\nAurelia Private Concierge\n{{sender_email}}',
 ARRAY['contact_name', 'company_name', 'sender_name', 'sender_email']),

('Initial Outreach - Yacht Charter', 'yacht_charter',
 'Exclusive Partnership Invitation - Aurelia Private Concierge',
 E'Dear {{contact_name}},\n\nI am writing to introduce Aurelia Private Concierge, a premier lifestyle management service for discerning individuals seeking extraordinary experiences.\n\n{{company_name}}''s reputation for exceptional yacht charter services has not gone unnoticed. We are expanding our network of elite maritime partners and believe your company would be an ideal fit.\n\nOur members frequently charter superyachts for Mediterranean, Caribbean, and worldwide destinations. By partnering with Aurelia, you would gain:\n• Access to pre-qualified, high-value clients\n• Dedicated relationship management\n• Seamless integration with our booking platform\n• Competitive commission structure\n\nI would be delighted to arrange a call to explore this opportunity further.\n\nBest regards,\n{{sender_name}}\nAurelia Private Concierge',
 ARRAY['contact_name', 'company_name', 'sender_name']),

('Initial Outreach - Real Estate', 'real_estate',
 'Strategic Partnership - Luxury Real Estate & Aurelia Concierge',
 E'Dear {{contact_name}},\n\nAurelia Private Concierge represents an exclusive clientele of ultra-high-net-worth individuals with significant real estate interests across global markets.\n\nWe are impressed by {{company_name}}''s portfolio and market presence, and we are seeking premier real estate partners to serve our members'' acquisition and investment needs.\n\nPartnership benefits include:\n• Qualified buyer/investor introductions\n• Off-market opportunity access for our clients\n• Concierge-supported transaction coordination\n• Long-term relationship cultivation\n\nMay I schedule a brief introduction call to discuss alignment?\n\nKind regards,\n{{sender_name}}\nAurelia Private Concierge',
 ARRAY['contact_name', 'company_name', 'sender_name']),

('Follow-up Email', 'general',
 'Following Up - Aurelia Partnership Opportunity',
 E'Dear {{contact_name}},\n\nI wanted to follow up on my previous message regarding a potential partnership between {{company_name}} and Aurelia Private Concierge.\n\nOur clients continue to seek exceptional {{service_type}} services, and we believe {{company_name}} would be an excellent addition to our partner network.\n\nI would be happy to provide more information or arrange a call at your convenience. Please let me know if you have any questions.\n\nWarm regards,\n{{sender_name}}\nAurelia Private Concierge',
 ARRAY['contact_name', 'company_name', 'service_type', 'sender_name']),

('Initial Outreach - Security', 'security',
 'Executive Protection Partnership - Aurelia Private Concierge',
 E'Dear {{contact_name}},\n\nAurelia Private Concierge provides comprehensive lifestyle management for high-profile individuals who require discretion, security, and exceptional service.\n\nWe are expanding our security partner network and have identified {{company_name}} as a leader in executive protection services. Our clients frequently require:\n• Travel security assessments\n• Close protection details\n• Secure transportation coordination\n• Event security management\n\nWe would value the opportunity to discuss a strategic partnership.\n\nRespectfully,\n{{sender_name}}\nAurelia Private Concierge',
 ARRAY['contact_name', 'company_name', 'sender_name']);