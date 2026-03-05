import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Star, ChevronRight, Lock, Building2, Target, Landmark, Users, Briefcase,
  Cog, Monitor, MessageSquare, ShieldCheck, BarChart3,
} from "lucide-react";
import type { CartPackResume } from "@/lib/cartTypes";

const PACK_ICONS = [Building2, Target, Landmark, Users, Briefcase, Cog, Monitor, MessageSquare, ShieldCheck, BarChart3];

export interface PackDef {
  bloc: number;
  icon: string;
  title: string;
  description: string;
  totalQuestions: number;
  estimatedMinutes: number;
  color: string;
}

export const PACK_DEFINITIONS: PackDef[] = [
  { bloc: 1, icon: "🏢", title: "Contexte & Organisation", description: "Structure, historique, modele economique", totalQuestions: 15, estimatedMinutes: 5, color: "bg-blue-500" },
  { bloc: 2, icon: "🎯", title: "Clients & Offres", description: "Clientele, offres, livrables, marche", totalQuestions: 15, estimatedMinutes: 5, color: "bg-purple-500" },
  { bloc: 3, icon: "🏛️", title: "Organisation & Gouvernance", description: "Gouvernance, decisions, coordination", totalQuestions: 15, estimatedMinutes: 5, color: "bg-indigo-500" },
  { bloc: 4, icon: "👥", title: "Ressources Humaines", description: "Equipes, competences, RH", totalQuestions: 15, estimatedMinutes: 5, color: "bg-pink-500" },
  { bloc: 5, icon: "💼", title: "Processus Commerciaux", description: "Vente, prospection, CRM, facturation", totalQuestions: 15, estimatedMinutes: 5, color: "bg-orange-500" },
  { bloc: 6, icon: "⚙️", title: "Processus Operationnels", description: "Production, livraison, qualite operationnelle", totalQuestions: 15, estimatedMinutes: 5, color: "bg-yellow-500" },
  { bloc: 7, icon: "💻", title: "Outils & SI", description: "Logiciels, integrations, infrastructure IT", totalQuestions: 15, estimatedMinutes: 5, color: "bg-teal-500" },
  { bloc: 8, icon: "💬", title: "Communication Interne", description: "Reunions, outils, flux d'information", totalQuestions: 15, estimatedMinutes: 5, color: "bg-cyan-500" },
  { bloc: 9, icon: "✅", title: "Qualite & Conformite", description: "Processus qualite, erreurs, conformite", totalQuestions: 15, estimatedMinutes: 5, color: "bg-green-500" },
  { bloc: 10, icon: "📊", title: "KPIs & Pilotage", description: "Indicateurs, tableaux de bord, strategie", totalQuestions: 15, estimatedMinutes: 5, color: "bg-red-500" },
];

const PACK_COLORS: Record<number, string> = {
  1: "from-blue-500 to-blue-600",
  2: "from-purple-500 to-purple-600",
  3: "from-indigo-500 to-indigo-600",
  4: "from-pink-500 to-pink-600",
  5: "from-orange-500 to-orange-600",
  6: "from-yellow-500 to-yellow-600",
  7: "from-teal-500 to-teal-600",
  8: "from-cyan-500 to-cyan-600",
  9: "from-green-500 to-green-600",
  10: "from-red-500 to-red-600",
};

interface Props {
  sessionId: string;
  packDef: PackDef;
  status: "todo" | "in_progress" | "done";
  answeredQuestions: number;
  packResume: CartPackResume | null;
  realTotalQuestions?: number;
  locked?: boolean;
}

export function PackCard({ sessionId, packDef, status, answeredQuestions, packResume, realTotalQuestions, locked }: Props) {
  const navigate = useNavigate();
  const totalQ = realTotalQuestions ?? packDef.totalQuestions;
  const progress = totalQ > 0 ? Math.round((answeredQuestions / totalQ) * 100) : 0;
  const PackIcon = PACK_ICONS[packDef.bloc - 1] || Building2;

  const getBadge = () => {
    if (locked) return <Badge variant="outline" className="text-muted-foreground text-[10px]"><Lock className="w-3 h-3 mr-1" />Verrouille</Badge>;
    if (status === "done") return <Badge className="bg-emerald-500 text-white text-[10px]">Analyse</Badge>;
    if (status === "in_progress") return <Badge className="bg-amber-500 text-white text-[10px]">En cours</Badge>;
    return <Badge variant="outline" className="text-muted-foreground text-[10px]">A faire</Badge>;
  };

  const getButtonLabel = () => {
    if (locked) return "Debloquer";
    if (status === "done") return "Voir resultats";
    if (status === "in_progress") return "Continuer";
    return "Commencer";
  };

  const handleClick = () => {
    if (locked) return;
    if (status === "done") {
      navigate(`/cartographie/sessions/${sessionId}/pack/${packDef.bloc}/results`);
    } else {
      navigate(`/cartographie/sessions/${sessionId}/pack/${packDef.bloc}`);
    }
  };

  const renderStars = (score: number) => (
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < score ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
    ))
  );

  return (
    <Card
      className={`relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group ${
        locked ? "opacity-60" : status === "done" ? "border-emerald-200/50" : ""
      }`}
      onClick={handleClick}
    >
      <div className={`h-1 w-full bg-gradient-to-r ${PACK_COLORS[packDef.bloc] || packDef.color}`} />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${PACK_COLORS[packDef.bloc] || "from-primary to-primary"} flex items-center justify-center shrink-0`}>
              <PackIcon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">{packDef.title}</p>
              <p className="text-xs text-muted-foreground truncate">{packDef.description}</p>
            </div>
          </div>
          {getBadge()}
        </div>

        {!locked && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{answeredQuestions}/{totalQ} questions</span>
              <span>~{packDef.estimatedMinutes} min</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {status === "done" && packResume && (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {renderStars(packResume.score_maturite || 0)}
              <span className="text-xs text-muted-foreground ml-1">{packResume.score_maturite}/5</span>
            </div>
            {packResume.resume && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{packResume.resume}</p>}
            <div className="flex gap-1.5 flex-wrap">
              {packResume.objets_generes_count > 0 && (
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium">{packResume.objets_generes_count} objets</span>
              )}
              {(packResume.alertes || []).length > 0 && (
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{(packResume.alertes || []).length} alerte(s)</span>
              )}
            </div>
          </div>
        )}

        <Button
          size="sm"
          variant={status === "done" ? "outline" : locked ? "secondary" : "default"}
          className={`w-full text-xs ${status !== "done" && !locked ? "bg-gradient-primary hover:opacity-90" : ""}`}
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
        >
          {getButtonLabel()}
          <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
