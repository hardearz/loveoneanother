-- Fix security vulnerability: Restrict profile access to own data only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policy that only allows users to view their own profile
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);