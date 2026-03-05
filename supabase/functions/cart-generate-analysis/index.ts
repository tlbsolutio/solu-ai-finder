import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "http://76.13.50.143:11434/api/generate";
const OLLAMA_TIMEOUT = 180000; // 3 min
const MODEL = "qwen3:8b"; // Best general reasoning model available

async function callOllama(prompt: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT);

    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt, stream: false }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) {
      console.error(`Ollama error: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.response || null;
  } catch (e) {
    console.error("Ollama failed:", e);
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
  const ollamaResult = await callOllama(prompt);
  if (ollamaResult) return ollamaResult;
  console.log("Ollama fallback to Gemini");
  const geminiResult = await callGeminiFallback(prompt, geminiApiKey);
  return geminiResult || "Analyse non disponible";
}

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

  const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

  try {
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing sessionId");

    const { data: session, error: sessionError } = await supabase
      .from("cart_sessions").select("id, owner_id, nom, sector_id").eq("id", sessionId).single();
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

    const sectorInfo = session.sector_id ? `Secteur : ${session.sector_id}. ` : "";

    const context = {
      session_name: session.nom,
      sector: session.sector_id || "non detecte",
      pack_summaries: (packResumesRes.data || []).map((pr: any) => ({
        bloc: pr.bloc, resume: pr.resume, score_maturite: pr.score_maturite, alertes: pr.alertes,
      })),
      reponses_count: (reponsesRes.data || []).filter((r: any) => r.reponse_brute?.trim()).length,
      processus: (processusRes.data || []).map((p: any) => ({ nom: p.nom, type: p.type, criticite: p.niveau_criticite, description: p.description })),
      outils: (outilsRes.data || []).map((o: any) => ({ nom: o.nom, type: o.type_outil, problemes: o.problemes })),
      equipes: (equipesRes.data || []).map((e: any) => ({ nom: e.nom, mission: e.mission, charge: e.charge_estimee })),
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

    const prompt = `Tu es un consultant senior expert en transformation d'entreprise et optimisation des processus pour les PME francaises.
${sectorInfo}Tu analyses les donnees completes d'une cartographie d'entreprise et produis un rapport professionnel, structure et actionnable.

━━━ REGLES CRITIQUES ━━━
1. CITATIONS VERBATIM : Cite les reponses exactes entre guillemets pour appuyer CHAQUE constat.
2. QUANTIFICATION : Estime l'impact financier de chaque dysfonctionnement (fourchettes basses/hautes avec hypotheses).
   - Temps perdu = (nb employes) × (h/semaine) × 46 semaines × (35-55 EUR/h)
   - Cout turnover = (nb departs) × (6-9 mois de salaire)
   - Manque a gagner = (opportunites perdues) × (panier moyen) × (taux conversion manque)
3. LIENS CAUSAUX EXPLICITES : Chaque lien doit suivre le format : "[Probleme A — Pack X, score Y/5] → CAUSE/AMPLIFIE → [Probleme B — Pack Z] → CONSEQUENCE FINALE chiffree"
4. PRIORISATION STRICTE : P1 (impact eleve + effort faible, min 3 actions), P2 (impact eleve + effort moyen, min 5 actions), P3 (max 3 actions).
5. RECOMMANDATIONS OUTILS : Avant de recommander un remplacement, verifier si le probleme est l'usage (→ formation) ou l'integration (→ API/connecteur).

DONNEES DE LA SESSION "${session.nom}" :

RESUMES PAR PACK :
${JSON.stringify(context.pack_summaries, null, 2)}

OBJETS DETECTES :
- ${context.processus.length} processus : ${context.processus.map((p: any) => `${p.nom} [${p.type}]`).join(", ") || "Aucun"}
- ${context.outils.length} outils : ${context.outils.map((o: any) => `${o.nom} [${o.type}]`).join(", ") || "Aucun"}
- ${context.equipes.length} equipes : ${context.equipes.map((e: any) => `${e.nom} (${e.mission})`).join(", ") || "Aucune"}
- ${context.irritants.length} irritants : ${context.irritants.map((i: any) => `${i.intitule} (gravite ${i.gravite}/5, impact: ${i.impact})`).join(", ") || "Aucun"}
- ${context.taches_manuelles.length} taches manuelles : ${context.taches_manuelles.map((t: any) => `${t.nom} (${t.frequence}${t.double_saisie ? ", double saisie" : ""})`).join(", ") || "Aucune"}
- ${context.quickwins.length} quick wins identifies

ECHANTILLON DE REPONSES CLES (pour citations verbatim) :
${keyReponses.slice(0, 40).map((r: any) => `[Pack ${r.bloc}] Q: ${r.question}\nR: "${r.reponse}"`).join("\n\n")}

Produis ce JSON EXACT (sans markdown, sans commentaires) :
{
  "ai_resume_executif": "Resume executif en 10-15 lignes. Vision globale. Cite 3-5 verbatims cles entre guillemets. Mentionne le score de maturite global et les 2 axes les plus critiques.",
  "ai_forces": "5-10 points forts identifies avec preuves VERBATIM issues des reponses. Format : '• [Force] — Preuve : \"[citation exacte]\" (Pack X)'",
  "ai_dysfonctionnements": "10-15 dysfonctionnements. Format STRICT pour chacun :\n'• [Dysfonctionnement] — Impact estime: [fourchette EUR/an avec hypotheses] — Pack source: [n, score X/5] — Causes probables: [liste] — Verbatim: \"[citation]\"'",
  "ai_analyse_transversale": "4 parties OBLIGATOIRES :\n\n1) LIENS CAUSAUX INTER-PACKS (minimum 5 liens) :\nFormat : \"[Probleme A — Pack X, score Y/5] → CAUSE → [Probleme B — Pack Z, score W/5] → CONSEQUENCE FINALE chiffree\"\nExemple : \"L'absence d'outil de gestion de projet (Pack 6, 2/5) oblige l'equipe admin a coordonner manuellement (~15h/sem), contribuant a la surcharge RH (Pack 4, 2/5) et au turnover de 12%\"\n\n2) NOEUDS CRITIQUES (2 problemes qui causent le plus d'autres) :\nPour chacun, lister tous les packs impactes et l'effet domino.\n\n3) CONTRADICTIONS detectees entre packs :\nSi Pack A dit X et Pack B contredit, expliquer ce que ca revele.\n\n4) SCORE DE MATURITE GLOBAL :\nMoyenne ponderee explicite (ex: Strategie ×1.5, Operations ×1.3, RH ×1.2, autres ×1.0)",
  "ai_plan_optimisation": "Plan priorise STRICT :\n\nP1 — Quick Wins (3-5 actions, < 3 mois, actionnable en 48h) :\nFormat : \"[Action concrete] — Impact: [EUR/an] — Effort: [jours-homme] — Outil: [nom + prix] — KPI: [indicateur mesurable]\"\n\nP2 — Chantiers structurants (3-5 actions, 3-9 mois) :\nMeme format\n\nP3 — Transformations (2-3 actions, 9-18 mois) :\nMeme format\n\nREGLE RECOMMANDATIONS OUTILS :\n- Outil mal utilise → 'Formation — [Outil] — [Fonctionnalite a activer]'\n- Outil non connecte → 'Integration — [Outil A + B] — Connecter via [API/Zapier/Make]'\n- Outil inadapte → 'Remplacement — [Actuel] → [Nouveau] — [Justification]'",
  "ai_vision_cible": "Vision cible 18 mois en 4 milestones QUANTIFIES :\nM+3: [milestone + KPI cible + gain estime]\nM+6: [milestone + KPI cible + gain cumule]\nM+12: [milestone + KPI cible + gain cumule]\nM+18: [milestone + KPI cible + gain total]\n\nGains totaux attendus : [fourchette EUR/an] + [heures/mois recuperees]"
}`;

    const rawContent = await generate(prompt, geminiApiKey);

    // Robust JSON extraction
    let jsonStr = rawContent;
    const jsonMatch = rawContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
      jsonStr = rawContent.trim();
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Try to find JSON in text
      const objMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try { parsed = JSON.parse(objMatch[0]); } catch {}
      }
      if (!parsed) {
        throw new Error("Failed to parse AI response as JSON: " + rawContent.substring(0, 300));
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
    console.error("cart-generate-analysis error:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
