import React from "react";
import { ArrowRight } from "lucide-react";

const EMPTY_STATE_HINTS: Record<string, { message: string; tip: string }> = {
  quickwins: { message: "Aucun quick win detecte", tip: "Les quick wins apparaissent apres l'analyse d'un pack — completez au moins 1 pack" },
  processus: { message: "Aucun processus identifie", tip: "Les processus sont extraits lors de l'extraction d'entites (etape payante)" },
  outils: { message: "Aucun outil detecte", tip: "Les outils sont extraits lors de l'extraction d'entites (etape payante)" },
  equipes: { message: "Aucune equipe identifiee", tip: "Les equipes sont extraites lors de l'extraction d'entites (etape payante)" },
  irritants: { message: "Aucun irritant repere", tip: "Les irritants apparaissent apres l'analyse des packs" },
  plan: { message: "Plan d'actions non genere", tip: "Generez l'analyse complete pour obtenir un plan d'actions priorise" },
  recommandations: { message: "Recommandations non disponibles", tip: "Completez l'analyse complete pour recevoir des recommandations personnalisees" },
  analyse: { message: "Analyse IA non generee", tip: "Completez au moins 5 packs puis lancez la generation d'analyse" },
};

interface CartEmptyStateProps {
  message: string;
  icon: React.ElementType;
  activeSection?: string;
  packsCompleted?: number;
}

export const CartEmptyState = React.memo(function CartEmptyState({
  message, icon: EmptyIcon, activeSection, packsCompleted = 0,
}: CartEmptyStateProps) {
  const hint = activeSection ? EMPTY_STATE_HINTS[activeSection] : undefined;
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in-up">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center mb-4 ring-1 ring-border/50">
        <EmptyIcon className="w-6 h-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground max-w-xs">{hint?.message || message}</p>
      <p className="text-xs text-muted-foreground/50 mt-1.5 max-w-sm leading-relaxed">{hint?.tip || "Commencez par completer votre premier pack pour debloquer cette section"}</p>
      {packsCompleted < 5 && (
        <div className="mt-4 flex items-center gap-1.5 text-xs text-cyan-600 bg-cyan-50 rounded-full px-3 py-1.5">
          <ArrowRight className="w-3 h-3" />
          <span>{packsCompleted}/5 packs minimum pour l'analyse complete</span>
        </div>
      )}
    </div>
  );
});
