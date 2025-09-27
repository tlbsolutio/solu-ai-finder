import { useState, useEffect } from 'react';

interface SaaSItem {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  categories: string[];
  targets: string[];
  score: number;
  automation: number;
  ease: number;
  priceText: string;
  features: string[];
  useCases: string[];
  pros: string[];
  cons: string[];
  logoUrl: string;
  website?: string;
  trialUrl?: string;
  affiliate?: string;
  pricingLinked?: PricingPlan[];
}

interface PricingPlan {
  id: string;
  plan: string;
  price: string;
  included: string[];
  popular: boolean;
}

interface CacheData {
  items: SaaSItem[];
  timestamp: number;
}

const CACHE_KEY = 'saas_catalogue_cache_v3';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hour cache

export const useSaasCache = () => {
  const [cachedData, setCachedData] = useState<SaaSItem[] | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const backgroundRefresh = async (refreshFn: () => Promise<SaaSItem[]>) => {
    if (isRefreshing) return; // Prevent duplicate requests
    
    setIsRefreshing(true);
    try {
      const newData = await refreshFn();
      setCacheData(newData);
    } catch (error) {
      console.warn('Background refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    cachedData,
    getCachedData,
    setCacheData,
    backgroundRefresh,
    isRefreshing,
  };
};