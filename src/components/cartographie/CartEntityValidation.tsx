import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Settings, Layers, Trash2, Pencil, Plus, Check, X, Merge,
  Loader2, Sparkles, ShieldCheck, ArrowRight, Lock,
} from "lucide-react";

interface Entity {
  id: string;
  nom: string;
  description: string;
  source_packs: string[];
  categorie?: string;
}

interface ExtractedEntities {
  equipes: Entity[];
  processus: Entity[];
  outils: Entity[];
}

interface CartEntityValidationProps {
  sessionId: string;
  entities: ExtractedEntities;
  extractionStatus: string;
  onExtract: () => Promise<void>;
  onValidateAndGenerate: () => Promise<void>;
  extracting: boolean;
  generating: boolean;
  isPaid?: boolean;
  onOpenGate?: () => void;
}

const ENTITY_SECTIONS = [
  { key: "equipes" as const, label: "Equipes & Roles", icon: Users, color: "orange", bgClass: "bg-orange-50/50 border-orange-100" },
  { key: "processus" as const, label: "Processus", icon: Settings, color: "blue", bgClass: "bg-blue-50/50 border-blue-100" },
  { key: "outils" as const, label: "Outils & SI", icon: Layers, color: "green", bgClass: "bg-green-50/50 border-green-100" },
];

