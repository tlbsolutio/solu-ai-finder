import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, CheckCircle } from "lucide-react";

interface FreemiumGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REVOLUT_PAYMENT_LINK = "https://pay.revolut.com/payment-link/solutio-cartographie";

const FEATURES = [
  "10 packs de questionnaires complets (~150 questions)",
  "Analyse IA par pack (resume, score, objets detectes)",
  "Analyse strategique croisee (6 rapports IA)",
  "Radar de maturite complet",
  "Carte organisationnelle D3",
  "Plan d'actions priorise",
  "Export PPTX professionnel",
];

export function FreemiumGate({ open, onOpenChange }: FreemiumGateProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Debloquer la cartographie complete
          </DialogTitle>
          <DialogDescription>
            Vous avez explore le diagnostic rapide. Passez a la version complete pour une analyse approfondie de votre organisation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm">{feature}</p>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4 bg-primary/5 text-center space-y-3">
            <Badge className="bg-primary text-primary-foreground text-lg px-4 py-1">
              Offre de lancement
            </Badge>
            <p className="text-sm text-muted-foreground">
              Acces illimite a toutes les fonctionnalites de cartographie
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            className="w-full bg-gradient-primary hover:opacity-90"
            onClick={() => window.open(REVOLUT_PAYMENT_LINK, "_blank")}
          >
            <Lock className="w-4 h-4 mr-2" />
            Payer et debloquer
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Peut-etre plus tard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
