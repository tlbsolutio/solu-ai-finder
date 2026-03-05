import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing sessionId");

    const { data: session, error: sessionError } = await supabase
      .from("cart_sessions").select("id, owner_id, nom").eq("id", sessionId).single();
    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (session.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const [reponsesRes, packResumesRes, processusRes, outilsRes, equipesRes, irritantsRes, tachesRes, quickwinsRes] = await Promise.all([
      supabase.from("cart_reponses").select("*, question:cart_questions(texte, section, type_reponse)").eq("session_id", sessionId).order("bloc"),
      supabase.from("cart_pack_resumes").select("*").eq("session_id", sessionId).order("bloc"),
      supabase.from("cart_processus").select("*").eq("session_id", sessionId),
      supabase.from("cart_outils").select("*").eq("session_id", sessionId),
      supabase.from("cart_equipes").select("*").eq("session_id", sessionId),
      supabase.from("cart_irritants").select("*").eq("session_id", sessionId),
      supabase.from("cart_taches").select("*").eq("session_id", sessionId),
      supabase.from("cart_quickwins").select("*").eq("session_id", sessionId),
    ]);

    const context = {
      session_name: session.nom,
      pack_summaries: (packResumesRes.data || []).map((pr: any) => ({
        bloc: pr.bloc, resume: pr.resume, score_maturite: pr.score_maturite, alertes: pr.alertes,
      })),
      reponses: (reponsesRes.data || []).map((r: any) => ({
        bloc: r.bloc, section: r.question?.section || "",
        texte_question: r.question?.texte || r.code_question || "",
        type_reponse: r.question?.type_reponse || "Texte",
        reponse_brute: r.reponse_brute || "",
      })).filter((r: any) => r.reponse_brute.trim()),
      processus: (processusRes.data || []).map((p: any) => ({ nom: p.nom, type: p.type, niveau_criticite: p.niveau_criticite, description: p.description })),
      outils: (outilsRes.data || []).map((o: any) => ({ nom: o.nom, type_outil: o.type_outil, problemes: o.problemes })),
      equipes: (equipesRes.data || []).map((e: any) => ({ nom: e.nom, mission: e.mission, charge_estimee: e.charge_estimee })),
      irritants: (irritantsRes.data || []).map((i: any) => ({ intitule: i.intitule, type: i.type, gravite: i.gravite, impact: i.impact })),
      taches: (tachesRes.data || []).map((t: any) => ({ nom: t.nom, frequence: t.frequence, double_saisie: t.double_saisie })),
      quickwins_par_pack: (quickwinsRes.data || []).map((q: any) => ({ intitule: q.intitule, categorie: q.categorie, impact: q.impact, effort: q.effort, bloc_source: q.bloc_source })),
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Tu es un consultant senior expert en transformation d'entreprise et optimisation des processus.
Tu analyses les donnees completes d'une cartographie d'entreprise et produis un rapport professionnel, structure et actionnable.
Tu reponds UNIQUEMENT en JSON valide, sans markdown, sans commentaires.`;

    const userPrompt = `Voici les donnees completes de la session de cartographie "${session.nom}" :

${JSON.stringify(context, null, 2)}

Produis ce JSON exact :
{
  "ai_resume_executif": "10 lignes max. Vision globale de la performance operationnelle.",
  "ai_forces": "5 a 10 points. Format liste a puces. Forces identifiees.",
  "ai_dysfonctionnements": "10-15 elements. Format : [Dysfonctionnement] — Impact: [x] — Causes probables: [liste]",
  "ai_analyse_transversale": "4 parties : 1) Problemes structurels 2) Problemes de flux 3) Problemes outils 4) Problemes humains",
  "ai_plan_optimisation": "Plan priorise : P1 Actions critiques (5-10) / P2 Actions importantes (5-10) / P3 Optimisations (5-10). Format : [Action] — Impact: [x] — Effort: [faible/moyen/eleve] — Delai: [court/moyen]",
  "ai_vision_cible": "3-5 paragraphes. Organisation cible, flux optimises, outils rationalises, gains attendus."
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        temperature: 0.4,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI error ${aiResponse.status}: ${errText}`);
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.choices?.[0]?.message?.content || "{}";
    rawContent = rawContent.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

    let parsed: any;
    try { parsed = JSON.parse(rawContent); } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    const toText = (val: unknown): string => {
      if (!val) return "";
      if (Array.isArray(val)) return val.map(item => typeof item === "string" ? item : JSON.stringify(item)).join("\n");
      if (typeof val === "object") {
        return Object.entries(val as Record<string, unknown>).map(([k, v]) => `**${k}**\n${Array.isArray(v) ? v.join("\n") : String(v)}`).join("\n\n");
      }
      return String(val);
    };

    await supabase.from("cart_sessions").update({
      ai_resume_executif: toText(parsed.ai_resume_executif),
      ai_forces: toText(parsed.ai_forces),
      ai_dysfonctionnements: toText(parsed.ai_dysfonctionnements),
      ai_analyse_transversale: toText(parsed.ai_analyse_transversale),
      ai_plan_optimisation: toText(parsed.ai_plan_optimisation),
      ai_vision_cible: toText(parsed.ai_vision_cible),
      analyse_status: "generee",
      final_generation_done: true,
    }).eq("id", sessionId);

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
