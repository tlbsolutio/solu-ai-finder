import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BarChart3, Sparkles } from "lucide-react";
import { CartSectionHeader } from "./CartSectionHeader";
import { FormattedText } from "./FormattedText";
import type { CartSessionV2 } from "@/lib/cartTypes";

interface Props {
  session: CartSessionV2;
}

const AI_FIELDS: Array<{ key: keyof CartSessionV2; label: string }> = [
  { key: "ai_resume_executif", label: "Resume executif" },
  { key: "ai_forces", label: "Forces identifiees" },
  { key: "ai_dysfonctionnements", label: "Dysfonctionnements" },
  { key: "ai_analyse_transversale", label: "Analyse transversale" },
  { key: "ai_plan_optimisation", label: "Plan d'optimisation" },
  { key: "ai_vision_cible", label: "Vision cible" },
  { key: "ai_cout_inaction_annuel", label: "Cout d'inaction annuel" },
  { key: "ai_kpis_de_suivi", label: "KPIs de suivi" },
];

const SPECIAL_FIELDS: Array<{
  key: keyof CartSessionV2;
  label: string;
  icon: React.ElementType;
  borderColor: string;
  iconColor: string;
}> = [
  { key: "ai_cross_pack_analysis", label: "Analyse causale inter-packs", icon: Brain, borderColor: "border-purple-200", iconColor: "text-purple-500" },
  { key: "ai_impact_quantification", label: "Quantification d'impact", icon: BarChart3, borderColor: "border-green-200", iconColor: "text-green-500" },
  { key: "ai_target_vision", label: "Vision cible 18 mois", icon: Sparkles, borderColor: "border-blue-200", iconColor: "text-blue-500" },
];

function formatContent(content: unknown): string {
  if (typeof content === "string") return content;
  return JSON.stringify(content, null, 2);
}

export const CartAnalyseSection = React.memo(function CartAnalyseSection({ session }: Props) {
  return (
    <div>
      <CartSectionHeader title="Analyse IA" description="Analyse generee par intelligence artificielle" icon={Brain} />
      <div className="space-y-4">
        {AI_FIELDS.map(({ key, label }) => {
          const content = session[key];
          if (!content) return null;
          return (
            <Card key={key}>
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm">{label}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <FormattedText text={formatContent(content)} />
              </CardContent>
            </Card>
          );
        })}

        {SPECIAL_FIELDS.map(({ key, label, icon: FIcon, borderColor, iconColor }) => {
          const content = session[key];
          if (!content) return null;
          return (
            <Card key={key} className={borderColor}>
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FIcon className={`w-4 h-4 ${iconColor}`} />
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <FormattedText text={formatContent(content)} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
});
