import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

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

async function callClaude(prompt: string, maxTokens = 4096, systemPrompt?: string): Promise<string | null> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return null;
  try {
    const body: Record<string, unknown> = {
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    };
    if (systemPrompt) body.system = systemPrompt;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
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

async function generate(prompt: string, geminiApiKey: string, maxTokens = 4096, systemPrompt?: string): Promise<string> {
  const claudeResult = await callClaude(prompt, maxTokens, systemPrompt);
  if (claudeResult) return claudeResult;
  console.log("Claude fallback to Gemini");
  const geminiResult = await callGeminiFallback(prompt, geminiApiKey);
  return geminiResult || "Analyse non disponible";
}

function repairJson(text: string): unknown | null {
  if (!text) return null;
  let s = text.trim();

  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, '$1');

  // Count open/close braces and brackets
  let openBraces = 0, openBrackets = 0;
  for (const ch of s) {
    if (ch === '{') openBraces++;
    else if (ch === '}') openBraces--;
    else if (ch === '[') openBrackets++;
    else if (ch === ']') openBrackets--;
  }

  // Close unclosed brackets then braces
  while (openBrackets > 0) { s += ']'; openBrackets--; }
  while (openBraces > 0) { s += '}'; openBraces--; }

  // Try to parse repaired
  try { return JSON.parse(s); } catch {}

  // Try truncating to last valid entry
  const lastBrace = s.lastIndexOf('}');
  if (lastBrace > 0) {
    let truncated = s.substring(0, lastBrace + 1);
    let ob = 0, oB = 0;
    for (const ch of truncated) {
      if (ch === '{') ob++;
      else if (ch === '}') ob--;
      else if (ch === '[') oB++;
      else if (ch === ']') oB--;
    }
    while (oB > 0) { truncated += ']'; oB--; }
    while (ob > 0) { truncated += '}'; ob--; }
    try { return JSON.parse(truncated); } catch {}
  }

  return null;
}

