import { useState, useEffect, useMemo } from "react";
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
import { OnboardingTour } from "@/components/cartographie/OnboardingTour";
import { useToast } from "@/hooks/use-toast";
import {
  Network, Sparkles, CheckCircle, AlertCircle,
  Zap, Clock, Layers, Map, BarChart3, Settings, Users,
  AlertTriangle, ClipboardList, FileText, Brain, Star, Laptop, Loader2, Lock, ShieldCheck,
  Download, ChevronLeft, ChevronRight, TrendingUp, Target, ArrowRight, Play, Info, Share2, Copy, Check, RefreshCw,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CartQuickwinsTab } from "@/components/cartographie/CartQuickwinsTab";
import { CartPlanActionsTab } from "@/components/cartographie/CartPlanActionsTab";
import { CartRecommandationsTab } from "@/components/cartographie/CartRecommandationsTab";
import { AIContentBoundary } from "@/components/cartographie/AIContentBoundary";
import { CartEntityValidation } from "@/components/cartographie/CartEntityValidation";
import { CartProcessusSection } from "@/components/cartographie/CartProcessusSection";
import { CartOutilsSection } from "@/components/cartographie/CartOutilsSection";
import { CartEquipesSection } from "@/components/cartographie/CartEquipesSection";
import { CartIrritantsSection } from "@/components/cartographie/CartIrritantsSection";
import { CartAnalyseSection } from "@/components/cartographie/CartAnalyseSection";
import { CartSectionHeader } from "@/components/cartographie/CartSectionHeader";
import { CartEmptyState } from "@/components/cartographie/CartEmptyState";
import { useCartPdfExport } from "@/hooks/useCartPdfExport";
import type { CartProcessusV2, CartOutilV2, CartEquipeV2 } from "@/lib/cartTypes";

const FREE_TABS = new Set(["overview", "carte", "questionnaire"]);

