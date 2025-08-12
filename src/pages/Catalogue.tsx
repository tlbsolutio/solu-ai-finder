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

interface SaaSItem {
  id: string;
  name: string;
  description: string;
  category: string;
  targets: string[];
  score: number;
  automation: number;
  price: string;
  features: string[];
  image: string;
}

const Catalogue = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');

  // Set category filter from URL params on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(decodeURIComponent(categoryParam));
    }
  }, [searchParams]);

  // Dynamic SaaS data from Airtable
  const [saasData, setSaasData] = useState<SaaSItem[]>([]);
  const [displayData, setDisplayData] = useState<SaaSItem[]>([]);
  const categories = useMemo(
    () => Array.from(new Set(saasData.map((i) => i.category))).sort(),
    [saasData]
  );
  const targets = useMemo(
    () => Array.from(new Set(saasData.flatMap((i) => i.targets))).sort(),
    [saasData]
  );

  // Display labels (translated in EN)
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
  const [targetLabels, setTargetLabels] = useState<Record<string, string>>({});

  // Fetch from Edge Function (Airtable)
  useEffect(() => {
    const baseId = searchParams.get('airtableBase') || searchParams.get('baseId');
    const table = searchParams.get('table') || undefined;
    const view = searchParams.get('view') || undefined;

    if (!baseId) {
      setSaasData([]);
      setDisplayData([]);
      return;
    }

    (async () => {
      const { data, error } = await supabase.functions.invoke('get-saas-from-airtable', {
        body: { baseId, table, view },
      });
      if (error) {
        console.error('Airtable fetch error', error);
        setSaasData([]);
        setDisplayData([]);
        return;
      }
      const items = (data as any)?.items as SaaSItem[];
      setSaasData(items || []);
      setDisplayData(items || []);
    })();
  }, [searchParams]);

  // Translate to EN on the fly (and cache)
  useEffect(() => {
    const run = async () => {
      if (language === 'en') {
        const textSet = new Set<string>();
        saasData.forEach((i) => {
          textSet.add(i.name);
          textSet.add(i.description);
          i.features.forEach((f) => textSet.add(f));
        });
        // Also translate category/target labels for display
        categories.forEach((c) => textSet.add(c));
        targets.forEach((t) => textSet.add(t));

        const texts = Array.from(textSet);
        if (texts.length === 0) {
          setDisplayData([]);
          setCategoryLabels({});
          setTargetLabels({});
          return;
        }

        try {
          const map = await translateWithDeepl(texts, 'EN');

          // Map items
          const translatedItems = saasData.map((i) => ({
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
          setDisplayData(saasData);
          setCategoryLabels({});
          setTargetLabels({});
        }
      } else {
        setDisplayData(saasData);
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
  }, [language, saasData, categories, targets]);

  const filteredSaaS = displayData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || item.category === selectedCategory;
    const matchesTarget = !selectedTarget || selectedTarget === 'all' || item.targets.includes(selectedTarget);
    return matchesSearch && matchesCategory && matchesTarget;
  });

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

        {/* Results count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredSaaS.length} {filteredSaaS.length === 1 ? 'solution trouvée' : 'solutions trouvées'}
          </p>
        </div>

        {/* SaaS Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSaaS.map(saas => (
            <Card key={saas.id} className="group hover:shadow-medium transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={saas.image} 
                  alt={`Logo ${saas.name} - ${saas.category}`}
                  loading="lazy"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90">
                    <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                    {saas.score}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{saas.name}</CardTitle>
                  <Badge variant="outline">{categoryLabels[saas.category] || saas.category}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">{saas.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">{saas.automation}% auto.</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">{saas.price}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('catalog.key_features')}:</p>
                  <div className="flex flex-wrap gap-1">
                    {saas.features.slice(0, 3).map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Targets */}
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">
                    {saas.targets.map((tg) => targetLabels[tg] || tg).join(', ')}
                  </span>
                </div>

                {/* Action button */}
                <Button 
                  className="w-full" 
                  variant="hero"
                  onClick={() => navigate(`/saas/${saas.id}`)}
                >
                  {t('catalog.view_details')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {filteredSaaS.length === 0 && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">{t('catalog.no_results_title')}</h3>
            <p className="text-muted-foreground">
              {t('catalog.no_results_subtitle')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogue;