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
import { Plus, Network, Calendar, ChevronRight, Sparkles, Crown, BarChart3, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartSession {
  id: string;
  nom: string;
  status: string;
  analyse_status: string;
  packs_completed: number;
  tier: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

const CartSessions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ownerId, ensureSession, isAdmin } = useCartContext();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<CartSession[]>([]);
  const [paidSessionIds, setPaidSessionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(location.pathname.includes("/new"));
  const [newSessionName, setNewSessionName] = useState("");
  const [creating, setCreating] = useState(false);

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
      setSessions((data || []) as CartSession[]);

      const { data: subs } = await supabase
        .from("cart_subscriptions")
        .select("session_id")
        .eq("status", "active");
      if (subs) {
        setPaidSessionIds(new Set(subs.map(s => s.session_id).filter(Boolean)));
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

  const getStatusColor = (s?: string) => {
    switch (s) {
      case "brouillon": return "bg-slate-100 text-slate-600 border-slate-200";
      case "en_cours": return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "analyse_validee": return "bg-emerald-50 text-emerald-600 border-emerald-200";
      default: return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const getStatusLabel = (s?: string) => {
    switch (s) {
      case "brouillon": return "Brouillon";
      case "en_cours": return "En cours";
      case "analyse_validee": return "Analyse validee";
      default: return s || "Brouillon";
    }
  };

  if (loading) return <ContentLoader variant="skeleton" />;

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 sm:px-6 pt-5 pb-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">{isAdmin ? "Tous les diagnostics" : "Mes diagnostics"}</h1>
            <p className="text-sm text-muted-foreground">{sessions.length} diagnostic{sessions.length !== 1 ? "s" : ""} organisationnel{sessions.length !== 1 ? "s" : ""}</p>
          </div>
          <Button onClick={() => setShowNewDialog(true)} size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white">
            <Plus className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Nouveau diagnostic</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 pb-6">
        {sessions.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mb-5">
                <Network className="w-8 h-8 text-cyan-600" />
              </div>
              <p className="font-semibold text-lg mb-1">Lancez votre premier diagnostic</p>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                Evaluez la maturite de votre organisation a travers 10 axes d'analyse.
                Obtenez des recommandations IA personnalisees et un plan d'action priorise.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 max-w-lg w-full">
                {[
                  { icon: BarChart3, label: "Evaluez", desc: "150 questions, 10 axes" },
                  { icon: Network, label: "Cartographiez", desc: "Carte interactive" },
                  { icon: Zap, label: "Agissez", desc: "Plan d'action IA" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex flex-col items-center p-3 rounded-xl border bg-card">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-2">
                      <Icon className="w-4 h-4 text-cyan-600" />
                    </div>
                    <p className="text-xs font-medium">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
              <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Creer mon diagnostic
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sessions.map(s => {
              const progressPct = (s.packs_completed / 10) * 100;
              return (
                <Card
                  key={s.id}
                  className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-cyan-300/50 active:scale-[0.98] overflow-hidden"
                  onClick={() => navigate(`/cartographie/sessions/${s.id}`)}
                >
                  <div className={`h-1 w-full bg-gradient-to-r ${
                    s.status === "analyse_validee" ? "from-emerald-400 to-emerald-500" :
                    s.packs_completed > 0 ? "from-cyan-500 to-blue-500" :
                    "from-muted to-muted"
                  }`} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate group-hover:text-cyan-600 transition-colors">{s.nom}</h3>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progression</span>
                        <span className="font-medium text-foreground">{s.packs_completed}/10</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={`text-[10px] ${getStatusColor(s.status)}`}>
                          {getStatusLabel(s.status)}
                        </Badge>
                        {paidSessionIds.has(s.id) && (
                          <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200 gap-0.5">
                            <Crown className="w-2.5 h-2.5" />
                            Premium
                          </Badge>
                        )}
                        {isAdmin && s.owner_id !== ownerId && (
                          <Badge variant="outline" className="text-[9px] bg-purple-50 text-purple-600 border-purple-200">
                            {s.owner_id.slice(0, 6)}...
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(s.updated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nouveau diagnostic</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium">Nom du diagnostic</Label>
              <Input
                value={newSessionName}
                onChange={e => setNewSessionName(e.target.value)}
                placeholder="Ex: Diagnostic Q1 2026 — Mon entreprise"
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
