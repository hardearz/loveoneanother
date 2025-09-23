-- Fix RLS policy for luv_transactions to allow admins to create reward transactions
DROP POLICY IF EXISTS "Users can create transactions" ON public.luv_transactions;

-- Create a new policy that allows:
-- 1. Users to create transactions they send from their own profile
-- 2. Admins to create any transactions (for task rewards)
CREATE POLICY "Users can create transactions and admins can create any transactions" 
ON public.luv_transactions 
FOR INSERT 
WITH CHECK (
  -- Users can create transactions from their own profile
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = luv_transactions.from_user_id 
    AND profiles.user_id = auth.uid()
  ))
  OR
  -- Admins can create any transactions (for task rewards)
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'::app_role
  ))
);

-- Also need to allow admins to update user profiles (for LUV balance updates)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile and admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  -- Users can update their own profile
  (auth.uid() = user_id)
  OR
  -- Admins can update any profile
  (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'::app_role
  ))
);

-- Allow admins to read any profile (needed for task approval to check user balance)
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;

CREATE POLICY "Users can view own profile and admins can view any profile" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can view their own profile
  (auth.uid() = user_id)
  OR
  -- Admins can view any profile
  (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'::app_role
  ))
);