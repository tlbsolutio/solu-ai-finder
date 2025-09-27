-- Create function to update timestamps first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create SEO content table for storing generated content
CREATE TABLE public.seo_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL,
  goal TEXT NOT NULL,
  audience TEXT NOT NULL,
  target_keywords TEXT[] NOT NULL,
  slug TEXT NOT NULL,
  seo_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1 TEXT NOT NULL,
  intro_text TEXT NOT NULL,
  cta TEXT NOT NULL,
  seo_keywords TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_content ENABLE ROW LEVEL SECURITY;

-- Create policies - making it public for now since this is content management
CREATE POLICY "SEO content is publicly readable" 
ON public.seo_content 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create SEO content" 
ON public.seo_content 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update SEO content" 
ON public.seo_content 
FOR UPDATE 
USING (true);

-- Add trigger for timestamps
CREATE TRIGGER update_seo_content_updated_at
BEFORE UPDATE ON public.seo_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();