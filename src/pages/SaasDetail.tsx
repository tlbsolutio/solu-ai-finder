import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { SaasDetailSkeleton } from '@/components/ui/loading-skeleton';
import { Star, TrendingUp, Users, DollarSign, Check, ExternalLink, ArrowLeft, Gauge } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useSaasCache } from '@/hooks/useSaasCache';

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

const SaasDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const [saasDetail, setSaasDetail] = useState<SaaSItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getCachedData, setCacheData } = useSaasCache();

  useEffect(() => {
    const fetchSaasDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Check cache first for better performance
        const cached = getCachedData();
        if (cached && cached.length > 0) {
          const saas = cached.find((item: SaaSItem) => item.id === id);
          if (saas) {
            setSaasDetail(saas);
            setLoading(false);
            return;
          }
        }
        
        const { data, error } = await supabase.functions.invoke('get-saas-from-airtable', {
          body: {
            uiUrl: "https://airtable.com/appayjYdBAGkJak1e/tblzQQ7ivUGHqTBTF/viwjGA16J4vctsYXf?blocks=hide"
          }
        });

        if (error) throw error;

        const saasItems = data?.items || [];
        
        // Cache the fresh data
        setCacheData(saasItems);
        // Try to find by ID first, then by name (for encoded URLs)
        let saas = saasItems.find((item: SaaSItem) => item.id === id);
        
        // If not found by ID, try to find by name with flexible matching
        if (!saas && id) {
          const decodedName = decodeURIComponent(id);
          
          // Helper function to normalize strings for comparison
          const normalize = (str: string) => 
            str.toLowerCase()
               .replace(/[àáâãäå]/g, 'a')
               .replace(/[èéêë]/g, 'e')
               .replace(/[ìíîï]/g, 'i')
               .replace(/[òóôõö]/g, 'o')
               .replace(/[ùúûü]/g, 'u')
               .replace(/[ç]/g, 'c')
               .replace(/[ñ]/g, 'n')
               .replace(/[^\w\s]/g, '')
               .replace(/\s+/g, ' ')
               .trim();
          
          const normalizedSearchName = normalize(decodedName);
          
          // Try exact match first (case insensitive)
          saas = saasItems.find((item: SaaSItem) => 
            item.name.toLowerCase() === decodedName.toLowerCase()
          );
          
          // Try normalized match if exact didn't work
          if (!saas) {
            saas = saasItems.find((item: SaaSItem) => 
              normalize(item.name) === normalizedSearchName
            );
          }
          
          // Try partial match if normalized didn't work
          if (!saas) {
            saas = saasItems.find((item: SaaSItem) => 
              normalize(item.name).includes(normalizedSearchName) ||
              normalizedSearchName.includes(normalize(item.name))
            );
          }
        }
        
        if (!saas) {
          setError(`SaaS "${id}" introuvable`);
        } else {
          setSaasDetail(saas);
        }
      } catch (err) {
        console.error('Error fetching SaaS detail:', err);
        setError('Failed to load SaaS details');
      } finally {
        setLoading(false);
      }
    };

    fetchSaasDetail();
  }, [id]);

  const formatScore = (score: number) => {
    if (score % 1 === 0) return score.toFixed(0);
    if (score % 1 === 0.5) return score.toFixed(1);
    return (Math.round(score * 2) / 2).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-10 w-40" />
          </div>
          <SaasDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !saasDetail) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/catalogue">
              <Button variant="ghost" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('saasdetail.back_to_catalog')}
              </Button>
            </Link>
          </div>
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">SaaS not found</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/catalogue">
              <Button>{t('saasdetail.back_to_catalog')}</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 2xl:max-w-6xl">
        {/* Back navigation */}
        <div className="mb-6">
          <Link to="/catalogue">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('saasdetail.back_to_catalog')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            {/* Header */}
            <Card className="shadow-medium overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-subtle opacity-20"></div>
                <img 
                  src={saasDetail.logoUrl} 
                  alt={`Logo ${saasDetail.name}`}
                  className="w-full h-64 object-contain bg-background/50 p-8"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/95 text-foreground border-0 shadow-soft">
                    <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                    <span className="font-semibold">{formatScore(saasDetail.score)}</span>
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <div className="space-y-4">
                  <div>
                    <CardTitle className="text-3xl">{saasDetail.name}</CardTitle>
                    {saasDetail.tagline && (
                      <p className="text-muted-foreground mt-2 text-lg">{saasDetail.tagline}</p>
                    )}
                  </div>
                  
                  {/* Categories et Targets dans une section dédiée */}
                  <div className="space-y-3">
                    {/* Categories */}
                    {saasDetail.categories.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Catégories</p>
                        <div className="flex flex-wrap gap-2">
                          {saasDetail.categories.map((cat, idx) => (
                            <Badge key={idx} variant="default" className="text-sm py-1 px-3">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Targets */}
                    {saasDetail.targets.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Public cible</p>
                        <div className="flex flex-wrap gap-2">
                          {saasDetail.targets.map((target, idx) => (
                            <Badge key={idx} variant="secondary" className="text-sm py-1 px-3">
                              <Users className="h-3 w-3 mr-1" />
                              {target}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Intro */}
            <Card className="shadow-card bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-xl">Description complète</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-foreground leading-relaxed text-lg">{saasDetail.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center p-4 rounded-lg bg-gradient-subtle border border-border/50">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                      <Star className="h-6 w-6 text-yellow-500" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Note globale</p>
                    <p className="font-bold text-xl text-foreground">{formatScore(saasDetail.score)}</p>
                    <p className="text-xs text-muted-foreground">/ 5</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-subtle border border-border/50">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Automatisation</p>
                    <p className="font-bold text-xl text-foreground">{saasDetail.automation}%</p>
                    <p className="text-xs text-muted-foreground">Gain de temps</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-subtle border border-border/50">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                      <Gauge className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Facilité d'usage</p>
                    <p className="font-bold text-xl text-foreground">{saasDetail.ease}</p>
                    <p className="text-xs text-muted-foreground">/ 100</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fonctionnalités principales */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Fonctionnalités principales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {saasDetail.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cas d'usage */}
            {saasDetail.useCases && saasDetail.useCases.length > 0 && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Cas d'usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {saasDetail.useCases.map((useCase, idx) => (
                      <div key={idx} className="flex items-start">
                        <Badge variant="outline" className="mr-3 mt-0.5 text-xs">
                          {idx + 1}
                        </Badge>
                        <span className="text-sm">{useCase}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Avantages & Inconvénients */}
            {((saasDetail.pros && saasDetail.pros.length > 0) || (saasDetail.cons && saasDetail.cons.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {saasDetail.pros && saasDetail.pros.length > 0 && (
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-green-600">Avantages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {saasDetail.pros.map((pro, idx) => (
                          <div key={idx} className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{pro}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {saasDetail.cons && saasDetail.cons.length > 0 && (
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-red-600">Inconvénients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {saasDetail.cons.map((con, idx) => (
                          <div key={idx} className="flex items-start">
                            <span className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0">×</span>
                            <span className="text-sm">{con}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 xl:col-span-2 space-y-6">
            {/* CTA Card */}
            <Card className="shadow-premium border-primary/30 bg-gradient-card">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {t('saasdetail.start_now')}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Commencez votre essai gratuit dès maintenant
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Priority: Use affiliate link if it exists, otherwise trial link */}
                {saasDetail.affiliate ? (
                  <Button 
                    className="w-full shadow-md hover:shadow-lg transition-shadow" 
                    variant="cta"
                    size="lg"
                    asChild
                  >
                    <a href={saasDetail.affiliate} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Essayer gratuitement
                    </a>
                  </Button>
                ) : saasDetail.trialUrl ? (
                  <Button 
                    className="w-full shadow-md hover:shadow-lg transition-shadow" 
                    variant="cta"
                    size="lg"
                    asChild
                  >
                    <a href={saasDetail.trialUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Essayer gratuitement
                    </a>
                  </Button>
                ) : null}
                
                {saasDetail.website && (
                  <Button 
                    className="w-full shadow-sm hover:shadow-md transition-shadow" 
                    variant="outline"
                    size="lg"
                    asChild
                  >
                    <a href={saasDetail.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visiter le site web
                    </a>
                  </Button>
                )}
                
                <Separator className="my-6" />
                
                <Link to="/contact">
                  <Button className="w-full" variant="cta" size="lg">
                    <Users className="h-4 w-4 mr-2" />
                    {t('saasdetail.ask_advice')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tarification détaillée */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 text-primary mr-2" />
                  Plans tarifaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {saasDetail.pricingLinked && saasDetail.pricingLinked.length > 0 ? (
                  <div className="space-y-4">
                     {/* Deduplicate pricing plans by plan name and price before sorting */}
                     {Array.from(
                       new Map(saasDetail.pricingLinked.map(plan => 
                         [`${plan.plan}-${plan.price}`, plan]
                       )).values()
                     )
                       .sort((a, b) => {
                         // Sort: Popular plans first, then by price, "Sur devis" last
                         if (a.popular && !b.popular) return -1;
                         if (!a.popular && b.popular) return 1;
                         
                         // Both popular or both not popular - sort by price
                         const aPrice = a.price.toLowerCase();
                         const bPrice = b.price.toLowerCase();
                         
                         // "Sur devis" always last
                         if (aPrice.includes('devis') || aPrice.includes('contact')) return 1;
                         if (bPrice.includes('devis') || bPrice.includes('contact')) return -1;
                         
                         // Try to extract numbers for numeric comparison
                         const aNum = parseFloat(aPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
                         const bNum = parseFloat(bPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
                         
                         if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                         
                         // Fallback to alphabetical
                         return aPrice.localeCompare(bPrice);
                       })
                       .map((plan, idx) => (
                      <Card 
                        key={idx} 
                        className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg group ${
                          plan.popular 
                            ? 'border-primary shadow-premium ring-1 ring-primary/20 bg-gradient-card' 
                            : 'hover:border-primary/50 shadow-soft'
                        }`}
                      >
                        <CardHeader className="text-center pt-6">
                          <Badge variant={plan.popular ? "default" : "secondary"} className="mx-auto mb-2 font-medium">
                            {plan.plan}
                          </Badge>
                          <div className="space-y-1">
                            <div className="text-2xl font-bold text-foreground">
                              {plan.price}
                            </div>
                            {!plan.price.toLowerCase().includes('gratuit') && !plan.price.toLowerCase().includes('devis') && (
                              <p className="text-xs text-muted-foreground">par mois</p>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          {plan.included && plan.included.length > 0 && (
                            <div className="space-y-3">
                              <Separator className="opacity-50" />
                              <div>
                                <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-3 flex items-center">
                                  <Check className="h-3 w-3 mr-1" />
                                  Inclus dans ce plan
                                </h4>
                                <ul className="space-y-2">
                                  {plan.included.slice(0, 4).map((feature, featureIdx) => (
                                    <li key={featureIdx} className="flex items-start text-sm">
                                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                                      <span className="leading-relaxed text-muted-foreground">{feature}</span>
                                    </li>
                                  ))}
                                  {plan.included.length > 4 && (
                                    <li className="text-sm text-primary font-medium pl-5 pt-1">
                                      Et {plan.included.length - 4} fonctionnalités supplémentaires...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gradient-subtle rounded-2xl border border-border/50">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Tarification sur mesure</h3>
                    <p className="text-muted-foreground mb-4">
                      Consultez le site officiel pour les détails de tarification
                    </p>
                    {saasDetail.website && (
                      <Button variant="outline" asChild>
                        <a href={saasDetail.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Voir la tarification
                        </a>
                      </Button>
                    )}
                   </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaasDetail;