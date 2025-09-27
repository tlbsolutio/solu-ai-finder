-- Fix security vulnerability: Restrict SEO content modification to authenticated users only

-- Drop existing insecure policies
DROP POLICY IF EXISTS "Anyone can create SEO content" ON public.seo_content;
DROP POLICY IF EXISTS "Anyone can update SEO content" ON public.seo_content;

-- Create secure policies that require authentication
CREATE POLICY "Authenticated users can create SEO content" 
ON public.seo_content 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update SEO content" 
ON public.seo_content 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete SEO content" 
ON public.seo_content 
FOR DELETE 
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Keep SELECT policy as public since SEO content should be readable
-- (The existing "SEO content is publicly readable" policy remains unchanged)