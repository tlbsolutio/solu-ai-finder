// Simple localStorage-based translation cache
export type TargetLang = 'EN' | 'FR';

const CACHE_KEY = 'deeplCache';

function loadCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function keyFor(text: string, target: TargetLang) {
  // Simple hash to avoid very long keys
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return `${target}:${h.toString(16)}`;
}

export function getCachedTranslation(text: string, target: TargetLang): string | undefined {
  const cache = loadCache();
  return cache[keyFor(text, target)];
}

export function setCachedTranslation(text: string, target: TargetLang, translated: string) {
  const cache = loadCache();
  cache[keyFor(text, target)] = translated;
  saveCache(cache);
}
