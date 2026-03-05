import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCartContext } from "@/contexts/CartSessionContext";
import {
  Network, Sparkles, Target, BarChart3, Users, Zap, ArrowRight,
  CheckCircle, ClipboardList, Brain, Laptop, Search, Layers, FileBarChart,
} from "lucide-react";

const CartHome = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useCartContext();
  const navigate = useNavigate();
  const sessionsLink = isAuthenticated ? "/cartographie/sessions" : "/cartographie/login";

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
      <section className="relative py-20 sm:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/lovable-uploads/c8143545-6b97-49dd-85ba-65b954b9e501.png"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-background/95 dark:bg-background/98" />
        </div>
        <div className="container mx-auto max-w-4xl text-center space-y-6 relative z-10">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 shadow-sm ring-1 ring-primary/20">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Nouveau
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
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
            <Link to={sessionsLink}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <ClipboardList className="w-5 h-5 mr-2" />
                {isAuthenticated ? "Mes sessions" : "Se connecter"}
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground pt-2">
            <CheckCircle className="w-4 h-4 inline-block mr-1.5 text-green-500" />
            Deja <span className="font-semibold text-foreground">50+ organisations</span> analysees
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-12">Comment ca marche ?</h2>
          <div className="grid sm:grid-cols-3 gap-6 relative">
            {/* Dashed connector line (desktop only) */}
            <div className="hidden sm:block absolute top-16 left-[20%] right-[20%] border-t-2 border-dashed border-primary/30 z-0" />
            {([
              { step: "1", icon: Search, title: "Scan gratuit (3 min)", desc: "12 questions rapides, detection sectorielle, radar estime et quick wins instantanes." },
              { step: "2", icon: Layers, title: "Cartographie complete", desc: "150 questions en 10 packs thematiques. L'IA analyse chaque dimension en profondeur." },
              { step: "3", icon: FileBarChart, title: "Plan d'action priorise", desc: "Carte interactive, analyse causale, estimation d'impact et export PPTX professionnel." },
            ] as const).map(({ step, icon: StepIcon, title, desc }) => (
              <Card key={step} className="text-center relative z-10">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                    {step}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                    <StepIcon className="w-5 h-5 text-primary" />
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
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-10">Ce que vous obtenez</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-l-[3px] border-l-primary/40">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto max-w-2xl text-center space-y-6 relative z-10">
          <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 px-4 py-1">
            Offre de lancement
          </Badge>
          <h2 className="text-3xl font-bold">Pret a cartographier votre organisation ?</h2>
          <p className="text-gray-300">
            Commencez par un scan rapide gratuit et decouvrez vos axes d'amelioration.
          </p>
          <Link to="/cartographie/scan">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6 mt-2">
              <Sparkles className="w-5 h-5 mr-2" />
              Commencer le scan gratuit
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-gray-400">
            Nombre de places limitees — Gratuit, sans engagement
          </p>
        </div>
      </section>
    </div>
  );
};

export default CartHome;
