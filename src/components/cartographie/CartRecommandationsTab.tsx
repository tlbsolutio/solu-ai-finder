import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CartOutilV2, CartIrritantV2, CartPackResume } from "@/lib/cartTypes";
import {
  SAAS_CATALOG,
  BLOC_TO_CATEGORIES,
  getRecommendationsForBloc,
  type SaasRecommendation,
  type SaasCategorie,
} from "@/lib/saasRecommendations";
import {
  Laptop,
  ArrowRight,
  Plus,
  Merge,
  AlertCircle,
  TrendingUp,
  Info,
  Zap,
  Layers,
  RefreshCw,
  PackageOpen,
  ExternalLink,
  Globe,
  Shield,
  DollarSign,
  Star,
  ChevronDown,
  ChevronUp,
  Filter,
  Sparkles,
  CheckCircle,
  Target,
} from "lucide-react";

interface CartRecommandationsTabProps {
  outils: CartOutilV2[];
  irritants?: CartIrritantV2[];
  packResumes?: CartPackResume[];
  aiAnalyseTransversale?: string | null;
  aiPlanOptimisation?: string | null;
  aiCoutInaction?: string | null;
  aiKpis?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_RECO_CONFIG = {
  Remplacement: {
    icon: ArrowRight,
    label: "Remplacement recommande",
    className: "bg-orange-50 border-orange-200",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
  },
  Ajout: {
    icon: Plus,
    label: "Outil manquant",
    className: "bg-blue-50 border-blue-200",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  Consolidation: {
    icon: Merge,
    label: "Consolidation possible",
    className: "bg-purple-50 border-purple-200",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
  },
};

const EFFORT_COLOR: Record<string, string> = {
  Faible: "bg-green-100 text-green-800 border-green-200",
  Moyen: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Eleve: "bg-red-100 text-red-800 border-red-200",
};

function getOutilBorderColor(type: string | null): string {
  if (!type) return "border-l-orange-400";
  if (type.includes("CRM") || type.includes("ERP")) return "border-l-green-500";
  if (type.includes("Communication")) return "border-l-blue-500";
  return "border-l-orange-400";
}

function buildRecommandations(outils: CartOutilV2[]) {
  const recos: Array<{
    type: "Remplacement" | "Ajout" | "Consolidation";
    outil_actuel?: string;
    situation: string;
    recommandation: string;
    benefice: string;
    effort: "Faible" | "Moyen" | "Eleve";
    saas_suggestions?: SaasRecommendation[];
  }> = [];

  const outilsProblematiques = outils.filter(
    (o) => o.problemes && o.problemes.trim().length > 20
  );
  for (const outil of outilsProblematiques.slice(0, 5)) {
    // Find SaaS alternatives based on tool type
    const typeKeywords = [outil.type_outil, outil.nom].filter(Boolean).map(s => s!.toLowerCase());
    const suggestions = SAAS_CATALOG.filter(saas => {
      const searchText = [saas.categorie, saas.sous_categorie, ...saas.cas_usage, ...saas.alternative_a].join(" ").toLowerCase();
      return typeKeywords.some(kw => searchText.includes(kw));
    }).slice(0, 3);

    recos.push({
      type: "Remplacement",
      outil_actuel: outil.nom,
      situation: `${outil.nom} presente des problemes: ${outil.problemes}`,
      recommandation: `Evaluer des alternatives modernes a ${outil.nom}`,
      benefice: "Reduction des frictions, amelioration de la productivite",
      effort: (outil.niveau_usage || 0) >= 4 ? "Eleve" : "Moyen",
      saas_suggestions: suggestions,
    });
  }

  const outilsGeneriques = outils.filter(
    (o) =>
      ["Bureautique", "Communication"].includes(o.type_outil || "") &&
      (o.niveau_usage || 5) <= 2
  );
  for (const outil of outilsGeneriques.slice(0, 2)) {
    recos.push({
      type: "Ajout",
      outil_actuel: outil.nom,
      situation: `${outil.nom} est peu utilise (niveau ${outil.niveau_usage}/5)`,
      recommandation: "Ajouter un outil specialise",
      benefice: "Gain de temps et qualite amelioree",
      effort: "Faible",
    });
  }

  const byType: Record<string, CartOutilV2[]> = {};
  for (const o of outils) {
    if (o.type_outil) {
      if (!byType[o.type_outil]) byType[o.type_outil] = [];
      byType[o.type_outil].push(o);
    }
  }
  for (const [type, group] of Object.entries(byType)) {
    if (group.length >= 3) {
      recos.push({
        type: "Consolidation",
        situation: `${group.length} outils "${type}" coexistent (${group.map((o) => o.nom).join(", ")})`,
        recommandation: `Consolider les outils ${type}`,
        benefice: "Reduction des couts et de la fragmentation",
        effort: "Moyen",
      });
    }
  }
  return recos;
}

// ---------------------------------------------------------------------------
// Parse AI text helpers
// ---------------------------------------------------------------------------

function extractText(val: unknown): string {
  if (typeof val === "string") return val;
  if (val && typeof val === "object" && "content" in (val as any)) return String((val as any).content);
  return val ? JSON.stringify(val) : "";
}

function renderInlineText(text: string | unknown) {
  const resolved = extractText(text);
  if (!resolved) return [<span key={0}></span>];
  const textStr = resolved;
  const parts = textStr.split(/(Pack\s*\d+|→|->)/gi);
  return parts.map((part, i) => {
    if (/^Pack\s*\d+$/i.test(part)) {
      return (
        <Badge key={i} variant="outline" className="mx-1 text-xs bg-purple-100 text-purple-800 border-purple-300">
          {part}
        </Badge>
      );
    }
    if (part === "->" || part === "\u2192") {
      return (
        <span key={i} className="inline-flex items-center mx-1 text-purple-500 font-bold">
          &rarr;
        </span>
      );
    }
    const boldParts = part.split(/\*\*(.*?)\*\*/g);
    if (boldParts.length > 1) {
      return (
        <span key={i}>
          {boldParts.map((bp, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold text-foreground">{bp}</strong>
            ) : (
              <span key={j}>{bp}</span>
            )
          )}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function parseAITextBlock(text: string | unknown) {
  const str = extractText(text);
  const lines = str.split("\n").filter((l) => l.trim().length > 0);
  const items: Array<{ kind: "heading" | "bullet" | "subbullet" | "paragraph"; text: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\d+[\.\)]\s/.test(trimmed)) {
      items.push({ kind: "bullet", text: trimmed.replace(/^\d+[\.\)]\s*/, "") });
    } else if (/^[•\-]\s/.test(trimmed)) {
      items.push({ kind: "bullet", text: trimmed.replace(/^[•\-]\s*/, "") });
    } else if (/^\s{2,}[•\-]/.test(line)) {
      items.push({ kind: "subbullet", text: trimmed.replace(/^[•\-]\s*/, "") });
    } else if (trimmed.endsWith(":") || trimmed.endsWith(" :")) {
      items.push({ kind: "heading", text: trimmed });
    } else {
      items.push({ kind: "paragraph", text: trimmed });
    }
  }
  return items;
}

function parsePlanSections(text: string) {
  const sections: Array<{
    priority: "P1" | "P2" | "P3" | "other";
    title: string;
    items: string[];
  }> = [];

  const lines = text.split("\n");
  let current: (typeof sections)[number] | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const pMatch = trimmed.match(/^(?:\*\*)?[#]*\s*(P[123])\b[:\s\-]*(.*?)(?:\*\*)?$/i);
    if (pMatch) {
      if (current) sections.push(current);
      const p = pMatch[1].toUpperCase() as "P1" | "P2" | "P3";
      current = { priority: p, title: pMatch[2].trim() || p, items: [] };
      continue;
    }

    const phaseMatch = trimmed.match(
      /^(?:\*\*)?[#]*\s*Phase\s+([123])\b[:\s\-]*(.*?)(?:\*\*)?$/i
    );
    if (phaseMatch) {
      if (current) sections.push(current);
      const p = ("P" + phaseMatch[1]) as "P1" | "P2" | "P3";
      current = { priority: p, title: phaseMatch[2].trim() || p, items: [] };
      continue;
    }

    if (current) {
      if (/^[•\-\d+[\.\)]]\s/.test(trimmed) || /^\d+[\.\)]\s/.test(trimmed)) {
        current.items.push(trimmed.replace(/^[•\-]\s*/, "").replace(/^\d+[\.\)]\s*/, ""));
      } else if (trimmed.endsWith(":") || trimmed.endsWith(" :")) {
        current.items.push(trimmed);
      } else {
        current.items.push(trimmed);
      }
    } else {
      if (!current) {
        current = { priority: "other", title: "Introduction", items: [] };
      }
      current.items.push(trimmed);
    }
  }
  if (current) sections.push(current);

  return sections;
}

const PRIORITY_CONFIG: Record<
  string,
  { border: string; badgeLabel: string; badgeClass: string; icon: typeof Zap }
> = {
  P1: {
    border: "border-l-green-500",
    badgeLabel: "Quick Win",
    badgeClass: "bg-green-100 text-green-800 border-green-300",
    icon: Zap,
  },
  P2: {
    border: "border-l-blue-500",
    badgeLabel: "Structurant",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
    icon: Layers,
  },
  P3: {
    border: "border-l-gray-400",
    badgeLabel: "Transformation",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-300",
    icon: RefreshCw,
  },
  other: {
    border: "border-l-purple-400",
    badgeLabel: "Contexte",
    badgeClass: "bg-purple-100 text-purple-700 border-purple-300",
    icon: Info,
  },
};

const CATEGORIE_COLORS: Record<string, string> = {
  CRM: "bg-green-100 text-green-800 border-green-200",
  ERP: "bg-blue-100 text-blue-800 border-blue-200",
  "Gestion de projet": "bg-cyan-100 text-cyan-800 border-cyan-200",
  RH: "bg-orange-100 text-orange-800 border-orange-200",
  Communication: "bg-purple-100 text-purple-800 border-purple-200",
  Comptabilite: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Automatisation: "bg-amber-100 text-amber-800 border-amber-200",
  "BI & Reporting": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Qualite & Conformite": "bg-red-100 text-red-800 border-red-200",
  Marketing: "bg-pink-100 text-pink-800 border-pink-200",
  Collaboration: "bg-violet-100 text-violet-800 border-violet-200",
  "Service client": "bg-teal-100 text-teal-800 border-teal-200",
  "Gestion documentaire": "bg-slate-100 text-slate-800 border-slate-200",
  "Signature electronique": "bg-sky-100 text-sky-800 border-sky-200",
};

// ---------------------------------------------------------------------------
// SaaS Card Component
// ---------------------------------------------------------------------------

function SaasCard({ saas, matchReason }: { saas: SaasRecommendation; matchReason?: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold">{saas.nom}</h4>
              <Badge variant="outline" className={`text-[10px] border ${CATEGORIE_COLORS[saas.categorie] || "bg-gray-100 text-gray-800"}`}>
                {saas.categorie}
              </Badge>
              {saas.origine === "FR" && (
                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                  Francais
                </Badge>
              )}
              {saas.modele_prix === "Freemium" && (
                <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                  Version gratuite
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{saas.description}</p>
            {matchReason && (
              <div className="flex items-center gap-1.5 mt-2">
                <Target className="w-3 h-3 text-cyan-500 shrink-0" />
                <p className="text-[11px] text-cyan-700 font-medium">{matchReason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Key info row */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <DollarSign className="w-3 h-3" />
            <span>{saas.prix_indicatif}</span>
          </div>
          {saas.hebergement_eu && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="w-3 h-3 text-green-500" />
              <span>Hebergement UE</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="w-3 h-3" />
            <span>{saas.taille_cible.join(", ")}</span>
          </div>
        </div>

        {/* Expandable details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Cas d'usage</p>
              <div className="flex flex-wrap gap-1">
                {saas.cas_usage.map((cu, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{cu}</Badge>
                ))}
              </div>
            </div>
            {saas.integration_cles.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Integrations cles</p>
                <p className="text-xs text-muted-foreground">{saas.integration_cles.join(", ")}</p>
              </div>
            )}
            {saas.alternative_a.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Remplace</p>
                <p className="text-xs text-muted-foreground">{saas.alternative_a.join(" | ")}</p>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 text-amber-500" />
              <p className="text-xs text-muted-foreground">{saas.note_marche}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Moins" : "Plus de details"}
          </button>
          <a
            href={saas.affiliate_url || saas.site_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center gap-1 font-medium"
          >
            Visiter le site
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CartRecommandationsTab({
  outils,
  irritants,
  packResumes,
  aiAnalyseTransversale,
  aiPlanOptimisation,
  aiCoutInaction,
  aiKpis,
}: CartRecommandationsTabProps) {
  const recos = buildRecommandations(outils);
  const [selectedCategory, setSelectedCategory] = useState<SaasCategorie | "all">("all");
  const [saasView, setSaasView] = useState<"relevant" | "all">("relevant");

  // Compute relevant SaaS based on analyzed packs
  const relevantSaaS = useMemo(() => {
    const analyzedBlocs = (packResumes || []).map(pr => pr.bloc);
    if (analyzedBlocs.length === 0) return SAAS_CATALOG;

    const seen = new Set<string>();
    const results: Array<{ saas: SaasRecommendation; matchReason: string }> = [];

    // 1. Match by pack bloc categories
    for (const bloc of analyzedBlocs) {
      const recsForBloc = getRecommendationsForBloc(bloc);
      const packDef = PACK_LABELS[bloc];
      for (const saas of recsForBloc) {
        if (!seen.has(saas.nom)) {
          seen.add(saas.nom);
          results.push({ saas, matchReason: `Pertinent pour ${packDef || `Pack ${bloc}`}` });
        }
      }
    }

    // 2. Match by detected tool problems
    for (const outil of outils) {
      if (outil.problemes && outil.problemes.length > 20) {
        const keywords = [outil.type_outil, outil.nom].filter(Boolean).map(s => s!.toLowerCase());
        for (const saas of SAAS_CATALOG) {
          if (seen.has(saas.nom)) continue;
          const searchText = [saas.categorie, saas.sous_categorie, ...saas.cas_usage, ...saas.alternative_a].join(" ").toLowerCase();
          if (keywords.some(kw => searchText.includes(kw))) {
            seen.add(saas.nom);
            results.push({ saas, matchReason: `Alternative a ${outil.nom}` });
          }
        }
      }
    }

    // 3. Match by irritant keywords
    for (const irritant of (irritants || [])) {
      const keywords = [irritant.intitule, irritant.description, irritant.impact].filter(Boolean).join(" ").toLowerCase().split(/\s+/).filter(w => w.length > 4);
      for (const saas of SAAS_CATALOG) {
        if (seen.has(saas.nom)) continue;
        const searchText = [...saas.cas_usage, ...saas.alternative_a, saas.description].join(" ").toLowerCase();
        if (keywords.some(kw => searchText.includes(kw))) {
          seen.add(saas.nom);
          results.push({ saas, matchReason: `Repond a: ${irritant.intitule}` });
        }
      }
    }

    return results;
  }, [packResumes, outils, irritants]);

  // Categories present in relevant results
  const activeCategories = useMemo(() => {
    const cats = new Set<SaasCategorie>();
    const source = saasView === "relevant" ? relevantSaaS.map(r => r.saas) : SAAS_CATALOG;
    for (const s of source) cats.add(s.categorie);
    return Array.from(cats).sort();
  }, [relevantSaaS, saasView]);

  const filteredSaaS = useMemo(() => {
    if (saasView === "relevant") {
      if (selectedCategory === "all") return relevantSaaS;
      return relevantSaaS.filter(r => r.saas.categorie === selectedCategory);
    }
    if (selectedCategory === "all") return SAAS_CATALOG.map(saas => ({ saas, matchReason: "" }));
    return SAAS_CATALOG.filter(s => s.categorie === selectedCategory).map(saas => ({ saas, matchReason: "" }));
  }, [relevantSaaS, selectedCategory, saasView]);

  return (
    <div className="space-y-8 pb-8">
      {/* ---- Summary counters ---- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: ArrowRight,
            label: "Remplacements",
            value: recos.filter((r) => r.type === "Remplacement").length,
            color: "text-orange-600 bg-orange-50",
          },
          {
            icon: Plus,
            label: "Ajouts suggeres",
            value: recos.filter((r) => r.type === "Ajout").length,
            color: "text-blue-600 bg-blue-50",
          },
          {
            icon: Merge,
            label: "Consolidations",
            value: recos.filter((r) => r.type === "Consolidation").length,
            color: "text-purple-600 bg-purple-50",
          },
          {
            icon: Sparkles,
            label: "Outils SaaS recommandes",
            value: relevantSaaS.length,
            color: "text-cyan-600 bg-cyan-50",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold leading-tight">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---- Section 1: Recommandations Outils ---- */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
          <Laptop className="w-4 h-4" /> Recommandations Outils
        </h3>

        {outils.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <PackageOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucune donnee disponible</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Tool inventory cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {outils.map((o) => (
                <Card key={o.id} className={`border-l-4 ${getOutilBorderColor(o.type_outil)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold">{o.nom}</p>
                      {o.type_outil && (
                        <Badge variant="outline" className="text-xs shrink-0">{o.type_outil}</Badge>
                      )}
                    </div>
                    {o.niveau_usage != null && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-xs text-muted-foreground">Usage :</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i < (o.niveau_usage || 0) ? "bg-cyan-500" : "bg-muted"}`} />
                          ))}
                        </div>
                      </div>
                    )}
                    {o.problemes && (
                      <div className="flex items-start gap-1.5 mt-2">
                        <AlertCircle className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-orange-700 line-clamp-3">{o.problemes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Generated recommendations */}
            {recos.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" /> Actions recommandees ({recos.length})
                </h4>
                {recos.map((reco, i) => {
                  const config = TYPE_RECO_CONFIG[reco.type];
                  const Icon = config.icon;
                  return (
                    <Card key={i} className={`border ${config.className}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${config.badgeClass}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <Badge className={`text-xs border ${config.badgeClass}`}>{reco.type}</Badge>
                              {reco.outil_actuel && (
                                <span className="ml-2 text-sm font-semibold">{reco.outil_actuel}</span>
                              )}
                            </div>
                          </div>
                          <Badge className={`text-xs border shrink-0 ${EFFORT_COLOR[reco.effort]}`}>
                            Effort {reco.effort}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">Situation</p>
                            <p className="text-sm">{reco.situation}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">Recommandation</p>
                            <p className="text-sm font-medium">{reco.recommandation}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 bg-white/70 rounded-md px-3 py-2">
                          <TrendingUp className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-green-800">
                            <span className="font-medium">Benefice : </span>{reco.benefice}
                          </p>
                        </div>
                        {/* Inline SaaS suggestions */}
                        {reco.saas_suggestions && reco.saas_suggestions.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Alternatives SaaS suggerees
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {reco.saas_suggestions.map((saas, j) => (
                                <a
                                  key={j}
                                  href={saas.affiliate_url || saas.site_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white border hover:border-cyan-300 hover:shadow-sm transition-all text-xs"
                                >
                                  <span className="font-medium">{saas.nom}</span>
                                  {saas.origine === "FR" && <span className="text-[10px] text-blue-600">FR</span>}
                                  {saas.modele_prix === "Freemium" && <span className="text-[10px] text-green-600">Gratuit</span>}
                                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      <Separator />

      {/* ---- Section 2: SaaS Catalog Recommendations ---- */}
      <section>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" /> Catalogue SaaS recommandes
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Outils selectionnes en fonction de votre diagnostic et de vos besoins identifies
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button
              size="sm"
              variant={saasView === "relevant" ? "default" : "outline"}
              className="h-7 text-[11px]"
              onClick={() => setSaasView("relevant")}
            >
              <Target className="w-3 h-3 mr-1" />
              Pertinents ({relevantSaaS.length})
            </Button>
            <Button
              size="sm"
              variant={saasView === "all" ? "default" : "outline"}
              className="h-7 text-[11px]"
              onClick={() => setSaasView("all")}
            >
              Tous ({SAAS_CATALOG.length})
            </Button>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
              selectedCategory === "all"
                ? "bg-cyan-100 text-cyan-800 font-medium"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Toutes ({saasView === "relevant" ? relevantSaaS.length : SAAS_CATALOG.length})
          </button>
          {activeCategories.map((cat) => {
            const count = saasView === "relevant"
              ? relevantSaaS.filter(r => r.saas.categorie === cat).length
              : SAAS_CATALOG.filter(s => s.categorie === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                  selectedCategory === cat
                    ? "bg-cyan-100 text-cyan-800 font-medium"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* SaaS cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredSaaS.map(({ saas, matchReason }) => (
            <SaasCard key={saas.nom} saas={saas} matchReason={matchReason || undefined} />
          ))}
        </div>

        {filteredSaaS.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucun outil dans cette categorie. Essayez un autre filtre.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <Separator />

      {/* ---- Section 3: Analyse Transversale ---- */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-purple-600" /> Analyse Transversale
        </h3>

        {!aiAnalyseTransversale ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Info className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucune donnee disponible</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-5 space-y-2">
              {parseAITextBlock(aiAnalyseTransversale).map((item, idx) => {
                if (item.kind === "heading") {
                  return (
                    <h4 key={idx} className="font-semibold text-base mt-3 first:mt-0">
                      {renderInlineText(item.text)}
                    </h4>
                  );
                }
                if (item.kind === "bullet") {
                  return (
                    <div key={idx} className="flex items-start gap-2 pl-1">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                      <p className="text-sm flex-1 leading-relaxed">{renderInlineText(item.text)}</p>
                    </div>
                  );
                }
                if (item.kind === "subbullet") {
                  return (
                    <div key={idx} className="flex items-start gap-2 pl-6">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-purple-300 shrink-0" />
                      <p className="text-xs flex-1 text-muted-foreground leading-relaxed">{renderInlineText(item.text)}</p>
                    </div>
                  );
                }
                return (
                  <p key={idx} className="text-sm leading-relaxed">{renderInlineText(item.text)}</p>
                );
              })}
            </CardContent>
          </Card>
        )}
      </section>

      <Separator />

      {/* ---- Section 4: Plan d'Optimisation ---- */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-green-600" /> Plan d'Optimisation
        </h3>

        {!aiPlanOptimisation ? (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucune donnee disponible</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {parsePlanSections(aiPlanOptimisation).map((section, idx) => {
              const config = PRIORITY_CONFIG[section.priority] || PRIORITY_CONFIG.other;
              const PIcon = config.icon;
              return (
                <Card key={idx} className={`border-l-4 ${config.border}`}>
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PIcon className="w-4 h-4" />
                      <span className="flex-1">{section.title || section.priority}</span>
                      <Badge variant="outline" className={`text-xs ${config.badgeClass}`}>
                        {config.badgeLabel}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {section.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucun element</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {section.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-40 shrink-0" />
                            <span className="flex-1 leading-relaxed">{renderInlineText(item)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ---- Section 5: Cout d'inaction & KPIs (if available) ---- */}
      {(aiCoutInaction || aiKpis) && (
        <>
          <Separator />
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aiCoutInaction && (
              <Card className="border-l-4 border-l-red-400">
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Cout d'inaction estime
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {parseAITextBlock(aiCoutInaction).map((item, idx) => (
                    <p key={idx} className={`text-sm leading-relaxed ${item.kind === "heading" ? "font-semibold mt-2 first:mt-0" : ""}`}>
                      {renderInlineText(item.text)}
                    </p>
                  ))}
                </CardContent>
              </Card>
            )}
            {aiKpis && (
              <Card className="border-l-4 border-l-emerald-400">
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    KPIs de suivi recommandes
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {parseAITextBlock(aiKpis).map((item, idx) => {
                    if (item.kind === "bullet") {
                      return (
                        <div key={idx} className="flex items-start gap-2 pl-1">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <p className="text-sm flex-1 leading-relaxed">{renderInlineText(item.text)}</p>
                        </div>
                      );
                    }
                    return (
                      <p key={idx} className={`text-sm leading-relaxed ${item.kind === "heading" ? "font-semibold mt-2 first:mt-0" : ""}`}>
                        {renderInlineText(item.text)}
                      </p>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}

// Pack labels for match reasons
const PACK_LABELS: Record<number, string> = {
  1: "Contexte & Organisation",
  2: "Clients & Offres",
  3: "Organisation & Gouvernance",
  4: "Ressources Humaines",
  5: "Processus Commerciaux",
  6: "Processus Operationnels",
  7: "Outils & SI",
  8: "Communication Interne",
  9: "Qualite & Conformite",
  10: "KPIs & Pilotage",
};
