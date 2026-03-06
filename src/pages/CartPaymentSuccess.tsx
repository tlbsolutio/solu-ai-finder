import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Mail, BarChart3 } from "lucide-react";

export default function CartPaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan"); // "autonome" or "accompagnee"
  const isAccompagnee = plan === "accompagnee";

  return (
    <div className="flex-1 bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Confirmation card */}
        <Card className="border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-background">
          <CardContent className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>

            <div>
              <h1 className="text-xl font-bold mb-2">Paiement confirme !</h1>
              <p className="text-sm text-muted-foreground">
                Merci pour votre achat de la{" "}
                <strong>Cartographie {isAccompagnee ? "Accompagnee" : "Autonome"}</strong>.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-4 text-left space-y-3">
              <h3 className="text-sm font-semibold">Prochaines etapes</h3>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Activation de votre acces</p>
                  <p className="text-xs text-muted-foreground">
                    Votre acces complet est active sous quelques minutes. Vous recevrez un email de confirmation.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Explorez vos resultats</p>
                  <p className="text-xs text-muted-foreground">
                    Diagnostic complet, quick wins, plan d'actions, recommandations IA et export PDF.
                  </p>
                </div>
              </div>

              {isAccompagnee && (
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-700">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">RDV strategique</p>
                    <p className="text-xs text-muted-foreground">
                      Nous vous contactons sous 24h pour planifier votre rendez-vous d'1h avec un expert.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                className="w-full h-11 bg-gradient-primary hover:opacity-90"
                onClick={() => navigate("/cartographie/sessions")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Acceder a mon tableau de bord
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            <Mail className="w-3 h-3 inline mr-1" />
            Un probleme ? Contactez-nous a{" "}
            <a href="mailto:tlb@solutio.work" className="text-primary hover:underline">
              tlb@solutio.work
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
