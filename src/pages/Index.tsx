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
  Target,
  BarChart3,
  Shield,
  Sparkles,
  Map,
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
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" role="img" aria-label="Radar de maturité organisationnelle sur 10 axes">
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
      description: "Audit complet de l'organisation : processus, outils, équipes, coûts. Identification de ce qui freine la croissance et plan d'action concret.",
      features: ['Cartographie des processus existants', "Identification des pertes de temps", 'Plan de transformation priorisé', "Estimation du ROI par action"],
      cta: 'Demander un diagnostic', ctaLink: '/cartographie/login',
    },
    {
      icon: Code2, title: 'Outils sur mesure', subtitle: "Quand rien n'existe sur le marché",
      description: "Les outils SaaS sont conçus pour être généralistes — c'est ce qui leur permet d'adresser le plus grand nombre. Ce n'est pas un défaut, c'est un choix de marché. Aujourd'hui, construire un outil taillé pour un contexte précis est accessible. Il n'y a plus de raison de s'adapter à un outil qui n'a pas été pensé pour vous.",
      features: ['Plateformes SaaS internes ou client', 'Automatisation de processus répétitifs', 'Intégrations multi-outils (API, CRM, ERP)', 'Tableaux de bord et reporting sur mesure'],
      cta: 'Discuter du projet', ctaLink: '/contact',
    },
    {
      icon: TrendingUp, title: 'Accompagnement', subtitle: 'Du diagnostic à la transformation',
      description: "Suivi de la mise en œuvre, formation des équipes, mesure des résultats. Un seul interlocuteur jusqu'à ce que les changements soient ancrés.",
      features: ['Feuille de route sur 30/60/90 jours', 'Coaching équipes et conduite du changement', 'Suivi KPIs et ajustements', 'Transfert de compétences'],
      cta: 'Réserver un échange', ctaLink: 'https://calendly.com/tlb-ov_p/30min',
    },
  ];

  const caseStudies = [
    {
      sector: 'Cabinet de conseil — 25+ consultants',
      icon: Building2,
      tags: ['Suivi de mission', 'Portail consultant', 'Reporting auto'],
      before: "Cabinet de conseil, 25+ consultants. Saisies redondantes, coordination dispersée, aucune vision consolidée. La production de livrables et le pilotage du réseau consommaient l'essentiel du temps opérationnel — au détriment du terrain.",
      after: "Plateforme sur mesure : 5 outils métiers intégrés et une plateforme de gestion centralisée. Missions, activité, livrables, pilotage réseau — tout en un seul endroit. La structure tourne de façon autonome, sans intervention manuelle.",
      result: '5 outils métiers intégrés + plateforme centralisée',
    },
    {
      sector: "Agence marketing d'affiliation — 6 clients",
      icon: LineChart,
      tags: ['SaaS Platform', 'Automatisation', 'Multi-client'],
      before: "Agence marketing — gestion de 6 clients d'affiliation. Exports manuels depuis des plateformes différentes pour chaque client (Rakuten, Impact, Awin), recompilation dans Excel, envoi manuel des rapports. 2h par client chaque semaine, uniquement pour produire et transmettre les rapports. Aucun suivi structuré des tâches et deadlines.",
      after: "Plateforme SaaS métier complète — interface unique couvrant l'ensemble des opérations clients : import automatique multi-réseau, dashboard analytics temps réel, envoi automatique de rapports hebdomadaires et mensuels, suivi des tâches administratives et deadlines intégré. Intégration ClickUp. Sur la seule activité de reporting : 15 minutes par client au lieu de 2h — dès la première semaine d'implémentation. 11h récupérées par semaine sur 6 clients existants. Gain reproductible à chaque nouveau client ajouté.",
      result: '-90% temps de reporting',
    },
  ];

  const faqs = [
    { q: "C'est quoi exactement Solutio ?", a: "Solutio est un business partner tech : diagnostic organisationnel, développement d'outils sur mesure et accompagnement jusqu'à l'adoption. L'outil de cartographie organisationnelle est gratuit pour commencer." },
    { q: 'Le diagnostic est vraiment gratuit ?', a: "Oui. Le questionnaire complet (10 packs) est entièrement gratuit. Vous obtenez une vue d'ensemble, un radar de maturité et une carte interactive sans rien payer. Les analyses IA approfondies et le plan d'action détaillé sont disponibles à partir de 349 EUR." },
    { q: 'Combien coûte un projet de développement sur mesure ?', a: "Cela dépend de la complexité. Un outil simple peut démarrer autour de quelques milliers d'euros, une plateforme complète sera plus conséquente. Le diagnostic gratuit permet de cadrer le besoin avant toute proposition de devis." },
    { q: "Vous travaillez avec quels types d'entreprises ?", a: "Indépendants, équipes de 5, structures de 50+ — la taille n'est pas le critère. Le point commun : l'ambition de mieux s'organiser et la volonté de changer ce qui ne fonctionne pas. Cabinets de conseil, agences, entreprises industrielles, ESS." },
    { q: "En quoi c'est différent d'un cabinet de conseil classique ?", a: "Pas de PowerPoint de 200 slides. Le diagnostic utilise un outil IA concret, les recommandations sont priorisées avec ROI estimé, et si besoin les outils sont construits sur mesure. Du diagnostic à l'implémentation, un seul interlocuteur." },
    { q: 'Mes données sont-elles protégées ?', a: "Les données sont hébergées en Europe, chiffrées en transit et au repos. Aucun partage avec des tiers." },
  ];

  return (
    <div className="relative">
      <MetaTags
        title="Solutio — Conseil en transformation digitale & outils sur mesure"
        description="Diagnostic organisationnel, développement d'outils sur mesure et accompagnement jusqu'à l'adoption. Solutio aide les dirigeants à transformer leur entreprise."
        keywords="transformation digitale, conseil, diagnostic, cartographie organisationnelle, outils sur mesure, PME"
      />
      <StructuredData type="FAQPage" data={{ questions: faqs.map((f) => ({ question: f.q, answer: f.a })) }} />
      <StructuredData type="ProfessionalService" data={{ name: "Solutio", description: "Business partner tech — diagnostic organisationnel, outils sur mesure et accompagnement." }} />

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
            Ce qui peut être{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              automatisé
            </span>
            {' '}
            <br className="hidden sm:block" />
            <span className="text-white/90">ne devrait plus être fait à la main.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-9 max-w-2xl">
            Diagnostic organisationnel, développement sur mesure, accompagnement
            jusqu'à l'adoption — un seul interlocuteur.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <a href="https://calendly.com/tlb-ov_p/30min" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 px-8 w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 shadow-lg shadow-white/10 font-semibold">
                <Calendar className="w-4 h-4 mr-2" />
                Réserver un échange
              </Button>
            </a>
            <Button size="lg" variant="outline" onClick={() => scrollTo('outils')} className="h-12 px-8 border-white/25 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm">
              Découvrir les outils
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-cyan-400/70" /> Données hébergées en Europe</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cyan-400/70" /> Diagnostic gratuit sur 10 axes</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-cyan-400/70" /> Sans engagement</span>
          </div>
        </div>

        <div className="absolute bottom-6 right-8 z-10 hidden lg:flex flex-col items-center gap-2 opacity-25">
          <span className="text-[9px] font-bold tracking-[.18em] text-white uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* ═══ 2. LE CONSTAT ═══ */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <SectionLabel>Le constat</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-5">
              Les pertes de temps dans une organisation sont rarement là où on les cherche.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Des tâches qui s'accumulent, des outils qui ne se parlent pas, des processus jamais formalisés.
              L'organisation fonctionne — mais pas à ce qu'elle pourrait.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: Target, title: 'Des irritants invisibles', desc: "Les vrais blocages s'accumulent en silence. Tâches dupliquées, validations manuelles, informations dispersées — chacun compense individuellement sans que la cause soit jamais adressée." },
              { icon: BarChart3, title: 'Des outils empilés', desc: "Excel ici, un CRM là, Notion pour certains, emails pour le reste. Chaque équipe a construit son propre système. Résultat : aucune vue consolidée, et du temps perdu à faire le lien." },
              { icon: Lightbulb, title: 'Des quick wins ignorés', desc: "Dans chaque organisation, des heures récupérables existent. Automatisations simples, processus à clarifier, outils à connecter. Il faut savoir où regarder." },
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

      {/* ═══ 3. SERVICES ═══ */}
      <section id="accompagnement" className="py-20 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <SectionLabel>Services</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-5">
              Du diagnostic à la transformation, un seul interlocuteur
            </h2>
            <p className="text-muted-foreground text-lg">
              Diagnostic, construction, accompagnement — jusqu'aux résultats.
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

      {/* ═══ 4. OUTILS ═══ */}
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
                <Link to="/cartographie/login">
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

      {/* ═══ 5. RÉALISATIONS ═══ */}
      <section id="realisations" className="py-20 lg:py-24 px-6 sm:px-10 bg-muted/30">
        <div className="max-w-[1060px] mx-auto">
          <SectionLabel>Cas concrets</SectionLabel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold leading-[1.1] tracking-tight">
              Quand aucun outil existant ne correspond exactement à votre{' '}
              <span className="text-primary">façon de travailler.</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Conception et développement de systèmes applicatifs taillés pour un contexte précis.
              Architecture, intégrations, interfaces : tout est pensé pour l'organisation réelle —
              pas pour un cas d'usage générique.
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
                    <p className="text-[11px] font-bold tracking-wider text-primary uppercase mb-1.5">Après</p>
                    <p className="text-sm text-foreground font-medium leading-relaxed">{cs.after}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-border" />

      {/* ═══ 6. CONVICTION ═══ */}
      <section id="conviction" className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="max-w-3xl mx-auto">
            <SectionLabel>Conviction</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-8">
              La valeur d'un professionnel se mesure à ce qu'il accomplit.
              Une heure du bon professionnel vaut deux semaines d'un autre.
              Ce n'est pas une question de temps — c'est une question de maîtrise.
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed text-base">
              <p>
                Vision, stratégie, exécution — c'est là que se crée ce qu'aucun
                système ne peut remplacer. Tout le reste peut et devrait être pris
                en charge par la technologie.
              </p>
              <p>
                Quand les outils sont construits pour un contexte précis, ils absorbent
                ce qui n'aurait jamais dû requérir de l'attention humaine. Ce temps
                revient là où il a de la valeur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 7. CALCULATEUR ═══ */}
      <ROICalculator />

      {/* ═══ 8. FAQ ═══ */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="max-w-[780px] mx-auto">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-10">
              Questions fréquentes
            </h2>
            <div className="border rounded-2xl px-6 sm:px-8 divide-y divide-border/50 bg-background shadow-sm">
              {faqs.map((f, i) => (
                <FAQItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 9. CTA FINAL ═══ */}
      <section className="py-20 sm:py-24" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        <div className="container mx-auto px-6 sm:px-10 text-center">
          <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-5 max-w-2xl mx-auto text-white">
            Transformez votre organisation, concrètement.
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
            Diagnostic gratuit sur 10 axes, outils sur mesure et accompagnement jusqu'à l'adoption. Un seul interlocuteur.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://calendly.com/tlb-ov_p/30min" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="h-12 px-8 bg-white text-gray-900 hover:bg-gray-100 shadow-lg font-semibold w-full sm:w-auto">
                <Calendar className="w-4 h-4 mr-2" />
                Réserver un échange
              </Button>
            </a>
            <Link to="/cartographie/login">
              <Button size="lg" variant="outline" className="h-12 px-8 border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
                Lancer le diagnostic
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <p className="text-white/30 text-xs mt-8">
            Gratuit — Sans engagement — Données hébergées en Europe
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
              Combien coûtent les inefficacités chaque mois ?
            </h2>
            <p className="text-muted-foreground">
              Estimation basée sur un coût horaire moyen de 45 EUR/h charges comprises.
            </p>
          </div>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-8 sm:p-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium mb-3">
                      <span>Taille de l'équipe</span>
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
                    Ajustez les curseurs selon votre réalité.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30">
                  <p className="text-xs uppercase tracking-wider text-red-500 font-bold mb-2">Coût estimé des inefficacités</p>
                  <p className="text-4xl sm:text-5xl font-black text-red-600 dark:text-red-500">
                    {monthlyLoss.toLocaleString('fr-FR')} EUR
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">par mois</p>
                  <div className="w-12 h-px bg-red-200 dark:bg-red-800 my-3" />
                  <p className="text-lg font-bold text-red-500">
                    {yearlyLoss.toLocaleString('fr-FR')} EUR/an
                  </p>
                  <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                    Un diagnostic à 349 EUR peut identifier comment récupérer une partie significative de cette somme.
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
