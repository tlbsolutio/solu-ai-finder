import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Search, Zap, Brain, TrendingUp, Users, CheckCircle, ArrowRight, Clock, DollarSign, Target, X, AlertCircle, TrendingDown, BarChart3, MapPin, Compass, Handshake, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import MetaTags from '@/components/seo/MetaTags';
import StructuredData from '@/components/seo/StructuredData';
// Images not currently used but available: hero-bg.jpg, hero-business.jpg, hero-modern.jpg

const Index = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Network,
      title: t('services.cartographie.title'),
      description: t('services.cartographie.description'),
      cta: t('services.cartographie.cta'),
      link: '/cartographie',
      accent: 'from-blue-500 to-cyan-400',
    },
    {
      icon: Compass,
      title: t('services.conseil.title'),
      description: t('services.conseil.description'),
      cta: t('services.conseil.cta'),
      link: '/contact',
      accent: 'from-violet-500 to-purple-400',
    },
    {
      icon: Handshake,
      title: t('services.accompagnement.title'),
      description: t('services.accompagnement.description'),
      cta: t('services.accompagnement.cta'),
      link: '/contact',
      accent: 'from-amber-500 to-orange-400',
    },
  ];

  const methodSteps = [
    {
      icon: Brain,
      title: t('method.step1.title'),
      description: t('method.step1.description'),
      color: 'text-foreground',
    },
    {
      icon: Search,
      title: t('method.step2.title'),
      description: t('method.step2.description'),
      color: 'text-foreground',
    },
    {
      icon: Zap,
      title: t('method.step3.title'),
      description: t('method.step3.description'),
      color: 'text-foreground',
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: t('benefits.time.title'),
      description: t('benefits.time.description'),
    },
    {
      icon: DollarSign,
      title: t('benefits.costs.title'),
      description: t('benefits.costs.description'),
    },
    {
      icon: Target,
      title: t('benefits.clarity.title'),
      description: t('benefits.clarity.description'),
    },
    {
      icon: Users,
      title: t('benefits.expert.title'),
      description: t('benefits.expert.description'),
    },
  ];

  const testimonials = [
    {
      quote: t('testimonial.1.quote'),
      author: t('testimonial.1.author'),
      role: t('testimonial.1.role'),
      company: t('testimonial.1.company'),
    },
    {
      quote: t('testimonial.2.quote'),
      author: t('testimonial.2.author'),
      role: t('testimonial.2.role'),
      company: t('testimonial.2.company'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title={t('hero.title')}
        description={t('hero.description')}
        type="website"
        keywords="transformation digitale, conseil, diagnostic IA, cartographie organisationnelle, maturité digitale, accompagnement, optimisation processus"
      />

      <StructuredData
        type="Organization"
        data={{
          name: 'Solutio',
          description: 'Cabinet de conseil en transformation digitale. Cartographie organisationnelle IA et accompagnement sur mesure.',
          service: [
            {
              '@type': 'Service',
              name: 'Scan de maturité organisationnelle',
              description: 'Évaluation rapide gratuite par IA de la maturité de votre organisation',
            },
            {
              '@type': 'Service',
              name: 'Cartographie organisationnelle',
              description: 'Analyse approfondie de vos processus en 10 packs thématiques',
            },
            {
              '@type': 'Service',
              name: 'Conseil en transformation digitale',
              description: 'Accompagnement stratégique et opérationnel pour réussir votre transformation',
            },
          ],
        }}
      />

      <StructuredData
        type="WebSite"
        data={{
          name: 'Solutio',
          url: 'https://solutio.work',
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 lg:py-48">
        {/* Background image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/lovable-uploads/c8143545-6b97-49dd-85ba-65b954b9e501.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Darker, more dramatic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/80 to-slate-950/90 z-10" />
        {/* Subtle radial color accents */}
        <div className="absolute inset-0 opacity-15 z-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, hsl(var(--primary)) 0%, transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--secondary)) 0%, transparent 40%)',
        }} />
        {/* Animated dots background */}
        <div className="absolute inset-0 z-20 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          animation: 'subtle-drift 20s ease-in-out infinite alternate',
        }} />

        <div className="container mx-auto px-4 relative z-30">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge with gradient border effect */}
            <div className="inline-block mb-8 rounded-full p-[1px] bg-gradient-to-r from-primary/60 via-white/20 to-primary/60"
              style={{ animation: 'gradient-shift 4s ease infinite', backgroundSize: '200% 100%' }}>
              <Badge variant="secondary" className="px-5 py-2 text-sm font-medium bg-white/10 text-white/90 border-0 backdrop-blur-sm rounded-full">
                {t('hero.badge')}
              </Badge>
            </div>

            <h1 className="text-4xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              {t('hero.h1_title')}
            </h1>

            <p className="text-lg lg:text-xl text-white/70 mb-6 font-normal leading-relaxed max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>

            <p className="text-base text-white/45 mb-14 max-w-2xl mx-auto leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
              <Link to="/cartographie/scan">
                <Button size="lg" className="h-12 px-8 text-base font-semibold bg-white text-gray-900 hover:bg-gray-100 shadow-lg shadow-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-white/20 hover:scale-[1.02]">
                  <Network className="h-5 w-5 mr-2" />
                  {t('hero.cta_scan')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/cartographie">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base font-medium border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]">
                  <MapPin className="h-5 w-5 mr-2" />
                  {t('hero.cta_cartographie')}
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400/80" />
                <span className="text-sm">{t('home.free')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400/80" />
                <span className="text-sm">{t('home.minutes')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400/80" />
                <span className="text-sm">{t('home.no_commitment')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagonal separator */}
        <div className="absolute bottom-0 left-0 right-0 z-30 overflow-hidden leading-[0]">
          <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-12 lg:h-20">
            <path d="M0,80 L0,40 Q600,0 1200,40 L1200,80 Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              {t('problem.title')}
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
              {[t('problem.pain1'), t('problem.pain2'), t('problem.pain3'), t('problem.pain4')].map((pain, idx) => (
                <div key={idx} className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-destructive/20 transition-colors duration-200">
                  <span className="flex-shrink-0 mt-2 w-2 h-2 rounded-full bg-destructive/70" />
                  <p className="text-foreground text-sm font-medium leading-relaxed">{pain}</p>
                </div>
              ))}
            </div>

            <div className="text-center p-10 rounded-2xl border border-border bg-card shadow-sm">
              <AlertCircle className="h-10 w-10 text-orange-500 mx-auto mb-4" />
              <p className="text-3xl lg:text-4xl font-extrabold text-foreground mb-2">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{t('problem.stat')}</span>
              </p>
              <p className="text-muted-foreground text-sm italic mb-4">{t('problem.stat_source')}</p>
              <p className="text-primary font-semibold text-lg">{t('problem.transition')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('services.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('services.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {services.map((service, idx) => (
              <Card key={idx} className="group relative overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card">
                {/* Gradient accent line at top */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${service.accent} opacity-80`} />
                <CardHeader className="pt-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{service.description}</p>
                  <Link to={service.link}>
                    <Button variant="ghost" size="sm" className="px-0 text-primary hover:text-primary/80 group-hover:translate-x-1 transition-transform">
                      {service.cta}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Method Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('method.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('method.subtitle')}
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Connecting dashed line behind the cards on desktop */}
            <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-[2px] border-t-2 border-dashed border-primary/20 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {methodSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-6 shadow-lg shadow-primary/20 ring-4 ring-background">
                      {idx + 1}
                    </div>
                    <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-6">
                      <step.icon className="h-8 w-8 text-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="relative py-24 bg-muted/30 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              {t('proof.title')}
            </h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center border border-border bg-card hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <TrendingDown className="h-10 w-10 text-green-500 mx-auto mb-4" />
                  <div className="text-5xl font-extrabold mb-2 bg-gradient-to-br from-green-400 to-emerald-600 bg-clip-text text-transparent">{t('proof.stat1')}</div>
                  <p className="text-muted-foreground text-sm mb-2">{t('proof.stat1_detail')}</p>
                  <p className="text-xs text-muted-foreground italic">{t('proof.stat1_source')}</p>
                </CardContent>
              </Card>

              <Card className="text-center border border-border bg-card hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <TrendingUp className="h-10 w-10 text-blue-500 mx-auto mb-4" />
                  <div className="text-5xl font-extrabold mb-2 bg-gradient-to-br from-blue-400 to-indigo-600 bg-clip-text text-transparent">{t('proof.stat2')}</div>
                  <p className="text-muted-foreground text-sm mb-2">{t('proof.stat2_detail')}</p>
                  <p className="text-xs text-muted-foreground italic">{t('proof.stat2_source')}</p>
                </CardContent>
              </Card>

              <Card className="text-center border border-border bg-card hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <BarChart3 className="h-10 w-10 text-orange-500 mx-auto mb-4" />
                  <div className="text-5xl font-extrabold mb-2 bg-gradient-to-br from-orange-400 to-red-500 bg-clip-text text-transparent">{t('proof.stat3')}</div>
                  <p className="text-muted-foreground text-sm mb-2">{t('proof.stat3_detail')}</p>
                  <p className="text-sm font-semibold text-primary">{t('proof.stat3_message')}</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center p-10 rounded-2xl border border-border bg-card shadow-sm">
              <p className="text-lg font-semibold text-foreground mb-6">
                {t('proof.urgency')}
              </p>
              <Link to="/cartographie/scan">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.03]">
                  <Network className="h-5 w-5 mr-2" />
                  {t('hero.cta_scan')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {t('benefits.title')}
              </h2>
              <p className="text-muted-foreground text-lg mb-10">
                {t('benefits.subtitle')}
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors duration-200">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pl-4">
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="transition-all duration-200 hover:scale-[1.02]">
                    <Users className="h-5 w-5 mr-2" />
                    {t('hero.cta_expert')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-5 lg:pt-4">
              {testimonials.map((testimonial, idx) => (
                <Card key={idx} className="border border-border bg-card hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <Quote className="h-6 w-6 text-primary/30 mb-3" />
                    <p className="text-foreground italic mb-5 text-sm leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                        {testimonial.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{testimonial.author}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role} — {testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0f172a 100%)',
      }}>
        {/* Subtle glow accents */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(ellipse at 30% 50%, hsl(var(--primary)) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, hsl(var(--primary)) 0%, transparent 60%)',
        }} />

        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {t('home.cta_title')}
            </h2>
            <p className="text-lg text-white/70 mb-3">
              {t('home.cta_subtitle')}
            </p>
            <p className="text-base text-white/45 mb-10">
              {t('home.cta_additional')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <Link to="/cartographie/scan">
                <Button size="lg" className="h-12 px-8 bg-white text-gray-900 hover:bg-gray-100 shadow-lg shadow-white/10 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-semibold">
                  <Network className="h-5 w-5 mr-2" />
                  {t('home.scan_free_3min')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/cartographie">
                <Button variant="outline" size="lg" className="h-12 px-8 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]">
                  <MapPin className="h-5 w-5 mr-2" />
                  {t('home.expert_cta')}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-extrabold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">50+</div>
                <div className="text-white/50 text-sm mt-1">{t('home.solutions_count')}</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">95%</div>
                <div className="text-white/50 text-sm mt-1">{t('home.satisfaction')}</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">5 min</div>
                <div className="text-white/50 text-sm mt-1">{t('home.response_time')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CSS Animations */}
      <style>{`
        @keyframes subtle-drift {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(16px) translateY(8px); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Index;
