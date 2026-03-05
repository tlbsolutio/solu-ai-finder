import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormattedText } from "@/components/cartographie/FormattedText";
import { useToast } from "@/hooks/use-toast";
import type { CartQuickwinV2 } from "@/lib/cartTypes";
import { ClipboardList, Star, CheckCircle, Clock, Loader2, Zap, ArrowUpDown, TrendingUp, Filter } from "lucide-react";

interface CartPlanActionsTabProps {
  sessionId: string;
  quickwins: CartQuickwinV2[];
  aiPlanOptimisation?: string | null;
  onReload: () => void;
}

const PRIORITY_MAP: Record<string, { label: string; p: string; color: string; border: string }> = {
  "Top Priority": { label: "P1 — Action prioritaire", p: "P1", color: "bg-red-50", border: "border-red-200" },
  "Important": { label: "P2 — Important", p: "P2", color: "bg-orange-50", border: "border-orange-200" },
  "Nice to have": { label: "P3 — Nice to have", p: "P3", color: "bg-blue-50", border: "border-blue-200" },
};

const STATUT_NEXT: Record<string, string> = { a_faire: "en_cours", en_cours: "fait", fait: "a_faire" };
const STATUT_LABEL: Record<string, { label: string; className: string }> = {
  a_faire: { label: "A faire", className: "bg-muted text-muted-foreground" },
  en_cours: { label: "En cours", className: "bg-blue-100 text-blue-800 border-blue-200" },
  fait: { label: "Fait", className: "bg-green-100 text-green-800 border-green-200" },
};

const IMPACT_DOT: Record<string, string> = { Fort: "bg-green-500", Moyen: "bg-yellow-400", Faible: "bg-gray-300" };

