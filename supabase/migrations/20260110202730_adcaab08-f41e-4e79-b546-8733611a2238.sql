-- Update the send_welcome_email function to include Authorization header
-- Note: This uses the service_role key stored in vault for secure authentication

CREATE OR REPLACE FUNCTION public.send_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Get user email and name from the new user
  user_email := NEW.email;
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1));
  
  -- Get Supabase URL and service role key
  supabase_url := 'https://dukohtdvhsdckizneksr.supabase.co';
  
  -- Get service role key from vault secrets
  SELECT decrypted_secret INTO service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
  LIMIT 1;
  
  -- If no service role key found, log and skip (don't break user creation)
  IF service_role_key IS NULL THEN
    RAISE LOG 'send_welcome_email: SUPABASE_SERVICE_ROLE_KEY not found in vault, skipping email';
    RETURN NEW;
  END IF;
  
  -- Call the send-email edge function with authorization
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'to', user_email,
      'subject', 'Welcome to Aurelia Private Concierge',
      'template', 'welcome',
      'data', jsonb_build_object('name', user_name)
    )
  );
  
  RETURN NEW;
END;
$$;