-- Create admin user using Supabase's auth functions
-- First, let's create a function to create the admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Create the user using Supabase's internal auth functions
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
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
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@loa.com.bb',
    crypt('admin', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Admin","last_name":"User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO admin_user_id;

  -- Insert the profile
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
END;
$$;

-- Execute the function to create the admin user
SELECT create_admin_user();

-- Drop the function after use
DROP FUNCTION create_admin_user();