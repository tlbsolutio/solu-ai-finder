import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Network, Sparkles, Target, BarChart3, Users, Zap, ArrowRight,
  CheckCircle, ClipboardList, Brain, Laptop,
} from "lucide-react";

const CartHome = () => {
  const { t } = useLanguage();

  const benefits = [
    { icon: Target, title: "10 axes d'analyse", desc: "Evaluez la maturite de votre organisation sur 10 dimensions cles" },
    { icon: Brain, title: "Analyse IA", desc: "Intelligence artificielle pour detecter les dysfonctionnements et opportunites" },
    { icon: Zap, title: "Quick wins", desc: "Identifiez les actions rapides a fort impact pour votre organisation" },
    { icon: BarChart3, title: "Radar de maturite", desc: "Visualisez votre profil organisationnel sur un radar interactif" },
    { icon: Users, title: "Carte organisation", desc: "Cartographiez vos equipes, processus et outils en mode visuel" },
    { icon: Laptop, title: "Recommandations", desc: "Obtenez des recommandations logiciels personnalisees" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 sm:py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Nouveau
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Cartographiez et optimisez votre organisation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Evaluez la maturite de vos processus, outils et equipes. Identifiez les irritants
            et generez un plan d'optimisation actionnable grace a l'IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/cartographie/scan">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto">
                <Network className="w-5 h-5 mr-2" />
                Scanner gratuitement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/cartographie/sessions">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <ClipboardList className="w-5 h-5 mr-2" />
                Mes sessions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">Comment ca marche ?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Scan rapide", desc: "Decrivez votre activite et repondez a 10-15 questions cles. Resultats instantanes." },
              { step: "2", title: "Analyse complete", desc: "Repondez aux 10 packs thematiques (~150 questions). L'IA analyse chaque pack." },
              { step: "3", title: "Plan d'action", desc: "Recevez votre radar de maturite, quick wins et plan d'optimisation priorise." },
            ].map(({ step, title, desc }) => (
              <Card key={step} className="text-center">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center mx-auto">
                    {step}
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-8">Ce que vous obtenez</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-2xl text-center space-y-6">
          <h2 className="text-2xl font-bold">Pret a cartographier votre organisation ?</h2>
          <p className="text-muted-foreground">
            Commencez par un diagnostic rapide gratuit et decouvrez vos axes d'amelioration.
          </p>
          <Link to="/cartographie/scan">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90">
              <Sparkles className="w-5 h-5 mr-2" />
              Commencer le scan gratuit
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CartHome;
