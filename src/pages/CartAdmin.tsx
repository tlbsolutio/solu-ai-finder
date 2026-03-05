import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCartContext } from "@/contexts/CartSessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ContentLoader } from "@/components/cartographie/ContentLoader";
import { Users, FileText, BarChart3, CreditCard, ShieldCheck, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = "tlb@solutio.work";

interface SessionRow {
  id: string;
  nom: string;
  owner_id: string;
  status: string;
  analyse_status: string | null;
  packs_completed: number;
  tier: string;
  created_at: string;
  updated_at: string;
}

interface UserAgg {
  owner_id: string;
  email: string | null;
  session_count: number;
  last_activity: string;
  has_paid: boolean;
}

interface SubscriptionRow {
  id: string;
  owner_id: string;
  status: string;
}

const CartAdmin = () => {
  const navigate = useNavigate();
  const { userEmail, loading: ctxLoading } = useCartContext();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [users, setUsers] = useState<UserAgg[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingUser, setTogglingUser] = useState<string | null>(null);

  // Admin guard
  useEffect(() => {
    if (!ctxLoading && userEmail !== ADMIN_EMAIL) {
      navigate("/cartographie/sessions", { replace: true });
    }
  }, [ctxLoading, userEmail, navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all sessions
      const { data: sessData, error: sessErr } = await supabase
        .from("cart_sessions")
        .select("*")
        .order("updated_at", { ascending: false });
      if (sessErr) throw sessErr;
      const allSessions = (sessData || []) as SessionRow[];
      setSessions(allSessions);

      // Fetch all active subscriptions
      const { data: subData } = await supabase
        .from("cart_subscriptions")
        .select("*")
        .eq("status", "active");
      const allSubs = (subData || []) as SubscriptionRow[];
      setSubscriptions(allSubs);

      // Build user aggregation from sessions
      const paidOwnerIds = new Set(allSubs.map(s => s.owner_id));
      const userMap = new Map<string, UserAgg>();
      for (const s of allSessions) {
        const existing = userMap.get(s.owner_id);
        if (existing) {
          existing.session_count++;
          if (s.updated_at > existing.last_activity) {
            existing.last_activity = s.updated_at;
          }
        } else {
          userMap.set(s.owner_id, {
            owner_id: s.owner_id,
            email: null, // will try to resolve below
            session_count: 1,
            last_activity: s.updated_at,
            has_paid: paidOwnerIds.has(s.owner_id),
          });
        }
      }

      // Try to get emails via admin_user_emails RPC (if it exists), otherwise fallback
      try {
        const { data: emailData } = await supabase.rpc("admin_get_user_emails") as { data: Array<{ id: string; email: string }> | null };
        if (emailData) {
          for (const u of emailData) {
            const entry = userMap.get(u.id);
            if (entry) entry.email = u.email;
          }
        }
      } catch {
        // RPC not available, emails will show as owner_id
      }

      setUsers(Array.from(userMap.values()).sort((a, b) => b.session_count - a.session_count));
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (userEmail === ADMIN_EMAIL) loadData();
  }, [userEmail, loadData]);

  const togglePaidAccess = async (ownerId: string, currentlyPaid: boolean) => {
    setTogglingUser(ownerId);
    try {
      if (currentlyPaid) {
        // Revoke: delete active subscription
        const { error } = await supabase
          .from("cart_subscriptions")
          .delete()
          .eq("owner_id", ownerId)
          .eq("status", "active");
        if (error) throw error;
        toast({ title: "Acces revoque" });
      } else {
        // Grant: insert active subscription
        const { error } = await supabase
          .from("cart_subscriptions")
          .insert({ owner_id: ownerId, status: "active" });
        if (error) throw error;
        toast({ title: "Acces accorde" });
      }
      await loadData();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setTogglingUser(null);
    }
  };

  const getStatusLabel = (s?: string | null) => {
    switch (s) {
      case "brouillon": return "Brouillon";
      case "en_cours": return "En cours";
      case "analyse_validee": return "Analyse validee";
      default: return s || "Brouillon";
    }
  };

  const getStatusColor = (s?: string | null) => {
    switch (s) {
      case "brouillon": return "bg-slate-100 text-slate-700 border-slate-200";
      case "en_cours": return "bg-blue-50 text-blue-700 border-blue-200";
      case "analyse_validee": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const hasFinalAnalysis = (s: SessionRow) =>
    s.analyse_status === "done" || s.status === "analyse_validee";

  if (ctxLoading || (userEmail === ADMIN_EMAIL && loading)) return <ContentLoader />;
  if (userEmail !== ADMIN_EMAIL) return null;

  // Stats
  const totalUsers = users.length;
  const totalSessions = sessions.length;
  const sessionsWithFinal = sessions.filter(hasFinalAnalysis).length;
  const activeSubscriptions = subscriptions.length;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-5 pb-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Administration</h1>
              <p className="text-sm text-muted-foreground">Panneau d'administration Cartographie</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 pb-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold">{totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold">{totalSessions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Analyses finales
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold">{sessionsWithFinal}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Abonnements actifs
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold">{activeSubscriptions}</p>
            </CardContent>
          </Card>
        </div>

        {/* Users table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead className="text-center">Sessions</TableHead>
                  <TableHead>Derniere activite</TableHead>
                  <TableHead className="text-center">Acces paye</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Aucun utilisateur
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map(u => (
                    <TableRow key={u.owner_id}>
                      <TableCell className="font-medium">
                        <span className="text-sm">{u.email || u.owner_id.slice(0, 12) + "..."}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{u.session_count}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(u.last_activity).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={u.has_paid}
                            disabled={togglingUser === u.owner_id}
                            onCheckedChange={() => togglePaidAccess(u.owner_id, u.has_paid)}
                          />
                          <Badge variant={u.has_paid ? "default" : "outline"} className="text-[10px]">
                            {u.has_paid ? "Paye" : "Gratuit"}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sessions table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Toutes les sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Proprietaire</TableHead>
                  <TableHead className="text-center">Packs</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Cree le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucune session
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map(s => {
                    const ownerUser = users.find(u => u.owner_id === s.owner_id);
                    return (
                      <TableRow
                        key={s.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/cartographie/sessions/${s.id}`)}
                      >
                        <TableCell className="font-medium text-sm">{s.nom}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ownerUser?.email || s.owner_id.slice(0, 12) + "..."}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-medium">{s.packs_completed}/10</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${getStatusColor(s.status)}`}>
                            {getStatusLabel(s.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(s.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CartAdmin;
