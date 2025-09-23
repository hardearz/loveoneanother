-- Drop the existing check constraint
ALTER TABLE public.tasks DROP CONSTRAINT tasks_status_check;

-- Add the updated check constraint that includes 'Rejected' status
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
CHECK (status = ANY (ARRAY['Available'::text, 'Claimed'::text, 'Pending Approval'::text, 'Completed'::text, 'Rejected'::text]));