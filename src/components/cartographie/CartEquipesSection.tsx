import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { CartSectionHeader } from "./CartSectionHeader";
import { CartEmptyState } from "./CartEmptyState";
import type { CartEquipeV2 } from "@/lib/cartTypes";

interface Props {
  equipes: CartEquipeV2[];
  activeSection?: string;
  packsCompleted?: number;
}

export const CartEquipesSection = React.memo(function CartEquipesSection({ equipes, activeSection, packsCompleted }: Props) {
  return (
    <div>
      <CartSectionHeader title="Equipes" description="Structure et organisation des equipes" icon={Users} count={equipes.length} />
      <Card>
        <CardContent className="px-4 py-4 space-y-2">
          {equipes.length === 0 ? (
            <CartEmptyState message="Aucune equipe detectee pour le moment" icon={Users} activeSection={activeSection} packsCompleted={packsCompleted} />
          ) : equipes.map((e) => (
            <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg bg-orange-50/50 border border-orange-100 transition-all hover:shadow-sm hover:border-orange-200">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{e.nom}</p>
                  {e.charge_estimee && (
                    <Badge variant="outline" className="text-xs">Charge : {e.charge_estimee}/5</Badge>
                  )}
                </div>
                {e.mission && <p className="text-xs text-muted-foreground mt-1">{e.mission}</p>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
});
