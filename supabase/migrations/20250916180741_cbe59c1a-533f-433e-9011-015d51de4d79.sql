-- Mark admin@loa.com email as confirmed
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'admin@loa.com';