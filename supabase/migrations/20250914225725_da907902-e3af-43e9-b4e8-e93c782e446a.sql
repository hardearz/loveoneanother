-- Insert admin user into auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@loa.com.bb',
  crypt('admin', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Admin", "last_name": "User"}',
  false,
  'authenticated'
);

-- Insert corresponding profile record
INSERT INTO public.profiles (
  user_id,
  email,
  first_name,
  last_name,
  role,
  luv_balance
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@loa.com.bb'),
  'admin@loa.com.bb',
  'Admin',
  'User',
  'admin'::app_role,
  1000
);