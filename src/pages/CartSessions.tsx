import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCartContext } from "@/contexts/CartSessionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ContentLoader } from "@/components/cartographie/ContentLoader";
import {
  Plus, Network, Calendar, ChevronRight, Sparkles, Crown, BarChart3,
  Settings, Users, Layers, AlertTriangle, CheckCircle, FileText, Brain,
  HelpCircle, Mail, MessageSquare, X, BookOpen, ArrowRight, Target, GitCompare, Search, Copy,
  MoreVertical, Archive, Trash2, RotateCcw, CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { PACK_DEFINITIONS } from "@/components/cartographie/PackCard";
import { useAnalytics } from "@/hooks/useAnalytics";

const STRIPE_PORTAL_URL = "https://billing.stripe.com/p/login/6oE7vT1Qs0gYf4c288";

interface CartSession {
  id: string;
  nom: string;
  status: string;
  analyse_status: string;
  packs_completed: number;
  final_generation_done: boolean;
  tier: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  sector_id: string | null;
}

interface SessionStats {
  session_id: string;
  proc_count: number;
  outils_count: number;
  equipes_count: number;
  irritants_count: number;
  avg_score: number | null;
}

const ONBOARDING_STEPS = [
  { icon: FileText, title: "Repondez aux questionnaires", desc: "10 packs thematiques, ~5 min chacun. Commencez par ceux qui vous parlent le plus." },
  { icon: Brain, title: "L'IA analyse vos reponses", desc: "A partir de 5 packs, generez votre cartographie complete avec analyse IA." },
  { icon: Target, title: "Passez a l'action", desc: "Quick wins, plan d'actions priorise, recommandations personnalisees et export PDF." },
];

const CartSessions = () => {
  usePageTitle("Mes Sessions");
  const navigate = useNavigate();
  const location = useLocation();
  const { ownerId, userName, userEmail, ensureSession, isAdmin } = useCartContext();
  const { toast } = useToast();
  const { track } = useAnalytics();

  const [sessions, setSessions] = useState<CartSession[]>([]);
  const [sessionStats, setSessionStats] = useState<Record<string, SessionStats>>({});
  const [paidSessionIds, setPaidSessionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(location.pathname.includes("/new"));
  const [newSessionName, setNewSessionName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    return localStorage.getItem("carto_tutorial_dismissed") !== "true";
  });
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [comparePackScores, setComparePackScores] = useState<Record<string, Array<{ bloc: number; score_maturite: number | null }>>>({});
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "nouveau" | "en_cours" | "analyse_generee" | "archivees">("all");
  const [deleteTarget, setDeleteTarget] = useState<CartSession | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [actionPending, setActionPending] = useState(false);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else if (next.size < 2) { next.add(id); }
      return next;
    });
  };

  const openCompareDialog = async () => {
    if (compareIds.size !== 2) return;
    setLoadingCompare(true);
    setShowCompareDialog(true);
    try {
      const ids = [...compareIds];
      const { data } = await supabase
        .from("cart_pack_resumes")
        .select("session_id, bloc, score_maturite")
        .in("session_id", ids)
        .order("bloc");
      const bySession: Record<string, Array<{ bloc: number; score_maturite: number | null }>> = {};
      for (const row of (data || [])) {
        if (!bySession[row.session_id]) bySession[row.session_id] = [];
        bySession[row.session_id].push({ bloc: row.bloc, score_maturite: row.score_maturite });
      }
      setComparePackScores(bySession);
    } catch {
      // Silently fail, dialog will show what it can
    } finally {
      setLoadingCompare(false);
    }
  };

  useEffect(() => { loadSessions(); }, [ownerId]);

  const loadSessions = async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      let query = supabase
        .from("cart_sessions")
        .select("*")
        .order("updated_at", { ascending: false });
      if (!isAdmin) {
        query = query.eq("owner_id", ownerId);
      }
      const { data, error } = await query;
      if (error) throw error;
      const sessionsData = (data || []) as CartSession[];
      setSessions(sessionsData);

      // Load paid status
      const { data: subs } = await supabase
        .from("cart_subscriptions")
        .select("session_id")
        .eq("status", "active");
      if (subs) {
        setPaidSessionIds(new Set(subs.map(s => s.session_id).filter(Boolean)));
      }

      // Load stats for each session (objects count + avg score)
      if (sessionsData.length > 0) {
        const ids = sessionsData.map(s => s.id);
        const statsMap: Record<string, SessionStats> = {};

        // Pack resumes for avg score
        const { data: resumes } = await supabase
          .from("cart_pack_resumes")
          .select("session_id, score_maturite")
          .in("session_id", ids);

        // Aggregate scores
        const scoresBySession: Record<string, number[]> = {};
        for (const r of (resumes || [])) {
          if (!scoresBySession[r.session_id]) scoresBySession[r.session_id] = [];
          if (r.score_maturite != null) scoresBySession[r.session_id].push(r.score_maturite);
        }

        // Object counts per session — fetch all 4 tables in parallel with minimal data
        const tables = ["cart_processus", "cart_outils", "cart_equipes", "cart_irritants"] as const;
        const countResults = await Promise.allSettled(
          tables.map(table =>
            supabase.from(table).select("session_id").in("session_id", ids)
          )
        );

        const buildCounts = (result: PromiseSettledResult<any>) => {
          const counts: Record<string, number> = {};
          if (result.status === "fulfilled") {
            for (const row of (result.value.data || []) as { session_id: string }[]) {
              counts[row.session_id] = (counts[row.session_id] || 0) + 1;
            }
          }
          return counts;
        };

        const [procCounts, outilsCounts, equipesCounts, irritantsCounts] = countResults.map(buildCounts);

        for (const s of sessionsData) {
          const scores = scoresBySession[s.id] || [];
          statsMap[s.id] = {
            session_id: s.id,
            proc_count: procCounts[s.id] || 0,
            outils_count: outilsCounts[s.id] || 0,
            equipes_count: equipesCounts[s.id] || 0,
            irritants_count: irritantsCounts[s.id] || 0,
            avg_score: scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null,
          };
        }
        setSessionStats(statsMap);
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const createSession = async () => {
    if (!newSessionName.trim()) {
      toast({ title: "Erreur", description: "Nom du diagnostic requis", variant: "destructive" });
      return;
    }
    const uid = ownerId || await ensureSession();
    if (!uid) { toast({ title: "Erreur", description: "Authentification echouee", variant: "destructive" }); return; }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("cart_sessions")
        .insert({ nom: newSessionName.trim(), owner_id: uid, tier: "free", status: "brouillon", pack_status_json: {}, packs_completed: 0 })
        .select("id")
        .single();
      if (error) throw error;
      toast({ title: "Diagnostic cree" });
      track("session_created", { sessionId: data.id });
      navigate(`/cartographie/sessions/${data.id}`);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setCreating(false); }
  };

  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem("carto_tutorial_dismissed", "true");
  };

  const getStatusConfig = (s: CartSession) => {
    if (s.final_generation_done) return { label: "Analyse generee", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
    if (s.packs_completed > 0) return { label: `${s.packs_completed}/10 packs`, color: "bg-cyan-50 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" };
    return { label: "Nouveau", color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-emerald-600";
    if (score >= 3) return "text-cyan-600";
    if (score >= 2) return "text-amber-600";
    return "text-red-600";
  };

  const totalObjects = useMemo(
    () => Object.values(sessionStats).reduce((acc, s) => acc + s.proc_count + s.outils_count + s.equipes_count + s.irritants_count, 0),
    [sessionStats]
  );
  const completedSessions = useMemo(
    () => sessions.filter(s => s.final_generation_done).length,
    [sessions]
  );
  const firstName = userName?.split(" ")[0] || userEmail?.split("@")[0] || "Utilisateur";

  const activeSessions = useMemo(() => sessions.filter(s => !s.archived_at), [sessions]);
  const archivedSessions = useMemo(() => sessions.filter(s => !!s.archived_at), [sessions]);

  const filteredSessions = useMemo(() => {
    let result = statusFilter === "archivees" ? archivedSessions : activeSessions;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.nom.toLowerCase().includes(q));
    }
    if (statusFilter === "nouveau") {
      result = result.filter(s => !s.final_generation_done && s.packs_completed === 0);
    } else if (statusFilter === "en_cours") {
      result = result.filter(s => !s.final_generation_done && s.packs_completed > 0);
    } else if (statusFilter === "analyse_generee") {
      result = result.filter(s => s.final_generation_done);
    }
    return result;
  }, [sessions, activeSessions, archivedSessions, searchQuery, statusFilter]);

  const duplicateSession = async (session: CartSession) => {
    if (actionPending) return;
    const uid = ownerId || await ensureSession();
    if (!uid) return;
    setActionPending(true);
    try {
      // 1. Create new session with same name + (copie), same sector, fresh status
      const { data: newSession, error } = await supabase.from("cart_sessions").insert({
        nom: `${session.nom} (copie)`,
        owner_id: uid,
        status: "brouillon",
        packs_completed: 0,
        pack_status_json: {},
        sector_id: session.sector_id,
      } as any).select("id").single();
      if (error) throw error;

      // 2. Copy cart_reponses from original session
      const { data: reponses } = await supabase
        .from("cart_reponses")
        .select("question_id, code_question, bloc, reponse_brute, importance")
        .eq("session_id", session.id);

      if (reponses && reponses.length > 0) {
        const copies = reponses.map(r => ({
          session_id: newSession.id,
          question_id: r.question_id,
          code_question: r.code_question,
          bloc: r.bloc,
          reponse_brute: r.reponse_brute,
          importance: r.importance,
        }));
        const { error: copyError } = await supabase.from("cart_reponses").insert(copies as any);
        if (copyError) throw copyError;
      }

      toast({ title: "Session dupliquee avec succes" });
      track("session_duplicated", { sourceSessionId: session.id, newSessionId: newSession.id });
      navigate(`/cartographie/sessions/${newSession.id}`);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setActionPending(false);
    }
  };

  const archiveSession = async (session: CartSession) => {
    if (actionPending) return;
    setActionPending(true);
    try {
      const { error } = await supabase
        .from("cart_sessions")
        .update({ archived_at: new Date().toISOString() } as any)
        .eq("id", session.id);
      if (error) throw error;
      toast({ title: "Diagnostic archive" });
      await loadSessions();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setActionPending(false);
    }
  };

  const unarchiveSession = async (session: CartSession) => {
    if (actionPending) return;
    setActionPending(true);
    try {
      const { error } = await supabase
        .from("cart_sessions")
        .update({ archived_at: null } as any)
        .eq("id", session.id);
      if (error) throw error;
      toast({ title: "Diagnostic desarchive" });
      await loadSessions();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setActionPending(false);
    }
  };

  const deleteSession = async (session: CartSession) => {
    if (actionPending) return;
    setActionPending(true);
    try {
      const { error } = await supabase
        .from("cart_sessions")
        .delete()
        .eq("id", session.id);
      if (error) throw error;
      toast({ title: "Diagnostic supprime" });
      setDeleteTarget(null);
      await loadSessions();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setActionPending(false);
    }
  };

  if (loading) return <ContentLoader variant="skeleton" />;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 px-4 sm:px-6 py-5 max-w-6xl mx-auto w-full space-y-5">

        {/* Welcome header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {isAdmin ? "Tous les diagnostics" : `Bonjour ${firstName}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {sessions.length === 0
                ? "Lancez votre premier diagnostic organisationnel"
                : `${sessions.length} diagnostic${sessions.length > 1 ? "s" : ""} - ${completedSessions} analyse${completedSessions > 1 ? "s" : ""} generee${completedSessions > 1 ? "s" : ""}`
              }
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {paidSessionIds.size > 0 && (
              <Button
                onClick={() => window.open(STRIPE_PORTAL_URL, "_blank")}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <CreditCard className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Gerer l'abonnement</span>
              </Button>
            )}
            {sessions.filter(s => s.final_generation_done).length >= 2 && (
              <Button
                onClick={() => { setCompareMode(!compareMode); setCompareIds(new Set()); }}
                size="sm"
                variant={compareMode ? "default" : "outline"}
                className={`text-xs ${compareMode ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
              >
                <GitCompare className="w-3.5 h-3.5 mr-1" />
                {compareMode ? "Annuler" : "Comparer"}
              </Button>
            )}
            <Button onClick={() => setShowNewDialog(true)} size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white">
              <Plus className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Nouveau diagnostic</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
        </div>

        {/* Quick stats (only if sessions exist) */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: BarChart3, label: "Diagnostics", value: sessions.length.toString(), color: "text-cyan-600 bg-cyan-500/10" },
              { icon: CheckCircle, label: "Analyses generees", value: completedSessions.toString(), color: "text-emerald-600 bg-emerald-500/10" },
              { icon: Network, label: "Objets detectes", value: totalObjects.toString(), color: "text-blue-600 bg-blue-500/10" },
              { icon: Crown, label: "Premium", value: paidSessionIds.size.toString(), color: "text-amber-600 bg-amber-500/10" },
            ].map(({ icon: Icon, label, value, color }) => (
              <Card key={label}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground truncate">{label}</p>
                    <p className="text-lg font-bold leading-tight">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tutorial banner (dismissible) */}
        {showTutorial && (
          <Card className="border-cyan-200 bg-gradient-to-r from-cyan-50/80 to-blue-50/50 relative overflow-hidden">
            <button
              onClick={dismissTutorial}
              className="absolute top-3 right-3 p-1 rounded-md hover:bg-cyan-100 transition-colors z-10"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-cyan-600/60" />
            </button>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-semibold text-cyan-900">Comment ca marche ?</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ONBOARDING_STEPS.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-cyan-200 flex items-center justify-center shadow-sm">
                        <step.icon className="w-4 h-4 text-cyan-600" />
                      </div>
                      {i < ONBOARDING_STEPS.length - 1 && (
                        <div className="w-px h-full bg-cyan-200 mt-1 hidden sm:block" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-cyan-900">{`${i + 1}. ${step.title}`}</p>
                      <p className="text-[11px] text-cyan-700/70 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & filter bar */}
        {sessions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un diagnostic..."
                  className="pl-9"
                  aria-label="Rechercher un diagnostic"
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {filteredSessions.length} diagnostic{filteredSessions.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {([
                { key: "all", label: "Tous" },
                { key: "nouveau", label: "Nouveau" },
                { key: "en_cours", label: "En cours" },
                { key: "analyse_generee", label: "Analyse generee" },
                ...(archivedSessions.length > 0 ? [{ key: "archivees" as const, label: `Archivees (${archivedSessions.length})` }] : []),
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === key
                      ? "bg-cyan-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sessions list or empty state */}
        {sessions.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-5">
                <Network className="w-8 h-8 text-cyan-600" />
              </div>
              <p className="font-semibold text-lg mb-1">Aucun diagnostic en cours</p>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                Creez votre premier diagnostic pour evaluer la maturite de votre organisation
                et obtenir des recommandations personnalisees.
              </p>
              <Button onClick={() => setShowNewDialog(true)} size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Creer mon premier diagnostic
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Vos diagnostics</h2>
              {!showTutorial && (
                <button
                  onClick={() => { setShowTutorial(true); localStorage.removeItem("carto_tutorial_dismissed"); }}
                  className="text-[11px] text-muted-foreground hover:text-cyan-600 transition-colors flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  Comment ca marche ?
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filteredSessions.map(s => {
                const stats = sessionStats[s.id];
                const statusCfg = getStatusConfig(s);
                const totalObj = stats ? stats.proc_count + stats.outils_count + stats.equipes_count + stats.irritants_count : 0;
                const progressPct = (s.packs_completed / 10) * 100;

                const isSelected = compareIds.has(s.id);
                return (
                  <Card
                    key={s.id}
                    className={`group cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] overflow-hidden ${
                      isSelected ? "border-purple-400 ring-2 ring-purple-200" : "hover:border-cyan-300/50"
                    }`}
                    onClick={() => {
                      if (compareMode && s.final_generation_done) { toggleCompare(s.id); }
                      else if (!compareMode) { navigate(`/cartographie/sessions/${s.id}`); }
                    }}
                  >
                    {/* Top accent bar */}
                    <div className={`h-1 w-full bg-gradient-to-r ${
                      s.archived_at ? "from-slate-300 to-slate-400" :
                      s.final_generation_done ? "from-emerald-400 to-emerald-500" :
                      s.packs_completed > 0 ? "from-cyan-500 to-blue-500" :
                      "from-muted to-muted"
                    }`} />

                    <CardContent className="p-4">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm truncate group-hover:text-cyan-600 transition-colors">{s.nom}</h3>
                            {paidSessionIds.has(s.id) && (
                              <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200 gap-0.5 shrink-0">
                                <Crown className="w-2.5 h-2.5" />
                                Premium
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <Badge variant="outline" className={`text-[10px] ${statusCfg.color}`}>{statusCfg.label}</Badge>
                            {s.archived_at && (
                              <Badge variant="outline" className="text-[9px] bg-slate-100 text-slate-500 border-slate-200 gap-0.5">
                                <Archive className="w-2.5 h-2.5" />
                                Archive
                              </Badge>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(s.updated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            {isAdmin && s.owner_id !== ownerId && (
                              <Badge variant="outline" className="text-[9px] bg-purple-50 text-purple-600 border-purple-200">
                                {s.owner_id.slice(0, 6)}...
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 mt-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="p-1 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100" aria-label="Menu actions"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem disabled={actionPending} onClick={() => duplicateSession(s)}>
                                <Copy className="w-3.5 h-3.5 mr-2" />
                                Dupliquer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {s.archived_at ? (
                                <DropdownMenuItem disabled={actionPending} onClick={() => unarchiveSession(s)}>
                                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                  Desarchiver
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem disabled={actionPending} onClick={() => archiveSession(s)}>
                                  <Archive className="w-3.5 h-3.5 mr-2" />
                                  Archiver
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setDeleteTarget(s)}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                          <span>Progression</span>
                          <span className="font-medium text-foreground">{s.packs_completed}/10 packs</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-500 to-blue-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats row (only if there are objects detected) */}
                      {(totalObj > 0 || stats?.avg_score != null) && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {stats?.avg_score != null && (
                            <div className="flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1">
                              <BarChart3 className="w-3 h-3 text-muted-foreground" />
                              <span className={`text-xs font-bold ${getScoreColor(stats.avg_score)}`}>{stats.avg_score}/5</span>
                            </div>
                          )}
                          {stats && stats.proc_count > 0 && (
                            <div className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1" title="Processus">
                              <Settings className="w-3 h-3 text-blue-500" />
                              <span className="text-[11px] font-medium text-blue-700">{stats.proc_count}</span>
                            </div>
                          )}
                          {stats && stats.outils_count > 0 && (
                            <div className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1" title="Outils">
                              <Layers className="w-3 h-3 text-green-500" />
                              <span className="text-[11px] font-medium text-green-700">{stats.outils_count}</span>
                            </div>
                          )}
                          {stats && stats.equipes_count > 0 && (
                            <div className="flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1" title="Equipes">
                              <Users className="w-3 h-3 text-orange-500" />
                              <span className="text-[11px] font-medium text-orange-700">{stats.equipes_count}</span>
                            </div>
                          )}
                          {stats && stats.irritants_count > 0 && (
                            <div className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-1" title="Irritants">
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                              <span className="text-[11px] font-medium text-red-700">{stats.irritants_count}</span>
                            </div>
                          )}
                          {totalObj > 0 && (
                            <span className="text-[10px] text-muted-foreground ml-1">{totalObj} objets</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Archived sessions collapsible */}
        {statusFilter !== "archivees" && archivedSessions.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              {showArchived ? "Masquer" : "Afficher"} les sessions archivees ({archivedSessions.length})
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showArchived ? "rotate-90" : ""}`} />
            </button>
            {showArchived && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3 opacity-75">
                {archivedSessions.map(s => {
                  const stats = sessionStats[s.id];
                  const statusCfg = getStatusConfig(s);
                  const totalObj = stats ? stats.proc_count + stats.outils_count + stats.equipes_count + stats.irritants_count : 0;
                  const progressPct = (s.packs_completed / 10) * 100;
                  return (
                    <Card
                      key={s.id}
                      className="group cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] overflow-hidden hover:border-slate-300"
                      onClick={() => navigate(`/cartographie/sessions/${s.id}`)}
                    >
                      <div className="h-1 w-full bg-gradient-to-r from-slate-300 to-slate-400" />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm truncate">{s.nom}</h3>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                              <Badge variant="outline" className="text-[9px] bg-slate-100 text-slate-500 border-slate-200 gap-0.5">
                                <Archive className="w-2.5 h-2.5" />
                                Archive
                              </Badge>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(s.updated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 mt-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="p-1 rounded-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100" aria-label="Menu actions"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => duplicateSession(s)}>
                                  <Copy className="w-3.5 h-3.5 mr-2" />
                                  Dupliquer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem disabled={actionPending} onClick={() => unarchiveSession(s)}>
                                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                  Desarchiver
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => setDeleteTarget(s)}
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                            <span>Progression</span>
                            <span className="font-medium text-foreground">{s.packs_completed}/10 packs</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-slate-400 to-slate-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Comparison prompt */}
        {compareMode && compareIds.size === 2 && (
          <div className="text-center py-4">
            <Button onClick={openCompareDialog} className="bg-purple-600 hover:bg-purple-700 text-white">
              <GitCompare className="w-4 h-4 mr-2" />
              Comparer les 2 diagnostics
            </Button>
          </div>
        )}

        {compareMode && compareIds.size < 2 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <GitCompare className="w-5 h-5 mx-auto mb-2 text-purple-400" />
            Selectionnez {2 - compareIds.size} diagnostic{compareIds.size === 0 ? "s" : ""} a comparer
          </div>
        )}

        {/* Support & Contact section */}
        <div className="border-t pt-5 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="hover:border-cyan-200 transition-colors cursor-pointer" onClick={() => window.open("mailto:contact@solutio.work?subject=Support%20Solutio%20Carto", "_blank")}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Besoin d'aide ?</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Signalez un probleme ou posez une question — reponse sous 24h.
                  </p>
                  <p className="text-[11px] text-cyan-600 mt-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    contact@solutio.work
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-cyan-200 transition-colors cursor-pointer" onClick={() => window.open("https://calendly.com/tlb-ov_p/30min", "_blank")}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Accompagnement expert</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Besoin d'un regard expert ? Reservez un RDV strategique de 30 min.
                  </p>
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    Prendre RDV sur Calendly
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le diagnostic</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. Toutes les donnees de cette session seront supprimees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={actionPending}
              onClick={() => { if (deleteTarget) deleteSession(deleteTarget); }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New session dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nouveau diagnostic</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium">Nom du diagnostic</Label>
              <Input
                value={newSessionName}
                onChange={e => setNewSessionName(e.target.value.slice(0, 80))}
                placeholder="Ex: Audit Q1 2026 — Mon entreprise"
                onKeyDown={e => e.key === "Enter" && createSession()}
                className="mt-1.5"
                maxLength={80}
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {newSessionName.length}/80 — Choisissez un nom descriptif pour retrouver facilement ce diagnostic.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button onClick={createSession} disabled={creating} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white">
              {creating ? "Creation..." : "Creer le diagnostic"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comparison dialog */}
      <Dialog open={showCompareDialog} onOpenChange={(open) => { if (!open) setShowCompareDialog(false); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-purple-600" />
              Comparaison de diagnostics
            </DialogTitle>
          </DialogHeader>
          {(() => {
            if (compareIds.size !== 2) return null;
            const [id1, id2] = [...compareIds];
            const s1 = sessions.find(s => s.id === id1);
            const s2 = sessions.find(s => s.id === id2);
            if (!s1 || !s2) return null;
            const st1 = sessionStats[id1];
            const st2 = sessionStats[id2];
            const packs1 = comparePackScores[id1] || [];
            const packs2 = comparePackScores[id2] || [];

            const metrics = [
              { label: "Score moyen", v1: st1?.avg_score?.toFixed(1) || "--", v2: st2?.avg_score?.toFixed(1) || "--", better: (st1?.avg_score || 0) > (st2?.avg_score || 0) ? 1 : (st1?.avg_score || 0) < (st2?.avg_score || 0) ? 2 : 0 },
              { label: "Packs completes", v1: `${s1.packs_completed}/10`, v2: `${s2.packs_completed}/10`, better: s1.packs_completed > s2.packs_completed ? 1 : s1.packs_completed < s2.packs_completed ? 2 : 0 },
              { label: "Processus", v1: st1?.proc_count?.toString() || "0", v2: st2?.proc_count?.toString() || "0", better: (st1?.proc_count || 0) > (st2?.proc_count || 0) ? 1 : (st1?.proc_count || 0) < (st2?.proc_count || 0) ? 2 : 0 },
              { label: "Outils", v1: st1?.outils_count?.toString() || "0", v2: st2?.outils_count?.toString() || "0", better: (st1?.outils_count || 0) > (st2?.outils_count || 0) ? 1 : (st1?.outils_count || 0) < (st2?.outils_count || 0) ? 2 : 0 },
              { label: "Equipes", v1: st1?.equipes_count?.toString() || "0", v2: st2?.equipes_count?.toString() || "0", better: (st1?.equipes_count || 0) > (st2?.equipes_count || 0) ? 1 : (st1?.equipes_count || 0) < (st2?.equipes_count || 0) ? 2 : 0 },
              { label: "Irritants", v1: st1?.irritants_count?.toString() || "0", v2: st2?.irritants_count?.toString() || "0", better: (st1?.irritants_count || 0) < (st2?.irritants_count || 0) ? 1 : (st1?.irritants_count || 0) > (st2?.irritants_count || 0) ? 2 : 0 },
            ];

            return (
              <div className="space-y-6 py-2">
                {/* Session names */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-x-4 items-center">
                  <div className="text-center">
                    <p className="font-semibold text-sm text-purple-700 truncate">{s1.nom}</p>
                    <p className="text-[11px] text-muted-foreground">{s1.packs_completed}/10 packs</p>
                  </div>
                  <div className="text-muted-foreground text-xs">vs</div>
                  <div className="text-center">
                    <p className="font-semibold text-sm text-purple-700 truncate">{s2.nom}</p>
                    <p className="text-[11px] text-muted-foreground">{s2.packs_completed}/10 packs</p>
                  </div>
                </div>

                {/* Key metrics table */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Metriques cles</h4>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-3 py-2 font-medium text-xs">{s1.nom}</th>
                          <th className="text-center px-3 py-2 font-medium text-xs text-muted-foreground">Metrique</th>
                          <th className="text-right px-3 py-2 font-medium text-xs">{s2.nom}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.map((m, i) => (
                          <tr key={m.label} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                            <td className={`text-left px-3 py-2 font-medium ${m.better === 1 ? "text-emerald-700 bg-emerald-50" : "text-foreground"}`}>{m.v1}</td>
                            <td className="text-center px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{m.label}</td>
                            <td className={`text-right px-3 py-2 font-medium ${m.better === 2 ? "text-emerald-700 bg-emerald-50" : "text-foreground"}`}>{m.v2}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pack scores comparison */}
                {loadingCompare ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">Chargement des scores par pack...</div>
                ) : (packs1.length > 0 || packs2.length > 0) && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Scores par pack</h4>
                    <div className="space-y-2">
                      {PACK_DEFINITIONS.map(pack => {
                        const score1 = packs1.find(p => p.bloc === pack.bloc)?.score_maturite;
                        const score2 = packs2.find(p => p.bloc === pack.bloc)?.score_maturite;
                        if (score1 == null && score2 == null) return null;
                        const s1Better = (score1 || 0) > (score2 || 0);
                        const s2Better = (score2 || 0) > (score1 || 0);
                        const maxScore = 5;
                        return (
                          <div key={pack.bloc} className="flex items-center gap-3">
                            <span className="text-lg w-6 text-center shrink-0">{pack.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium truncate">{pack.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Score bar for session 1 */}
                                <div className="flex items-center gap-1.5 flex-1">
                                  <span className={`text-xs font-bold w-8 text-right ${s1Better ? "text-emerald-600" : score1 != null ? "text-foreground" : "text-muted-foreground"}`}>
                                    {score1 != null ? score1.toFixed(1) : "--"}
                                  </span>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${s1Better ? "bg-emerald-500" : "bg-purple-400"}`}
                                      style={{ width: score1 != null ? `${(score1 / maxScore) * 100}%` : "0%" }}
                                    />
                                  </div>
                                </div>
                                {/* Score bar for session 2 */}
                                <div className="flex items-center gap-1.5 flex-1">
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden flex justify-end">
                                    <div
                                      className={`h-full rounded-full transition-all ${s2Better ? "bg-emerald-500" : "bg-cyan-400"}`}
                                      style={{ width: score2 != null ? `${(score2 / maxScore) * 100}%` : "0%" }}
                                    />
                                  </div>
                                  <span className={`text-xs font-bold w-8 ${s2Better ? "text-emerald-600" : score2 != null ? "text-foreground" : "text-muted-foreground"}`}>
                                    {score2 != null ? score2.toFixed(1) : "--"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCompareDialog(false); setCompareMode(false); setCompareIds(new Set()); }}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartSessions;
