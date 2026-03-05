import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface QuickWinCardProps {
  action: string;
  impact: string;
  effort: string;
  categorie?: string;
}

const IMPACT_COLOR: Record<string, string> = {
  Fort: "bg-green-100 text-green-800 border-green-200",
  Moyen: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Faible: "bg-gray-100 text-gray-700 border-gray-200",
};

const EFFORT_COLOR: Record<string, string> = {
  Faible: "bg-green-100 text-green-800 border-green-200",
  Moyen: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Eleve": "bg-red-100 text-red-800 border-red-200",
};

export function QuickWinCard({ action, impact, effort, categorie }: QuickWinCardProps) {
  return (
    <Card className="border-yellow-100 bg-yellow-50/30">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-sm font-medium leading-snug">{action}</p>
        </div>
        <div className="flex gap-2 flex-wrap ml-6">
          <Badge className={`text-xs border ${IMPACT_COLOR[impact] || IMPACT_COLOR.Moyen}`}>
            Impact {impact}
          </Badge>
          <Badge className={`text-xs border ${EFFORT_COLOR[effort] || EFFORT_COLOR.Moyen}`}>
            Effort {effort}
          </Badge>
          {categorie && (
            <Badge variant="outline" className="text-xs">{categorie}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
