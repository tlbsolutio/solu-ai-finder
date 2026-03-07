import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle, X, Sparkles, ArrowRight, Crown,
  FileText, Users, Zap, Brain, Phone, Shield,
  BarChart3, ClipboardList, Download, Calendar,
  Target, TrendingUp, Layers, MessageSquare, Star,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useState } from "react";

const AUTONOME_LINK = "https://buy.stripe.com/28EaEXebubz15uv8QtabK00";
const ACCOMPAGNEE_LINK = "https://buy.stripe.com/4gM6oHffy46zaOPaYBabK01";

interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

const FREE_FEATURES: PlanFeature[] = [
  { text: "Scan rapide (3 minutes)", included: true },
  { text: "Vue d'ensemble & radar", included: true },
  { text: "Carte interactive", included: true },
  { text: "Questionnaire complet (10 packs)", included: true },
  { text: "Analyse IA par pack", included: false },
  { text: "Quick wins identifies", included: false },
  { text: "Plan d'actions priorise", included: false },
  { text: "Export PDF", included: false },
  { text: "Accompagnement expert", included: false },
];

const AUTONOME_FEATURES: PlanFeature[] = [
  { text: "Tout le plan Gratuit", included: true },
  { text: "Analyse IA complete par pack", included: true, highlight: true },
  { text: "Quick wins identifies & priorises", included: true, highlight: true },
  { text: "Diagnostic processus, outils, equipes", included: true, highlight: true },
  { text: "Irritants & risques detectes", included: true },
  { text: "Plan d'actions P1/P2/P3", included: true, highlight: true },
  { text: "Recommandations IA personnalisees", included: true },
  { text: "Analyse causale inter-packs", included: true },
  { text: "Quantification d'impact", included: true },
  { text: "Export PDF professionnel", included: true, highlight: true },
  { text: "Accompagnement expert", included: false },
];

const ACCOMPAGNEE_FEATURES: PlanFeature[] = [
  { text: "Tout le plan Autonome", included: true },
  { text: "1h de RDV strategique avec un expert", included: true, highlight: true },
  { text: "Plan d'action personnalise & priorise", included: true, highlight: true },
  { text: "Priorisation expert de vos chantiers", included: true, highlight: true },
  { text: "Suivi email pendant 30 jours", included: true, highlight: true },
  { text: "Conseils d'implementation concrets", included: true },
];

const COMPARISON_MATRIX = [
  { feature: "Scan rapide (3 min)", free: true, auto: true, acc: true },
  { feature: "Radar de maturite", free: "Estime", auto: "Precis", acc: "Precis" },
  { feature: "Questionnaire complet (10 packs)", free: true, auto: true, acc: true },
  { feature: "Carte interactive", free: true, auto: true, acc: true },
  { feature: "Analyse IA par pack", free: false, auto: true, acc: true },
  { feature: "Quick wins priorises", free: false, auto: true, acc: true },
  { feature: "Diagnostic processus/outils/equipes", free: false, auto: true, acc: true },
  { feature: "Irritants & risques", free: false, auto: true, acc: true },
  { feature: "Plan d'actions P1/P2/P3", free: false, auto: true, acc: true },
  { feature: "Recommandations IA", free: false, auto: true, acc: true },
  { feature: "Analyse causale inter-packs", free: false, auto: true, acc: true },
  { feature: "Quantification d'impact", free: false, auto: true, acc: true },
  { feature: "Export PDF professionnel", free: false, auto: true, acc: true },
  { feature: "RDV strategique 1h avec expert", free: false, auto: false, acc: true },
  { feature: "Plan d'action expert personnalise", free: false, auto: false, acc: true },
  { feature: "Suivi email 30 jours", free: false, auto: false, acc: true },
];

