import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCartContext } from "@/contexts/CartSessionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Star, AlertCircle, CheckCircle, Trash2, Loader2, Sparkles, Lock, ArrowRight,
  Settings, Layers, Users, AlertTriangle, ClipboardList, Zap, TrendingUp,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { PACK_DEFINITIONS } from "@/components/cartographie/PackCard";
import {
  getRecommendationsForBloc,
  type SaasRecommendation,
} from "@/lib/saasRecommendations";

interface PackAnalysisResult {
  resume: string;
  score_maturite: number;
  alertes: Array<{ titre: string; description: string; gravite: string }>;
  objets: {
    irritants: any[];
    taches: any[];
    quickwins: any[];
  };
  objets_count: number;
}

const OBJECT_SECTIONS = [
  { key: "irritants", label: "Irritants detectes", table: "cart_irritants", nameField: "intitule", icon: AlertTriangle, color: "red", bgClass: "bg-red-50/50 border-red-100" },
  { key: "taches", label: "Taches manuelles", table: "cart_taches", nameField: "nom", icon: ClipboardList, color: "purple", bgClass: "bg-purple-50/50 border-purple-100" },
];

const SCORE_CONFIG: Record<number, { label: string; color: string; bgGradient: string; ringColor: string }> = {
  1: { label: "Critique", color: "text-red-600", bgGradient: "from-red-50 to-red-100/30", ringColor: "#ef4444" },
  2: { label: "Emergent", color: "text-orange-600", bgGradient: "from-orange-50 to-orange-100/30", ringColor: "#f97316" },
  3: { label: "En developpement", color: "text-cyan-600", bgGradient: "from-cyan-50 to-blue-50/30", ringColor: "#06b6d4" },
  4: { label: "Mature", color: "text-emerald-600", bgGradient: "from-emerald-50 to-green-50/30", ringColor: "#22c55e" },
  5: { label: "Excellent", color: "text-emerald-600", bgGradient: "from-emerald-50 to-green-50/30", ringColor: "#10b981" },
};

