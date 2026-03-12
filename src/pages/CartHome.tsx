import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import MetaTags from "@/components/seo/MetaTags";
import {
  ArrowRight,
  Brain,
  ChartColumn,
  ChevronDown,
  CircleCheckBig,
  Clock,
  Download,
  DollarSign,
  FileText,
  Layers,
  ListChecks,
  Lock,
  Map,
  Network,
  Presentation,
  RefreshCw,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Target,
  TriangleAlert,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

/* ── Radar mini-chart (SVG) ─────────────────────────────────────────── */
const RadarPreview = ({ t }: { t: (k: string) => string }) => {
  const axes = [
    { label: t("carto.radar_strategie"), value: 0.8 },
    { label: t("carto.radar_process"), value: 0.5 },
    { label: t("carto.radar_tech"), value: 0.65 },
    { label: t("carto.radar_rh"), value: 0.45 },
    { label: t("carto.radar_data"), value: 0.7 },
    { label: t("carto.radar_culture"), value: 0.55 },
    { label: t("carto.radar_finance"), value: 0.75 },
    { label: t("carto.radar_client"), value: 0.6 },
    { label: t("carto.radar_innovation"), value: 0.4 },
    { label: t("carto.radar_ops"), value: 0.85 },
  ];
  const size = 260;
  const center = 130;
  const radius = 90;
  const count = axes.length;

  const point = (idx: number, r: number) => {
    const angle = (Math.PI * 2 * idx) / count - Math.PI / 2;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const dataPoints = axes.map((a, i) => point(i, radius * a.value));
  const polygon =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      {[0.25, 0.5, 0.75, 1].map((scale) => {
        const ring = Array.from({ length: count }, (_, i) => point(i, radius * scale));
        return (
          <path
            key={scale}
            d={ring.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z"}
            fill="none"
            stroke="rgba(6,182,212,0.12)"
            strokeWidth="1"
          />
        );
      })}
      {axes.map((_, i) => {
        const p = point(i, radius);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="rgba(6,182,212,0.08)"
            strokeWidth="1"
          />
        );
      })}
      <path d={polygon} fill="rgba(6,182,212,0.15)" stroke="rgba(6,182,212,0.7)" strokeWidth="2">
        <animate attributeName="opacity" from="0" to="1" dur="1.2s" fill="freeze" />
      </path>
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#06b6d4" stroke="#fff" strokeWidth="1.5">
          <animate attributeName="r" from="0" to="3.5" dur="0.8s" begin={`${i * 0.06}s`} fill="freeze" />
        </circle>
      ))}
      {axes.map((a, i) => {
        const p = point(i, radius + 16);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-gray-400 text-[7px] font-semibold uppercase tracking-wider"
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
};

/* ── Hero browser preview (session dashboard mock) ──────────────────── */
const HeroPreview = ({ t }: { t: (k: string) => string }) => (
  <div className="rounded-2xl border border-border/40 bg-card shadow-2xl shadow-cyan-500/[0.08] overflow-hidden">
    {/* Title bar */}
    <div className="h-10 bg-slate-50 dark:bg-slate-800/80 border-b border-border/30 flex items-center px-4 gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
      <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
      <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
      <div className="flex-1 flex justify-center">
        <div className="text-[9px] text-muted-foreground font-medium bg-slate-100 dark:bg-slate-700 rounded-md px-4 py-0.5 flex items-center gap-1.5">
          <Shield className="w-2.5 h-2.5 text-green-500" />
          solutio.work/cartographie/sessions
        </div>
      </div>
    </div>

    <div className="flex">
      {/* Sidebar */}
      <div className="hidden sm:flex w-12 bg-slate-50/80 dark:bg-slate-800/40 border-r border-border/20 flex-col items-center py-3 gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Map className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="w-6 h-[1px] bg-border/30" />
        {[ChartColumn, FileText, Target, Settings].map((Icon, i) => (
          <div
            key={i}
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${i === 0 ? "bg-cyan-50 dark:bg-cyan-900/30" : ""}`}
          >
            <Icon className={`w-3.5 h-3.5 ${i === 0 ? "text-cyan-600" : "text-muted-foreground/50"}`} />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-foreground">{t("carto.preview_session_title")}</p>
            <p className="text-[10px] text-muted-foreground">{t("carto.preview_session_progress")}</p>
          </div>
          <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200/60 text-[9px]">
            {t("carto.preview_badge_inprogress")}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: "70%" }} />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground">
            <span>7/10 packs</span>
            <span>70%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/40 p-3 flex items-center justify-center relative">
            <div className="w-28 h-28">
              <RadarPreview t={t} />
            </div>
            <div className="absolute bottom-1.5 right-2 text-[8px] text-muted-foreground/60 font-medium">Score global</div>
          </div>
          <div className="space-y-1.5">
            {[
              { label: t("carto.preview_stat1_label"), value: t("carto.preview_stat1_value"), color: "text-cyan-600", barColor: "bg-cyan-500", pct: 65 },
              { label: t("carto.preview_stat2_label"), value: t("carto.preview_stat2_value"), color: "text-red-500", barColor: "bg-red-500", pct: 30 },
              { label: t("carto.preview_stat3_label"), value: t("carto.preview_stat3_value"), color: "text-amber-600", barColor: "bg-amber-500", pct: 50 },
              { label: t("carto.preview_stat4_label"), value: t("carto.preview_stat4_value"), color: "text-emerald-600", barColor: "bg-emerald-500", pct: 80 },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-slate-50/80 dark:bg-slate-800/30 p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-muted-foreground">{s.label}</span>
                  <span className={`text-[10px] font-bold ${s.color}`}>{s.value}</span>
                </div>
                <div className="w-full h-1 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${s.barColor} rounded-full`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 10 }, (_, i) => {
            const labels = ["STR", "PRO", "TEC", "RH", "DAT", "CUL", "FIN", "CLI", "INN", "OPS"];
            return (
              <div
                key={i}
                className={`rounded-lg h-7 flex flex-col items-center justify-center ${
                  i < 7
                    ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
                    : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                }`}
              >
                {i < 7 ? <CircleCheckBig className="w-2.5 h-2.5" /> : null}
                <span className="text-[6px] font-bold mt-0.5">{labels[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

/* ── Questionnaire preview card ─────────────────────────────────────── */
const QuestionnairePreview = ({ t }: { t: (k: string) => string }) => (
  <div className="rounded-2xl border border-border/40 bg-card shadow-xl shadow-cyan-500/[0.06] overflow-hidden">
    <div className="p-5 border-b border-border/30 bg-gradient-to-r from-cyan-50/80 to-blue-50/80 dark:from-cyan-950/20 dark:to-blue-950/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <FileText className="w-3 h-3 text-white" />
          </div>
          <div>
            <Badge variant="secondary" className="text-[9px]">{t("carto.preview_pack_label")}</Badge>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">{t("carto.preview_pack_name")}</span>
      </div>
      <div className="space-y-1">
        <div className="w-full h-1.5 bg-white/60 rounded-full">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: "60%" }} />
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground/70">
          <span>Question 9/15</span>
          <span>60%</span>
        </div>
      </div>
    </div>

    <div className="p-5 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md">Q9</span>
          <div className="flex-1 h-px bg-border/20" />
        </div>
        <p className="text-xs font-semibold text-foreground mb-3">{t("carto.preview_question")}</p>
        <div className="space-y-2">
          {[t("carto.preview_opt1"), t("carto.preview_opt2"), t("carto.preview_opt3"), t("carto.preview_opt4")].map(
            (opt, i) => (
              <label
                key={opt}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-[11px] cursor-pointer transition-all ${
                  i === 1
                    ? "border-cyan-300 bg-cyan-50/50 text-foreground shadow-sm ring-1 ring-cyan-200/50"
                    : "border-border/40 text-muted-foreground hover:border-border"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    i === 1 ? "border-cyan-500 bg-cyan-500" : "border-muted-foreground/30"
                  }`}
                >
                  {i === 1 && <CircleCheckBig className="w-3 h-3 text-white" />}
                </div>
                {opt}
              </label>
            )
          )}
        </div>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-border/20">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i < 8
                  ? "w-1.5 h-1.5 bg-cyan-500"
                  : i === 8
                    ? "w-2.5 h-2.5 bg-cyan-500 ring-2 ring-cyan-200"
                    : "w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-muted-foreground">
            {t("carto.preview_btn_prev")}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-[10px] font-medium text-white shadow-sm shadow-cyan-500/20">
            {t("carto.preview_btn_next")}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ── FAQ accordion item ─────────────────────────────────────────────── */
const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 px-2 text-left group"
      >
        <span className="text-[15px] font-semibold text-foreground group-hover:text-cyan-600 transition-colors pr-4">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-5" : "max-h-0"}`}>
        <p className="text-sm text-muted-foreground leading-relaxed px-2">{a}</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   CartHome — main page component
   ═══════════════════════════════════════════════════════════════════════ */
const CartHome = () => {
  const { t } = useLanguage();

  const packs = [
    t("carto.pack1"), t("carto.pack2"), t("carto.pack3"), t("carto.pack4"), t("carto.pack5"),
    t("carto.pack6"), t("carto.pack7"), t("carto.pack8"), t("carto.pack9"), t("carto.pack10"),
  ];
  const freeFeatures = [
    t("carto.free1"), t("carto.free2"), t("carto.free3"), t("carto.free4"), t("carto.free5"),
  ];
  const autonomeFeatures = [
    t("carto.autonome1"), t("carto.autonome2"), t("carto.autonome3"), t("carto.autonome4"),
    t("carto.autonome5"), t("carto.autonome6"), t("carto.autonome7"), t("carto.autonome8"),
  ];
  const accompFeatures = [
    t("carto.accomp1"), t("carto.accomp2"), t("carto.accomp3"), t("carto.accomp4"), t("carto.accomp5"),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta */}
      <MetaTags
        title="Cartographie Organisationnelle Gratuite — Solutio Carto"
        description="Diagnostic organisationnel en 10 packs. 150 questions, analyse IA, plan d'action concret. Gratuit pour commencer. Analyse IA a partir de 349\u20ac."
        keywords={t("carto.meta_keywords")}
      />

      {/* Structured data — SoftwareApplication */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Solutio Carto",
            url: "https://solutio.work/cartographie",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Diagnostic organisationnel en 10 packs. Questionnaire gratuit. Analyse IA \u00e0 partir de 349\u20ac.",
            offers: [
              { "@type": "Offer", name: "D\u00e9couverte", price: "0", priceCurrency: "EUR" },
              { "@type": "Offer", name: "Autonome", price: "349", priceCurrency: "EUR" },
              { "@type": "Offer", name: "Accompagn\u00e9e", price: "890", priceCurrency: "EUR" },
            ],
            provider: { "@type": "Organization", name: "Solutio", url: "https://solutio.work" },
          })}
        </script>
      </Helmet>

      {/* Structured data — FAQPage */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: t("carto.schema_faq1_q"),
                acceptedAnswer: { "@type": "Answer", text: t("carto.schema_faq1_a") },
              },
              {
                "@type": "Question",
                name: t("carto.schema_faq2_q"),
                acceptedAnswer: { "@type": "Answer", text: t("carto.schema_faq2_a") },
              },
              {
                "@type": "Question",
                name: t("carto.schema_faq3_q"),
                acceptedAnswer: { "@type": "Answer", text: t("carto.schema_faq3_a") },
              },
              {
                "@type": "Question",
                name: t("carto.schema_faq4_q"),
                acceptedAnswer: { "@type": "Answer", text: t("carto.schema_faq4_a") },
              },
            ],
          })}
        </script>
      </Helmet>

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative pt-28 pb-20 sm:pt-32 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/80 via-blue-50/30 to-background dark:from-cyan-950/30 dark:via-blue-950/10 dark:to-background" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(6,182,212,0.04) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)" }}
        />

        <div className="relative container mx-auto px-6 sm:px-10">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            {/* Left column */}
            <div className="max-w-xl">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Map className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-sm font-bold text-foreground tracking-tight">{t("carto.hero_brand")}</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 text-[10px] ml-1">
                  {t("carto.hero_badge_free")}
                </Badge>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.06] tracking-tight mb-3">
                {t("carto.hero_title1")}
              </h1>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 mb-6">
                {t("carto.hero_title2")}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
                {t("carto.hero_subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link to="/cartographie/login">
                  <Button
                    size="xl"
                    variant="hero"
                    className="w-full sm:w-auto shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/35 transition-shadow"
                  >
                    {t("carto.hero_cta_start")}
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Button
                  size="xl"
                  variant="outline"
                  className="w-full sm:w-auto hover:bg-muted/50"
                  onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                >
                  {t("carto.hero_cta_pricing")}
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-500" /> {t("carto.hero_trust1")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-500" /> {t("carto.hero_trust2")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-500" /> {t("carto.hero_trust3")}
                </span>
              </div>
            </div>

            {/* Right column — browser preview */}
            <div className="relative">
              <div
                className="absolute -inset-8 rounded-3xl opacity-60"
                style={{ background: "radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%)" }}
              />
              <div className="relative">
                <HeroPreview t={t} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-cyan-50/20 to-slate-50/80 dark:from-slate-900/30 dark:via-cyan-950/10 dark:to-slate-900/30" />
        <div className="relative container mx-auto px-6 sm:px-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center tracking-tight mb-4">
            {t("carto.how_title")}
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-lg mx-auto text-lg">
            {t("carto.how_subtitle")}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto relative">
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-cyan-200 via-blue-200 to-emerald-200 dark:from-cyan-800 dark:via-blue-800 dark:to-emerald-800" />
            {[
              { icon: FileText, step: "1", title: t("carto.how_step1_title"), desc: t("carto.how_step1_desc"), gradient: "from-cyan-500 to-cyan-600" },
              { icon: Zap, step: "2", title: t("carto.how_step2_title"), desc: t("carto.how_step2_desc"), gradient: "from-blue-500 to-blue-600" },
              { icon: Brain, step: "3", title: t("carto.how_step3_title"), desc: t("carto.how_step3_desc"), gradient: "from-violet-500 to-violet-600" },
              { icon: Target, step: "4", title: t("carto.how_step4_title"), desc: t("carto.how_step4_desc"), gradient: "from-emerald-500 to-emerald-600" },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg relative z-10`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="mb-3 text-xs font-semibold">
                  {t("carto.how_step_label")} {item.step}
                </Badge>
                <h3 className="text-base font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ PACKS ════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">{t("carto.pack_title")}</h2>
            <p className="text-muted-foreground text-lg">{t("carto.pack_subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
            {packs.map((pack, i) => (
              <div
                key={pack}
                className="group flex items-center gap-3 p-4 rounded-2xl bg-background border border-border/30 hover:border-cyan-300/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium">{pack}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-10">
            ~10 minutes par pack &middot; Reprenez &agrave; tout moment &middot; Donn&eacute;es sauvegard&eacute;es
          </p>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-cyan-50 text-cyan-700 border-cyan-200/60 text-[10px] font-bold tracking-wider">
              {t("carto.feature_badge")}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">{t("carto.feature_title")}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">{t("carto.feature_subtitle")}</p>
          </div>

          {/* Feature row 1 — Questionnaire */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-5xl mx-auto mb-24">
            <div className="order-2 lg:order-1">
              <QuestionnairePreview t={t} />
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-cyan-700" />
                </div>
                <h3 className="text-xl font-bold">{t("carto.feature_quest_title")}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6 text-[15px]">{t("carto.feature_quest_desc")}</p>
              <ul className="space-y-3">
                {[t("carto.feature_quest1"), t("carto.feature_quest2"), t("carto.feature_quest3"), t("carto.feature_quest4")].map(
                  (feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm">
                      <div className="w-5 h-5 rounded-full bg-cyan-50 flex items-center justify-center shrink-0">
                        <CircleCheckBig className="w-3.5 h-3.5 text-cyan-600" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Feature row 2 — AI Analysis */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-5xl mx-auto mb-24">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="text-xl font-bold">{t("carto.feature_ai_title")}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6 text-[15px]">{t("carto.feature_ai_desc")}</p>
              <ul className="space-y-3">
                {[t("carto.feature_ai1"), t("carto.feature_ai2"), t("carto.feature_ai3"), t("carto.feature_ai4")].map(
                  (feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <CircleCheckBig className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* AI analysis preview card */}
            <div>
              <div className="rounded-2xl border border-border/40 bg-card shadow-xl shadow-emerald-500/[0.06] overflow-hidden">
                <div className="p-5 border-b border-border/30 bg-gradient-to-r from-emerald-50/80 to-cyan-50/80 dark:from-emerald-950/20 dark:to-cyan-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">{t("carto.preview_analysis_title")}</p>
                      <p className="text-[10px] text-muted-foreground">{t("carto.preview_analysis_score")}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-[10px] font-black text-white">6.2</span>
                      </div>
                      <span className="text-[8px] text-muted-foreground">/10</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1 mt-3">
                    {[
                      { label: "Strat", pct: 80, color: "bg-cyan-500" },
                      { label: "Proc", pct: 45, color: "bg-blue-500" },
                      { label: "Tech", pct: 65, color: "bg-violet-500" },
                      { label: "RH", pct: 40, color: "bg-amber-500" },
                      { label: "Data", pct: 70, color: "bg-emerald-500" },
                    ].map((bar) => (
                      <div key={bar.label} className="text-center">
                        <div className="w-full h-8 bg-white/60 dark:bg-slate-800/40 rounded relative overflow-hidden">
                          <div
                            className={`absolute bottom-0 w-full ${bar.color} rounded-t transition-all`}
                            style={{ height: `${bar.pct}%` }}
                          />
                        </div>
                        <span className="text-[7px] text-muted-foreground font-medium">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="rounded-xl bg-red-50/80 dark:bg-red-950/20 border border-red-200/40 p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                        {t("carto.preview_irritant_label")}
                      </p>
                      <span className="text-[8px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">
                        S&eacute;v&eacute;rit&eacute; haute
                      </span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{t("carto.preview_irritant_text")}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/40 p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                        {t("carto.preview_quickwin_label")}
                      </p>
                      <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        Effort faible
                      </span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{t("carto.preview_quickwin_text")}</p>
                  </div>
                  <div className="rounded-xl bg-cyan-50/80 dark:bg-cyan-950/20 border border-cyan-200/40 p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">
                        {t("carto.preview_strength_label")}
                      </p>
                      <span className="text-[8px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Confirm&eacute;
                      </span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{t("carto.preview_strength_text")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature row 3 — Interactive Map */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-5xl mx-auto mb-24">
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border border-border/40 bg-card shadow-xl shadow-blue-500/[0.06] overflow-hidden">
                <div className="p-4 border-b border-border/30 bg-gradient-to-r from-blue-50/80 to-violet-50/80 dark:from-blue-950/20 dark:to-violet-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                      <Network className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-xs font-bold text-foreground">Carte organisationnelle</p>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="px-2 py-0.5 rounded bg-blue-100 text-[9px] font-bold text-blue-700 cursor-pointer">&minus;</div>
                    <div className="px-2 py-0.5 rounded bg-blue-100 text-[9px] font-bold text-blue-700 cursor-pointer">+</div>
                    <div className="px-2 py-0.5 rounded bg-blue-100 text-[9px] font-bold text-blue-700 cursor-pointer">Fit</div>
                    <div className="w-px bg-border/30" />
                    <div className="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-600 cursor-pointer flex items-center gap-1">
                      <Download className="w-2.5 h-2.5" /> PNG
                    </div>
                  </div>
                </div>
                <div
                  className="p-4 relative bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/20 dark:to-card"
                  style={{ minHeight: 220 }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.15) 1px, transparent 0)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                  <svg viewBox="0 0 420 200" className="w-full h-auto relative">
                    <defs>
                      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
                      </filter>
                      <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(6,182,212,0.4)" />
                        <stop offset="100%" stopColor="rgba(59,130,246,0.4)" />
                      </linearGradient>
                    </defs>
                    {/* Edges */}
                    <path d="M210,38 C210,60 100,60 100,95" fill="none" stroke="url(#edgeGrad)" strokeWidth="1.5" />
                    <path d="M210,38 C210,60 320,60 320,95" fill="none" stroke="url(#edgeGrad)" strokeWidth="1.5" />
                    <path d="M210,38 C210,55 210,60 210,95" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="1" strokeDasharray="4,3" />
                    <path d="M100,118 C100,135 55,135 55,158" fill="none" stroke="rgba(59,130,246,0.25)" strokeWidth="1" />
                    <path d="M100,118 C100,135 155,135 155,158" fill="none" stroke="rgba(59,130,246,0.25)" strokeWidth="1" />
                    <path d="M320,118 C320,135 265,135 265,158" fill="none" stroke="rgba(16,185,129,0.25)" strokeWidth="1" />
                    <path d="M320,118 C320,135 370,135 370,158" fill="none" stroke="rgba(239,68,68,0.25)" strokeWidth="1" />
                    <path d="M155,170 C200,185 230,185 265,170" fill="none" stroke="rgba(239,68,68,0.2)" strokeWidth="1" strokeDasharray="3,3" />

                    {/* Direction node */}
                    <rect x="168" y="12" width="84" height="38" rx="12" fill="white" stroke="rgba(6,182,212,0.6)" strokeWidth="2" filter="url(#shadow)" />
                    <rect x="168" y="12" width="84" height="38" rx="12" fill="rgba(6,182,212,0.06)" />
                    <circle cx="190" cy="26" r="4" fill="rgba(6,182,212,0.2)" />
                    <text x="190" y="28" textAnchor="middle" className="text-[6px] fill-cyan-600">&#x1F464;</text>
                    <text x="220" y="28" textAnchor="middle" className="text-[8px] font-bold fill-cyan-800">Direction</text>
                    <text x="210" y="42" textAnchor="middle" className="text-[6px] fill-gray-400">3 personnes &middot; Strat&eacute;gie</text>

                    {/* RH node */}
                    <rect x="178" y="95" width="64" height="28" rx="8" fill="white" stroke="rgba(6,182,212,0.35)" strokeWidth="1" filter="url(#shadow)" />
                    <rect x="178" y="95" width="64" height="28" rx="8" fill="rgba(6,182,212,0.04)" />
                    <text x="210" y="112" textAnchor="middle" className="text-[7px] font-bold fill-cyan-700">RH</text>

                    {/* Commercial node */}
                    <rect x="55" y="95" width="90" height="36" rx="12" fill="white" stroke="rgba(59,130,246,0.5)" strokeWidth="1.5" filter="url(#shadow)" />
                    <rect x="55" y="95" width="90" height="36" rx="12" fill="rgba(59,130,246,0.05)" />
                    <text x="100" y="110" textAnchor="middle" className="text-[8px] font-bold fill-blue-700">Commercial</text>
                    <text x="100" y="122" textAnchor="middle" className="text-[6px] fill-gray-400">5 processus &middot; 12 outils</text>

                    {/* Operations node */}
                    <rect x="275" y="95" width="90" height="36" rx="12" fill="white" stroke="rgba(16,185,129,0.5)" strokeWidth="1.5" filter="url(#shadow)" />
                    <rect x="275" y="95" width="90" height="36" rx="12" fill="rgba(16,185,129,0.05)" />
                    <text x="320" y="110" textAnchor="middle" className="text-[8px] font-bold fill-emerald-700">Op&eacute;rations</text>
                    <text x="320" y="122" textAnchor="middle" className="text-[6px] fill-gray-400">8 processus &middot; 6 outils</text>

                    {/* Salesforce tool */}
                    <rect x="18" y="155" width="72" height="28" rx="8" fill="white" stroke="rgba(168,85,247,0.4)" strokeWidth="1" filter="url(#shadow)" />
                    <rect x="18" y="155" width="72" height="28" rx="8" fill="rgba(168,85,247,0.05)" />
                    <circle cx="34" cy="169" r="5" fill="rgba(168,85,247,0.15)" />
                    <text x="34" y="172" textAnchor="middle" className="text-[6px] fill-violet-600">&#x2699;</text>
                    <text x="66" y="172" textAnchor="middle" className="text-[7px] font-semibold fill-violet-700">Salesforce</text>

                    {/* Saisie double irritant */}
                    <rect x="110" y="155" width="86" height="28" rx="8" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.4)" strokeWidth="1" strokeDasharray="4,2" />
                    <circle cx="127" cy="169" r="5" fill="rgba(239,68,68,0.15)">
                      <animate attributeName="r" values="5;6;5" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text x="127" y="172" textAnchor="middle" className="text-[6px] fill-red-500">&#x26A0;</text>
                    <text x="160" y="172" textAnchor="middle" className="text-[7px] font-semibold fill-red-600">Saisie double</text>

                    {/* ERP interne tool */}
                    <rect x="228" y="155" width="72" height="28" rx="8" fill="white" stroke="rgba(168,85,247,0.4)" strokeWidth="1" filter="url(#shadow)" />
                    <rect x="228" y="155" width="72" height="28" rx="8" fill="rgba(168,85,247,0.05)" />
                    <circle cx="244" cy="169" r="5" fill="rgba(168,85,247,0.15)" />
                    <text x="244" y="172" textAnchor="middle" className="text-[6px] fill-violet-600">&#x2699;</text>
                    <text x="276" y="172" textAnchor="middle" className="text-[7px] font-semibold fill-violet-700">ERP interne</text>

                    {/* Goulot irritant */}
                    <rect x="330" y="155" width="72" height="28" rx="8" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.4)" strokeWidth="1" strokeDasharray="4,2" />
                    <circle cx="347" cy="169" r="5" fill="rgba(239,68,68,0.15)">
                      <animate attributeName="r" values="5;6;5" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <text x="347" y="172" textAnchor="middle" className="text-[6px] fill-red-500">&#x26A0;</text>
                    <text x="377" y="172" textAnchor="middle" className="text-[7px] font-semibold fill-red-600">Goulot</text>
                  </svg>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mt-3 justify-center bg-white/80 dark:bg-slate-900/50 rounded-lg px-4 py-2 border border-border/20">
                    <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-medium">
                      <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400/40 border border-cyan-300/50" /> &Eacute;quipes
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-medium">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-400/40 border border-blue-300/50" /> Processus
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-medium">
                      <span className="w-2.5 h-2.5 rounded-sm bg-violet-400/40 border border-violet-300/50" /> Outils
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-medium">
                      <span className="w-2.5 h-2.5 rounded-sm border border-red-300 border-dashed bg-red-50" /> Irritants
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center">
                  <Network className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold">Carte organisationnelle interactive</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6 text-[15px]">
                Visualisez votre organisation comme un syst&egrave;me vivant. &Eacute;quipes, processus, outils et
                irritants sont connect&eacute;s dans un graphe interactif &mdash; zoom, navigation, d&eacute;tails au
                clic.
              </p>
              <ul className="space-y-3">
                {[
                  "Noeuds : \u00e9quipes, processus, outils, irritants",
                  "Layout automatique intelligent (ELK)",
                  "Cliquez sur un noeud pour voir le d\u00e9tail",
                  "Export PNG de la carte compl\u00e8te",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <CircleCheckBig className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature cards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: ChartColumn, title: t("carto.feature_card1_title"), desc: t("carto.feature_card1_desc"), color: "text-cyan-600", bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/50" },
              { icon: Map, title: t("carto.feature_card2_title"), desc: t("carto.feature_card2_desc"), color: "text-blue-600", bg: "bg-gradient-to-br from-blue-50 to-blue-100/50" },
              { icon: ListChecks, title: t("carto.feature_card3_title"), desc: t("carto.feature_card3_desc"), color: "text-amber-600", bg: "bg-gradient-to-br from-amber-50 to-amber-100/50" },
              { icon: Users, title: t("carto.feature_card4_title"), desc: t("carto.feature_card4_desc"), color: "text-violet-600", bg: "bg-gradient-to-br from-violet-50 to-violet-100/50" },
              { icon: TrendingUp, title: t("carto.feature_card5_title"), desc: t("carto.feature_card5_desc"), color: "text-emerald-600", bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50" },
              { icon: Download, title: t("carto.feature_card6_title"), desc: t("carto.feature_card6_desc"), color: "text-slate-600", bg: "bg-gradient-to-br from-slate-50 to-slate-100/50" },
            ].map((card) => (
              <Card
                key={card.title}
                className="p-7 border-border/30 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <h3 className="text-base font-bold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ AI EXTRACTION ════════════════ */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-50/20 to-background dark:via-violet-950/5" />
        <div className="relative container mx-auto px-6 sm:px-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-50 text-violet-700 border-violet-200/60 text-[10px] font-bold tracking-wider">
              Extraction IA
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              L'IA analyse vos r&eacute;ponses et extrait{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
                6 types d'objets.
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Chaque pack g&eacute;n&egrave;re automatiquement une cartographie structur&eacute;e de votre
              organisation. Pas de slides g&eacute;n&eacute;riques &mdash; des donn&eacute;es concr&egrave;tes.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { icon: Layers, title: "Processus", desc: "Flux identifi\u00e9s avec type, criticit\u00e9 et description. Commerciaux, op\u00e9rationnels, support \u2014 tout est cartographi\u00e9.", count: "5-20 par pack", color: "text-blue-600", bg: "bg-gradient-to-br from-blue-50 to-blue-100/50", border: "border-blue-200/40" },
              { icon: Settings, title: "Outils & SI", desc: "Logiciels mapp\u00e9s avec niveau d'usage, probl\u00e8mes d\u00e9tect\u00e9s et cat\u00e9gorie. Identifie les doublons et les manques.", count: "3-15 par pack", color: "text-violet-600", bg: "bg-gradient-to-br from-violet-50 to-violet-100/50", border: "border-violet-200/40" },
              { icon: Users, title: "\u00c9quipes", desc: "\u00c9quipes et r\u00f4les avec mission, charge estim\u00e9e et positionnement dans l'organisation.", count: "2-8 par pack", color: "text-cyan-600", bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/50", border: "border-cyan-200/40" },
              { icon: TriangleAlert, title: "Irritants", desc: "Points de friction et goulots d'\u00e9tranglement avec s\u00e9v\u00e9rit\u00e9, impact et source. Ce qui ralentit vraiment.", count: "3-10 par pack", color: "text-red-600", bg: "bg-gradient-to-br from-red-50 to-red-100/50", border: "border-red-200/40" },
              { icon: RefreshCw, title: "T\u00e2ches r\u00e9p\u00e9titives", desc: "T\u00e2ches manuelles r\u00e9currentes avec fr\u00e9quence et d\u00e9tection des doubles saisies. Le premier levier d'automatisation.", count: "2-8 par pack", color: "text-amber-600", bg: "bg-gradient-to-br from-amber-50 to-amber-100/50", border: "border-amber-200/40" },
              { icon: Zap, title: "Quick Wins", desc: "Opportunit\u00e9s \u00e0 impact rapide avec effort estim\u00e9, cat\u00e9gorie et priorit\u00e9. Actions activables imm\u00e9diatement.", count: "2-6 par pack", color: "text-emerald-600", bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50", border: "border-emerald-200/40" },
            ].map((item) => (
              <Card
                key={item.title}
                className={`p-6 rounded-2xl border ${item.border} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">{item.title}</h3>
                    <p className="text-[10px] text-muted-foreground font-medium">{item.count}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ DELIVERABLES ════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-50 text-amber-700 border-amber-200/60 text-[10px] font-bold tracking-wider">
              Livrables
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Ce que vous recevez{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                concr&egrave;tement.
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Au-del&agrave; du diagnostic, l'outil produit des livrables actionnables que vous pouvez partager,
              pr&eacute;senter et utiliser.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-7 rounded-2xl border-border/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Presentation className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-base font-bold">Rapport PDF &amp; Deck PPTX</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Exportez un rapport PDF complet (radar, scores, alertes, analyses par pack, plan d'actions) et un deck
                PowerPoint pr&ecirc;t &agrave; pr&eacute;senter en comit&eacute; de direction.
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-[10px]">PDF multi-pages</Badge>
                <Badge variant="secondary" className="text-[10px]">PPTX 10 slides</Badge>
                <Badge variant="secondary" className="text-[10px]">PNG carte</Badge>
              </div>
            </Card>

            <Card className="p-7 rounded-2xl border-red-200/40 bg-gradient-to-b from-red-50/30 to-background dark:from-red-950/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-100 to-red-200/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-base font-bold">Co&ucirc;t de l'inaction</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                L'IA chiffre le co&ucirc;t annuel de chaque dysfonctionnement d&eacute;tect&eacute;. Temps perdu,
                inefficacit&eacute;s, opportunit&eacute;s manqu&eacute;es &mdash; traduit en euros pour justifier
                l'investissement.
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-[10px]">Chiffrage annuel</Badge>
                <Badge variant="secondary" className="text-[10px]">ROI estim&eacute;</Badge>
              </div>
            </Card>

            <Card className="p-7 rounded-2xl border-border/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold">Recommandations outils</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                L'IA identifie les outils &agrave; remplacer, ceux &agrave; ajouter et les opportunit&eacute;s de
                consolidation. Chaque recommandation inclut la situation actuelle, l'action et le b&eacute;n&eacute;fice
                attendu.
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-[10px]">Remplacement</Badge>
                <Badge variant="secondary" className="text-[10px]">Ajout</Badge>
                <Badge variant="secondary" className="text-[10px]">Consolidation</Badge>
              </div>
            </Card>
          </div>

          {/* Deep analysis banner */}
          <div className="max-w-5xl mx-auto mt-8">
            <Card className="p-7 rounded-2xl border-violet-200/40 bg-gradient-to-r from-violet-50/30 via-blue-50/20 to-cyan-50/30 dark:from-violet-950/10 dark:via-blue-950/5 dark:to-cyan-950/10 hover:shadow-lg transition-all duration-300">
              <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Analyse approfondie</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Au-del&agrave; de l'analyse standard, l'IA g&eacute;n&egrave;re une analyse causale inter-packs
                    (comment les probl&egrave;mes d'un axe impactent les autres), une quantification d'impact
                    chiffr&eacute;e et une vision cible &agrave; 18 mois &mdash; un plan de transformation complet, pas
                    un simple constat.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-violet-100 text-violet-700 border-violet-200/60 text-[10px]">Analyse causale inter-packs</Badge>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200/60 text-[10px]">Quantification d'impact</Badge>
                    <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200/60 text-[10px]">Vision cible 18 mois</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ════════════════ SECURITY ════════════════ */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-50/15 to-background dark:via-emerald-950/5" />
        <div className="relative container mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-200/60 text-[10px] font-bold tracking-wider">
              RGPD
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              {t("carto.security_title")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">
                {t("carto.security_title_highlight")}
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {t("carto.security_subtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Server, title: t("carto.security1_title"), desc: t("carto.security1_desc"), color: "text-blue-600", bg: "bg-gradient-to-br from-blue-50 to-blue-100/50" },
              { icon: Lock, title: t("carto.security2_title"), desc: t("carto.security2_desc"), color: "text-emerald-600", bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50" },
              { icon: ShieldCheck, title: t("carto.security3_title"), desc: t("carto.security3_desc"), color: "text-violet-600", bg: "bg-gradient-to-br from-violet-50 to-violet-100/50" },
              { icon: Shield, title: t("carto.security4_title"), desc: t("carto.security4_desc"), color: "text-cyan-600", bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/50" },
            ].map((item) => (
              <Card
                key={item.title}
                className="p-6 rounded-2xl border-border/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group text-center"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-base font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ PRICING ════════════════ */}
      <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-background to-background dark:from-slate-900/30" />
        <div className="relative container mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">{t("carto.pricing_title")}</h2>
            <p className="text-muted-foreground text-lg">{t("carto.pricing_subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free tier */}
            <Card className="p-7 border-border/30 rounded-2xl hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-bold mb-1">{t("carto.pricing_free_name")}</h3>
              <p className="text-4xl font-black mb-1">{t("carto.pricing_free_price")}</p>
              <p className="text-sm text-muted-foreground mb-7">{t("carto.pricing_free_desc")}</p>
              <ul className="space-y-3 mb-7">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CircleCheckBig className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/cartographie/login">
                <Button variant="outline" className="w-full rounded-xl h-11">{t("carto.pricing_free_cta")}</Button>
              </Link>
            </Card>

            {/* Autonome tier */}
            <Card className="p-7 border-cyan-300/60 bg-gradient-to-b from-cyan-50/50 to-background dark:from-cyan-950/15 relative rounded-2xl shadow-lg shadow-cyan-500/[0.08] hover:shadow-xl transition-all duration-300">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs px-4 py-1 shadow-md">
                {t("carto.pricing_popular")}
              </Badge>
              <h3 className="text-lg font-bold mb-1">{t("carto.pricing_autonome_name")}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="text-4xl font-black">349</p>
                <span className="text-sm text-muted-foreground">{t("carto.pricing_autonome_unit")}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-7">{t("carto.pricing_autonome_desc")}</p>
              <ul className="space-y-3 mb-7">
                {autonomeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CircleCheckBig className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                    <span className={f === t("carto.autonome1") ? "text-muted-foreground" : ""}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/cartographie/login?plan=autonome">
                <Button variant="hero" className="w-full rounded-xl h-11 shadow-lg shadow-cyan-500/20">
                  {t("carto.pricing_autonome_cta")}
                </Button>
              </Link>
            </Card>

            {/* Accompagnee tier */}
            <Card className="p-7 border-border/30 rounded-2xl hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-bold mb-1">{t("carto.pricing_accomp_name")}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="text-4xl font-black">890</p>
                <span className="text-sm text-muted-foreground">{t("carto.pricing_accomp_unit")}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-7">{t("carto.pricing_accomp_desc")}</p>
              <ul className="space-y-3 mb-7">
                {accompFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CircleCheckBig className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span className={f === t("carto.accomp1") ? "text-muted-foreground" : ""}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/cartographie/login?plan=accompagnee">
                <Button variant="outline" className="w-full rounded-xl h-11">{t("carto.pricing_accomp_cta")}</Button>
              </Link>
            </Card>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-500" /> {t("carto.pricing_trust1")}
            </span>
            <span className="flex items-center gap-1.5">
              <CircleCheckBig className="w-3.5 h-3.5 text-emerald-500" /> {t("carto.pricing_trust2")}
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> {t("carto.pricing_trust3")}
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="max-w-[720px] mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-12">{t("carto.faq_title")}</h2>
            <div className="border border-border/30 rounded-2xl px-6 sm:px-8 divide-y divide-border/30 bg-background shadow-sm">
              <FaqItem q={t("carto.faq1_q")} a={t("carto.faq1_a")} />
              <FaqItem q={t("carto.faq2_q")} a={t("carto.faq2_a")} />
              <FaqItem q={t("carto.faq3_q")} a={t("carto.faq3_a")} />
              <FaqItem q={t("carto.faq4_q")} a={t("carto.faq4_a")} />
              <FaqItem q={t("carto.faq5_q")} a={t("carto.faq5_a")} />
              <FaqItem q={t("carto.faq6_q")} a={t("carto.faq6_a")} />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ WHITE LABEL / SOLUTIO BRANDING ════════════════ */}
      <section className="py-16 border-t border-border/20">
        <div className="container mx-auto px-6 sm:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <img
                src="/logos/logo_simple.svg"
                alt="Solutio"
                className="h-6 w-auto opacity-50"
              />
              <span className="text-sm text-muted-foreground">{t("carto.whitelabel_product")}</span>
            </div>
            <span className="hidden sm:block text-muted-foreground/30">|</span>
            <Link
              to="/contact"
              className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
            >
              {t("carto.whitelabel_cta")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CartHome;
