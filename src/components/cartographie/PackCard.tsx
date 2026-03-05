import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, ChevronRight, Lock } from "lucide-react";
import type { CartPackResume } from "@/lib/cartTypes";

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

  const getBadge = () => {
    if (locked) return <Badge variant="outline" className="text-muted-foreground"><Lock className="w-3 h-3 mr-1" />Verrouille</Badge>;
    if (status === "done") return <Badge className="bg-green-500 text-white">Analyse</Badge>;
    if (status === "in_progress") return <Badge className="bg-orange-500 text-white">En cours</Badge>;
    return <Badge variant="outline" className="text-muted-foreground">A faire</Badge>;
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
      <Star key={i} className={`w-3 h-3 ${i < score ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
    ))
  );

  return (
    <Card
      className={`relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        locked ? "opacity-60" : status === "done" ? "border-green-200 bg-green-50/30" : ""
      }`}
      onClick={handleClick}
    >
      <div className={`h-1 w-full ${packDef.color}`} />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{packDef.icon}</span>
            <div>
              <p className="font-semibold text-sm leading-tight">{packDef.title}</p>
              <p className="text-xs text-muted-foreground">{packDef.description}</p>
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
            <div className="flex gap-2 flex-wrap">
              {packResume.objets_generes_count > 0 && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{packResume.objets_generes_count} objets detectes</span>
              )}
              {(packResume.alertes || []).length > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{(packResume.alertes || []).length} alerte(s)</span>
              )}
            </div>
          </div>
        )}

        <Button size="sm" variant={status === "done" ? "outline" : locked ? "secondary" : "default"} className="w-full" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
          {getButtonLabel()}
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
