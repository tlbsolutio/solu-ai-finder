import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCartSessionV2 } from "@/hooks/useCartSessionV2";
import { useCartContext } from "@/contexts/CartSessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentLoader } from "@/components/cartographie/ContentLoader";
import { PackCard, PACK_DEFINITIONS } from "@/components/cartographie/PackCard";
import { RadarChart } from "@/components/cartographie/RadarChart";
import { OrgMiniMap } from "@/components/cartographie/OrgMiniMap";
import { OrgMap } from "@/components/cartographie/OrgMap";
import { FormattedText } from "@/components/cartographie/FormattedText";
import { FreemiumGate } from "@/components/cartographie/FreemiumGate";
import { useToast } from "@/hooks/use-toast";
import {
  Network, Sparkles, CheckCircle, AlertCircle,
  Zap, Clock, Layers, Map, BarChart3, Settings, Users,
  AlertTriangle, ClipboardList, FileText, Brain, Star, Laptop,
} from "lucide-react";
import { CartQuickwinsTab } from "@/components/cartographie/CartQuickwinsTab";
import { CartPlanActionsTab } from "@/components/cartographie/CartPlanActionsTab";
import { CartRecommandationsTab } from "@/components/cartographie/CartRecommandationsTab";
import { useCartPdfExport } from "@/hooks/useCartPdfExport";
import { Download } from "lucide-react";

const CartSessionDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isPaid } = useCartContext();
  const { toast } = useToast();

  const {
    session, packResumes, processus, outils, equipes, irritants, taches, quickwins,
    totalReponses, loading, error, reload, getPackProgress, getPackResume, getPackStatus, getPackTotalQuestions,
  } = useCartSessionV2(id);

  const [generatingFinal, setGeneratingFinal] = useState(false);
  const [generatingOllama, setGeneratingOllama] = useState(false);
  const [ollamaStep, setOllamaStep] = useState(0);
  const [showGate, setShowGate] = useState(false);
  const { generatePdf, isLoading: pdfLoading } = useCartPdfExport();

  if (loading) return <ContentLoader />;
  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "Session introuvable"}</p>
          <Button onClick={() => navigate("/cartographie/sessions")}>Retour</Button>
        </div>
      </div>
    );
  }

  const packsCompleted = session.packs_completed || 0;
  const isFinalGenerated = session.final_generation_done;

  const radarScores: Record<number, number | null> = {};
  for (let i = 1; i <= 10; i++) {
    const pr = packResumes.find((r) => r.bloc === i);
    radarScores[i] = pr?.score_maturite ?? null;
  }

  const allAlerts: Array<{ titre: string; description: string; gravite: string }> = [];
  for (const pr of packResumes) {
    if (Array.isArray(pr.alertes)) {
      allAlerts.push(...(pr.alertes as any[]));
    }
  }
  const sortedAlerts = allAlerts
    .sort((a, b) => {
      const order: Record<string, number> = { critique: 0, important: 1, modere: 2 };
      return (order[a.gravite] ?? 3) - (order[b.gravite] ?? 3);
    })
    .slice(0, 5);

  const totalObjects = processus.length + outils.length + equipes.length + irritants.length + taches.length;
  const estimatedTimeRemaining = PACK_DEFINITIONS
    .filter((p) => getPackStatus(p.bloc) !== "done")
    .reduce((acc, p) => acc + p.estimatedMinutes, 0);

  const handleGenerateFinal = async () => {
    if (!id) return;
    setGeneratingFinal(true);
    try {
      const { error } = await supabase.functions.invoke("cart-generate-analysis", {
        body: { sessionId: id },
      });
      if (error) throw error;
      toast({ title: "Analyse generee", description: "La cartographie complete a ete generee" });
      await reload();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setGeneratingFinal(false);
    }
  };

  const handleAnalyzeOllama = async () => {
    if (!id) return;
    setGeneratingOllama(true);
    setOllamaStep(1);
    try {
      const { error } = await supabase.functions.invoke("cart-analyze-ollama", {
        body: { sessionId: id },
      });
      if (error) throw error;
      toast({ title: "Analyse approfondie terminee", description: "Les resultats enrichis sont disponibles" });
      await reload();
    } catch (e: any) {
      toast({ title: "Erreur analyse Ollama", description: e.message, variant: "destructive" });
    } finally {
      setGeneratingOllama(false);
      setOllamaStep(0);
    }
  };

  const alertColor = (gravite: string) => {
    if (gravite === "critique") return "bg-red-100 border-red-300 text-red-800";
    if (gravite === "important") return "bg-orange-100 border-orange-300 text-orange-800";
    return "bg-yellow-50 border-yellow-200 text-yellow-800";
  };

  const Header = () => (
    <header className="sticky top-12 z-10 border-b bg-card/95 backdrop-blur px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
            <Network className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold truncate">{session.nom}</h1>
            <p className="text-[11px] text-muted-foreground">
              {packsCompleted}/10 packs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {packsCompleted >= 5 && !isFinalGenerated && (
            <Button size="sm" onClick={handleGenerateFinal} disabled={generatingFinal} className="h-8 text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">{generatingFinal ? "Generation..." : "Generer analyse"}</span>
              <span className="sm:hidden">{generatingFinal ? "..." : "Analyser"}</span>
            </Button>
          )}
          {isFinalGenerated && (
            <>
              <Button size="sm" onClick={handleGenerateFinal} disabled={generatingFinal} variant="outline" className="h-8 text-xs hidden sm:flex">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Regenerer
              </Button>
              <Button size="sm" onClick={handleAnalyzeOllama} disabled={generatingOllama} variant="secondary" className="h-8 text-xs">
                <Brain className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">{generatingOllama ? `Analyse... (${ollamaStep}/6)` : "Approfondie"}</span>
                <span className="sm:hidden">{generatingOllama ? `${ollamaStep}/6` : "IA"}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={pdfLoading}
                onClick={() => generatePdf({ session, packResumes, processus, outils, equipes, irritants, taches, quickwins })}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline ml-1">{pdfLoading ? "..." : "PDF"}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(packsCompleted / 10) * 100}%` }}
        />
      </div>
    </header>
  );

  // POST-GENERATION: Full tabs mode
  if (isFinalGenerated) {
    return (
      <div className="flex-1 bg-background">
        <Header />

        <div className="px-4 sm:px-6 pt-4">
          <Tabs defaultValue="overview" className="space-y-4">
            <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-none">
              <TabsList className="inline-flex gap-0.5 h-auto bg-muted p-1 w-max">
                <TabsTrigger value="overview" className="text-xs gap-1 shrink-0"><BarChart3 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Vue d'ensemble</span><span className="sm:hidden">Resume</span></TabsTrigger>
                <TabsTrigger value="carte" className="text-xs gap-1 shrink-0"><Map className="w-3.5 h-3.5" />Carte</TabsTrigger>
                <TabsTrigger value="quickwins" className="text-xs gap-1 shrink-0"><Zap className="w-3.5 h-3.5" />Quickwins</TabsTrigger>
                <TabsTrigger value="processus" className="text-xs gap-1 shrink-0"><Settings className="w-3.5 h-3.5" /><span className="hidden sm:inline">Processus</span><span className="sm:hidden">Proc.</span></TabsTrigger>
                <TabsTrigger value="outils" className="text-xs gap-1 shrink-0"><Layers className="w-3.5 h-3.5" />Outils</TabsTrigger>
                <TabsTrigger value="equipes" className="text-xs gap-1 shrink-0"><Users className="w-3.5 h-3.5" />Equipes</TabsTrigger>
                <TabsTrigger value="irritants" className="text-xs gap-1 shrink-0"><AlertTriangle className="w-3.5 h-3.5" /><span className="hidden sm:inline">Irritants</span><span className="sm:hidden">Irrit.</span></TabsTrigger>
                <TabsTrigger value="plan" className="text-xs gap-1 shrink-0"><ClipboardList className="w-3.5 h-3.5" /><span className="hidden sm:inline">Plan d'actions</span><span className="sm:hidden">Plan</span></TabsTrigger>
                <TabsTrigger value="recommandations" className="text-xs gap-1 shrink-0"><Laptop className="w-3.5 h-3.5" /><span className="hidden sm:inline">Recommandations</span><span className="sm:hidden">Reco.</span></TabsTrigger>
                <TabsTrigger value="questionnaire" className="text-xs gap-1 shrink-0"><FileText className="w-3.5 h-3.5" /><span className="hidden sm:inline">Questionnaire</span><span className="sm:hidden">Q&A</span></TabsTrigger>
                <TabsTrigger value="analyse" className="text-xs gap-1 shrink-0"><Brain className="w-3.5 h-3.5" /><span className="hidden sm:inline">Analyse IA</span><span className="sm:hidden">IA</span></TabsTrigger>
              </TabsList>
            </div>

            {/* VUE D'ENSEMBLE */}
            <TabsContent value="overview" className="space-y-4 pb-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Layers, label: "Packs completes", value: `${packsCompleted}/10` },
                  { icon: Network, label: "Objets detectes", value: totalObjects.toString() },
                  { icon: Zap, label: "Quick wins", value: quickwins.length.toString() },
                  { icon: AlertCircle, label: "Alertes", value: sortedAlerts.length.toString() },
                ].map(({ icon: Icon, label, value }) => (
                  <Card key={label}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{label}</p>
                        <p className="text-lg font-bold leading-tight">{value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1">
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-sm">Radar de maturite</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 flex justify-center">
                    <RadarChart scores={radarScores} size={220} />
                  </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                  {session.ai_resume_executif && (
                    <Card>
                      <CardHeader className="pb-2 px-4 pt-4">
                        <CardTitle className="text-sm">Resume executif</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <FormattedText text={session.ai_resume_executif} />
                      </CardContent>
                    </Card>
                  )}

                  {sortedAlerts.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2 px-4 pt-4">
                        <CardTitle className="text-sm flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          Alertes prioritaires
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-2">
                        {sortedAlerts.map((alert, i) => (
                          <div key={i} className={`rounded-md border px-3 py-2 text-xs ${alertColor(alert.gravite)}`}>
                            <p className="font-semibold">{alert.titre}</p>
                            {alert.description && <p className="mt-0.5 opacity-80 line-clamp-2">{alert.description}</p>}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resumes par pack</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PACK_DEFINITIONS.map((packDef) => (
                    <PackCard
                      key={packDef.bloc}
                      sessionId={id!}
                      packDef={packDef}
                      status={getPackStatus(packDef.bloc)}
                      answeredQuestions={getPackProgress(packDef.bloc)}
                      packResume={getPackResume(packDef.bloc)}
                      realTotalQuestions={getPackTotalQuestions(packDef.bloc)}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* CARTE */}
            <TabsContent value="carte" className="pb-8">
              <Card>
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Carte organisation interactive</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {processus.length} processus • {outils.length} outils • {equipes.length} equipes • {irritants.length} irritants
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <OrgMap
                    processus={processus}
                    outils={outils}
                    equipes={equipes}
                    irritants={irritants}
                    packResumes={packResumes}
                    aiCartographyJson={(session as any).ai_cartography_json}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* QUICKWINS */}
            <TabsContent value="quickwins" className="pb-8">
              <CartQuickwinsTab sessionId={id!} quickwins={quickwins} onReload={reload} />
            </TabsContent>

            {/* PROCESSUS */}
            <TabsContent value="processus" className="pb-8">
              <Card>
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm">Processus ({processus.length})</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {processus.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Aucun processus detecte</p>
                  ) : processus.map((p) => (
                    <div key={p.id} className="flex items-start gap-3 p-3 rounded-md bg-blue-50/50 border border-blue-100">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium">{p.nom}</p>
                          {p.type && <Badge variant="outline" className="text-xs">{p.type}</Badge>}
                          {p.niveau_criticite && (
                            <Badge className={`text-xs ${p.niveau_criticite === "High" ? "bg-red-100 text-red-800 border-red-200" : p.niveau_criticite === "Medium" ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-green-100 text-green-800 border-green-200"} border`}>
                              {p.niveau_criticite}
                            </Badge>
                          )}
                        </div>
                        {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* OUTILS */}
            <TabsContent value="outils" className="pb-8">
              <Card>
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm">Outils & SI ({outils.length})</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {outils.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Aucun outil detecte</p>
                  ) : outils.map((o) => (
                    <div key={o.id} className="flex items-start gap-3 p-3 rounded-md bg-green-50/50 border border-green-100">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium">{o.nom}</p>
                          {o.type_outil && <Badge variant="outline" className="text-xs">{o.type_outil}</Badge>}
                          {o.niveau_usage && (
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < (o.niveau_usage || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                              ))}
                            </div>
                          )}
                        </div>
                        {o.problemes && <p className="text-xs text-muted-foreground mt-1">{o.problemes}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* EQUIPES */}
            <TabsContent value="equipes" className="pb-8">
              <Card>
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm">Equipes ({equipes.length})</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {equipes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Aucune equipe detectee</p>
                  ) : equipes.map((e) => (
                    <div key={e.id} className="flex items-start gap-3 p-3 rounded-md bg-orange-50/50 border border-orange-100">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium">{e.nom}</p>
                          {e.charge_estimee && (
                            <Badge variant="outline" className="text-xs">Charge : {e.charge_estimee}/5</Badge>
                          )}
                        </div>
                        {e.mission && <p className="text-xs text-muted-foreground mt-1">{e.mission}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* IRRITANTS */}
            <TabsContent value="irritants" className="pb-8">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-sm">Irritants & Risques ({irritants.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2">
                    {irritants.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">Aucun irritant detecte</p>
                    ) : irritants.map((i) => (
                      <div key={i.id} className="flex items-start gap-3 p-3 rounded-md bg-red-50/50 border border-red-100">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${(i.gravite || 0) >= 4 ? "bg-red-600" : (i.gravite || 0) >= 3 ? "bg-orange-500" : "bg-yellow-400"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium">{i.intitule}</p>
                            {i.type && <Badge variant="outline" className="text-xs">{i.type}</Badge>}
                            {i.gravite && <Badge className="text-xs bg-red-100 text-red-800 border border-red-200">Gravite {i.gravite}/5</Badge>}
                          </div>
                          {i.impact && <p className="text-xs text-muted-foreground mt-1">Impact : {i.impact}</p>}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {taches.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2 px-4 pt-4">
                      <CardTitle className="text-sm">Taches manuelles ({taches.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-2">
                      {taches.map((t) => (
                        <div key={t.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/30 border">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium">{t.nom}</p>
                              {t.frequence && <Badge variant="outline" className="text-xs">{t.frequence}</Badge>}
                              {t.double_saisie && <Badge className="text-xs bg-orange-100 text-orange-800 border border-orange-200">Double saisie</Badge>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* PLAN D'ACTIONS */}
            <TabsContent value="plan" className="pb-8">
              <CartPlanActionsTab
                sessionId={id!}
                quickwins={quickwins}
                aiPlanOptimisation={session.ai_plan_optimisation}
                onReload={reload}
              />
            </TabsContent>

            {/* RECOMMANDATIONS */}
            <TabsContent value="recommandations" className="pb-8">
              <CartRecommandationsTab
                outils={outils}
                aiAnalyseTransversale={session.ai_analyse_transversale}
                aiPlanOptimisation={session.ai_plan_optimisation}
              />
            </TabsContent>

            {/* QUESTIONNAIRE */}
            <TabsContent value="questionnaire" className="pb-8">
              <div className="space-y-3">
                {packResumes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucun pack complete</p>
                ) : PACK_DEFINITIONS.map((packDef) => {
                  const pr = packResumes.find((r) => r.bloc === packDef.bloc);
                  if (!pr) return null;
                  return (
                    <Card key={packDef.bloc}>
                      <CardHeader className="pb-2 px-4 pt-4">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span>{packDef.icon}</span>
                          <span>Pack {packDef.bloc} — {packDef.title}</span>
                          <div className="flex gap-0.5 ml-auto">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < (pr.score_maturite || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                            ))}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground">{pr.resume}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigate(`/cartographie/sessions/${id}/pack/${packDef.bloc}/results`)}
                        >
                          Voir details
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ANALYSE IA */}
            <TabsContent value="analyse" className="pb-8">
              <div className="space-y-4">
                {[
                  { key: "ai_resume_executif", label: "Resume executif" },
                  { key: "ai_forces", label: "Forces identifiees" },
                  { key: "ai_dysfonctionnements", label: "Dysfonctionnements" },
                  { key: "ai_analyse_transversale", label: "Analyse transversale" },
                  { key: "ai_plan_optimisation", label: "Plan d'optimisation" },
                  { key: "ai_vision_cible", label: "Vision cible" },
                ].map(({ key, label }) => {
                  const content = (session as any)[key];
                  if (!content) return null;
                  return (
                    <Card key={key}>
                      <CardHeader className="pb-2 px-4 pt-4">
                        <CardTitle className="text-sm">{label}</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <FormattedText text={typeof content === "string" ? content : JSON.stringify(content, null, 2)} />
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Enriched Ollama analysis */}
                {(session as any).ai_cross_pack_analysis && (
                  <Card className="border-purple-200">
                    <CardHeader className="pb-2 px-4 pt-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        Analyse causale inter-packs (Ollama)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <FormattedText text={typeof (session as any).ai_cross_pack_analysis === "string"
                        ? (session as any).ai_cross_pack_analysis
                        : JSON.stringify((session as any).ai_cross_pack_analysis, null, 2)} />
                    </CardContent>
                  </Card>
                )}

                {(session as any).ai_impact_quantification && (
                  <Card className="border-green-200">
                    <CardHeader className="pb-2 px-4 pt-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-green-500" />
                        Quantification d'impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <FormattedText text={typeof (session as any).ai_impact_quantification === "string"
                        ? (session as any).ai_impact_quantification
                        : JSON.stringify((session as any).ai_impact_quantification, null, 2)} />
                    </CardContent>
                  </Card>
                )}

                {(session as any).ai_target_vision && (
                  <Card className="border-blue-200">
                    <CardHeader className="pb-2 px-4 pt-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        Vision cible 18 mois
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <FormattedText text={typeof (session as any).ai_target_vision === "string"
                        ? (session as any).ai_target_vision
                        : JSON.stringify((session as any).ai_target_vision, null, 2)} />
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <FreemiumGate open={showGate} onOpenChange={setShowGate} />
      </div>
    );
  }

  // PRE-GENERATION: Progressive dashboard
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Layers, label: "Packs completes", value: `${packsCompleted}/10` },
            { icon: CheckCircle, label: "Questions repondues", value: totalReponses.toString() },
            { icon: Network, label: "Objets detectes", value: totalObjects.toString() },
            { icon: Clock, label: "Temps restant estime", value: estimatedTimeRemaining > 0 ? `~${estimatedTimeRemaining} min` : "Termine" },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{label}</p>
                  <p className="text-lg font-bold leading-tight">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {packsCompleted === 10 && (
          <Card className="border-green-300 bg-green-50/50">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Tous les packs sont completes !</p>
                  <p className="text-sm text-green-700">Votre cartographie complete est prete a etre generee.</p>
                </div>
              </div>
              <Button onClick={handleGenerateFinal} disabled={generatingFinal} className="shrink-0">
                <Sparkles className="w-4 h-4 mr-2" />
                {generatingFinal ? "Generation..." : "Generer la cartographie"}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Packs thematiques
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PACK_DEFINITIONS.map((packDef) => (
                <PackCard
                  key={packDef.bloc}
                  sessionId={id!}
                  packDef={packDef}
                  status={getPackStatus(packDef.bloc)}
                  answeredQuestions={getPackProgress(packDef.bloc)}
                  packResume={getPackResume(packDef.bloc)}
                  realTotalQuestions={getPackTotalQuestions(packDef.bloc)}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm">Radar de maturite</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 flex justify-center">
                <RadarChart scores={radarScores} size={200} />
              </CardContent>
            </Card>

            {sortedAlerts.length > 0 && (
              <Card>
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    Alertes detectees
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {sortedAlerts.map((alert, i) => (
                    <div key={i} className={`rounded-md border px-3 py-2 text-xs ${alertColor(alert.gravite)}`}>
                      <p className="font-semibold">{alert.titre}</p>
                      {alert.description && (
                        <p className="mt-0.5 opacity-80 line-clamp-2">{alert.description}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {quickwins.length > 0 && (
              <Card>
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Quick wins ({quickwins.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-1.5">
                  {quickwins.slice(0, 4).map((qw) => (
                    <div key={qw.id} className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        qw.impact === "Fort" ? "bg-green-500" : qw.impact === "Moyen" ? "bg-yellow-500" : "bg-gray-400"
                      }`} />
                      <p className="text-xs truncate">{qw.intitule}</p>
                    </div>
                  ))}
                  {quickwins.length > 4 && (
                    <p className="text-xs text-muted-foreground text-center">+{quickwins.length - 4} autres</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Mini-map organisation</span>
              <span className="text-xs font-normal text-muted-foreground">
                {processus.length} processus • {outils.length} outils • {equipes.length} equipes • {irritants.length} irritants
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <OrgMiniMap processus={processus} outils={outils} equipes={equipes} irritants={irritants} />
          </CardContent>
        </Card>
      </main>

      <FreemiumGate open={showGate} onOpenChange={setShowGate} />
    </div>
  );
};

export default CartSessionDashboard;
