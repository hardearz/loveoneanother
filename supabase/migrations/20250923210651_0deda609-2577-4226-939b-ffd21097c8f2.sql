-- Fix critical security issue: redemption codes exposed publicly
-- Clean slate approach - drop all existing policies and recreate them properly

-- Drop ALL existing policies on redemption_items table
DROP POLICY IF EXISTS "Admins can manage redemption items" ON public.redemption_items;
DROP POLICY IF EXISTS "Admins can view all redemption codes" ON public.redemption_items;
DROP POLICY IF EXISTS "Users can view redemption codes for their redeemed items" ON public.redemption_items;
DROP POLICY IF EXISTS "Users can view redemption items without codes" ON public.redemption_items;
DROP POLICY IF EXISTS "Public can view basic redemption item info only" ON public.redemption_items;
DROP POLICY IF EXISTS "Users can view redemption codes for their redeemed items only" ON public.redemption_items;
DROP POLICY IF EXISTS "Admins can manage all redemption items" ON public.redemption_items;

-- Now create the secure policies from scratch
-- 1. Admin policy - full access for administrators
CREATE POLICY "Admins have full access to redemption items" 
ON public.redemption_items 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- 2. Policy for users who have redeemed items - they can see codes
CREATE POLICY "Users can view codes for their redeemed items" 
ON public.redemption_items 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 
    FROM public.user_redemptions ur
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE ur.user_id = p.id 
    AND ur.redemption_item_id = redemption_items.id
  )
);

-- 3. Create a secure function that returns only non-sensitive data for public access
CREATE OR REPLACE FUNCTION public.get_public_redemption_items()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  partner_name text,
  price_in_luvs integer,
  validity_start timestamp with time zone,
  validity_end timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) 
LANGUAGE sql 
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    r.id,
    r.name,
    r.description,
    r.partner_name,
    r.price_in_luvs,
    r.validity_start,
    r.validity_end,
    r.created_at,
    r.updated_at
  FROM public.redemption_items r;
$$;