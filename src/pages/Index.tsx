import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Layers,
  Eye,
  Zap,
  Brain,
  Target,
  BarChart3,
  FileText,
  Download,
  Users,
  TrendingUp,
  Shield,
  ChevronDown,
  Play,
  Sparkles,
  AlertTriangle,
  Gauge,
  Map,
  ListChecks,
  ClipboardList,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import MetaTags from '@/components/seo/MetaTags';
import StructuredData from '@/components/seo/StructuredData';

/* ──────────────────────────────────────────────
   Animated counter hook
   ────────────────────────────────────────────── */
const useAnimatedCounter = (end: number, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  return { count, ref };
};

/* ──────────────────────────────────────────────
   Mini Radar Chart (SVG)
   ────────────────────────────────────────────── */
const MiniRadarChart = () => {
  const axes = [
    { label: 'Strategie', value: 0.8 },
    { label: 'Process', value: 0.5 },
    { label: 'Tech', value: 0.65 },
    { label: 'RH', value: 0.45 },
    { label: 'Data', value: 0.7 },
    { label: 'Culture', value: 0.55 },
    { label: 'Finance', value: 0.75 },
    { label: 'Client', value: 0.6 },
    { label: 'Innovation', value: 0.4 },
    { label: 'Ops', value: 0.85 },
  ];

  const cx = 120, cy = 120, maxR = 90;
  const n = axes.length;

  const getPoint = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const dataPoints = axes.map((a, i) => getPoint(i, maxR * a.value));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <div className="relative w-[240px] h-[240px] opacity-80 hover:opacity-100 transition-opacity duration-500">
      <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-2xl">
        {/* Grid */}
        {gridLevels.map((level) => {
          const pts = Array.from({ length: n }, (_, i) => getPoint(i, maxR * level));
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
          return <path key={level} d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
        })}
        {/* Axis lines */}
        {axes.map((_, i) => {
          const p = getPoint(i, maxR);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
        })}
        {/* Data area */}
        <path d={dataPath} fill="url(#radarGrad)" stroke="rgba(96,165,250,0.8)" strokeWidth="2">
          <animate attributeName="opacity" from="0" to="1" dur="1.5s" fill="freeze" />
        </path>
        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#60a5fa" stroke="#fff" strokeWidth="1.5">
            <animate attributeName="r" from="0" to="3" dur="1s" begin={`${i * 0.1}s`} fill="freeze" />
          </circle>
        ))}
        {/* Axis labels */}
        {axes.map((a, i) => {
          const p = getPoint(i, maxR + 18);
          return (
            <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
              className="fill-white/40 text-[7px] font-semibold uppercase tracking-wider">
              {a.label}
            </text>
          );
        })}
        <defs>
          <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0.25)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

/* ──────────────────────────────────────────────
   FAQ Accordion Item
   ────────────────────────────────────────────── */
const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 px-1 text-left group"
      >
        <span className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors pr-4">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed px-1">{a}</p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ══════════════════════════════════════════════ */
