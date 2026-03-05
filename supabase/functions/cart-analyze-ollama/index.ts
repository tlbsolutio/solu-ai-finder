import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OLLAMA_URL = "http://76.13.50.143:11434/api/generate";
const OLLAMA_TIMEOUT = 180000; // 3 min per call

// Model selection based on available models
const MODEL_EXTRACTION = "mistral-nemo:12b"; // Fast, good JSON extraction
const MODEL_ANALYSIS = "qwen3:8b"; // Best general reasoning available

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

const MASTER_SYSTEM_PROMPT = `Tu es un consultant senior en transformation organisationnelle specialise dans les TPE/PME/ETI francaises (5-500 salaries).
Tu analyses les reponses a un diagnostic structure en 10 packs thematiques pour produire un diagnostic actionnable.

IDENTITE ET POSTURE :
- Tu es factuel, direct, et oriente action
- Tu identifies les CAUSES RACINES (pas les symptomes)
- Tu quantifies l'impact financier des dysfonctionnements
- Tu priorises par ROI et faisabilite
- Tu adaptes ton analyse au secteur d'activite detecte
- Tu ecris en francais professionnel, sans jargon inutile

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLE FONDAMENTALE — ISOLATION DES PACKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chaque pack doit produire des objets EXCLUSIVEMENT issus des reponses de ce pack.
Il est INTERDIT de faire apparaitre un objet (outil, irritant, tache manuelle, equipe, processus) dans un pack si cet objet ne decoule pas directement des reponses de ce pack.

EXEMPLE INTERDIT :
- Pack RH → outils detectes : HubSpot, Excel, Logiciel comptable (ces outils n'ont PAS ete mentionnes dans le pack RH)
EXEMPLE CORRECT :
- Pack RH → outils detectes : Indeed, LinkedIn (si mentionnes dans les reponses RH)
- Pack KPIs → outils : HubSpot, Excel (si mentionnes dans les reponses KPIs)

VERIFICATION : Aucun irritant identique ne doit apparaitre dans plus de 2 packs. Aucun outil ne doit porter la meme description dans deux packs differents.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLE — EXTRACTION DES EQUIPES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Extraire TOUTES les equipes, roles et fonctions mentionnes dans les reponses, explicitement ou implicitement.

Sources a analyser :
- Noms de roles directs ("le Responsable Technique", "l'equipe commerciale", "le dirigeant")
- Roles implicites dans les processus ("les techniciens qui posent", "l'admin qui consolide")
- Structures mentionnees ("comite de direction", "CoDir", "managers", "equipe terrain")

REGLE ABSOLUE : Si des humains sont acteurs d'un processus decrit, une equipe DOIT etre creee. Ne JAMAIS retourner 0 equipes si des reponses decrivent des activites humaines.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLE — EXTRACTION DES PROCESSUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Identifier TOUS les processus decrits. Un processus = toute sequence d'actions decrite ("on fait X, puis Y, puis Z").
Exemples : gestion des commandes, suivi de chantier, recrutement, onboarding, gestion des reclamations, elaboration des devis, facturation...
Objectif : au moins 3 processus detectes par pack si les reponses le permettent.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLE — PRIORISATION DES QUICK WINS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

P1 — Must do : Impact Eleve + Effort Faible, resultat visible < 4 semaines
P2 — Should do : Impact Eleve + Effort Moyen OU Impact Moyen + Effort Faible, realisable 1-3 mois
P3 — Nice to have : Impact Moyen + Effort Moyen ou superieur

Distribution OBLIGATOIRE : Min 15% P1, Min 30% P2, Max 55% P3.
Si tous les quick wins se retrouvent en P3, c'est une ERREUR de classification.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLE — RECOMMANDATIONS LOGICIELS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Avant de recommander un REMPLACEMENT, verifier :
1. Outil mal utilise (fonctionnalites non exploitees) → Formation + activation fonctionnalites manquantes (PAS un remplacement)
2. Outil bien utilise mais non connecte aux autres → Integration via API, connecteur natif ou automatisation (Zapier, Make...)
3. Outil intrinsequement inadapte au besoin decrit → Remplacement + preciser par quoi et pourquoi

Format : "[Type] — [Outil] — [Probleme precis] — [Action concrete] — [Benefice quantifie]"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLE — ANALYSE TRANSVERSALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

L'analyse transversale doit etablir des LIENS DE CAUSALITE explicites entre les problemes de differents packs.

Format requis pour chaque lien :
"[Probleme A — Pack X] → CAUSE/AMPLIFIE → [Probleme B — Pack Y] → CONSEQUENCE FINALE sur l'entreprise"

Exemples de liens a detecter :
- Lien operationnel → RH : "L'absence d'outil de gestion de projet (Pack 6) oblige l'equipe administrative a coordonner manuellement, contribuant a la surcharge identifiee (Pack 4, note 2/5)"
- Lien SI → Commercial : "La deconnexion entre CRM et facturation (Pack 7) genere une double saisie qui allonge le cycle post-vente et peut expliquer le taux de transformation limite (Pack 5)"
- Lien RH → Qualite : "Le turnover couple a un onboarding insuffisant (Pack 4) et une documentation a 60% (Pack 6) cree un risque de perte de savoir-faire qui fragilise la qualite (Pack 9)"

Structure : 1) Score global pondere (expliquer la ponderation) 2) 3-5 liens causaux explicites 3) 2 noeuds critiques (problemes qui en causent le plus d'autres) 4) Vision cible 12-18 mois

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLE — QUANTIFICATION D'IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Temps perdu = (nb employes concernes) × (heures/semaine perdues) × 46 semaines × (cout horaire charge ~35-55 EUR)
- Cout turnover = (taux annuel) × (nb departs) × (6-9 mois de salaire)
- Cout reunions improductives = (heures/semaine) × (% improductif) × (cout horaire) × (nb participants) × 46 semaines
- Manque a gagner commercial = (opportunites perdues) × (panier moyen) × (taux conversion manque)
- Toujours donner fourchette basse/haute avec hypotheses explicites

{sector_context}

Reponds toujours en francais.`;

