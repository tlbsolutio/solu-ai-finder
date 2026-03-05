import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { CartQuickwinV2 } from "@/lib/cartTypes";
import { Zap, ArrowUpDown, CheckCircle, Clock, Loader } from "lucide-react";

interface CartQuickwinsTabProps {
  sessionId: string;
  quickwins: CartQuickwinV2[];
  onReload: () => void;
}

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  "Top Priority": { label: "Top Priority", className: "bg-green-100 text-green-800 border-green-200" },
  "Important": { label: "Important", className: "bg-blue-100 text-blue-800 border-blue-200" },
  "Nice to have": { label: "Nice to have", className: "bg-gray-100 text-gray-700 border-gray-200" },
};

const IMPACT_COLOR: Record<string, string> = { Fort: "bg-green-500", Moyen: "bg-yellow-400", Faible: "bg-gray-300" };
const STATUT_NEXT: Record<string, string> = { a_faire: "en_cours", en_cours: "fait", fait: "a_faire" };
const STATUT_LABEL: Record<string, { label: string; icon: typeof Zap }> = {
  a_faire: { label: "A faire", icon: Clock },
  en_cours: { label: "En cours", icon: Loader },
  fait: { label: "Fait", icon: CheckCircle },
};

export function CartQuickwinsTab({ sessionId, quickwins, onReload }: CartQuickwinsTabProps) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"priority" | "impact" | "effort" | "bloc">("priority");

  const handleUpdateStatut = async (qw: CartQuickwinV2) => {
    const nextStatut = STATUT_NEXT[qw.statut] || "a_faire";
    setUpdating(qw.id);
    try {
      const { error } = await supabase.from("cart_quickwins").update({ statut: nextStatut }).eq("id", qw.id);
      if (error) throw error;
      toast({ title: `Statut : ${STATUT_LABEL[nextStatut]?.label || nextStatut}` });
      onReload();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setUpdating(null); }
  };

  const sortedQW = [...quickwins].sort((a, b) => {
    if (sortBy === "priority") {
      const order: Record<string, number> = { "Top Priority": 0, "Important": 1, "Nice to have": 2 };
      return (order[a.priorite_calculee || ""] ?? 3) - (order[b.priorite_calculee || ""] ?? 3);
    }
    if (sortBy === "impact") {
      const order: Record<string, number> = { Fort: 0, Moyen: 1, Faible: 2 };
      return (order[a.impact || ""] ?? 3) - (order[b.impact || ""] ?? 3);
    }
    if (sortBy === "effort") {
      const order: Record<string, number> = { Faible: 0, Moyen: 1, "Eleve": 2 };
      return (order[a.effort || ""] ?? 3) - (order[b.effort || ""] ?? 3);
    }
    return (a.bloc_source || 0) - (b.bloc_source || 0);
  });

  const byStatut = {
    a_faire: sortedQW.filter(q => q.statut === "a_faire"),
    en_cours: sortedQW.filter(q => q.statut === "en_cours"),
    fait: sortedQW.filter(q => q.statut === "fait"),
  };

  const QWCard = ({ qw }: { qw: CartQuickwinV2 }) => {
    const StatutIcon = STATUT_LABEL[qw.statut]?.icon || Clock;
    const pc = PRIORITY_CONFIG[qw.priorite_calculee || ""] || PRIORITY_CONFIG["Nice to have"];
    return (
      <div className="p-3 rounded-md border bg-card space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug">{qw.intitule}</p>
            {qw.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{qw.description}</p>}
          </div>
          <Button size="sm" variant="ghost" className="h-7 shrink-0 text-xs px-2" onClick={() => handleUpdateStatut(qw)} disabled={updating === qw.id}>
            <StatutIcon className="w-3.5 h-3.5 mr-1" />
            {STATUT_LABEL[qw.statut]?.label || qw.statut}
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {qw.priorite_calculee && <Badge className={`text-xs border ${pc.className}`}>{pc.label}</Badge>}
          {qw.impact && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${IMPACT_COLOR[qw.impact] || "bg-gray-300"}`} />
              <span className="text-xs text-muted-foreground">Impact {qw.impact}</span>
            </div>
          )}
          {qw.effort && <span className="text-xs text-muted-foreground">Effort {qw.effort}</span>}
          {qw.categorie && <Badge variant="outline" className="text-xs">{qw.categorie}</Badge>}
          {qw.bloc_source && <Badge variant="outline" className="text-xs">Pack {qw.bloc_source}</Badge>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground flex items-center gap-1"><ArrowUpDown className="w-3.5 h-3.5" /> Trier par :</span>
        {(["priority", "impact", "effort", "bloc"] as const).map(s => (
          <Button key={s} size="sm" variant={sortBy === s ? "default" : "outline"} className="h-7 text-xs" onClick={() => setSortBy(s)}>
            {{ priority: "Priorite", impact: "Impact", effort: "Effort", bloc: "Pack source" }[s]}
          </Button>
        ))}
      </div>

      {quickwins.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun quick win detecte pour l'instant.</p>
        </CardContent></Card>
      ) : (
        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban">Vue Kanban</TabsTrigger>
            <TabsTrigger value="liste">Vue Liste</TabsTrigger>
          </TabsList>
          <TabsContent value="kanban">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {(["a_faire", "en_cours", "fait"] as const).map(statut => {
                const col = byStatut[statut];
                const StatutIcon = STATUT_LABEL[statut]?.icon || Clock;
                return (
                  <div key={statut} className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <StatutIcon className="w-4 h-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-muted-foreground">{STATUT_LABEL[statut]?.label}</h3>
                      <Badge variant="secondary" className="ml-auto">{col.length}</Badge>
                    </div>
                    <div className="space-y-2 min-h-[60px]">
                      {col.map(qw => <QWCard key={qw.id} qw={qw} />)}
                      {col.length === 0 && <div className="border border-dashed rounded-md p-4 text-center"><p className="text-xs text-muted-foreground">Aucun element</p></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="liste">
            <div className="space-y-2 mt-4">{sortedQW.map(qw => <QWCard key={qw.id} qw={qw} />)}</div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
