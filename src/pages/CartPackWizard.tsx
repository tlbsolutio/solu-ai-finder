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
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ChevronLeft, ChevronRight, Save, CheckCircle, Loader2, Cloud, FileText } from "lucide-react";
import { PACK_DEFINITIONS } from "@/components/cartographie/PackCard";

const getDraftKey = (sessionId: string, bloc: number) => `cart_pack_draft_${sessionId}_${bloc}`;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface DraftPayload {
  answers: Record<string, string>;
  savedAt: number;
}

const readDraftPayload = (sessionId: string, bloc: number): DraftPayload | null => {
  const raw = localStorage.getItem(getDraftKey(sessionId, bloc));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // Support legacy format (plain object of answers without savedAt)
    if (parsed && typeof parsed === "object" && !parsed.savedAt) {
      return { answers: parsed, savedAt: Date.now() };
    }
    if (parsed && parsed.answers && typeof parsed.savedAt === "number") {
      return parsed as DraftPayload;
    }
    return null;
  } catch {
    return null;
  }
};

const writeDraftPayload = (sessionId: string, bloc: number, answers: Record<string, string>) => {
  const payload: DraftPayload = { answers, savedAt: Date.now() };
  localStorage.setItem(getDraftKey(sessionId, bloc), JSON.stringify(payload));
};

const formatTimeAgo = (timestamp: number): string => {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "a l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD}j`;
};

