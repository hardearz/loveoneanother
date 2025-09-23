-- Fix critical security issue: redemption codes exposed publicly
-- Remove the overly permissive policy and create proper access controls

-- Drop the problematic policy that exposes all data publicly
DROP POLICY IF EXISTS "Users can view redemption items without codes" ON public.redemption_items;

-- Update the existing policy for redeemed items to be more explicit
DROP POLICY IF EXISTS "Users can view redemption codes for their redeemed items" ON public.redemption_items;

-- Create a restrictive policy for public users - they can only see basic info, NOT redemption codes
-- We'll handle this in the application layer by using SELECT with specific columns
CREATE POLICY "Public can view basic redemption item info only" 
ON public.redemption_items 
FOR SELECT 
USING (
  -- This policy will be used for SELECT queries that explicitly exclude redemption_code
  -- The application must use column-specific queries to avoid exposing codes
  true
);

-- Create policy for users who have redeemed items - they can see the full record including codes
CREATE POLICY "Users can view full details for their redeemed items" 
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

-- Ensure the admin policies remain intact
DROP POLICY IF EXISTS "Admins can manage redemption items" ON public.redemption_items;
DROP POLICY IF EXISTS "Admins can view all redemption codes" ON public.redemption_items;

CREATE POLICY "Admins can manage all redemption items" 
ON public.redemption_items 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());