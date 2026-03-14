import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, ArrowRight, Crown, Lock, Shield, Users, X, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

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
  progress: "Vous avez complete 3 packs ! Debloquez l'analyse complete pour transformer vos reponses en plan d'actions.",
};

export function FreemiumGate({ open, onOpenChange, stats, tabName, sessionId }: FreemiumGateProps) {
  const navigate = useNavigate();
  const { track } = useAnalytics(sessionId);
  const contextMessage = tabName ? TAB_VALUE_MAP[tabName] : null;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) track("gate_dismissed", { tab: tabName });
    onOpenChange(isOpen);
  };

  const irritantCount = stats?.irritants ?? 0;
  const quickwinCount = stats?.quickwins ?? 0;
  const hasStats = stats && (
    (stats.processus ?? 0) + (stats.outils ?? 0) + (stats.equipes ?? 0) +
    irritantCount + quickwinCount + (stats.taches ?? 0)
  ) > 0;

  const urgencyMessage = hasStats && (irritantCount > 0 || quickwinCount > 0)
    ? `Votre diagnostic revele ${irritantCount > 0 ? `${irritantCount} irritant${irritantCount > 1 ? "s" : ""}` : ""}${irritantCount > 0 && quickwinCount > 0 ? " et " : ""}${quickwinCount > 0 ? `${quickwinCount} quick win${quickwinCount > 1 ? "s" : ""}` : ""} — debloquez votre plan d'actions complet`
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-[calc(100vw-2rem)] p-0 overflow-hidden border-0 shadow-2xl">
        {/* Blurred content teaser behind header */}
        <div className="relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="p-6 blur-[6px] opacity-40 select-none" aria-hidden="true">
              <div className="h-3 w-3/4 bg-cyan-200 rounded mb-2" />
              <div className="h-2 w-full bg-slate-200 rounded mb-1.5" />
              <div className="h-2 w-5/6 bg-slate-200 rounded mb-1.5" />
              <div className="h-2 w-2/3 bg-slate-200 rounded mb-3" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-16 bg-emerald-100 rounded-lg" />
                <div className="h-16 bg-amber-100 rounded-lg" />
                <div className="h-16 bg-red-100 rounded-lg" />
              </div>
            </div>
          </div>
          {/* Gradient overlay on teaser */}
          <div
            className="relative px-6 pt-6 pb-5"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.08) 50%, rgba(139,92,246,0.06) 100%)',
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5 text-lg">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                Debloquez l'analyse complete
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                {contextMessage || "Transformez votre diagnostic en plan d'actions concret."}
              </DialogDescription>
            </DialogHeader>

            {/* Social proof */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white flex items-center justify-center">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Rejoignez <span className="font-semibold text-foreground">+200 dirigeants</span> qui transforment leur entreprise
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Urgency message with dynamic data */}
          {urgencyMessage && (
            <div className="flex items-start gap-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-amber-900">{urgencyMessage}</p>
            </div>
          )}

          {/* Detected stats grid */}
          {hasStats && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Processus", count: stats!.processus, icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
                { label: "Outils", count: stats!.outils, icon: Zap, color: "text-violet-600 bg-violet-50" },
                { label: "Equipes", count: stats!.equipes, icon: Users, color: "text-emerald-600 bg-emerald-50" },
                { label: "Irritants", count: stats!.irritants, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
                { label: "Quick wins", count: stats!.quickwins, icon: Sparkles, color: "text-amber-600 bg-amber-50" },
                { label: "Taches", count: stats!.taches, icon: CheckCircle, color: "text-cyan-600 bg-cyan-50" },
              ].filter(s => (s.count ?? 0) > 0).map(({ label, count, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-2 rounded-xl border px-3 py-2.5 bg-card hover:shadow-sm transition-shadow">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-lg font-bold leading-none">{count}</span>
                    <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comparison table: Free vs Autonome vs Accompagnee */}
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Fonctionnalite</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">Gratuit</th>
                  <th className="text-center py-2 px-2 font-medium text-cyan-700 bg-cyan-50/50">Autonome</th>
                  <th className="text-center py-2 px-2 font-medium text-amber-700 bg-amber-50/50">Accomp.</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { feature: "Questionnaire complet", free: true, auto: true, acc: true },
                  { feature: "Analyse IA par pack", free: true, auto: true, acc: true },
                  { feature: "Radar de maturite", free: true, auto: true, acc: true },
                  { feature: "Extraction d'entites", free: false, auto: true, acc: true },
                  { feature: "Carte interactive", free: false, auto: true, acc: true },
                  { feature: "Diagnostic complet IA", free: false, auto: true, acc: true },
                  { feature: "Export PDF", free: false, auto: true, acc: true },
                  { feature: "RDV expert 1h", free: false, auto: false, acc: true },
                  { feature: "Suivi 30 jours", free: false, auto: false, acc: true },
                ].map(({ feature, free, auto, acc }) => (
                  <tr key={feature} className="hover:bg-muted/20">
                    <td className="py-1.5 px-3 text-foreground/80">{feature}</td>
                    <td className="py-1.5 px-2 text-center">
                      {free ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <X className="w-3.5 h-3.5 text-muted-foreground/30 mx-auto" />}
                    </td>
                    <td className="py-1.5 px-2 text-center bg-cyan-50/30">
                      {auto ? <CheckCircle className="w-3.5 h-3.5 text-cyan-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-muted-foreground/30 mx-auto" />}
                    </td>
                    <td className="py-1.5 px-2 text-center bg-amber-50/30">
                      {acc ? <CheckCircle className="w-3.5 h-3.5 text-amber-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-muted-foreground/30 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CTA buttons with inline pricing */}
          <div className="space-y-2.5">
            <Button
              className="w-full h-12 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:opacity-90 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 relative overflow-hidden group"
              onClick={() => {
                onOpenChange(false);
                navigate(`/cartographie/pricing${sessionId ? `?session=${sessionId}` : ""}`);
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Sparkles className="w-4 h-4 mr-2" />
              Autonome — 349 EUR
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 border-amber-300 bg-amber-50/50 hover:bg-amber-100/50 text-amber-900 text-sm font-medium"
              onClick={() => {
                onOpenChange(false);
                navigate(`/cartographie/pricing${sessionId ? `?session=${sessionId}` : ""}`);
              }}
            >
              <Crown className="w-4 h-4 mr-2 text-amber-600" />
              Accompagnee — 890 EUR (+ expert)
            </Button>
          </div>

          {/* Guarantee badge */}
          <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-50/60 border border-emerald-200/50">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-xs text-emerald-800 font-medium">Garantie satisfait ou rembourse 30 jours</p>
          </div>

          <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs" onClick={() => handleOpenChange(false)}>
            Continuer en version gratuite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
