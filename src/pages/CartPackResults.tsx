import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCartContext } from "@/contexts/CartSessionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Star, AlertCircle, CheckCircle, Trash2, Loader2, Sparkles, Lock, ArrowRight,
} from "lucide-react";
import { PACK_DEFINITIONS } from "@/components/cartographie/PackCard";

interface PackAnalysisResult {
  resume: string;
  score_maturite: number;
  alertes: Array<{ titre: string; description: string; gravite: string }>;
  objets: {
    processus: any[];
    outils: any[];
    equipes: any[];
    irritants: any[];
    taches: any[];
    quickwins: any[];
  };
  objets_count: number;
}

const CartPackResults = () => {
  const { id, packId } = useParams<{ id: string; packId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSessionPaid, loadSessionTier } = useCartContext();
  const isPaid = id ? isSessionPaid(id) : false;

  useEffect(() => { if (id) loadSessionTier(id); }, [id, loadSessionTier]);

  const bloc = parseInt(packId || "1");
  const packDef = PACK_DEFINITIONS.find((p) => p.bloc === bloc);

  const [analyzing, setAnalyzing] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [result, setResult] = useState<PackAnalysisResult | null>(null);

  useEffect(() => {
    const loadExisting = async () => {
      if (!id || !bloc) return;
      setLoadingExisting(true);
      try {
        const [resumeRes, processusRes, outilsRes, equipesRes, irritantsRes, tachesRes, quickwinsRes] = await Promise.all([
          supabase.from("cart_pack_resumes").select("*").eq("session_id", id).eq("bloc", bloc).single(),
          supabase.from("cart_processus").select("*").eq("session_id", id).eq("ai_generated", true).order("created_at"),
          supabase.from("cart_outils").select("*").eq("session_id", id).eq("ai_generated", true).order("created_at"),
          supabase.from("cart_equipes").select("*").eq("session_id", id).eq("ai_generated", true).order("created_at"),
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
              processus: processusRes.data || [],
              outils: outilsRes.data || [],
              equipes: equipesRes.data || [],
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

      const [processusRes, outilsRes, equipesRes, irritantsRes, tachesRes, quickwinsRes] = await Promise.all([
        supabase.from("cart_processus").select("*").eq("session_id", id).eq("ai_generated", true).order("created_at"),
        supabase.from("cart_outils").select("*").eq("session_id", id).eq("ai_generated", true).order("created_at"),
        supabase.from("cart_equipes").select("*").eq("session_id", id).eq("ai_generated", true).order("created_at"),
        supabase.from("cart_irritants").select("*").eq("session_id", id).eq("ai_generated", true).order("created_at"),
        supabase.from("cart_taches").select("*").eq("session_id", id).eq("ai_generated", true).order("created_at"),
        supabase.from("cart_quickwins").select("*").eq("session_id", id).eq("bloc_source", bloc).order("created_at"),
      ]);

      setResult({
        resume: data.resume || "",
        score_maturite: data.score_maturite || 3,
        alertes: data.alertes || [],
        objets: {
          processus: processusRes.data || [],
          outils: outilsRes.data || [],
          equipes: equipesRes.data || [],
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

  const renderStars = (score: number) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < score ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
      ))}
    </div>
  );

  const alertColor = (gravite: string) => {
    if (gravite === "critique") return "bg-red-50 border-red-200 text-red-800";
    if (gravite === "important") return "bg-orange-50 border-orange-200 text-orange-800";
    return "bg-yellow-50 border-yellow-100 text-yellow-800";
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
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Analyse en cours...</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            L'IA analyse vos reponses et detecte les processus et opportunites.
          </p>
        </div>
        <div className="w-48">
          <Progress value={undefined} className="h-2 animate-pulse" />
        </div>
        <p className="text-xs text-muted-foreground">~10-20 secondes</p>
      </div>
    );
  }

  // Freemium gate: free users cannot see detailed pack results
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
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => navigate(`/cartographie/sessions/${id}`)}
            >
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

  const objectSections = [
    { key: "processus", label: "Processus detectes", table: "cart_processus", nameField: "nom" },
    { key: "outils", label: "Outils detectes", table: "cart_outils", nameField: "nom" },
    { key: "equipes", label: "Equipes detectees", table: "cart_equipes", nameField: "nom" },
    { key: "irritants", label: "Irritants detectes", table: "cart_irritants", nameField: "intitule" },
    { key: "taches", label: "Taches manuelles", table: "cart_taches", nameField: "nom" },
  ];

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
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate(`/cartographie/sessions/${id}`)}>
            Dashboard
          </Button>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Resume IA</CardTitle>
              {renderStars(result.score_maturite)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed">{result.resume}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{result.objets_count} objets detectes</Badge>
              <Badge variant="outline">Score maturite : {result.score_maturite}/5</Badge>
            </div>
          </CardContent>
        </Card>

        {result.alertes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                Alertes detectees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.alertes.map((alert, i) => (
                <div key={i} className={`rounded-md border px-3 py-2 text-sm ${alertColor(alert.gravite)}`}>
                  <p className="font-semibold">{alert.titre}</p>
                  {alert.description && <p className="mt-1 text-xs opacity-80">{alert.description}</p>}
                  <Badge variant="outline" className="mt-1 text-xs">{alert.gravite}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {objectSections.map(({ key, label, table, nameField }) => {
          const items = result.objets[key as keyof typeof result.objets] as any[];
          if (items.length === 0) return null;
          return (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{label}</span>
                  <Badge variant="secondary">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 p-2 rounded-md bg-muted/30 border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item[nameField]}</p>
                      {item.type && <p className="text-xs text-muted-foreground">{item.type}</p>}
                      {item.type_outil && <p className="text-xs text-muted-foreground">{item.type_outil}</p>}
                      {item.description && <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>}
                      {item.problemes && <p className="text-xs text-muted-foreground line-clamp-1">{item.problemes}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-green-600"
                        onClick={() => handleValidate(table, item.id)}
                        title="Valider"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(table, item.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {result.objets.quickwins.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Quick wins</span>
                <Badge variant="secondary">{result.objets.quickwins.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.objets.quickwins.map((qw: any) => (
                <div key={qw.id} className="flex items-start justify-between gap-3 p-2 rounded-md bg-yellow-50/50 border border-yellow-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{qw.intitule}</p>
                    <div className="flex gap-2 mt-1">
                      {qw.impact && (
                        <Badge variant="outline" className="text-xs">
                          Impact : {qw.impact}
                        </Badge>
                      )}
                      {qw.effort && (
                        <Badge variant="outline" className="text-xs">
                          Effort : {qw.effort}
                        </Badge>
                      )}
                      {qw.priorite_calculee && (
                        <Badge className={`text-xs ${qw.priorite_calculee === "Top Priority" ? "bg-green-500" : qw.priorite_calculee === "Important" ? "bg-blue-500" : "bg-gray-400"} text-white`}>
                          {qw.priorite_calculee}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive shrink-0"
                    onClick={() => handleDelete("cart_quickwins", qw.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center pb-6">
          <Button variant="outline" onClick={triggerAnalysis} disabled={analyzing}>
            <Sparkles className="w-4 h-4 mr-2" />
            Relancer l'analyse
          </Button>
        </div>
      </main>
    </div>
  );
};

export default CartPackResults;
