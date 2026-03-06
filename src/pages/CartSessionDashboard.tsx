import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCartSessionV2 } from "@/hooks/useCartSessionV2";
import { useCartContext } from "@/contexts/CartSessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertTriangle, ClipboardList, FileText, Brain, Star, Laptop, Loader2, Lock, ShieldCheck,
  Download, ChevronLeft, ChevronRight,
} from "lucide-react";
import { CartQuickwinsTab } from "@/components/cartographie/CartQuickwinsTab";
import { CartPlanActionsTab } from "@/components/cartographie/CartPlanActionsTab";
import { CartRecommandationsTab } from "@/components/cartographie/CartRecommandationsTab";
import { useCartPdfExport } from "@/hooks/useCartPdfExport";

const FREE_TABS = new Set(["overview", "carte", "questionnaire"]);

// Sidebar section definitions
const SECTIONS = [
  { group: "Synthese", items: [
    { id: "overview", label: "Vue d'ensemble", shortLabel: "Resume", icon: BarChart3, free: true },
    { id: "carte", label: "Carte interactive", shortLabel: "Carte", icon: Map, free: true },
    { id: "questionnaire", label: "Questionnaire", shortLabel: "Q&A", icon: FileText, free: true },
  ]},
  { group: "Diagnostic", items: [
    { id: "quickwins", label: "Quick wins", shortLabel: "Wins", icon: Zap, free: false },
    { id: "processus", label: "Processus", shortLabel: "Proc.", icon: Settings, free: false },
    { id: "outils", label: "Outils & SI", shortLabel: "Outils", icon: Layers, free: false },
    { id: "equipes", label: "Equipes", shortLabel: "Equipes", icon: Users, free: false },
    { id: "irritants", label: "Irritants", shortLabel: "Irrit.", icon: AlertTriangle, free: false },
  ]},
  { group: "Actions", items: [
    { id: "plan", label: "Plan d'actions", shortLabel: "Plan", icon: ClipboardList, free: false },
    { id: "recommandations", label: "Recommandations", shortLabel: "Reco.", icon: Laptop, free: false },
    { id: "analyse", label: "Analyse IA", shortLabel: "IA", icon: Brain, free: false },
  ]},
];

interface LockedTabContentProps {
  onUnlock: () => void;
  items?: Array<{ label: string; sub?: string }>;
  count?: number;
  tabLabel?: string;
}

