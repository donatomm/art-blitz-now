-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON public.site_settings;

-- Create new policy: only admins can view site settings
CREATE POLICY "Admins can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));