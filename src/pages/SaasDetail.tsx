import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, TrendingUp, Users, DollarSign, Check, ExternalLink, ArrowLeft } from 'lucide-react';

const SaasDetail = () => {
  const { id } = useParams();

  // Mock detailed data - in real app, fetch based on ID
  const saasDetail = {
    id: 1,
    name: "Zapier",
    tagline: "Automatisez votre workflow sans coder",
    description: "Zapier vous permet de connecter vos applications préférées et d'automatiser vos tâches répétitives. Plus de 5000 intégrations disponibles pour créer des workflows puissants en quelques clics.",
    category: "Automatisation",
    targets: ["PME", "Entrepreneurs", "Équipes"],
    score: 4.8,
    automation: 85,
    ease: 90,
    price: "Gratuit - 29€/mois",
    website: "https://zapier.com",
    affiliateLink: "https://zapier.com?ref=solutio",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    features: [
      "Plus de 5000 intégrations",
      "Interface glisser-déposer",
      "Workflows conditionnels",
      "Déclencheurs multi-étapes",
      "Formatage des données",
      "Webhooks personnalisés",
      "Planification des tâches",
      "Gestion d'équipe"
    ],
    useCases: [
      "Synchroniser CRM et email marketing",
      "Automatiser les réseaux sociaux",
      "Intégrer e-commerce et comptabilité",
      "Notification automatique d'équipe"
    ],
    pricing: [
      {
        plan: "Gratuit",
        price: "0€",
        features: ["100 tâches/mois", "5 Zaps", "Intégrations de base"],
        popular: false
      },
      {
        plan: "Starter",
        price: "20€",
        features: ["750 tâches/mois", "20 Zaps", "Webhooks", "Support email"],
        popular: true
      },
      {
        plan: "Professional",
        price: "49€",
        features: ["2000 tâches/mois", "Zaps illimités", "Workflows avancés", "Support prioritaire"],
        popular: false
      }
    ],
    pros: [
      "Interface très intuitive",
      "Énorme catalogue d'intégrations",
      "Communauté active",
      "Documentation complète"
    ],
    cons: [
      "Prix élevé pour gros volumes",
      "Limitations du plan gratuit",
      "Latence sur certaines intégrations"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link to="/catalogue">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au catalogue
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
                    <p className="text-sm text-muted-foreground">Automatisation</p>
                    <p className="font-semibold">{saasDetail.automation}%</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Facilité</p>
                    <p className="font-semibold">{saasDetail.ease}/100</p>
                  </div>
                  <div className="text-center">
                    <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">À partir de</p>
                    <p className="font-semibold">{saasDetail.price.split(' - ')[0]}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
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

            {/* Use Cases */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Cas d'usage populaires</CardTitle>
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

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <Card className="shadow-medium border-primary/20">
              <CardHeader>
                <CardTitle className="text-center">Commencer maintenant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  variant="hero"
                  size="lg"
                  asChild
                >
                  <a href={saasDetail.affiliateLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Essayer gratuitement
                  </a>
                </Button>
                
                <Button 
                  className="w-full" 
                  variant="outline"
                  asChild
                >
                  <a href={saasDetail.website} target="_blank" rel="noopener noreferrer">
                    Visiter le site web
                  </a>
                </Button>
                
                <Separator />
                
                <Link to="/contact">
                  <Button className="w-full" variant="secondary">
                    Demander conseil
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Tarification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {saasDetail.pricing.map((plan, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border ${plan.popular ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{plan.plan}</h4>
                      {plan.popular && (
                        <Badge variant="default" className="text-xs">Populaire</Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-primary mb-2">{plan.price}<span className="text-sm text-muted-foreground">/mois</span></p>
                    <div className="space-y-1">
                      {plan.features.map((feature, featureIdx) => (
                        <div key={featureIdx} className="flex items-center text-xs">
                          <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Target audience */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Idéal pour</CardTitle>
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