const LockedTabContent = ({ onUnlock, items, count, tabLabel }: LockedTabContentProps) => {
  const teaserItems = items?.slice(0, 3) ?? [];
  const remaining = (count ?? items?.length ?? 0) - teaserItems.length;

  return (
    <div className="relative min-h-[300px]">
      {teaserItems.length > 0 && (
        <div className="space-y-2 mb-2">
          {teaserItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-md border bg-card">
              <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                {item.sub && <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div className="max-w-sm w-full text-center space-y-3 bg-card/95 backdrop-blur-sm rounded-2xl border shadow-xl p-5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto">
              <Lock className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {count && count > 0
                  ? `${count} ${tabLabel || "elements"} detectes`
                  : "Contenu reserve"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {remaining > 0
                  ? `+ ${remaining} autres a decouvrir dans la version complete`
                  : "Debloquez cette section avec la version complete"}
              </p>
            </div>
            <Button onClick={onUnlock} className="w-full h-9 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Voir les formules
            </Button>
          </div>
        </div>
        <div className="filter blur-sm opacity-20 pointer-events-none select-none" aria-hidden="true">
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-md border p-4">
                <div className="h-3.5 w-3/4 bg-muted rounded mb-2" />
                <div className="h-3 w-full bg-muted/60 rounded mb-1.5" />
                <div className="h-3 w-2/3 bg-muted/40 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CartSessionDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSessionPaid, loadSessionTier, isAdmin, ownerId } = useCartContext();
  const { toast } = useToast();
  const isPaid = id ? isSessionPaid(id) : false;

  useEffect(() => { if (id) loadSessionTier(id); }, [id, loadSessionTier]);

  const {
    session, packResumes, processus, outils, equipes, irritants, taches, quickwins,
    totalReponses, loading, error, reload, getPackProgress, getPackResume, getPackStatus, getPackTotalQuestions,
  } = useCartSessionV2(id);

  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [generatingFinal, setGeneratingFinal] = useState(false);
  const [generatingOllama, setGeneratingOllama] = useState(false);
  const [ollamaStep, setOllamaStep] = useState(0);
  const [showGate, setShowGate] = useState(false);
  const [gateTab, setGateTab] = useState<string | undefined>();
  const openGate = (tab?: string) => { setGateTab(tab); setShowGate(true); };
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

  const extractFnError = async (error: any, data: any): Promise<string> => {
    if (data?.error) return data.error;
    if (error?.context?.json) {
      try { const j = await error.context.json(); return j?.error || error.message; } catch {}
    }
    if (error?.context?.text) {
      try { return await error.context.text(); } catch {}
    }
    return error?.message || "Erreur inconnue";
  };

  const handleGenerateFinal = async () => {
    if (!id) return;
    setGeneratingFinal(true);
    try {
      const { data, error } = await supabase.functions.invoke("cart-generate-analysis", {
        body: { sessionId: id },
      });
      if (error) {
        const msg = await extractFnError(error, data);
        throw new Error(msg);
      }
      toast({ title: "Analyse generee", description: "La cartographie complete a ete generee" });
      await reload();
    } catch (e: any) {
      console.error("cart-generate-analysis error:", e);
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
      const { data, error } = await supabase.functions.invoke("cart-analyze-ollama", {
        body: { sessionId: id },
      });
      if (error) {
        const msg = await extractFnError(error, data);
        throw new Error(msg);
      }
      toast({ title: "Analyse approfondie terminee", description: "Les resultats enrichis sont disponibles" });
      await reload();
    } catch (e: any) {
      console.error("cart-analyze-ollama error:", e);
      toast({ title: "Erreur analyse", description: e.message, variant: "destructive" });
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

  const handleSectionClick = (sectionId: string, isFree: boolean) => {
    if (!isFree && !isPaid) {
      openGate(sectionId);
      return;
    }
    setActiveSection(sectionId);
  };

  // Counts for sidebar badges
  const sectionCounts: Record<string, number> = {
    quickwins: quickwins.length,
    processus: processus.length,
    outils: outils.length,
    equipes: equipes.length,
    irritants: irritants.length + taches.length,
  };

  const isAdminViewing = isAdmin && session.owner_id !== ownerId;

  // Average maturity score
  const scores = Object.values(radarScores).filter((v): v is number => v !== null);
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;

  // ========== SIDEBAR COMPONENT ==========
  const Sidebar = () => (
    <aside className={`hidden lg:flex flex-col border-r bg-card/50 transition-all duration-200 ${sidebarCollapsed ? "w-14" : "w-56"}`}>
      {/* Session header */}
      <div className="p-3 border-b">
        {!sidebarCollapsed ? (
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <h2 className="text-xs font-semibold truncate">{session.nom}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${(packsCompleted / 10) * 100}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{packsCompleted}/10</span>
              </div>
              {avgScore && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-muted-foreground">Score moyen</span>
                  <span className={`text-xs font-bold ${parseFloat(avgScore) >= 3.5 ? "text-emerald-600" : parseFloat(avgScore) >= 2.5 ? "text-amber-600" : "text-red-600"}`}>{avgScore}/5</span>
                </div>
              )}
            </div>
            <button onClick={() => setSidebarCollapsed(true)} className="p-1 hover:bg-muted rounded shrink-0 mt-0.5">
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <button onClick={() => setSidebarCollapsed(false)} className="w-full flex justify-center p-1 hover:bg-muted rounded">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {SECTIONS.map((group) => (
          <div key={group.group} className="mb-1">
            {!sidebarCollapsed && (
              <p className="px-3 py-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">{group.group}</p>
            )}
            {group.items.map((item) => {
              const isActive = activeSection === item.id;
              const isLocked = !item.free && !isPaid;
              const count = sectionCounts[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id, item.free)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-colors relative ${
                    isActive
                      ? "bg-cyan-50 text-cyan-700 font-medium border-r-2 border-cyan-500"
                      : isLocked
                      ? "text-muted-foreground/50 hover:bg-muted/50"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-cyan-600" : ""}`} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      <div className="ml-auto flex items-center gap-1">
                        {count !== undefined && count > 0 && !isLocked && (
                          <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 leading-none">{count}</span>
                        )}
                        {isLocked && <Lock className="w-3 h-3 text-muted-foreground/40" />}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar footer: actions */}
      {isFinalGenerated && !sidebarCollapsed && (
        <div className="p-3 border-t space-y-1.5">
          {isPaid && (
            <Button
              size="sm"
              onClick={handleAnalyzeOllama}
              disabled={generatingOllama}
              variant="secondary"
              className="w-full h-8 text-[11px] justify-start"
            >
              {generatingOllama ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Brain className="w-3.5 h-3.5 mr-1.5" />}
              {generatingOllama ? "Analyse..." : "Approfondie"}
            </Button>
          )}
          {isPaid && (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-[11px] justify-start"
              disabled={pdfLoading}
              onClick={() => generatePdf({ session, packResumes, processus, outils, equipes, irritants, taches, quickwins })}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {pdfLoading ? "Export..." : "Export PDF"}
            </Button>
          )}
        </div>
      )}
    </aside>
  );

  // ========== MOBILE NAV ==========
  const MobileNav = () => (
    <div className="lg:hidden overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-none border-b bg-card/50">
      <div className="flex gap-0.5 py-1.5 w-max">
        {SECTIONS.map((group, gi) => (
          <div key={group.group} className="flex items-center gap-0.5">
            {gi > 0 && <div className="w-px h-5 bg-border mx-1 shrink-0" />}
            {group.items.map((item) => {
              const isActive = activeSection === item.id;
              const isLocked = !item.free && !isPaid;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id, item.free)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-cyan-50 text-cyan-700 font-medium"
                      : isLocked
                      ? "text-muted-foreground/50"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.shortLabel}</span>
                  {isLocked && <Lock className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // ========== SECTION CONTENT RENDERERS ==========
  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Layers, label: "Packs completes", value: `${packsCompleted}/10`, color: "text-cyan-600 bg-cyan-500/10" },
          { icon: Network, label: "Objets detectes", value: totalObjects.toString(), color: "text-blue-600 bg-blue-500/10" },
          { icon: Zap, label: "Quick wins", value: quickwins.length.toString(), color: "text-amber-600 bg-amber-500/10" },
          { icon: AlertCircle, label: "Alertes", value: sortedAlerts.length.toString(), color: "text-red-600 bg-red-500/10" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
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
                {isPaid ? (
                  <FormattedText text={session.ai_resume_executif} />
                ) : (
                  <div className="relative">
                    <div className="line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                      <FormattedText text={session.ai_resume_executif} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
                    <Button variant="ghost" size="sm" className="mt-2 text-xs text-cyan-600" onClick={() => openGate()}>
                      <Lock className="w-3 h-3 mr-1" />
                      Lire l'analyse complete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {sortedAlerts.length > 0 && (
            <Card>
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  Alertes prioritaires ({sortedAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {isPaid ? (
                  sortedAlerts.map((alert, i) => (
                    <div key={i} className={`rounded-md border px-3 py-2 text-xs ${alertColor(alert.gravite)}`}>
                      <p className="font-semibold">{alert.titre}</p>
                      {alert.description && <p className="mt-0.5 opacity-80 line-clamp-2">{alert.description}</p>}
                    </div>
                  ))
                ) : (
                  <div className="space-y-2">
                    {sortedAlerts.map((alert, i) => (
                      <div key={i} className={`rounded-md border px-3 py-2 text-xs ${alertColor(alert.gravite)}`}>
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">Alerte {alert.gravite}</p>
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="w-full text-xs text-cyan-600" onClick={() => openGate()}>
                      <Lock className="w-3 h-3 mr-1" />
                      Voir le detail des alertes
                    </Button>
                  </div>
                )}
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
    </div>
  );

  const renderCarte = () => (
    <Card>
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Carte organisation interactive</span>
          <span className="text-xs font-normal text-muted-foreground">
            {processus.length} processus - {outils.length} outils - {equipes.length} equipes - {irritants.length} irritants
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0 relative">
        <OrgMap
          processus={processus}
          outils={outils}
          equipes={equipes}
          irritants={irritants}
          packResumes={packResumes}
          aiCartographyJson={(session as any).ai_cartography_json}
        />
        {!isPaid && (
          <div className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent 30%, hsl(var(--card) / 0.7) 60%, hsl(var(--card) / 0.95) 100%)" }}>
            <div className="pointer-events-auto mb-8 text-center space-y-3 bg-card/95 backdrop-blur-sm rounded-2xl border shadow-xl p-5 max-w-xs">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto">
                <Map className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{totalObjects} objets cartographies</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Debloquez la carte interactive complete avec labels et details
                </p>
              </div>
              <Button onClick={() => openGate()} className="w-full h-9 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white text-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Voir les formules
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderQuestionnaire = () => (
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
  );

  const renderProcessus = () => (
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
  );

  const renderOutils = () => (
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
  );

  const renderEquipes = () => (
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
  );

  const renderIrritants = () => (
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
  );

  const renderAnalyse = () => (
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

      {(session as any).ai_cross_pack_analysis && (
        <Card className="border-purple-200">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              Analyse causale inter-packs
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
  );

  const renderSectionContent = () => {
    // Check premium lock
    if (!FREE_TABS.has(activeSection) && !isPaid) {
      const items: Array<{ label: string; sub?: string }> = [];
      let count = 0;
      let tabLabel = "";

      switch (activeSection) {
        case "quickwins":
          count = quickwins.length; tabLabel = "quick wins";
          items.push(...quickwins.slice(0, 3).map(qw => ({ label: qw.intitule, sub: qw.impact ? `Impact : ${qw.impact}` : undefined })));
          break;
        case "processus":
          count = processus.length; tabLabel = "processus";
          items.push(...processus.slice(0, 3).map(p => ({ label: p.nom, sub: p.type || undefined })));
          break;
        case "outils":
          count = outils.length; tabLabel = "outils";
          items.push(...outils.slice(0, 3).map(o => ({ label: o.nom, sub: o.type_outil || undefined })));
          break;
        case "equipes":
          count = equipes.length; tabLabel = "equipes";
          items.push(...equipes.slice(0, 3).map(e => ({ label: e.nom, sub: e.mission || undefined })));
          break;
        case "irritants":
          count = irritants.length + taches.length; tabLabel = "irritants & taches";
          items.push(...irritants.slice(0, 3).map(i => ({ label: i.intitule, sub: i.type || undefined })));
          break;
        case "plan":
          count = quickwins.length; tabLabel = "actions";
          items.push(...quickwins.slice(0, 2).map(qw => ({ label: qw.intitule, sub: `Priorite : ${qw.priorite || "P2"}` })));
          break;
        case "recommandations": tabLabel = "recommandations"; break;
        case "analyse": tabLabel = "analyses IA"; break;
      }

      return <LockedTabContent onUnlock={() => openGate(activeSection)} items={items} count={count} tabLabel={tabLabel} />;
    }

    switch (activeSection) {
      case "overview": return renderOverview();
      case "carte": return renderCarte();
      case "questionnaire": return renderQuestionnaire();
      case "quickwins": return <CartQuickwinsTab sessionId={id!} quickwins={quickwins} onReload={reload} />;
      case "processus": return renderProcessus();
      case "outils": return renderOutils();
      case "equipes": return renderEquipes();
      case "irritants": return renderIrritants();
      case "plan": return <CartPlanActionsTab sessionId={id!} quickwins={quickwins} aiPlanOptimisation={session.ai_plan_optimisation} onReload={reload} />;
      case "recommandations": return <CartRecommandationsTab outils={outils} aiAnalyseTransversale={session.ai_analyse_transversale} aiPlanOptimisation={session.ai_plan_optimisation} />;
      case "analyse": return renderAnalyse();
      default: return renderOverview();
    }
  };

  // ========== POST-GENERATION LAYOUT (sidebar + content) ==========
  if (isFinalGenerated) {
    return (
      <div className="flex-1 flex flex-col lg:flex-row bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar with actions (mobile + desktop) */}
          <div className="sticky top-12 z-10 border-b bg-card/95 backdrop-blur px-4 sm:px-6 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <Network className="w-3.5 h-3.5 text-cyan-600" />
                </div>
                <div className="min-w-0 lg:hidden">
                  <h1 className="text-sm font-semibold truncate">{session.nom}</h1>
                </div>
                <div className="hidden lg:block">
                  <h1 className="text-sm font-semibold">{SECTIONS.flatMap(g => g.items).find(i => i.id === activeSection)?.label || "Vue d'ensemble"}</h1>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {packsCompleted >= 5 && !isFinalGenerated && (
                  <Button size="sm" onClick={handleGenerateFinal} disabled={generatingFinal} className="h-8 text-xs">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    {generatingFinal ? "..." : "Generer"}
                  </Button>
                )}
                {/* Mobile-only action buttons */}
                <div className="flex lg:hidden items-center gap-1.5">
                  {isPaid && (
                    <Button size="sm" onClick={handleAnalyzeOllama} disabled={generatingOllama} variant="secondary" className="h-8 text-xs">
                      {generatingOllama ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                    </Button>
                  )}
                  {isPaid && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      disabled={pdfLoading}
                      onClick={() => generatePdf({ session, packResumes, processus, outils, equipes, irritants, taches, quickwins })}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                {!isPaid && (
                  <Button size="sm" className="h-8 text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white" onClick={() => openGate()}>
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    <span className="hidden sm:inline">Version complete</span>
                    <span className="sm:hidden">Upgrade</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {isAdminViewing && (
            <div className="px-4 sm:px-6 pt-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Vue admin — Session de <strong>{session.owner_id?.slice(0, 8)}...</strong></span>
              </div>
            </div>
          )}

          {generatingOllama && (
            <div className="px-4 sm:px-6 pt-3">
              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-500 animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-purple-800">Analyse approfondie en cours... 1-2 minutes.</p>
                    <div className="mt-2 w-full bg-purple-200/50 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: "60%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mobile nav */}
          <div className="px-4 sm:px-6 pt-3">
            <MobileNav />
          </div>

          {/* Content area */}
          <div className="flex-1 px-4 sm:px-6 py-4 pb-8">
            {renderSectionContent()}
          </div>
        </div>

        <FreemiumGate
          open={showGate}
          onOpenChange={setShowGate}
          tabName={gateTab}
          sessionId={id}
          stats={{
            processus: processus.length,
            outils: outils.length,
            equipes: equipes.length,
            irritants: irritants.length,
            quickwins: quickwins.length,
            taches: taches.length,
          }}
        />
      </div>
    );
  }

  // ========== PRE-GENERATION: Progressive dashboard ==========
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-12 z-10 border-b bg-card/95 backdrop-blur px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
              <Network className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-semibold truncate">{session.nom}</h1>
              <p className="text-[11px] text-muted-foreground">{packsCompleted}/10 packs</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {packsCompleted >= 5 && (
              <Button size="sm" onClick={handleGenerateFinal} disabled={generatingFinal} className="h-8 text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">{generatingFinal ? "Generation..." : "Generer analyse"}</span>
                <span className="sm:hidden">{generatingFinal ? "..." : "Analyser"}</span>
              </Button>
            )}
          </div>
        </div>
        <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(packsCompleted / 10) * 100}%` }}
          />
        </div>
      </header>

      <main className="p-4 sm:p-6 space-y-6">
        {isAdminViewing && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Vue admin — Session de <strong>{session.owner_id?.slice(0, 8)}...</strong></span>
          </div>
        )}
        {!isPaid && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-cyan-200 bg-cyan-50/60 px-4 py-2.5">
            <p className="text-sm text-cyan-800">
              Version d'essai — certaines fonctionnalites sont limitees
            </p>
            <Button size="sm" variant="outline" className="shrink-0 border-cyan-300 text-cyan-800 hover:bg-cyan-100" onClick={() => openGate()}>
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Version complete
            </Button>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Layers, label: "Packs completes", value: `${packsCompleted}/10`, color: "text-cyan-600 bg-cyan-500/10" },
            { icon: CheckCircle, label: "Questions repondues", value: totalReponses.toString(), color: "text-blue-600 bg-blue-500/10" },
            { icon: Network, label: "Objets detectes", value: totalObjects.toString(), color: "text-emerald-600 bg-emerald-500/10" },
            { icon: Clock, label: "Temps restant", value: estimatedTimeRemaining > 0 ? `~${estimatedTimeRemaining} min` : "Termine", color: "text-amber-600 bg-amber-500/10" },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
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
          <Card className="border-emerald-300 bg-emerald-50/50">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800">Tous les packs sont completes !</p>
                  <p className="text-sm text-emerald-700">Votre diagnostic complet est pret a etre genere.</p>
                </div>
              </div>
              <Button onClick={handleGenerateFinal} disabled={generatingFinal} className="shrink-0 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                {generatingFinal ? "Generation..." : "Generer le diagnostic"}
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
                    Alertes ({sortedAlerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {isPaid ? (
                    sortedAlerts.map((alert, i) => (
                      <div key={i} className={`rounded-md border px-3 py-2 text-xs ${alertColor(alert.gravite)}`}>
                        <p className="font-semibold">{alert.titre}</p>
                        {alert.description && <p className="mt-0.5 opacity-80 line-clamp-2">{alert.description}</p>}
                      </div>
                    ))
                  ) : (
                    sortedAlerts.map((alert, i) => (
                      <div key={i} className={`rounded-md border px-3 py-2 text-xs ${alertColor(alert.gravite)}`}>
                        <p className="font-semibold">Alerte {alert.gravite}</p>
                      </div>
                    ))
                  )}
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
                  {isPaid ? (
                    <>
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
                    </>
                  ) : (
                    <div className="text-center space-y-2 py-2">
                      <p className="text-xs text-muted-foreground">{quickwins.length} quick wins identifies</p>
                      <Button variant="ghost" size="sm" className="text-xs text-cyan-600" onClick={() => openGate()}>
                        <Lock className="w-3 h-3 mr-1" />
                        Debloquer
                      </Button>
                    </div>
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
                {processus.length} processus - {outils.length} outils - {equipes.length} equipes - {irritants.length} irritants
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <OrgMiniMap processus={processus} outils={outils} equipes={equipes} irritants={irritants} />
          </CardContent>
        </Card>
      </main>

      <FreemiumGate open={showGate} onOpenChange={setShowGate} sessionId={id} />
    </div>
  );
};

export default CartSessionDashboard;