export function CartPlanActionsTab({ sessionId, quickwins, aiPlanOptimisation, onReload }: CartPlanActionsTabProps) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterStatut, setFilterStatut] = useState<string | null>(null);

  const handleUpdateStatut = async (qw: CartQuickwinV2) => {
    const next = STATUT_NEXT[qw.statut] || "a_faire";
    setUpdating(qw.id);
    try {
      const { error } = await supabase.from("cart_quickwins").update({ statut: next }).eq("id", qw.id);
      if (error) throw error;
      toast({ title: `Statut → ${STATUT_LABEL[next]?.label}` });
      onReload();
    } catch (e: any) { toast({ title: "Erreur", description: e.message, variant: "destructive" }); }
    finally { setUpdating(null); }
  };

  const p1 = quickwins.filter(q => q.priorite_calculee === "Top Priority");
  const p2 = quickwins.filter(q => q.priorite_calculee === "Important");
  const p3 = quickwins.filter(q => q.priorite_calculee === "Nice to have" || !q.priorite_calculee);
  const filteredQW = filterStatut ? quickwins.filter(q => q.statut === filterStatut) : quickwins;
  const done = quickwins.filter(q => q.statut === "fait").length;
  const pct = quickwins.length > 0 ? Math.round((done / quickwins.length) * 100) : 0;

  const ActionCard = ({ qw }: { qw: CartQuickwinV2 }) => {
    const statut = STATUT_LABEL[qw.statut] || STATUT_LABEL.a_faire;
    const prio = PRIORITY_MAP[qw.priorite_calculee || ""] || PRIORITY_MAP["Nice to have"];
    return (
      <div className={`rounded-md border p-3 space-y-2 ${prio.color} ${prio.border}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Badge className="text-xs shrink-0 bg-white border font-bold">{prio.p}</Badge>
            <p className="text-sm font-medium leading-snug">{qw.intitule}</p>
          </div>
          <Button size="sm" variant="ghost" className={`h-7 shrink-0 text-xs px-2 border ${statut.className}`} onClick={() => handleUpdateStatut(qw)} disabled={updating === qw.id}>
            {updating === qw.id ? <Loader2 className="w-3 h-3 animate-spin" /> : qw.statut === "fait" ? <CheckCircle className="w-3 h-3 mr-1" /> : qw.statut === "en_cours" ? <Clock className="w-3 h-3 mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
            {statut.label}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 ml-10">
          {qw.impact && <div className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${IMPACT_DOT[qw.impact] || "bg-gray-300"}`} /><span className="text-xs text-muted-foreground">Impact {qw.impact}</span></div>}
          {qw.effort && <span className="text-xs text-muted-foreground">Effort {qw.effort}</span>}
          {qw.categorie && <Badge variant="outline" className="text-xs bg-white/60">{qw.categorie}</Badge>}
        </div>
      </div>
    );
  };

  const PriorityGroup = ({ title, items, className }: { title: string; items: CartQuickwinV2[]; className: string }) => (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${className}`}>
        <Star className="w-4 h-4" /><h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
      </div>
      {items.length === 0 ? (
        <div className="border border-dashed rounded-md p-4 text-center"><p className="text-xs text-muted-foreground">Aucune action</p></div>
      ) : <div className="space-y-2">{items.map(qw => <ActionCard key={qw.id} qw={qw} />)}</div>}
    </div>
  );

  return (
    <div className="space-y-4 pb-8">
      {quickwins.length > 0 && (
        <Card><CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Avancement du plan</p>
            <span className="text-sm font-bold text-primary">{done}/{quickwins.length} actions</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">{pct}% complete</p>
            <div className="flex gap-2">
              {Object.entries(STATUT_LABEL).map(([key, val]) => (
                <button key={key} onClick={() => setFilterStatut(filterStatut === key ? null : key)}
                  className={`text-xs px-2 py-0.5 rounded border transition-all ${filterStatut === key ? val.className : "bg-muted text-muted-foreground border-transparent"}`}>
                  <Filter className="inline w-2.5 h-2.5 mr-1" />{val.label} ({quickwins.filter(q => q.statut === key).length})
                </button>
              ))}
            </div>
          </div>
        </CardContent></Card>
      )}

      {quickwins.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune action detectee.</p>
        </CardContent></Card>
      ) : (
        <Tabs defaultValue="priorites">
          <TabsList>
            <TabsTrigger value="priorites" className="text-xs gap-1"><TrendingUp className="w-3.5 h-3.5" />Par priorite</TabsTrigger>
            <TabsTrigger value="liste" className="text-xs gap-1"><ArrowUpDown className="w-3.5 h-3.5" />Vue liste</TabsTrigger>
            {aiPlanOptimisation && <TabsTrigger value="ia" className="text-xs gap-1"><ClipboardList className="w-3.5 h-3.5" />Plan IA</TabsTrigger>}
          </TabsList>
          <TabsContent value="priorites" className="space-y-4 mt-4">
            <PriorityGroup title="P1 — Actions prioritaires" items={filterStatut ? p1.filter(q => q.statut === filterStatut) : p1} className="bg-red-100 text-red-900" />
            <PriorityGroup title="P2 — Actions importantes" items={filterStatut ? p2.filter(q => q.statut === filterStatut) : p2} className="bg-orange-100 text-orange-900" />
            <PriorityGroup title="P3 — Nice to have" items={filterStatut ? p3.filter(q => q.statut === filterStatut) : p3} className="bg-blue-100 text-blue-900" />
          </TabsContent>
          <TabsContent value="liste" className="space-y-2 mt-4">
            {filteredQW.length === 0 ? <Card><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">Aucune action avec ce filtre</p></CardContent></Card> : filteredQW.map(qw => <ActionCard key={qw.id} qw={qw} />)}
          </TabsContent>
          {aiPlanOptimisation && (
            <TabsContent value="ia" className="mt-4">
              <Card><CardHeader className="pb-2 px-4 pt-4"><CardTitle className="text-sm">Plan d'optimisation IA</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4"><FormattedText text={aiPlanOptimisation} /></CardContent></Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
