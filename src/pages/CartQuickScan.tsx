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
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Lock, Network, CheckCircle2, BarChart3 } from "lucide-react";

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

  if (step === "results" && result) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-3xl space-y-6 animate-fade-in-up">
          {/* Results header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setStep("form")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Resultats du scan rapide</h1>
              <p className="text-sm text-muted-foreground">Apercu de votre maturite organisationnelle</p>
            </div>
          </div>

          {/* Radar */}
          <Card className="overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/50" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Radar de maturite (estime)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <MiniRadarChart scores={result.scores} size={240} />
            </CardContent>
          </Card>

          {/* Resume */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Resume</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed text-foreground/80">{result.resume}</p></CardContent>
          </Card>

          {/* Dysfonctionnements */}
          {result.dysfonctionnements.length > 0 && (
            <Card className="border-red-200/50">
              <CardHeader className="pb-2"><CardTitle className="text-base">Dysfonctionnements detectes</CardTitle></CardHeader>
              <CardContent className="space-y-2.5">
                {result.dysfonctionnements.map((d, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <p className="text-sm text-foreground/80">{d}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick wins */}
          {result.quick_wins.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                Quick wins
              </h3>
              {result.quick_wins.map((qw, i) => (
                <QuickWinCard key={i} action={qw.action} impact={qw.impact} effort={qw.effort} categorie={qw.categorie} />
              ))}
            </div>
          )}

          {/* Teasing: Locked previews */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              Disponible avec la cartographie complete
            </h3>
            {[
              { title: "Analyse causale inter-packs", preview: "Les dysfonctionnements RH impactent directement la productivite operationnelle. La cause racine identifiee remonte a un deficit de gouvernance sur les processus de decision..." },
              { title: "Plan d'actions priorise (P1/P2/P3)", preview: "P1 — Mettre en place un outil de gestion de projet centralise (impact: eleve, effort: moyen). P2 — Former les managers aux rituels d'equipe agiles..." },
              { title: "Estimation d'impact financier", preview: "Gain potentiel estime : 45 000 a 78 000 EUR/an. Principaux leviers : reduction des taches manuelles (-30%), amelioration du taux de conversion (+15%)..." },
            ].map(({ title, preview }) => (
              <Card key={title} className="border-muted relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground blur-[5px] select-none" aria-hidden="true">
                    {preview}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Scan gratuit vs Cartographie complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2.5 pr-4 font-medium text-muted-foreground">Fonctionnalite</th>
                      <th className="text-center py-2.5 px-3 font-medium text-muted-foreground">Gratuit</th>
                      <th className="text-center py-2.5 px-3 font-medium text-primary">Complete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      ["Questions", "12 rapides", "150 approfondies"],
                      ["Radar maturite", "Estime", "Precis par pack"],
                      ["Analyse IA", "Resume global", "Par pack + causale"],
                      ["Quick wins", "3-5", "Kanban complet"],
                      ["Carte interactive", "—", "\u2713"],
                      ["Plan d'actions priorise", "—", "\u2713"],
                      ["Export PDF", "—", "\u2713"],
                    ].map(([feature, free, paid]) => (
                      <tr key={feature} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 pr-4 text-foreground/80">{feature}</td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground">{free}</td>
                        <td className="py-2.5 px-3 text-center font-medium text-primary">{paid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* CTA Conversion */}
          <Card className="overflow-hidden border-0 shadow-lg" style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.02) 100%)',
          }}>
            <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/50" />
            <CardContent className="p-6 sm:p-8 text-center space-y-4">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                Offre de lancement
              </Badge>
              <h3 className="text-lg font-bold">Passez a la cartographie complete</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                150 questions, analyse IA approfondie, carte interactive, plan d'actions priorise et export PDF professionnel.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white h-11"
                  onClick={() => window.open("https://pay.revolut.com/payment-link/solutio-cartographie", "_blank")}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Debloquer la version complete
                </Button>
                <Link to="/cartographie/login">
                  <Button variant="outline" className="h-11 w-full sm:w-auto">
                    <Network className="w-4 h-4 mr-2" />
                    Se connecter
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                Vos reponses au scan seront conservees pour enrichir votre cartographie.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/cartographie">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Scan rapide</h1>
            <p className="text-sm text-muted-foreground">Apercu de la maturite de votre organisation en 3 minutes</p>
          </div>
        </div>

        {/* Progress */}
        <Card className="overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/50" style={{ width: `${progress}%`, transition: 'width 0.3s ease' }} />
          <CardContent className="p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">{answered}/{QUICK_QUESTIONS.length} questions</span>
              <Badge variant="secondary" className="font-mono">{progress}%</Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Sector Detection */}
        <Card className="border-primary/20">
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

        {/* Questions */}
        <div className="space-y-3">
          {QUICK_QUESTIONS.map((q, idx) => (
            <Card key={q.id} className={`transition-all duration-200 ${answers[q.id] ? "border-primary/20 bg-primary/[0.02]" : ""}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium transition-colors ${
                    answers[q.id]
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {idx + 1}
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
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-center pb-8">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={loading || answered < 5}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white h-12 px-8"
          >
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
            {loading ? "Analyse en cours..." : "Obtenir mes resultats"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {error && (
          <Card className="border-destructive"><CardContent className="p-4 text-destructive text-sm">{error}</CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default CartQuickScan;
