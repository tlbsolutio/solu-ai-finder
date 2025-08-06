import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Star, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Catalogue = () => {
  const { t } = useLanguage();
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

  // Mock data - in real app, this would come from Airtable
  const saasData = [
    {
      id: 1,
      name: "Zapier",
      description: "Automatisation de workflows entre applications",
      category: "Automatisation",
      targets: ["PME", "Entrepreneurs"],
      score: 4.8,
      automation: 85,
      price: "Gratuit - 29€/mois",
      features: ["2000+ intégrations", "Workflows visuels", "API REST"],
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop"
    },
    {
      id: 2,
      name: "HubSpot CRM",
      description: "CRM gratuit avec outils marketing intégrés",
      category: "CRM",
      targets: ["PME", "Startups"],
      score: 4.6,
      automation: 70,
      price: "Gratuit - 50€/mois",
      features: ["CRM complet", "Email marketing", "Landing pages"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop"
    },
    {
      id: 3,
      name: "Monday.com",
      description: "Plateforme de gestion de projets et workflows",
      category: "Gestion de projet",
      targets: ["Équipes", "PME"],
      score: 4.7,
      automation: 75,
      price: "8€ - 16€/mois/user",
      features: ["Tableaux personnalisables", "Automatisations", "Intégrations"],
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop"
    },
    {
      id: 4,
      name: "Calendly",
      description: "Planification automatique de rendez-vous",
      category: "Planification",
      targets: ["Consultants", "Commerciaux"],
      score: 4.9,
      automation: 90,
      price: "Gratuit - 12€/mois",
      features: ["Calendrier intelligent", "Intégrations", "Rappels automatiques"],
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop"
    }
  ];

  const categories = [
    "CRM & Relation Client",
    "Marketing & Growth", 
    "Automatisation & No-code",
    "Création, Design & Multimédia",
    "Ventes & E-commerce",
    "Gestion de Projet & Collaboration",
    "Productivité & Outils Bureautiques",
    "Sécurité & Conformité",
    "Finance & Comptabilité",
    "Ressources Humaines & Recrutement",
    "Éducation & Formation",
    "Service Client & Support",
    "Santé & Bien-être",
    "Industrie & Logistique",
    "Développement & IT",
    "LegalTech & Juridique",
    "Autre"
  ];
  const targets = ["PME", "Startups", "Entrepreneurs", "Équipes", "Consultants", "Commerciaux"];

  const filteredSaaS = saasData.filter(item => {
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
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                    <SelectItem key={target} value={target}>{target}</SelectItem>
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
                  alt={saas.name}
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
                  <Badge variant="outline">{saas.category}</Badge>
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
                    {saas.targets.join(', ')}
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