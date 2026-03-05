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

  const loadAll = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);

    try {
      const [sessionRes, packResumesRes, processusRes, outilsRes, equipesRes, irritantsRes, tachesRes, quickwinsRes, reponsesRes, questionsRes] = await Promise.all([
        supabase.from("cart_sessions").select("*").eq("id", sessionId).single(),
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

      if (sessionRes.error) throw sessionRes.error;

      setSession(sessionRes.data as CartSessionV2);
      setPackResumes((packResumesRes.data || []).map(pr => ({
        ...pr,
        alertes: Array.isArray(pr.alertes) ? pr.alertes : [],
        quickwins_ids: Array.isArray(pr.quickwins_ids) ? pr.quickwins_ids : [],
      })) as CartPackResume[]);
      setProcessus((processusRes.data || []) as CartProcessusV2[]);
      setOutils((outilsRes.data || []) as CartOutilV2[]);
      setEquipes((equipesRes.data || []) as CartEquipeV2[]);
      setIrritants((irritantsRes.data || []) as CartIrritantV2[]);
      setTaches((tachesRes.data || []) as CartTacheV2[]);
      setQuickwins((quickwinsRes.data || []) as CartQuickwinV2[]);

      const reponses = reponsesRes.data || [];
      setTotalReponses(reponses.length);

      const qCounts: Record<number, number> = {};
      for (const q of (questionsRes.data || [])) {
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
    loading, error, reload: loadAll,
    getPackProgress, getPackResume, getPackStatus, getPackTotalQuestions,
  };
}
