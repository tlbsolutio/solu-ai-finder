import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

let corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "https://solutio.work",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

async function callClaude(prompt: string, maxTokens = 12000): Promise<string | null> {
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
        max_tokens: maxTokens,
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

async function generate(prompt: string, geminiApiKey: string, maxTokens = 12000): Promise<string> {
  const claudeResult = await callClaude(prompt, maxTokens);
  if (claudeResult) return claudeResult;
  console.log("Claude fallback to Gemini");
  const geminiResult = await callGeminiFallback(prompt, geminiApiKey);
  return geminiResult || "Analyse non disponible";
}

serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  const ALLOWED_ORIGINS = ["https://solutio.work", "https://www.solutio.work", "http://localhost:5173", "http://localhost:8080"];
  if (origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o))) corsHeaders["Access-Control-Allow-Origin"] = origin;
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

  const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

  try {
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing sessionId");

    const { data: session, error: sessionError } = await supabase
      .from("cart_sessions").select("id, owner_id, nom, sector_id, ai_extracted_entities, entities_extraction_status, last_generation_at").eq("id", sessionId).single();
    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (session.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Subscription check
    const { data: sub } = await supabase
      .from("cart_subscriptions")
      .select("id, status")
      .eq("session_id", sessionId)
      .eq("status", "active")
      .maybeSingle();

    const isAdmin = user.email === "tlb@solutio.work";

    if (!sub && !isAdmin) {
      return new Response(JSON.stringify({ error: "Subscription required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Rate limit: 1 generation per 3 minutes per session
    if (session.last_generation_at) {
      const elapsed = (Date.now() - new Date(session.last_generation_at).getTime()) / 1000;
      if (elapsed < 180) {
        return new Response(JSON.stringify({ error: `Veuillez patienter ${Math.ceil(180 - elapsed)}s avant de relancer l'analyse` }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Mark generation timestamp
    await supabase.from("cart_sessions").update({ last_generation_at: new Date().toISOString() }).eq("id", sessionId);

    const settled = await Promise.allSettled([
      supabase.from("cart_reponses").select("*, question:cart_questions(texte, section, type_reponse)").eq("session_id", sessionId).order("bloc"),
      supabase.from("cart_pack_resumes").select("*").eq("session_id", sessionId).order("bloc"),
      supabase.from("cart_processus").select("*").eq("session_id", sessionId),
      supabase.from("cart_outils").select("*").eq("session_id", sessionId),
      supabase.from("cart_equipes").select("*").eq("session_id", sessionId),
      supabase.from("cart_irritants").select("*").eq("session_id", sessionId),
      supabase.from("cart_taches").select("*").eq("session_id", sessionId),
      supabase.from("cart_quickwins").select("*").eq("session_id", sessionId),
    ]);
    const getSettled = (idx: number) => {
      const r = settled[idx];
      return r.status === "fulfilled" ? (r.value.data || []) : [];
    };
    const reponsesRes = { data: getSettled(0) };
    const packResumesRes = { data: getSettled(1) };
    const processusRes = { data: getSettled(2) };
    const outilsRes = { data: getSettled(3) };
    const equipesRes = { data: getSettled(4) };
    const irritantsRes = { data: getSettled(5) };
    const tachesRes = { data: getSettled(6) };
    const quickwinsRes = { data: getSettled(7) };

    const sectorInfo = session.sector_id ? `Secteur : ${session.sector_id}. ` : "";

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // USE VALIDATED ENTITIES (from cart-extract-entities + user validation)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const validatedEntities = session.ai_extracted_entities;
    const hasValidatedEntities = validatedEntities && session.entities_extraction_status === "validated";

    if (hasValidatedEntities) {
      console.log(`✅ Using validated entities: ${validatedEntities.equipes?.length || 0} equipes, ${validatedEntities.processus?.length || 0} processus, ${validatedEntities.outils?.length || 0} outils`);

      // Sync validated entities to cart_* tables (replace AI-generated ones)
      try {
        // EQUIPES
        await supabase.from("cart_equipes").delete().eq("session_id", sessionId).eq("ai_generated", true);
        if (validatedEntities.equipes?.length > 0) {
          const rows = validatedEntities.equipes.map((e: any) => ({
            session_id: sessionId, nom: e.nom, mission: e.description || null,
            ai_generated: true, validated: true,
          }));
          await supabase.from("cart_equipes").insert(rows);
        }

        // PROCESSUS
        await supabase.from("cart_processus").delete().eq("session_id", sessionId).eq("ai_generated", true);
        if (validatedEntities.processus?.length > 0) {
          const rows = validatedEntities.processus.map((p: any) => ({
            session_id: sessionId, nom: p.nom, description: p.description || null,
            type: "Autre", niveau_criticite: "Medium",
            ai_generated: true, validated: true,
          }));
          await supabase.from("cart_processus").insert(rows);
        }

        // OUTILS
        await supabase.from("cart_outils").delete().eq("session_id", sessionId).eq("ai_generated", true);
        if (validatedEntities.outils?.length > 0) {
          const rows = validatedEntities.outils.map((o: any) => ({
            session_id: sessionId, nom: o.nom, type_outil: o.categorie || "Autre",
            problemes: o.description || null,
            ai_generated: true, validated: true,
          }));
          await supabase.from("cart_outils").insert(rows);
        }
      } catch (syncErr: any) {
        console.error("⚠️ Entity sync to tables failed (continuing):", syncErr.message);
      }
    } else {
      console.log("⚠️ No validated entities found, using existing DB entities as-is");
    }

    // Re-fetch entity data for the analysis prompt
    const [finalEquipesRes, finalProcessusRes, finalOutilsRes] = await Promise.all([
      supabase.from("cart_equipes").select("*").eq("session_id", sessionId),
      supabase.from("cart_processus").select("*").eq("session_id", sessionId),
      supabase.from("cart_outils").select("*").eq("session_id", sessionId),
    ]);

    const context = {
      session_name: session.nom,
      sector: session.sector_id || "non detecte",
      pack_summaries: (packResumesRes.data || []).map((pr: any) => ({
        bloc: pr.bloc, resume: pr.resume, score_maturite: pr.score_maturite, alertes: pr.alertes,
      })),
      reponses_count: (reponsesRes.data || []).filter((r: any) => r.reponse_brute?.trim()).length,
      processus: (finalProcessusRes.data || []).map((p: any) => ({ nom: p.nom, type: p.type, criticite: p.niveau_criticite, description: p.description })),
      outils: (finalOutilsRes.data || []).map((o: any) => ({ nom: o.nom, type: o.type_outil, problemes: o.problemes })),
      equipes: (finalEquipesRes.data || []).map((e: any) => ({ nom: e.nom, mission: e.mission, charge: e.charge_estimee })),
      irritants: (irritantsRes.data || []).map((i: any) => ({ intitule: i.intitule, type: i.type, gravite: i.gravite, impact: i.impact })),
      taches_manuelles: (tachesRes.data || []).map((t: any) => ({ nom: t.nom, frequence: t.frequence, double_saisie: t.double_saisie })),
      quickwins: (quickwinsRes.data || []).map((q: any) => ({ intitule: q.intitule, categorie: q.categorie, impact: q.impact, effort: q.effort, bloc: q.bloc_source })),
    };

    // Key responses for verbatim citations
    const keyReponses = (reponsesRes.data || [])
      .filter((r: any) => r.reponse_brute?.trim())
      .map((r: any) => ({
        bloc: r.bloc,
        question: r.question?.texte || r.code_question || "",
        reponse: r.reponse_brute,
      }));

    // Build compact summaries - only pack resumes (not full Q&A)
    const packSummaryText = context.pack_summaries.map((ps: any) =>
      `Pack ${ps.bloc} (${ps.score_maturite}/5): ${ps.resume?.substring(0, 200) || "N/A"}`
    ).join("\n");

    const topIrritants = context.irritants.slice(0, 8).map((i: any) => `${i.intitule} (${i.type}, gravite ${i.gravite}/5)`).join("; ");
    const topQuickwins = context.quickwins.slice(0, 8).map((q: any) => `${q.intitule} [${q.impact}/${q.effort}]`).join("; ");

    // Only include 10 key responses for verbatim
    const sampleReponses = keyReponses.slice(0, 10).map((r: any) =>
      `[Pack ${r.bloc}] "${r.reponse?.substring(0, 120)}"`
    ).join("\n");

    const prompt = `Tu es un consultant senior en strategie et transformation digitale pour les PME francaises. Tu rediges comme un associe de cabinet de conseil : ton, precision, impact. ${sectorInfo}

SESSION "${session.nom}" — ${context.reponses_count} reponses analysees

SCORES PAR PACK :
${packSummaryText}

OBJETS DETECTES : ${context.processus.length} processus, ${context.outils.length} outils, ${context.equipes.length} equipes, ${context.irritants.length} irritants, ${context.taches_manuelles.length} taches manuelles
Irritants cles : ${topIrritants || "Aucun"}
Quick wins identifies : ${topQuickwins || "Aucun"}
Outils en place : ${context.outils.map((o: any) => o.nom).join(", ") || "Aucun"}
Equipes : ${context.equipes.map((e: any) => e.nom).join(", ") || "Aucune"}

VERBATIMS TERRAIN :
${sampleReponses}

Produis ce JSON (sans markdown, valeurs = texte concis et percutant) :
{
  "ai_resume_executif": "Resume executif de 10-15 lignes ecrit comme un brief strategique de consultant. Structure : (1) Constat general en 2 phrases percutantes, (2) Score moyen et axes les plus faibles avec chiffres, (3) Les 3 problemes structurels majeurs identifies avec leur impact business, (4) Le potentiel de transformation avec une estimation de gains, (5) Call-to-action : la premiere decision a prendre maintenant. Citer 2-3 verbatims terrain entre guillemets pour ancrer le diagnostic dans la realite.",
  "ai_forces": "5 forces avec preuves. Format: • Force — Preuve (Pack X). Pour chaque force, indiquer comment la capitaliser pour accelerer la transformation.",
  "ai_dysfonctionnements": "8 dysfonctionnements. Format: • Probleme — Impact estime (EUR/an ou heures/mois) — Pack — Cause racine. Classer par impact decroissant.",
  "ai_analyse_transversale": "3 chaines causales inter-packs (Probleme Pack X → Impact Pack Y → Consequence business chiffree). 2 noeuds critiques (les problemes qui en causent le plus d'autres). Score maturite global pondere. Identifier le 'maillon faible' de l'organisation.",
  "ai_plan_optimisation": "Plan structure en objectifs SMART :\n• P1 QUICK WINS (<3 mois) : 3 actions avec pour chacune : Objectif mesurable — Responsable suggere — KPI de succes — Gain attendu\n• P2 CHANTIERS (3-9 mois) : 3 projets avec : Objectif SMART — Ressources necessaires — Jalons intermediaires — ROI attendu\n• P3 TRANSFORMATIONS (9-18 mois) : 2 initiatives structurelles avec : Vision cible — Investissement estime — Impact strategique",
  "ai_vision_cible": "Vision cible detaillee avec milestones concrets :\n• M+3 : Quick wins deployes — KPIs atteints — Gains cumules\n• M+6 : Chantiers P2 lances — Premiers resultats mesurables — Nouveaux processus en place\n• M+12 : Transformation visible — Metriques avant/apres — Culture organisationnelle evoluee\n• M+18 : Organisation optimisee — Avantage concurrentiel acquis — Prochaines etapes. Chaque milestone doit avoir un indicateur chiffre verifiable.",
  "ai_cout_inaction_annuel": "Estimation du cout annuel de ne rien changer, decompose en : (1) Heures perdues en taches manuelles/doublons x cout horaire moyen, (2) Manque a gagner commercial (leads perdus, conversion faible), (3) Risques RH (turnover, desengagement), (4) Cout d'opportunite (retard vs concurrence). Donner une fourchette totale estimee en EUR/an.",
  "ai_kpis_de_suivi": "6-8 KPIs concrets pour piloter la transformation. Format: • Nom du KPI — Valeur actuelle estimee — Objectif a 6 mois — Objectif a 12 mois — Methode de mesure. Couvrir : efficacite operationnelle, satisfaction client, performance commerciale, engagement RH."
}
IMPORTANT: Reponds UNIQUEMENT avec le JSON valide, pas de markdown.`;

    const rawContent = await generate(prompt, geminiApiKey);

    // Robust JSON extraction
    let jsonStr = rawContent;
    // Try greedy match first (handles incomplete closing ```)
    const jsonMatch = rawContent.match(/```(?:json)?\s*\n?([\s\S]*?)(?:\n?\s*```|$)/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
      jsonStr = rawContent.trim();
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Try to find the outermost JSON object
      const objMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try { parsed = JSON.parse(objMatch[0]); } catch {}
      }
      // If still failing, try to repair truncated JSON by closing open strings/objects
      if (!parsed) {
        try {
          let repaired = jsonStr;
          // Remove trailing incomplete string values
          repaired = repaired.replace(/,\s*"[^"]*":\s*"[^"]*$/, "");
          // Close any open strings and objects
          const openBraces = (repaired.match(/{/g) || []).length;
          const closeBraces = (repaired.match(/}/g) || []).length;
          if (openBraces > closeBraces) {
            // Ensure last value is closed
            if (!repaired.trimEnd().endsWith('"') && !repaired.trimEnd().endsWith('}')) {
              repaired += '"';
            }
            repaired += "}".repeat(openBraces - closeBraces);
          }
          parsed = JSON.parse(repaired);
        } catch {}
      }
      if (!parsed) {
        // Last resort: extract whatever fields we can find
        console.error("Failed to parse JSON, extracting fields manually");
        parsed = {};
        const fields = ["ai_resume_executif", "ai_forces", "ai_dysfonctionnements", "ai_analyse_transversale", "ai_plan_optimisation", "ai_vision_cible", "ai_cout_inaction_annuel", "ai_kpis_de_suivi"];
        for (const field of fields) {
          const fieldMatch = jsonStr.match(new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
          if (fieldMatch) {
            parsed[field] = fieldMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
          }
        }
        if (Object.keys(parsed).length === 0) {
          throw new Error("Failed to parse AI response as JSON: " + rawContent.substring(0, 300));
        }
      }
    }

    const toText = (val: unknown): string => {
      if (!val) return "";
      if (Array.isArray(val)) return val.map(item => typeof item === "string" ? item : JSON.stringify(item)).join("\n");
      if (typeof val === "object") {
        return Object.entries(val as Record<string, unknown>).map(([k, v]) => `**${k}**\n${Array.isArray(v) ? v.join("\n") : String(v)}`).join("\n\n");
      }
      return String(val);
    };

    const updatePayload: Record<string, unknown> = {
      ai_resume_executif: toText(parsed.ai_resume_executif),
      ai_forces: toText(parsed.ai_forces),
      ai_dysfonctionnements: toText(parsed.ai_dysfonctionnements),
      ai_analyse_transversale: toText(parsed.ai_analyse_transversale),
      ai_plan_optimisation: toText(parsed.ai_plan_optimisation),
      ai_vision_cible: toText(parsed.ai_vision_cible),
      analyse_status: "generee",
      final_generation_done: true,
    };
    // Add new optional fields if present (backward compatible — columns may not exist yet)
    if (parsed.ai_cout_inaction_annuel) updatePayload.ai_cout_inaction_annuel = toText(parsed.ai_cout_inaction_annuel);
    if (parsed.ai_kpis_de_suivi) updatePayload.ai_kpis_de_suivi = toText(parsed.ai_kpis_de_suivi);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 2: Generate cartography JSON (nodes/edges for interactive map)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log("Step 2: Generating cartography JSON...");
    try {
      const { data: tachesData } = await supabase.from("cart_taches").select("*").eq("session_id", sessionId);
      const taches = tachesData || [];

      const topEquipes = context.equipes.slice(0, 8);
      const topProcessus = context.processus.slice(0, 12);
      const topOutils = context.outils.slice(0, 6);
      const topIrritants = context.irritants.sort((a: any, b: any) => (b.gravite || 0) - (a.gravite || 0)).slice(0, 8);

      const cartoPrompt = `Donnees de la cartographie organisationnelle:
Equipes: ${topEquipes.map((e: any, i: number) => `${e.nom}(eq-${i + 1})`).join(", ")}
Processus: ${topProcessus.map((p: any, i: number) => `${p.nom}(pr-${i + 1})`).join(", ")}
Outils: ${topOutils.map((o: any, i: number) => `${o.nom}(ou-${i + 1})`).join(", ")}
Irritants: ${topIrritants.map((ir: any, i: number) => `${ir.intitule}(ir-${i + 1},g=${ir.gravite})`).join(", ")}

REGLES :
1. Genere 20-30 noeuds et 25-40 edges. Utilise les IDs fournis.
2. Types noeud: equipe, processus, outil, irritant
3. Types edge: feeds_into (equipe->processus), uses (processus->outil), blocks (irritant->processus, animated:true), causes (irritant->irritant), supports (outil->equipe). Chaque edge a un label explicatif.
4. Chaque noeud a min 1 edge. Description riche 15-25 mots. Priorite 1-5.
5. Clusters : regrouper par domaine fonctionnel.

Reponds UNIQUEMENT avec du JSON valide, sans markdown :
{"nodes":[{"id":"str","type":"equipe|processus|outil|irritant","label":"str","maturityScore":3,"gravite":0,"description":"str","priorite":3}],"edges":[{"id":"e1","source":"id","target":"id","type":"str","label":"str","animated":false}],"clusters":[{"id":"cluster-1","label":"str","nodeIds":["id1"],"description":"str"}]}`;

      const cartoResult = await generate(cartoPrompt, geminiApiKey, 8000);
      let cartoJson: any = null;

      // Robust JSON extraction for cartography
      try { cartoJson = JSON.parse(cartoResult); } catch {}
      if (!cartoJson) {
        const mdMatch = cartoResult.match(/```(?:json)?\s*\n?([\s\S]*?)(?:\n?\s*```|$)/);
        if (mdMatch) { try { cartoJson = JSON.parse(mdMatch[1].trim()); } catch {} }
      }
      if (!cartoJson) {
        const objMatch = cartoResult.match(/\{[\s\S]*\}/);
        if (objMatch) { try { cartoJson = JSON.parse(objMatch[0]); } catch {} }
      }
      if (!cartoJson) {
        // Repair truncated JSON
        let s = (cartoResult.match(/\{[\s\S]*/) || [cartoResult])[0].trim();
        s = s.replace(/,\s*([}\]])/g, '$1');
        let ob = 0, oB = 0;
        for (const ch of s) { if (ch === '{') ob++; else if (ch === '}') ob--; else if (ch === '[') oB++; else if (ch === ']') oB--; }
        while (oB > 0) { s += ']'; oB--; }
        while (ob > 0) { s += '}'; ob--; }
        try { cartoJson = JSON.parse(s); } catch {}
      }

      if (cartoJson && cartoJson.nodes) {
        updatePayload.ai_cartography_json = cartoJson;
        console.log(`Cartography: ${cartoJson.nodes?.length || 0} nodes, ${cartoJson.edges?.length || 0} edges`);
      } else {
        console.warn("Failed to generate cartography JSON");
      }
    } catch (cartoErr: any) {
      console.error("Cartography generation failed (continuing):", cartoErr.message);
    }

    await supabase.from("cart_sessions").update(updatePayload).eq("id", sessionId);

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("cart-generate-analysis error:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