const CartPackResults = () => {
  const { id, packId } = useParams<{ id: string; packId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSessionPaid, loadSessionTier } = useCartContext();
  const isPaid = id ? isSessionPaid(id) : false;

  useEffect(() => { if (id) loadSessionTier(id); }, [id, loadSessionTier]);

  const bloc = parseInt(packId || "1");
  const packDef = PACK_DEFINITIONS.find((p) => p.bloc === bloc);
  const scoreConfig = (score: number) => SCORE_CONFIG[Math.min(5, Math.max(1, score))] || SCORE_CONFIG[3];

  const [analyzing, setAnalyzing] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [result, setResult] = useState<PackAnalysisResult | null>(null);
  const [showSaasRecos, setShowSaasRecos] = useState(false);

  // Get relevant SaaS for this pack
  const saasRecos = getRecommendationsForBloc(bloc);

  useEffect(() => {
    const loadExisting = async () => {
      if (!id || !bloc) return;
      setLoadingExisting(true);
      try {
        const [resumeRes, irritantsRes, tachesRes, quickwinsRes] = await Promise.all([
          supabase.from("cart_pack_resumes").select("*").eq("session_id", id).eq("bloc", bloc).maybeSingle(),
          supabase.from("cart_irritants").select("*").eq("session_id", id).eq("ai_generated", true).order("created_at"),
          supabase.from("cart_taches").select("*").eq("session_id", id).eq("ai_generated", true).order("created_at"),
          supabase.from("cart_quickwins").select("*").eq("session_id", id).eq("bloc_source", bloc).order("created_at"),
        ]);

        if (resumeRes.data) {
          const pr = resumeRes.data;
          setResult({
            resume: pr.resume || "",
            score_maturite: pr.score_maturite || 3,
            alertes: (pr.alertes as any[]) || [],
            objets: {
              irritants: irritantsRes.data || [],
              taches: tachesRes.data || [],
              quickwins: quickwinsRes.data || [],
            },
            objets_count: pr.objets_generes_count || 0,
          });
        } else {
          triggerAnalysis();
          return;
        }
      } catch {
        triggerAnalysis();
      } finally {
        setLoadingExisting(false);
      }
    };
    loadExisting();
  }, [id, bloc]);

  const triggerAnalysis = async () => {
    if (!id) return;
    setAnalyzing(true);
    setLoadingExisting(false);
    try {
      const { data: reponses } = await supabase
        .from("cart_reponses")
        .select("*, question:cart_questions(texte, type_reponse)")
        .eq("session_id", id)
        .eq("bloc", bloc);

      const formattedReponses = (reponses || []).map((r: any) => ({
        texte_question: r.question?.texte || r.code_question || "Question",
        type_reponse: r.question?.type_reponse || "Texte",
        reponse_brute: r.reponse_brute || "",
        code_question: r.code_question || "",
      }));

      const { data, error } = await supabase.functions.invoke("cart-pack-analyze", {
        body: { session_id: id, bloc_number: bloc, reponses: formattedReponses },
      });

      if (error) {
        let msg = data?.error || error.message || "Erreur lors de l'analyse";
        if (error?.context?.json) {
          try { const j = await error.context.json(); msg = j?.error || msg; } catch {}
        }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);

      const [irritantsRes, tachesRes, quickwinsRes] = await Promise.all([
        supabase.from("cart_irritants").select("*").eq("session_id", id).eq("ai_generated", true).order("created_at"),
        supabase.from("cart_taches").select("*").eq("session_id", id).eq("ai_generated", true).order("created_at"),
        supabase.from("cart_quickwins").select("*").eq("session_id", id).eq("bloc_source", bloc).order("created_at"),
      ]);

      setResult({
        resume: data.resume || "",
        score_maturite: data.score_maturite || 3,
        alertes: data.alertes || [],
        objets: {
          irritants: irritantsRes.data || [],
          taches: tachesRes.data || [],
          quickwins: quickwinsRes.data || [],
        },
        objets_count: data.objets_count || 0,
      });
    } catch (e: any) {
      toast({ title: "Erreur analyse", description: e.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (table: string, objId: string) => {
    await supabase.from(table as any).delete().eq("id", objId);
    toast({ title: "Supprime" });
    setResult((prev) => {
      if (!prev) return prev;
      const typeMap: Record<string, string> = {
        cart_processus: "processus",
        cart_outils: "outils",
        cart_equipes: "equipes",
        cart_irritants: "irritants",
        cart_taches: "taches",
        cart_quickwins: "quickwins",
      };
      const key = typeMap[table] as keyof typeof prev.objets;
      return { ...prev, objets: { ...prev.objets, [key]: (prev.objets[key] as any[]).filter((o: any) => o.id !== objId) } };
    });
  };

  const handleValidate = async (table: string, objId: string) => {
    await supabase.from(table as any).update({ validated: true }).eq("id", objId);
    toast({ title: "Valide" });
  };

  const alertColor = (gravite: string) => {
    if (gravite === "critique") return "bg-red-50 border-red-200 text-red-800";
    if (gravite === "important") return "bg-orange-50 border-orange-200 text-orange-800";
    return "bg-yellow-50 border-yellow-100 text-yellow-800";
  };

  const alertIcon = (gravite: string) => {
    if (gravite === "critique") return "bg-red-500";
    if (gravite === "important") return "bg-orange-500";
    return "bg-yellow-500";
  };

  if (loadingExisting) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-cyan-500 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 animate-ping" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Analyse en cours...</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            L'IA analyse vos reponses du pack <strong>{packDef?.title}</strong> et detecte les processus, outils et opportunites.
          </p>
        </div>
        <div className="w-64">
          <Progress value={undefined} className="h-2 animate-pulse" />
        </div>
        <p className="text-xs text-muted-foreground">Cela prend environ 10 a 20 secondes</p>
      </div>
    );
  }

  if (!isPaid) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-4 bg-card rounded-2xl border shadow-xl p-8">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Resultats detailles reserves</h2>
            <p className="text-sm text-muted-foreground mt-2">
              L'analyse detaillee par pack (objets detectes, alertes, quick wins) est disponible dans la version complete.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <Button
              className="w-full h-11 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white"
              onClick={() => navigate("/cartographie/pricing")}
            >
              Voir les formules
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => navigate(`/cartographie/sessions/${id}`)}>
              Retour au dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Aucun resultat disponible</p>
        <Button onClick={triggerAnalysis}>Lancer l'analyse</Button>
      </div>
    );
  }

  const sc = scoreConfig(result.score_maturite);
  const totalObjects = Object.values(result.objets).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="flex-1">
      <header className="sticky top-12 z-10 border-b bg-card/95 backdrop-blur px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{packDef?.icon}</span>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm sm:text-base truncate">{packDef?.title} — Resultats</h1>
              <p className="text-[11px] text-muted-foreground">Pack {bloc}/10</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={triggerAnalysis} disabled={analyzing}>
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Relancer
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate(`/cartographie/sessions/${id}`)}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
        {/* Score Hero Card */}
        <Card className={`bg-gradient-to-br ${sc.bgGradient} overflow-hidden border-none shadow-lg`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {/* Score circle */}
              <div className="shrink-0 relative">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/15" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={sc.ringColor}
                    strokeWidth="4"
                    strokeDasharray={`${(result.score_maturite / 5) * 264} 264`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-1000"
                  />
                  <text x="50" y="44" textAnchor="middle" fontSize="24" fontWeight="bold" fill="currentColor">{result.score_maturite}</text>
                  <text x="50" y="60" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">/5</text>
                </svg>
              </div>
              {/* Summary */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="font-bold text-lg">Analyse IA</h2>
                  <Badge className={`${sc.color} bg-white/70 border`}>{sc.label}</Badge>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < result.score_maturite ? "fill-amber-400 text-amber-400" : "text-muted/30"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{result.resume}</p>
                <div className="flex gap-2 flex-wrap mt-4">
                  <Badge variant="outline" className="bg-white/70 text-xs">
                    <Settings className="w-3 h-3 mr-1" />
                    {totalObjects} objets detectes
                  </Badge>
                  <Badge variant="outline" className="bg-white/70 text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    {result.objets.quickwins.length} quick wins
                  </Badge>
                  {result.alertes.length > 0 && (
                    <Badge variant="outline" className="bg-white/70 text-xs text-red-600 border-red-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {result.alertes.length} alertes
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Section */}
        {result.alertes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Alertes detectees
                <Badge variant="secondary" className="ml-1">{result.alertes.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.alertes.map((alert, i) => (
                <div key={i} className={`rounded-lg border px-4 py-3 ${alertColor(alert.gravite)}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alertIcon(alert.gravite)}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{alert.titre}</p>
                        <Badge variant="outline" className="text-[10px]">{alert.gravite}</Badge>
                      </div>
                      {alert.description && <p className="mt-1 text-xs opacity-80">{alert.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Object sections with better styling */}
        {OBJECT_SECTIONS.map(({ key, label, table, nameField, icon: SIcon, bgClass }) => {
          const items = result.objets[key as keyof typeof result.objets] as any[];
          if (items.length === 0) return null;
          return (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <SIcon className="w-4 h-4" />
                    {label}
                  </span>
                  <Badge variant="secondary">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map((item: any) => (
                  <div key={item.id} className={`flex items-start justify-between gap-3 p-3 rounded-lg border ${bgClass}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{item[nameField]}</p>
                        {item.type && <Badge variant="outline" className="text-[10px]">{item.type}</Badge>}
                        {item.type_outil && <Badge variant="outline" className="text-[10px]">{item.type_outil}</Badge>}
                        {item.niveau_criticite && (
                          <Badge className={`text-[10px] ${
                            item.niveau_criticite === "High" ? "bg-red-100 text-red-800 border-red-200" :
                            item.niveau_criticite === "Medium" ? "bg-orange-100 text-orange-800 border-orange-200" :
                            "bg-green-100 text-green-800 border-green-200"
                          } border`}>
                            {item.niveau_criticite}
                          </Badge>
                        )}
                        {item.gravite && <Badge className="text-[10px] bg-red-100 text-red-800 border border-red-200">Gravite {item.gravite}/5</Badge>}
                        {item.double_saisie && <Badge className="text-[10px] bg-orange-100 text-orange-800 border border-orange-200">Double saisie</Badge>}
                        {item.validated && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                      {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
                      {item.problemes && <p className="text-xs text-orange-600 mt-1 line-clamp-2">{item.problemes}</p>}
                      {item.impact && <p className="text-xs text-muted-foreground mt-1">Impact : {item.impact}</p>}
                      {item.mission && <p className="text-xs text-muted-foreground mt-1">{item.mission}</p>}
                      {item.frequence && <p className="text-xs text-muted-foreground mt-1">Frequence : {item.frequence}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50" onClick={() => handleValidate(table, item.id)} title="Valider">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-red-50" onClick={() => handleDelete(table, item.id)} title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {/* Quick Wins Section - enhanced */}
        {result.objets.quickwins.length > 0 && (
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Quick wins
                </span>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 border">{result.objets.quickwins.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.objets.quickwins.map((qw: any) => (
                <div key={qw.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{qw.intitule}</p>
                      {qw.priorite_calculee && (
                        <Badge className={`text-[10px] ${
                          qw.priorite_calculee === "Top Priority" ? "bg-green-500 text-white" :
                          qw.priorite_calculee === "Important" ? "bg-blue-500 text-white" :
                          "bg-gray-400 text-white"
                        }`}>
                          {qw.priorite_calculee}
                        </Badge>
                      )}
                    </div>
                    {qw.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{qw.description}</p>}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {qw.impact && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Impact : {qw.impact}</span>
                        </div>
                      )}
                      {qw.effort && (
                        <div className="flex items-center gap-1">
                          <Settings className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Effort : {qw.effort}</span>
                        </div>
                      )}
                      {qw.categorie && (
                        <Badge variant="outline" className="text-[10px]">{qw.categorie}</Badge>
                      )}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0 hover:bg-red-50" onClick={() => handleDelete("cart_quickwins", qw.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* SaaS Recommendations for this pack */}
        {saasRecos.length > 0 && (
          <Card className="border-cyan-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  Outils SaaS recommandes pour ce pack
                </span>
                <button
                  onClick={() => setShowSaasRecos(!showSaasRecos)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showSaasRecos ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {saasRecos.length} outils
                </button>
              </CardTitle>
            </CardHeader>
            {showSaasRecos && (
              <CardContent className="space-y-2">
                {saasRecos.slice(0, 6).map((saas) => (
                  <div key={saas.nom} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-cyan-50/50 border border-cyan-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{saas.nom}</p>
                        <Badge variant="outline" className="text-[10px]">{saas.categorie}</Badge>
                        {saas.origine === "FR" && <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">FR</Badge>}
                        {saas.modele_prix === "Freemium" && <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Gratuit</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{saas.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{saas.prix_indicatif}</p>
                    </div>
                    <a href={saas.site_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-[10px]">
                        Voir
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </a>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-6">
          {bloc < 10 && (
            <Button
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white shadow-md"
              onClick={() => navigate(`/cartographie/sessions/${id}/pack/${bloc + 1}`)}
            >
              Pack suivant : {PACK_DEFINITIONS.find(p => p.bloc === bloc + 1)?.title || `Pack ${bloc + 1}`}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(`/cartographie/sessions/${id}`)}>
            Retour au dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CartPackResults;
