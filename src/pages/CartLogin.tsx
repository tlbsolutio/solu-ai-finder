import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Map, Loader2, Mail, Lock, User, ArrowLeft } from "lucide-react";

const CartLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/cartographie/sessions` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background flex flex-col">
      {/* Top bar */}
      <div className="w-full px-6 py-5 flex items-center justify-between">
        <Link to="/cartographie" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour
        </Link>
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          solutio.work
        </Link>
      </div>

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/15">
              <Map className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">Solutio</span>
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Carto</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1.5">
              {mode === "login" ? "Connectez-vous" : "Creez votre compte"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Accedez a vos diagnostics organisationnels"
                : "Commencez votre diagnostic gratuitement"}
            </p>
          </div>

          {/* Card */}
          <div className="bg-background rounded-2xl border border-border/40 shadow-sm p-6 sm:p-8 space-y-5">
            {mode === "login" ? (
              <>
                {magicLinkSent ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-950/30 flex items-center justify-center mx-auto">
                      <Mail className="w-6 h-6 text-cyan-600" />
                    </div>
                    <h3 className="font-semibold text-foreground">Lien de connexion envoye</h3>
                    <p className="text-sm text-muted-foreground">
                      Consultez votre boite email ({loginEmail}) et cliquez sur le lien pour vous connecter.
                    </p>
                    <button
                      onClick={() => setMagicLinkSent(false)}
                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                    >
                      Retour
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Google OAuth */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 text-sm font-medium"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                    >
                      <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continuer avec Google
                    </Button>

                    {/* Separator */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/60" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-background px-3 text-xs text-muted-foreground">ou</span>
                      </div>
                    </div>

                    {/* Email/password form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="votre@email.com"
                          className="h-11"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="login-password" className="text-sm font-medium">Mot de passe</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Votre mot de passe"
                          className="h-11"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-medium" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Se connecter
                      </Button>
                    </form>

                    {/* Magic link */}
                    <button
                      type="button"
                      onClick={handleMagicLink}
                      disabled={loading}
                      className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      Recevoir un lien de connexion par email
                    </button>
                  </>
                )}
              </>
            ) : (
              /* REGISTER */
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Google OAuth */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-sm font-medium"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuer avec Google
                </Button>

                {/* Separator */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-xs text-muted-foreground">ou</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-name" className="text-sm font-medium">Nom complet</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password" className="text-sm font-medium">Mot de passe</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 6 caracteres"
                    className="h-11"
                    minLength={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-medium" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Creer mon compte
                </Button>
              </form>
            )}
          </div>

          {/* Toggle login/register */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? (
              <>
                Pas encore de compte ?{" "}
                <button onClick={() => setMode("register")} className="text-foreground font-medium hover:underline">
                  Creer un compte
                </button>
              </>
            ) : (
              <>
                Deja un compte ?{" "}
                <button onClick={() => setMode("login")} className="text-foreground font-medium hover:underline">
                  Se connecter
                </button>
              </>
            )}
          </p>

          {/* Legal */}
          <p className="text-center text-[11px] text-muted-foreground/70 mt-4">
            En continuant, vous acceptez les{" "}
            <Link to="/legal" className="underline hover:text-muted-foreground transition-colors">mentions legales</Link> et la{" "}
            <Link to="/privacy" className="underline hover:text-muted-foreground transition-colors">politique de confidentialite</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartLogin;
