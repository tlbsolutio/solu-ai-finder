import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuickScan } from "@/hooks/useQuickScan";
import { MiniRadarChart } from "@/components/cartographie/MiniRadarChart";
import { QuickWinCard } from "@/components/cartographie/QuickWinCard";
import { SECTORS, detectSectorByKeywords, detectSectorByNAF, getSectorById } from "@/data/sectors";
import {
  ArrowLeft, ArrowRight, Loader2, Sparkles, Lock, Network, CheckCircle2, BarChart3,
  TrendingUp, Target, Shield, Crown, AlertTriangle, Zap, Users, CheckCircle, Star, Layers,
} from "lucide-react";

const QUICK_QUESTIONS = [
  { id: "q1", bloc: "1", question: "Quelle est la taille de votre entreprise ?", type: "choice", options: ["1-10", "11-50", "51-200", "200+"] },
  { id: "q2", bloc: "1", question: "Depuis combien d'annees votre entreprise existe-t-elle ?", type: "choice", options: ["< 2 ans", "2-5 ans", "5-10 ans", "10+ ans"] },
  { id: "q3", bloc: "2", question: "Quel est votre niveau de satisfaction clients actuel ? (1-5)", type: "scale" },
  { id: "q4", bloc: "3", question: "Vos processus de decision sont-ils clairement definis ?", type: "yesno" },
  { id: "q5", bloc: "4", question: "Avez-vous des difficultes de recrutement ou de retention ?", type: "yesno" },
  { id: "q6", bloc: "5", question: "Quel est votre taux de conversion prospect → client ?", type: "choice", options: ["< 10%", "10-25%", "25-50%", "50%+", "Je ne sais pas"] },
  { id: "q7", bloc: "6", question: "Avez-vous des processus operationnels documentes ?", type: "yesno" },
  { id: "q8", bloc: "7", question: "Combien d'outils numeriques utilisez-vous au quotidien ?", type: "choice", options: ["1-3", "4-7", "8-12", "13+"] },
  { id: "q9", bloc: "7", question: "Vos outils sont-ils bien integres entre eux ?", type: "scale" },
  { id: "q10", bloc: "8", question: "Comment evaluez-vous votre communication interne ? (1-5)", type: "scale" },
  { id: "q11", bloc: "9", question: "Avez-vous des procedures qualite en place ?", type: "yesno" },
  { id: "q12", bloc: "10", question: "Suivez-vous des KPIs de performance regulierement ?", type: "yesno" },
];

const BLOC_LABELS: Record<string, string> = {
  "1": "Identite",
  "2": "Clients",
  "3": "Gouvernance",
  "4": "RH & Talents",
  "5": "Commercial",
  "6": "Operations",
  "7": "Outils & Digital",
  "8": "Communication",
  "9": "Qualite",
  "10": "Pilotage",
};

