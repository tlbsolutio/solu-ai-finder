import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, TrendingUp, Users, DollarSign, Check, ExternalLink, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

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
          body: {}
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
            {/* Hero section */}
            <Card className="shadow-medium">
              <div className="relative">
                <img 
                  src={saasDetail.image} 
                  alt={saasDetail.name}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90">
                    <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                    {saasDetail.score}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{saasDetail.name}</CardTitle>
                    <p className="text-muted-foreground mt-1">{saasDetail.tagline}</p>
                  </div>
                  <Badge variant="outline">{saasDetail.category}</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-foreground leading-relaxed">{saasDetail.description}</p>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t('saasdetail.automation')}</p>
                    <p className="font-semibold">{saasDetail.automation}%</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t('saasdetail.ease')}</p>
                    <p className="font-semibold">{saasDetail.ease || 0}/100</p>
                  </div>
                  <div className="text-center">
                    <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t('saasdetail.from')}</p>
                    <p className="font-semibold">{saasDetail.price.split(' - ')[0]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>{t('saasdetail.main_features')}</CardTitle>
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

            {/* Use Cases */}
            {saasDetail.use_cases && saasDetail.use_cases.length > 0 && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>{t('saasdetail.popular_use_cases')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {saasDetail.use_cases.map((useCase, idx) => (
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

            {/* Pros & Cons */}
            {((saasDetail.pros && saasDetail.pros.length > 0) || (saasDetail.cons && saasDetail.cons.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {saasDetail.pros && saasDetail.pros.length > 0 && (
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-green-600">{t('saasdetail.advantages')}</CardTitle>
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
                      <CardTitle className="text-red-600">{t('saasdetail.disadvantages')}</CardTitle>
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
                {saasDetail.free_trial_link && (
                  <Button 
                    className="w-full" 
                    variant="hero"
                    size="lg"
                    asChild
                  >
                    <a href={saasDetail.free_trial_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('saasdetail.try_free')}
                    </a>
                  </Button>
                )}
                
                {saasDetail.affiliate_link && (
                  <Button 
                    className="w-full" 
                    variant={saasDetail.free_trial_link ? "outline" : "hero"}
                    size="lg"
                    asChild
                  >
                    <a href={saasDetail.affiliate_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {saasDetail.free_trial_link ? 'Voir l\'offre' : t('saasdetail.try_free')}
                    </a>
                  </Button>
                )}
                
                {saasDetail.website && (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    asChild
                  >
                    <a href={saasDetail.website} target="_blank" rel="noopener noreferrer">
                      {t('saasdetail.visit_website')}
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

            {/* Pricing */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>{t('saasdetail.pricing')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-2xl font-bold text-primary">{saasDetail.price}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Consultez le site officiel pour les détails complets
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Target audience */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>{t('saasdetail.ideal_for')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {saasDetail.targets.map((target, idx) => (
                    <Badge key={idx} variant="secondary">
                      {target}
                    </Badge>
                  ))}
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