async function callOllama(prompt: string, model: string, format?: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT);

    const body: Record<string, unknown> = { model, prompt, stream: false };
    if (format) body.format = format;

    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`Ollama ${model} error: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.response || null;
  } catch (e) {
    console.error(`Ollama ${model} failed:`, e);
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

async function generateWithFallback(prompt: string, model: string, apiKey: string, format?: string): Promise<string> {
  const ollamaResult = await callOllama(prompt, model, format);
  if (ollamaResult) return ollamaResult;

  console.log(`Ollama fallback to Gemini for model ${model}`);
  const geminiResult = await callGeminiFallback(prompt, apiKey);
  return geminiResult || "Analyse non disponible (timeout sur les deux providers)";
}

function extractJson(raw: string): unknown | null {
  // Try to parse directly
  try { return JSON.parse(raw); } catch {}
  // Try to extract from markdown code block
  const match = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (match) {
    try { return JSON.parse(match[1].trim()); } catch {}
  }
  // Try to find JSON object in text
  const objMatch = raw.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch {}
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
    const [sessionRes, resumesRes, reponsesRes, processusRes, outilsRes, equipesRes, irritantsRes, quickwinsRes] = await Promise.all([
      supabase.from("cart_sessions").select("*").eq("id", sessionId).single(),
      supabase.from("cart_pack_resumes").select("*").eq("session_id", sessionId).order("bloc"),
      supabase.from("cart_reponses").select("*, cart_questions(texte, code, bloc, section, type_reponse)").eq("session_id", sessionId),
      supabase.from("cart_processus").select("*").eq("session_id", sessionId),
      supabase.from("cart_outils").select("*").eq("session_id", sessionId),
      supabase.from("cart_equipes").select("*").eq("session_id", sessionId),
      supabase.from("cart_irritants").select("*").eq("session_id", sessionId),
      supabase.from("cart_quickwins").select("*").eq("session_id", sessionId),
    ]);

    if (sessionRes.error) throw sessionRes.error;
    const session = sessionRes.data;
    const packResumes = resumesRes.data || [];
    const reponses = reponsesRes.data || [];
    const processus = processusRes.data || [];
    const outils = outilsRes.data || [];
    const equipes = equipesRes.data || [];
    const irritants = irritantsRes.data || [];
    const quickwins = quickwinsRes.data || [];

    // Build sector context
    let sectorContext = "";
    const sectorId = session.sector_id;
    if (sectorId) {
      sectorContext = `CONTEXTE SECTORIEL : Secteur detecte = "${sectorId}".
