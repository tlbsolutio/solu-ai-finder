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
import { Users, FileText, BarChart3, CreditCard, ShieldCheck, RefreshCw, Mail, Eye, ExternalLink, Link2, Presentation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

const ADMIN_EMAIL = "tlb@solutio.work";

interface SessionRow {
  id: string;
  nom: string;
  owner_id: string;
  status: string;
  analyse_status: string | null;
  packs_completed: number;
  tier: string;
  secteur: string | null;
  created_at: string;
  updated_at: string;
  final_generation_done: boolean;
}

interface UserAgg {
  owner_id: string;
  email: string | null;
  session_count: number;
  last_activity: string;
  has_paid: boolean;
  has_analysis: boolean;
}

interface SubscriptionRow {
  id: string;
  owner_id: string;
  session_id: string | null;
  status: string;
}

const CartAdmin = () => {
  usePageTitle("Administration");
  const navigate = useNavigate();
  const { userEmail, loading: ctxLoading } = useCartContext();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [users, setUsers] = useState<UserAgg[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingSession, setTogglingSession] = useState<string | null>(null);
  const [paidSessionIds, setPaidSessionIds] = useState<Set<string>>(new Set());

  // Admin guard
  useEffect(() => {
    if (!ctxLoading && userEmail !== ADMIN_EMAIL) {
      navigate("/cartographie/sessions", { replace: true });
    }
  }, [ctxLoading, userEmail, navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sessData, error: sessErr } = await supabase
        .from("cart_sessions")
        .select("*")
        .order("updated_at", { ascending: false });
      if (sessErr) throw sessErr;
      const allSessions = (sessData || []) as SessionRow[];
      setSessions(allSessions);

      const { data: subData } = await supabase
        .from("cart_subscriptions")
        .select("*")
        .eq("status", "active");
      const allSubs = (subData || []) as SubscriptionRow[];
      setSubscriptions(allSubs);
      setPaidSessionIds(new Set(allSubs.map(s => s.session_id).filter(Boolean) as string[]));

      // Build user aggregation
      const paidOwnerIds = new Set(allSubs.map(s => s.owner_id));
      const userMap = new Map<string, UserAgg>();
      for (const s of allSessions) {
        const existing = userMap.get(s.owner_id);
        const hasAnalysis = s.final_generation_done || s.analyse_status === "done" || s.status === "analyse_validee";
        if (existing) {
          existing.session_count++;
          if (s.updated_at > existing.last_activity) existing.last_activity = s.updated_at;
          if (hasAnalysis) existing.has_analysis = true;
        } else {
          userMap.set(s.owner_id, {
            owner_id: s.owner_id,
            email: null,
            session_count: 1,
            last_activity: s.updated_at,
            has_paid: paidOwnerIds.has(s.owner_id),
            has_analysis: hasAnalysis,
          });
        }
      }

      // Resolve emails via RPC
      try {
        const { data: emailData } = await supabase.rpc("admin_get_user_emails") as { data: Array<{ id: string; email: string }> | null };
        if (emailData) {
          for (const u of emailData) {
            const entry = userMap.get(u.id);
            if (entry) entry.email = u.email;
          }
        }
      } catch {
        // RPC not available
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

  const toggleSessionPaidAccess = async (sessionId: string, ownerId: string, currentlyPaid: boolean) => {
    setTogglingSession(sessionId);
    try {
      if (currentlyPaid) {
        const { error } = await supabase
          .from("cart_subscriptions")
          .delete()
          .eq("session_id", sessionId)
          .eq("status", "active");
        if (error) throw error;
        toast({ title: "Acces revoque pour cette session" });
      } else {
        const { error } = await supabase
          .from("cart_subscriptions")
          .insert({ owner_id: ownerId, session_id: sessionId, status: "active" });
        if (error) throw error;
        toast({ title: "Acces accorde pour cette session" });
      }
      await loadData();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setTogglingSession(null);
    }
  };

  const getStatusLabel = (s?: string | null) => {
    switch (s) {
      case "brouillon": return "Brouillon";
      case "en_cours": return "En cours";
      case "analyse_validee": return "Validee";
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

  if (ctxLoading || (userEmail === ADMIN_EMAIL && loading)) return <ContentLoader />;
  if (userEmail !== ADMIN_EMAIL) return null;

  const totalUsers = users.length;
  const totalSessions = sessions.length;
  const sessionsWithFinal = sessions.filter(s => s.final_generation_done || s.analyse_status === "done").length;
  const activeSubscriptions = subscriptions.length;

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 sm:px-6 pt-5 pb-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Administration</h1>
              <p className="text-sm text-muted-foreground">Vue globale de tous les utilisateurs et sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/cartographie/admin/affiliates")}>
              <Link2 className="w-4 h-4 mr-1.5" />
              Gestion Affiliations
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/cartographie/admin/partner-deck")}>
              <Presentation className="w-4 h-4 mr-1.5" />
              Partner Deck
            </Button>
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 pb-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Users, label: "Utilisateurs", value: totalUsers, color: "text-blue-500" },
            { icon: FileText, label: "Sessions", value: totalSessions, color: "text-cyan-500" },
            { icon: BarChart3, label: "Analyses finales", value: sessionsWithFinal, color: "text-green-500" },
            { icon: CreditCard, label: "Abonnements actifs", value: activeSubscriptions, color: "text-amber-500" },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label}>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Utilisateurs ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead className="text-center">Sessions</TableHead>
                    <TableHead>Derniere activite</TableHead>
                    <TableHead className="text-center">Analyse</TableHead>
                    <TableHead className="text-center">Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
                          {u.has_analysis ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">Oui</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Non</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {u.email && u.email !== ADMIN_EMAIL ? (
                            <a
                              href={`mailto:${u.email}?subject=Votre%20cartographie%20Solutio&body=Bonjour%2C%0A%0AJ%27ai%20pu%20consulter%20votre%20cartographie%20organisationnelle%20et%20j%27aimerais%20vous%20proposer%20un%20accompagnement%20personnalis%C3%A9.%0A%0ACordialement%2C%0ASolutio`}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Contacter</span>
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Sessions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Toutes les sessions ({sessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Proprietaire</TableHead>
                    <TableHead className="text-center">Packs</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Secteur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Acces</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Aucune session
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map(s => {
                      const ownerUser = users.find(u => u.owner_id === s.owner_id);
                      return (
                        <TableRow key={s.id}>
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
                            {s.secteur || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(s.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric", month: "short",
                            })}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Switch
                                checked={paidSessionIds.has(s.id)}
                                disabled={togglingSession === s.id}
                                onCheckedChange={() => toggleSessionPaidAccess(s.id, s.owner_id, paidSessionIds.has(s.id))}
                              />
                              <Badge variant={paidSessionIds.has(s.id) ? "default" : "outline"} className="text-[10px]">
                                {paidSessionIds.has(s.id) ? "Premium" : "Free"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => navigate(`/cartographie/sessions/${s.id}`)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Voir
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CartAdmin;
