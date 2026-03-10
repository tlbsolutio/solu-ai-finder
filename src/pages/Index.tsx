import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Plus,
  Zap,
  Brain,
  Target,
  BarChart3,
  Shield,
  Sparkles,
  Map,
  ListChecks,
  Calendar,
  Building2,
  Lightbulb,
  Search,
  Code2,
  TrendingUp,
  LineChart,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import MetaTags from '@/components/seo/MetaTags';
import StructuredData from '@/components/seo/StructuredData';

const HERO_IMG = '/lovable-uploads/c8143545-6b97-49dd-85ba-65b954b9e501.png';

/* ── Mini Radar ── */
const MiniRadarChart = ({ size = 200 }: { size?: number }) => {
  const axes = [
    { label: 'Strategie', v: 0.8 }, { label: 'Process', v: 0.5 },
    { label: 'Tech', v: 0.65 }, { label: 'RH', v: 0.45 },
    { label: 'Data', v: 0.7 }, { label: 'Culture', v: 0.55 },
    { label: 'Finance', v: 0.75 }, { label: 'Client', v: 0.6 },
    { label: 'Innovation', v: 0.4 }, { label: 'Ops', v: 0.85 },
  ];
  const half = size / 2, maxR = half * 0.72, n = axes.length;
  const pt = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: half + r * Math.cos(a), y: half + r * Math.sin(a) };
  };
  const dp = axes.map((a, i) => pt(i, maxR * a.v));
  const path = dp.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ') + 'Z';
  const line = 'rgba(255,255,255,0.08)';
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" role="img" aria-label="Radar de maturite organisationnelle sur 10 axes">
      {[0.25, 0.5, 0.75, 1].map((l) => {
        const pts = Array.from({ length: n }, (_, i) => pt(i, maxR * l));
        return <path key={l} d={pts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ') + 'Z'} fill="none" stroke={line} strokeWidth="1" />;
      })}
      {axes.map((_, i) => { const p = pt(i, maxR); return <line key={i} x1={half} y1={half} x2={p.x} y2={p.y} stroke={line} strokeWidth="1" />; })}
      <path d={path} fill="url(#rGrad)" stroke="rgba(6,182,212,0.7)" strokeWidth="2"><animate attributeName="opacity" from="0" to="1" dur="1.5s" fill="freeze" /></path>
      {dp.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#06b6d4" stroke="#fff" strokeWidth="1.5"><animate attributeName="r" from="0" to="3" dur="1s" begin={`${i * 0.08}s`} fill="freeze" /></circle>)}
      {axes.map((a, i) => { const p = pt(i, maxR + 16); return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-white/40 text-[6px] font-semibold uppercase tracking-wider">{a.label}</text>; })}
      <defs><linearGradient id="rGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(6,182,212,0.3)" /><stop offset="100%" stopColor="rgba(59,130,246,0.2)" /></linearGradient></defs>
    </svg>
  );
};

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
  const { t } = useLanguage();
  const [activeService, setActiveService] = useState(0);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const services = [
    {
      icon: Search, title: 'Conseil & Diagnostic', subtitle: "Comprendre avant d'agir",
      description: "Audit complet de votre organisation : processus, outils, equipes, couts. On identifie ce qui freine votre croissance et on vous donne un plan d'action concret.",
      features: ['Cartographie de vos processus et flux', "Identification des goulots d'etranglement", 'Analyse des couts caches et inefficacites', "Plan d'action priorise avec ROI estime"],
      cta: 'Demander un diagnostic', ctaLink: '/cartographie',
    },
    {
      icon: Code2, title: 'Outils sur mesure', subtitle: "Quand rien n'existe sur le marche",
      description: "Developpement de plateformes et outils metier adaptes a vos besoins reels. Pas de SaaS generique : des solutions pensees pour votre facon de travailler.",
      features: ['Plateformes SaaS internes ou client', 'Automatisation de processus repetitifs', 'Integrations multi-outils (API, CRM, ERP)', 'Tableaux de bord et reporting sur mesure'],
      cta: 'Discuter de votre projet', ctaLink: '/contact',
    },
    {
      icon: TrendingUp, title: 'Accompagnement', subtitle: 'Du diagnostic a la transformation',
      description: "Suivi de la mise en oeuvre, formation de vos equipes, mesure des resultats. On reste a vos cotes jusqu'a ce que les changements soient ancres.",
      features: ['Feuille de route sur 30/60/90 jours', 'Coaching equipes et conduite du changement', 'Suivi KPIs et ajustements', 'Transfert de competences'],
      cta: 'Reserver un echange', ctaLink: 'https://calendly.com/tlb-ov_p/30min',
    },
  ];

  const caseStudies = [
    {
      sector: 'Cabinet de conseil — 25 consultants',
      icon: Building2,
      tags: ['Suivi de mission', 'Portail consultant', 'Reporting auto'],
      before: 'Tout gere manuellement : saisies redondantes, coordination dispersee, reporting hebdomadaire de 4h. Le temps administratif depassait le temps terrain.',
      after: 'Une plateforme sur mesure avec 5 outils metier integres. Missions, activite, livrables — tout centralise. Reporting automatise, coordination fluide.',
      result: '85% de temps de reporting en moins',
    },
    {
      sector: "Agence marketing d'affiliation — 6 clients",
      icon: LineChart,
      tags: ['SaaS Platform', 'Automatisation', 'Multi-client'],
      before: 'Rapports manuels sur 3 reseaux (Rakuten, Impact, Awin). 2 jours par semaine perdus en copier-coller et mise en forme.',
      after: 'SaaS full-stack avec import automatique multi-reseau, dashboards temps reel et alertes. Scalable de 6 a 30+ clients.',
      result: '2 jours/semaine recuperes par consultant',
    },
  ];

  const faqs = [
    { q: "C'est quoi exactement Solutio ?", a: "Solutio est un cabinet de conseil en transformation digitale. On aide les entreprises a comprendre ce qui freine leur croissance (diagnostic), a construire les outils qu'il leur faut (developpement sur mesure), et a mettre en oeuvre les changements (accompagnement). Notre outil de cartographie organisationnelle est gratuit pour commencer." },
    { q: 'Le diagnostic est vraiment gratuit ?', a: "Oui. Le questionnaire complet (10 packs) est entierement gratuit. Vous obtenez une vue d'ensemble, un radar de maturite et une carte interactive sans rien payer. Les analyses IA approfondies et le plan d'action detaille sont disponibles a partir de 349 EUR." },
    { q: 'Combien coute un projet de developpement sur mesure ?', a: "Cela depend de la complexite. Un outil simple peut demarrer autour de quelques milliers d'euros, une plateforme complete sera plus consequente. On commence toujours par un diagnostic gratuit pour cadrer le besoin avant de proposer un devis." },
    { q: "Vous travaillez avec quels types d'entreprises ?", a: "Principalement des PME et ETI de 10 a 500 collaborateurs, tous secteurs. Nos cas les plus frequents : cabinets de conseil, agences, entreprises industrielles, ESS. Le point commun : des dirigeants qui veulent transformer leur organisation sans se perdre." },
    { q: "En quoi vous etes differents d'un cabinet de conseil classique ?", a: "On ne fait pas de PowerPoint de 200 slides. On diagnostique avec un outil IA concret, on recommande des actions priorisees avec ROI estime, et si besoin on construit les outils. Du diagnostic a l'implementation, un seul interlocuteur." },
    { q: 'Mes donnees sont-elles protegees ?', a: "Absolument. Vos donnees sont hebergees en Europe (Supabase Ireland), chiffrees en transit et au repos. Nous ne les partageons jamais avec des tiers. Vous pouvez supprimer vos donnees a tout moment." },
  ];

  return (
    <div className="relative">
      <MetaTags
        title="Solutio — Conseil en transformation digitale & outils sur mesure"
        description="Diagnostic IA gratuit, cartographie organisationnelle, developpement d'outils metier et accompagnement. Solutio aide les dirigeants a transformer leur entreprise."
        keywords="transformation digitale, conseil, diagnostic, cartographie organisationnelle, outils sur mesure, PME"
      />
      <StructuredData type="FAQPage" data={{ questions: faqs.map((f) => ({ question: f.q, answer: f.a })) }} />
      <StructuredData type="ProfessionalService" data={{ name: "Solutio", description: "Cabinet de conseil en transformation digitale : diagnostic IA, outils sur mesure et accompagnement." }} />

      {/* ═══ 1. HERO ═══ */}
      <section className="relative min-h-[100vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${HERO_IMG})`, filter: 'brightness(.38) saturate(1.1)' }} />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-950/15 via-slate-950/55 to-slate-950/[.98]" />

        <div className="relative z-10 container mx-auto px-6 sm:px-10 pb-16 pt-32 lg:pb-20 lg:pt-48 max-w-3xl w-full">
          <Badge className="mb-6 bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-xs font-semibold px-3 py-1.5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 animate-pulse" />
            Conseil & Transformation Digitale
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
            Votre entreprise peut faire{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              beaucoup mieux
            </span>
            .{' '}
            <br className="hidden sm:block" />
            <span className="text-white/90">On vous montre comment.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-9 max-w-2xl">
            Diagnostic IA gratuit, cartographie de vos processus, construction d'outils sur mesure
            et accompagnement concret. Un seul objectif : que votre organisation fonctionne vraiment.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <a href="https://calendly.com/tlb-ov_p/30min" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 px-8 w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 shadow-lg shadow-white/10 font-semibold">
                <Calendar className="w-4 h-4 mr-2" />
                Reserver un echange
              </Button>
            </a>
            <Button size="lg" variant="outline" onClick={() => scrollTo('outils')} className="h-12 px-8 border-white/25 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm">
              Decouvrir nos outils
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-cyan-400/70" /> Donnees hebergees en Europe</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cyan-400/70" /> Diagnostic gratuit sur 10 axes</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-cyan-400/70" /> Sans engagement</span>
          </div>
        </div>

        <div className="absolute bottom-6 right-8 z-10 hidden lg:flex flex-col items-center gap-2 opacity-25">
          <span className="text-[9px] font-bold tracking-[.18em] text-white uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* ═══ 2. PROBLEM STATEMENT — concret, pas de stats vagues ═══ */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <SectionLabel>Le constat</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-5">
              Vous le voyez tous les jours, mais vous n'avez pas le temps de le mesurer
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Des processus qui ralentissent, des outils qui ne se parlent pas, des equipes qui compensent
              a la main. Le resultat : du temps perdu, de l'energie gaspillee, et un potentiel sous-exploite.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: Target, title: 'Des irritants invisibles', desc: "Les vrais blocages ne sont pas toujours la ou on les cherche. Sans cartographie, on traite les symptomes, pas les causes." },
              { icon: BarChart3, title: 'Des outils empiles', desc: "Excel ici, un CRM la, Notion pour certains, emails pour le reste. Aucune vue consolidee, chaque equipe a son propre systeme." },
              { icon: Lightbulb, title: 'Des quick wins ignores', desc: "Des gains rapides (souvent quelques heures/semaine) existent dans toute organisation. Encore faut-il savoir ou regarder." },
            ].map((item) => (
              <Card key={item.title} className="p-6 border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-300">
                <item.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-base font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. SERVICES — 3 Pillars ═══ */}
      <section id="accompagnement" className="py-20 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <SectionLabel>Nos services</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-5">
              Du diagnostic a la transformation, un seul interlocuteur
            </h2>
            <p className="text-muted-foreground text-lg">
              Pas de consulting theorique. On diagnostique, on construit, on accompagne — jusqu'aux resultats.
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
                        <CheckCircle className="w-4.5 h-4.5 text-primary mt-0.5 shrink-0" />
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

      {/* ═══ 4. OUTILS — V0 3-card grid style ═══ */}
      <section id="outils" className="py-20 lg:py-24 px-6 sm:px-10">
        <div className="max-w-[1060px] mx-auto">
          <SectionLabel>{t('home.outils_label')}</SectionLabel>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight max-w-xl">
              {t('home.outils_title')}{' '}
              <span className="text-primary">{t('home.outils_title_accent')}</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed lg:text-right">
              {t('home.outils_sub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* CARTO */}
            <Card className="group relative overflow-hidden border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <div className="p-7 pb-5 bg-gradient-to-br from-blue-50/80 to-primary/5 dark:from-blue-950/20 dark:to-primary/5">
                <div className="flex justify-between items-start mb-5">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <Map className="w-5 h-5 text-primary" />
                  </div>
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
                      <span className="text-sm font-medium text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/cartographie">
                  <Button className="w-full font-semibold shadow-md shadow-primary/20">{t('home.carto_btn')}</Button>
                </Link>
              </div>
            </Card>

            {/* LEAD SCRAPER */}
            <Card className="relative overflow-hidden border opacity-80 hover:opacity-100 transition-opacity duration-300">
              <Badge className="absolute top-4 right-4 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 text-[10px]">
                {t('home.lead_badge')}
              </Badge>
              <div className="p-7 pb-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10">
                <div className="mb-5">
                  <div className="w-12 h-12 bg-slate-800 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
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
                      <span className="text-sm font-medium text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full opacity-60" disabled>{t('home.lead_btn')}</Button>
              </div>
            </Card>

            {/* NEXT TOOL */}
            <Card className="relative overflow-hidden border-dashed border-2 bg-muted/30 opacity-80 hover:opacity-100 transition-opacity duration-300">
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
                <p className="text-sm text-muted-foreground leading-relaxed mb-7">{t('home.next_sub')}</p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full bg-muted/50">{t('home.next_btn')}</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ═══ 5. REALISATIONS — V0 before/after style with concrete data ═══ */}
      <section id="realisations" className="py-20 lg:py-24 px-6 sm:px-10 bg-muted/30">
        <div className="max-w-[1060px] mx-auto">
          <SectionLabel>Cas concrets</SectionLabel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold leading-[1.1] tracking-tight">
              Des resultats mesurables,{' '}
              <span className="text-primary">pas des promesses.</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Projets reels, resultats verifiables. Voici comment on a aide des entreprises comme la votre a reprendre le controle.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {caseStudies.map((cs, i) => (
              <Card key={i} className="border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <cs.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{cs.sector}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {cs.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 font-medium">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg px-4 py-3 mb-5 border border-emerald-200/50 dark:border-emerald-800/30">
                    <p className="text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-400 leading-snug">{cs.result}</p>
                  </div>

                  <div className="pb-4 mb-4 border-b">
                    <p className="text-[11px] font-bold tracking-wider text-red-500/70 uppercase mb-1.5">Avant</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{cs.before}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-wider text-primary uppercase mb-1.5">Apres</p>
                    <p className="text-sm text-foreground font-medium leading-relaxed">{cs.after}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-border" />

      {/* ═══ 7. CONVICTION ═══ */}
      <section id="conviction" className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="max-w-3xl mx-auto">
            <SectionLabel>Notre conviction</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-8">
              La transformation digitale ne devrait pas etre un projet a 500K EUR qui echoue.
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed text-base">
              <p>
                La plupart des entreprises n'ont pas besoin d'une "strategie digitale" de 200 pages.
                Elles ont besoin de comprendre ou elles perdent du temps, de l'argent et de l'energie —
                puis d'agir sur les bonnes priorites.
              </p>
              <p>
                C'est ce qu'on fait chez Solutio. On commence par un diagnostic concret (pas un audit de 3 mois),
                on identifie les quick wins (pas des recommandations vagues), et si besoin, on construit
                les outils qui manquent (pas du sur-engineering).
              </p>
              <p className="text-foreground font-semibold">
                Notre objectif : que chaque euro investi dans votre transformation vous rapporte un resultat mesurable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 8. ROI CALCULATOR ═══ */}
      <ROICalculator />

      {/* ═══ 9. FAQ ═══ */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="max-w-[780px] mx-auto">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-10">
              Questions frequentes
            </h2>
            <div className="border rounded-2xl px-6 sm:px-8 divide-y divide-border/50 bg-background shadow-sm">
              {faqs.map((f, i) => (
                <FAQItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 10. FINAL CTA ═══ */}
      <section className="py-20 sm:py-24" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="container mx-auto px-6 sm:px-10 text-center">
          <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-5 max-w-2xl mx-auto text-white">
            Pret a voir ce que votre entreprise peut vraiment faire ?
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
            Commencez par un echange gratuit ou lancez votre diagnostic organisationnel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://calendly.com/tlb-ov_p/30min" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="h-12 px-8 bg-white text-gray-900 hover:bg-gray-100 shadow-lg font-semibold w-full sm:w-auto">
                <Calendar className="w-4 h-4 mr-2" />
                Reserver un echange gratuit
              </Button>
            </a>
            <Link to="/cartographie">
              <Button size="lg" variant="outline" className="h-12 px-8 border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
                Lancer le diagnostic
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <p className="text-white/30 text-xs mt-8">
            Gratuit — Sans engagement — Donnees hebergees en Europe
          </p>
        </div>
      </section>
    </div>
  );
};

/* ── ROI Calculator ── */
const ROICalculator = () => {
  const [team, setTeam] = useState(15);
  const [hoursLost, setHoursLost] = useState(5);
  const hourlyRate = 45;
  const monthlyLoss = Math.round(team * hoursLost * hourlyRate * 4.33);
  const yearlyLoss = monthlyLoss * 12;

  return (
    <section className="py-20 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-6 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Calculateur</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-4">
              Combien vous coutent vos inefficacites ?
            </h2>
            <p className="text-muted-foreground">
              Estimation basee sur un cout horaire moyen de 45 EUR/h charges comprises.
            </p>
          </div>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-8 sm:p-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium mb-3">
                      <span>Taille de l'equipe</span>
                      <span className="text-primary font-bold">{team} personnes</span>
                    </label>
                    <input type="range" min="2" max="100" value={team} onChange={(e) => setTeam(Number(e.target.value))} className="w-full accent-primary" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>2</span><span>100</span></div>
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium mb-3">
                      <span>Heures perdues par personne/semaine</span>
                      <span className="text-primary font-bold">{hoursLost}h</span>
                    </label>
                    <input type="range" min="1" max="20" value={hoursLost} onChange={(e) => setHoursLost(Number(e.target.value))} className="w-full accent-primary" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1h</span><span>20h</span></div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ajustez les curseurs selon votre realite. La moyenne observee chez nos clients est de 4 a 8h/semaine de temps perdu par collaborateur.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30">
                  <p className="text-xs uppercase tracking-wider text-red-500 font-bold mb-2">Cout estime des inefficacites</p>
                  <p className="text-4xl sm:text-5xl font-black text-red-600 dark:text-red-500">
                    {monthlyLoss.toLocaleString('fr-FR')} EUR
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">par mois</p>
                  <div className="w-12 h-px bg-red-200 dark:bg-red-800 my-3" />
                  <p className="text-lg font-bold text-red-500">
                    {yearlyLoss.toLocaleString('fr-FR')} EUR/an
                  </p>
                  <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                    Un diagnostic a 349 EUR peut identifier comment recuperer une partie significative de cette somme.
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