export function CartEntityValidation({
  sessionId,
  entities,
  extractionStatus,
  onExtract,
  onValidateAndGenerate,
  extracting,
  generating,
  isPaid = true,
  onOpenGate,
}: CartEntityValidationProps) {
  const { toast } = useToast();
  const [localEntities, setLocalEntities] = useState<ExtractedEntities>(entities);
  useEffect(() => { setLocalEntities(entities); }, [entities]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ nom: string; description: string; categorie?: string }>({ nom: "", description: "" });
  const [mergeMode, setMergeMode] = useState<{ sourceId: string; type: keyof ExtractedEntities } | null>(null);
  const [addingTo, setAddingTo] = useState<keyof ExtractedEntities | null>(null);
  const [addForm, setAddForm] = useState<{ nom: string; description: string; categorie?: string }>({ nom: "", description: "" });
  const [saving, setSaving] = useState(false);

  const hasEntities = localEntities.equipes.length > 0 || localEntities.processus.length > 0 || localEntities.outils.length > 0;

  // Save entities to DB
  const saveEntities = useCallback(async (updated: ExtractedEntities) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("cart_sessions").update({
        ai_extracted_entities: updated,
      }).eq("id", sessionId);
      if (error) throw error;
      setLocalEntities(updated);
    } catch (e: any) {
      toast({ title: "Erreur de sauvegarde", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [sessionId, toast]);

  const handleDelete = (type: keyof ExtractedEntities, id: string) => {
    const entity = localEntities[type].find(e => e.id === id);
    if (!entity || !confirm(`Supprimer "${entity.nom}" ?`)) return;
    const updated = {
      ...localEntities,
      [type]: localEntities[type].filter(e => e.id !== id),
    };
    saveEntities(updated);
  };

  const handleStartEdit = (entity: Entity) => {
    setEditingId(entity.id);
    setEditForm({ nom: entity.nom, description: entity.description, categorie: entity.categorie });
  };

  const handleSaveEdit = (type: keyof ExtractedEntities) => {
    if (!editingId) return;
    const updated = {
      ...localEntities,
      [type]: localEntities[type].map(e =>
        e.id === editingId ? { ...e, nom: editForm.nom, description: editForm.description, categorie: editForm.categorie } : e
      ),
    };
    saveEntities(updated);
    setEditingId(null);
  };

  const handleMerge = (type: keyof ExtractedEntities, targetId: string) => {
    if (!mergeMode || mergeMode.type !== type) return;
    const source = localEntities[type].find(e => e.id === mergeMode.sourceId);
    const target = localEntities[type].find(e => e.id === targetId);
    if (!source || !target || source.id === target.id) return;

    const merged: Entity = {
      ...target,
      nom: target.nom,
      description: `${target.description}\n${source.description}`.trim(),
      source_packs: [...new Set([...target.source_packs, ...source.source_packs])],
    };

    const updated = {
      ...localEntities,
      [type]: localEntities[type]
        .filter(e => e.id !== source.id)
        .map(e => e.id === target.id ? merged : e),
    };
    saveEntities(updated);
    setMergeMode(null);
    toast({ title: "Fusionne", description: `"${source.nom}" fusionne dans "${target.nom}"` });
  };

  const handleAdd = (type: keyof ExtractedEntities) => {
    if (!addForm.nom.trim()) return;
    const newEntity: Entity = {
      id: `${type.slice(0, 2)}_${Date.now()}`,
      nom: addForm.nom.trim(),
      description: addForm.description.trim(),
      source_packs: [],
      ...(type === "outils" ? { categorie: addForm.categorie || "Autre" } : {}),
    };
    const updated = {
      ...localEntities,
      [type]: [...localEntities[type], newEntity],
    };
    saveEntities(updated);
    setAddingTo(null);
    setAddForm({ nom: "", description: "" });
  };

  const handleValidate = async () => {
    const { error } = await supabase.from("cart_sessions").update({
      ai_extracted_entities: localEntities,
      entities_extraction_status: "validated",
      entities_validated_at: new Date().toISOString(),
    }).eq("id", sessionId);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    onValidateAndGenerate();
  };

  // Not yet extracted
  if (extractionStatus === "pending" || !hasEntities) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-cyan-500" />
        </div>
        <div className="text-center max-w-md space-y-2">
          <h2 className="text-lg font-semibold">Extraction des entites</h2>
          <p className="text-sm text-muted-foreground">
            L'IA va analyser l'ensemble de vos reponses pour extraire et dedupliquer les equipes, processus et outils de votre organisation.
          </p>
        </div>
        <Button
          onClick={isPaid ? onExtract : onOpenGate}
          disabled={extracting}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white px-6"
        >
          {extracting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Extraction en cours...
            </>
          ) : !isPaid ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Extraire (Premium)
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Extraire les entites
            </>
          )}
        </Button>
        {extracting && (
          <p className="text-xs text-muted-foreground">Cela prend environ 15 a 30 secondes</p>
        )}
      </div>
    );
  }

  // Extracting
  if (extractionStatus === "extracting") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-cyan-500 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 animate-ping" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold">Extraction en cours...</h2>
          <p className="text-sm text-muted-foreground">L'IA analyse vos reponses de tous les packs pour extraire les entites.</p>
        </div>
      </div>
    );
  }

  // Extracted or validated — show validation UI
  const totalEntities = localEntities.equipes.length + localEntities.processus.length + localEntities.outils.length;
  const isValidated = extractionStatus === "validated";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h2 className="font-semibold text-base">Validation des entites</h2>
            <p className="text-xs text-muted-foreground">
              {totalEntities} entites extraites — Verifiez, fusionnez ou ajoutez avant l'analyse finale
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          <Button
            onClick={onExtract}
            disabled={extracting || saving}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Re-extraire
          </Button>
          <Button
            onClick={handleValidate}
            disabled={generating || isValidated || saving}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white text-xs"
            size="sm"
          >
            {generating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                Generation...
              </>
            ) : isValidated ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1" />
                Valide
              </>
            ) : (
              <>
                <ArrowRight className="w-3.5 h-3.5 mr-1" />
                Valider & Generer l'analyse
              </>
            )}
          </Button>
        </div>
      </div>

      {mergeMode && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm flex items-center justify-between animate-fade-in-up">
          <span className="text-amber-800">
            <Merge className="w-4 h-4 inline mr-1.5" />
            Mode fusion : cliquez sur l'entite cible pour fusionner
          </span>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setMergeMode(null)}>
            <X className="w-3 h-3 mr-1" /> Annuler
          </Button>
        </div>
      )}

      {/* Entity sections */}
      {ENTITY_SECTIONS.map(({ key, label, icon: SIcon, color, bgClass }) => {
        const items = localEntities[key];
        return (
          <Card key={key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <SIcon className="w-4 h-4" />
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{items.length}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => { setAddingTo(addingTo === key ? null : key); setAddForm({ nom: "", description: "" }); }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Add form */}
              {addingTo === key && (
                <div className={`p-3 rounded-lg border-2 border-dashed space-y-2 ${
                    key === "equipes" ? "border-orange-200 bg-orange-50/30" :
                    key === "processus" ? "border-blue-200 bg-blue-50/30" :
                    "border-green-200 bg-green-50/30"
                  }`}>
                  <Input
                    placeholder="Nom"
                    value={addForm.nom}
                    onChange={e => setAddForm(f => ({ ...f, nom: e.target.value }))}
                    className="h-8 text-sm"
                  />
                  <Textarea
                    placeholder="Description"
                    value={addForm.description}
                    onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                    className="text-sm min-h-[60px]"
                  />
                  {key === "outils" && (
                    <Input
                      placeholder="Categorie (CRM, ERP, Bureautique...)"
                      value={addForm.categorie || ""}
                      onChange={e => setAddForm(f => ({ ...f, categorie: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs" onClick={() => handleAdd(key)}>
                      <Check className="w-3 h-3 mr-1" /> Ajouter
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingTo(null)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              {items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune entite detectee</p>
              )}

              {items.map(entity => {
                const isEditing = editingId === entity.id;
                const isMergeSource = mergeMode?.sourceId === entity.id;
                const isMergeTarget = mergeMode && mergeMode.type === key && mergeMode.sourceId !== entity.id;

                return (
                  <div
                    key={entity.id}
                    className={`flex items-start justify-between gap-3 p-3 rounded-lg border transition-all ${bgClass} ${
                      isMergeSource ? "ring-2 ring-amber-400" : ""
                    } ${isMergeTarget ? "cursor-pointer hover:ring-2 hover:ring-cyan-400" : ""} ${saving ? "pointer-events-none opacity-70" : ""}`}
                    onClick={isMergeTarget ? () => handleMerge(key, entity.id) : undefined}
                  >
                    {isEditing ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={editForm.nom}
                          onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))}
                          className="h-8 text-sm"
                        />
                        <Textarea
                          value={editForm.description}
                          onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                          className="text-sm min-h-[60px]"
                        />
                        {key === "outils" && (
                          <Input
                            value={editForm.categorie || ""}
                            onChange={e => setEditForm(f => ({ ...f, categorie: e.target.value }))}
                            className="h-8 text-sm"
                            placeholder="Categorie"
                          />
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 text-xs" onClick={() => handleSaveEdit(key)}>
                            <Check className="w-3 h-3 mr-1" /> Sauver
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium">{entity.nom}</p>
                            {entity.categorie && (
                              <Badge variant="outline" className="text-[10px]">{entity.categorie}</Badge>
                            )}
                            {entity.source_packs.length > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                Packs {entity.source_packs.join(", ")}
                              </span>
                            )}
                          </div>
                          {entity.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entity.description}</p>
                          )}
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600 hover:bg-blue-50" onClick={() => handleStartEdit(entity)} title="Modifier">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon" variant="ghost"
                            className={`h-7 w-7 hover:bg-amber-50 ${isMergeSource ? "text-amber-600 bg-amber-50" : "text-amber-500"}`}
                            onClick={() => setMergeMode(mergeMode?.sourceId === entity.id ? null : { sourceId: entity.id, type: key })}
                            title="Fusionner"
                          >
                            <Merge className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-red-50" onClick={() => handleDelete(key, entity.id)} title="Supprimer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
