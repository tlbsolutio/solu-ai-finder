import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Save, CheckCircle, Loader2, Cloud } from "lucide-react";
import { PACK_DEFINITIONS } from "@/components/cartographie/PackCard";

const getDraftKey = (sessionId: string, bloc: number) => `cart_pack_draft_${sessionId}_${bloc}`;

const CartPackWizard = () => {
  const { id, packId } = useParams<{ id: string; packId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const bloc = parseInt(packId || "1");
  const packDef = PACK_DEFINITIONS.find((p) => p.bloc === bloc);

  const [questions, setQuestions] = useState<any[]>([]);
  const [existingReponses, setExistingReponses] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<string[]>([]);
  const [sectionGroups, setSectionGroups] = useState<Record<string, any[]>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [questionsRes, reponsesRes] = await Promise.all([
          supabase
            .from("cart_questions")
            .select("*")
            .eq("bloc", bloc)
            .eq("actif", true)
            .order("ordre"),
          supabase
            .from("cart_reponses")
            .select("*")
            .eq("session_id", id!)
            .eq("bloc", bloc),
        ]);

        if (questionsRes.error) throw questionsRes.error;
        const qs = questionsRes.data || [];
        setQuestions(qs);

        const groups: Record<string, any[]> = {};
        for (const q of qs) {
          const section = q.section || "Questions";
          if (!groups[section]) groups[section] = [];
          groups[section].push(q);
        }
        const sortedSections = Object.keys(groups).sort();
        setSections(sortedSections);
        setSectionGroups(groups);

        const repMap: Record<string, string> = {};
        for (const r of reponsesRes.data || []) {
          if (r.question_id) repMap[r.question_id] = r.reponse_brute || "";
          if (r.code_question) repMap[r.code_question] = r.reponse_brute || "";
        }
        setExistingReponses(repMap);

        const stored = localStorage.getItem(getDraftKey(id!, bloc));
        if (stored) {
          try { setDrafts(JSON.parse(stored)); } catch {}
        }
      } catch (e: any) {
        toast({ title: "Erreur", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    if (id && bloc) load();
  }, [id, bloc]);

  useEffect(() => {
    if (Object.keys(drafts).length > 0) {
      localStorage.setItem(getDraftKey(id!, bloc), JSON.stringify(drafts));
    }
  }, [drafts, id, bloc]);

  useEffect(() => {
    syncTimer.current = setInterval(() => {
      if (Object.keys(drafts).length > 0) syncToSupabase(false);
    }, 30000);
    return () => { if (syncTimer.current) clearInterval(syncTimer.current); };
  }, [drafts, questions]);

  const getValue = useCallback((q: any) => {
    const key = q.id;
    if (drafts[key] !== undefined) return drafts[key];
    return existingReponses[q.id] || existingReponses[q.code] || "";
  }, [drafts, existingReponses]);

  const updateDraft = (questionId: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [questionId]: value }));
  };

  const syncToSupabase = async (showFeedback = true) => {
    if (!id || Object.keys(drafts).length === 0) return;
    setSyncing(true);
    try {
      const batchId = `batch_${Date.now()}`;
      const rows = Object.entries(drafts).map(([questionId, value]) => {
        const q = questions.find((q) => q.id === questionId);
        return {
          session_id: id,
          question_id: questionId,
          code_question: q?.code || null,
          bloc,
          reponse_brute: value,
          pack_batch_id: batchId,
          answered_at: new Date().toISOString(),
        };
      });

      const { error } = await supabase
        .from("cart_reponses")
        .upsert(rows, { onConflict: "session_id,question_id", ignoreDuplicates: false });

      if (error) throw error;

      await supabase.from("cart_sessions").update({ status: "en_cours" }).eq("id", id);

      if (showFeedback) toast({ title: "Sauvegarde effectuee" });
    } catch (e: any) {
      if (showFeedback) toast({ title: "Erreur sync", description: e.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await syncToSupabase(false);
      localStorage.removeItem(getDraftKey(id!, bloc));
      setDrafts({});
      navigate(`/cartographie/sessions/${id}/pack/${bloc}/results`);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
      setCompleting(false);
    }
  };

  const renderInput = (q: any) => {
    const value = getValue(q);
    const type = (q.type_reponse || "").toLowerCase();

    if (type.includes("oui") || type.includes("non")) {
      return (
        <RadioGroup value={value} onValueChange={(v) => updateDraft(q.id, v)} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Oui" id={`${q.id}-oui`} />
            <Label htmlFor={`${q.id}-oui`}>Oui</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Non" id={`${q.id}-non`} />
            <Label htmlFor={`${q.id}-non`}>Non</Label>
          </div>
        </RadioGroup>
      );
    }

    if (type.includes("1-7")) {
      const numValue = parseInt(value) || 4;
      const labels7 = ["1 - Pas du tout", "2", "3", "4 - Neutre", "5", "6", "7 - Tout a fait"];
      return (
        <div className="space-y-2">
          <Slider value={[numValue]} onValueChange={([v]) => updateDraft(q.id, String(v))} min={1} max={7} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 - Pas du tout</span>
            <span className="font-medium text-foreground text-sm">{numValue}/7</span>
            <span>7 - Tout a fait</span>
          </div>
          <div className="flex justify-between">
            {labels7.map((l, i) => (
              <span key={i} className={`text-[9px] ${numValue === i + 1 ? "text-primary font-semibold" : "text-muted-foreground/50"}`}>
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (type.includes("1-5") || type.includes("echelle") || type.includes("scale")) {
      const numValue = parseInt(value) || 3;
      return (
        <div className="space-y-2">
          <Slider value={[numValue]} onValueChange={([v]) => updateDraft(q.id, String(v))} min={1} max={5} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 - Faible</span>
            <span className="font-medium text-foreground text-sm">{numValue}/5</span>
            <span>5 - Elevee</span>
          </div>
        </div>
      );
    }

    if (type.includes("frequence") || type === "frequence") {
      const options = ["Jamais", "Rarement", "Parfois", "Souvent", "Quotidiennement"];
      return (
        <RadioGroup value={value} onValueChange={(v) => updateDraft(q.id, v)} className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <div key={opt} className="flex items-center space-x-1.5">
              <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
              <Label htmlFor={`${q.id}-${opt}`} className="text-sm">{opt}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    if (type.includes("nombre") || type.includes("numerique")) {
      return (
        <Input type="number" value={value} onChange={(e) => updateDraft(q.id, e.target.value)} placeholder="Nombre..." />
      );
    }

    return (
      <Textarea
        value={value}
        onChange={(e) => updateDraft(q.id, e.target.value)}
        placeholder="Votre reponse..."
        rows={3}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!packDef) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Pack introuvable</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-muted-foreground font-medium">Aucune question disponible pour ce pack.</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Les questions de ce bloc ne sont pas encore chargees en base de donnees.
        </p>
        <Button onClick={() => navigate(`/cartographie/sessions/${id}`)}>Retour au dashboard</Button>
      </div>
    );
  }

  const currentSection = sections[currentSectionIndex];
  const currentQuestions = sectionGroups[currentSection] || [];
  const totalAnswered = questions.filter((q) => getValue(q).trim()).length;
  const globalProgress = Math.round((totalAnswered / questions.length) * 100);
  const sectionProgress = Math.round((currentSectionIndex / Math.max(sections.length - 1, 1)) * 100);
  const isLastSection = currentSectionIndex === sections.length - 1;

  return (
    <div className="flex-1 bg-background flex flex-col">
      <header className="sticky top-12 z-10 border-b bg-card/95 backdrop-blur px-4 py-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{packDef.icon}</span>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm sm:text-base truncate">{packDef.title}</h1>
              <p className="text-[11px] text-muted-foreground">
                {totalAnswered}/{questions.length} repondues
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {syncing && <Cloud className="w-3.5 h-3.5 animate-pulse text-muted-foreground" />}
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => syncToSupabase(true)} disabled={saving || Object.keys(drafts).length === 0}>
              <Save className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Sauvegarder</span>
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Section en cours</span>
            <span>Progression globale : {globalProgress}%</span>
          </div>
          <Progress value={sectionProgress} className="h-1" />
          <Progress value={globalProgress} className="h-2" />
        </div>
      </header>

      <div className="border-b px-4 py-2 bg-muted/30">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {sections.map((sec, i) => (
            <button
              key={sec}
              onClick={() => setCurrentSectionIndex(i)}
              className={`shrink-0 px-2 py-1 rounded text-xs transition-colors ${
                i === currentSectionIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full">
        <div className="mb-4">
          <Badge variant="outline" className="mb-3">{currentSection}</Badge>
        </div>

        <div className="space-y-6">
          {currentQuestions.map((q) => {
            const hasValue = getValue(q).trim() !== "";
            return (
              <Card key={q.id} className={hasValue ? "border-green-200" : ""}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${hasValue ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                    <Label className="text-sm font-medium leading-relaxed">{q.texte}</Label>
                  </div>
                  <div className="ml-4">{renderInput(q)}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <footer className="sticky bottom-0 border-t bg-card px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
            disabled={currentSectionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Precedent
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentSectionIndex + 1} / {sections.length}
          </span>

          {isLastSection ? (
            <Button onClick={handleComplete} disabled={completing} variant="default">
              {completing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Terminer ce pack
            </Button>
          ) : (
            <Button onClick={() => setCurrentSectionIndex(Math.min(sections.length - 1, currentSectionIndex + 1))}>
              Suivant <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default CartPackWizard;
