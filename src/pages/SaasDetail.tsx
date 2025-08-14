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
            <Card className="shadow-medium">
              <div className="relative">
                <img 
                  src={saasDetail.logoUrl} 
                  alt={`Logo ${saasDetail.name}`}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90">
                    <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                    {formatScore(saasDetail.score)}
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
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Description complète</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{saasDetail.description}</p>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Note</p>
                    <p className="font-semibold">{formatScore(saasDetail.score)}</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Score d'automatisation</p>
                    <p className="font-semibold">{saasDetail.automation}%</p>
                  </div>
                  <div className="text-center">
                    <Gauge className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Facilité</p>
                    <p className="font-semibold">{saasDetail.ease}/100</p>
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
            <Card className="shadow-medium border-primary/20">
              <CardHeader>
                <CardTitle className="text-center">{t('saasdetail.start_now')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Priority: Use affiliate link if it exists, otherwise trial link */}
                {saasDetail.affiliate ? (
                  <Button 
                    className="w-full" 
                    variant="hero"
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
                    variant="hero"
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
                    asChild
                  >
                    <a href={saasDetail.website} target="_blank" rel="noopener noreferrer">
                      Visiter le site web
                    </a>
                  </Button>
                )}
                
                <Separator />
                
                <Link to="/contact">
                  <Button className="w-full" variant="secondary">
                    {t('saasdetail.ask_advice')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tarification */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Tarification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg border border-border">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-primary mr-2" />
                    <p className="text-lg font-bold text-primary">{saasDetail.priceText || 'Prix sur demande'}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consultez le site officiel pour les détails complets
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