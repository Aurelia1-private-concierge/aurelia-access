-- Create a trigger to automatically grant partner role when admin approves
CREATE OR REPLACE FUNCTION public.grant_partner_role_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When partner status changes to 'approved', grant the partner role
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'partner')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- When partner status changes FROM 'approved' to something else, revoke the role
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    DELETE FROM public.user_roles 
    WHERE user_id = NEW.user_id AND role = 'partner';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger on partners table
DROP TRIGGER IF EXISTS auto_grant_partner_role ON public.partners;
CREATE TRIGGER auto_grant_partner_role
AFTER INSERT OR UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.grant_partner_role_on_approval();