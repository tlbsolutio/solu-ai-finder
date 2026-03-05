import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Network, Loader2, Mail, Lock, User, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";

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
      {/* Left panel - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0f172a 100%)',
      }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(ellipse at 30% 50%, hsl(var(--primary)) 0%, transparent 60%)',
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Link to="/" className="mb-12">
            <img
              src="/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png"
              alt="Solutio"
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Cartographiez votre organisation en profondeur
          </h2>
          <p className="text-white/60 mb-10 leading-relaxed">
            Evaluez la maturite de vos processus, outils et equipes.
            Obtenez un plan d'action priorise grace a l'IA.
          </p>
          <div className="space-y-4">
            {[
              "150 questions en 10 axes d'analyse",
              "Carte interactive de votre organisation",
              "Recommandations IA personnalisees",
              "Export PDF professionnel",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-2">
            <Link to="/" className="inline-block">
              <img
                src="/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png"
                alt="Solutio"
                className="h-8 w-auto mx-auto"
              />
            </Link>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
              <Network className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Espace cartographie</h1>
            <p className="text-sm text-muted-foreground">Connectez-vous pour acceder a vos sessions</p>
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
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Mail className="w-7 h-7 text-primary" />
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
                      <Button type="submit" className="w-full h-10 bg-gradient-primary hover:opacity-90" disabled={loading}>
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
                    <Button type="submit" className="w-full h-10 bg-gradient-primary hover:opacity-90" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Creer mon compte
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
              to="/cartographie"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Retour a la cartographie
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartLogin;
