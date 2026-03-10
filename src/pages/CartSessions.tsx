import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCartContext } from "@/contexts/CartSessionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ContentLoader } from "@/components/cartographie/ContentLoader";
import {
  Plus, Network, Calendar, ChevronRight, Sparkles, Crown, BarChart3, Zap,
  Settings, Users, Layers, AlertTriangle, CheckCircle, FileText, Brain,
  HelpCircle, Mail, MessageSquare, X, BookOpen, ArrowRight, Target,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const location = useLocation();
  const { ownerId, userName, userEmail, ensureSession, isAdmin } = useCartContext();
  const { toast } = useToast();

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

        // Object counts per session
        const countTable = async (table: string, field: string) => {
          const { data } = await supabase.from(table).select("session_id").in("session_id", ids);
          const counts: Record<string, number> = {};
          for (const row of (data || [])) {
            counts[row.session_id] = (counts[row.session_id] || 0) + 1;
          }
          return counts;
        };

        const [procCounts, outilsCounts, equipesCounts, irritantsCounts] = await Promise.all([
          countTable("cart_processus", "session_id"),
          countTable("cart_outils", "session_id"),
          countTable("cart_equipes", "session_id"),
          countTable("cart_irritants", "session_id"),
        ]);

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

  if (loading) return <ContentLoader variant="skeleton" />;

  const totalObjects = Object.values(sessionStats).reduce((acc, s) => acc + s.proc_count + s.outils_count + s.equipes_count + s.irritants_count, 0);
  const completedSessions = sessions.filter(s => s.final_generation_done).length;
  const firstName = userName?.split(" ")[0] || userEmail?.split("@")[0] || "Utilisateur";

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
          <Button onClick={() => setShowNewDialog(true)} size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Nouveau diagnostic</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
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
              {sessions.map(s => {
                const stats = sessionStats[s.id];
                const statusCfg = getStatusConfig(s);
                const totalObj = stats ? stats.proc_count + stats.outils_count + stats.equipes_count + stats.irritants_count : 0;
                const progressPct = (s.packs_completed / 10) * 100;

                return (
                  <Card
                    key={s.id}
                    className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-cyan-300/50 active:scale-[0.99] overflow-hidden"
                    onClick={() => navigate(`/cartographie/sessions/${s.id}`)}
                  >
                    {/* Top accent bar */}
                    <div className={`h-1 w-full bg-gradient-to-r ${
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
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" />
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
                  <p className="text-sm font-medium">Accompagnement</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Besoin d'un regard extérieur ? Reservez un RDV strategique de 30 min.
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

      {/* New session dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nouveau diagnostic</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium">Nom du diagnostic</Label>
              <Input
                value={newSessionName}
                onChange={e => setNewSessionName(e.target.value)}
                placeholder="Ex: Audit Q1 2026 — Mon entreprise"
                onKeyDown={e => e.key === "Enter" && createSession()}
                className="mt-1.5"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Choisissez un nom descriptif pour retrouver facilement ce diagnostic.
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
    </div>
  );
};

export default CartSessions;
