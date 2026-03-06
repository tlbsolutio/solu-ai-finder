import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Plus, Calendar, Linkedin, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import MetaTags from '@/components/seo/MetaTags';
import StructuredData from '@/components/seo/StructuredData';

const HERO_IMG = '/lovable-uploads/c8143545-6b97-49dd-85ba-65b954b9e501.png';

const Index = () => {
  const { t } = useLanguage();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    { q: t('home.faq1_q'), a: t('home.faq1_a') },
    { q: t('home.faq2_q'), a: t('home.faq2_a') },
    { q: t('home.faq3_q'), a: t('home.faq3_a') },
    { q: t('home.faq4_q'), a: t('home.faq4_a') },
  ];

  const realisations = [
    {
      sector: t('home.real1_sector'), icon: '📊',
      tags: [t('home.real1_tag1'), t('home.real1_tag2'), t('home.real1_tag3')],
      metric: t('home.real1_metric'), metricLabel: t('home.real1_metric_label'),
      before: t('home.real1_before'), after: t('home.real1_after'),
    },
    {
      sector: t('home.real2_sector'), icon: '📣',
      tags: [t('home.real2_tag1'), t('home.real2_tag2'), t('home.real2_tag3')],
      metric: t('home.real2_metric'), metricLabel: t('home.real2_metric_label'),
      before: t('home.real2_before'), after: t('home.real2_after'),
    },
  ];

  const accompagnementSteps = [
    { n: '01', title: t('home.acc_step1_title'), desc: t('home.acc_step1_desc') },
    { n: '02', title: t('home.acc_step2_title'), desc: t('home.acc_step2_desc') },
    { n: '03', title: t('home.acc_step3_title'), desc: t('home.acc_step3_desc') },
    { n: '04', title: t('home.acc_step4_title'), desc: t('home.acc_step4_desc') },
  ];

  const convictions = [
    { n: '01', title: t('home.conv1_title'), desc: t('home.conv1_desc') },
    { n: '02', title: t('home.conv2_title'), desc: t('home.conv2_desc') },
    { n: '03', title: t('home.conv3_title'), desc: t('home.conv3_desc') },
    { n: '04', title: t('home.conv4_title'), desc: t('home.conv4_desc') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Solutio | Conseil en transformation digitale & outils sur mesure"
        description="Solutio existe pour que les professionnels puissent se concentrer sur ce qui leur rapporte. Cartographie organisationnelle, developpement sur mesure et accompagnement conseil."
        type="website"
        keywords="transformation digitale, conseil, cartographie organisationnelle, outils sur mesure, automatisation, accompagnement PME"
      />
      <StructuredData
        type="Organization"
        data={{
          name: 'Solutio',
          description: 'Cabinet de conseil en transformation digitale. Outils sur mesure et accompagnement.',
          service: [
            { '@type': 'Service', name: 'Cartographie organisationnelle', description: 'Evaluation de la maturite de vos processus, outils et equipes.' },
            { '@type': 'Service', name: 'Developpement sur mesure', description: 'Systemes applicatifs tailles pour votre organisation.' },
            { '@type': 'Service', name: 'Accompagnement conseil', description: 'Diagnostic, priorisation, implementation et formation.' },
          ],
        }}
      />
      <StructuredData type="WebSite" data={{ name: 'Solutio', url: 'https://solutio.work' }} />
      <StructuredData
        type="FAQPage"
        data={{ questions: faqs.map((f) => ({ question: f.q, answer: f.a })) }}
      />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[100vh] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_IMG})`, filter: 'brightness(.38) saturate(1.1)' }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-950/15 via-slate-950/55 to-slate-950/[.98]" />

        <div className="relative z-10 container mx-auto px-6 sm:px-10 pb-16 pt-32 lg:pb-20 lg:pt-48 max-w-[900px] w-full">
          <div className="animate-fade-in">
            <Badge
              variant="secondary"
              className="mb-8 bg-white/10 text-white/80 border border-white/15 backdrop-blur-sm rounded-full px-5 py-2 text-xs font-semibold tracking-wider uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 animate-pulse" />
              {t('home.badge')}
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-3">
            {t('home.hero_line1')}
          </h1>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-blue-400 leading-[1.05] tracking-tight mb-8">
            {t('home.hero_line2')}
          </h1>

          <p className="text-base sm:text-lg text-white/60 max-w-xl leading-relaxed mb-10">
            {t('home.hero_sub')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <a href="https://calendly.com/tlb-ov_p/30min" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="h-12 px-8 bg-white text-gray-900 hover:bg-gray-100 shadow-lg shadow-white/10 font-semibold"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {t('home.hero_btn_work')}
              </Button>
            </a>
            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollTo('outils')}
              className="h-12 px-8 border-white/25 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm"
            >
              {t('home.hero_btn_tools')}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[t('home.hero_pill1'), t('home.hero_pill2'), t('home.hero_pill3')].map((label) => (
              <span
                key={label}
                className="text-xs text-white/35 font-semibold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 right-8 z-10 hidden lg:flex flex-col items-center gap-2 opacity-25">
          <span className="text-[9px] font-bold tracking-[.18em] text-white uppercase">{t('home.hero_scroll')}</span>
          <div className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* ═══ OUTILS ═══ */}
      <section id="outils" className="py-20 lg:py-24 px-6 sm:px-10">
        <div className="max-w-[1060px] mx-auto">
          <SectionLabel>{t('home.outils_label')}</SectionLabel>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold leading-[1.1] tracking-tight max-w-xl">
              {t('home.outils_title')}{' '}
              <span className="text-primary">{t('home.outils_title_accent')}</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed lg:text-right">
              {t('home.outils_sub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* CARTO */}
            <Card className="group relative overflow-hidden border hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-7 pb-5 bg-gradient-to-br from-blue-50/80 to-primary/5 dark:from-blue-950/20 dark:to-primary/5">
                <div className="flex justify-between items-start mb-5">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-xl">🗺</div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 text-[10px]">
                    {t('home.carto_badge')}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2">{t('home.carto_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('home.carto_desc')}</p>
              </div>
              <div className="p-7 pt-5">
                <ul className="space-y-2.5 mb-7">
                  {[t('home.carto_f1'), t('home.carto_f2'), t('home.carto_f3'), t('home.carto_f4')].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-2.5 h-2.5 text-primary" />
                      </div>
                      <span className="text-[13px] font-medium text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/cartographie/login">
                  <Button className="w-full font-semibold shadow-md shadow-primary/20">{t('home.carto_btn')}</Button>
                </Link>
              </div>
            </Card>

            {/* LEAD SCRAPER */}
            <Card className="relative overflow-hidden border opacity-75">
              <Badge className="absolute top-4 right-4 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 text-[10px]">
                {t('home.lead_badge')}
              </Badge>
              <div className="p-7 pb-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10">
                <div className="mb-5">
                  <div className="w-12 h-12 bg-slate-800 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-xl">🎯</div>
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2">{t('home.lead_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('home.lead_desc')}</p>
              </div>
              <div className="p-7 pt-5">
                <ul className="space-y-2.5 mb-7">
                  {[t('home.lead_f1'), t('home.lead_f2'), t('home.lead_f3'), t('home.lead_f4')].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-2.5 h-2.5 text-muted-foreground" />
                      </div>
                      <span className="text-[13px] font-medium text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full opacity-60" disabled>{t('home.lead_btn')}</Button>
              </div>
            </Card>

            {/* NEXT TOOL */}
            <Card className="relative overflow-hidden border-dashed border-2 bg-muted/30 opacity-75">
              <div className="p-7 pb-5 border-b border-dashed">
                <div className="mb-5">
                  <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2 text-muted-foreground">{t('home.next_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('home.next_desc')}</p>
              </div>
              <div className="p-7 pt-5">
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-7">{t('home.next_sub')}</p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full bg-muted/50">{t('home.next_btn')}</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-border" />

      {/* ═══ REALISATIONS ═══ */}
      <section id="realisations" className="py-20 lg:py-24 px-6 sm:px-10 bg-muted/30">
        <div className="max-w-[1060px] mx-auto">
          <SectionLabel>{t('home.real_label')}</SectionLabel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.1] tracking-tight">
              {t('home.real_title')}{' '}
              <span className="text-primary">{t('home.real_title_accent')}</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">{t('home.real_sub')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {realisations.map((r, i) => (
              <Card key={i} className="border hover:border-primary/25 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-7">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{r.icon}</span>
                      <div>
                        <p className="text-[13px] font-bold mb-1">{r.sector}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {r.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 font-medium">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-3xl sm:text-4xl font-extrabold text-primary leading-none">{r.metric}</p>
                      <p className="text-[10px] font-bold text-muted-foreground tracking-wide uppercase mt-1">{r.metricLabel}</p>
                    </div>
                  </div>
                  <div className="pb-4 mb-4 border-b">
                    <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-1.5">{t('home.real_before_label')}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.before}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-wider text-primary uppercase mb-1.5">{t('home.real_after_label')}</p>
                    <p className="text-sm text-foreground font-medium leading-relaxed">{r.after}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-border" />

      {/* ═══ ACCOMPAGNEMENT ═══ */}
      <section id="accompagnement" className="py-20 lg:py-24 px-6 sm:px-10">
        <div className="max-w-[1060px] mx-auto">
          <SectionLabel>{t('home.acc_label')}</SectionLabel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.1] tracking-tight mb-5">
                {t('home.acc_title')}{' '}
                <span className="text-primary">{t('home.acc_title_accent')}</span>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-5">{t('home.acc_p1')}</p>
              <p className="text-base text-foreground font-medium leading-relaxed mb-9">{t('home.acc_p2')}</p>

              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <a href="https://calendly.com/tlb-ov_p/30min" target="_blank" rel="noopener noreferrer">
                  <Button className="font-semibold shadow-md shadow-primary/20">{t('home.acc_btn1')}</Button>
                </a>
                <Button variant="outline" onClick={() => scrollTo('outils')}>{t('home.acc_btn2')}</Button>
              </div>
              <p className="text-xs text-muted-foreground italic">{t('home.acc_limit')}</p>
            </div>

            <div className="space-y-3.5">
              {accompagnementSteps.map((s) => (
                <div key={s.n} className="flex gap-4 p-5 bg-muted/50 rounded-xl border transition-colors hover:border-primary/20">
                  <span className="text-[13px] font-extrabold text-primary flex-shrink-0 pt-0.5">{s.n}</span>
                  <div>
                    <p className="text-sm font-bold mb-1">{s.title}</p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-border" />

      {/* ═══ CONVICTION ═══ */}
      <section className="py-20 lg:py-24 px-6 sm:px-10 bg-muted/30">
        <div className="max-w-[1060px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
            <div>
              <SectionLabel>{t('home.conv_label')}</SectionLabel>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.1] tracking-tight mb-6">
                {t('home.conv_title')}{' '}
                <span className="text-primary">{t('home.conv_title_accent')}</span>
              </h2>
              <blockquote className="text-base sm:text-lg text-foreground font-semibold leading-relaxed border-l-[3px] border-primary pl-5 mb-5">
                {t('home.conv_quote')}
              </blockquote>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">{t('home.conv_p1')}</p>
              <p className="text-base text-muted-foreground leading-relaxed">{t('home.conv_p2')}</p>
            </div>

            <div className="lg:border-l lg:pl-12 space-y-0">
              {convictions.map((s, i) => (
                <div key={s.n} className={`pb-7 mb-7 ${i < convictions.length - 1 ? 'border-b' : ''}`}>
                  <p className="text-[11px] font-extrabold text-primary tracking-wider mb-1.5">{s.n}</p>
                  <p className="text-[15px] font-bold mb-1">{s.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-border" />

      {/* ═══ FAQ ═══ */}
      <section className="py-20 lg:py-24 px-6 sm:px-10">
        <div className="max-w-[1060px] mx-auto">
          <SectionLabel>{t('home.faq_label')}</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.1] tracking-tight mb-12 max-w-md">
            {t('home.faq_title')}{' '}
            <span className="text-primary">{t('home.faq_title_accent')}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border rounded-2xl overflow-hidden">
            {faqs.map((f, i) => {
              const isLeft = i % 2 === 0;
              const isTop = i < 2;
              return (
                <div
                  key={i}
                  className={`p-8 sm:p-9 ${isLeft ? 'md:border-r' : ''} ${isTop ? 'border-b' : ''} ${
                    i === 1 || i === 2 ? 'bg-muted/30' : ''
                  }`}
                >
                  <p className="text-base font-bold mb-3 leading-snug">{f.q}</p>
                  <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ DUAL CTA ═══ */}
      <section className="py-20 lg:py-24 px-6 sm:px-10" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}>
        <div className="max-w-[1060px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-0 items-stretch">
            <div className="p-4 md:pr-12">
              <Badge className="mb-5 bg-amber-500/10 text-amber-400 border-amber-500/30 text-[11px]">{t('home.dcta_consult_badge')}</Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight mb-4">{t('home.dcta_consult_title')}</h2>
              <p className="text-[15px] text-white/50 leading-relaxed mb-8">{t('home.dcta_consult_sub')}</p>
              <a href="https://calendly.com/tlb-ov_p/30min" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg font-semibold">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('home.dcta_consult_btn')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>

            <div className="hidden md:block bg-white/10" />
            <div className="md:hidden h-px bg-white/10 my-8" />

            <div className="p-4 md:pl-12">
              <Badge className="mb-5 bg-blue-500/10 text-blue-400 border-blue-500/30 text-[11px]">{t('home.dcta_product_badge')}</Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight mb-4">{t('home.dcta_product_title')}</h2>
              <p className="text-[15px] text-white/50 leading-relaxed mb-8">{t('home.dcta_product_sub')}</p>
              <Link to="/cartographie/login">
                <Button className="bg-slate-800 text-white hover:bg-slate-700 font-semibold">
                  {t('home.dcta_product_btn')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-4 text-[11px] font-bold tracking-[.1em] uppercase text-primary">
    <div className="w-5 h-0.5 bg-primary rounded-full" />
    {children}
  </div>
);

export default Index;