export default function CartPricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Append session ID to Stripe link via client_reference_id
  const buildPaymentLink = (baseLink: string, plan: string) => {
    const url = new URL(baseLink);
    if (sessionId) url.searchParams.set("client_reference_id", sessionId);
    // Prefill success redirect with session context
    return url.toString();
  };

  const renderCell = (value: boolean | string) => {
    if (typeof value === "string") return <span className="text-xs font-medium">{value}</span>;
    if (value) return <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />;
    return <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />;
  };

  return (
    <div className="flex-1 bg-background">
      {/* Hero with gradient background */}
      <div
        className="px-4 sm:px-6 pt-12 pb-10 text-center"
        style={{
          background: 'linear-gradient(180deg, rgba(6,182,212,0.06) 0%, rgba(59,130,246,0.03) 50%, transparent 100%)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <Badge className="mb-4 bg-cyan-500/10 text-cyan-700 border-cyan-200 px-3 py-1">
            Solutio Carto — Diagnostic organisationnel
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            Investissez dans la clarte pour <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">transformer votre organisation</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Commencez gratuitement, puis debloquez l'analyse complete quand vous etes pret a passer a l'action.
          </p>
          {/* Social proof */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">+200 dirigeants</span> nous font confiance
            </p>
          </div>
        </div>
      </div>

      {/* Plans grid */}
      <div className="px-4 sm:px-6 pb-12 max-w-5xl mx-auto -mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 lg:gap-6">

          {/* FREE */}
          <Card className="relative flex flex-col">
            <CardContent className="p-5 sm:p-6 flex flex-col flex-1">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Decouverte</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">Gratuit</span>
                </div>
                <p className="text-xs text-muted-foreground">Scan rapide sans engagement</p>
              </div>

              <div className="space-y-2.5 flex-1">
                {FREE_FEATURES.map((f) => (
                  <div key={f.text} className="flex items-start gap-2">
                    {f.included ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                    )}
                    <span className={`text-sm ${f.included ? "text-foreground" : "text-muted-foreground/60"}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-6 h-11"
                onClick={() => navigate("/cartographie/sessions")}
              >
                Commencer gratuitement
              </Button>
            </CardContent>
          </Card>

          {/* AUTONOME — highlighted */}
          <Card className="relative flex flex-col border-cyan-500 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/20 scale-[1.02] md:scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-1 text-xs font-semibold shadow-md shadow-cyan-500/30">
                <Star className="w-3 h-3 mr-1" />
                Plus populaire
              </Badge>
            </div>
            <CardContent className="p-5 sm:p-6 flex flex-col flex-1">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Autonome</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">349</span>
                  <span className="text-lg font-medium text-muted-foreground">EUR</span>
                </div>
                <p className="text-xs text-muted-foreground">Paiement unique — acces permanent</p>
              </div>

              <div className="space-y-2.5 flex-1">
                {AUTONOME_FEATURES.map((f) => (
                  <div key={f.text} className="flex items-start gap-2">
                    {f.included ? (
                      <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${f.highlight ? "text-cyan-600" : "text-emerald-500"}`} />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                    )}
                    <span className={`text-sm ${f.included ? (f.highlight ? "text-foreground font-medium" : "text-foreground") : "text-muted-foreground/60"}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full mt-6 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white font-semibold shadow-lg shadow-cyan-500/20 relative overflow-hidden group"
                onClick={() => window.open(buildPaymentLink(AUTONOME_LINK, "autonome"), "_blank")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                Debloquer la cartographie
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-2">Garantie satisfait ou rembourse 30 jours</p>
            </CardContent>
          </Card>

          {/* ACCOMPAGNEE */}
          <Card className="relative flex flex-col border-amber-200 bg-gradient-to-b from-amber-50/40 to-background">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge className="bg-amber-600 text-white px-4 py-1 text-xs font-semibold shadow-sm">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
            <CardContent className="p-5 sm:p-6 flex flex-col flex-1">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Accompagnee</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">890</span>
                  <span className="text-lg font-medium text-muted-foreground">EUR</span>
                </div>
                <p className="text-xs text-muted-foreground">Diagnostic + accompagnement expert</p>
              </div>

              <div className="space-y-2.5 flex-1">
                {ACCOMPAGNEE_FEATURES.map((f) => (
                  <div key={f.text} className="flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${f.highlight ? "text-amber-600" : "text-emerald-500"}`} />
                    <span className={`text-sm ${f.highlight ? "text-foreground font-medium" : "text-foreground"}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full mt-6 h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                onClick={() => window.open(buildPaymentLink(ACCOMPAGNEE_LINK, "accompagnee"), "_blank")}
              >
                Choisir l'accompagnement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-2">Garantie satisfait ou rembourse 30 jours</p>
            </CardContent>
          </Card>
        </div>

        {/* "Ce que vous obtenez" section with visual icons */}
        <div className="mt-14">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Ce que vous obtenez</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">Chaque formule payante inclut des outils concrets pour transformer votre organisation</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: Brain, title: "Analyse IA approfondie", desc: "2 modeles IA analysent vos 10 packs", color: "from-violet-500/10 to-purple-500/10 text-violet-600" },
              { icon: Target, title: "Quick wins priorises", desc: "Actions rapides a fort impact", color: "from-amber-500/10 to-orange-500/10 text-amber-600" },
              { icon: Layers, title: "Plan d'actions P1/P2/P3", desc: "Feuille de route priorisee", color: "from-cyan-500/10 to-blue-500/10 text-cyan-600" },
              { icon: TrendingUp, title: "Quantification d'impact", desc: "ROI estime par action", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600" },
              { icon: ClipboardList, title: "Diagnostic complet", desc: "Processus, outils, equipes", color: "from-blue-500/10 to-indigo-500/10 text-blue-600" },
              { icon: Zap, title: "Irritants detectes", desc: "Risques et blocages priorises", color: "from-red-500/10 to-rose-500/10 text-red-600" },
              { icon: Download, title: "Export PDF", desc: "Rapport professionnel partageable", color: "from-slate-500/10 to-gray-500/10 text-slate-600" },
              { icon: MessageSquare, title: "Recommandations IA", desc: "Conseils personnalises actionnables", color: "from-pink-500/10 to-fuchsia-500/10 text-pink-600" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold mb-0.5">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature comparison matrix */}
        <div className="mt-14">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Comparatif detaille</h2>
            <p className="text-sm text-muted-foreground">Tout ce qui est inclus dans chaque formule</p>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Fonctionnalite</th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground min-w-[90px]">Decouverte<br /><span className="text-xs font-normal">Gratuit</span></th>
                    <th className="text-center py-3 px-4 font-semibold text-cyan-700 bg-cyan-50/50 min-w-[90px]">Autonome<br /><span className="text-xs font-normal">349 EUR</span></th>
                    <th className="text-center py-3 px-4 font-semibold text-amber-700 bg-amber-50/50 min-w-[90px]">Accompagnee<br /><span className="text-xs font-normal">890 EUR</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {COMPARISON_MATRIX.map(({ feature, free, auto, acc }) => (
                    <tr key={feature} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-4 text-foreground/80">{feature}</td>
                      <td className="py-2.5 px-4 text-center">{renderCell(free)}</td>
                      <td className="py-2.5 px-4 text-center bg-cyan-50/20">{renderCell(auto)}</td>
                      <td className="py-2.5 px-4 text-center bg-amber-50/20">{renderCell(acc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Testimonial */}
        <div className="mt-14 max-w-2xl mx-auto">
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white">
            <CardContent className="p-6 sm:p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-4 italic">
                "La cartographie Solutio nous a permis d'identifier en quelques heures les vrais blocages que nous n'arrivions pas a formaliser depuis des mois. Le plan d'actions priorise a ete le declencheur de notre transformation."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">SL</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">Sophie L.</p>
                  <p className="text-xs text-muted-foreground">DG, PME industrielle (45 salaries)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Value props */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: "Donnees securisees", desc: "Heberge en Europe (Supabase Ireland), vos donnees restent confidentielles." },
            { icon: Brain, title: "IA avancee", desc: "Analyse par 2 modeles IA pour des recommandations precises et actionnables." },
            { icon: Download, title: "Export PDF", desc: "Rapport professionnel a partager avec votre direction ou vos equipes." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3 p-4 rounded-xl border bg-card">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee banner */}
        <div className="mt-8 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/50 max-w-lg mx-auto">
          <Shield className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Garantie satisfait ou rembourse 30 jours</p>
            <p className="text-xs text-emerald-700/70">Si le diagnostic ne vous apporte pas de valeur, nous vous remboursons integralement.</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-14 max-w-2xl mx-auto space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">Questions frequentes</h2>
          {[
            {
              q: "Puis-je tester gratuitement avant d'acheter ?",
              a: "Oui ! Le scan gratuit vous donne acces a la vue d'ensemble, au radar de maturite et a la carte interactive. Vous voyez la valeur avant de payer.",
            },
            {
              q: "Combien de temps dure le diagnostic complet ?",
              a: "Le questionnaire prend environ 45 minutes a 1h. L'analyse IA est generee en quelques minutes apres completion.",
            },
            {
              q: "Quelle difference entre Autonome et Accompagnee ?",
              a: "L'offre Autonome vous donne le diagnostic complet en self-service. L'offre Accompagnee ajoute 1h de RDV strategique avec un expert, un plan d'action personnalise, la priorisation de vos chantiers et 30 jours de suivi par email.",
            },
            {
              q: "Comment fonctionne la garantie satisfait ou rembourse ?",
              a: "Si dans les 30 jours suivant votre achat vous estimez que le diagnostic ne vous a pas apporte de valeur, contactez-nous et nous vous remboursons integralement, sans conditions.",
            },
            {
              q: "Mon paiement est-il securise ?",
              a: "Oui, le paiement est traite par Stripe, leader mondial du paiement en ligne. Vos donnees bancaires ne transitent jamais par nos serveurs. Vous recevez une facture par email.",
            },
            {
              q: "Mes donnees sont-elles protegees ?",
              a: "Absolument. Vos donnees sont hebergees en Europe (Supabase Ireland), chiffrees en transit et au repos. Nous ne les partageons jamais avec des tiers.",
            },
          ].map(({ q, a }, index) => (
            <div
              key={q}
              className="rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:shadow-sm cursor-pointer"
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <div className="flex items-center justify-between p-4">
                <p className="text-sm font-medium pr-4">{q}</p>
                {openFaq === index ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </div>
              {openFaq === index && (
                <div className="px-4 pb-4 -mt-1">
                  <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 mb-8 text-center">
          <p className="text-lg font-bold mb-2">Pret a transformer votre organisation ?</p>
          <p className="text-sm text-muted-foreground mb-5">Commencez gratuitement, montez en puissance quand vous le souhaitez.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="h-11"
              onClick={() => navigate("/cartographie/sessions")}
            >
              Essai gratuit
            </Button>
            <Button
              className="h-11 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white font-semibold shadow-lg shadow-cyan-500/20"
              onClick={() => window.open(buildPaymentLink(AUTONOME_LINK, "autonome"), "_blank")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Autonome — 349 EUR
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
