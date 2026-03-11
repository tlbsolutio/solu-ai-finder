import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  ChevronDown,
  Plus,
  Zap,
  Target,
  Shield,
  Map,
  Calendar,
  Building2,
  Lightbulb,
  Search,
  TrendingUp,
  ChartLine,
  ChartColumn,
  CircleCheckBig,
  CodeXml,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import MetaTags from '@/components/seo/MetaTags';
import StructuredData from '@/components/seo/StructuredData';

const HERO_IMG = '/lovable-uploads/c8143545-6b97-49dd-85ba-65b954b9e501.png';

/* ── FAQ Accordion ── */
const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 px-1 text-left group" aria-expanded={open}>
        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-muted-foreground leading-relaxed px-1">{a}</p>
      </div>
    </div>
  );
};

/* ── Section helpers ── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-4 text-xs font-bold tracking-[.15em] uppercase text-primary">
    <div className="w-5 h-0.5 bg-primary rounded-full" />
    {children}
  </div>
);

/* ══════════════════════════════════════════════
   HOMEPAGE
   ══════════════════════════════════════════════ */
const Index = () => {
  const { t, language } = useLanguage();
  const [activeService, setActiveService] = useState(0);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const services = [
    {
      icon: Search, title: t('index.service1_title'), subtitle: t('index.service1_subtitle'),
      description: t('index.service1_desc'),
      features: [t('index.service1_feat1'), t('index.service1_feat2'), t('index.service1_feat3'), t('index.service1_feat4')],
      cta: t('index.service1_cta'), ctaLink: '/cartographie',
    },
    {
      icon: CodeXml, title: t('index.service2_title'), subtitle: t('index.service2_subtitle'),
      description: t('index.service2_desc'),
      features: [t('index.service2_feat1'), t('index.service2_feat2'), t('index.service2_feat3'), t('index.service2_feat4')],
      cta: t('index.service2_cta'), ctaLink: '/contact',
    },
    {
      icon: TrendingUp, title: t('index.service3_title'), subtitle: t('index.service3_subtitle'),
      description: t('index.service3_desc'),
      features: [t('index.service3_feat1'), t('index.service3_feat2'), t('index.service3_feat3'), t('index.service3_feat4')],
      cta: t('index.service3_cta'), ctaLink: 'https://calendly.com/tlb-ov_p/30min',
    },
  ];

  const cases = [
    {
      sector: t('index.case1_sector'), icon: Building2,
      tags: [t('index.case1_tag1'), t('index.case1_tag2'), t('index.case1_tag3')],
      result: t('index.case1_result'), resultSub: t('index.case1_resultSub'),
      before: t('index.case1_before'), after: t('index.case1_after'),
    },
    {
      sector: t('index.case2_sector'), icon: ChartLine,
      tags: [t('index.case2_tag1'), t('index.case2_tag2'), t('index.case2_tag3')],
      result: t('index.case2_result'), resultSub: t('index.case2_resultSub'),
      before: t('index.case2_before'), after: t('index.case2_after'),
    },
  ];

  const faqs = [
    { q: t('index.faq1_q'), a: t('index.faq1_a') },
    { q: t('index.faq2_q'), a: t('index.faq2_a') },
    { q: t('index.faq3_q'), a: t('index.faq3_a') },
    { q: t('index.faq4_q'), a: t('index.faq4_a') },
    { q: t('index.faq5_q'), a: t('index.faq5_a') },
    { q: t('index.faq6_q'), a: t('index.faq6_a') },
  ];

  return (
    <div className="relative">
      <MetaTags
        title={t('index.meta_title')}
        description={t('index.meta_description')}
        keywords={t('index.meta_keywords')}
      />
      <StructuredData type="FAQPage" data={{ questions: faqs.map((f) => ({ question: f.q, answer: f.a })) }} />
      <StructuredData type="ProfessionalService" data={{ name: "Solutio", description: t('index.structured_description') }} />

      {/* ═══ 1. HERO ═══ */}
      <section className="relative min-h-[100vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${HERO_IMG})`, filter: 'brightness(.35) saturate(1.15)' }} />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-950/10 via-slate-950/50 to-slate-950" />
        <div className="absolute inset-0 z-[2] opacity-30" style={{ backgroundImage: 'radial-gradient(ellipse at 25% 80%, rgba(6,182,212,0.12) 0%, transparent 50%)' }} />

        <div className="relative z-10 container mx-auto px-6 sm:px-10 pb-16 pt-32 lg:pb-24 lg:pt-48 max-w-3xl w-full">
          <Badge className="mb-6 bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-xs font-semibold px-3.5 py-1.5 backdrop-blur-sm animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 animate-pulse" />
            {t('index.hero_badge')}
          </Badge>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            {t('index.hero_title1')}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">
              {t('index.hero_title_highlight')}
            </span>
            .{' '}
            <br className="hidden sm:block" />
            <span className="text-white/90">{t('index.hero_title2')}</span>
          </h1>

          <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-10 max-w-2xl">
            {t('index.hero_description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <a href="https://calendly.com/tlb-ov_p/30min" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button size="lg" className="h-[3.25rem] px-8 w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 shadow-xl shadow-white/10 font-semibold group">
                <Calendar className="w-4 h-4 mr-2" />
                {t('index.hero_cta_book')}
                <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </a>
            <Link to="/cartographie">
              <Button size="lg" variant="outline" className="h-[3.25rem] px-8 w-full sm:w-auto border-white/20 text-white/80 bg-white/5 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm transition-all">
                <Map className="w-4 h-4 mr-2" />
                {t('index.hero_cta_tools')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-white/50">
            <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-cyan-400/60" /> {t('index.hero_trust_data')}</span>
            <span className="flex items-center gap-2"><CircleCheckBig className="w-3.5 h-3.5 text-cyan-400/60" /> {t('index.hero_trust_free')}</span>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-3">
          <div className="w-6 h-10 rounded-full border-2 border-white/15 flex items-start justify-center p-1.5">
            <div className="w-1 h-2.5 rounded-full bg-white/40 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══ 2. LE CONSTAT ═══ */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <SectionLabel>{t('index.problem_label')}</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-5">
              {t('index.problem_title_1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">{t('index.problem_title_highlight')}</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: Target, title: t('index.problem1_title'), desc: t('index.problem1_desc'), source: t('index.problem1_source'), color: 'from-red-500/10 to-rose-500/10 text-red-500' },
              { icon: ChartColumn, title: t('index.problem2_title'), desc: t('index.problem2_desc'), source: '', color: 'from-amber-500/10 to-orange-500/10 text-amber-600' },
              { icon: Lightbulb, title: t('index.problem3_title'), desc: t('index.problem3_desc'), source: t('index.problem3_source'), color: 'from-cyan-500/10 to-blue-500/10 text-cyan-600' },
            ].map((item) => (
              <Card key={item.title} className="group p-6 border-border/50 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                {item.source && <p className="text-xs text-muted-foreground/50 mt-3 italic">{item.source}</p>}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. SERVICES ═══ */}
      <section id="accompagnement" className="py-20 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <SectionLabel>{t('index.services_label')}</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-5">
              {t('index.services_title_1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">{t('index.services_title_highlight')}</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('index.services_desc')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {services.map((s, i) => (
              <button
                key={s.title}
                onClick={() => setActiveService(i)}
                aria-selected={activeService === i}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeService === i
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                <s.icon className="w-4 h-4" />
                {s.title}
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8 sm:p-10">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">{services[activeService].subtitle}</p>
                    <h3 className="text-2xl font-bold mb-4">{services[activeService].title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">{services[activeService].description}</p>
                    {services[activeService].ctaLink.startsWith('http') ? (
                      <a href={services[activeService].ctaLink} target="_blank" rel="noopener noreferrer">
                        <Button className="font-semibold shadow-md shadow-primary/20">{services[activeService].cta}<ArrowRight className="w-4 h-4 ml-1.5" /></Button>
                      </a>
                    ) : (
                      <Link to={services[activeService].ctaLink}>
                        <Button className="font-semibold shadow-md shadow-primary/20">{services[activeService].cta}<ArrowRight className="w-4 h-4 ml-1.5" /></Button>
                      </Link>
                    )}
                  </div>
                  <div className="space-y-3">
                    {services[activeService].features.map((f) => (
                      <div key={f} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <CircleCheckBig className="w-[18px] h-[18px] text-primary mt-0.5 shrink-0" />
                        <span className="text-sm text-foreground font-medium">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══ 4. ACCOMPAGNEMENT ═══ */}
      <section id="methode" className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="max-w-3xl mx-auto">
            <SectionLabel>{t('index.accompagnement_label')}</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-10">
              {t('index.accompagnement_title_1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">{t('index.accompagnement_title_highlight')}</span>
            </h2>

            <div className="space-y-8">
              {[
                { num: '01', title: t('index.accompagnement_step1_title'), desc: t('index.accompagnement_step1_desc') },
                { num: '02', title: t('index.accompagnement_step2_title'), desc: t('index.accompagnement_step2_desc') },
                { num: '03', title: t('index.accompagnement_step3_title'), desc: t('index.accompagnement_step3_desc') },
                { num: '04', title: t('index.accompagnement_step4_title'), desc: t('index.accompagnement_step4_desc') },
              ].map((s) => (
                <div key={s.num} className="flex gap-5 items-start">
                  <span className="text-2xl font-black text-primary/20 shrink-0 w-10">{s.num}</span>
                  <div>
                    <h3 className="text-base font-bold mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. OUTILS / PRODUITS ═══ */}
      <section id="outils" className="py-20 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-6 sm:px-10">
          <SectionLabel>{t('index.products_label')}</SectionLabel>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight max-w-xl">
              {t('index.products_title1')}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">{t('index.products_title_highlight')}</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed lg:text-right">
              {t('index.products_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* CARTO */}
            <Card className="group relative overflow-hidden border hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-7 pb-5 bg-gradient-to-br from-blue-50/80 to-primary/5 dark:from-blue-950/20 dark:to-primary/5">
                <div className="flex justify-between items-start mb-5">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <Map className="w-5 h-5 text-primary" />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 text-[10px]">
                    {t('index.product_carto_badge')}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2">{t('index.product_carto_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('index.product_carto_desc')}</p>
              </div>
              <div className="p-7 pt-5">
                <ul className="space-y-2.5 mb-7">
                  {[t('index.product_carto_feat1'), t('index.product_carto_feat2'), t('index.product_carto_feat3'), t('index.product_carto_feat4')].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CircleCheckBig className="w-2.5 h-2.5 text-primary" />
                      </div>
                      <span className="text-[13px] font-medium text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/cartographie">
                  <Button className="w-full font-semibold shadow-md shadow-primary/20">{t('index.product_carto_cta')}</Button>
                </Link>
              </div>
            </Card>

            {/* LEAD SCRAPER */}
            <Card className="relative overflow-hidden border opacity-75 hover:opacity-100 transition-opacity duration-300">
              <Badge className="absolute top-4 right-4 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 text-[10px]">
                {t('index.product_lead_badge')}
              </Badge>
              <div className="p-7 pb-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10">
                <div className="mb-5">
                  <div className="w-12 h-12 bg-slate-800 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2">{t('index.product_lead_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('index.product_lead_desc')}</p>
              </div>
              <div className="p-7 pt-5">
                <ul className="space-y-2.5 mb-7">
                  {[t('index.product_lead_feat1'), t('index.product_lead_feat2'), t('index.product_lead_feat3'), t('index.product_lead_feat4')].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <CircleCheckBig className="w-2.5 h-2.5 text-muted-foreground" />
                      </div>
                      <span className="text-[13px] font-medium text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full opacity-60" disabled>{t('index.product_lead_cta')}</Button>
              </div>
            </Card>

            {/* NEXT TOOL */}
            <Card className="relative overflow-hidden border-dashed border-2 bg-muted/30 opacity-75 hover:opacity-100 transition-opacity duration-300">
              <div className="p-7 pb-5 border-b border-dashed">
                <div className="mb-5">
                  <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2 text-muted-foreground">{t('index.product_next_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('index.product_next_desc')}</p>
              </div>
              <div className="p-7 pt-5">
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-7">{t('index.product_next_text')}</p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full bg-muted/50">{t('index.product_next_cta')}</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══ 6. RÉALISATIONS ═══ */}
      <section id="realisations" className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-6 sm:px-10">
          <SectionLabel>{t('index.cases_label')}</SectionLabel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
              {t('index.cases_title1')}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">{t('index.cases_title_highlight')}</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">{t('index.cases_desc')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {cases.map((c, i) => (
              <Card key={i} className="group border hover:border-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-7">
                  <div className="mb-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <c.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold mb-1">{c.sector}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 font-medium">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-xl px-5 py-4 border border-primary/10">
                      <p className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 leading-snug">{c.result}</p>
                      <p className="text-[10px] font-bold text-muted-foreground tracking-[.15em] uppercase mt-1.5">{c.resultSub}</p>
                    </div>
                  </div>

                  <div className="pb-4 mb-4 border-b border-border/50">
                    <p className="text-[10px] font-bold tracking-[.15em] text-muted-foreground/70 uppercase mb-2">{t('index.cases_before_label')}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.before}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[.15em] text-primary uppercase mb-2">{t('index.cases_after_label')}</p>
                    <p className="text-sm text-foreground font-medium leading-relaxed">{c.after}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. CONVICTION ═══ */}
      <section id="conviction" className="py-20 sm:py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="container mx-auto px-6 sm:px-10 relative">
          <div className="max-w-3xl mx-auto">
            <SectionLabel>{t('index.conviction_label')}</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-5">
              {t('index.conviction_title_1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">{t('index.conviction_title_highlight')}</span>
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed text-sm sm:text-[15px]">
              <p>
                {t('index.conviction_p1')}
              </p>
              {t('index.conviction_p2') && (
                <p className="text-foreground font-semibold">
                  {t('index.conviction_p2')}
                </p>
              )}
              <p className="text-foreground/80 font-medium italic">
                {t('index.conviction_quote')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 8. CALCULATEUR ═══ */}
      <ROICalculator />

      {/* ═══ 9. FAQ ═══ */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="max-w-[780px] mx-auto">
            <SectionLabel>{t('index.faq_label')}</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-5">
              {t('index.faq_title')}
            </h2>
            <div className="border rounded-2xl px-6 sm:px-8 divide-y divide-border/50 bg-background shadow-md hover:shadow-lg transition-shadow">
              {faqs.map((f, i) => (
                <FAQItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ── ROI Calculator ── */
const ROICalculator = () => {
  const { t, language } = useLanguage();
  const [team, setTeam] = useState(15);
  const [hoursLost, setHoursLost] = useState(5);
  const monthlyLoss = Math.round(team * hoursLost * 45 * 4.33);
  const yearlyLoss = monthlyLoss * 12;
  const locale = language === 'fr' ? 'fr-FR' : 'en-GB';

  return (
    <section className="py-20 sm:py-24 bg-background">
      <div className="container mx-auto px-6 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>{t('index.roi_label')}</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-5">
              Combien vous coutent vos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">inefficacites ?</span>
            </h2>
            <p className="text-muted-foreground">
              {t('index.roi_subtitle')}
            </p>
          </div>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-8 sm:p-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium mb-3">
                      <span>{t('index.roi_team_label')}</span>
                      <span className="text-primary font-bold">{team} {t('index.roi_team_unit')}</span>
                    </label>
                    <input type="range" min="2" max="100" value={team} onChange={(e) => setTeam(Number(e.target.value))} className="w-full accent-primary" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>2</span><span>100</span></div>
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium mb-3">
                      <span>{t('index.roi_hours_label')}</span>
                      <span className="text-primary font-bold">{hoursLost}h</span>
                    </label>
                    <input type="range" min="1" max="20" value={hoursLost} onChange={(e) => setHoursLost(Number(e.target.value))} className="w-full accent-primary" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1h</span><span>20h</span></div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('index.roi_note')}
                  </p>
                </div>

                <div className="relative flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/10 border border-red-200/50 dark:border-red-800/30 overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <p className="text-[10px] uppercase tracking-[.2em] text-red-400 font-bold mb-3">{t('index.roi_cost_label')}</p>
                  <p className="text-4xl sm:text-5xl font-black text-red-600 dark:text-red-500 tabular-nums">
                    {monthlyLoss.toLocaleString(locale)} EUR
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{t('index.roi_per_month')}</p>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent dark:via-red-700 my-4" />
                  <p className="text-xl font-extrabold text-red-500 tabular-nums">
                    {yearlyLoss.toLocaleString(locale)} EUR{t('index.roi_per_year')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4 leading-relaxed max-w-[200px]">
                    {t('index.roi_cta_note')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Index;
