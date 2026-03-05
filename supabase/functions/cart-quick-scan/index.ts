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
    const { description_libre, reponses_rapides } = await req.json();

    if (!description_libre && (!reponses_rapides || Object.keys(reponses_rapides).length === 0)) {
      return new Response(JSON.stringify({ error: "Missing description or responses" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const reponsesText = Object.entries(reponses_rapides || {})
      .map(([q, a]) => `Q: ${q}\nR: ${a}`)
      .join("\n\n");

    const systemPrompt = `Tu es un consultant expert en transformation organisationnelle.
On te donne une description libre d'une entreprise et ses reponses a un mini-questionnaire rapide (10-15 questions couvrant 10 axes).
Tu dois produire un diagnostic rapide sous forme de JSON avec:
- Des scores estimes par axe (1-5)
- 3-5 quick wins actionnables
- Un resume des principaux dysfonctionnements detectes
Reponds UNIQUEMENT en JSON valide.`;

    const userPrompt = `DESCRIPTION DE L'ENTREPRISE :
${description_libre || "Non fournie"}

REPONSES RAPIDES :
${reponsesText || "Aucune"}

Produis ce JSON :
{
  "scores": {
    "1": 3, "2": 3, "3": 3, "4": 3, "5": 3,
    "6": 3, "7": 3, "8": 3, "9": 3, "10": 3
  },
  "quick_wins": [
    { "action": "...", "impact": "Fort", "effort": "Faible", "categorie": "..." }
  ],
  "dysfonctionnements": ["..."],
  "resume": "Resume en 3-5 lignes du diagnostic rapide"
}

Axes : 1=Contexte, 2=Clients, 3=Organisation, 4=RH, 5=Commercial, 6=Operations, 7=Outils/SI, 8=Communication, 9=Qualite, 10=KPIs
Score: 1=Tres faible, 2=Faible, 3=Moyen, 4=Bon, 5=Excellent`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
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

    let resultats: any;
    try { resultats = JSON.parse(rawContent); } catch {
      resultats = {
        scores: { "1": 3, "2": 3, "3": 3, "4": 3, "5": 3, "6": 3, "7": 3, "8": 3, "9": 3, "10": 3 },
        quick_wins: [{ action: "Contactez-nous pour une analyse complete", impact: "Fort", effort: "Faible", categorie: "General" }],
        dysfonctionnements: ["Analyse partielle - completez le scan complet pour des resultats detailles"],
        resume: "Les donnees fournies sont insuffisantes pour un diagnostic precis. Un scan complet est recommande.",
      };
    }

    // Save to DB
    await supabase.from("cart_quick_scans").insert({
      owner_id: user.id,
      description_libre: description_libre || "",
      reponses_rapides: reponses_rapides || {},
      resultats,
    });

    return new Response(JSON.stringify({ success: true, ...resultats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
