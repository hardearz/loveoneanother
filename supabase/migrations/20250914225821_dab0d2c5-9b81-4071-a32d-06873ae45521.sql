-- Update existing user to admin role if they exist
UPDATE public.profiles 
SET 
  role = 'admin'::app_role,
  first_name = 'Admin',
  last_name = 'User',
  luv_balance = 1000
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'admin@loa.com.bb'
);