const Index = () => {
  const { t } = useLanguage();
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const [teamSize, setTeamSize] = useState(15);
  const [hoursLost, setHoursLost] = useState(5);

  const counter200 = useAnimatedCounter(200);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  /* ── ROI calculation ── */
  const avgHourlyRate = 45; // EUR
  const monthlySavings = teamSize * hoursLost * avgHourlyRate * 4;
  const yearlySavings = monthlySavings * 12;

  /* ── Feature tabs data ── */
  const featureTabs = [
    {
      id: 'radar',
      icon: <Gauge className="w-5 h-5" />,
      title: 'Radar de maturite',
      desc: 'Visualisez instantanement le niveau de maturite de votre organisation sur 10 axes strategiques. Identifiez en un coup d\'oeil vos forces et vos zones de fragilite.',
      visual: (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 flex items-center justify-center min-h-[280px]">
          <MiniRadarChart />
        </div>
      ),
    },
    {
      id: 'carte',
      icon: <Map className="w-5 h-5" />,
      title: 'Carte organisationnelle',
      desc: 'Une cartographie complete de votre entreprise generee par IA : flux, processus, roles, outils. Tout devient visible et comprehensible.',
      visual: (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 min-h-[280px] flex items-center justify-center">
          <div className="grid grid-cols-3 gap-3 w-full max-w-[300px]">
            {['Direction', 'Marketing', 'Commercial', 'Production', 'Support', 'RH'].map((dept, i) => (
              <div key={dept}
                className="bg-white/5 border border-white/10 rounded-lg p-3 text-center hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-8 h-8 rounded-full bg-blue-500/20 mx-auto mb-2 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-[10px] text-white/60 font-medium">{dept}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'quickwins',
      icon: <Zap className="w-5 h-5" />,
      title: 'Quick Wins',
      desc: 'L\'IA identifie automatiquement les actions a fort impact et faible effort. Commencez a transformer votre entreprise des le premier jour.',
      visual: (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 min-h-[280px] flex items-center justify-center">
          <div className="space-y-3 w-full max-w-[320px]">
            {[
              { label: 'Automatiser la facturation', impact: 'Fort', effort: 'Faible', color: 'emerald' },
              { label: 'Centraliser la documentation', impact: 'Fort', effort: 'Moyen', color: 'blue' },
              { label: 'Mettre en place un CRM', impact: 'Tres fort', effort: 'Moyen', color: 'violet' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all duration-300">
                <div className={`w-2 h-2 rounded-full bg-${item.color}-400 flex-shrink-0`} style={{ backgroundColor: item.color === 'emerald' ? '#34d399' : item.color === 'blue' ? '#60a5fa' : '#a78bfa' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-medium truncate">{item.label}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">Impact: {item.impact}</span>
                    <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">Effort: {item.effort}</span>
                  </div>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'plan',
      icon: <ListChecks className="w-5 h-5" />,
      title: "Plan d'actions",
      desc: "Un plan d'action structure et priorise sur 30/60/90 jours. Chaque action est accompagnee d'indicateurs de suivi et de responsables identifies.",
      visual: (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 min-h-[280px] flex items-center justify-center">
          <div className="w-full max-w-[320px] space-y-4">
            {['30 jours', '60 jours', '90 jours'].map((period, i) => (
              <div key={period}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider">{period}</span>
                  <span className="text-[10px] text-blue-400">{[3, 5, 4][i]} actions</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${[85, 55, 25][i]}%`,
                      background: `linear-gradient(90deg, #3b82f6, ${['#34d399', '#a78bfa', '#f59e0b'][i]})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'export',
      icon: <Download className="w-5 h-5" />,
      title: 'Export PDF / PPTX',
      desc: 'Generez des rapports professionnels prets a presenter a votre equipe ou vos investisseurs. Formats PDF et PowerPoint avec votre charte graphique.',
      visual: (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 min-h-[280px] flex items-center justify-center">
          <div className="flex gap-6 items-center">
            {['PDF', 'PPTX'].map((format) => (
              <div key={format} className="flex flex-col items-center gap-3 group cursor-pointer">
                <div className="w-20 h-24 bg-white/5 border border-white/15 rounded-lg flex flex-col items-center justify-center group-hover:bg-white/10 group-hover:border-blue-500/30 transition-all duration-300">
                  <FileText className="w-8 h-8 text-white/30 group-hover:text-blue-400 transition-colors" />
                  <span className="text-[10px] text-white/40 font-bold mt-2 group-hover:text-white/70 transition-colors">.{format.toLowerCase()}</span>
                </div>
                <span className="text-xs text-white/50 font-semibold">{format}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  /* ── Pricing tiers ── */
  const pricingTiers = [
    {
      name: 'Decouverte',
      price: 'Gratuit',
      period: '',
      desc: 'Explorez le potentiel de votre organisation',
      features: [
        'Diagnostic 150 questions',
        'Radar de maturite (10 axes)',
        'Synthese IA de base',
        'Export PDF simplifie',
        '1 utilisateur',
      ],
      cta: 'Commencer gratuitement',
      popular: false,
      link: '/cartographie/login',
    },
    {
      name: 'Professionnel',
      price: '149',
      period: '/mois',
      desc: 'Pour les dirigeants qui passent a l\'action',
      features: [
        'Tout Decouverte +',
        'Analyse IA approfondie (Claude AI)',
        'Carte organisationnelle complete',
        'Quick Wins priorises',
        'Plan d\'actions 30/60/90j',
        'Export PDF & PPTX premium',
        'Jusqu\'a 5 utilisateurs',
        'Support prioritaire',
      ],
      cta: 'Essai gratuit 14 jours',
      popular: true,
      link: '/cartographie/login',
    },
    {
      name: 'Entreprise',
      price: 'Sur mesure',
      period: '',
      desc: 'Transformation accompagnee par nos experts',
      features: [
        'Tout Professionnel +',
        'Accompagnement expert dedie',
        'Ateliers de transformation',
        'Integrations sur mesure',
        'Multi-equipes illimite',
        'Formation equipe dirigeante',
        'SLA & support dedie',
        'Rapport trimestriel',
      ],
      cta: 'Contacter l\'equipe',
      popular: false,
      link: '/contact',
    },
  ];

  /* ── Testimonials ── */
  const testimonials = [
    {
      quote: "En 2 semaines, Solutio nous a revele des inefficacites que nous soupconnions depuis des mois sans pouvoir les quantifier. Le plan d'actions genere par l'IA etait bluffant de pertinence.",
      name: 'Marie Deschamps',
      role: 'CEO, FactoryLab (industrie, 45 salaries)',
      metric: '-40% de temps perdu sur les processus internes',
    },
    {
      quote: "J'ai presente le rapport PDF genere par Solutio a mon comite de direction. En 30 minutes, tout le monde etait aligne sur les priorites. C'est la premiere fois que ca arrive.",
      name: 'Thomas Berger',
      role: 'DG, Nexus Consulting (conseil, 28 salaries)',
      metric: '3x plus rapide pour prendre des decisions strategiques',
    },
    {
      quote: "Le radar de maturite a ete un electrochoc. On pensait etre matures sur le digital, on etait a 3/10 sur la data. Solutio nous a donne une feuille de route claire pour progresser.",
      name: 'Sophie Laurent',
      role: 'Fondatrice, GreenScale (ESS, 60 salaries)',
      metric: 'De 3/10 a 7/10 en maturite data en 6 mois',
    },
  ];

  /* ── FAQs ── */
  const faqs = [
    {
      q: "Qu'est-ce que la cartographie organisationnelle Solutio ?",
      a: "C'est un diagnostic complet de votre entreprise base sur 150 questions couvrant 10 axes strategiques (strategie, processus, technologie, RH, data, culture, finance, client, innovation, operations). L'IA analyse vos reponses et genere une cartographie visuelle de votre organisation avec des recommandations actionables.",
    },
    {
      q: 'Combien de temps prend le diagnostic ?',
      a: "Le questionnaire prend environ 25 a 35 minutes. L'analyse IA est generee en quelques minutes. Vous recevez votre radar de maturite, votre carte organisationnelle et vos premiers quick wins dans l'heure qui suit.",
    },
    {
      q: "Comment l'IA genere-t-elle les recommandations ?",
      a: "Nous utilisons Claude AI d'Anthropic, l'un des modeles de langage les plus avances. Il analyse vos reponses en les croisant avec des milliers de patterns organisationnels pour identifier les leviers de transformation les plus pertinents pour votre contexte specifique.",
    },
    {
      q: 'Mes donnees sont-elles securisees ?',
      a: "Absolument. Vos donnees sont chiffrees en transit et au repos (AES-256). Nous sommes conformes RGPD. Vos donnees ne sont jamais utilisees pour entrainer des modeles IA. Vous pouvez demander la suppression complete de vos donnees a tout moment.",
    },
    {
      q: 'Puis-je tester gratuitement avant de m\'engager ?',
      a: "Oui, le plan Decouverte est entierement gratuit et sans engagement. Il inclut le diagnostic complet, le radar de maturite et une synthese IA de base. Vous pouvez passer au plan Professionnel a tout moment pour debloquer l'analyse approfondie.",
    },
    {
      q: "Le diagnostic est-il adapte a mon secteur d'activite ?",
      a: "Oui, le diagnostic s'adapte automatiquement a votre secteur (industrie, services, tech, ESS, commerce, sante...). Les questions et les recommandations sont contextualisees pour maximiser leur pertinence.",
    },
    {
      q: "Qui peut utiliser Solutio dans mon entreprise ?",
      a: "Solutio est concu pour les dirigeants, DG, COO et responsables transformation. En plan Professionnel, jusqu'a 5 collaborateurs peuvent contribuer au diagnostic pour une vision 360 de l'organisation.",
    },
    {
      q: 'Comment se passe l\'accompagnement Entreprise ?',
      a: "Un expert Solutio dedie vous accompagne sur la duree : ateliers de diagnostic en equipe, definition de la feuille de route, suivi mensuel des KPIs de transformation, formation de vos managers aux outils. C'est un vrai partenariat de transformation.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Solutio — Cartographie organisationnelle IA | Diagnostic & transformation"
        description="Cartographiez votre entreprise, diagnostiquez vos processus et transformez votre organisation grace a l'IA. 150 questions, 10 axes, des resultats concrets. Essai gratuit."
        type="website"
        keywords="cartographie organisationnelle, diagnostic entreprise, transformation digitale, IA entreprise, audit processus, maturite digitale, quick wins"
      />
      <StructuredData
        type="Organization"
        data={{
          name: 'Solutio',
          description: 'Outil de cartographie organisationnelle et diagnostic d\'entreprise propulse par IA. Transformez vos processus.',
        }}
      />
      <StructuredData type="WebSite" data={{ name: 'Solutio', url: 'https://solutio.work', description: 'Cartographie organisationnelle IA pour dirigeants ambitieux' }} />
      <StructuredData
        type="ProfessionalService"
        data={{
          name: 'Solutio',
          description: 'Diagnostic et transformation d\'entreprise propulse par l\'intelligence artificielle. Cartographie, quick wins, plan d\'actions.',
        }}
      />
      <StructuredData
        type="FAQPage"
        data={{ questions: faqs.map((f) => ({ question: f.q, answer: f.a })) }}
      />

      {/* ═══════════════════════════════════════
           1. HERO
         ═══════════════════════════════════════ */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #0f172a 50%, #172554 75%, #0f172a 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 15s ease infinite',
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 z-[1] opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] z-[1]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] z-[1]" />

        <div className="relative z-10 container mx-auto px-6 sm:px-10 py-20 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center max-w-[1200px] mx-auto">
            {/* Left content */}
            <div>
              <Badge
                variant="secondary"
                className="mb-8 bg-white/5 text-white/70 border border-white/10 backdrop-blur-sm rounded-full px-5 py-2 text-xs font-semibold tracking-wider uppercase"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse inline-block" />
                Diagnostic IA gratuit
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-extrabold text-white leading-[1.05] tracking-tight mb-4">
                Votre entreprise merite mieux qu'un fonctionnement{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)',
                  }}
                >
                  approximatif.
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-blue-300/80 font-semibold mb-6 tracking-tight">
                Cartographiez, diagnostiquez, transformez.
              </p>

              <p className="text-base sm:text-lg text-white/45 max-w-xl leading-relaxed mb-10">
                150 questions. 10 axes strategiques. Une IA qui revele ce que vous ne voyez plus.
                Obtenez une cartographie complete de votre organisation et un plan d'actions
                priorise en moins d'une heure.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link to="/cartographie/login">
                  <Button
                    size="lg"
                    className="h-14 px-8 w-full sm:w-auto text-base font-bold shadow-xl shadow-blue-500/25 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Demarrer le diagnostic gratuit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => scrollTo('how-it-works')}
                  className="h-14 px-8 border-white/15 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm text-base"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Voir la demo
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-white/30">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400/60" />
                  Gratuit, sans CB
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400/60" />
                  Resultats en 1h
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400/60" />
                  Donnees securisees
                </span>
              </div>
            </div>

            {/* Right - Radar preview */}
            <div className="hidden lg:block">
              <MiniRadarChart />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-30 animate-bounce">
          <ChevronDown className="w-5 h-5 text-white" />
        </div>

        {/* CSS keyframes for gradient animation */}
        <style>{`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            25% { background-position: 100% 50%; }
            50% { background-position: 100% 100%; }
            75% { background-position: 0% 100%; }
          }
        `}</style>
      </section>

      {/* ═══════════════════════════════════════
           2. TRUST BAR
         ═══════════════════════════════════════ */}
      <section className="py-10 px-6 sm:px-10 border-b border-border/50 bg-muted/30">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-extrabold text-primary" ref={counter200.ref}>
              +{counter200.count}
            </span>
            <span className="text-sm text-muted-foreground font-medium leading-tight">
              dirigeants ont deja<br />adopte Solutio
            </span>
          </div>
          <div className="h-8 w-px bg-border hidden md:block" />
          <div className="flex items-center gap-8 opacity-30">
            {['BPI France', 'La French Tech', 'Station F', 'Les Echos', 'Maddyness'].map((name) => (
              <span key={name} className="text-sm font-bold text-foreground tracking-wider uppercase whitespace-nowrap">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
           3. PROBLEM STATEMENT
         ═══════════════════════════════════════ */}
      <section className="py-20 lg:py-28 px-6 sm:px-10">
        <div className="max-w-[1100px] mx-auto">
          <SectionLabel>Le probleme</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold leading-[1.08] tracking-tight mb-5 max-w-3xl">
            Chaque jour, vos equipes perdent des heures sur des{' '}
            <span className="text-primary">processus inefficaces.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-14 leading-relaxed">
            Et le pire ? Vous ne savez pas exactement ou, ni combien ca vous coute.
            Sans vision claire, impossible de prioriser les bons chantiers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Clock className="w-7 h-7" />,
                title: 'Temps gaspille',
                desc: 'Vos equipes passent 30% de leur temps sur des taches repetitives, des validations inutiles et des recherches d\'information dispersee.',
                stat: '30%',
                statLabel: 'du temps de travail perdu',
                color: 'red',
              },
              {
                icon: <Layers className="w-7 h-7" />,
                title: 'Chaos des outils',
                desc: 'Excel, Notion, Slack, mails, papier... L\'information est eparpillee. Personne n\'a la meme version. Les decisions se prennent a l\'aveugle.',
                stat: '8+',
                statLabel: 'outils non connectes en moyenne',
                color: 'amber',
              },
              {
                icon: <Eye className="w-7 h-7" />,
                title: 'Goulots invisibles',
                desc: 'Les blocages se cachent dans les zones grises de l\'organisation. Sans cartographie, ils grossissent silencieusement jusqu\'a la crise.',
                stat: '67%',
                statLabel: 'des blocages sont invisibles au dirigeant',
                color: 'violet',
              },
            ].map((pain, i) => (
              <Card
                key={i}
                className="group border hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
              >
                <CardContent className="p-8">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300"
                    style={{
                      backgroundColor: pain.color === 'red' ? 'rgba(239,68,68,0.08)' : pain.color === 'amber' ? 'rgba(245,158,11,0.08)' : 'rgba(139,92,246,0.08)',
                      color: pain.color === 'red' ? '#ef4444' : pain.color === 'amber' ? '#f59e0b' : '#8b5cf6',
                    }}
                  >
                    {pain.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight">{pain.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{pain.desc}</p>
                  <div className="pt-5 border-t">
                    <p
                      className="text-3xl font-extrabold mb-1"
                      style={{ color: pain.color === 'red' ? '#ef4444' : pain.color === 'amber' ? '#f59e0b' : '#8b5cf6' }}
                    >
                      {pain.stat}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">{pain.statLabel}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
           4. HOW IT WORKS
         ═══════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 lg:py-28 px-6 sm:px-10 bg-muted/30">
        <div className="max-w-[1100px] mx-auto">
          <SectionLabel>Comment ca marche</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold leading-[1.08] tracking-tight mb-5 max-w-2xl">
            De l'invisible au{' '}
            <span className="text-primary">plan d'action</span> en 4 etapes.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-16 leading-relaxed">
            Un processus simple, structure et rapide pour passer du diagnostic a la transformation concrete.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {[
              {
                step: '01',
                icon: <ClipboardList className="w-6 h-6" />,
                title: 'Diagnostic',
                desc: '150 questions strategiques couvrant 10 axes de maturite. 25 minutes pour tout reveler.',
                detail: '150 questions / 10 axes',
                color: '#3b82f6',
              },
              {
                step: '02',
                icon: <Brain className="w-6 h-6" />,
                title: 'Analyse IA',
                desc: 'Claude AI cartographie votre organisation, identifie les patterns et les zones de fragilite.',
                detail: 'Claude AI / Cartographie',
                color: '#8b5cf6',
              },
              {
                step: '03',
                icon: <Target className="w-6 h-6" />,
                title: 'Plan d\'actions',
                desc: 'Quick wins priorises par impact/effort. Feuille de route 30/60/90 jours prete a l\'emploi.',
                detail: 'Quick wins priorises',
                color: '#f59e0b',
              },
              {
                step: '04',
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Transformation',
                desc: 'Suivez vos KPIs, mesurez les progres et iterez. Des resultats concrets en quelques semaines.',
                detail: 'Resultats mesurables',
                color: '#10b981',
              },
            ].map((item, i) => (
              <div key={i} className="relative p-8 group">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-[52px] right-0 w-full h-px bg-border -z-0" />
                )}
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-extrabold tracking-wider text-muted-foreground">
                      ETAPE {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.desc}</p>
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {item.detail}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link to="/cartographie/login">
              <Button size="lg" className="h-13 px-8 font-bold shadow-lg shadow-primary/20">
                Lancer mon diagnostic gratuit
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
           5. FEATURES SHOWCASE (Interactive tabs)
         ═══════════════════════════════════════ */}
      <section className="py-20 lg:py-28 px-6 sm:px-10">
        <div className="max-w-[1100px] mx-auto">
          <SectionLabel>Fonctionnalites</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold leading-[1.08] tracking-tight mb-5 max-w-2xl">
            Tout ce dont vous avez besoin pour{' '}
            <span className="text-primary">transformer</span> votre entreprise.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mb-14 leading-relaxed">
            Une suite d'outils puissants, generes par IA, pour comprendre et agir sur votre organisation.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Tab list */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {featureTabs.map((tab, i) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(i)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all duration-300 flex-shrink-0 ${
                    activeFeatureTab === i
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'bg-muted/50 hover:bg-muted text-foreground'
                  }`}
                >
                  {tab.icon}
                  <span className="text-sm font-bold whitespace-nowrap">{tab.title}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-3 tracking-tight">
                  {featureTabs[activeFeatureTab].title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                  {featureTabs[activeFeatureTab].desc}
                </p>
              </div>
              <div className="transition-all duration-500">
                {featureTabs[activeFeatureTab].visual}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
           6. ROI CALCULATOR
         ═══════════════════════════════════════ */}
      <section className="py-20 lg:py-28 px-6 sm:px-10 bg-muted/30">
        <div className="max-w-[900px] mx-auto">
          <SectionLabel>Calculateur ROI</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold leading-[1.08] tracking-tight mb-5 text-center">
            Combien <span className="text-primary">perdez-vous</span> chaque mois ?
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-xl mx-auto mb-14 leading-relaxed">
            Estimez le cout reel de l'inefficacite dans votre organisation.
          </p>

          <Card className="border shadow-xl overflow-hidden">
            <CardContent className="p-8 sm:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Sliders */}
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-baseline mb-3">
                      <label className="text-sm font-bold text-foreground">Taille de l'equipe</label>
                      <span className="text-2xl font-extrabold text-primary">{teamSize}</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={100}
                      value={teamSize}
                      onChange={(e) => setTeamSize(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>2 personnes</span>
                      <span>100 personnes</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-3">
                      <label className="text-sm font-bold text-foreground">Heures perdues / semaine / personne</label>
                      <span className="text-2xl font-extrabold text-primary">{hoursLost}h</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      value={hoursLost}
                      onChange={(e) => setHoursLost(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1h / semaine</span>
                      <span>15h / semaine</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-xl border border-dashed">
                    <p className="text-xs text-muted-foreground mb-1">Base de calcul</p>
                    <p className="text-sm text-muted-foreground">
                      Cout horaire moyen: <strong className="text-foreground">{avgHourlyRate} EUR</strong> (charges incluses)
                    </p>
                  </div>
                </div>

                {/* Results */}
                <div className="flex flex-col justify-center">
                  <div className="text-center p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Vous perdez chaque mois
                    </p>
                    <p className="text-5xl sm:text-6xl font-extrabold text-primary mb-1">
                      {monthlySavings.toLocaleString('fr-FR')} EUR
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      soit <strong className="text-foreground">{yearlySavings.toLocaleString('fr-FR')} EUR / an</strong>
                    </p>
                    <Link to="/cartographie/login">
                      <Button className="font-bold shadow-lg shadow-primary/20">
                        Recuperer cette valeur
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ═══════════════════════════════════════
           7. PRICING PREVIEW
         ═══════════════════════════════════════ */}
      <section className="py-20 lg:py-28 px-6 sm:px-10">
        <div className="max-w-[1100px] mx-auto">
          <SectionLabel>Tarifs</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold leading-[1.08] tracking-tight mb-5 text-center">
            Un plan pour chaque{' '}
            <span className="text-primary">ambition.</span>
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-xl mx-auto mb-14 leading-relaxed">
            Commencez gratuitement. Passez a l'echelle quand vous etes pret.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, i) => (
              <Card
                key={i}
                className={`relative overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  tier.popular ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
                    Populaire
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-lg font-bold mb-2">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-5">{tier.desc}</p>

                  <div className="mb-6">
                    {tier.price === 'Gratuit' || tier.price === 'Sur mesure' ? (
                      <p className="text-3xl font-extrabold">{tier.price}</p>
                    ) : (
                      <p className="text-3xl font-extrabold">
                        {tier.price} EUR<span className="text-base font-medium text-muted-foreground">{tier.period}</span>
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={tier.link}>
                    <Button
                      className={`w-full font-bold ${tier.popular ? 'shadow-md shadow-primary/20' : ''}`}
                      variant={tier.popular ? 'default' : 'outline'}
                    >
                      {tier.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
           8. TESTIMONIALS
         ═══════════════════════════════════════ */}
      <section className="py-20 lg:py-28 px-6 sm:px-10 bg-muted/30">
        <div className="max-w-[1100px] mx-auto">
          <SectionLabel>Temoignages</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold leading-[1.08] tracking-tight mb-14 max-w-2xl">
            Ils ont transforme leur entreprise{' '}
            <span className="text-primary">avec Solutio.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="border hover:border-primary/25 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardContent className="p-8 flex flex-col h-full">
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, si) => (
                      <svg key={si} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <blockquote className="text-sm text-foreground leading-relaxed mb-6 flex-1 italic">
                    "{t.quote}"
                  </blockquote>

                  <div className="pt-5 border-t">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {t.name.split(' ').map((w) => w[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {t.metric}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
           9. FAQ
         ═══════════════════════════════════════ */}
      <section className="py-20 lg:py-28 px-6 sm:px-10">
        <div className="max-w-[780px] mx-auto">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.08] tracking-tight mb-12">
            Questions{' '}
            <span className="text-primary">frequentes.</span>
          </h2>

          <div className="border rounded-2xl px-6 sm:px-8 divide-y divide-border/50">
            {faqs.map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
           10. FINAL CTA
         ═══════════════════════════════════════ */}
      <section
        className="py-24 lg:py-32 px-6 sm:px-10 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        }}
      >
        {/* Glow effects */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-[700px] mx-auto text-center">
          <Badge className="mb-8 bg-white/5 text-white/70 border-white/10 text-xs font-bold tracking-wider uppercase px-5 py-2">
            Pret a commencer ?
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Commencez votre transformation{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              }}
            >
              maintenant.
            </span>
          </h2>

          <p className="text-lg text-white/40 leading-relaxed mb-10 max-w-lg mx-auto">
            Rejoignez +200 dirigeants qui ont deja cartographie leur organisation.
            Diagnostic gratuit. Premiers resultats en moins d'une heure.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/cartographie/login">
              <Button
                size="lg"
                className="h-14 px-10 text-base font-bold shadow-xl shadow-blue-500/25 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Demarrer le diagnostic gratuit
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-white/25">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              RGPD compliant
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Sans carte bancaire
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Setup en 5 min
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ──────────────────────────────────────────────
   Section label helper
   ────────────────────────────────────────────── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-4 text-[11px] font-bold tracking-[.15em] uppercase text-primary">
    <div className="w-5 h-0.5 bg-primary rounded-full" />
    {children}
  </div>
);

export default Index;
