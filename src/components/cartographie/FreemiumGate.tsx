import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, ArrowRight } from "lucide-react";

interface FreemiumGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REVOLUT_PAYMENT_LINK = "https://pay.revolut.com/payment-link/solutio-cartographie";

const FEATURES = [
  "10 packs de questionnaires complets (~150 questions)",
  "Analyse IA par pack (resume, score, objets detectes)",
  "Analyse causale inter-packs et quantification d'impact",
  "Radar de maturite precis par pack",
  "Carte interactive (equipes, outils, processus)",
  "Plan d'actions priorise P1/P2/P3",
  "Export PDF professionnel",
];

export function FreemiumGate({ open, onOpenChange }: FreemiumGateProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="px-6 pt-6 pb-4" style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.03) 100%)',
        }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              Version complete
            </DialogTitle>
            <DialogDescription className="text-sm">
              Debloquez toutes les fonctionnalites pour une analyse approfondie de votre organisation.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <div className="space-y-2.5">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm text-foreground/80">{feature}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-muted/30 p-4 text-center space-y-2">
            <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm">
              Offre de lancement
            </Badge>
            <p className="text-xs text-muted-foreground">
              Acces illimite a toutes les fonctionnalites
            </p>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full h-11 bg-gradient-primary hover:opacity-90 text-sm font-medium"
              onClick={() => window.open(REVOLUT_PAYMENT_LINK, "_blank")}
            >
              Debloquer l'acces complet
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => onOpenChange(false)}>
              Peut-etre plus tard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
