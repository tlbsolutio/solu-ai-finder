import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BLOC_NAMES: Record<number, string> = {
  1: "Contexte & Organisation",
  2: "Clients & Offres",
  3: "Organisation & Gouvernance",
  4: "Ressources Humaines",
  5: "Processus Commerciaux",
  6: "Processus Operationnels",
  7: "Outils & SI",
  8: "Communication Interne",
  9: "Qualite & Conformite",
  10: "KPIs & Pilotage",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { session_id, bloc_number, reponses } = await req.json();

    if (!session_id || !bloc_number) {
      return new Response(JSON.stringify({ error: "Missing session_id or bloc_number" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Verify session ownership via owner_id
    const { data: session, error: sessionError } = await supabase
      .from("cart_sessions")
      .select("id, owner_id, nom")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (session.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // If no reponses passed, fetch from DB
    let reponsesToAnalyze = reponses;
    if (!reponsesToAnalyze || reponsesToAnalyze.length === 0) {
      const { data: dbReponses } = await supabase
        .from("cart_reponses")
        .select("*, question:cart_questions(texte, type_reponse)")
        .eq("session_id", session_id)
        .eq("bloc", bloc_number);
      reponsesToAnalyze = (dbReponses || []).map((r: any) => ({
        texte_question: r.question?.texte || r.code_question || "Question",
        type_reponse: r.question?.type_reponse || "Texte",
        reponse_brute: r.reponse_brute || "",
        code_question: r.code_question || "",
      }));
    }

    const blocName = BLOC_NAMES[bloc_number] || `Bloc ${bloc_number}`;
    const reponsesText = (reponsesToAnalyze || [])
      .filter((r: any) => r.reponse_brute && r.reponse_brute.trim())
      .map((r: any) => `Q: ${r.texte_question}\nType: ${r.type_reponse}\nReponse: ${r.reponse_brute}`)
      .join("\n\n");

    const systemPrompt = `Tu es l'IA d'analyse de l'Outil Cartographie & Optimisation Solutio.
Tu recois les reponses d'UN SEUL BLOC du questionnaire de cartographie d'entreprise.
Tu dois analyser ces reponses et produire un JSON structure avec des insights precis et actionnables.
Reponds UNIQUEMENT avec du JSON valide, sans markdown, sans explications.
Sois concis mais precis. Genere uniquement ce qui est clairement detectable dans les reponses.`;

    const userPrompt = `Contexte du bloc : ${blocName}
Nombre de reponses fournies : ${(reponsesToAnalyze || []).length}

REPONSES DU BLOC :
${reponsesText || "Aucune reponse fournie pour ce bloc."}

Produis EXACTEMENT ce JSON (sans commentaires, sans markdown) :
{
  "resume": "Synthese professionnelle en 5-8 lignes basee sur les reponses.",
  "score_maturite": 3,
  "alertes": [
    { "titre": "...", "description": "...", "gravite": "critique" }
  ],
  "processus_detectes": [
    { "nom_processus": "...", "type": "Commercial", "niveau_criticite": "Medium", "description_courte": "..." }
  ],
  "outils_detectes": [
    { "nom_outil": "...", "type_outil": "CRM", "usage_note": "..." }
  ],
  "equipes_detectees": [
    { "nom_equipe": "...", "mission_courte": "...", "charge_estimee": 3 }
  ],
  "irritants_detectes": [
    { "intitule": "...", "type": "Processus", "gravite": 3, "impact": "Temps" }
  ],
  "taches_manuelles_detectees": [
    { "nom_tache": "...", "frequence": "Quotidien", "double_saisie": false }
  ],
  "quickwins": [
    { "action": "...", "impact": "Moyen", "effort": "Faible", "categorie": "Processus" }
  ]
}

Score maturite: 1=Tres faible, 2=Faible, 3=Moyen, 4=Bon, 5=Excellent
Genere SEULEMENT les objets clairement detectables dans les reponses. Tableaux vides si rien de detecte.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI error ${aiResponse.status}: ${errText}`);
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.choices?.[0]?.message?.content || "{}";
    rawContent = rawContent.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

    let analysis: any;
    try {
      analysis = JSON.parse(rawContent);
    } catch {
      analysis = {
        resume: "Analyse generee partiellement.",
        score_maturite: 3, alertes: [],
        processus_detectes: [], outils_detectes: [], equipes_detectees: [],
        irritants_detectes: [], taches_manuelles_detectees: [], quickwins: [],
      };
    }

    // Delete previous AI objects
    await Promise.all([
      supabase.from("cart_quickwins").delete().eq("session_id", session_id).eq("bloc_source", bloc_number).eq("ai_generated", true),
      supabase.from("cart_processus").delete().eq("session_id", session_id).eq("ai_generated", true),
      supabase.from("cart_outils").delete().eq("session_id", session_id).eq("ai_generated", true),
      supabase.from("cart_equipes").delete().eq("session_id", session_id).eq("ai_generated", true),
      supabase.from("cart_irritants").delete().eq("session_id", session_id).eq("ai_generated", true),
      supabase.from("cart_taches").delete().eq("session_id", session_id).eq("ai_generated", true),
    ]);

    // Insert detected objects
    const insertResults: any = { processus: [], outils: [], equipes: [], irritants: [], taches: [], quickwins: [] };

    if (analysis.processus_detectes?.length > 0) {
      const rows = analysis.processus_detectes.map((p: any) => ({
        session_id, nom: p.nom_processus || "Processus", type: p.type || "Autre",
        niveau_criticite: p.niveau_criticite || "Medium", description: p.description_courte || null,
        ai_generated: true, validated: false,
      }));
      const { data } = await supabase.from("cart_processus").insert(rows).select();
      insertResults.processus = data || [];
    }

    if (analysis.outils_detectes?.length > 0) {
      const rows = analysis.outils_detectes.map((o: any) => ({
        session_id, nom: o.nom_outil || "Outil", type_outil: o.type_outil || "Autre",
        problemes: o.usage_note || null, ai_generated: true, validated: false,
      }));
      const { data } = await supabase.from("cart_outils").insert(rows).select();
      insertResults.outils = data || [];
    }

    if (analysis.equipes_detectees?.length > 0) {
      const rows = analysis.equipes_detectees.map((e: any) => ({
        session_id, nom: e.nom_equipe || "Equipe", mission: e.mission_courte || null,
        charge_estimee: e.charge_estimee || null, ai_generated: true, validated: false,
      }));
      const { data } = await supabase.from("cart_equipes").insert(rows).select();
      insertResults.equipes = data || [];
    }

    if (analysis.irritants_detectes?.length > 0) {
      const rows = analysis.irritants_detectes.map((i: any) => ({
        session_id, intitule: i.intitule || "Irritant", type: i.type || "Autre",
        gravite: i.gravite || 3, impact: i.impact || null, ai_generated: true, validated: false,
      }));
      const { data } = await supabase.from("cart_irritants").insert(rows).select();
      insertResults.irritants = data || [];
    }

    if (analysis.taches_manuelles_detectees?.length > 0) {
      const rows = analysis.taches_manuelles_detectees.map((t: any) => ({
        session_id, nom: t.nom_tache || "Tache", frequence: t.frequence || null,
        double_saisie: t.double_saisie || false, ai_generated: true,
      }));
      const { data } = await supabase.from("cart_taches").insert(rows).select();
      insertResults.taches = data || [];
    }

    const quickwinIds: string[] = [];
    if (analysis.quickwins?.length > 0) {
      const rows = analysis.quickwins.map((q: any) => ({
        session_id, bloc_source: bloc_number, intitule: q.action || "Quick win",
        categorie: q.categorie || "Processus", impact: q.impact || "Moyen", effort: q.effort || "Moyen",
        statut: "a_faire",
        priorite_calculee: q.impact === "Fort" && q.effort === "Faible" ? "Top Priority" : q.impact === "Fort" ? "Important" : "Nice to have",
        ai_generated: true,
      }));
      const { data } = await supabase.from("cart_quickwins").insert(rows).select();
      insertResults.quickwins = data || [];
      quickwinIds.push(...(data || []).map((q: any) => q.id));
    }

    const objetsCount = Object.values(insertResults).reduce((acc: number, arr: any) => acc + arr.length, 0);

    await supabase.from("cart_pack_resumes").upsert({
      session_id, bloc: bloc_number, resume: analysis.resume || "",
      score_maturite: analysis.score_maturite || 3, alertes: analysis.alertes || [],
      quickwins_ids: quickwinIds, objets_generes_count: objetsCount,
      generated_at: new Date().toISOString(),
    }, { onConflict: "session_id,bloc" });

    // Update session pack status
    const { data: sessionData } = await supabase
      .from("cart_sessions").select("pack_status_json, packs_completed").eq("id", session_id).single();

    const currentStatus = (sessionData?.pack_status_json as Record<string, string>) || {};
    currentStatus[String(bloc_number)] = "done";
    const packsCompleted = Object.values(currentStatus).filter((v) => v === "done").length;

    await supabase.from("cart_sessions").update({
      pack_status_json: currentStatus, packs_completed: packsCompleted,
    }).eq("id", session_id);

    return new Response(JSON.stringify({
      success: true, resume: analysis.resume, score_maturite: analysis.score_maturite,
      alertes: analysis.alertes || [], objets: insertResults, objets_count: objetsCount,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("cart-pack-analyze error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
