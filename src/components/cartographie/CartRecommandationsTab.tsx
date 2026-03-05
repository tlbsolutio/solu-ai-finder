import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CartOutilV2 } from "@/lib/cartTypes";
import { FormattedText } from "@/components/cartographie/FormattedText";
import { Laptop, ArrowRight, Plus, Merge, AlertCircle, TrendingUp, Info } from "lucide-react";

interface CartRecommandationsTabProps {
  outils: CartOutilV2[];
  aiAnalyseTransversale?: string | null;
  aiPlanOptimisation?: string | null;
}

const TYPE_RECO_CONFIG = {
  Remplacement: { icon: ArrowRight, label: "Remplacement recommande", className: "bg-orange-50 border-orange-200", badgeClass: "bg-orange-100 text-orange-800 border-orange-200" },
  Ajout: { icon: Plus, label: "Outil manquant", className: "bg-blue-50 border-blue-200", badgeClass: "bg-blue-100 text-blue-800 border-blue-200" },
  Consolidation: { icon: Merge, label: "Consolidation possible", className: "bg-purple-50 border-purple-200", badgeClass: "bg-purple-100 text-purple-800 border-purple-200" },
};

const EFFORT_COLOR: Record<string, string> = {
  Faible: "bg-green-100 text-green-800 border-green-200",
  Moyen: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Eleve": "bg-red-100 text-red-800 border-red-200",
};

function buildRecommandations(outils: CartOutilV2[]) {
  const recos: Array<{ type: "Remplacement" | "Ajout" | "Consolidation"; outil_actuel?: string; situation: string; recommandation: string; benefice: string; effort: "Faible" | "Moyen" | "Eleve" }> = [];

  const outilsProblematiques = outils.filter(o => o.problemes && o.problemes.trim().length > 20);
  for (const outil of outilsProblematiques.slice(0, 5)) {
    recos.push({
      type: "Remplacement", outil_actuel: outil.nom,
      situation: `${outil.nom} presente des problemes: ${outil.problemes}`,
      recommandation: `Evaluer des alternatives modernes a ${outil.nom}`,
      benefice: "Reduction des frictions, amelioration de la productivite",
      effort: (outil.niveau_usage || 0) >= 4 ? "Eleve" : "Moyen",
    });
  }

  const outilsGeneriques = outils.filter(o => ["Bureautique", "Communication"].includes(o.type_outil || "") && (o.niveau_usage || 5) <= 2);
  for (const outil of outilsGeneriques.slice(0, 2)) {
    recos.push({
      type: "Ajout", outil_actuel: outil.nom,
      situation: `${outil.nom} est peu utilise (niveau ${outil.niveau_usage}/5)`,
      recommandation: "Ajouter un outil specialise",
      benefice: "Gain de temps et qualite amelioree",
      effort: "Faible",
    });
  }

  const byType: Record<string, CartOutilV2[]> = {};
  for (const o of outils) { if (o.type_outil) { if (!byType[o.type_outil]) byType[o.type_outil] = []; byType[o.type_outil].push(o); } }
  for (const [type, group] of Object.entries(byType)) {
    if (group.length >= 3) {
      recos.push({
        type: "Consolidation",
        situation: `${group.length} outils "${type}" coexistent (${group.map(o => o.nom).join(", ")})`,
        recommandation: `Consolider les outils ${type}`,
        benefice: "Reduction des couts et de la fragmentation",
        effort: "Moyen",
      });
    }
  }
  return recos;
}

export function CartRecommandationsTab({ outils, aiAnalyseTransversale }: CartRecommandationsTabProps) {
  const recos = buildRecommandations(outils);

  return (
    <div className="space-y-6 pb-8">
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: ArrowRight, label: "Remplacements", value: recos.filter(r => r.type === "Remplacement").length, color: "text-orange-600 bg-orange-50" },
          { icon: Plus, label: "Ajouts suggeres", value: recos.filter(r => r.type === "Ajout").length, color: "text-blue-600 bg-blue-50" },
          { icon: Merge, label: "Consolidations", value: recos.filter(r => r.type === "Consolidation").length, color: "text-purple-600 bg-purple-50" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}><CardContent className="p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}><Icon className="w-4 h-4" /></div>
            <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold leading-tight">{value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {recos.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <Laptop className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune recommandation generee. Completez le Pack 7 (Outils) pour en obtenir.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Recommandations logiciels ({recos.length})
          </h3>
          {recos.map((reco, i) => {
            const config = TYPE_RECO_CONFIG[reco.type];
            const Icon = config.icon;
            return (
              <Card key={i} className={`border ${config.className}`}><CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${config.badgeClass}`}><Icon className="w-4 h-4" /></div>
                    <div>
                      <Badge className={`text-xs border ${config.badgeClass}`}>{reco.type}</Badge>
                      {reco.outil_actuel && <span className="ml-2 text-sm font-semibold">{reco.outil_actuel}</span>}
                    </div>
                  </div>
                  <Badge className={`text-xs border shrink-0 ${EFFORT_COLOR[reco.effort]}`}>Effort {reco.effort}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><p className="text-xs font-medium text-muted-foreground uppercase">Situation</p><p className="text-sm">{reco.situation}</p></div>
                  <div><p className="text-xs font-medium text-muted-foreground uppercase">Recommandation</p><p className="text-sm font-medium">{reco.recommandation}</p></div>
                </div>
                <div className="flex items-start gap-2 bg-white/70 rounded-md px-3 py-2">
                  <TrendingUp className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-800"><span className="font-medium">Benefice : </span>{reco.benefice}</p>
                </div>
              </CardContent></Card>
            );
          })}
        </div>
      )}

      {outils.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Laptop className="w-4 h-4" /> Inventaire outils ({outils.length})
          </h3>
          <Card><CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {outils.map(o => (
                <div key={o.id} className="flex items-start gap-3 p-3 rounded-md border bg-card">
                  <Laptop className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{o.nom}</p>
                      {o.type_outil && <Badge variant="outline" className="text-xs">{o.type_outil}</Badge>}
                      {o.niveau_usage && <span className="text-xs text-muted-foreground">Usage {o.niveau_usage}/5</span>}
                    </div>
                    {o.problemes && <div className="flex items-start gap-1 mt-1"><AlertCircle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" /><p className="text-xs text-orange-700 line-clamp-2">{o.problemes}</p></div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </div>
      )}

      {aiAnalyseTransversale && (
        <Card><CardHeader className="pb-2 px-4 pt-4"><CardTitle className="text-sm flex items-center gap-2"><Info className="w-4 h-4 text-primary" />Analyse transversale IA</CardTitle></CardHeader>
        <CardContent className="px-4 pb-4"><FormattedText text={aiAnalyseTransversale} /></CardContent></Card>
      )}
    </div>
  );
}
