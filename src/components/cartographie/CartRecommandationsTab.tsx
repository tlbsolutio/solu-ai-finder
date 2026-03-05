import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CartOutilV2 } from "@/lib/cartTypes";
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
} from "lucide-react";

interface CartRecommandationsTabProps {
  outils: CartOutilV2[];
  aiAnalyseTransversale?: string | null;
  aiPlanOptimisation?: string | null;
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
  }> = [];

  const outilsProblematiques = outils.filter(
    (o) => o.problemes && o.problemes.trim().length > 20
  );
  for (const outil of outilsProblematiques.slice(0, 5)) {
    recos.push({
      type: "Remplacement",
      outil_actuel: outil.nom,
      situation: `${outil.nom} presente des problemes: ${outil.problemes}`,
      recommandation: `Evaluer des alternatives modernes a ${outil.nom}`,
      benefice: "Reduction des frictions, amelioration de la productivite",
      effort: (outil.niveau_usage || 0) >= 4 ? "Eleve" : "Moyen",
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

/** Render inline text, highlighting Pack references and arrow symbols */
function renderInlineText(text: string) {
  // Split on Pack references and arrow symbols
  const parts = text.split(/(Pack\s*\d+|→|->)/gi);
  return parts.map((part, i) => {
    if (/^Pack\s*\d+$/i.test(part)) {
      return (
        <Badge
          key={i}
          variant="outline"
          className="mx-1 text-xs bg-purple-100 text-purple-800 border-purple-300"
        >
          {part}
        </Badge>
      );
    }
    if (part === "->" || part === "\u2192") {
      return (
        <span
          key={i}
          className="inline-flex items-center mx-1 text-purple-500 font-bold"
        >
          &rarr;
        </span>
      );
    }
    // Handle **bold** markers
    const boldParts = part.split(/\*\*(.*?)\*\*/g);
    if (boldParts.length > 1) {
      return (
        <span key={i}>
          {boldParts.map((bp, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold text-foreground">
                {bp}
              </strong>
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

/** Parse a block of AI text into structured items (headings, bullets, paragraphs) */
function parseAITextBlock(text: string) {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const items: Array<{ kind: "heading" | "bullet" | "subbullet" | "paragraph"; text: string }> =
    [];

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

/** Parse plan d'optimisation text into priority sections */
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

    // Detect P1/P2/P3 headers
    const pMatch = trimmed.match(/^(?:\*\*)?[#]*\s*(P[123])\b[:\s\-]*(.*?)(?:\*\*)?$/i);
    if (pMatch) {
      if (current) sections.push(current);
      const p = pMatch[1].toUpperCase() as "P1" | "P2" | "P3";
      current = { priority: p, title: pMatch[2].trim() || p, items: [] };
      continue;
    }

    // Also detect "Phase 1" / "Phase 2" / "Phase 3" style
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
      // Bullet or numbered item
      if (/^[•\-\d+[\.\)]]\s/.test(trimmed) || /^\d+[\.\)]\s/.test(trimmed)) {
        current.items.push(trimmed.replace(/^[•\-]\s*/, "").replace(/^\d+[\.\)]\s*/, ""));
      } else if (trimmed.endsWith(":") || trimmed.endsWith(" :")) {
        // Sub-heading within section, treat as item
        current.items.push(trimmed);
      } else {
        current.items.push(trimmed);
      }
    } else {
      // Text before any P section — create an "other" section
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CartRecommandationsTab({
  outils,
  aiAnalyseTransversale,
  aiPlanOptimisation,
}: CartRecommandationsTabProps) {
  const recos = buildRecommandations(outils);

  return (
    <div className="space-y-8 pb-8">
      {/* ---- Summary counters ---- */}
      <div className="grid grid-cols-3 gap-3">
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
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-3 flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}
              >
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
              <p className="text-sm text-muted-foreground">
                Aucune donnee disponible
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Tool inventory cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {outils.map((o) => (
                <Card
                  key={o.id}
                  className={`border-l-4 ${getOutilBorderColor(o.type_outil)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold">{o.nom}</p>
                      {o.type_outil && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {o.type_outil}
                        </Badge>
                      )}
                    </div>
                    {o.niveau_usage != null && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Usage : {o.niveau_usage}/5
                      </p>
                    )}
                    {o.problemes && (
                      <div className="flex items-start gap-1.5 mt-2">
                        <AlertCircle className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-orange-700 line-clamp-3">
                          {o.problemes}
                        </p>
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
                  <TrendingUp className="w-3.5 h-3.5" /> Actions recommandees (
                  {recos.length})
                </h4>
                {recos.map((reco, i) => {
                  const config = TYPE_RECO_CONFIG[reco.type];
                  const Icon = config.icon;
                  return (
                    <Card key={i} className={`border ${config.className}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${config.badgeClass}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <Badge
                                className={`text-xs border ${config.badgeClass}`}
                              >
                                {reco.type}
                              </Badge>
                              {reco.outil_actuel && (
                                <span className="ml-2 text-sm font-semibold">
                                  {reco.outil_actuel}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge
                            className={`text-xs border shrink-0 ${EFFORT_COLOR[reco.effort]}`}
                          >
                            Effort {reco.effort}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              Situation
                            </p>
                            <p className="text-sm">{reco.situation}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">
                              Recommandation
                            </p>
                            <p className="text-sm font-medium">
                              {reco.recommandation}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 bg-white/70 rounded-md px-3 py-2">
                          <TrendingUp className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-green-800">
                            <span className="font-medium">Benefice : </span>
                            {reco.benefice}
                          </p>
                        </div>
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

      {/* ---- Section 2: Analyse Transversale ---- */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-purple-600" /> Analyse Transversale
        </h3>

        {!aiAnalyseTransversale ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Info className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucune donnee disponible
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-5 space-y-2">
              {parseAITextBlock(aiAnalyseTransversale).map((item, idx) => {
                if (item.kind === "heading") {
                  return (
                    <h4
                      key={idx}
                      className="font-semibold text-base mt-3 first:mt-0"
                    >
                      {renderInlineText(item.text)}
                    </h4>
                  );
                }
                if (item.kind === "bullet") {
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-2 pl-1"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                      <p className="text-sm flex-1 leading-relaxed">
                        {renderInlineText(item.text)}
                      </p>
                    </div>
                  );
                }
                if (item.kind === "subbullet") {
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-2 pl-6"
                    >
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-purple-300 shrink-0" />
                      <p className="text-xs flex-1 text-muted-foreground leading-relaxed">
                        {renderInlineText(item.text)}
                      </p>
                    </div>
                  );
                }
                return (
                  <p key={idx} className="text-sm leading-relaxed">
                    {renderInlineText(item.text)}
                  </p>
                );
              })}
            </CardContent>
          </Card>
        )}
      </section>

      <Separator />

      {/* ---- Section 3: Plan d'Optimisation ---- */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-green-600" /> Plan d'Optimisation
        </h3>

        {!aiPlanOptimisation ? (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucune donnee disponible
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {parsePlanSections(aiPlanOptimisation).map((section, idx) => {
              const config =
                PRIORITY_CONFIG[section.priority] || PRIORITY_CONFIG.other;
              const PIcon = config.icon;
              return (
                <Card
                  key={idx}
                  className={`border-l-4 ${config.border}`}
                >
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PIcon className="w-4 h-4" />
                      <span className="flex-1">
                        {section.title || section.priority}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${config.badgeClass}`}
                      >
                        {config.badgeLabel}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {section.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Aucun element
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {section.items.map((item, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-40 shrink-0" />
                            <span className="flex-1 leading-relaxed">
                              {renderInlineText(item)}
                            </span>
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
    </div>
  );
}
