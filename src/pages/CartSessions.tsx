import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCartContext } from "@/contexts/CartSessionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContentLoader } from "@/components/cartographie/ContentLoader";
import { ArrowLeft, Plus, Network, LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartSession {
  id: string;
  nom: string;
  status: string;
  analyse_status: string;
  packs_completed: number;
  tier: string;
  created_at: string;
  updated_at: string;
}

const CartSessions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ownerId, ensureSession, isPaid, userEmail, userName, signOut } = useCartContext();
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
      const { data, error } = await supabase
        .from("cart_sessions")
        .select("*")
        .eq("owner_id", ownerId)
        .order("updated_at", { ascending: false });
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
      case "brouillon": return "bg-gray-500";
      case "en_cours": return "bg-blue-500";
      case "analyse_validee": return "bg-green-500";
      default: return "bg-gray-400";
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

  if (loading) return <ContentLoader />;

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/cartographie")}><ArrowLeft className="h-5 w-5" /></Button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0"><Network className="w-5 h-5 text-cyan-500" /></div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Mes sessions</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">{sessions.length} session(s)</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button onClick={() => setShowNewDialog(true)} className="flex-1 sm:flex-initial"><Plus className="w-4 h-4 mr-2" />Nouvelle session</Button>
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1.5 rounded-md">
                <User className="w-3 h-3" />
                <span className="max-w-[120px] truncate">{userName || userEmail || "Utilisateur"}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate("/cartographie/login"); }} title="Se deconnecter">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <Card>
          <div className="overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Packs</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Aucune session. Creez votre premiere cartographie.</TableCell></TableRow>
                ) : sessions.map(s => (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/cartographie/sessions/${s.id}`)}>
                    <TableCell className="font-medium max-w-[200px] truncate">{s.nom}</TableCell>
                    <TableCell><span className="text-sm font-medium">{s.packs_completed}/10</span></TableCell>
                    <TableCell><Badge className={`${getStatusColor(s.status)} text-white text-xs`}>{getStatusLabel(s.status)}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(s.updated_at).toLocaleDateString("fr-FR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle session Cartographie</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nom de la session *</Label>
              <Input value={newSessionName} onChange={e => setNewSessionName(e.target.value)} placeholder="Ex: Cartographie Q1 2026" onKeyDown={e => e.key === "Enter" && createSession()} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annuler</Button>
            <Button onClick={createSession} disabled={creating}>{creating ? "Creation..." : "Creer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartSessions;
