import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

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
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
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

    const prompt = `Consultant expert en transformation PME francaises. ${sectorInfo}Analyse cette cartographie et produis un rapport JSON.

SESSION "${session.nom}" — ${context.reponses_count} reponses

SCORES PAR PACK :
${packSummaryText}

OBJETS : ${context.processus.length} processus, ${context.outils.length} outils, ${context.equipes.length} equipes, ${context.irritants.length} irritants, ${context.taches_manuelles.length} taches manuelles
Irritants cles : ${topIrritants || "Aucun"}
Quick wins : ${topQuickwins || "Aucun"}
Outils : ${context.outils.map((o: any) => o.nom).join(", ") || "Aucun"}
Equipes : ${context.equipes.map((e: any) => e.nom).join(", ") || "Aucune"}

VERBATIMS :
${sampleReponses}

Produis ce JSON (sans markdown, valeurs = texte concis) :
{
  "ai_resume_executif": "Resume 8-10 lignes, scores, axes critiques, verbatims cles",
  "ai_forces": "5 forces avec preuves. Format: • Force — Preuve (Pack X)",
  "ai_dysfonctionnements": "8 dysfonctionnements. Format: • Probleme — Impact EUR — Pack — Cause",
  "ai_analyse_transversale": "3 liens causaux inter-packs + 2 noeuds critiques + score global pondere",
  "ai_plan_optimisation": "P1: 3 quick wins (<3 mois). P2: 3 chantiers (3-9 mois). P3: 2 transformations. Format: Action — Impact — Effort — Outil — KPI",
  "ai_vision_cible": "4 milestones M+3/M+6/M+12/M+18 avec KPIs et gains cumules"
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
        const fields = ["ai_resume_executif", "ai_forces", "ai_dysfonctionnements", "ai_analyse_transversale", "ai_plan_optimisation", "ai_vision_cible"];
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
