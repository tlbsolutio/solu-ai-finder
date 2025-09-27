import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SeoContentInput {
  page_name: string;
  goal: string;
  audience: string;
  target_keywords: string[];
}

export interface SeoContentOutput {
  slug: string;
  seo_title: string;
  meta_description: string;
  h1: string;
  intro_text: string;
  cta: string;
  seo_keywords: string[];
}

export const useSeoContentGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<SeoContentOutput | null>(null);

  const generateContent = async (input: SeoContentInput): Promise<SeoContentOutput | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-seo-content', {
        body: input,
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedContent(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const saveContent = async (input: SeoContentInput, content: SeoContentOutput) => {
    try {
      const { error } = await supabase
        .from('seo_content')
        .insert({
          page_name: input.page_name,
          goal: input.goal,
          audience: input.audience,
          target_keywords: input.target_keywords,
          slug: content.slug,
          seo_title: content.seo_title,
          meta_description: content.meta_description,
          h1: content.h1,
          intro_text: content.intro_text,
          cta: content.cta,
          seo_keywords: content.seo_keywords,
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving SEO content:', err);
      return false;
    }
  };

  const loadSavedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error loading SEO content:', err);
      return [];
    }
  };

  return {
    isLoading,
    error,
    generatedContent,
    generateContent,
    saveContent,
    loadSavedContent,
  };
};