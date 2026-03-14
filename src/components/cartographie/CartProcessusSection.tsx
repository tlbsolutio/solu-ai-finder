import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { CartSectionHeader } from "./CartSectionHeader";
import { CartEmptyState } from "./CartEmptyState";
import type { CartProcessusV2 } from "@/lib/cartTypes";

interface Props {
  processus: CartProcessusV2[];
  activeSection?: string;
  packsCompleted?: number;
}

export const CartProcessusSection = React.memo(function CartProcessusSection({ processus, activeSection, packsCompleted }: Props) {
  return (
    <div>
      <CartSectionHeader title="Processus" description="Processus metiers detectes dans votre organisation" icon={Settings} count={processus.length} />
      <Card>
        <CardContent className="px-4 py-4 space-y-2">
          {processus.length === 0 ? (
            <CartEmptyState message="Aucun processus detecte pour le moment" icon={Settings} activeSection={activeSection} packsCompleted={packsCompleted} />
          ) : processus.map((p) => (
            <div key={p.id} className="flex items-start gap-3 p-3 rounded-md bg-blue-50/50 border border-blue-100">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{p.nom}</p>
                  {p.type && <Badge variant="outline" className="text-xs">{p.type}</Badge>}
                  {p.niveau_criticite && (
                    <Badge className={`text-xs ${p.niveau_criticite === "High" ? "bg-red-100 text-red-800 border-red-200" : p.niveau_criticite === "Medium" ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-green-100 text-green-800 border-green-200"} border`}>
                      {p.niveau_criticite}
                    </Badge>
                  )}
                </div>
                {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
});
