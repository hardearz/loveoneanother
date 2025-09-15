-- Clean up any existing data and create fresh admin user
-- First, remove any existing profile and user for this email
DELETE FROM public.profiles WHERE email = 'admin@loa.com.bb';
DELETE FROM auth.users WHERE email = 'admin@loa.com.bb';

-- Now create the admin user properly
DO $$
DECLARE
  admin_user_id uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    email_change_confirm_status,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id,
    'authenticated',
    'authenticated',
    'admin@loa.com.bb',
    crypt('admin', gen_salt('bf')),
    NOW(),
    0,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Admin","last_name":"User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- Insert into profiles
  INSERT INTO public.profiles (
    user_id,
    email,
    first_name,
    last_name,
    role,
    luv_balance
  ) VALUES (
    admin_user_id,
    'admin@loa.com.bb',
    'Admin',
    'User',
    'admin'::app_role,
    1000
  );
END $$;