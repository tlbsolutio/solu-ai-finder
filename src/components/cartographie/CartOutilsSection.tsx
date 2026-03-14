import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Layers, Star } from "lucide-react";
import { CartSectionHeader } from "./CartSectionHeader";
import { CartEmptyState } from "./CartEmptyState";
import type { CartOutilV2 } from "@/lib/cartTypes";

interface Props {
  outils: CartOutilV2[];
  activeSection?: string;
  packsCompleted?: number;
}

export const CartOutilsSection = React.memo(function CartOutilsSection({ outils, activeSection, packsCompleted }: Props) {
  return (
    <div>
      <CartSectionHeader title="Outils & SI" description="Logiciels et systemes d'information utilises" icon={Layers} count={outils.length} />
      <Card>
        <CardContent className="px-4 py-4 space-y-2">
          {outils.length === 0 ? (
            <CartEmptyState message="Aucun outil detecte pour le moment" icon={Layers} activeSection={activeSection} packsCompleted={packsCompleted} />
          ) : outils.map((o) => (
            <div key={o.id} className="flex items-start gap-3 p-3 rounded-md bg-green-50/50 border border-green-100">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{o.nom}</p>
                  {o.type_outil && <Badge variant="outline" className="text-xs">{o.type_outil}</Badge>}
                  {o.niveau_usage && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < (o.niveau_usage || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                      ))}
                    </div>
                  )}
                </div>
                {o.problemes && <p className="text-xs text-muted-foreground mt-1">{o.problemes}</p>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
});
