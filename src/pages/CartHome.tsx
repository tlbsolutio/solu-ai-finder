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
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-24 sm:py-36 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/lovable-uploads/c8143545-6b97-49dd-85ba-65b954b9e501.png"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        </div>
        <div className="container mx-auto max-w-4xl text-center space-y-6 relative z-10">
          <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 shadow-sm">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Nouveau
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Cartographiez et optimisez <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">votre organisation</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Evaluez la maturite de vos processus, outils et equipes. Identifiez les irritants
            et generez un plan d'optimisation actionnable grace a l'IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link to="/cartographie/login">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto h-12 px-8 shadow-md shadow-primary/20">
                <Network className="w-5 h-5 mr-2" />
                Scanner gratuitement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/cartographie/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12">
                <ClipboardList className="w-5 h-5 mr-2" />
                {isAuthenticated ? "Mes sessions" : "Se connecter"}
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
            {["Gratuit", "3 minutes", "Sans engagement"].map((label) => (
              <div key={label} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden leading-[0]">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-10 lg:h-14">
            <path d="M0,60 L0,30 Q600,0 1200,30 L1200,60 Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Comment ca marche ?</h2>
            <p className="text-muted-foreground">Un processus simple en 3 etapes</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 relative">
            <div className="hidden sm:block absolute top-14 left-[20%] right-[20%] border-t-2 border-dashed border-primary/20 z-0" />
            {([
              { step: "1", icon: Search, title: "Scan gratuit", time: "3 min", desc: "12 questions rapides, detection sectorielle, radar estime et quick wins instantanes." },
              { step: "2", icon: Layers, title: "Cartographie complete", time: "45 min", desc: "150 questions en 10 packs thematiques. L'IA analyse chaque dimension en profondeur." },
              { step: "3", icon: FileBarChart, title: "Plan d'action", time: "Immediat", desc: "Carte interactive, analyse causale, estimation d'impact et export PDF professionnel." },
            ] as const).map(({ step, icon: StepIcon, title, time, desc }) => (
              <Card key={step} className="text-center relative z-10 border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 sm:p-8 space-y-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center mx-auto shadow-md shadow-primary/20 ring-4 ring-background">
                    {step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                    <StepIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{title}</h3>
                    <span className="text-xs text-muted-foreground">{time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ce que vous obtenez</h2>
            <p className="text-muted-foreground">Tout ce qu'il faut pour optimiser votre organisation</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-0 shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0f172a 100%)',
      }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(ellipse at 30% 50%, hsl(var(--primary)) 0%, transparent 60%)',
        }} />
        <div className="container mx-auto max-w-2xl text-center space-y-6 relative z-10">
          <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 px-4 py-1">
            Offre de lancement
          </Badge>
          <h2 className="text-3xl font-bold text-white">Pret a cartographier votre organisation ?</h2>
          <p className="text-white/60 leading-relaxed">
            Commencez par un scan rapide gratuit et decouvrez vos axes d'amelioration.
          </p>
          <Link to="/cartographie/login">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 h-12 px-8 shadow-lg shadow-primary/30 mt-2">
              <Sparkles className="w-5 h-5 mr-2" />
              Commencer le scan gratuit
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-white/40">
            Gratuit, sans engagement
          </p>
        </div>
      </section>
    </div>
  );
};

export default CartHome;
