-- Enable pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to send welcome email via edge function
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
  
  -- Get Supabase URL from environment
  supabase_url := 'https://dukohtdvhsdckizneksr.supabase.co';
  
  -- Call the send-email edge function
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
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

-- Create trigger to send welcome email after user creation
DROP TRIGGER IF EXISTS on_auth_user_created_send_welcome ON auth.users;
CREATE TRIGGER on_auth_user_created_send_welcome
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email();