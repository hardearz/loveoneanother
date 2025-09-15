-- Create function to handle admin promotion
CREATE OR REPLACE FUNCTION promote_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new profile has admin email and promote to admin
  IF NEW.email = 'admin@loa.com.bb' THEN
    NEW.role = 'admin'::app_role;
    NEW.luv_balance = 1000;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically promote admin user
CREATE TRIGGER promote_admin_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION promote_admin_user();