-- Fix security vulnerability: Restrict access to redemption codes
-- Step 1: Create user_redemptions table to track legitimate redemptions
CREATE TABLE public.user_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  redemption_item_id UUID NOT NULL REFERENCES public.redemption_items(id),
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  luvs_spent INTEGER NOT NULL,
  UNIQUE(user_id, redemption_item_id)
);

-- Enable RLS on user_redemptions
ALTER TABLE public.user_redemptions ENABLE ROW LEVEL SECURITY;

-- Step 2: Update redemption_items RLS policies
-- Remove the dangerous "Anyone can view redemption items" policy
DROP POLICY IF EXISTS "Anyone can view redemption items" ON public.redemption_items;

-- Create secure policies for redemption_items
-- Users can view redemption items but NOT the redemption codes
CREATE POLICY "Users can view redemption items without codes" 
ON public.redemption_items 
FOR SELECT 
USING (true);

-- Only users who have redeemed an item can see its redemption code
CREATE POLICY "Users can view redemption codes for their redeemed items" 
ON public.redemption_items 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.user_redemptions ur
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE ur.user_id = p.id 
    AND ur.redemption_item_id = redemption_items.id
  )
);

-- Step 3: Create policies for user_redemptions table
-- Users can view their own redemptions
CREATE POLICY "Users can view their own redemptions" 
ON public.user_redemptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.id = user_redemptions.user_id
  )
);

-- Users can create redemptions for themselves
CREATE POLICY "Users can create their own redemptions" 
ON public.user_redemptions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.id = user_redemptions.user_id
  )
);

-- Admins can manage all redemptions and see all redemption codes
CREATE POLICY "Admins can view all redemptions" 
ON public.user_redemptions 
FOR ALL 
USING (is_admin());

CREATE POLICY "Admins can view all redemption codes" 
ON public.redemption_items 
FOR ALL 
USING (is_admin());

-- Step 4: Create function to handle secure redemption process
CREATE OR REPLACE FUNCTION public.redeem_item(
  item_id UUID
) RETURNS JSON AS $$
DECLARE
  current_user_profile public.profiles%ROWTYPE;
  redemption_item public.redemption_items%ROWTYPE;
  redemption_record public.user_redemptions%ROWTYPE;
  result JSON;
BEGIN
  -- Get current user profile
  SELECT * INTO current_user_profile 
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User profile not found');
  END IF;
  
  -- Get redemption item
  SELECT * INTO redemption_item 
  FROM public.redemption_items 
  WHERE id = item_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Redemption item not found');
  END IF;
  
  -- Check if user has enough LUVs
  IF current_user_profile.luv_balance < redemption_item.price_in_luvs THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient LUV balance');
  END IF;
  
  -- Check if user has already redeemed this item
  SELECT * INTO redemption_record 
  FROM public.user_redemptions 
  WHERE user_id = current_user_profile.id AND redemption_item_id = item_id;
  
  IF FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Item already redeemed');
  END IF;
  
  -- Deduct LUVs from user balance
  UPDATE public.profiles 
  SET luv_balance = luv_balance - redemption_item.price_in_luvs 
  WHERE id = current_user_profile.id;
  
  -- Create redemption record
  INSERT INTO public.user_redemptions (user_id, redemption_item_id, luvs_spent)
  VALUES (current_user_profile.id, item_id, redemption_item.price_in_luvs)
  RETURNING * INTO redemption_record;
  
  -- Return success with redemption code
  RETURN json_build_object(
    'success', true, 
    'redemption_code', redemption_item.redemption_code,
    'redemption_id', redemption_record.id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;