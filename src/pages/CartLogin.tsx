import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Map, Loader2, Mail, Lock, User, Sparkles, BarChart3, Zap, FileText, Network, Clock, Shield, ArrowLeft } from "lucide-react";

const CartLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      toast({ title: "Connexion reussie" });
      navigate("/cartographie/sessions");
    } catch (err: any) {
      toast({ title: "Erreur de connexion", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caracteres", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: { full_name: regName },
        },
      });
      if (error) throw error;
      toast({ title: "Inscription reussie", description: "Verifiez votre email pour confirmer votre compte" });
      navigate("/cartographie/sessions");
    } catch (err: any) {
      toast({ title: "Erreur d'inscription", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!loginEmail) {
      toast({ title: "Erreur", description: "Entrez votre email", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: loginEmail,
        options: { emailRedirectTo: `${window.location.origin}/cartographie/sessions` },
      });
      if (error) throw error;
      setMagicLinkSent(true);
      toast({ title: "Lien envoye", description: "Consultez votre boite email" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - product showcase (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-b from-cyan-50/80 via-blue-50/30 to-background dark:from-cyan-950/30 dark:via-blue-950/10 dark:to-background">
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(6,182,212,0.04) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        {/* Glow effects */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full opacity-20" style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
        }} />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full opacity-15" style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        }} />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 max-w-2xl">
          {/* Back to cartographie */}
          <Link to="/cartographie" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10">
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour
          </Link>

          {/* Product identity */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Map className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-foreground">Solutio</span>
                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Carto</span>
              </div>
              <p className="text-[11px] text-muted-foreground -mt-0.5">Diagnostic organisationnel</p>
            </div>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold mb-4 leading-tight tracking-tight text-foreground">
            Diagnostiquez votre organisation.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
              Transformez-la.
            </span>
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed text-sm xl:text-base max-w-lg">
            150 questions, 10 axes d'analyse, une IA qui cartographie vos processus, identifie vos blocages et genere un plan d'action concret.
          </p>

          {/* Feature list */}
          <div className="space-y-3 mb-10">
            {[
              { icon: BarChart3, text: "Radar de maturite sur 10 dimensions" },
              { icon: Network, text: "Carte interactive de votre organisation" },
              { icon: Zap, text: "Quick wins et plan d'actions priorise" },
              { icon: FileText, text: "Rapport PDF professionnel exportable" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-cyan-600" />
                </div>
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-500" /> A votre rythme
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-500" /> Donnees UE
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-500" /> Sans engagement
            </span>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile product identity */}
          <div className="lg:hidden text-center mb-2">
            <Link to="/cartographie" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour
            </Link>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
                <Map className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold">Solutio</span>
                <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Carto</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Diagnostic organisationnel</p>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold">Accedez a votre espace</h1>
            <p className="text-sm text-muted-foreground">Connectez-vous pour gerer vos diagnostics</p>
          </div>

          <Card className="shadow-sm">
            <Tabs defaultValue="login">
              <div className="px-6 pt-5 pb-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="register">Inscription</TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="px-6 pt-5 pb-6">
                {/* LOGIN */}
                <TabsContent value="login" className="mt-0">
                  {magicLinkSent ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto">
                        <Mail className="w-7 h-7 text-cyan-600" />
                      </div>
                      <h3 className="font-semibold">Lien de connexion envoye</h3>
                      <p className="text-sm text-muted-foreground">
                        Consultez votre boite email ({loginEmail}) et cliquez sur le lien pour vous connecter.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => setMagicLinkSent(false)}>Retour</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="login-email" className="text-xs font-medium">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground/60" />
                          <Input
                            id="login-email"
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="votre@email.com"
                            className="pl-10 h-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="login-password" className="text-xs font-medium">Mot de passe</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground/60" />
                          <Input
                            id="login-password"
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Votre mot de passe"
                            className="pl-10 h-10"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" variant="hero" className="w-full h-10 shadow-lg shadow-cyan-500/20" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Se connecter
                      </Button>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">ou</span></div>
                      </div>
                      <Button type="button" variant="outline" className="w-full h-10" onClick={handleMagicLink} disabled={loading}>
                        <Mail className="w-4 h-4 mr-2" />
                        Connexion par lien email
                      </Button>
                    </form>
                  )}
                </TabsContent>

                {/* REGISTER */}
                <TabsContent value="register" className="mt-0">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-name" className="text-xs font-medium">Nom complet</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground/60" />
                        <Input
                          id="reg-name"
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Jean Dupont"
                          className="pl-10 h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-email" className="text-xs font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground/60" />
                        <Input
                          id="reg-email"
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="votre@email.com"
                          className="pl-10 h-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-password" className="text-xs font-medium">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground/60" />
                        <Input
                          id="reg-password"
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min. 6 caracteres"
                          className="pl-10 h-10"
                          minLength={6}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" variant="hero" className="w-full h-10 shadow-lg shadow-cyan-500/20" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Creer mon compte gratuit
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          <div className="text-center space-y-3">
            <p className="text-[11px] text-muted-foreground">
              En vous connectant, vous acceptez nos{" "}
              <Link to="/legal" className="underline hover:text-foreground transition-colors">mentions legales</Link> et notre{" "}
              <Link to="/privacy" className="underline hover:text-foreground transition-colors">politique de confidentialite</Link>.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              solutio.work
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartLogin;
