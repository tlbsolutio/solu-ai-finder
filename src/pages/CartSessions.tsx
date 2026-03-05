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
import { Plus, Network, Calendar, ChevronRight, Sparkles } from "lucide-react";
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
  const { ownerId, ensureSession, isPaid, isAdmin } = useCartContext();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<CartSession[]>([]);
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
      // Admin sees all sessions, normal users only their own
      if (!isAdmin) {
        query = query.eq("owner_id", ownerId);
      }
      const { data, error } = await query;
      if (error) throw error;
      setSessions((data || []) as CartSession[]);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const createSession = async () => {
    if (!newSessionName.trim()) {
      toast({ title: "Erreur", description: "Nom de session requis", variant: "destructive" });
      return;
    }
    const uid = ownerId || await ensureSession();
    if (!uid) { toast({ title: "Erreur", description: "Authentification echouee", variant: "destructive" }); return; }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("cart_sessions")
        .insert({ nom: newSessionName.trim(), owner_id: uid, tier: isPaid ? "paid" : "free", status: "brouillon", pack_status_json: {}, packs_completed: 0 })
        .select("id")
        .single();
      if (error) throw error;
      toast({ title: "Session creee" });
      navigate(`/cartographie/sessions/${data.id}`);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setCreating(false); }
  };

  const getStatusColor = (s?: string) => {
    switch (s) {
      case "brouillon": return "bg-slate-100 text-slate-600 border-slate-200";
      case "en_cours": return "bg-blue-50 text-blue-600 border-blue-200";
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
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">{isAdmin ? "Toutes les sessions" : "Mes sessions"}</h1>
            <p className="text-sm text-muted-foreground">{sessions.length} cartographie{sessions.length !== 1 ? "s" : ""}</p>
          </div>
          <Button onClick={() => setShowNewDialog(true)} size="sm" className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Nouvelle session</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 pb-6">
        {sessions.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Network className="w-7 h-7 text-primary" />
              </div>
              <p className="font-semibold mb-1">Aucune session</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Creez votre premiere cartographie organisationnelle et decouvrez vos axes d'amelioration.
              </p>
              <Button onClick={() => setShowNewDialog(true)} className="bg-gradient-primary hover:opacity-90">
                <Sparkles className="w-4 h-4 mr-2" />
                Creer une session
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
                  className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 active:scale-[0.98] overflow-hidden"
                  onClick={() => navigate(`/cartographie/sessions/${s.id}`)}
                >
                  <div className={`h-1 w-full bg-gradient-to-r ${
                    s.status === "analyse_validee" ? "from-emerald-400 to-emerald-500" :
                    s.packs_completed > 0 ? "from-primary to-primary/60" :
                    "from-muted to-muted"
                  }`} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{s.nom}</h3>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progression</span>
                        <span className="font-medium text-foreground">{s.packs_completed}/10</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-primary/70"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={`text-[10px] ${getStatusColor(s.status)}`}>
                          {getStatusLabel(s.status)}
                        </Badge>
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
          <DialogHeader><DialogTitle>Nouvelle cartographie</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium">Nom de la session</Label>
              <Input
                value={newSessionName}
                onChange={e => setNewSessionName(e.target.value)}
                placeholder="Ex: Cartographie Q1 2026"
                onKeyDown={e => e.key === "Enter" && createSession()}
                className="mt-1.5"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button onClick={createSession} disabled={creating} className="bg-gradient-primary hover:opacity-90">
              {creating ? "Creation..." : "Creer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartSessions;