const CartPackWizard = () => {
  const { id, packId } = useParams<{ id: string; packId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { track } = useAnalytics(id);

  const bloc = parseInt(packId || "0");
  const packDef = PACK_DEFINITIONS.find((p) => p.bloc === bloc);
  usePageTitle(packDef ? `Questionnaire - ${packDef.title}` : "Questionnaire");

  const [questions, setQuestions] = useState<any[]>([]);
  const [existingReponses, setExistingReponses] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<string[]>([]);
  const [sectionGroups, setSectionGroups] = useState<Record<string, any[]>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showAutoSaved, setShowAutoSaved] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [pendingDraftAnswers, setPendingDraftAnswers] = useState<Record<string, string> | null>(null);
  const syncTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

        const draftPayload = readDraftPayload(id!, bloc);
        if (draftPayload) {
          const hasContent = Object.values(draftPayload.answers).some((v) => v.trim() !== "");
          const isStale = Date.now() - draftPayload.savedAt > SEVEN_DAYS_MS;
          if (isStale) {
            // Auto-clear stale drafts
            localStorage.removeItem(getDraftKey(id!, bloc));
          } else if (hasContent) {
            // Show recovery prompt instead of auto-loading
            setPendingDraftAnswers(draftPayload.answers);
            setLastSavedAt(draftPayload.savedAt);
            setShowDraftRecovery(true);
          }
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
      writeDraftPayload(id!, bloc, drafts);
      const now = Date.now();
      setLastSavedAt(now);
      // Show auto-save indicator briefly
      setShowAutoSaved(true);
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
      autoSaveTimeout.current = setTimeout(() => setShowAutoSaved(false), 2000);
    }
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  }, [drafts, id, bloc]);

  useEffect(() => {
    syncTimer.current = setInterval(() => {
      if (Object.keys(drafts).length > 0) syncToSupabase(false);
    }, 30000);
    return () => { if (syncTimer.current) clearInterval(syncTimer.current); };
  }, [drafts, questions]);

  // Keyboard shortcuts: Ctrl+S save, ArrowLeft/Right navigate sections
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S → save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        syncToSupabase(true);
        return;
      }
      // Arrow keys: only when not in input/textarea/select
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft") {
        setCurrentSectionIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentSectionIndex((prev) => Math.min(sections.length - 1, prev + 1));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sections.length, drafts, questions]);

  // Warn on page unload if unsaved drafts exist
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (Object.keys(drafts).length > 0) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [drafts]);

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
    const syncedDrafts = { ...drafts };
    setSyncing(true);
    try {
      const batchId = `batch_${Date.now()}`;
      const rows = Object.entries(syncedDrafts).map(([questionId, value]) => {
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

      // Merge synced answers into existingReponses and clear only the synced drafts
      setExistingReponses((prev) => ({ ...prev, ...syncedDrafts }));
      setDrafts((current) => {
        const remaining: Record<string, string> = {};
        for (const [k, v] of Object.entries(current)) {
          // Keep draft if the user changed it after we started syncing
          if (!(k in syncedDrafts) || v !== syncedDrafts[k]) {
            remaining[k] = v;
          }
        }
        return remaining;
      });
      localStorage.removeItem(getDraftKey(id!, bloc));

      if (showFeedback) toast({ title: "Sauvegarde effectuee" });
    } catch (e: any) {
      if (showFeedback) toast({ title: "Erreur sync", description: e.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleComplete = async () => {
    // Validate at least 3 answers before completing
    const answered = questions.filter((q) => getValue(q).trim()).length;
    if (answered < 3) {
      const unanswered = questions.filter((q) => !getValue(q).trim());
      const firstUnansweredSection = unanswered.length > 0
        ? (unanswered[0].section || "Questions")
        : null;
      toast({
        title: "Reponses insuffisantes",
        description: `Veuillez repondre a au moins 3 questions (${answered} actuellement). ${firstUnansweredSection ? `Commencez par la section "${firstUnansweredSection}".` : ""}`,
        variant: "destructive",
      });
      // Navigate to section with first unanswered question
      if (firstUnansweredSection) {
        const idx = sections.indexOf(firstUnansweredSection);
        if (idx >= 0) setCurrentSectionIndex(idx);
      }
      return;
    }
    setCompleting(true);
    try {
      await syncToSupabase(false);
      localStorage.removeItem(getDraftKey(id!, bloc));
      setDrafts({});
      setLastSavedAt(null);
      track("pack_completed", { bloc, packTitle: packDef?.title });
      navigate(`/cartographie/sessions/${id}/pack/${bloc}/results`);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
      setCompleting(false);
    }
  };

  // Guard: invalid pack ID (after all hooks)
  if (!packDef || isNaN(bloc) || bloc < 1 || bloc > 10) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-destructive font-medium">Pack introuvable</p>
          <p className="text-sm text-muted-foreground">Le pack "{packId}" n'existe pas (packs 1-10 disponibles)</p>
          <Button onClick={() => navigate(`/cartographie/sessions/${id}`)}>Retour au diagnostic</Button>
        </div>
      </div>
    );
  }

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
          <Slider value={[numValue]} onValueChange={([v]) => updateDraft(q.id, String(v))} min={1} max={7} step={1} aria-label={q.texte} />
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
          <Slider value={[numValue]} onValueChange={([v]) => updateDraft(q.id, String(v))} min={1} max={5} step={1} aria-label={q.texte} />
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
        <Input type="number" value={value} onChange={(e) => updateDraft(q.id, e.target.value)} placeholder="Nombre..." aria-label={q.texte} />
      );
    }

    return (
      <Textarea
        value={value}
        onChange={(e) => updateDraft(q.id, e.target.value)}
        placeholder="Votre reponse..."
        rows={3}
        aria-label={q.texte}
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
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => syncToSupabase(true)} disabled={syncing || Object.keys(drafts).length === 0}>
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
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {sections.map((sec, i) => {
            const sectionQs = sectionGroups[sec] || [];
            const answered = sectionQs.filter((q: any) => getValue(q).trim()).length;
            const allDone = answered === sectionQs.length && sectionQs.length > 0;
            return (
              <button
                key={sec}
                onClick={() => setCurrentSectionIndex(i)}
                className={`shrink-0 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  i === currentSectionIndex
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : allDone
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : answered > 0
                    ? "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {allDone && i !== currentSectionIndex && <CheckCircle className="w-3 h-3" />}
                <span>{sec.length > 20 ? `${i + 1}` : sec}</span>
                {!allDone && answered > 0 && i !== currentSectionIndex && (
                  <span className="text-[9px] opacity-70">{answered}/{sectionQs.length}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {showDraftRecovery && pendingDraftAnswers && (
        <div className="px-4 pt-4 max-w-2xl mx-auto w-full">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">Un brouillon a ete trouve pour ce pack. Voulez-vous le recuperer ?</p>
              {lastSavedAt && (
                <p className="text-xs text-amber-700 mt-0.5">Derniere sauvegarde : {formatTimeAgo(lastSavedAt)}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="default"
                className="text-xs"
                onClick={() => {
                  setDrafts(pendingDraftAnswers);
                  setShowDraftRecovery(false);
                  setPendingDraftAnswers(null);
                }}
              >
                Recuperer le brouillon
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => {
                  localStorage.removeItem(getDraftKey(id!, bloc));
                  setShowDraftRecovery(false);
                  setPendingDraftAnswers(null);
                  setLastSavedAt(null);
                }}
              >
                Commencer a zero
              </Button>
            </div>
          </div>
        </div>
      )}

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

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              {currentSectionIndex + 1} / {sections.length}
            </span>
            <br />
            {showAutoSaved ? (
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1 animate-in fade-in duration-300">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Brouillon sauvegarde
              </span>
            ) : lastSavedAt && !showDraftRecovery ? (
              <span className="text-[10px] text-muted-foreground">
                Derniere sauvegarde : {formatTimeAgo(lastSavedAt)}
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground hidden sm:inline">Ctrl+S sauvegarder &middot; &larr; &rarr; naviguer</span>
            )}
          </div>

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
