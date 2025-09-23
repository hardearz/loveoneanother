-- Fix RLS policy to allow users to claim available tasks
DROP POLICY IF EXISTS "Users can update claimed tasks" ON public.tasks;

-- Create a new policy that allows users to:
-- 1. Claim available tasks (set claimed_by to their profile id)
-- 2. Update tasks they have already claimed (submit proof, etc.)
CREATE POLICY "Users can claim available tasks and update their claimed tasks" 
ON public.tasks 
FOR UPDATE 
USING (
  -- Allow claiming available tasks
  (status = 'Available' AND claimed_by IS NULL)
  OR 
  -- Allow updating tasks they have claimed
  (claimed_by IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = tasks.claimed_by 
    AND profiles.user_id = auth.uid()
  ))
)
WITH CHECK (
  -- Allow claiming available tasks (setting claimed_by to user's profile)
  (status = 'Available' AND claimed_by IS NULL AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = tasks.claimed_by 
    AND profiles.user_id = auth.uid()
  ))
  OR
  -- Allow updating tasks they have claimed
  (claimed_by IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = tasks.claimed_by 
    AND profiles.user_id = auth.uid()
  ))
);