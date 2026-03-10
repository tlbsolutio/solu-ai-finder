import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Map, Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";

type Mode = "login" | "register" | "forgot" | "magic-sent" | "reset-sent";

const GoogleIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const CartLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/cartographie/sessions");
    } catch (err: any) {
      toast({ title: "Erreur de connexion", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caracteres", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Erreur", description: "Entrez votre email", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/cartographie/sessions`,
      });
      if (error) throw error;
      setMode("reset-sent");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast({ title: "Erreur", description: "Entrez votre email", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/cartographie/sessions` },
      });
      if (error) throw error;
      setMode("magic-sent");
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

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setPassword("");
  };

  /* ── Confirmation screens ── */
  const ConfirmationScreen = ({ title, message }: { title: string; message: string }) => (
    <div className="text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto">
        <CheckCircle className="w-7 h-7 text-emerald-600" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
      <button onClick={() => switchMode("login")} className="text-sm font-medium text-foreground hover:underline mt-2">
        Retour a la connexion
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ═══ LEFT PANEL — Brand ═══ */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] shrink-0 relative overflow-hidden" style={{
        background: "linear-gradient(160deg, #0c1a2e 0%, #0f2035 50%, #0a1628 100%)",
      }}>
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.08]" style={{
          background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
        }} />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 w-full">
          {/* Top — Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Map className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-white">Solutio</span>
              <span className="text-base font-bold text-cyan-400">Carto</span>
            </div>
          </div>

          {/* Center — Value prop */}
          <div>
            <h2 className="text-[28px] xl:text-[32px] font-bold text-white leading-tight mb-4">
              Diagnostiquez votre organisation.{" "}
              <span className="text-cyan-400">Transformez-la.</span>
            </h2>
            <p className="text-white/45 text-sm leading-relaxed max-w-sm">
              150 questions, 10 axes d'analyse, une IA qui cartographie vos processus et genere un plan d'action concret.
            </p>

            {/* Mini features */}
            <div className="mt-8 space-y-3">
              {[
                "Questionnaire gratuit, sans engagement",
                "Analyse IA et radar de maturite",
                "Export PDF et plan d'actions priorise",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span className="text-white/50 text-[13px]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — Trust */}
          <p className="text-[11px] text-white/25">
            Donnees chiffrees &middot; Hebergement UE &middot; Conforme RGPD
          </p>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Form ═══ */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Top nav */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/cartographie" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour
          </Link>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Map className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">Solutio <span className="text-cyan-600">Carto</span></span>
          </div>
          <div className="w-16" /> {/* spacer */}
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-5 pb-10">
          <div className="w-full max-w-[380px]">

            {/* ── Magic link sent ── */}
            {mode === "magic-sent" && (
              <ConfirmationScreen
                title="Lien de connexion envoye"
                message={`Un lien de connexion a ete envoye a ${email}. Consultez votre boite email et cliquez sur le lien pour vous connecter.`}
              />
            )}

            {/* ── Reset password sent ── */}
            {mode === "reset-sent" && (
              <ConfirmationScreen
                title="Email de reinitialisation envoye"
                message={`Un email a ete envoye a ${email} avec un lien pour reinitialiser votre mot de passe.`}
              />
            )}

            {/* ── LOGIN ── */}
            {mode === "login" && (
              <>
                <div className="mb-7">
                  <h1 className="text-[22px] font-bold text-foreground mb-1">Connexion</h1>
                  <p className="text-sm text-muted-foreground">Accedez a vos diagnostics</p>
                </div>

                {/* Google */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-[13px] font-medium mb-4"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <GoogleIcon />
                  <span className="ml-2.5">Continuer avec Google</span>
                </Button>

                {/* Separator */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                  <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">ou</span></div>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-[13px] font-medium">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="h-11"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-[13px] font-medium">Mot de passe</Label>
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Mot de passe oublie ?
                      </button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="h-11"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-medium text-[13px]" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Se connecter
                  </Button>
                </form>

                {/* Magic link */}
                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={loading || !email}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-4 disabled:opacity-40"
                >
                  <Mail className="w-3 h-3 inline mr-1.5 -mt-px" />
                  Connexion sans mot de passe
                </button>

                {/* Switch to register */}
                <div className="mt-8 pt-5 border-t text-center">
                  <p className="text-sm text-muted-foreground">
                    Pas encore de compte ?{" "}
                    <button onClick={() => switchMode("register")} className="text-foreground font-medium hover:underline">
                      Creer un compte
                    </button>
                  </p>
                </div>
              </>
            )}

            {/* ── REGISTER ── */}
            {mode === "register" && (
              <>
                <div className="mb-7">
                  <h1 className="text-[22px] font-bold text-foreground mb-1">Creer un compte</h1>
                  <p className="text-sm text-muted-foreground">Commencez votre diagnostic gratuitement</p>
                </div>

                {/* Google */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 text-[13px] font-medium mb-4"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <GoogleIcon />
                  <span className="ml-2.5">S'inscrire avec Google</span>
                </Button>

                {/* Separator */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                  <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">ou</span></div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name" className="text-[13px] font-medium">Nom complet</Label>
                    <Input
                      id="reg-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jean Dupont"
                      className="h-11"
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="text-[13px] font-medium">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="h-11"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password" className="text-[13px] font-medium">Mot de passe</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 caracteres"
                      className="h-11"
                      minLength={6}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-medium text-[13px]" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Creer mon compte
                  </Button>
                </form>

                {/* Switch to login */}
                <div className="mt-8 pt-5 border-t text-center">
                  <p className="text-sm text-muted-foreground">
                    Deja un compte ?{" "}
                    <button onClick={() => switchMode("login")} className="text-foreground font-medium hover:underline">
                      Se connecter
                    </button>
                  </p>
                </div>
              </>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {mode === "forgot" && (
              <>
                <div className="mb-7">
                  <h1 className="text-[22px] font-bold text-foreground mb-1">Mot de passe oublie</h1>
                  <p className="text-sm text-muted-foreground">Entrez votre email pour recevoir un lien de reinitialisation</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email" className="text-[13px] font-medium">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="h-11"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-medium text-[13px]" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Envoyer le lien
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button onClick={() => switchMode("login")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Retour a la connexion
                  </button>
                </div>
              </>
            )}

            {/* Legal footer */}
            {(mode === "login" || mode === "register") && (
              <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
                En continuant, vous acceptez les{" "}
                <Link to="/legal" className="underline hover:text-muted-foreground transition-colors">mentions legales</Link> et la{" "}
                <Link to="/privacy" className="underline hover:text-muted-foreground transition-colors">politique de confidentialite</Link>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartLogin;
