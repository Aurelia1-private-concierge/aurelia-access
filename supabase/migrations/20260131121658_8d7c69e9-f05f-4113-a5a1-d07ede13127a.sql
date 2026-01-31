-- Fix profiles table RLS policies
-- Remove policies that target 'public' role (includes anon) and replace with 'authenticated' only

-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Create proper authenticated-only policies for profiles
CREATE POLICY "Authenticated users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete own profile" 
ON public.profiles FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- Admin access for profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix login_devices table RLS policies
-- Remove duplicate and overly permissive policies

DROP POLICY IF EXISTS "Users can view their own devices" ON public.login_devices;
DROP POLICY IF EXISTS "Users can view own login devices" ON public.login_devices;
DROP POLICY IF EXISTS "Users can insert their own devices" ON public.login_devices;
DROP POLICY IF EXISTS "Users can update their own devices" ON public.login_devices;
DROP POLICY IF EXISTS "Users can delete their own devices" ON public.login_devices;

-- Create proper authenticated-only policies for login_devices
CREATE POLICY "Authenticated users can view own devices" 
ON public.login_devices FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own devices" 
ON public.login_devices FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own devices" 
ON public.login_devices FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete own devices" 
ON public.login_devices FOR DELETE 
TO authenticated
USING (user_id = auth.uid());