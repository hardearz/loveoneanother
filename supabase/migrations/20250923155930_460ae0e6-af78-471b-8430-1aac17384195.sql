-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile and admins can view any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile and admins can update any profile" ON public.profiles;

-- Recreate policies without recursive lookups
-- For SELECT: Use a security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
$$;

-- Simpler policies without recursion
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view any profile" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin());