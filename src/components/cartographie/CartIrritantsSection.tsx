import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { CartSectionHeader } from "./CartSectionHeader";
import { CartEmptyState } from "./CartEmptyState";
import type { CartIrritantV2, CartTacheV2 } from "@/lib/cartTypes";

interface Props {
  irritants: CartIrritantV2[];
  taches: CartTacheV2[];
  activeSection?: string;
  packsCompleted?: number;
}

export const CartIrritantsSection = React.memo(function CartIrritantsSection({ irritants, taches, activeSection, packsCompleted }: Props) {
  return (
    <div>
      <CartSectionHeader title="Irritants & Risques" description="Points de friction et risques operationnels identifies" icon={AlertTriangle} count={irritants.length + taches.length} />
      <div className="space-y-4">
        <Card>
          <CardContent className="px-4 py-4 space-y-2">
            {irritants.length === 0 ? (
              <CartEmptyState message="Aucun irritant detecte pour le moment" icon={AlertTriangle} activeSection={activeSection} packsCompleted={packsCompleted} />
            ) : irritants.map((i) => (
              <div key={i.id} className="flex items-start gap-3 p-3 rounded-md bg-red-50/50 border border-red-100">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${(i.gravite || 0) >= 4 ? "bg-red-600" : (i.gravite || 0) >= 3 ? "bg-orange-500" : "bg-yellow-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{i.intitule}</p>
                    {i.type && <Badge variant="outline" className="text-xs">{i.type}</Badge>}
                    {i.gravite && <Badge className="text-xs bg-red-100 text-red-800 border border-red-200">Gravite {i.gravite}/5</Badge>}
                  </div>
                  {i.impact && <p className="text-xs text-muted-foreground mt-1">Impact : {i.impact}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {taches.length > 0 && (
          <Card>
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm">Taches manuelles ({taches.length})</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {taches.map((t) => (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/30 border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{t.nom}</p>
                      {t.frequence && <Badge variant="outline" className="text-xs">{t.frequence}</Badge>}
                      {t.double_saisie && <Badge className="text-xs bg-orange-100 text-orange-800 border border-orange-200">Double saisie</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
});
