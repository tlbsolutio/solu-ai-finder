import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Star, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { translateWithDeepl } from '@/utils/translate';
import { Skeleton } from '@/components/ui/skeleton';
import { CatalogueCardSkeleton } from '@/components/ui/loading-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSaasCache } from '@/hooks/useSaasCache';
import { useDebounce } from '@/hooks/useDebounce';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import SaasCard from '@/components/SaasCard';

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
}

const Catalogue = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cachedData, getCachedData, setCacheData } = useSaasCache();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const LOAD_STEP = 12;
  const INITIAL_COUNT = 12;

  // Reset visible count on filters/language change
  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [debouncedSearchQuery, selectedCategory, selectedTarget, language]);

  // Set filters from URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(decodeURIComponent(categoryParam));
    }
    
    // Handle search parameter from AI recommendations
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
    }
  }, [searchParams]);

  // Single state for SaaS data (no more double state)
  const [displayData, setDisplayData] = useState<SaaSItem[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [originalData, setOriginalData] = useState<SaaSItem[]>([]);
  const autoRecoveryRef = React.useRef(false);
  const categories = useMemo(
    () => Array.from(new Set(displayData.flatMap((i) => i.categories))).sort(),
    [displayData]
  );
  const targets = useMemo(
    () => Array.from(new Set(displayData.flatMap((i) => i.targets))).sort(),
    [displayData]
  );

  // Display labels (translated in EN)
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
  const [targetLabels, setTargetLabels] = useState<Record<string, string>>({});

  // Fetch from Edge Function (Airtable) with cache
  useEffect(() => {
    const uiUrl =
      searchParams.get('uiUrl') ||
      'https://airtable.com/appayjYdBAGkJak1e/tblzQQ7ivUGHqTBTF/viwjGA16J4vctsYXf?blocks=hide';

    // Check cache first
    const cached = getCachedData();
    if (cached && cached.length > 0) {
      setOriginalData(cached);
      setDisplayData(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    (async () => {
      const { data, error } = await supabase.functions.invoke('get-saas-from-airtable', {
        body: { uiUrl },
      });
      if (error) {
        console.error('Airtable fetch error', error);
        const status: number | undefined = (error as any)?.status;
        const baseMsg = 'Impossible de charger le catalogue (Airtable).';
        const details = status === 401
          ? 'Authentification Airtable échouée. Vérifiez la clé et les autorisations.'
          : (error.message || 'Erreur inconnue');
        setErrorMsg(`${baseMsg} ${details}`);
        setDisplayData([]);
        setLoading(false);
        return;
      }
      const items = (data as any)?.items as SaaSItem[];
      setOriginalData(items || []);
      setDisplayData(items || []);
      setCacheData(items || []); // Cache the data
      setLoading(false);
    })();
  }, [searchParams, getCachedData, setCacheData]);

  // Auto-recovery mechanism for expired image URLs
  useEffect(() => {
    const handleImageError = async () => {
      if (autoRecoveryRef.current) return; // Only once per session
      autoRecoveryRef.current = true;
      
      const uiUrl = searchParams.get('uiUrl') || 'https://airtable.com/appayjYdBAGkJak1e/tblzQQ7ivUGHqTBTF/viwjGA16J4vctsYXf?blocks=hide';
      
      try {
        const { data, error } = await supabase.functions.invoke('get-saas-from-airtable', {
          body: { uiUrl },
        });
        if (!error && data?.items) {
          setOriginalData(data.items);
          setDisplayData(data.items);
          setCacheData(data.items);
        }
      } catch (e) {
        console.warn('Auto-recovery failed:', e);
      }
    };

    window.addEventListener('saas-image-error', handleImageError);
    return () => window.removeEventListener('saas-image-error', handleImageError);
  }, [searchParams, setCacheData]);

  // Translate to EN on the fly (without clearing displayData)
  useEffect(() => {
    const run = async () => {
      if (language === 'en' && originalData.length > 0) {
        setIsTranslating(true);
        const textSet = new Set<string>();
        originalData.forEach((i) => {
          textSet.add(i.name);
          textSet.add(i.description);
          i.features.forEach((f) => textSet.add(f));
        });
        // Also translate category/target labels for display
        categories.forEach((c) => textSet.add(c));
        targets.forEach((t) => textSet.add(t));

        const texts = Array.from(textSet);
        if (texts.length === 0) {
          setIsTranslating(false);
          return;
        }

        try {
          const map = await translateWithDeepl(texts, 'EN');

          // Map items
          const translatedItems = originalData.map((i) => ({
            ...i,
            name: map[i.name] || i.name,
            description: map[i.description] || i.description,
            features: i.features.map((f) => map[f] || f),
          }));

          // Display labels
          const catMap: Record<string, string> = {};
          categories.forEach((c) => (catMap[c] = map[c] || c));
          const tgtMap: Record<string, string> = {};
          targets.forEach((tg) => (tgtMap[tg] = map[tg] || tg));

          setDisplayData(translatedItems);
          setCategoryLabels(catMap);
          setTargetLabels(tgtMap);
        } catch (e) {
          console.error('Translation error', e);
          // Keep current displayData on error, don't clear it
          setCategoryLabels({});
          setTargetLabels({});
        }
        setIsTranslating(false);
      } else if (language === 'fr' && originalData.length > 0) {
        // Use original French data
        setDisplayData(originalData);
        // Identity labels in FR
        const catMap: Record<string, string> = {};
        categories.forEach((c) => (catMap[c] = c));
        const tgtMap: Record<string, string> = {};
        targets.forEach((tg) => (tgtMap[tg] = tg));
        setCategoryLabels(catMap);
        setTargetLabels(tgtMap);
      }
    };

    run();
  }, [language, originalData, categories, targets]);

// Memoized filtered data for better performance
const filteredSaaS = useMemo(() => {
  return displayData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || item.categories.includes(selectedCategory);
    const matchesTarget = !selectedTarget || selectedTarget === 'all' || item.targets.includes(selectedTarget);
    
    return matchesSearch && matchesCategory && matchesTarget;
  });
}, [displayData, debouncedSearchQuery, selectedCategory, selectedTarget]);

// Memoized visible items to prevent unnecessary re-calculations
const { totalItems, showingFrom, showingTo, visibleItems } = useMemo(() => {
  const total = filteredSaaS.length;
  const from = total === 0 ? 0 : 1;
  const to = Math.min(visibleCount, total);
  const visible = filteredSaaS.slice(0, visibleCount);
  
  return {
    totalItems: total,
    showingFrom: from,
    showingTo: to,
    visibleItems: visible
  };
}, [filteredSaaS, visibleCount]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || errorMsg) return;
    const el = sentinelRef.current;
    if (!el) return;
    if (visibleCount >= totalItems) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setVisibleCount((c) => Math.min(c + LOAD_STEP, totalItems));
      }
    }, { threshold: 0.1 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, errorMsg, visibleCount, totalItems]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('catalog.title')}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('catalog.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-soft">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('catalog.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('catalog.filter_category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('catalog.all_categories')}</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{categoryLabels[cat] || cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Target filter */}
              <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                <SelectTrigger>
                  <SelectValue placeholder={t('catalog.filter_target')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('catalog.all_targets')}</SelectItem>
                  {targets.map(target => (
                    <SelectItem key={target} value={target}>{targetLabels[target] || target}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error state */}
        {errorMsg && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* Results count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              {t('catalog.showing_count', { from: String(showingFrom), to: String(showingTo), total: String(totalItems) })}
            </p>
          </div>
        )}

        {/* SaaS Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {loading
            ? Array.from({ length: visibleCount }).map((_, i) => (
                <Card key={`skeleton-${i}`} className="overflow-hidden h-full flex flex-col">
                  <Skeleton className="w-full h-32" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-12" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            : visibleItems.map((saas) => (
                <SaasCard
                  key={saas.id}
                  saas={saas}
                  selectedCategory={selectedCategory}
                  categoryLabels={categoryLabels}
                  onCardClick={() => navigate(`/saas/${encodeURIComponent(saas.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''))}`)}
                />
              ))}
        </div>

        {/* Empty State */}
        {!loading && visibleItems.length === 0 && (
          <div className="text-center py-16">
            <DollarSign className="h-24 w-24 mx-auto mb-6 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-3">{t('catalog.no_results_title')}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('catalog.no_results_description')}
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedTarget('');
                }}
              >
                {t('catalog.clear_filters')}
              </Button>
            </div>
          </div>
        )}

        {/* Infinite Scroll Sentinel */}
        {!loading && visibleCount < totalItems && (
          <div ref={sentinelRef} className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogue;
