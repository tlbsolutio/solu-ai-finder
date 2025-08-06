import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heroBackground from '@/assets/hero-modern.jpg';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Search, Zap, TrendingUp, Users, CheckCircle, ArrowRight, Clock, DollarSign, Target, UserCircle, TrendingUp as Growth, Workflow, Palette, ShoppingCart, Briefcase, FileText, Shield, Calculator, UserCheck, GraduationCap, Headphones, Heart, Package, Code, Scale, Settings, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
const Index = () => {
  const { t } = useLanguage();
  
  const features = [{
    icon: Brain,
    title: t('features.intelligent_diagnostic.title'),
    description: t('features.intelligent_diagnostic.description'),
    color: "text-blue-500"
  }, {
    icon: Search,
    title: t('features.personalized_catalog.title'),
    description: t('features.personalized_catalog.description'),
    color: "text-green-500"
  }, {
    icon: Zap,
    title: t('features.custom_recommendations.title'),
    description: t('features.custom_recommendations.description'),
    color: "text-yellow-500"
  }];
  const benefits = [{
    icon: Clock,
    title: t('benefits.save_time.title'),
    description: t('benefits.save_time.description')
  }, {
    icon: DollarSign,
    title: t('benefits.reduce_costs.title'),
    description: t('benefits.reduce_costs.description')
  }, {
    icon: Target,
    title: t('benefits.targeted_solutions.title'),
    description: t('benefits.targeted_solutions.description')
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
    name: t('categories.crm'),
    count: t('categories.count', { count: '45+' }),
    slug: "crm-relation-client"
  }, {
    icon: Growth,
    name: t('categories.marketing'),
    count: t('categories.count', { count: '38+' }),
    slug: "marketing-growth"
  }, {
    icon: Workflow,
    name: t('categories.automation'),
    count: t('categories.count', { count: '52+' }),
    slug: "automatisation-nocode"
  }, {
    icon: Palette,
    name: t('categories.design'),
    count: t('categories.count', { count: '29+' }),
    slug: "creation-design"
  }, {
    icon: ShoppingCart,
    name: t('categories.sales'),
    count: t('categories.count', { count: '41+' }),
    slug: "ventes-ecommerce"
  }, {
    icon: Briefcase,
    name: t('categories.project_management'),
    count: t('categories.count', { count: '33+' }),
    slug: "gestion-projet"
  }, {
    icon: FileText,
    name: t('categories.productivity'),
    count: t('categories.count', { count: '47+' }),
    slug: "productivite"
  }, {
    icon: Shield,
    name: t('categories.security'),
    count: t('categories.count', { count: '22+' }),
    slug: "securite-conformite"
  }, {
    icon: Calculator,
    name: t('categories.finance'),
    count: t('categories.count', { count: '36+' }),
    slug: "finance-comptabilite"
  }, {
    icon: UserCheck,
    name: t('categories.hr'),
    count: t('categories.count', { count: '27+' }),
    slug: "ressources-humaines"
  }, {
    icon: GraduationCap,
    name: t('categories.education'),
    count: t('categories.count', { count: '21+' }),
    slug: "education-formation"
  }, {
    icon: Headphones,
    name: t('categories.customer_service'),
    count: t('categories.count', { count: '16+' }),
    slug: "service-client"
  }, {
    icon: Heart,
    name: t('categories.health'),
    count: t('categories.count', { count: '15+' }),
    slug: "sante-bienetre"
  }, {
    icon: Package,
    name: t('categories.industry'),
    count: t('categories.count', { count: '22+' }),
    slug: "industrie-logistique"
  }, {
    icon: Code,
    name: t('categories.development'),
    count: t('categories.count', { count: '56+' }),
    slug: "developpement-it"
  }, {
    icon: Scale,
    name: t('categories.legal'),
    count: t('categories.count', { count: '18+' }),
    slug: "legaltech-juridique"
  }];
  return <div className="min-h-screen bg-gradient-subtle">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 lg:py-48">
        {/* Background with overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-700/85 z-10" />
        
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 z-20" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, hsl(var(--secondary)) 0%, transparent 50%)`
        }} />
        
        <div className="container mx-auto px-4 relative z-30">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge variant="secondary" className="mb-8 px-4 py-2 text-sm font-medium bg-white/10 text-white border-white/20 backdrop-blur-sm">
              {t('hero.badge')}
            </Badge>
            
            {/* Main heading */}
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
              {t('hero.title')}
            </h1>
            
            {/* Subtitle */}
            <p className="text-2xl lg:text-3xl text-white/90 mb-6 font-medium">
              {t('hero.subtitle')}
            </p>
            
            {/* Additional info */}
            <p className="text-lg text-white/70 mb-6 max-w-2xl mx-auto">
              {t('hero.description')}
            </p>

            {/* Catchphrase */}
            <div className="text-center mb-12">
              <p className="text-xl text-white font-semibold mb-2">
                {t('catchphrase')}
              </p>
              <p className="text-lg text-white/80">
                {t('catchphraseSubtext')}
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link to="/diagnostic">
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-white text-slate-900 hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 border-0"
                >
                  <Brain className="h-6 w-6 mr-3" />
                  {t('hero.cta_diagnostic')}
                </Button>
              </Link>
              <Link to="/catalogue">
                <Button 
                  variant="outline" 
                  size="xl" 
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold border-2 border-white/30 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm shadow-xl hover:shadow-white/10 transition-all duration-300 hover:scale-105"
                >
                  {t('hero.cta_catalog')}
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center space-x-8 text-white/70">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-sm font-medium">{t('home.free')}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-sm font-medium">{t('home.minutes')}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-sm font-medium">{t('home.no_commitment')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-background shadow-lg relative z-10 -mt-8 rounded-t-3xl">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              {t('ourMission')}
            </h2>
            <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {t('missionDescription')}
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('ourApproach')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('approachSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="group hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border-0 shadow-md text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                  <Brain className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-xl">{t('diagnosticStep')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('diagnosticStepDesc')}</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border-0 shadow-md text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                  <Search className="h-8 w-8 text-green-500 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-xl">{t('selectionStep')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('selectionStepDesc')}</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border-0 shadow-md text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                  <Settings className="h-8 w-8 text-yellow-500 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-xl">{t('implementationStep')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('implementationStepDesc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background shadow-lg relative z-10 -mt-8 rounded-t-3xl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('home.how_title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('home.how_subtitle')}
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
                {t('home.why_title')}
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                {t('home.why_subtitle')}
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
                    {t('home.demo_cta')}
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
              {t('categories.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('categories.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, idx) => <Link key={idx} to={`/catalogue?category=${encodeURIComponent(category.name)}`} className="group">
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
              {t('home.cta_title')}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {t('home.cta_subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/diagnostic">
                <Button variant="secondary" size="xl" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Brain className="h-5 w-5 mr-2" />
                  {t('home.diagnostic_5min')}
                </Button>
              </Link>
              <Link to="/catalogue">
                <Button variant="outline" size="xl" className="w-full sm:w-auto border-white hover:bg-white text-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  {t('home.explore_catalogue')}
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-white/80">{t('home.solutions_count')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold">95%</div>
                <div className="text-white/80">{t('home.satisfaction')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold">24h</div>
                <div className="text-white/80">{t('home.response_time')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>;
};
export default Index;