function extractJson(raw: string): unknown | null {
  if (!raw) return null;

  // 1. Try direct parse
  try { return JSON.parse(raw); } catch {}

  // 2. Try extracting from markdown code block
  const mdMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)(?:\n?\s*```)/);
  if (mdMatch) {
    try { return JSON.parse(mdMatch[1].trim()); } catch {}
    // Try repairing truncated JSON from code block
    const repaired = repairJson(mdMatch[1].trim());
    if (repaired) return repaired;
  }

  // 3. Try extracting largest JSON object
  const objMatch = raw.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch {}
    const repaired = repairJson(objMatch[0]);
    if (repaired) return repaired;
  }

  // 4. Try extracting from open markdown block (no closing ```)
  const mdOpenMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)$/);
  if (mdOpenMatch) {
    const repaired = repairJson(mdOpenMatch[1].trim());
    if (repaired) return repaired;
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

  try {
    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId requis");

    // Load all session data
    const [sessionRes, resumesRes, processusRes, outilsRes, equipesRes, irritantsRes, quickwinsRes] = await Promise.all([
      supabase.from("cart_sessions").select("*").eq("id", sessionId).single(),
      supabase.from("cart_pack_resumes").select("*").eq("session_id", sessionId).order("bloc"),
      supabase.from("cart_processus").select("*").eq("session_id", sessionId),
      supabase.from("cart_outils").select("*").eq("session_id", sessionId),
      supabase.from("cart_equipes").select("*").eq("session_id", sessionId),
      supabase.from("cart_irritants").select("*").eq("session_id", sessionId),
      supabase.from("cart_quickwins").select("*").eq("session_id", sessionId),
    ]);

    if (sessionRes.error) throw sessionRes.error;
    const session = sessionRes.data;
    const packResumes = resumesRes.data || [];
    const processus = processusRes.data || [];
    const outils = outilsRes.data || [];
    const equipes = equipesRes.data || [];
    const irritants = irritantsRes.data || [];
    const quickwins = quickwinsRes.data || [];

    const sectorInfo = session.sector_id ? `Secteur: ${session.sector_id}. ` : "";

    // Compact pack summaries from already-analyzed pack resumes
    const packSummaryText = packResumes.map((pr: any) =>
      `Pack ${pr.bloc} ${BLOC_NAMES[pr.bloc] || ""} (${pr.score_maturite}/5): ${(pr.resume || "").substring(0, 150)}`
    ).join("\n");

    const objectsCompact = `Processus: ${processus.map((p: any) => p.nom).join(", ") || "Aucun"}
Outils: ${outils.map((o: any) => o.nom).join(", ") || "Aucun"}
Equipes: ${equipes.map((e: any) => e.nom).join(", ") || "Aucune"}
Irritants: ${irritants.slice(0, 10).map((i: any) => `${i.intitule} (${i.gravite}/5)`).join(", ") || "Aucun"}`;

    // ========== STEP 1: Cross-pack causal analysis ==========
    console.log("Step 1: Cross-pack causal analysis");
    const step1Prompt = `Consultant senior transformation PME. ${sectorInfo}Analyse transversale de cette cartographie.

${packSummaryText}

${objectsCompact}

Produis une analyse causale inter-packs concise :
1. 3 chaines causales (Probleme Pack X → Impact Pack Y → Consequence chiffree)
2. 2 noeuds critiques (problemes qui en causent le plus d'autres)
3. Score maturite global pondere
4. Plan d'actions: P1 (3 quick wins <3 mois), P2 (3 chantiers 3-9 mois), P3 (2 transformations)
5. Vision cible: M+3, M+6, M+12, M+18

Reponds en texte structure, pas de JSON.`;

    const analysisResult = await generate(step1Prompt, geminiApiKey);

    // ========== STEP 2: Generate cartography JSON ==========
    console.log("Step 2: Cartography JSON");

    const { data: tachesData } = await supabase.from("cart_taches").select("*").eq("session_id", sessionId);
    const taches = tachesData || [];

    // Select top items to keep prompt compact and JSON small
    const topEquipes = equipes.slice(0, 8);
    const topProcessus = processus.slice(0, 12);
    const topOutils = outils.slice(0, 6);
    const topIrritants = irritants.sort((a: any, b: any) => (b.gravite || 0) - (a.gravite || 0)).slice(0, 8);

    const step2Prompt = `Donnees:
Equipes: ${topEquipes.map((e: any) => `${e.nom}(eq-${e.id})`).join(", ")}
Processus: ${topProcessus.map((p: any) => `${p.nom}(pr-${p.id})`).join(", ")}
Outils: ${topOutils.map((o: any) => `${o.nom}(ou-${o.id})`).join(", ")}
Irritants: ${topIrritants.map((i: any) => `${i.intitule}(ir-${i.id},g=${i.gravite})`).join(", ")}

Genere exactement 20-30 noeuds et 25-40 edges. Utilise les IDs fournis (eq-X, pr-X, ou-X, ir-X).
Types noeud: equipe, processus, outil, irritant
Types edge: feeds_into (equipe→processus), uses (processus→outil), blocks (irritant→processus, animated:true), causes (irritant→irritant)
Chaque noeud a min 1 edge. Description courte (max 10 mots).`;

    const step2System = `Tu es un generateur JSON. Reponds UNIQUEMENT avec du JSON valide, sans markdown, sans texte avant/apres.
Format: {"nodes":[{"id":"str","type":"equipe|processus|outil|irritant","label":"str","maturityScore":3,"gravite":0,"description":"str"}],"edges":[{"id":"e1","source":"id","target":"id","type":"str","label":"str","animated":false}]}`;

    const step2Result = await generate(step2Prompt, geminiApiKey, 8000, step2System);
    const cartographyJson = extractJson(step2Result);

    // Save results
    const wrapText = (text: string): unknown => {
      try { return JSON.parse(text); } catch {}
      return { content: text };
    };

    const updateData: Record<string, unknown> = {
      ai_cross_pack_analysis: wrapText(analysisResult),
      ai_impact_quantification: wrapText(analysisResult),
      ai_target_vision: wrapText(analysisResult),
      updated_at: new Date().toISOString(),
    };
    if (cartographyJson) {
      updateData.ai_cartography_json = cartographyJson;
    }

    const { error: updateError } = await supabase
      .from("cart_sessions")
      .update(updateData)
      .eq("id", sessionId);

    if (updateError) throw updateError;

    console.log("Deep analysis complete for session:", sessionId);

    return new Response(
      JSON.stringify({ success: true, steps_completed: 2 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("cart-analyze-ollama error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