Adapte tes recommandations d'outils, KPIs et reglementations a ce secteur specifique.
Utilise les benchmarks sectoriels pour evaluer la maturite.`;
    }

    const systemPrompt = MASTER_SYSTEM_PROMPT.replace("{sector_context}", sectorContext);

    // Build detailed response summary per pack
    const packSummaries: string[] = [];
    for (let bloc = 1; bloc <= 10; bloc++) {
      const packReponses = reponses.filter((r: any) => r.bloc === bloc);
      if (packReponses.length === 0) continue;

      const pr = packResumes.find((r: any) => r.bloc === bloc);
      const packProcessus = processus.filter((p: any) => {
        // Associate based on AI detection during pack analysis
        return true; // All available for now
      });

      const qaPairs = packReponses
        .filter((r: any) => r.reponse_brute)
        .map((r: any) => {
          const q = r.cart_questions;
          return `Q [${q?.type_reponse || "Texte"}]: ${q?.texte || r.code_question}\nR: ${r.reponse_brute}`;
        })
        .join("\n\n");

      packSummaries.push(
        `\n=== PACK ${bloc}: ${BLOC_NAMES[bloc]} ===\nScore maturite IA: ${pr?.score_maturite || "N/A"}/5\nResume IA precedent: ${pr?.resume || "Non genere"}\nNombre de reponses: ${packReponses.filter((r: any) => r.reponse_brute).length}\n\nReponses detaillees:\n${qaPairs}`
      );
    }

    const fullContext = packSummaries.join("\n\n");

    const objectsContext = `
OBJETS DETECTES PAR L'ANALYSE PAR PACK :
- Processus (${processus.length}): ${processus.map((p: any) => `${p.nom} [${p.type || ""}]`).join(", ") || "Aucun"}
- Outils (${outils.length}): ${outils.map((o: any) => `${o.nom} [${o.type_outil || ""}]`).join(", ") || "Aucun"}
- Equipes (${equipes.length}): ${equipes.map((e: any) => `${e.nom}`).join(", ") || "Aucune"}
- Irritants (${irritants.length}): ${irritants.map((i: any) => `${i.intitule} (gravite ${i.gravite}/5)`).join(", ") || "Aucun"}
- Quick wins (${quickwins.length}): ${quickwins.map((q: any) => `${q.intitule} [${q.impact}/${q.effort}]`).join(", ") || "Aucun"}`;

    // ========== STEP 3: Per-pack deep analysis (mistral-nemo) ==========
    console.log("Step 3: Per-pack analysis with " + MODEL_EXTRACTION);
    const step3Prompt = `${systemPrompt}

TACHE : Analyse detaillee pack par pack.

REGLE CRITIQUE D'ISOLATION : Pour chaque pack, tu dois UNIQUEMENT identifier les objets qui decoulent DIRECTEMENT des reponses de CE pack.
- Un outil n'apparait dans un pack que s'il est EXPLICITEMENT mentionne dans les reponses de CE pack
- Un irritant n'apparait dans un pack que s'il decoule des reponses de CE pack
- Une tache manuelle n'apparait que si elle est decrite dans CE pack
- NE PAS repeter les memes outils/irritants/taches dans plusieurs packs sauf si EXPLICITEMENT mentionnes dans chacun

