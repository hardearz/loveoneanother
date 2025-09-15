-- Update the promote_admin_user function to check for admin@loa.com instead of admin@loa.com.bb
CREATE OR REPLACE FUNCTION public.promote_admin_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if the new profile has admin email and promote to admin
  IF NEW.email = 'admin@loa.com' THEN
    NEW.role = 'admin'::app_role;
    NEW.luv_balance = 1000;
  END IF;
  
  RETURN NEW;
END;
$function$