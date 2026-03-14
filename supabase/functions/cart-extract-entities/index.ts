import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

let corsHeaders: Record<string, string> = {
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
        max_tokens: 8000,
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
  let session_id: string | undefined;

  try {
    const body = await req.json();
    session_id = body.session_id;
    if (!session_id) throw new Error("Missing session_id");

    // Verify session ownership
    const { data: session, error: sessionError } = await supabase
      .from("cart_sessions")
      .select("id, owner_id, nom, sector_id, last_extraction_at")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (session.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Rate limit: 1 extraction per 2 minutes per session
    if (session.last_extraction_at) {
      const elapsed = (Date.now() - new Date(session.last_extraction_at).getTime()) / 1000;
      if (elapsed < 120) {
        return new Response(JSON.stringify({ error: `Veuillez patienter ${Math.ceil(120 - elapsed)}s avant de relancer l'extraction` }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Mark extraction timestamp
    await supabase.from("cart_sessions").update({ last_extraction_at: new Date().toISOString() }).eq("id", session_id);

    // Set status to extracting
    await supabase.from("cart_sessions").update({ entities_extraction_status: "extracting" }).eq("id", session_id);

    // Fetch all pack resumes and responses
    const [packResumesRes, reponsesRes] = await Promise.all([
      supabase.from("cart_pack_resumes").select("*").eq("session_id", session_id).order("bloc"),
      supabase.from("cart_reponses").select("*, question:cart_questions(texte, section, type_reponse)").eq("session_id", session_id).order("bloc"),
    ]);

    const packResumes = packResumesRes.data || [];
    const reponses = reponsesRes.data || [];

    // Build per-pack response summaries
    const packContexts = packResumes.map((pr: any) => {
      const packReponses = reponses
        .filter((r: any) => r.bloc === pr.bloc && r.reponse_brute?.trim())
        .map((r: any) => `Q: ${r.question?.texte || r.code_question || "?"}\nR: ${r.reponse_brute}`)
        .join("\n\n");

      return `━━━ PACK ${pr.bloc}: ${BLOC_NAMES[pr.bloc] || `Bloc ${pr.bloc}`} (Score: ${pr.score_maturite}/5) ━━━
Resume: ${pr.resume || "N/A"}

Reponses:
${packReponses || "Aucune reponse"}`;
    }).join("\n\n");

    const sectorInfo = session.sector_id ? `Secteur : ${session.sector_id}.` : "";

    const prompt = `Tu es un expert en cartographie organisationnelle pour les PME francaises. ${sectorInfo}

Tu recois les reponses et analyses de TOUS les packs thematiques d'un diagnostic d'entreprise "${session.nom}".

Ta mission : extraire et DEDUPLIQUER les entites (equipes, processus, outils) mentionnees a travers TOUS les packs.

REGLES CRITIQUES :
1. DEDUPLICATION STRICTE : Si "Equipe IT" apparait dans 3 packs differents, c'est UNE SEULE entite avec 3 packs source.
2. FUSION INTELLIGENTE : "Direction" + "Comite de direction" + "Management" = UNE entite. "Excel (devis)" + "Excel (reporting)" = UN outil.
3. EXHAUSTIVITE : Extraire TOUTES les entites mentionnees, y compris implicitement ("les techniciens" → equipe "Equipe technique").
4. TRACABILITE : Pour chaque entite, lister les packs source (numeros).

${packContexts}

Produis EXACTEMENT ce JSON (sans markdown) :
{
  "equipes": [
    { "id": "eq_1", "nom": "Nom de l'equipe/role", "description": "Description consolidee de la mission et du role", "source_packs": ["1", "3", "4"] }
  ],
  "processus": [
    { "id": "pr_1", "nom": "Nom du processus", "description": "Description consolidee du processus (etapes, acteurs, outils)", "source_packs": ["2", "5"] }
  ],
  "outils": [
    { "id": "ou_1", "nom": "Nom exact de l'outil", "description": "Usage consolide et problemes identifies", "categorie": "CRM|ERP|Bureautique|Communication|Metier|Autre", "source_packs": ["1", "7"] }
  ],
  "stats": {
    "total_equipes": 0,
    "total_processus": 0,
    "total_outils": 0,
    "packs_analyzed": 0
  }
}

IMPORTANT :
- Chaque ID doit etre unique (eq_1, eq_2, pr_1, pr_2, ou_1, ou_2, etc.)
- La description doit etre LA PLUS COMPLETE possible, consolidant toutes les mentions
- source_packs contient les numeros de packs ou l'entite est mentionnee (comme strings)
- Objectif : des listes propres, sans doublons, pretes a etre validees par l'utilisateur`;

    const rawContent = await generate(prompt, geminiApiKey);

    // Parse JSON
    let parsed: any;
    let jsonStr = rawContent.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const objMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try { parsed = JSON.parse(objMatch[0]); } catch {}
      }
      if (!parsed) {
        parsed = { equipes: [], processus: [], outils: [] };
      }
    }

    // Ensure arrays
    const entities = {
      equipes: Array.isArray(parsed.equipes) ? parsed.equipes : [],
      processus: Array.isArray(parsed.processus) ? parsed.processus : [],
      outils: Array.isArray(parsed.outils) ? parsed.outils : [],
    };

    // Store in session
    await supabase.from("cart_sessions").update({
      ai_extracted_entities: entities,
      entities_extraction_status: "extracted",
    }).eq("id", session_id);

    console.log(`✅ Extracted entities: ${entities.equipes.length} equipes, ${entities.processus.length} processus, ${entities.outils.length} outils`);

    return new Response(JSON.stringify({
      success: true,
      entities,
      stats: {
        equipes: entities.equipes.length,
        processus: entities.processus.length,
        outils: entities.outils.length,
      },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("cart-extract-entities error:", e);
    // Reset status so user can retry
    if (session_id) {
      try {
        await supabase.from("cart_sessions").update({ entities_extraction_status: "pending" }).eq("id", session_id);
      } catch {}
    }
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
