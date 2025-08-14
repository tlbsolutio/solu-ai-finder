import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, TrendingUp, Users, DollarSign, Check, ExternalLink, ArrowLeft, Gauge } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    const fetchSaasDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('get-saas-from-airtable', {
          body: {
            uiUrl: "https://airtable.com/appayjYdBAGkJak1e/tblzQQ7ivUGHqTBTF/viwjGA16J4vctsYXf?blocks=hide"
          }
        });

        if (error) throw error;

        const saasItems = data?.items || [];
        const saas = saasItems.find((item: SaaSItem) => item.id === id);
        
        if (!saas) {
          setError('SaaS not found');
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <Skeleton className="w-full h-64" />
                <CardHeader>
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
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
      <div className="container mx-auto px-4 py-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link to="/catalogue">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('saasdetail.back_to_catalog')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card className="shadow-medium overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-subtle opacity-20"></div>
                <img 
                  src={saasDetail.logoUrl} 
                  alt={`Logo ${saasDetail.name}`}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/95 text-foreground border-0 shadow-soft">
                    <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                    <span className="font-semibold">{formatScore(saasDetail.score)}</span>
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">{saasDetail.name}</CardTitle>
                    {saasDetail.tagline && (
                      <p className="text-muted-foreground mt-2 text-lg">{saasDetail.tagline}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {saasDetail.categories.map((cat, idx) => (
                      <Badge key={idx} variant="outline">{cat}</Badge>
                    ))}
                  </div>
                </div>
                
                {/* Target pills */}
                {saasDetail.targets.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {saasDetail.targets.map((target, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {target}
                      </Badge>
                    ))}
                  </div>
                )}
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
          <div className="space-y-6">
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
                    className="w-full" 
                    variant="premium"
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
                    className="w-full" 
                    variant="premium"
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
                    className="w-full" 
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
                  Tarification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prix principal */}
                <div className="p-4 rounded-lg border border-primary/20 bg-gradient-subtle">
                  <div className="flex items-center justify-center">
                    <p className="text-2xl font-bold text-primary">
                      {saasDetail.priceText || 'Prix sur demande'}
                    </p>
                  </div>
                  <p className="text-center text-muted-foreground mt-2">
                    Tarif de base - Voir les plans détaillés ci-dessous
                  </p>
                </div>

                {/* Plans détaillés si disponibles */}
                {saasDetail.pricingLinked && saasDetail.pricingLinked.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg mb-4">Plans disponibles</h4>
                    <div className="grid gap-4">
                      {saasDetail.pricingLinked.map((plan, idx) => (
                        <Card key={idx} className={`relative transition-all duration-300 ${
                          plan.popular 
                            ? 'border-primary shadow-medium bg-gradient-primary/5' 
                            : 'hover:shadow-card border-border/50'
                        }`}>
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <Badge className="bg-gradient-primary text-white px-3 py-1 font-semibold">
                                <Star className="h-3 w-3 mr-1" />
                                Populaire
                              </Badge>
                            </div>
                          )}
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{plan.plan}</CardTitle>
                            <p className="text-2xl font-bold text-primary">{plan.price}</p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {plan.included && plan.included.map((feature, featureIdx) => (
                                <div key={featureIdx} className="flex items-start">
                                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                            {plan.popular && (
                              <Button 
                                className="w-full mt-4" 
                                variant="premium"
                                asChild
                              >
                                <a 
                                  href={saasDetail.affiliate || saasDetail.trialUrl || saasDetail.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  Choisir ce plan
                                </a>
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    💡 Consultez le site officiel pour les détails complets et promotions en cours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaasDetail;