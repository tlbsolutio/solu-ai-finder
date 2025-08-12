import { supabase } from '@/integrations/supabase/client';
import { getCachedTranslation, setCachedTranslation, type TargetLang } from './translationCache';

export async function translateWithDeepl(texts: string[], target: TargetLang): Promise<Record<string, string>> {
  const unique = Array.from(new Set(texts.filter(Boolean)));

  const result: Record<string, string> = {};
  const toTranslate: string[] = [];

  for (const t of unique) {
    const cached = getCachedTranslation(t, target);
    if (cached) {
      result[t] = cached;
    } else {
      toTranslate.push(t);
    }
  }

  if (toTranslate.length) {
    const { data, error } = await supabase.functions.invoke('translate-with-deepl', {
      body: { texts: toTranslate, target_lang: target },
    });
    if (error) throw error;

    const translations: string[] = (data as any)?.translations || [];
    toTranslate.forEach((src, idx) => {
      const translated = translations[idx] ?? src;
      result[src] = translated;
      setCachedTranslation(src, target, translated);
    });
  }

  return result;
}
