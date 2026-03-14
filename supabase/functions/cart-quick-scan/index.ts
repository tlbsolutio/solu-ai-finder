import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

let corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "https://solutio.work",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

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
        max_tokens: 6000,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(120000),
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

serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  const ALLOWED_ORIGINS = ["https://solutio.work", "https://www.solutio.work", "http://localhost:5173", "http://localhost:8080"];
  if (origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o))) corsHeaders["Access-Control-Allow-Origin"] = origin;
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Auth is optional for quick scan (free tier)
  let userId: string | null = null;
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    userId = user?.id || null;
  }

  try {
    const { description_libre, reponses_rapides } = await req.json();

    if (!description_libre && (!reponses_rapides || Object.keys(reponses_rapides).length === 0)) {
      return new Response(JSON.stringify({ error: "Missing description or responses" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const reponsesText = Object.entries(reponses_rapides || {})
      .map(([q, a]) => `Q: ${q}\nR: ${a}`)
      .join("\n\n");

    const prompt = `Tu es un consultant expert en transformation organisationnelle pour les PME francaises.
On te donne une description libre d'une entreprise et ses reponses a un mini-questionnaire rapide (10-15 questions couvrant 10 axes).

REGLES :
- Score base UNIQUEMENT sur les reponses fournies
- Quick wins actionnables et priorises (P1 = impact fort + effort faible, P2 = impact fort + effort moyen, P3 = reste)
- Dysfonctionnements avec impact estime en heures/mois ou euros/an
- Ne jamais inventer ce qui n'est pas dans les reponses
- Evaluer le niveau de maturite digitale de l'entreprise (capacite a utiliser le numerique comme levier strategique)
- Estimer le potentiel de gain en heures/mois si les quick wins sont mis en place

DESCRIPTION DE L'ENTREPRISE :
${description_libre || "Non fournie"}

REPONSES RAPIDES :
${reponsesText || "Aucune"}

Produis ce JSON EXACT :
{
  "scores": {
    "1": 3, "2": 3, "3": 3, "4": 3, "5": 3,
    "6": 3, "7": 3, "8": 3, "9": 3, "10": 3
  },
  "quick_wins": [
    { "action": "Action concrete et specifique", "impact": "Fort|Moyen|Faible", "effort": "Faible|Moyen|Eleve", "categorie": "Processus|Outil|RH|Organisation", "priorite": "P1|P2|P3" }
  ],
  "dysfonctionnements": ["Dysfonctionnement 1 — Impact estime: X heures/mois perdues"],
  "resume": "Resume en 5-8 lignes : diagnostic clair avec scores cles, les 2-3 problemes les plus impactants, et les 2 premieres actions concretes a lancer cette semaine. Terminer par une phrase sur le potentiel de transformation.",
  "niveau_conscience_digitale": "Debutant|Sensibilise|Engage|Avance|Leader — Description en 1-2 phrases du rapport de l'entreprise au numerique (outils utilises, automatisation, culture data)",
  "score_urgence": 5,
  "axes_critiques": ["Axe le plus critique avec justification courte", "2eme axe critique", "3eme axe critique"],
  "potentiel_transformation": "Estimation du gain potentiel en heures/mois si les quick wins P1 et P2 sont implementes (ex: 15-25h/mois). Expliquer brievement la source des gains."
}

Axes : 1=Contexte, 2=Clients, 3=Organisation, 4=RH, 5=Commercial, 6=Operations, 7=Outils/SI, 8=Communication, 9=Qualite, 10=KPIs
Score: 1=Critique, 2=Emergent, 3=En developpement, 4=Mature, 5=Optimise
score_urgence: 1=Aucune urgence (tout va bien), 5=Urgence moderee (pertes d'efficacite visibles), 8=Urgence forte (risques business), 10=Urgence critique (survie menacee)
Reponds UNIQUEMENT en JSON valide.`;

    let rawContent: string | null = null;

    // Try Claude first
    rawContent = await callClaude(prompt);

    // Fallback: Gemini
    if (!rawContent) {
      const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
      if (GEMINI_API_KEY) {
        rawContent = await callGeminiFallback(prompt, GEMINI_API_KEY);
      }
    }

    if (!rawContent) {
      throw new Error("No AI provider available (Claude and Gemini both failed)");
    }

    // Robust JSON extraction
    const jsonMatch = rawContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (jsonMatch) {
      rawContent = jsonMatch[1].trim();
    } else {
      rawContent = rawContent.trim();
    }

    let resultats: any;
    try {
      resultats = JSON.parse(rawContent);
    } catch {
      const objMatch = rawContent.match(/\{[\s\S]*\}/);
      if (objMatch) {
        try { resultats = JSON.parse(objMatch[0]); } catch {}
      }
      if (!resultats) {
        resultats = {
          scores: { "1": 3, "2": 3, "3": 3, "4": 3, "5": 3, "6": 3, "7": 3, "8": 3, "9": 3, "10": 3 },
          quick_wins: [{ action: "Contactez-nous pour une analyse complete", impact: "Fort", effort: "Faible", categorie: "General", priorite: "P1" }],
          dysfonctionnements: ["Analyse partielle - completez le scan complet pour des resultats detailles"],
          resume: "Les donnees fournies sont insuffisantes pour un diagnostic precis. Un scan complet est recommande.",
        };
      }
    }

    // Save to DB (best-effort)
    try {
      await supabase.from("cart_quick_scans").insert({
        owner_id: userId || "anonymous",
        description_libre: description_libre || "",
        reponses_rapides: reponses_rapides || {},
        resultats,
      });
    } catch (dbErr) {
      console.error("Failed to save quick scan to DB:", dbErr);
    }

    return new Response(JSON.stringify({ success: true, ...resultats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("cart-quick-scan error:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
