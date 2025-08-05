import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import heroBackground from '@/assets/hero-business.jpg';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Search, Zap, TrendingUp, Users, CheckCircle, ArrowRight, Clock, DollarSign, Target, UserCircle, TrendingUp as Growth, Workflow, Palette, ShoppingCart, Briefcase, FileText, Shield, Calculator, UserCheck, GraduationCap, Headphones, Heart, Package, Code, Scale } from 'lucide-react';
const Index = () => {
  const features = [{
    icon: Brain,
    title: "Diagnostic IA Intelligent",
    description: "Notre assistant conversationnel analyse vos processus en 6 questions ciblées pour identifier les tâches à automatiser.",
    color: "text-blue-500"
  }, {
    icon: Search,
    title: "Catalogue SaaS Personnalisé",
    description: "Découvrez une sélection de solutions SaaS triées sur le volet, adaptées à votre secteur et vos besoins spécifiques.",
    color: "text-green-500"
  }, {
    icon: Zap,
    title: "Recommandations Sur Mesure",
    description: "Recevez des recommandations précises basées sur le potentiel d'automatisation et la facilité d'implémentation.",
    color: "text-yellow-500"
  }];
  const benefits = [{
    icon: Clock,
    title: "Gagnez du temps",
    description: "Jusqu'à 70% de temps économisé sur vos tâches répétitives"
  }, {
    icon: DollarSign,
    title: "Réduisez vos coûts",
    description: "ROI moyen de 300% dès la première année"
  }, {
    icon: Target,
    title: "Solutions ciblées",
    description: "Recommandations adaptées à votre secteur et taille d'entreprise"
  }];
  const testimonials = [{
    quote: "Grâce à Solutio, j'ai automatisé ma gestion des leads et gagné 15h par semaine !",
    author: "Marie D.",
    role: "Consultante Marketing",
    company: "Freelance"
  }, {
    quote: "L'accompagnement était parfait. Nous avons trouvé la solution idéale en 2 semaines.",
    author: "Thomas L.",
    role: "CEO",
    company: "TechStart"
  }];
  const categories = [{
    icon: UserCircle,
    name: "CRM & Relation Client",
    count: "45+ outils",
    slug: "crm-relation-client"
  }, {
    icon: Growth,
    name: "Marketing & Growth",
    count: "38+ outils",
    slug: "marketing-growth"
  }, {
    icon: Workflow,
    name: "Automatisation & No-code",
    count: "52+ outils",
    slug: "automatisation-nocode"
  }, {
    icon: Palette,
    name: "Création, Design & Multimédia",
    count: "29+ outils",
    slug: "creation-design"
  }, {
    icon: ShoppingCart,
    name: "Ventes & E-commerce",
    count: "41+ outils",
    slug: "ventes-ecommerce"
  }, {
    icon: Briefcase,
    name: "Gestion de Projet & Collaboration",
    count: "33+ outils",
    slug: "gestion-projet"
  }, {
    icon: FileText,
    name: "Productivité & Outils Bureautiques",
    count: "47+ outils",
    slug: "productivite"
  }, {
    icon: Shield,
    name: "Sécurité & Conformité",
    count: "22+ outils",
    slug: "securite-conformite"
  }, {
    icon: Calculator,
    name: "Finance & Comptabilité",
    count: "36+ outils",
    slug: "finance-comptabilite"
  }, {
    icon: UserCheck,
    name: "Ressources Humaines & Recrutement",
    count: "27+ outils",
    slug: "ressources-humaines"
  }, {
    icon: GraduationCap,
    name: "Éducation & Formation",
    count: "21+ outils",
    slug: "education-formation"
  }, {
    icon: Headphones,
    name: "Service Client & Support",
    count: "16+ outils",
    slug: "service-client"
  }, {
    icon: Heart,
    name: "Santé & Bien-être",
    count: "15+ outils",
    slug: "sante-bienetre"
  }, {
    icon: Package,
    name: "Industrie & Logistique",
    count: "22+ outils",
    slug: "industrie-logistique"
  }, {
    icon: Code,
    name: "Développement & IT",
    count: "56+ outils",
    slug: "developpement-it"
  }, {
    icon: Scale,
    name: "LegalTech & Juridique",
    count: "18+ outils",
    slug: "legaltech-juridique"
  }];
  return <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-40" style={{
      backgroundImage: `linear-gradient(135deg, rgba(30, 58, 138, 0.85), rgba(59, 130, 246, 0.75)), url(${heroBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
     }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-4 text-primary">
                Transformation Digitale
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Trouvez la meilleure solution SaaS pour automatiser votre activité
              </h1>
              <p className="text-xl text-white/90 mb-4 max-w-xl">
                Diagnostic gratuit + recommandations personnalisées
              </p>
              <p className="text-sm text-white/80 mb-8 max-w-xl">
                Solutio vous aide aussi à implémenter l'IA dans vos processus métier.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/diagnostic">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Brain className="h-5 w-5 mr-2" />
                    Commencer le diagnostic gratuit
                  </Button>
                </Link>
                <Link to="/catalogue">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto border-white text-primary bg-white hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Explorer le catalogue
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start mt-8 space-x-6 text-sm text-white/80">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Gratuit
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  5 minutes
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Sans engagement
                </div>
              </div>
            </div>

            <div className="relative animate-float hidden lg:block">
              <div className="absolute inset-0 bg-gradient-primary opacity-30 blur-3xl rounded-full transform scale-75 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background shadow-lg relative z-10 -mt-8 rounded-t-3xl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Comment Solutio révolutionne votre productivité
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une approche en 3 étapes pour identifier, choisir et implémenter les meilleures solutions d'automatisation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => <Card key={idx} className="group hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border-0 shadow-md">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-subtle shadow-inner relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Pourquoi choisir Solutio ?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Nous ne vendons pas de solutions, nous trouvons LA solution qui vous convient parfaitement.
              </p>
              
              <div className="space-y-6">
                {benefits.map((benefit, idx) => <div key={idx} className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>)}
              </div>

              <div className="mt-8">
                <Link to="/contact">
                  <Button variant="premium" size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Demander une démo personnalisée
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              {testimonials.map((testimonial, idx) => <Card key={idx} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
                  <CardContent className="p-6">
                    <p className="text-foreground italic mb-4">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold mr-3 shadow-md">
                        {testimonial.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role} • {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-background shadow-lg relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Explorez nos catégories de solutions
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Trouvez les outils parfaits pour votre secteur d'activité parmi plus de 500 solutions référencées
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, idx) => <Link key={idx} to={`/catalogue?filter=${category.slug}`} className="group">
                <Card className="h-full text-center hover:shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300">
                      <category.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {category.count}
                    </p>
                  </CardContent>
                </Card>
              </Link>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Prêt à automatiser votre activité ?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Commencez votre diagnostic gratuit dès maintenant et découvrez comment gagner des heures chaque semaine.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/diagnostic">
                <Button variant="secondary" size="xl" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Brain className="h-5 w-5 mr-2" />
                  Diagnostic gratuit en 5 min
                </Button>
              </Link>
              <Link to="/catalogue">
                <Button variant="outline" size="xl" className="w-full sm:w-auto border-white hover:bg-white text-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Explorer le catalogue
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-white/80">Solutions référencées</div>
              </div>
              <div>
                <div className="text-3xl font-bold">95%</div>
                <div className="text-white/80">Clients satisfaits</div>
              </div>
              <div>
                <div className="text-3xl font-bold">24h</div>
                <div className="text-white/80">Temps de réponse</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src="/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png" alt="Solutio" className="h-8 w-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                Votre partenaire pour la transformation digitale et l'automatisation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Solutions</h4>
              <div className="space-y-2 text-sm">
                <Link to="/diagnostic" className="block text-muted-foreground hover:text-primary">Diagnostic IA</Link>
                <Link to="/catalogue" className="block text-muted-foreground hover:text-primary">Catalogue SaaS</Link>
                <Link to="/contact" className="block text-muted-foreground hover:text-primary">Conseil Expert</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <Link to="/contact" className="block text-muted-foreground hover:text-primary">Contact</Link>
                <a href="mailto:contact@solutio.fr" className="block text-muted-foreground hover:text-primary">Email</a>
                <a href="tel:+33123456789" className="block text-muted-foreground hover:text-primary">Téléphone</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Légal</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-primary">Mentions légales</a>
                <a href="#" className="block text-muted-foreground hover:text-primary">Confidentialité</a>
                <a href="#" className="block text-muted-foreground hover:text-primary">CGU</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Solutio. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;