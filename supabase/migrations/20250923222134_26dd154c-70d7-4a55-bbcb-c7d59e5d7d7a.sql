-- Update RLS policy to prevent admins from claiming tasks
DROP POLICY IF EXISTS "Users can claim available tasks" ON public.tasks;

-- Create new policy that prevents admins from claiming tasks
CREATE POLICY "Non-admin users can claim available tasks" 
ON public.tasks 
FOR UPDATE
USING (
  (status = 'Available'::text) 
  AND (claimed_by IS NULL)
  AND (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'user'::app_role
  ))
)
WITH CHECK (
  (status = 'Claimed'::text) 
  AND (claimed_by IS NOT NULL) 
  AND (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.id = tasks.claimed_by
    AND p.role = 'user'::app_role
  ))
);