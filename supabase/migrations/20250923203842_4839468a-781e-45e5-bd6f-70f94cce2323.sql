-- Fix RLS policy to allow users to release their claimed tasks
-- The current policy doesn't allow setting claimed_by to null because it can't verify ownership
-- We need to update the policy to check the current state before the update

-- First, let's see the current policy by recreating it properly
-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can claim available tasks and update their claimed tasks" ON public.tasks;

-- Create a better policy that handles task release properly
-- Users can claim available tasks (status = 'Available' AND claimed_by IS NULL)
CREATE POLICY "Users can claim available tasks" 
ON public.tasks 
FOR UPDATE 
USING (
  status = 'Available' AND 
  claimed_by IS NULL
) 
WITH CHECK (
  status = 'Claimed' AND 
  claimed_by IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.id = tasks.claimed_by
  )
);

-- Users can update their own claimed tasks (including releasing them)
CREATE POLICY "Users can update their claimed tasks" 
ON public.tasks 
FOR UPDATE 
USING (
  claimed_by IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.id = tasks.claimed_by
  )
) 
WITH CHECK (
  -- Allow any status change for tasks they currently own
  -- This includes releasing (status = 'Available', claimed_by = NULL)
  -- and submitting proof (status = 'Pending Approval')
  true
);