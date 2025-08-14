import { useState, useEffect } from 'react';

interface SaaSItem {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  category: string;
  targets: string[];
  score: number;
  automation: number;
  ease?: number;
  price: string;
  features: string[];
  use_cases?: string[];
  pros?: string[];
  cons?: string[];
  website?: string;
  affiliate_link?: string;
  free_trial_link?: string;
  image: string;
}

interface CacheData {
  items: SaaSItem[];
  timestamp: number;
}

const CACHE_KEY = 'saas_catalogue_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useSaasCache = () => {
  const [cachedData, setCachedData] = useState<SaaSItem[] | null>(null);

  const getCachedData = (): SaaSItem[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: CacheData = JSON.parse(cached);
      const isExpired = Date.now() - data.timestamp > CACHE_DURATION;

      if (isExpired) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data.items;
    } catch {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  const setCacheData = (items: SaaSItem[]) => {
    try {
      const cacheData: CacheData = {
        items,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      setCachedData(items);
    } catch (error) {
      console.warn('Failed to cache SaaS data:', error);
    }
  };

  useEffect(() => {
    const cached = getCachedData();
    if (cached) {
      setCachedData(cached);
    }
  }, []);

  return {
    cachedData,
    getCachedData,
    setCacheData,
  };
};