const CartQuickScan = () => {
  const { runScan, loading, result, error } = useQuickScan();
  const [step, setStep] = useState<"form" | "results">("form");
  const [description, setDescription] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedSector, setSelectedSector] = useState("");
  const [nafCode, setNafCode] = useState("");
  const [effectif, setEffectif] = useState("");
  const [confirmedTerms, setConfirmedTerms] = useState<string[]>([]);

  const detectedSector = useMemo(() => {
    if (selectedSector) return getSectorById(selectedSector);
    if (nafCode) {
      const byNaf = detectSectorByNAF(nafCode);
      if (byNaf) return byNaf;
    }
    if (description.length > 10) {
      const byKw = detectSectorByKeywords(description);
      if (byKw && byKw.confidence >= 0.3) return byKw.sector;
    }
    return null;
  }, [description, selectedSector, nafCode]);

  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / QUICK_QUESTIONS.length) * 100);

  const handleSubmit = async () => {
    const reponsesRapides: Record<string, string> = {};
    QUICK_QUESTIONS.forEach(q => {
      if (answers[q.id]) reponsesRapides[q.question] = answers[q.id];
    });
    if (detectedSector) {
      reponsesRapides["__sector_id"] = detectedSector.id;
      reponsesRapides["__sector_nom"] = detectedSector.nom;
    }
    if (effectif) reponsesRapides["Effectif"] = effectif;
    if (confirmedTerms.length > 0) reponsesRapides["__confirmed_terms"] = confirmedTerms.join(", ");
    await runScan(description, reponsesRapides);
    setStep("results");
  };

  const updateAnswer = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  // Compute a transformation potential score from result scores
  const transformationScore = useMemo(() => {
    if (!result?.scores) return 0;
    const values = Object.values(result.scores).filter((v): v is number => typeof v === "number");
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    // Invert: lower maturity = higher transformation potential
    return Math.round(Math.max(0, Math.min(100, (5 - avg) * 20)));
  }, [result?.scores]);

  if (step === "results" && result) {
    const dysCount = result.dysfonctionnements?.length ?? 0;
    const qwCount = result.quick_wins?.length ?? 0;

    return (
      <div className="min-h-screen bg-background">
        {/* Results hero gradient */}
        <div
          className="px-4 pt-8 pb-6"
          style={{
            background: 'linear-gradient(180deg, rgba(6,182,212,0.06) 0%, rgba(59,130,246,0.03) 50%, transparent 100%)',
          }}
        >
          <div className="container mx-auto max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setStep("form")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Resultats de votre scan</h1>
                <p className="text-sm text-muted-foreground">Apercu de votre maturite organisationnelle</p>
              </div>
            </div>

            {/* Score summary cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-card p-4 text-center">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">{dysCount}</p>
                <p className="text-[11px] text-muted-foreground">Dysfonctionnements</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-amber-600">{qwCount}</p>
                <p className="text-[11px] text-muted-foreground">Quick wins</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-emerald-600">{transformationScore}%</p>
                <p className="text-[11px] text-muted-foreground">Potentiel</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8">
          <div className="container mx-auto max-w-3xl space-y-6 animate-fade-in-up">

          {/* Radar — with blurred full version teaser */}
          <Card className="overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Radar de maturite (estime)
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex justify-center">
                <MiniRadarChart scores={result.scores} size={240} />
              </div>
              {/* Blurred detailed radar teaser */}
              <div className="relative mt-4 rounded-xl overflow-hidden border border-dashed border-muted-foreground/20">
                <div className="p-4 blur-[6px] select-none opacity-50" aria-hidden="true">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(result.scores).slice(0, 4).map(([k]) => (
                      <div key={k} className="flex items-center gap-2">
                        <div className="w-full h-3 bg-cyan-200 rounded-full" />
                        <span className="text-xs whitespace-nowrap">{k}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                  <div className="flex items-center gap-2 bg-white/90 border shadow-sm rounded-full px-4 py-2">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium">Analyse detaillee par pack — version complete</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Votre potentiel de transformation */}
          <Card className="overflow-hidden border-emerald-200/50 bg-gradient-to-br from-emerald-50/30 to-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Votre potentiel de transformation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Progress value={transformationScore} className="h-3" />
                </div>
                <span className="text-lg font-bold text-emerald-600">{transformationScore}%</span>
              </div>
              <p className="text-sm text-foreground/80">
                {transformationScore >= 60
                  ? "Votre organisation presente un fort potentiel d'amelioration. Les actions identifiees pourraient generer des gains significatifs."
                  : transformationScore >= 30
                  ? "Votre organisation a des bases solides mais plusieurs axes d'amelioration sont identifies."
                  : "Votre organisation est deja bien structuree. Des optimisations ciblees peuvent encore renforcer votre performance."}
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.scores)
                  .filter(([, v]) => typeof v === "number" && v <= 2.5)
                  .slice(0, 3)
                  .map(([k]) => (
                    <Badge key={k} variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                      <Target className="w-3 h-3 mr-1" />
                      {k}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Resume */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Resume
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm leading-relaxed text-foreground/80">{result.resume}</p></CardContent>
          </Card>

          {/* Dysfonctionnements */}
          {result.dysfonctionnements.length > 0 && (
            <Card className="border-red-200/50 overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-red-400 to-red-500/50" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  {dysCount} dysfonctionnement{dysCount > 1 ? "s" : ""} detecte{dysCount > 1 ? "s" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {result.dysfonctionnements.map((d, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-lg bg-red-50/50 p-3 border border-red-100/50">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-red-600">{i + 1}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{d}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick wins — show first 2, tease the rest */}
          {result.quick_wins.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <span>Quick wins ({qwCount} identifies)</span>
              </h3>
              {result.quick_wins.slice(0, 2).map((qw, i) => (
                <QuickWinCard key={i} action={qw.action} impact={qw.impact} effort={qw.effort} categorie={qw.categorie} />
              ))}
              {result.quick_wins.length > 2 && (
                <div className="relative">
                  <div className="blur-[4px] select-none opacity-60" aria-hidden="true">
                    <QuickWinCard
                      action={result.quick_wins[2].action}
                      impact={result.quick_wins[2].impact}
                      effort={result.quick_wins[2].effort}
                      categorie={result.quick_wins[2].categorie}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2 bg-white/95 border shadow-md rounded-full px-5 py-2.5">
                      <Lock className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-medium">+{result.quick_wins.length - 2} quick wins dans la version complete</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Teasing: Locked previews */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
              Disponible avec la cartographie complete
            </h3>
            {[
              { title: "Analyse causale inter-packs", preview: "Les dysfonctionnements RH impactent directement la productivite operationnelle. La cause racine identifiee remonte a un deficit de gouvernance sur les processus de decision...", icon: Target, color: "text-violet-500 bg-violet-50" },
              { title: "Plan d'actions priorise (P1/P2/P3)", preview: "P1 — Mettre en place un outil de gestion de projet centralise (impact: eleve, effort: moyen). P2 — Former les managers aux rituels d'equipe agiles...", icon: Layers, color: "text-cyan-500 bg-cyan-50" },
              { title: "Estimation d'impact financier", preview: "Gain potentiel estime : 45 000 a 78 000 EUR/an. Principaux leviers : reduction des taches manuelles (-30%), amelioration du taux de conversion (+15%)...", icon: TrendingUp, color: "text-emerald-500 bg-emerald-50" },
            ].map(({ title, preview, icon: Icon, color }) => (
              <Card key={title} className="border-muted relative overflow-hidden group hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium">{title}</span>
                    <Lock className="w-3 h-3 text-muted-foreground/50 ml-auto" />
                  </div>
                  <p className="text-sm text-muted-foreground blur-[5px] select-none" aria-hidden="true">
                    {preview}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison table */}
          <Card className="overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Scan gratuit vs Cartographie complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-2.5 pr-4 font-medium text-muted-foreground">Fonctionnalite</th>
                      <th className="text-center py-2.5 px-3 font-medium text-muted-foreground">Gratuit</th>
                      <th className="text-center py-2.5 px-3 font-medium text-cyan-700 bg-cyan-50/30">Autonome <span className="text-[10px] font-normal">349 EUR</span></th>
                      <th className="text-center py-2.5 px-3 font-medium text-amber-700 bg-amber-50/30">Accomp. <span className="text-[10px] font-normal">890 EUR</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { feature: "Questions", free: "12 rapides", auto: "150 approfondies", acc: "150 + expert" },
                      { feature: "Radar maturite", free: "Estime", auto: "Precis par pack", acc: "Precis par pack" },
                      { feature: "Analyse IA", free: "Resume global", auto: "Par pack + causale", acc: "Par pack + causale" },
                      { feature: "Quick wins", free: `${Math.min(qwCount, 2)} apercu`, auto: "Kanban complet", acc: "Kanban + priorisation" },
                      { feature: "Plan d'actions priorise", free: false, auto: true, acc: true },
                      { feature: "Export PDF", free: false, auto: true, acc: true },
                      { feature: "RDV expert 1h", free: false, auto: false, acc: true },
                      { feature: "Suivi 30 jours", free: false, auto: false, acc: true },
                    ].map(({ feature, free, auto, acc }) => (
                      <tr key={feature} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 pr-4 text-foreground/80">{feature}</td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">
                          {typeof free === "boolean" ? (free ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-muted-foreground/40">--</span>) : free}
                        </td>
                        <td className="py-2.5 px-3 text-center font-medium text-cyan-700 bg-cyan-50/10 text-xs">
                          {typeof auto === "boolean" ? (auto ? <CheckCircle className="w-4 h-4 text-cyan-600 mx-auto" /> : <span className="text-muted-foreground/40">--</span>) : auto}
                        </td>
                        <td className="py-2.5 px-3 text-center font-medium text-amber-700 bg-amber-50/10 text-xs">
                          {typeof acc === "boolean" ? (acc ? <CheckCircle className="w-4 h-4 text-amber-600 mx-auto" /> : <span className="text-muted-foreground/40">--</span>) : acc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* CTA Conversion */}
          <Card className="overflow-hidden border-0 shadow-xl" style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(59,130,246,0.04) 50%, rgba(139,92,246,0.03) 100%)',
          }}>
            <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500" />
            <CardContent className="p-6 sm:p-8 text-center space-y-4">
              <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-1 shadow-sm">
                Offre de lancement
              </Badge>
              <h3 className="text-lg sm:text-xl font-bold">
                {dysCount > 0 ? `${dysCount} problemes detectes, ${qwCount} solutions identifiees` : "Passez a la cartographie complete"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                150 questions, analyse IA approfondie, plan d'actions priorise, estimation d'impact financier et export PDF professionnel.
              </p>

              {/* Pricing inline */}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2">
                <div className="rounded-xl border-2 border-cyan-200 bg-white p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    <p className="text-xs font-semibold text-cyan-700">Autonome</p>
                  </div>
                  <p className="text-xl font-bold">349<span className="text-xs font-normal text-muted-foreground ml-0.5">EUR</span></p>
                </div>
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <p className="text-xs font-semibold text-amber-700">Accompagnee</p>
                  </div>
                  <p className="text-xl font-bold">890<span className="text-xs font-normal text-muted-foreground ml-0.5">EUR</span></p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link to="/cartographie/pricing">
                  <Button
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white h-12 px-8 w-full sm:w-auto font-semibold shadow-lg shadow-cyan-500/20 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <Sparkles className="w-4 h-4 mr-2" />
                    Voir les formules
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/cartographie/login">
                  <Button variant="outline" className="h-12 w-full sm:w-auto px-6">
                    <Network className="w-4 h-4 mr-2" />
                    Se connecter
                  </Button>
                </Link>
              </div>

              {/* Guarantee + social proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs text-muted-foreground">Garantie 30 jours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="text-xs text-muted-foreground">+200 dirigeants nous font confiance</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Vos reponses au scan seront conservees pour enrichir votre cartographie.
              </p>
            </CardContent>
          </Card>
        </div>
        </div>

        {/* Sticky bottom CTA for mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-sm border-t shadow-lg px-4 py-3 safe-area-pb">
          <div className="container mx-auto max-w-3xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">Pret pour l'analyse complete ?</p>
              <p className="text-[10px] text-muted-foreground">150 questions · 10 axes · rapport PDF</p>
            </div>
            <Link to="/cartographie/login">
              <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white h-9 px-4 text-xs shrink-0">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Group questions by bloc for step navigation
  const currentBloc = useMemo(() => {
    // Find the first unanswered question's bloc
    const unanswered = QUICK_QUESTIONS.find(q => !answers[q.id]);
    return unanswered?.bloc ?? QUICK_QUESTIONS[QUICK_QUESTIONS.length - 1].bloc;
  }, [answers]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header with gradient */}
      <div
        className="px-4 pt-8 pb-6"
        style={{
          background: 'linear-gradient(180deg, rgba(6,182,212,0.06) 0%, rgba(59,130,246,0.03) 50%, transparent 100%)',
        }}
      >
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/cartographie">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Scan rapide</h1>
              <p className="text-sm text-muted-foreground">Apercu de la maturite de votre organisation en 3 minutes</p>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-1 mb-2">
            {["Entreprise", "Questions", "Resultats"].map((label, i) => (
              <div key={label} className="flex items-center gap-1 flex-1">
                <div className={`flex items-center gap-1.5 flex-1 ${i < 2 ? "" : ""}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                    i === 0 ? "bg-primary text-primary-foreground" :
                    i === 1 && answered > 0 ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {i === 2 ? <BarChart3 className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:inline">{label}</span>
                </div>
                {i < 2 && <div className={`h-0.5 flex-1 rounded-full ${
                  i === 0 || (i === 1 && progress >= 50) ? "bg-primary/30" : "bg-muted"
                }`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="container mx-auto max-w-2xl space-y-6">

        {/* Progress — sticky on mobile */}
        <Card className="overflow-hidden sticky top-0 z-10 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{answered}/{QUICK_QUESTIONS.length} questions</span>
                {currentBloc && BLOC_LABELS[currentBloc] && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0">
                    {BLOC_LABELS[currentBloc]}
                  </Badge>
                )}
              </div>
              <Badge variant="secondary" className="font-mono text-xs">{progress}%</Badge>
            </div>
            <Progress value={progress} className="h-2.5" />
            {progress >= 42 && progress < 100 && (
              <p className="text-[10px] text-emerald-600 mt-1.5 font-medium">
                Plus que {QUICK_QUESTIONS.length - answered} question{QUICK_QUESTIONS.length - answered > 1 ? "s" : ""} pour obtenir votre diagnostic
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sector Detection */}
        <Card className="border-primary/20 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Network className="w-4 h-4 text-primary" />
              Votre entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Decrivez votre activite</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Decrivez en quelques phrases votre activite, vos principaux defis et ce que vous aimeriez ameliorer..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Secteur d'activite</Label>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger><SelectValue placeholder="Selectionnez" /></SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Code NAF (optionnel)</Label>
                <Input value={nafCode} onChange={(e) => setNafCode(e.target.value)} placeholder="Ex: 62.01Z" />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium mb-1.5 block">Effectif</Label>
              <RadioGroup value={effectif} onValueChange={setEffectif} className="flex flex-wrap gap-2">
                {["1-10", "11-50", "51-200", "200+"].map((opt) => (
                  <div key={opt} className="flex items-center">
                    <RadioGroupItem value={opt} id={`eff-${opt}`} className="sr-only peer" />
                    <Label
                      htmlFor={`eff-${opt}`}
                      className="px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-colors peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary hover:bg-muted"
                    >
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {detectedSector && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Secteur detecte : {detectedSector.nom}</span>
                </div>
                <p className="text-xs text-muted-foreground">Confirmez les termes qui correspondent :</p>
                <div className="flex flex-wrap gap-1.5">
                  {detectedSector.vocabulaireConfirmation.map((term) => (
                    <button
                      key={term}
                      onClick={() => setConfirmedTerms((prev) =>
                        prev.includes(term) ? prev.filter((t) => t !== term) : [...prev, term]
                      )}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-200 ${
                        confirmedTerms.includes(term)
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background border-border hover:border-primary/50"
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions — grouped visually by bloc */}
        <div className="space-y-3">
          {QUICK_QUESTIONS.map((q, idx) => {
            const isNewBloc = idx === 0 || QUICK_QUESTIONS[idx - 1].bloc !== q.bloc;
            return (
              <div key={q.id}>
                {isNewBloc && BLOC_LABELS[q.bloc] && (
                  <div className="flex items-center gap-2 mb-2 mt-4 first:mt-0">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2">
                      {BLOC_LABELS[q.bloc]}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
                <Card className={`transition-all duration-200 ${answers[q.id] ? "border-primary/20 bg-primary/[0.02]" : ""}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium transition-colors ${
                        answers[q.id]
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {answers[q.id] ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <Label className="text-sm font-medium leading-relaxed pt-0.5">{q.question}</Label>
                    </div>
                    <div className="ml-9">
                      {q.type === "yesno" && (
                        <div className="flex gap-2">
                          {["Oui", "Non"].map(val => (
                            <button
                              key={val}
                              onClick={() => updateAnswer(q.id, val)}
                              className={`px-4 py-1.5 rounded-lg text-sm border transition-all duration-200 ${
                                answers[q.id] === val
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "bg-background border-border hover:border-primary/50"
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      )}
                      {q.type === "scale" && (
                        <div className="space-y-2">
                          <Slider value={[parseInt(answers[q.id] || "3")]} onValueChange={([v]) => updateAnswer(q.id, String(v))} min={1} max={5} step={1} />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Faible</span>
                            <span className="font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded-full">{answers[q.id] || "3"}/5</span>
                            <span>Excellent</span>
                          </div>
                        </div>
                      )}
                      {q.type === "choice" && q.options && (
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => updateAnswer(q.id, opt)}
                              className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-200 ${
                                answers[q.id] === opt
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "bg-background border-border hover:border-primary/50"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <div className="flex flex-col items-center gap-3 pb-8">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={loading || answered < 5}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white h-12 px-8 shadow-lg shadow-cyan-500/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
            {loading ? "Analyse en cours..." : "Obtenir mes resultats"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {answered < 5 && (
            <p className="text-xs text-muted-foreground">
              Repondez a au moins 5 questions pour lancer l'analyse
            </p>
          )}
          {loading && (
            <div className="w-full max-w-sm space-y-2">
              <Progress value={66} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">Notre IA analyse vos reponses...</p>
            </div>
          )}
        </div>

        {error && (
          <Card className="border-destructive"><CardContent className="p-4 text-destructive text-sm">{error}</CardContent></Card>
        )}
      </div>
      </div>
    </div>
  );
};

export default CartQuickScan;