Pour chaque pack present, produis :
1. Score de maturite (1-5) avec justification en citant les reponses
2. Niveau : 1-1.5 = Critique | 1.6-2.5 = Emergent | 2.6-3.5 = En developpement | 3.6-4.5 = Mature | 4.6-5 = Optimise
3. 3+ forces principales avec citations VERBATIM entre guillemets
4. 3+ faiblesses principales avec citations VERBATIM entre guillemets
5. Signaux faibles detectes (contradictions, items de detresse)
6. TOUTES les equipes/roles mentionnes dans CE pack (noms directs ET roles implicites dans les processus decrits)
7. TOUS les processus decrits dans CE pack (minimum 3 : toute sequence d'actions = un processus)
8. UNIQUEMENT les outils NOMMES dans les reponses de CE pack
9. UNIQUEMENT les irritants SPECIFIQUES decrits dans les reponses de CE pack

DONNEES A ANALYSER :
${fullContext}`;

    const step3Result = await generateWithFallback(step3Prompt, MODEL_EXTRACTION, geminiApiKey);

    // ========== STEP 4: Cross-pack causal analysis (qwen3) ==========
    console.log("Step 4: Cross-pack causal analysis with " + MODEL_ANALYSIS);
    const step4Prompt = `${systemPrompt}

TACHE : Analyse causale inter-packs approfondie.

A partir de l'analyse par pack ci-dessous et des objets detectes, realise UNE ANALYSE TRANSVERSALE PROFONDE.

1. CHAINES CAUSALES (methode 5 Pourquoi) sur les 3 problemes majeurs :
   Pour chaque probleme :
   - Pourquoi 1 : Symptome observe (score bas, verbatim negatif — CITE le verbatim exact)
   - Pourquoi 2 : Cause directe (processus, competence, outil)
   - Pourquoi 3 : Cause structurelle (organisation, gouvernance, culture)
   - Pourquoi 4 : Cause systemique (strategie, leadership, ressources)
   - Pourquoi 5 : Cause racine (modele mental, croyance limitante, contrainte externe)

2. LIENS INTER-PACKS — MINIMUM 5 liens causaux explicites :
   Format OBLIGATOIRE pour chaque lien :
   "[Probleme A — Pack X, score Y/5] → CAUSE/AMPLIFIE → [Probleme B — Pack Z, score W/5] → CONSEQUENCE FINALE chiffree sur l'entreprise"

   Exemples concrets a detecter :
   - "L'absence d'outil de gestion de projet (Pack 6 — Ops, score 2/5) oblige l'equipe administrative a coordonner manuellement les chantiers par email, ce qui contribue directement a la surcharge identifiee (Pack 4 — RH, score 2/5 sur la repartition de charge)"
   - "La deconnexion entre CRM et facturation (Pack 7 — SI) genere une double saisie (~2h/jour) qui allonge le cycle post-vente et peut expliquer le taux de transformation des devis limite a 35% (Pack 5 — Commercial)"
   - "Le turnover de 12% couple a un onboarding note 3/5 (Pack 4) et une documentation a 60% (Pack 6) cree un risque de perte de savoir-faire qui fragilise la qualite (Pack 9, score 2/5)"

3. CONTRADICTIONS INTER-PACKS :
   Si Pack A dit X et Pack B contredit X, c'est un signal diagnostique precieux. Explique ce que la contradiction revele.

4. IDENTIFICATION DES 2 "NOEUDS CRITIQUES" :
   Les 2 problemes qui en causent le plus d'autres si non traites. Pour chacun, liste tous les packs impactes.

5. SCORE DE MATURITE GLOBAL :
   Moyenne ponderee des 10 packs. Explique la ponderation choisie (les packs Strategie, Operations et Commercial pesent generalement plus).

ANALYSE PAR PACK :
${step3Result}

OBJETS DETECTES :
${objectsContext}`;

    const step4Result = await generateWithFallback(step4Prompt, MODEL_ANALYSIS, geminiApiKey);

    // ========== STEP 5: Action plan + impact quantification (qwen3) ==========
    console.log("Step 5: Action plan with " + MODEL_ANALYSIS);
    const step5Prompt = `${systemPrompt}

TACHE : Plan d'actions priorise avec quantification d'impact financier.

━━━ REGLES DE PRIORISATION STRICTES ━━━
P1 — Quick Wins (0-3 mois) : Impact eleve + effort faible, ROI rapide. EXACTEMENT 3-5 actions.
  Condition : resultat visible < 4 semaines, gain operationnel immediat, actionnable en 48h
  Exemples : connecter deux outils via API existante, activer une fonctionnalite inutilisee, mettre en place un template de reunion...
P2 — Chantiers structurants (3-9 mois) : Impact eleve + effort moyen. EXACTEMENT 3-5 actions.
  Exemples : deployer un nouvel outil, former une equipe, refondre un processus...
P3 — Transformations profondes (9-18 mois) : Impact transformatif + effort eleve. EXACTEMENT 2-3 actions.
  Exemples : transformation digitale, restructuration organisationnelle...

ERREUR A EVITER : Si tous les actions sont P3, tu as MAL evalue l'effort. Revoir : une integration API = effort faible, une formation = effort moyen, pas eleve.

━━━ RECOMMANDATIONS LOGICIELS ━━━
ARBRE DE DECISION OBLIGATOIRE avant toute recommandation :
1. L'outil est mal utilise (fonctionnalites non exploitees) → "Formation — [Outil] — [Fonctionnalite a activer] — [Benefice]"
2. L'outil est bien utilise mais non connecte → "Integration — [Outil A + Outil B] — [Double saisie identifiee ~Xh/jour] — Connecter via API/Zapier/Make — [Gain estime : Xh/mois]"
3. L'outil est intrinsequement inadapte → "Remplacement — [Outil actuel] → [Outil recommande] — [Pourquoi l'actuel est inadapte] — [Benefice du remplacement]"

