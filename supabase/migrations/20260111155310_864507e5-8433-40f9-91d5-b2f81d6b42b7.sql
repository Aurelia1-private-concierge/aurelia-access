-- Create function to handle auto commission creation when service request is completed
CREATE OR REPLACE FUNCTION public.create_commission_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_partner RECORD;
  v_commission_rate NUMERIC DEFAULT 15; -- Default 15% commission
  v_commission_amount NUMERIC;
  v_booking_amount NUMERIC;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Check if partner is assigned
    IF NEW.partner_id IS NOT NULL THEN
      -- Get partner info
      SELECT * INTO v_partner FROM public.partners WHERE id = NEW.partner_id;
      
      IF v_partner IS NOT NULL THEN
        -- Calculate booking amount (use budget_max or budget_min or default)
        v_booking_amount := COALESCE(NEW.budget_max, NEW.budget_min, 1000);
        
        -- Calculate commission
        v_commission_amount := v_booking_amount * (v_commission_rate / 100);
        
        -- Create commission record
        INSERT INTO public.partner_commissions (
          partner_id,
          client_id,
          service_request_id,
          service_title,
          booking_amount,
          commission_rate,
          commission_amount,
          status
        ) VALUES (
          NEW.partner_id,
          NEW.client_id,
          NEW.id,
          NEW.title,
          v_booking_amount,
          v_commission_rate,
          v_commission_amount,
          'pending'
        );
        
        RAISE LOG 'Commission created for partner % on request %', NEW.partner_id, NEW.id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto commission creation
DROP TRIGGER IF EXISTS trigger_create_commission_on_completion ON public.service_requests;
CREATE TRIGGER trigger_create_commission_on_completion
  AFTER UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_commission_on_completion();