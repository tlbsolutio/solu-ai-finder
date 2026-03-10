import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Network, Loader2, Mail, Lock, User, CheckCircle, Sparkles, BarChart3, Zap, FileText } from "lucide-react";

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
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0a0f1a 0%, #0c1929 40%, #0f172a 100%)',
      }}>
        {/* Glow effects */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(ellipse at 20% 40%, #06b6d4 0%, transparent 50%)',
        }} />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(ellipse at 80% 80%, #3b82f6 0%, transparent 50%)',
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white max-w-2xl">
          {/* Product identity */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold">Solutio</span>
                <span className="text-lg font-bold text-cyan-400">Carto</span>
              </div>
              <p className="text-[11px] text-white/40 -mt-0.5">Diagnostic organisationnel</p>
            </div>
          </div>

          <h2 className="text-3xl xl:text-4xl font-bold mb-4 leading-tight">
            Diagnostiquez votre organisation.<br />
            <span className="text-cyan-400">Transformez-la.</span>
          </h2>
          <p className="text-white/50 mb-10 leading-relaxed text-sm xl:text-base">
            Evaluez la maturite de vos processus, outils et equipes
            a travers 10 axes d'analyse. Obtenez un plan d'action
            concret, priorise par l'IA.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { value: "150", label: "Questions", sub: "10 axes d'analyse" },
              { value: "IA", label: "Analyse", sub: "Claude + Gemini" },
              { value: "PDF", label: "Export", sub: "Rapport complet" },
            ].map(({ value, label, sub }) => (
              <div key={label} className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-2xl font-bold text-cyan-400">{value}</p>
                <p className="text-xs font-medium text-white/70 mt-0.5">{label}</p>
                <p className="text-[10px] text-white/30">{sub}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { icon: BarChart3, text: "Radar de maturite sur 10 dimensions" },
              { icon: Network, text: "Carte interactive de votre organisation" },
              { icon: Zap, text: "Quick wins et plan d'actions priorise" },
              { icon: FileText, text: "Rapport PDF professionnel exportable" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="text-white/60 text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Trust badge */}
          <div className="mt-10 flex items-center gap-2 text-[11px] text-white/30">
            <Lock className="w-3 h-3" />
            <span>Donnees chiffrees - Hebergement UE (Irlande)</span>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile product identity */}
          <div className="lg:hidden text-center mb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
                <Network className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold">Solutio</span>
                <span className="text-base font-bold text-cyan-600">Carto</span>
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
                      <Button type="submit" className="w-full h-10 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white" disabled={loading}>
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
                    <Button type="submit" className="w-full h-10 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white" disabled={loading}>
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