━━━ QUANTIFICATION D'IMPACT ━━━
Pour chaque dysfonctionnement majeur, donner une fourchette basse/haute :
- Temps perdu = (nb employes concernes) × (heures/semaine perdues) × 46 semaines × (cout horaire charge 35-55 EUR)
- Cout turnover = (nb departs/an) × (6-9 mois de salaire brut charge)
- Cout reunions improductives = (heures reunion/semaine) × (% improductif) × (cout horaire) × (nb participants) × 46 semaines
- Manque a gagner commercial = (opportunites perdues estimees) × (panier moyen) × (taux conversion manque)
- EXPLICITER les hypotheses pour chaque calcul

━━━ FORMAT POUR CHAQUE ACTION ━━━
- Titre clair et actionnable
- Description precise (quoi faire concretement, etape par etape)
- Pack(s) d'origine avec score
- Impact estime (EUR economises ou gagnes, temps recupere en h/mois)
- Cout/effort de mise en oeuvre (EUR et jours-homme)
- Outil recommande adapte au secteur et a la taille (nom + prix estimatif)
- Responsable suggere (profil, pas nom)
- Indicateur de succes mesurable (KPI + valeur cible)
- Deadline : M+1, M+3, M+6, M+12, M+18

━━━ VISION CIBLE 18 MOIS ━━━
4 milestones avec indicateurs mesurables :
- M+3 : Quick wins deployes, premiers gains visibles
- M+6 : Chantiers P2 en cours, premiers resultats mesurables
- M+12 : Transformation en cours, gains cumules significatifs
- M+18 : Organisation cible atteinte, gains perennes

ANALYSE CAUSALE :
${step4Result}

OBJETS DETECTES :
${objectsContext}`;

    const step5Result = await generateWithFallback(step5Prompt, MODEL_ANALYSIS, geminiApiKey);

    // ========== STEP 6: Generate cartography JSON (mistral-nemo, json format) ==========
    console.log("Step 6: Cartography JSON with " + MODEL_EXTRACTION);

    // Build taches list for cartography
    const { data: tachesData } = await supabase.from("cart_taches").select("*").eq("session_id", sessionId);
    const taches = tachesData || [];

    const step6Prompt = `Genere un JSON representant la cartographie organisationnelle COMPLETE de l'entreprise.

━━━ REGLES DE GENERATION — OBJECTIF MINIMUM 40 NOEUDS ━━━

La carte doit agreger les objets de TOUS les packs avec ces regles :

1. Chaque equipe detectee = 1 noeud type "equipe" (orange)
2. Chaque processus detecte = 1 noeud type "processus" (bleu)
3. Chaque outil detecte = 1 noeud type "outil" (vert)
4. Chaque irritant critique ou important = 1 noeud type "irritant" (rouge)
5. Chaque tache manuelle = 1 noeud type "tache" (jaune)

