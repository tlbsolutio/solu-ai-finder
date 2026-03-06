import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, ArrowRight, Crown, Lock } from "lucide-react";

interface FreemiumGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats?: {
    processus?: number;
    outils?: number;
    equipes?: number;
    irritants?: number;
    quickwins?: number;
    taches?: number;
  };
  tabName?: string;
  sessionId?: string;
}

const TAB_VALUE_MAP: Record<string, string> = {
  quickwins: "Quick wins identifies pour des resultats rapides",
  processus: "Cartographie detaillee de vos processus",
  outils: "Audit complet de votre parc logiciel",
  equipes: "Analyse de la charge et des missions",
  irritants: "Irritants & risques priorises par gravite",
  plan: "Plan d'actions P1/P2/P3 priorise",
  recommandations: "Recommandations IA personnalisees",
  analyse: "Analyse causale inter-packs et quantification d'impact",
};

export function FreemiumGate({ open, onOpenChange, stats, tabName, sessionId }: FreemiumGateProps) {
  const navigate = useNavigate();
  const contextMessage = tabName ? TAB_VALUE_MAP[tabName] : null;

  const hasStats = stats && (
    (stats.processus ?? 0) + (stats.outils ?? 0) + (stats.equipes ?? 0) +
    (stats.irritants ?? 0) + (stats.quickwins ?? 0) + (stats.taches ?? 0)
  ) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(59,130,246,0.04) 100%)',
        }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                <Lock className="w-4 h-4 text-cyan-600" />
              </div>
              Contenu premium
            </DialogTitle>
            <DialogDescription className="text-sm">
              {contextMessage || "Debloquez l'analyse complete de votre organisation."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {hasStats && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Processus", count: stats!.processus },
                { label: "Outils", count: stats!.outils },
                { label: "Equipes", count: stats!.equipes },
                { label: "Irritants", count: stats!.irritants },
                { label: "Quick wins", count: stats!.quickwins },
                { label: "Taches manuelles", count: stats!.taches },
              ].filter(s => (s.count ?? 0) > 0).map(({ label, count }) => (
                <div key={label} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <span className="text-lg font-bold text-cyan-600">{count}</span>
                  <span className="text-xs text-muted-foreground">{label} detectes</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {[
              "Diagnostic complet (processus, outils, equipes, irritants)",
              "Quick wins & plan d'actions priorise P1/P2/P3",
              "Recommandations IA personnalisees",
              "Export PDF professionnel",
            ].map((text) => (
              <div key={text} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm text-foreground/80">{text}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-card p-3 text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <p className="text-xs font-medium">Autonome</p>
              </div>
              <p className="text-xl font-bold">349<span className="text-xs font-normal text-muted-foreground ml-0.5">EUR</span></p>
              <p className="text-[10px] text-muted-foreground">Self-service complet</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-center space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <p className="text-xs font-medium">Accompagnee</p>
              </div>
              <p className="text-xl font-bold">890<span className="text-xs font-normal text-muted-foreground ml-0.5">EUR</span></p>
              <p className="text-[10px] text-muted-foreground">+ 1h RDV + suivi 30j</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full h-11 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white text-sm font-medium"
              onClick={() => {
                onOpenChange(false);
                navigate(`/cartographie/pricing${sessionId ? `?session=${sessionId}` : ""}`);
              }}
            >
              Voir les formules
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => onOpenChange(false)}>
              Continuer en version gratuite
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
