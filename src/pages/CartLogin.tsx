import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Map, Loader2, CheckCircle, Mail } from "lucide-react";

type View = "login" | "register" | "forgot" | "check-email";

const CartLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("login");
  const [checkEmailMessage, setCheckEmailMessage] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const switchView = (v: View) => {
    setView(v);
    setPassword("");
  };

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
      setCheckEmailMessage("Un email de confirmation a ete envoye a " + email + ". Verifiez votre boite de reception pour activer votre compte.");
      setView("check-email");
    } catch (err: any) {
      toast({ title: "Erreur d'inscription", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/cartographie/sessions`,
      });
      if (error) throw error;
      setCheckEmailMessage("Un email de reinitialisation a ete envoye a " + email + ". Cliquez sur le lien pour choisir un nouveau mot de passe.");
      setView("check-email");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/cartographie/sessions` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-background">

      {/* ═══ LEFT — Form ═══ */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-5">
          <Link to="/cartographie" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Map className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">Solutio</span>
            <span className="text-sm font-bold text-cyan-600">Carto</span>
          </Link>
          {view !== "check-email" && (
            <p className="text-sm text-muted-foreground">
              {view === "login" || view === "forgot" ? (
                <>Pas de compte ? <button onClick={() => switchView("register")} className="text-foreground font-medium hover:underline">S'inscrire</button></>
              ) : (
                <>Deja inscrit ? <button onClick={() => switchView("login")} className="text-foreground font-medium hover:underline">Se connecter</button></>
              )}
            </p>
          )}
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 pb-12">
          <div className="w-full max-w-[400px]">

            {/* ── Check email confirmation ── */}
            {view === "check-email" && (
              <div className="text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Verifiez votre email</h1>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {checkEmailMessage}
                </p>
                <div className="pt-2">
                  <button onClick={() => switchView("login")} className="text-sm font-medium text-foreground hover:underline">
                    Retour a la connexion
                  </button>
                </div>
              </div>
            )}

            {/* ── LOGIN ── */}
            {view === "login" && (
              <>
                <div className="mb-8">
                  <h1 className="text-[28px] font-bold text-foreground mb-2">Connexion</h1>
                  <p className="text-muted-foreground">Accedez a vos diagnostics organisationnels</p>
                </div>

                {/* Google */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-sm font-medium rounded-xl"
                  onClick={handleGoogleLogin}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuer avec Google
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                  <div className="relative flex justify-center"><span className="bg-white dark:bg-background px-4 text-xs text-muted-foreground uppercase tracking-wider">ou</span></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="h-12 rounded-xl"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-sm">Mot de passe</Label>
                      <button
                        type="button"
                        onClick={() => switchView("forgot")}
                        className="text-xs text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
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
                      className="h-12 rounded-xl"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium text-sm shadow-lg shadow-cyan-500/20"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Se connecter
                  </Button>
                </form>

                {/* Legal */}
                <p className="text-[11px] text-muted-foreground/60 mt-8 text-center leading-relaxed">
                  En continuant, vous acceptez les{" "}
                  <Link to="/legal" className="underline hover:text-muted-foreground">conditions d'utilisation</Link> et la{" "}
                  <Link to="/privacy" className="underline hover:text-muted-foreground">politique de confidentialite</Link>.
                </p>
              </>
            )}

            {/* ── REGISTER ── */}
            {view === "register" && (
              <>
                <div className="mb-8">
                  <h1 className="text-[28px] font-bold text-foreground mb-2">Creer un compte</h1>
                  <p className="text-muted-foreground">Diagnostic gratuit, sans engagement</p>
                </div>

                {/* Google */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-sm font-medium rounded-xl"
                  onClick={handleGoogleLogin}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  S'inscrire avec Google
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                  <div className="relative flex justify-center"><span className="bg-white dark:bg-background px-4 text-xs text-muted-foreground uppercase tracking-wider">ou</span></div>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="text-sm">Nom complet</Label>
                    <Input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" className="h-12 rounded-xl" autoComplete="name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-sm">Email professionnel</Label>
                    <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="h-12 rounded-xl" required autoComplete="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-sm">Mot de passe</Label>
                    <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caracteres" className="h-12 rounded-xl" minLength={6} required autoComplete="new-password" />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium text-sm shadow-lg shadow-cyan-500/20"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Creer mon compte
                  </Button>
                </form>

                <p className="text-[11px] text-muted-foreground/60 mt-8 text-center leading-relaxed">
                  En creant un compte, vous acceptez les{" "}
                  <Link to="/legal" className="underline hover:text-muted-foreground">conditions d'utilisation</Link> et la{" "}
                  <Link to="/privacy" className="underline hover:text-muted-foreground">politique de confidentialite</Link>.
                </p>
              </>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {view === "forgot" && (
              <>
                <div className="mb-8">
                  <h1 className="text-[28px] font-bold text-foreground mb-2">Mot de passe oublie</h1>
                  <p className="text-muted-foreground">Entrez votre email pour recevoir un lien de reinitialisation</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-sm">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="h-12 rounded-xl"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium text-sm shadow-lg shadow-cyan-500/20"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Envoyer le lien de reinitialisation
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button onClick={() => switchView("login")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Retour a la connexion
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* ═══ RIGHT — Brand panel ═══ */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] shrink-0 relative overflow-hidden" style={{
        background: "linear-gradient(160deg, #0c1a2e 0%, #0f2035 50%, #0a1628 100%)",
      }}>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        {/* Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full" style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)",
        }} />
        <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] rounded-full" style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
        }} />

        <div className="relative z-10 flex flex-col justify-center items-center p-12 xl:p-14 w-full">
          {/* Logo complet */}
          <div className="mb-12">
            <img
              src="/logo-solutio-full.svg"
              alt="Solutio"
              className="h-12 xl:h-14 w-auto opacity-70"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>

          <h2 className="text-[26px] xl:text-[30px] font-bold text-white leading-tight mb-4 text-center">
            Diagnostiquez votre organisation.{" "}
            <span className="text-cyan-400">Transformez-la.</span>
          </h2>
          <p className="text-white/40 text-[13px] leading-relaxed mb-10 max-w-sm text-center">
            150 questions, 10 axes d'analyse, une IA qui cartographie vos processus et genere un plan d'action concret.
          </p>

          {/* Key points */}
          <div className="space-y-5 mb-12 w-full max-w-sm">
            {[
              { num: "01", title: "Questionnaire gratuit", desc: "150 questions, 10 packs, a votre rythme" },
              { num: "02", title: "Analyse IA", desc: "Radar, irritants, quick wins, plan d'actions" },
              { num: "03", title: "Livrables concrets", desc: "Export PDF, carte interactive, recommandations" },
            ].map((item) => (
              <div key={item.num} className="flex gap-4">
                <span className="text-lg font-bold text-cyan-400/60 mt-0.5">{item.num}</span>
                <div>
                  <p className="text-sm font-semibold text-white/90">{item.title}</p>
                  <p className="text-xs text-white/35 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-white/25 mb-8 justify-center">
            <span>Donnees chiffrees</span>
            <span>Hebergement UE</span>
            <span>Conforme RGPD</span>
          </div>

          {/* Bottom branding */}
          <div className="border-t border-white/8 pt-5 w-full text-center">
            <p className="text-[11px] text-white/20 leading-relaxed">
              Disponible en marque blanche.{" "}
              <Link to="/contact" className="text-cyan-400/50 hover:text-cyan-400/80 underline transition-colors">
                Contactez-nous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartLogin;
