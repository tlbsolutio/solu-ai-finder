import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Mail, BarChart3, Calendar } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

const CALENDLY_URL = "https://calendly.com/solutio-expert/diagnostic";

export default function CartPaymentSuccess() {
  usePageTitle("Paiement confirme");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan"); // "autonome" or "accompagnee"
  const sessionId = searchParams.get("session");
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
                <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-cyan-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Activation de votre acces</p>
                  <p className="text-xs text-muted-foreground">
                    Votre acces complet est active sous quelques minutes. Vous recevrez un email de confirmation.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-cyan-600">2</span>
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

            {/* Calendly CTA for Accompagnee plan */}
            {isAccompagnee && (
              <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 p-5 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Votre RDV expert est inclus</p>
                    <p className="text-xs text-amber-700/80">Planifiez votre session d'1h avec un consultant pour maximiser vos resultats</p>
                  </div>
                </div>
                <Button
                  className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-medium"
                  onClick={() => window.open(CALENDLY_URL, "_blank")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Reserver un creneau maintenant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button
                className="w-full h-11 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white"
                onClick={() => navigate(sessionId ? `/cartographie/sessions/${sessionId}` : "/cartographie/sessions")}
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
            <a href="mailto:contact@solutio.work" className="text-primary hover:underline">
              contact@solutio.work
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
