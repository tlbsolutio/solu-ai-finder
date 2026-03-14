import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEFAULT_CORS = {
  "Access-Control-Allow-Origin": "https://solutio.work",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

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

async function callClaude(prompt: string): Promise<string | null> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 12000,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(180000),
    });
    if (!res.ok) {
      console.error(`Claude error: ${res.status} ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    return data.content?.[0]?.text || null;
  } catch (e) {
    console.error("Claude failed:", e);
    return null;
  }
}

async function callGeminiFallback(prompt: string, apiKey: string): Promise<string | null> {
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(120000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

async function generate(prompt: string, geminiApiKey: string): Promise<string> {
  const claudeResult = await callClaude(prompt);
  if (claudeResult) return claudeResult;
  console.log("Claude fallback to Gemini");
  const geminiResult = await callGeminiFallback(prompt, geminiApiKey);
  return geminiResult || "{}";
}

serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  const ALLOWED_ORIGINS = ["https://solutio.work", "https://www.solutio.work", "http://localhost:5173", "http://localhost:8080"];
  const corsHeaders = { ...DEFAULT_CORS };
  if (origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o))) corsHeaders["Access-Control-Allow-Origin"] = origin;
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

  const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

  try {
    const { session_id, bloc_number, reponses } = await req.json();

    if (!session_id || !bloc_number) {
      return new Response(JSON.stringify({ error: "Missing session_id or bloc_number" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from("cart_sessions")
      .select("id, owner_id, nom, sector_id")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (session.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch responses if not passed
    let reponsesToAnalyze = reponses;
    if (!reponsesToAnalyze || reponsesToAnalyze.length === 0) {
      const { data: dbReponses } = await supabase
        .from("cart_reponses")
        .select("*, question:cart_questions(texte, type_reponse, section)")
        .eq("session_id", session_id)
        .eq("bloc", bloc_number);
      reponsesToAnalyze = (dbReponses || []).map((r: any) => ({
        texte_question: r.question?.texte || r.code_question || "Question",
        type_reponse: r.question?.type_reponse || "Texte",
        section: r.question?.section || "",
        reponse_brute: r.reponse_brute || "",
        code_question: r.code_question || "",
      }));
    }

    const blocName = BLOC_NAMES[bloc_number] || `Bloc ${bloc_number}`;
    const reponsesText = (reponsesToAnalyze || [])
      .filter((r: any) => r.reponse_brute && r.reponse_brute.trim())
      .map((r: any) => `Q [${r.type_reponse}]: ${r.texte_question}\nR: ${r.reponse_brute}`)
      .join("\n\n");

    const sectorInfo = session.sector_id ? `\nSecteur de l'entreprise : ${session.sector_id}. Adapte tes analyses au contexte sectoriel.` : "";

    const prompt = `Tu es un consultant senior en transformation organisationnelle pour les PME francaises.
Tu analyses les reponses d'UN SEUL PACK thematique d'un diagnostic d'entreprise.
${sectorInfo}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLE FONDAMENTALE — ISOLATION DES PACKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tu dois analyser UNIQUEMENT les reponses de CE pack (${blocName}, Pack ${bloc_number}/10).
Il est INTERDIT de faire apparaitre un objet (irritant, tache manuelle, quick win) qui ne decoule pas DIRECTEMENT des reponses ci-dessous.

IMPORTANT : NE PAS extraire les entites globales (equipes, processus, outils) dans cette analyse par pack.
L'extraction d'entites est effectuee separement de maniere transversale sur l'ensemble des packs.
Concentre-toi sur : resume, score, alertes, irritants, taches manuelles, et quick wins.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLE — PRIORISATION DES QUICK WINS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Appliquer la matrice Impact/Effort de facon STRICTE et OBLIGATOIRE :

P1 — Must do (priorite absolue)
  Condition : Impact Fort + Effort Faible
  Caracteristiques : resultat visible en moins de 4 semaines, gain operationnel immediat

P2 — Should do (important)
  Condition : Impact Fort + Effort Moyen OU Impact Moyen + Effort Faible
  Caracteristiques : gain significatif, realisable en 1 a 3 mois

P3 — Nice to have (amelioration)
  Condition : Impact Moyen + Effort Moyen ou superieur, ou Impact Faible

OBLIGATION DE DISTRIBUTION :
- Minimum 1 quick win classe P1 (sinon revoir l'evaluation de l'impact)
- Minimum 1 quick win classe P2
- Si tous les quick wins sont P3, c'est une ERREUR. Revoir la classification.

CONTEXTE DU PACK : ${blocName} (Pack ${bloc_number}/10)
Nombre de reponses : ${(reponsesToAnalyze || []).length}

REPONSES DU PACK :
${reponsesText || "Aucune reponse fournie pour ce bloc."}

Produis EXACTEMENT ce JSON (sans commentaires, sans markdown) :
{
  "resume": "Synthese professionnelle en 5-8 lignes basee UNIQUEMENT sur les reponses de ce pack. Cite des verbatims entre guillemets.",
  "score_maturite": 3,
  "niveau_maturite": "Critique|Emergent|En developpement|Mature|Optimise",
  "description_maturite": "Description granulaire du niveau actuel : ce qui fonctionne, ce qui manque, et a quoi ressemblerait un niveau mature/optimise pour cette dimension specifique (${blocName}). 3-4 phrases.",
  "benchmark_secteur": "Si le secteur est connu, comparaison qualitative avec la moyenne du secteur. Sinon, comparaison avec la moyenne des PME francaises.",
  "forces": ["Force 1 — citation verbatim entre guillemets", "Force 2"],
  "faiblesses": ["Faiblesse 1 — citation verbatim entre guillemets", "Faiblesse 2"],
  "signaux_faibles": ["Signal faible ou contradiction detecte dans les reponses"],
  "alertes": [
    { "titre": "...", "description": "...", "gravite": "critique|important|modere" }
  ],
  "irritants_detectes": [
    { "intitule": "Irritant SPECIFIQUE a ce pack", "type": "Processus|Outil|RH|Organisation|Communication", "gravite": 3, "impact": "Temps|Qualite|Cout|Satisfaction" }
  ],
  "taches_manuelles_detectees": [
    { "nom_tache": "Tache manuelle SPECIFIQUE mentionnee dans les reponses", "frequence": "Quotidien|Hebdomadaire|Mensuel", "double_saisie": false }
  ],
  "quickwins": [
    { "action": "Action concrete et specifique", "impact": "Fort|Moyen|Faible", "effort": "Faible|Moyen|Eleve", "categorie": "Processus|Outil|RH|Organisation", "priorite": "P1|P2|P3", "delai_mise_en_oeuvre": "1 semaine|2-3 semaines|1 mois|2-3 mois", "roi_attendu": "Description concrete du retour attendu" }
  ],
  "risques_inaction": ["Si rien ne change sur cet axe dans les 6-12 prochains mois : consequence concrete et chiffree"],
  "objectif_90_jours": "Un objectif SMART concret a atteindre en 90 jours sur cette dimension."
}

Score maturite: 1=Critique, 2=Emergent, 3=En developpement, 4=Mature, 5=Optimise.
Genere SEULEMENT les objets clairement detectables dans les reponses de CE pack.
Ne JAMAIS inventer de donnees absentes des reponses.`;

    let rawContent = await generate(prompt, geminiApiKey);

    // Robust JSON extraction
    const jsonMatch = rawContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (jsonMatch) {
      rawContent = jsonMatch[1].trim();
    } else {
      rawContent = rawContent.trim();
    }

    let analysis: any;
    try {
      analysis = JSON.parse(rawContent);
    } catch {
      const objMatch = rawContent.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try { analysis = JSON.parse(objMatch[0]); } catch {}
      }
      if (!analysis) {
        analysis = {
          resume: "Analyse generee partiellement.",
          score_maturite: 3, niveau_maturite: "En developpement",
          forces: [], faiblesses: [], signaux_faibles: [], alertes: [],
          processus_detectes: [], outils_detectes: [], equipes_detectees: [],
          irritants_detectes: [], taches_manuelles_detectees: [], quickwins: [],
        };
      }
    }

    // Post-process: enforce P1/P2/P3 distribution
    if (analysis.quickwins?.length >= 3) {
      const hasP1 = analysis.quickwins.some((q: any) => q.priorite === "P1");
      const hasP2 = analysis.quickwins.some((q: any) => q.priorite === "P2");
      if (!hasP1 || !hasP2) {
        const sorted = [...analysis.quickwins].sort((a: any, b: any) => {
          const impactOrder: Record<string, number> = { "Fort": 0, "Moyen": 1, "Faible": 2 };
          const effortOrder: Record<string, number> = { "Faible": 0, "Moyen": 1, "Eleve": 2 };
          const scoreA = (impactOrder[a.impact] ?? 1) * 3 + (effortOrder[a.effort] ?? 1);
          const scoreB = (impactOrder[b.impact] ?? 1) * 3 + (effortOrder[b.effort] ?? 1);
          return scoreA - scoreB;
        });
        if (sorted.length >= 1) sorted[0].priorite = "P1";
        if (sorted.length >= 2) sorted[1].priorite = "P2";
        analysis.quickwins = sorted;
      }
    }

    // Delete previous AI-generated objects for this pack to avoid duplicates on re-analysis
    await supabase.from("cart_quickwins").delete().eq("session_id", session_id).eq("bloc_source", bloc_number).eq("ai_generated", true);
    // Irritants/taches don't have bloc_source column — delete unvalidated AI-generated ones for this session
    await supabase.from("cart_irritants").delete().eq("session_id", session_id).eq("ai_generated", true).eq("validated", false);
    await supabase.from("cart_taches").delete().eq("session_id", session_id).eq("ai_generated", true);

    // Insert detected objects (irritants, taches, quickwins only — entities extracted separately)
    const insertResults: any = { irritants: [], taches: [], quickwins: [] };

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
      const rows = analysis.quickwins.map((q: any) => {
        const priorite = q.priorite || (q.impact === "Fort" && q.effort === "Faible" ? "P1" : q.impact === "Fort" ? "P2" : "P3");
        return {
          session_id, bloc_source: bloc_number, intitule: q.action || "Quick win",
          categorie: q.categorie || "Processus", impact: q.impact || "Moyen", effort: q.effort || "Moyen",
          statut: "a_faire",
          priorite_calculee: priorite === "P1" ? "Top Priority" : priorite === "P2" ? "Important" : "Nice to have",
          ai_generated: true,
        };
      });
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
      niveau_maturite: analysis.niveau_maturite || "En developpement",
      description_maturite: analysis.description_maturite || null,
      benchmark_secteur: analysis.benchmark_secteur || null,
      forces: analysis.forces || [], faiblesses: analysis.faiblesses || [],
      alertes: analysis.alertes || [], objets: insertResults, objets_count: objetsCount,
      risques_inaction: analysis.risques_inaction || [],
      objectif_90_jours: analysis.objectif_90_jours || null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    // Note: entities (equipes, processus, outils) are no longer extracted per-pack.
    // Use cart-extract-entities for cross-pack entity extraction after packs are completed.
  } catch (e: any) {
    console.error("cart-pack-analyze error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
