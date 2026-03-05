import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import MetaTags from '@/components/seo/MetaTags';
import StructuredData from '@/components/seo/StructuredData';

const HERO_IMG = '/lovable-uploads/c8143545-6b97-49dd-85ba-65b954b9e501.png';

const Index = () => {
  const { t } = useLanguage();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  /* ── FAQ state ── */
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const faqs = [
    {
      q: "C'est pour qui exactement ?",
      a: "On travaille avec des independants, des equipes de 5 personnes, et des structures de 50+. Ce qui compte ce n'est pas la taille -- c'est l'ambition de bien s'organiser et la volonte de changer ce qui ne fonctionne pas.",
    },
    {
      q: "Quelle est la difference avec un consultant classique ?",
      a: "On ne repart pas avec un rapport. On reste jusqu'a ce que la solution soit en production et adoptee par les equipes. Et quand c'est pertinent, on construit les outils nous-memes plutot que de recommander des licences.",
    },
    {
      q: "Combien de temps ca prend ?",
      a: "Le diagnostic initial prend quelques jours. La mise en oeuvre depend du perimetre -- quelques semaines pour un systeme cible, quelques mois pour une transformation plus large. On definit ca ensemble avant de commencer.",
    },
    {
      q: "Est-ce qu'on peut commencer petit ?",
      a: "Oui -- et c'est souvent le meilleur point d'entree. La cartographie gratuite permet deja d'identifier ce qui bloque le plus. Beaucoup de missions commencent par un probleme precis avant de s'elargir.",
    },
  ];

  const realisations = [
    {
      sector: 'Cabinet de conseil',
      icon: '📊',
      tags: ['Suivi de mission', 'Portail consultants', 'Reporting automatise'],
      metric: '1 outil',
      metricLabel: 'au lieu de 6',
      before:
        "40+ consultants, outils non connectes, suivi sur tableur. La coordination absorbait le temps qu'ils auraient du passer sur leurs missions.",
      after:
        "Suite applicative integree. Un seul endroit pour les missions, les temps, les livrables. Les consultants font leur metier -- plus de l'administration.",
    },
    {
      sector: 'Agence marketing digital',
      icon: '📣',
      tags: ['SaaS plateforme', 'Gestion clients', 'Suivi campagnes'],
      metric: '-60%',
      metricLabel: 'temps operationnel',
      before:
        "15 personnes, coordination sur plusieurs outils, briefs disperses. Trop de temps passe a gerer les outils plutot qu'a les utiliser.",
      after:
        "Plateforme SaaS sur mesure. Un seul endroit pour tout. Adoption immediate -- parce que l'outil a ete construit autour d'eux.",
    },
  ];

  const accompagnementSteps = [
    {
      n: '01',
      title: 'Diagnostic & cartographie',
      desc: "On commence par comprendre. Cartographie des processus, identification des friction points, hierarchisation par impact.",
    },
    {
      n: '02',
      title: 'Architecture des solutions',
      desc: "Selection ou developpement des outils adaptes. Sur mesure quand aucun existant ne convient.",
    },
    {
      n: '03',
      title: 'Deploiement & adoption',
      desc: "Mise en production, formation des equipes, ajustements. Le resultat compte -- pas les slides.",
    },
    {
      n: '04',
      title: 'Suivi & optimisation',
      desc: "On mesure, on ajuste. Pas de mission qui se termine sur une livraison et disparait.",
    },
  ];

  const convictions = [
    {
      n: '01',
      title: "Pas de solution universelle",
      desc: "Chaque organisation a ses contraintes, son rythme, ses equipes. On part de la -- pas d'un template.",
    },
    {
      n: '02',
      title: 'La technologie comme moyen',
      desc: "L'outil n'est jamais la fin. Ce qui compte, c'est ce qu'il libere : du temps, de l'attention, de la clarte.",
    },
    {
      n: '03',
      title: 'Qualite plutot que quantite',
      desc: "Une petite equipe avec les bons systemes bat une grande avec des process mediocres. On construit pour durer, pas pour faire du volume.",
    },
    {
      n: '04',
      title: 'Du concret, pas des slides',
      desc: "On ne livre pas des recommandations. On construit ce qui doit etre construit, on reste jusqu'a ce que ca marche.",
    },
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
          description:
            'Cabinet de conseil en transformation digitale. Outils sur mesure et accompagnement.',
          service: [
            { '@type': 'Service', name: 'Cartographie organisationnelle', description: 'Evaluation de la maturite de vos processus, outils et equipes.' },
            { '@type': 'Service', name: 'Developpement sur mesure', description: 'Systemes applicatifs tailles pour votre organisation.' },
            { '@type': 'Service', name: 'Accompagnement conseil', description: 'Diagnostic, priorisation, implementation et formation.' },
          ],
        }}
      />
      <StructuredData type="WebSite" data={{ name: 'Solutio', url: 'https://solutio.work' }} />

      {/* ═══════════════════════════════════════ HERO ═══════════════════════════════════════ */}
      <section className="relative min-h-[100vh] flex items-end overflow-hidden">
        {/* Background */}
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
              Conseil & Transformation Digitale
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-3">
            Vos equipes sont excellentes.
          </h1>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-blue-400 leading-[1.05] tracking-tight mb-8">
            Leur environnement<br className="hidden sm:block" />
            devrait l'etre aussi.
          </h1>

          <p className="text-base sm:text-lg text-white/60 max-w-xl leading-relaxed mb-10">
            Solutio existe pour que les professionnels puissent se concentrer sur ce qui leur rapporte
            -- pas sur ce qui leur coute.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Button
              size="lg"
              onClick={() => scrollTo('outils')}
              className="h-12 px-8 bg-white text-gray-900 hover:bg-gray-100 shadow-lg shadow-white/10 font-semibold"
            >
              Voir nos outils
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollTo('accompagnement')}
              className="h-12 px-8 border-white/25 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm"
            >
              Travailler avec nous
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {['2 outils en production', 'Systemes sur mesure', 'Accompagnement conseil'].map(
              (label) => (
                <span
                  key={label}
                  className="text-xs text-white/35 font-semibold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
                >
                  {label}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 right-8 z-10 hidden lg:flex flex-col items-center gap-2 opacity-25">
          <span className="text-[9px] font-bold tracking-[.18em] text-white uppercase">Defiler</span>
          <div className="w-px h-8 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════ OUTILS ═══════════════════════════════════════ */}
      <section id="outils" className="py-20 lg:py-24 px-6 sm:px-10">
        <div className="max-w-[1060px] mx-auto">
          <SectionLabel>Nos produits</SectionLabel>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold leading-[1.1] tracking-tight max-w-xl">
              Des outils construits pour des vrais problemes.{' '}
              <span className="text-primary">Pas des features generiques.</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed lg:text-right">
              Chaque produit nait d'un manque identifie sur le terrain. La roadmap grandit avec les
              besoins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* CARTO TOOL */}
            <Card className="group relative overflow-hidden border hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="p-7 pb-5 bg-gradient-to-br from-blue-50/80 to-primary/5 dark:from-blue-950/20 dark:to-primary/5">
                <div className="flex justify-between items-start mb-5">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-xl">
                    🗺
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 text-[10px]">
                    Disponible
                  </Badge>
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2">Cartographie Orga</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Evaluez la maturite de vos processus, outils et equipes. Identifiez les irritants
                  et generez un plan d'optimisation actionnable.
                </p>
              </div>
              <div className="p-7 pt-5">
                <ul className="space-y-2.5 mb-7">
                  {[
                    'Scan gratuit en 5 minutes',
                    'Radar de maturite par domaine',
                    'Quick wins immediats',
                    "Plan d'action priorise par IA",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-2.5 h-2.5 text-primary" />
                      </div>
                      <span className="text-[13px] font-medium text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/cartographie/login">
                  <Button className="w-full font-semibold shadow-md shadow-primary/20">
                    Scanner mon organisation
                  </Button>
                </Link>
              </div>
            </Card>

            {/* LEAD SCRAPER (coming soon) */}
            <Card className="relative overflow-hidden border opacity-75">
              <Badge className="absolute top-4 right-4 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 text-[10px]">
                Bientot
              </Badge>
              <div className="p-7 pb-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10">
                <div className="mb-5">
                  <div className="w-12 h-12 bg-slate-800 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-xl">
                    🎯
                  </div>
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2">Lead Scraper</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Generation de leads ultra-cibles pour entrepreneurs, freelances et TPE. Trouvez
                  vos cibles de niche sans les outils enterprise.
                </p>
              </div>
              <div className="p-7 pt-5">
                <ul className="space-y-2.5 mb-7">
                  {[
                    'Scraping de sources pertinentes',
                    'Filtrage par criteres niche',
                    'Export propre et actionnable',
                    'Sans abonnement enterprise',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-2.5 h-2.5 text-muted-foreground" />
                      </div>
                      <span className="text-[13px] font-medium text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full opacity-60" disabled>
                  Rejoindre la liste d'attente
                </Button>
              </div>
            </Card>

            {/* NEXT TOOL (placeholder) */}
            <Card className="relative overflow-hidden border-dashed border-2 bg-muted/30 opacity-75">
              <div className="p-7 pb-5 border-b border-dashed">
                <div className="mb-5">
                  <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2 text-muted-foreground">
                  Prochain outil
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  En cours d'identification. La roadmap est construite a partir des retours terrain
                  et des besoins recurrents chez nos clients.
                </p>
              </div>
              <div className="p-7 pt-5">
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-7">
                  Vous avez un besoin recurrent que aucun outil ne couvre correctement ? On veut
                  l'entendre.
                </p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full bg-muted/50">
                    Partager un besoin
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-border" />

      {/* ═══════════════════════════════════════ SUR MESURE ═══════════════════════════════════════ */}
      <section id="realisations" className="py-20 lg:py-24 px-6 sm:px-10 bg-muted/30">
        <div className="max-w-[1060px] mx-auto">
          <SectionLabel>Developpement sur mesure</SectionLabel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.1] tracking-tight">
              Quand aucun outil existant<br className="hidden lg:block" /> ne correspond exactement{' '}
              <span className="text-primary">a votre facon de travailler.</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              On concoit et developpe des systemes applicatifs tailles pour votre organisation --
              pas un outil standard qu'on vous demande d'adapter. Architecture, integrations,
              interfaces : tout est pense pour vos equipes.
            </p>
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
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px] px-2 py-0.5 font-medium"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-3xl sm:text-4xl font-extrabold text-primary leading-none">
                        {r.metric}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground tracking-wide uppercase mt-1">
                        {r.metricLabel}
                      </p>
                    </div>
                  </div>

                  <div className="pb-4 mb-4 border-b">
                    <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-1.5">
                      Situation initiale
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.before}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-wider text-primary uppercase mb-1.5">
                      Resultat
                    </p>
                    <p className="text-sm text-foreground font-medium leading-relaxed">{r.after}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-border" />

      {/* ═══════════════════════════════════════ ACCOMPAGNEMENT ═══════════════════════════════════════ */}
      <section id="accompagnement" className="py-20 lg:py-24 px-6 sm:px-10">
        <div className="max-w-[1060px] mx-auto">
          <SectionLabel>Transformation digitale</SectionLabel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.1] tracking-tight mb-5">
                Ce n'est pas qu'une question d'outils.{' '}
                <span className="text-primary">
                  C'est une question de comment votre organisation fonctionne vraiment.
                </span>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-5">
                Diagnostiquer, prioriser, implementer, former. On accompagne les PME de la
                cartographie de leurs dysfonctionnements jusqu'a la mise en production des solutions.
              </p>
              <p className="text-base text-foreground font-medium leading-relaxed mb-9">
                On intervient la ou ca bloque vraiment -- pas la ou c'est confortable a adresser.
                Et on repart quand c'est en marche, pas quand la mission est terminee sur le papier.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <Link to="/contact">
                  <Button className="font-semibold shadow-md shadow-primary/20">
                    Parler de mon projet
                  </Button>
                </Link>
                <Link to="/cartographie/login">
                  <Button variant="outline">Commencer par le diagnostic</Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Disponibilite limitee -- quelques entreprises par mois.
              </p>
            </div>

            <div className="space-y-3.5">
              {accompagnementSteps.map((s) => (
                <div
                  key={s.n}
                  className="flex gap-4 p-5 bg-muted/50 rounded-xl border transition-colors hover:border-primary/20"
                >
                  <span className="text-[13px] font-extrabold text-primary flex-shrink-0 pt-0.5">
                    {s.n}
                  </span>
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

      {/* ═══════════════════════════════════════ CONVICTION ═══════════════════════════════════════ */}
      <section className="py-20 lg:py-24 px-6 sm:px-10 bg-muted/30">
        <div className="max-w-[1060px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
            <div>
              <SectionLabel>Notre conviction</SectionLabel>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.1] tracking-tight mb-6">
                Une petite equipe<br className="hidden lg:block" /> bien organisee peut{' '}
                <span className="text-primary">rivaliser avec n'importe qui.</span>
              </h2>
              <blockquote className="text-base sm:text-lg text-foreground font-semibold leading-relaxed border-l-[3px] border-primary pl-5 mb-5">
                Chaque heure passee sur une tache administrative, une relance manuelle ou un rapport
                qu'on pourrait automatiser -- c'est une heure de moins sur ce qui cree vraiment de
                la valeur.
              </blockquote>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                Solutio existe pour que les professionnels puissent se concentrer sur ce qui leur
                rapporte -- pas sur ce qui leur coute. Pas les taches redondantes, pas
                l'administration, pas ce que n'importe qui pourrait faire a leur place.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                L'IA, l'automatisation, les systemes sur mesure ne sont plus reserves aux grands
                groupes. C'est une infrastructure qui se democratise -- et ceux qui s'en emparent
                maintenant prennent une longueur d'avance qui ne se rattrape pas facilement.
              </p>
            </div>

            <div className="lg:border-l lg:pl-12 space-y-0">
              {convictions.map((s, i) => (
                <div
                  key={s.n}
                  className={`pb-7 mb-7 ${i < convictions.length - 1 ? 'border-b' : ''}`}
                >
                  <p className="text-[11px] font-extrabold text-primary tracking-wider mb-1.5">
                    {s.n}
                  </p>
                  <p className="text-[15px] font-bold mb-1">{s.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-border" />

      {/* ═══════════════════════════════════════ FAQ ═══════════════════════════════════════ */}
      <section className="py-20 lg:py-24 px-6 sm:px-10">
        <div className="max-w-[1060px] mx-auto">
          <SectionLabel>Questions frequentes</SectionLabel>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.1] tracking-tight mb-12 max-w-md">
            Ce que vous vous demandez{' '}
            <span className="text-primary">probablement.</span>
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
                  <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
                    {f.a}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ DUAL CTA ═══════════════════════════════════════ */}
      <section className="py-20 lg:py-24 px-6 sm:px-10" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}>
        <div className="max-w-[1060px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-0 items-stretch">
            {/* Left CTA — product */}
            <div className="p-4 md:pr-12">
              <Badge className="mb-5 bg-blue-500/10 text-blue-400 border-blue-500/30 text-[11px]">
                Produit
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight mb-4">
                Vous voulez tester l'outil ?
              </h2>
              <p className="text-[15px] text-white/50 leading-relaxed mb-8">
                La cartographie est gratuite. 5 minutes, resultats immediats. Aucun engagement.
              </p>
              <Link to="/cartographie/login">
                <Button className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg font-semibold">
                  Scanner mon organisation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Separator */}
            <div className="hidden md:block bg-white/10" />
            <div className="md:hidden h-px bg-white/10 my-8" />

            {/* Right CTA — consulting */}
            <div className="p-4 md:pl-12">
              <Badge className="mb-5 bg-amber-500/10 text-amber-400 border-amber-500/30 text-[11px]">
                Accompagnement
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight mb-4">
                Vous voulez aller plus loin ?
              </h2>
              <p className="text-[15px] text-white/50 leading-relaxed mb-8">
                On parle de votre organisation, vos besoins, ce qu'on peut construire ensemble.
              </p>
              <Link to="/contact">
                <Button className="bg-slate-800 text-white hover:bg-slate-700 font-semibold">
                  Reserver un echange
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

/* ── Small helper for section labels ── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-4 text-[11px] font-bold tracking-[.1em] uppercase text-primary">
    <div className="w-5 h-0.5 bg-primary rounded-full" />
    {children}
  </div>
);

export default Index;
