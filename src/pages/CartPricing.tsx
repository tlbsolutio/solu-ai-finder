import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle, X, Sparkles, ArrowRight, Crown,
  FileText, Users, Zap, Brain, Phone, Shield,
  BarChart3, ClipboardList, Download, Calendar,
} from "lucide-react";

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

export default function CartPricing() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-background">
      {/* Hero */}
      <div className="px-4 sm:px-6 pt-10 pb-8 text-center max-w-3xl mx-auto">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-3 py-1">
          Cartographie organisationnelle
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          Choisissez votre formule
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
          Commencez gratuitement, puis debloquez l'analyse complete quand vous etes pret a transformer votre organisation.
        </p>
      </div>

      {/* Plans grid */}
      <div className="px-4 sm:px-6 pb-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* FREE */}
          <Card className="relative flex flex-col">
            <CardContent className="p-6 flex flex-col flex-1">
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
          <Card className="relative flex flex-col border-primary shadow-lg ring-2 ring-primary/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-medium shadow-sm">
                Populaire
              </Badge>
            </div>
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
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
                      <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${f.highlight ? "text-primary" : "text-emerald-500"}`} />
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
                className="w-full mt-6 h-11 bg-gradient-primary hover:opacity-90"
                onClick={() => window.open(AUTONOME_LINK, "_blank")}
              >
                Debloquer la cartographie
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* ACCOMPAGNEE */}
          <Card className="relative flex flex-col border-amber-200 bg-gradient-to-b from-amber-50/40 to-background">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-amber-600 text-white px-4 py-1 text-xs font-medium shadow-sm">
                Premium
              </Badge>
            </div>
            <CardContent className="p-6 flex flex-col flex-1">
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
                className="w-full mt-6 h-11 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => window.open(ACCOMPAGNEE_LINK, "_blank")}
              >
                Choisir l'accompagnement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
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
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ mini */}
        <div className="mt-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-lg font-semibold text-center mb-6">Questions frequentes</h2>
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
              a: "L'offre Autonome vous donne le diagnostic complet en self-service. L'offre Accompagnee ajoute 1h de RDV strategique, un plan d'action personnalise par un expert, et 30 jours de suivi.",
            },
            {
              q: "Mon paiement est-il securise ?",
              a: "Oui, le paiement est traite par une plateforme securisee. Vous recevez une facture par email.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl border bg-card p-4">
              <p className="text-sm font-medium mb-1.5">{q}</p>
              <p className="text-xs text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