REGLES DE LIENS :
- Equipe → Processus : si l'equipe est actrice du processus (type: "feeds_into")
- Processus → Outil : si l'outil est utilise dans le processus (type: "uses")
- Irritant → Processus : si l'irritant affecte le processus (type: "blocks", animated: true)
- Irritant → Outil : si l'irritant est lie a l'usage de l'outil (type: "causes", animated: true)
- Processus → Processus : si un processus alimente l'autre (type: "feeds_into")

REGLES DE SCORING :
- maturityScore de 1 a 5 (1=critique, 5=excellent)
- gravite de 1 a 5 pour les irritants (5=critique)
- Les liens "blocks" et "causes" doivent etre animes (animated: true)

VERIFICATION AVANT GENERATION :
- La carte contient au minimum 40 noeuds
- Chaque noeud a au moins 1 lien
- Les irritants sont relies aux processus/outils qu'ils affectent
- Les equipes sont reliees aux processus qu'elles gerent

Le JSON doit avoir cette structure EXACTE :
{
  "nodes": [
    {"id": "string", "type": "equipe|processus|outil|irritant|tache", "label": "string", "maturityScore": 3, "gravite": 0, "description": "string", "packOrigin": "Pack X"}
  ],
  "edges": [
    {"id": "string", "source": "node_id", "target": "node_id", "type": "uses|depends_on|feeds_into|blocks|causes", "label": "string", "animated": false}
  ]
}

DONNEES A CARTOGRAPHIER (utilise TOUS ces objets — chacun doit devenir un noeud) :

Equipes (${equipes.length}):
${JSON.stringify(equipes.map((e: any) => ({ id: `eq-${e.id}`, nom: e.nom, mission: e.mission })))}

Processus (${processus.length}):
${JSON.stringify(processus.map((p: any) => ({ id: `pr-${p.id}`, nom: p.nom, type: p.type, description: p.description })))}

Outils (${outils.length}):
${JSON.stringify(outils.map((o: any) => ({ id: `ou-${o.id}`, nom: o.nom, type: o.type_outil, problemes: o.problemes })))}

Irritants (${irritants.length}):
${JSON.stringify(irritants.map((i: any) => ({ id: `ir-${i.id}`, intitule: i.intitule, gravite: i.gravite, type: i.type })))}

Taches manuelles (${taches.length}):
${JSON.stringify(taches.map((t: any) => ({ id: `ta-${t.id}`, nom: t.nom, frequence: t.frequence, double_saisie: t.double_saisie })))}

IMPORTANT : Si le total des objets ci-dessus est inferieur a 40, CREE des noeuds supplementaires pertinents :
- Processus implicites (un outil + une equipe impliquent un processus)
- Equipes implicites (un processus implique des acteurs)
- Liens manquants entre objets existants

Chaque noeud doit avoir au moins 1 lien. Cree des liens logiques et pertinents.
Reponds UNIQUEMENT avec le JSON valide, sans texte ni markdown.`;

    const step6Result = await generateWithFallback(step6Prompt, MODEL_EXTRACTION, geminiApiKey, "json");

    const cartographyJson = extractJson(step6Result);

    // Save all results (JSONB columns need valid JSON, wrap text in object)
    const wrapText = (text: string): unknown => {
      // Try to parse as JSON first
      try { return JSON.parse(text); } catch {}
      // Wrap raw text in a JSON object
      return { content: text };
    };

    const updateData: Record<string, unknown> = {
      ai_cross_pack_analysis: wrapText(step4Result),
      ai_impact_quantification: wrapText(step5Result),
      ai_target_vision: wrapText(step5Result),
      updated_at: new Date().toISOString(),
    };
    if (cartographyJson) {
      updateData.ai_cartography_json = cartographyJson;
    }

    const { error: updateError } = await supabase
      .from("cart_sessions")
      .update(updateData)
      .eq("id", sessionId);

    if (updateError) {
      console.error("Failed to save analysis results:", updateError);
      throw updateError;
    }

    console.log("Analysis complete for session:", sessionId);

    return new Response(
      JSON.stringify({ success: true, steps_completed: 4 }),
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
