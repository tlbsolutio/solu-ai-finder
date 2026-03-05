import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OLLAMA_URL = "http://76.13.50.143:11434/api/generate";
const OLLAMA_TIMEOUT = 10000;

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

const SYSTEM_PROMPT = `Tu es un expert en transformation organisationnelle et conseil en management pour les PME francaises.
Tu analyses les reponses d'un diagnostic organisationnel structure en 10 blocs thematiques.

{sector_context}

Ton analyse doit etre :
- Factuelle et basee sur les donnees fournies
- Actionnable avec des recommandations concretes
- Quantifiee quand possible (estimations de cout, temps, impact)
- Adaptee au contexte sectoriel de l'entreprise
- Structuree avec une logique causale (causes racines → effets → solutions)

Reponds toujours en francais.`;

async function callOllama(prompt: string, model: string, format?: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT);

    const body: any = { model, prompt, stream: false };
    if (format) body.format = format;

    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    return data.response || null;
  } catch {
    return null;
  }
}

async function callGeminiFallback(prompt: string, apiKey: string): Promise<string | null> {
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

async function generateWithFallback(prompt: string, model: string, apiKey: string, format?: string): Promise<string> {
  const ollamaResult = await callOllama(prompt, model, format);
  if (ollamaResult) return ollamaResult;

  console.log(`Ollama fallback to Gemini for model ${model}`);
  const geminiResult = await callGeminiFallback(prompt, apiKey);
  return geminiResult || "Analyse non disponible (timeout sur les deux providers)";
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

    // Load session data
    const [sessionRes, resumesRes, reponsesRes, processusRes, outilsRes, equipesRes, irritantsRes] = await Promise.all([
      supabase.from("cart_sessions").select("*").eq("id", sessionId).single(),
      supabase.from("cart_pack_resumes").select("*").eq("session_id", sessionId),
      supabase.from("cart_reponses").select("*, cart_questions(texte, code, bloc, section)").eq("session_id", sessionId),
      supabase.from("cart_processus").select("*").eq("session_id", sessionId),
      supabase.from("cart_outils").select("*").eq("session_id", sessionId),
      supabase.from("cart_equipes").select("*").eq("session_id", sessionId),
      supabase.from("cart_irritants").select("*").eq("session_id", sessionId),
    ]);

    if (sessionRes.error) throw sessionRes.error;
    const session = sessionRes.data;
    const packResumes = resumesRes.data || [];
    const reponses = reponsesRes.data || [];
    const processus = processusRes.data || [];
    const outils = outilsRes.data || [];
    const equipes = equipesRes.data || [];
    const irritants = irritantsRes.data || [];

    // STEP 1: Detect sector context
    let sectorContext = "";
    const sectorId = session.sector_id;
    if (sectorId) {
      sectorContext = `Secteur detecte: ${sectorId}. Adapte tes recommandations a ce secteur.`;
    }

    const systemPrompt = SYSTEM_PROMPT.replace("{sector_context}", sectorContext);

    // Build response summary per pack
    const packSummaries: string[] = [];
    for (let bloc = 1; bloc <= 10; bloc++) {
      const packReponses = reponses.filter((r: any) => r.bloc === bloc);
      if (packReponses.length === 0) continue;

      const pr = packResumes.find((r: any) => r.bloc === bloc);
      const qaPairs = packReponses
        .filter((r: any) => r.reponse_brute)
        .map((r: any) => `Q: ${r.cart_questions?.texte || r.code_question}\nR: ${r.reponse_brute}`)
        .join("\n");

      packSummaries.push(
        `\n=== PACK ${bloc}: ${BLOC_NAMES[bloc]} ===\nScore maturite: ${pr?.score_maturite || "N/A"}/5\nResume IA: ${pr?.resume || "Non genere"}\n\nReponses:\n${qaPairs}`
      );
    }

    const fullContext = packSummaries.join("\n\n");
    const objectsContext = `\nProcessus: ${processus.map((p: any) => p.nom).join(", ")}\nOutils: ${outils.map((o: any) => o.nom).join(", ")}\nEquipes: ${equipes.map((e: any) => e.nom).join(", ")}\nIrritants: ${irritants.map((i: any) => i.intitule).join(", ")}`;

    // STEP 3: Per-pack extraction (mistral)
    const step3Prompt = `${systemPrompt}\n\nAnalyse les reponses suivantes pack par pack. Pour chaque pack, identifie:\n- Score de maturite (1-5)\n- 3 forces principales\n- 3 faiblesses principales\n- Risques associes\n\n${fullContext}`;

    const step3Result = await generateWithFallback(step3Prompt, "mistral", geminiApiKey);

    // STEP 4: Cross-pack causal analysis (qwen2.5:14b)
    const step4Prompt = `${systemPrompt}\n\nA partir de l'analyse par pack ci-dessous, realise une analyse causale inter-packs:\n1. Identifie les chaines causales entre les packs (ex: faiblesse RH → impact processus → irritants)\n2. Applique la methode des 5 Pourquoi sur les 3 problemes principaux\n3. Detecte les contradictions entre packs\n4. Identifie les leviers transversaux d'amelioration\n\nAnalyse par pack:\n${step3Result}\n\nObjets detectes:\n${objectsContext}`;

    const step4Result = await generateWithFallback(step4Prompt, "qwen2.5:14b", geminiApiKey);

    // STEP 5: Action plan with quantification (qwen2.5:14b)
    const step5Prompt = `${systemPrompt}\n\nA partir de l'analyse causale ci-dessous, genere un plan d'actions priorise:\n1. Actions P1 (quick wins, < 1 mois, fort impact): 5 actions avec estimation cout et gain\n2. Actions P2 (moyen terme, 1-6 mois): 5 actions avec ROI estime\n3. Actions P3 (transformation, 6-18 mois): 3-5 actions strategiques\n4. Vision cible a 18 mois avec 4 milestones trimestriels\n5. Pour chaque action, estime l'impact en EUR (fourchette min-max) ou en % d'amelioration\n\nAnalyse causale:\n${step4Result}\n\nContexte objets:\n${objectsContext}`;

    const step5Result = await generateWithFallback(step5Prompt, "qwen2.5:14b", geminiApiKey);

    // STEP 6: Generate cartography JSON (mistral, json format)
    const step6Prompt = `Genere un JSON representant la cartographie organisationnelle avec les donnees suivantes.
Le JSON doit avoir cette structure exacte:
{
  "nodes": [{"id": "string", "type": "equipe|processus|outil|irritant", "label": "string", "maturityScore": number, "gravite": number, "description": "string"}],
  "edges": [{"id": "string", "source": "string", "target": "string", "type": "uses|depends_on|feeds_into|blocks|causes", "label": "string"}]
}

Processus: ${JSON.stringify(processus.map((p: any) => ({ id: `pr-${p.id}`, nom: p.nom, type: p.type })))}
Outils: ${JSON.stringify(outils.map((o: any) => ({ id: `ou-${o.id}`, nom: o.nom, type: o.type_outil })))}
Equipes: ${JSON.stringify(equipes.map((e: any) => ({ id: `eq-${e.id}`, nom: e.nom })))}
Irritants: ${JSON.stringify(irritants.map((i: any) => ({ id: `ir-${i.id}`, intitule: i.intitule, gravite: i.gravite })))}

Cree des liens logiques entre les noeuds (equipes gerent des processus, processus utilisent des outils, irritants sont causes par des processus ou equipes).
Reponds UNIQUEMENT avec le JSON, pas de texte avant ou apres.`;

    const step6Result = await generateWithFallback(step6Prompt, "mistral", geminiApiKey, "json");

    let cartographyJson = null;
    try {
      cartographyJson = JSON.parse(step6Result);
    } catch {
      // If parsing fails, store as null
    }

    // Save results
    await supabase
      .from("cart_sessions")
      .update({
        ai_cross_pack_analysis: step4Result,
        ai_impact_quantification: step5Result,
        ai_target_vision: step5Result,
        ai_cartography_json: cartographyJson,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