// Sidebar section definitions
const SECTIONS = [
  { group: "Synthese", items: [
    { id: "overview", label: "Vue d'ensemble", shortLabel: "Resume", icon: BarChart3, free: true },
    { id: "carte", label: "Carte interactive", shortLabel: "Carte", icon: Map, free: true },
    { id: "questionnaire", label: "Questionnaire", shortLabel: "Q&A", icon: FileText, free: true },
  ]},
  { group: "Diagnostic", items: [
    { id: "entities", label: "Entites", shortLabel: "Entites", icon: ShieldCheck, free: false },
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
  const { isSessionPaid, loadSessionTier, isAdmin, ownerId, userEmail } = useCartContext();
  const { toast } = useToast();
  const isPaid = id ? isSessionPaid(id) : false;

  useEffect(() => { if (id) loadSessionTier(id); }, [id, loadSessionTier]);

  const {
    session, packResumes, processus, outils, equipes, irritants, taches, quickwins,
    totalReponses, loading, error, partialErrors, reload, getPackProgress, getPackResume, getPackStatus, getPackTotalQuestions,
  } = useCartSessionV2(id);

  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [generatingFinal, setGeneratingFinal] = useState(false);
  const [extractingEntities, setExtractingEntities] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [gateTab, setGateTab] = useState<string | undefined>();
  const [shareCopied, setShareCopied] = useState(false);
  const [lastError, setLastError] = useState<{ action: "generate" | "extract"; message: string } | null>(null);
  const openGate = (tab?: string) => { setGateTab(tab); setShowGate(true); };
  const { generatePdf, generateBrief, generateTeaser, isLoading: pdfLoading, progress: pdfProgress } = useCartPdfExport();

  // Progress-triggered freemium nudge at 3 packs
  const packsCompletedEarly = session?.packs_completed || 0;
  useEffect(() => {
    if (!isPaid && packsCompletedEarly >= 3 && id) {
      const key = `carto_freemium_nudge_${id}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        setTimeout(() => openGate("progress"), 1500);
      }
    }
  }, [isPaid, packsCompletedEarly, id]);

  if (loading) return <ContentLoader />;
  if (error || !session) {
    const isForbidden = error?.toLowerCase().includes("forbidden") || error?.toLowerCase().includes("permission");
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in-up">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{isForbidden ? "Acces refuse" : "Session introuvable"}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isForbidden
                ? "Vous n'avez pas acces a cette session. Verifiez que vous etes connecte avec le bon compte."
                : error || "Cette session n'existe pas ou a ete supprimee."}
            </p>
          </div>
          <Button onClick={() => navigate("/cartographie/sessions")} className="w-full">
            Retour a mes diagnostics
          </Button>
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

  // Merge DB entities with AI-extracted entities for display (mini map, carte, counts)
  // Before final analysis, DB tables are empty — use ai_extracted_entities instead
  const extracted = session.ai_extracted_entities;
  const mapProcessus = processus.length > 0 ? processus :
    (extracted?.processus || []).filter((p: any) => p?.id && p?.nom).map((p: any) => ({ id: p.id, session_id: id!, nom: p.nom, description: p.description || "", type: "Metier", niveau_criticite: "Medium", ai_generated: true } as CartProcessusV2));
  const mapOutils = outils.length > 0 ? outils :
    (extracted?.outils || []).filter((o: any) => o?.id && o?.nom).map((o: any) => ({ id: o.id, session_id: id!, nom: o.nom, type_outil: o.categorie || "Autre", niveau_usage: 3, problemes: o.description || "", ai_generated: true } as CartOutilV2));
  const mapEquipes = equipes.length > 0 ? equipes :
    (extracted?.equipes || []).filter((e: any) => e?.id && e?.nom).map((e: any) => ({ id: e.id, session_id: id!, nom: e.nom, mission: e.description || "", charge_estimee: 3, ai_generated: true } as CartEquipeV2));

  const totalObjects = mapProcessus.length + mapOutils.length + mapEquipes.length + irritants.length + taches.length;
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
    if (packsCompleted < 5) {
      toast({ title: "Packs insuffisants", description: `Completez au moins 5 packs avant de generer l'analyse (${packsCompleted}/5 actuellement)`, variant: "destructive" });
      return;
    }
    setGeneratingFinal(true);
    setLastError(null);
    try {
      const { data, error } = await supabase.functions.invoke("cart-generate-analysis", {
        body: { sessionId: id },
      });
      if (error) {
        const msg = await extractFnError(error, data);
        throw new Error(msg);
      }
      toast({ title: "Analyse generee", description: "La cartographie complete a ete generee" });
      // Fire and forget email notification
      if (userEmail) {
        supabase.functions.invoke("send-diagnostic-email", {
          body: {
            email: userEmail,
            type: "analysis_complete",
            sessionName: session.nom,
            sessionUrl: `${window.location.origin}/cartographie/sessions/${id}`,
          },
        }).catch(() => {}); // silent fail
      }
      await reload();
    } catch (e: any) {
      console.error("cart-generate-analysis error:", e);
      setLastError({ action: "generate", message: e.message });
      toast({
        title: "Erreur de generation",
        description: (
          <div className="space-y-2">
            <p>{e.message}</p>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleGenerateFinal}>
              <RefreshCw className="w-3 h-3 mr-1" /> Reessayer
            </Button>
          </div>
        ),
        variant: "destructive",
      });
    } finally {
      setGeneratingFinal(false);
    }
  };

  const handleExtractEntities = async () => {
    if (!id) return;
    setExtractingEntities(true);
    setLastError(null);
    try {
      const { data, error } = await supabase.functions.invoke("cart-extract-entities", {
        body: { session_id: id },
      });
      if (error) {
        const msg = await extractFnError(error, data);
        throw new Error(msg);
      }
      toast({ title: "Entites extraites", description: `${data.stats?.equipes || 0} equipes, ${data.stats?.processus || 0} processus, ${data.stats?.outils || 0} outils` });
      await reload();
    } catch (e: any) {
      setLastError({ action: "extract", message: e.message });
      toast({
        title: "Erreur d'extraction",
        description: (
          <div className="space-y-2">
            <p>{e.message}</p>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleExtractEntities}>
              <RefreshCw className="w-3 h-3 mr-1" /> Reessayer
            </Button>
          </div>
        ),
        variant: "destructive",
      });
    } finally {
      setExtractingEntities(false);
    }
  };

  const handleValidateAndGenerate = async () => {
    if (!id) return;
    setGeneratingFinal(true);
    setLastError(null);
    try {
      const { data, error } = await supabase.functions.invoke("cart-generate-analysis", {
        body: { sessionId: id },
      });
      if (error) {
        const msg = await extractFnError(error, data);
        throw new Error(msg);
      }
      toast({ title: "Analyse generee", description: "La cartographie complete a ete generee" });
      // Fire and forget email notification
      if (userEmail) {
        supabase.functions.invoke("send-diagnostic-email", {
          body: {
            email: userEmail,
            type: "analysis_complete",
            sessionName: session.nom,
            sessionUrl: `${window.location.origin}/cartographie/sessions/${id}`,
          },
        }).catch(() => {}); // silent fail
      }
      await reload();
    } catch (e: any) {
      setLastError({ action: "generate", message: e.message });
      toast({
        title: "Erreur de generation",
        description: (
          <div className="space-y-2">
            <p>{e.message}</p>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleValidateAndGenerate}>
              <RefreshCw className="w-3 h-3 mr-1" /> Reessayer
            </Button>
          </div>
        ),
        variant: "destructive",
      });
    } finally {
      setGeneratingFinal(false);
    }
  };

  const handleShare = async () => {
    if (!id) return;
    try {
      let token = session.share_token;
      if (!token) {
        token = crypto.randomUUID();
        const { error } = await supabase.from("cart_sessions").update({
          share_token: token,
          share_enabled: true,
        }).eq("id", id);
        if (error) throw error;
      } else if (!session.share_enabled) {
        const { error } = await supabase.from("cart_sessions").update({ share_enabled: true }).eq("id", id);
        if (error) throw error;
      }
      const shareUrl = `${window.location.origin}/cartographie/sessions/${id}?share=${token}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
      toast({ title: "Lien copie", description: "Le lien de partage en lecture seule a ete copie" });
      await reload();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleDisableShare = async () => {
    if (!id) return;
    try {
      const { error } = await supabase.from("cart_sessions").update({ share_enabled: false }).eq("id", id);
      if (error) throw error;
      toast({ title: "Partage desactive" });
      await reload();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
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
  const entityCount = (extracted?.equipes?.length || 0) + (extracted?.processus?.length || 0) + (extracted?.outils?.length || 0);
  const sectionCounts: Record<string, number> = {
    entities: entityCount,
    quickwins: quickwins.length,
    processus: processus.length,
    outils: outils.length,
    equipes: equipes.length,
    irritants: irritants.length + taches.length,
  };

  // Section completion indicators
  const sectionCompleted: Record<string, boolean> = {
    overview: packsCompleted >= 1,
    carte: mapProcessus.length > 0 || mapOutils.length > 0,
    questionnaire: packResumes.length > 0,
    entities: session.entities_extraction_status === "validated",
    quickwins: quickwins.length > 0,
    processus: processus.length > 0,
    outils: outils.length > 0,
    equipes: equipes.length > 0,
    irritants: irritants.length > 0 || taches.length > 0,
    plan: !!(session.ai_plan_optimisation),
    recommandations: !!(session.ai_analyse_transversale),
    analyse: !!(session.ai_resume_executif),
  };

  const isAdminViewing = isAdmin && session.owner_id !== ownerId;

  // Average maturity score
  const scores = Object.values(radarScores).filter((v): v is number => v !== null);
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;

  // ========== SIDEBAR (memoized) ==========
  const sidebar = useMemo(() => (
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
            <button onClick={() => setSidebarCollapsed(true)} className="p-1 hover:bg-muted rounded shrink-0 mt-0.5" aria-label="Reduire le menu">
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <button onClick={() => setSidebarCollapsed(false)} className="w-full flex justify-center p-1 hover:bg-muted rounded" aria-label="Agrandir le menu">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {SECTIONS.map((group, gi) => (
          <div key={group.group} className={gi > 0 ? "mt-2" : ""}>
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2 px-3 py-1.5 mb-0.5">
                <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">{group.group}</p>
                <div className="flex-1 h-px bg-border/60" />
              </div>
            ) : (
              <div className="mx-2 my-1.5 h-px bg-border/60" />
            )}
            {group.items.map((item) => {
              const isActive = activeSection === item.id;
              const isLocked = !item.free && !isPaid;
              const count = sectionCounts[item.id];
              const isComplete = sectionCompleted[item.id];
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
                  <div className="relative shrink-0">
                    <item.icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-600" : ""}`} />
                    {isComplete && !isLocked && !sidebarCollapsed && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-card shadow-sm" />
                    )}
                    {isComplete && !isLocked && sidebarCollapsed && (
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      <div className="ml-auto flex items-center gap-1">
                        {count !== undefined && count > 0 && !isLocked && (
                          <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 leading-none" aria-label={`${count} ${item.label}`}>{count}</span>
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
      {isFinalGenerated && !sidebarCollapsed && isPaid && (
        <div className="p-3 border-t space-y-1.5">
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-[11px] justify-start"
            disabled={pdfLoading}
            onClick={() => generatePdf({ session, packResumes, processus, outils, equipes, irritants, taches, quickwins })}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {pdfLoading ? (pdfProgress || "Export...") : "Rapport complet PDF"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full h-7 text-[11px] justify-start text-muted-foreground"
            disabled={pdfLoading}
            onClick={() => generateBrief({ session, packResumes, processus, outils, equipes, irritants, taches, quickwins })}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Brief executif (1 page)
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full h-7 text-[11px] justify-start text-muted-foreground"
            onClick={handleShare}
          >
            {shareCopied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 mr-1.5" />}
            {shareCopied ? "Lien copie !" : session.share_enabled ? "Copier le lien" : "Partager (lecture seule)"}
          </Button>
          {session.share_enabled && (
            <button onClick={handleDisableShare} className="w-full text-[10px] text-muted-foreground/60 hover:text-red-500 text-left px-2 transition-colors">
              Desactiver le partage
            </button>
          )}
        </div>
      )}
      {isFinalGenerated && !sidebarCollapsed && !isPaid && (
        <div className="p-3 border-t space-y-1.5">
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-[11px] justify-start"
            disabled={pdfLoading}
            onClick={() => {
              generateTeaser({ session, packResumes, processus, outils, equipes, irritants, taches, quickwins });
              toast({ title: "Apercu gratuit genere", description: "Passez en premium pour le rapport complet" });
            }}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {pdfLoading ? (pdfProgress || "Export...") : "Apercu PDF gratuit"}
          </Button>
        </div>
      )}
    </aside>
  ), [sidebarCollapsed, session.nom, session.share_enabled, packsCompleted, avgScore, activeSection, isPaid, sectionCounts, sectionCompleted, isFinalGenerated, pdfLoading, pdfProgress, shareCopied, handleSectionClick, handleShare, handleDisableShare, generatePdf, generateBrief, generateTeaser, session, packResumes, processus, outils, equipes, irritants, taches, quickwins]);

  // ========== MOBILE NAV (memoized) ==========
  const mobileNav = useMemo(() => (
    <div className="lg:hidden overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-none border-b bg-card/50">
      <div className="flex gap-0.5 py-1.5 w-max">
        {SECTIONS.map((group, gi) => (
          <div key={group.group} className="flex items-center gap-0.5">
            {gi > 0 && (
              <div className="flex items-center gap-1 mx-1.5 shrink-0">
                <div className="w-px h-5 bg-border" />
                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-wider">{group.group}</span>
                <div className="w-px h-5 bg-border" />
              </div>
            )}
            {group.items.map((item) => {
              const isActive = activeSection === item.id;
              const isLocked = !item.free && !isPaid;
              const count = sectionCounts[item.id];
              return (
                <button
                  key={item.id}
                  ref={isActive ? (el) => el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }) : undefined}
                  onClick={() => handleSectionClick(item.id, item.free)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-cyan-50 text-cyan-700 font-medium shadow-sm"
                      : isLocked
                      ? "text-muted-foreground/50"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.shortLabel}</span>
                  {!isLocked && count !== undefined && count > 0 && (
                    <span className="text-[9px] bg-muted rounded-full px-1 py-0.5 leading-none" aria-label={`${count} elements`}>{count}</span>
                  )}
                  {isLocked && <Lock className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  ), [activeSection, isPaid, sectionCounts, handleSectionClick]);

  // ========== SECTION CONTENT RENDERERS ==========
  const scoreColor = (score: number) => {
    if (score < 2) return "text-red-600";
    if (score < 3) return "text-orange-500";
    if (score < 4) return "text-amber-500";
    return "text-emerald-600";
  };
  const scoreBg = (score: number) => {
    if (score < 2) return "from-red-500/10 to-red-500/5 border-red-200";
    if (score < 3) return "from-orange-500/10 to-orange-500/5 border-orange-200";
    if (score < 4) return "from-amber-500/10 to-amber-500/5 border-amber-200";
    return "from-emerald-500/10 to-emerald-500/5 border-emerald-200";
  };

  const whatsNextBanner = useMemo(() => {
    if (!isFinalGenerated) return null;
    const steps = [
      { done: quickwins.filter(q => q.statut === "fait").length > 0, label: "Realisez vos premiers quick wins", section: "quickwins" as string | null },
      { done: !!session.ai_plan_optimisation, label: "Consultez le plan d'actions", section: "plan" as string | null },
      { done: false, label: "Exportez le rapport PDF", section: null as string | null },
    ];
    const nextStep = steps.find(s => !s.done);
    if (!nextStep) return null;
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-cyan-50/60 px-4 py-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
          <Target className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-emerald-800">Prochaine etape recommandee</p>
          <p className="text-sm text-emerald-700 font-semibold">{nextStep.label}</p>
        </div>
        {nextStep.section && (
          <Button size="sm" variant="outline" className="shrink-0 h-8 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100" onClick={() => setActiveSection(nextStep.section!)}>
            <ArrowRight className="w-3.5 h-3.5 mr-1" /> Voir
          </Button>
        )}
        {!nextStep.section && isPaid && (
          <Button size="sm" variant="outline" className="shrink-0 h-8 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            disabled={pdfLoading}
            onClick={() => generatePdf({ session, packResumes, processus, outils, equipes, irritants, taches, quickwins })}
          >
            <Download className="w-3.5 h-3.5 mr-1" /> PDF
          </Button>
        )}
        {!nextStep.section && !isPaid && (
          <Button size="sm" variant="outline" className="shrink-0 h-8 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            disabled={pdfLoading}
            onClick={() => {
              generateTeaser({ session, packResumes, processus, outils, equipes, irritants, taches, quickwins });
              toast({ title: "Apercu gratuit genere", description: "Passez en premium pour le rapport complet" });
            }}
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Apercu PDF
          </Button>
        )}
      </div>
    );
  }, [isFinalGenerated, quickwins, session.ai_plan_optimisation, isPaid, pdfLoading, generatePdf, generateTeaser, session, packResumes, processus, outils, equipes, irritants, taches]);

  const renderOverview = () => (
    <div className="space-y-5">
      {/* First-time user CTA */}
      {packsCompleted === 0 && (
        <div className="rounded-xl border-2 border-dashed border-cyan-300 bg-gradient-to-br from-cyan-50/60 to-blue-50/40 p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center mx-auto">
            <Play className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="font-semibold">Commencez votre diagnostic</h3>
            <p className="text-sm text-muted-foreground mt-1">Completez votre premier pack thematique (~5 min) pour voir apparaitre vos premiers resultats</p>
          </div>
          <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white" onClick={() => setActiveSection("questionnaire")}>
            <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
            Demarrer le Pack 1
          </Button>
        </div>
      )}

      {/* What's Next guidance */}
      {whatsNextBanner}

      {/* Quick Stats Banner */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border text-sm">
        <div className="flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-semibold">{processus.length}</span>
          <span className="text-muted-foreground text-xs">processus detectes</span>
        </div>
        <div className="w-px h-4 bg-border hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-semibold">{outils.length}</span>
          <span className="text-muted-foreground text-xs">outils recenses</span>
        </div>
        <div className="w-px h-4 bg-border hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          <span className="font-semibold">{irritants.length}</span>
          <span className="text-muted-foreground text-xs">irritants identifies</span>
        </div>
        <div className="w-px h-4 bg-border hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-semibold">{quickwins.length}</span>
          <span className="text-muted-foreground text-xs">quick wins disponibles</span>
        </div>
      </div>

      {/* Score Global + Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {/* Score Global de Maturite - Prominent Card */}
        <Card className={`sm:col-span-2 bg-gradient-to-br ${avgScore ? scoreBg(parseFloat(avgScore)) : "from-slate-50 to-slate-100/50 border-slate-200"} overflow-hidden`}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="relative">
              {/* Circular progress ring */}
              <svg width="72" height="72" viewBox="0 0 72 72" className="transform -rotate-90">
                <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
                <circle
                  cx="36" cy="36" r="30" fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className={avgScore ? scoreColor(parseFloat(avgScore)) : "text-muted"}
                  strokeDasharray={`${((parseFloat(avgScore || "0") / 5) * 188.5).toFixed(1)} 188.5`}
                  style={{ transition: "stroke-dasharray 1s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold ${avgScore ? scoreColor(parseFloat(avgScore)) : "text-muted-foreground"}`}>
                  {avgScore || "--"}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Score global de maturite</p>
              <p className={`text-2xl font-bold leading-tight ${avgScore ? scoreColor(parseFloat(avgScore)) : "text-muted-foreground"}`}>
                {avgScore ? `${avgScore}/5` : "N/A"}
              </p>
              {avgScore && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className={`w-3 h-3 ${parseFloat(avgScore) >= 3 ? "text-emerald-500" : "text-amber-500"}`} />
                  <span className="text-[11px] text-muted-foreground">
                    {parseFloat(avgScore) >= 4 ? "Excellent niveau" : parseFloat(avgScore) >= 3 ? "Bon niveau" : parseFloat(avgScore) >= 2 ? "En progression" : "A ameliorer"}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stat Mini Cards */}
        {[
          { icon: Layers, label: "Packs completes", value: `${packsCompleted}/10`, color: "text-cyan-600 bg-cyan-500/10" },
          { icon: Network, label: "Objets detectes", value: totalObjects.toString(), color: "text-blue-600 bg-blue-500/10" },
          { icon: Zap, label: "Quick wins", value: quickwins.length.toString(), color: "text-amber-600 bg-amber-500/10" },
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
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-500" />
              Radar de maturite
            </CardTitle>
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

      {/* Pack Progress Visualization */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Progression par pack</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PACK_DEFINITIONS.map((packDef) => {
            const status = getPackStatus(packDef.bloc);
            const answered = getPackProgress(packDef.bloc);
            const total = getPackTotalQuestions(packDef.bloc) || packDef.totalQuestions;
            const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
            const pr = getPackResume(packDef.bloc);
            const packScore = pr?.score_maturite;
            const isDone = status === "done";
            return (
              <Card key={packDef.bloc} className={`transition-all hover:shadow-md ${isDone ? "border-emerald-200 bg-emerald-50/30" : ""}`}>
                <CardContent className="p-3 flex flex-col items-center text-center gap-2">
                  {/* Circular progress ring */}
                  <div className="relative">
                    <svg width="52" height="52" viewBox="0 0 52 52" className="transform -rotate-90">
                      <circle cx="26" cy="26" r="22" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/20" />
                      <circle
                        cx="26" cy="26" r="22" fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className={isDone ? "text-emerald-500" : "text-cyan-500"}
                        strokeDasharray={`${(pct / 100) * 138.2} 138.2`}
                        style={{ transition: "stroke-dasharray 0.8s ease-out" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">{pct}%</span>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="text-xs font-medium leading-tight line-clamp-1">{packDef.icon} {packDef.title}</p>
                    {packScore != null && (
                      <p className={`text-[11px] font-semibold mt-0.5 ${scoreColor(packScore)}`}>{packScore}/5</p>
                    )}
                    {!isDone && pct === 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">Non commence</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Detailed Pack Resumes (below progress) */}
      {packResumes.length > 0 && (
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
      )}
    </div>
  );

  const renderCarte = () => (
    <Card>
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Carte organisation interactive</span>
          <span className="text-xs font-normal text-muted-foreground">
            {mapProcessus.length} processus - {mapOutils.length} outils - {mapEquipes.length} equipes - {irritants.length} irritants
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0 relative">
        <OrgMap
          processus={mapProcessus}
          outils={mapOutils}
          equipes={mapEquipes}
          irritants={irritants}
          packResumes={packResumes}
          aiCartographyJson={session.ai_cartography_json}
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
    <div>
      <CartSectionHeader title="Questionnaire" description="Resultats detailles par pack thematique" icon={FileText} count={packResumes.length} />
      <div className="space-y-3">
      {packResumes.length === 0 ? (
        <EmptyState message="Aucun pack complete pour le moment" icon={FileText} />
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
    </div>
  );

  // Use extracted section components (with memoized renders)
  const EmptyState = ({ message, icon }: { message: string; icon: React.ElementType }) => (
    <CartEmptyState message={message} icon={icon} activeSection={activeSection} packsCompleted={packsCompleted} />
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
      case "overview": return <AIContentBoundary label="Overview">{renderOverview()}</AIContentBoundary>;
      case "carte": return <AIContentBoundary label="Carte">{renderCarte()}</AIContentBoundary>;
      case "questionnaire": return renderQuestionnaire();
      case "entities": return (
        <AIContentBoundary label="Entites">
          <CartEntityValidation
            sessionId={id!}
            entities={session.ai_extracted_entities || { equipes: [], processus: [], outils: [] }}
            extractionStatus={session.entities_extraction_status || "pending"}
            onExtract={handleExtractEntities}
            onValidateAndGenerate={handleValidateAndGenerate}
            extracting={extractingEntities}
            generating={generatingFinal}
            isPaid={isPaid}
            onOpenGate={() => openGate("entities")}
          />
        </AIContentBoundary>
      );
      case "quickwins": return <CartQuickwinsTab sessionId={id!} quickwins={quickwins} onReload={reload} />;
      case "processus": return <CartProcessusSection processus={processus} activeSection={activeSection} packsCompleted={packsCompleted} />;
      case "outils": return <CartOutilsSection outils={outils} activeSection={activeSection} packsCompleted={packsCompleted} />;
      case "equipes": return <CartEquipesSection equipes={equipes} activeSection={activeSection} packsCompleted={packsCompleted} />;
      case "irritants": return <CartIrritantsSection irritants={irritants} taches={taches} activeSection={activeSection} packsCompleted={packsCompleted} />;
      case "plan": return <AIContentBoundary label="Plan d'actions"><CartPlanActionsTab sessionId={id!} quickwins={quickwins} aiPlanOptimisation={session.ai_plan_optimisation} onReload={reload} /></AIContentBoundary>;
      case "recommandations": return <AIContentBoundary label="Recommandations"><CartRecommandationsTab outils={outils} irritants={irritants} packResumes={packResumes} aiAnalyseTransversale={session.ai_analyse_transversale} aiPlanOptimisation={session.ai_plan_optimisation} aiCoutInaction={session.ai_cout_inaction_annuel} aiKpis={session.ai_kpis_de_suivi} /></AIContentBoundary>;
      case "analyse": return <AIContentBoundary label="Analyse IA"><CartAnalyseSection session={session} /></AIContentBoundary>;
      default: return <AIContentBoundary label="Overview">{renderOverview()}</AIContentBoundary>;
    }
  };

  // ========== POST-GENERATION LAYOUT (sidebar + content) ==========
  if (isFinalGenerated) {
    return (
      <div className="flex-1 flex flex-col lg:flex-row bg-background">
        {sidebar}

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
                {isPaid && (
                  <div className="flex lg:hidden items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      disabled={pdfLoading}
                      onClick={() => generatePdf({ session, packResumes, processus, outils, equipes, irritants, taches, quickwins })}
                    >
                      {pdfLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                          <span className="max-w-[100px] truncate">{pdfProgress || "Export..."}</span>
                        </>
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                )}
                {!isPaid && (
                  <div className="flex lg:hidden items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      disabled={pdfLoading}
                      onClick={() => {
                        generateTeaser({ session, packResumes, processus, outils, equipes, irritants, taches, quickwins });
                        toast({ title: "Apercu gratuit genere", description: "Passez en premium pour le rapport complet" });
                      }}
                    >
                      {pdfLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button size="sm" className="h-8 text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white" onClick={() => openGate()}>
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      <span className="hidden sm:inline">Version complete</span>
                      <span className="sm:hidden">Upgrade</span>
                    </Button>
                  </div>
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

          {/* Partial data loading warning */}
          {partialErrors.length > 0 && (
            <div className="px-4 sm:px-6 pt-2">
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Certaines donnees n'ont pas pu etre chargees ({partialErrors.join(", ")})</span>
                </div>
                <Button size="sm" variant="ghost" className="h-6 text-[11px] text-amber-700 hover:bg-amber-100" onClick={reload}>
                  <RefreshCw className="w-3 h-3 mr-1" /> Recharger
                </Button>
              </div>
            </div>
          )}

          {/* Mobile nav */}
          <div className="px-4 sm:px-6 pt-3">
            {mobileNav}
          </div>

          {/* Content area */}
          <div className="flex-1 px-4 sm:px-6 py-4 pb-8" key={activeSection}>
            <div className="animate-fade-in-up">
              {renderSectionContent()}
            </div>
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
        {/* Quick Stats Banner */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border text-sm">
          <div className="flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold">{processus.length}</span>
            <span className="text-muted-foreground text-xs">processus</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold">{outils.length}</span>
            <span className="text-muted-foreground text-xs">outils</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span className="font-semibold">{irritants.length}</span>
            <span className="text-muted-foreground text-xs">irritants</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold">{quickwins.length}</span>
            <span className="text-muted-foreground text-xs">quick wins</span>
          </div>
          <div className="w-px h-4 bg-border hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">{estimatedTimeRemaining > 0 ? `~${estimatedTimeRemaining} min restant` : "Complete"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Layers, label: "Packs completes", value: `${packsCompleted}/10`, color: "text-cyan-600 bg-cyan-500/10" },
            { icon: CheckCircle, label: "Questions repondues", value: totalReponses.toString(), color: "text-blue-600 bg-blue-500/10" },
            { icon: Network, label: "Objets detectes", value: totalObjects.toString(), color: "text-emerald-600 bg-emerald-500/10" },
            { icon: Target, label: "Score moyen", value: avgScore ? `${avgScore}/5` : "--", color: avgScore && parseFloat(avgScore) >= 3 ? "text-emerald-600 bg-emerald-500/10" : "text-amber-600 bg-amber-500/10" },
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

        {/* Progress Milestones */}
        <div className="flex items-center gap-2 px-2">
          {[
            { threshold: 1, label: "1er pack", icon: Play },
            { threshold: 3, label: "3 packs", icon: TrendingUp },
            { threshold: 5, label: "5 packs", icon: Star },
            { threshold: 10, label: "Complet", icon: CheckCircle },
          ].map(({ threshold, label, icon: MIcon }, i) => {
            const reached = packsCompleted >= threshold;
            return (
              <div key={threshold} className="flex items-center gap-2 flex-1">
                {i > 0 && <div className={`flex-1 h-0.5 rounded-full ${reached ? "bg-cyan-400" : "bg-muted"}`} />}
                <div className={`flex items-center gap-1.5 shrink-0 ${reached ? "text-cyan-700" : "text-muted-foreground/50"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${reached ? "bg-cyan-100" : "bg-muted/50"}`}>
                    <MIcon className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-medium hidden sm:inline">{label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analysis Flow Card */}
        <Card className={`overflow-hidden ${packsCompleted >= 5 ? "border-cyan-300 bg-gradient-to-br from-cyan-50/80 to-blue-50/50" : "border-slate-200 bg-slate-50/30"}`}>
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${packsCompleted >= 5 ? "bg-gradient-to-br from-cyan-500 to-blue-500" : "bg-muted"}`}>
                  <Brain className={`w-5 h-5 ${packsCompleted >= 5 ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm">
                    {session.entities_extraction_status === "validated"
                      ? "Entites validees — Pret pour l'analyse"
                      : session.entities_extraction_status === "extracted"
                      ? "Entites extraites — Validation requise"
                      : packsCompleted >= 5
                      ? "Packs completes — Extraire les entites"
                      : "Diagnostic IA"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {packsCompleted >= 5
                      ? session.entities_extraction_status === "validated"
                        ? "Generez le diagnostic final a partir de vos entites validees."
                        : session.entities_extraction_status === "extracted"
                        ? "Verifiez et validez les entites extraites avant de generer l'analyse."
                        : "Etape 1 : Extraire les equipes, processus et outils de vos reponses."
                      : `Completez au moins 5 packs pour debloquer l'analyse. (${packsCompleted}/5)`}
                  </p>
                  {packsCompleted < 5 && (
                    <div className="mt-2 flex items-center gap-2 w-48">
                      <Progress value={(packsCompleted / 5) * 100} className="h-1.5" />
                      <span className="text-[10px] text-muted-foreground font-medium">{packsCompleted}/5</span>
                    </div>
                  )}
                  {packsCompleted >= 5 && (
                    <div className="flex items-center gap-4 mt-2 text-[10px]">
                      <span className={session.entities_extraction_status !== "pending" ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                        1. Extraction {session.entities_extraction_status !== "pending" ? "done" : ""}
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className={session.entities_extraction_status === "validated" ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                        2. Validation {session.entities_extraction_status === "validated" ? "done" : ""}
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className={isFinalGenerated ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                        3. Analyse
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {packsCompleted >= 5 && session.entities_extraction_status === "validated" ? (
                <Button
                  data-tour="step-3"
                  onClick={handleValidateAndGenerate}
                  disabled={generatingFinal}
                  className="shrink-0 h-10 px-5 text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white shadow-md shadow-cyan-500/20"
                >
                  {generatingFinal ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                      Generer le diagnostic
                    </>
                  )}
                </Button>
              ) : packsCompleted >= 5 && (session.entities_extraction_status === "extracted") ? (
                <Button
                  data-tour="step-3"
                  onClick={() => document.getElementById("entity-validation-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="shrink-0 h-10 px-5 text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Valider les entites
                </Button>
              ) : (
                <Button
                  data-tour="step-3"
                  onClick={isPaid ? handleExtractEntities : () => openGate()}
                  disabled={extractingEntities || packsCompleted < 5}
                  className={`shrink-0 h-10 px-5 text-sm ${
                    packsCompleted >= 5
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white shadow-md shadow-cyan-500/20"
                      : ""
                  }`}
                  variant={packsCompleted < 5 ? "secondary" : "default"}
                >
                  {extractingEntities ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extraction...
                    </>
                  ) : !isPaid && packsCompleted >= 5 ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Extraire (Premium)
                    </>
                  ) : (
                    <>
                      <Sparkles className={`w-4 h-4 mr-2 ${packsCompleted >= 5 ? "animate-pulse" : ""}`} />
                      Extraire les entites
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Entity Validation (visible when entities are extracted) */}
        {(session.entities_extraction_status === "extracted" || session.entities_extraction_status === "validated") && (
          <div id="entity-validation-section" />
        )}
        {(session.entities_extraction_status === "extracted" || session.entities_extraction_status === "validated") && (
          <CartEntityValidation
            sessionId={id!}
            entities={session.ai_extracted_entities || { equipes: [], processus: [], outils: [] }}
            extractionStatus={session.entities_extraction_status || "pending"}
            onExtract={handleExtractEntities}
            onValidateAndGenerate={handleValidateAndGenerate}
            extracting={extractingEntities}
            generating={generatingFinal}
            isPaid={isPaid}
            onOpenGate={() => openGate("entities")}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Packs thematiques
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-tour="step-1">
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
            <Card data-tour="step-2">
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
                {mapProcessus.length} processus - {mapOutils.length} outils - {mapEquipes.length} equipes - {irritants.length} irritants
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <OrgMiniMap processus={mapProcessus} outils={mapOutils} equipes={mapEquipes} irritants={irritants} />
          </CardContent>
        </Card>
      </main>

      <OnboardingTour packsCompleted={packsCompleted} />
      <FreemiumGate open={showGate} onOpenChange={setShowGate} sessionId={id} />
    </div>
  );
};

export default CartSessionDashboard;
