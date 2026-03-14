import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  CartSessionV2, CartPackResume, CartProcessusV2, CartOutilV2,
  CartEquipeV2, CartIrritantV2, CartTacheV2, CartQuickwinV2, CartReponseV2,
} from "@/lib/cartTypes";

export function useCartSessionV2(sessionId: string | undefined) {
  const [session, setSession] = useState<CartSessionV2 | null>(null);
  const [packResumes, setPackResumes] = useState<CartPackResume[]>([]);
  const [processus, setProcessus] = useState<CartProcessusV2[]>([]);
  const [outils, setOutils] = useState<CartOutilV2[]>([]);
  const [equipes, setEquipes] = useState<CartEquipeV2[]>([]);
  const [irritants, setIrritants] = useState<CartIrritantV2[]>([]);
  const [taches, setTaches] = useState<CartTacheV2[]>([]);
  const [quickwins, setQuickwins] = useState<CartQuickwinV2[]>([]);
  const [reponsesByBloc, setReponsesByBloc] = useState<Record<number, CartReponseV2[]>>({});
  const [questionCountsByBloc, setQuestionCountsByBloc] = useState<Record<number, number>>({});
  const [totalReponses, setTotalReponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partialErrors, setPartialErrors] = useState<string[]>([]);

  const loadAll = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);

    try {
      // Session is critical — fetch it first
      const sessionRes = await supabase.from("cart_sessions").select("*").eq("id", sessionId).single();
      if (sessionRes.error) throw sessionRes.error;
      setSession(sessionRes.data as CartSessionV2);

      // Use allSettled for secondary data so partial failures don't block the whole page
      const results = await Promise.allSettled([
        supabase.from("cart_pack_resumes").select("*").eq("session_id", sessionId),
        supabase.from("cart_processus").select("*").eq("session_id", sessionId).order("created_at"),
        supabase.from("cart_outils").select("*").eq("session_id", sessionId).order("created_at"),
        supabase.from("cart_equipes").select("*").eq("session_id", sessionId).order("created_at"),
        supabase.from("cart_irritants").select("*").eq("session_id", sessionId).order("gravite", { ascending: false }),
        supabase.from("cart_taches").select("*").eq("session_id", sessionId).order("created_at"),
        supabase.from("cart_quickwins").select("*").eq("session_id", sessionId).order("created_at"),
        supabase.from("cart_reponses").select("id, session_id, question_id, code_question, bloc, reponse_brute, importance, answered_at, pack_batch_id").eq("session_id", sessionId),
        supabase.from("cart_questions").select("bloc").eq("actif", true),
      ]);

      const TABLE_NAMES = ["pack_resumes", "processus", "outils", "equipes", "irritants", "taches", "quickwins", "reponses", "questions"];
      const errors: string[] = [];
      const getData = (idx: number) => {
        const r = results[idx];
        if (r.status === "rejected") {
          errors.push(TABLE_NAMES[idx] || `table ${idx}`);
          return [];
        }
        if (r.value.error) {
          errors.push(TABLE_NAMES[idx] || `table ${idx}`);
          return [];
        }
        return r.value.data || [];
      };

      setPackResumes(getData(0).map((pr: any) => ({
        ...pr,
        alertes: Array.isArray(pr.alertes) ? pr.alertes : [],
        quickwins_ids: Array.isArray(pr.quickwins_ids) ? pr.quickwins_ids : [],
      })) as CartPackResume[]);
      setProcessus(getData(1) as CartProcessusV2[]);
      setOutils(getData(2) as CartOutilV2[]);
      setEquipes(getData(3) as CartEquipeV2[]);
      setIrritants(getData(4) as CartIrritantV2[]);
      setTaches(getData(5) as CartTacheV2[]);
      setQuickwins(getData(6) as CartQuickwinV2[]);

      const reponses = getData(7);
      setTotalReponses(reponses.length);

      const qCounts: Record<number, number> = {};
      for (const q of getData(8)) {
        qCounts[q.bloc] = (qCounts[q.bloc] || 0) + 1;
      }
      setQuestionCountsByBloc(qCounts);

      const byBloc: Record<number, CartReponseV2[]> = {};
      for (const r of reponses) {
        const b = r.bloc || 0;
        if (!byBloc[b]) byBloc[b] = [];
        byBloc[b].push(r as CartReponseV2);
      }
      setReponsesByBloc(byBloc);
      setPartialErrors(errors);
    } catch (e: any) {
      setError(e.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const getPackProgress = (bloc: number) => {
    return (reponsesByBloc[bloc] || []).filter(r => r.reponse_brute?.trim()).length;
  };

  const getPackResume = (bloc: number) => packResumes.find(pr => pr.bloc === bloc) || null;

  const getPackStatus = (bloc: number): "todo" | "in_progress" | "done" => {
    const packStatus = (session?.pack_status_json as Record<string, string> | null) || {};
    if (packStatus[String(bloc)] === "done") return "done";
    const answered = getPackProgress(bloc);
    return answered > 0 ? "in_progress" : "todo";
  };

  const getPackTotalQuestions = (bloc: number) => questionCountsByBloc[bloc] || 0;

  return {
    session, packResumes, processus, outils, equipes, irritants, taches, quickwins,
    reponsesByBloc, questionCountsByBloc, totalReponses,
    loading, error, partialErrors, reload: loadAll,
    getPackProgress, getPackResume, getPackStatus, getPackTotalQuestions,
  };
}
