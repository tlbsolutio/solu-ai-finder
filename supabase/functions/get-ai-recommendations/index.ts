import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Static SaaS fallback data with realistic French options
const FALLBACK_SAAS_DATA = [
  {
    id: "rec001",
    name: "HubSpot CRM",
    tagline: "CRM gratuit pour gérer vos contacts",
    description: "Solution CRM complète pour gérer les contacts clients, les ventes et le marketing",
    categories: ["CRM", "Vente", "Marketing"],
    features: ["Gestion contacts", "Suivi commercial", "Automatisation email"],
    automation: 85,
    priceText: "Gratuit - 45€/mois"
  },
  {
    id: "rec002", 
    name: "Mailchimp",
    tagline: "Email marketing automatisé",
    description: "Plateforme d'email marketing et automation pour PME",
    categories: ["Email Marketing", "Automation"],
    features: ["Campagnes email", "Automation", "Segmentation"],
    automation: 90,
    priceText: "Gratuit - 30€/mois"
  },
  {
    id: "rec003",
    name: "Zapier",
    tagline: "Automatisez vos tâches répétitives",
    description: "Connectez vos applications et automatisez vos workflows",
    categories: ["Automation", "Productivité"],
    features: ["Intégrations", "Workflows", "Triggers automatiques"],
    automation: 95,
    priceText: "20€ - 50€/mois"
  },
  {
    id: "rec004",
    name: "Calendly",
    tagline: "Prise de rendez-vous automatisée",
    description: "Simplifiez la prise de rendez-vous avec vos clients",
    categories: ["Planification", "Productivité"],
    features: ["Calendrier en ligne", "Notifications automatiques", "Intégrations"],
    automation: 80,
    priceText: "8€ - 12€/mois"
  },
  {
    id: "rec005",
    name: "Notion",
    tagline: "Workspace tout-en-un",
    description: "Base de données, notes et gestion de projets unifiées",
    categories: ["Productivité", "Gestion de projet"],
    features: ["Base de données", "Templates", "Collaboration"],
    automation: 70,
    priceText: "8€ - 16€/mois"
  },
  {
    id: "rec006",
    name: "Monday.com",
    tagline: "Gestion de projet visuelle",
    description: "Plateforme de gestion de projet et collaboration d'équipe",
    categories: ["Gestion de projet", "Collaboration"],
    features: ["Tableaux Kanban", "Suivi temps", "Automatisation"],
    automation: 85,
    priceText: "8€ - 16€/mois"
  }
];

// Fetch SaaS data from Airtable with fallback
async function fetchSaasFromAirtable() {
  try {
    const response = await fetch(`https://excqwhuvfyoqvcpxtxsa.supabase.co/functions/v1/get-saas-from-airtable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({
        baseId: 'appFNE9ybIE4u4LKc',
        table: 'tblGthq34tP4CiMOw',
        view: 'viwA9qYFU9t7E7Lm5'
      })
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch SaaS data: ${response.status}`);
      console.log('🔄 Using fallback SaaS data instead');
      return { items: FALLBACK_SAAS_DATA };
    }
    
    const data = await response.json();
    console.log(`✅ Successfully fetched ${data.items?.length || 0} SaaS from Airtable`);
    return data;
  } catch (error) {
    console.log('Error fetching SaaS data:', error);
    console.log('🔄 Using fallback SaaS data instead');
    return { items: FALLBACK_SAAS_DATA };
  }
}

// Economic calculation helper functions
function getTimePerTask(task: string): number {
  const lower = task.toLowerCase();
  if (lower.includes('email') || lower.includes('saisie') || lower.includes('données')) return 2.5;
  if (lower.includes('planification') || lower.includes('gestion') || lower.includes('organisation')) return 4;
  if (lower.includes('comptabilité') || lower.includes('facture') || lower.includes('finance')) return 5.5;
  if (lower.includes('rapport') || lower.includes('analyse') || lower.includes('dashboard')) return 6;
  return 3;
}

function getMonthlyFrequency(frequency: string): number {
  const freq = frequency.toLowerCase();
  if (freq.includes('jour')) return 20;
  if (freq.includes('semaine')) return 4;
  if (freq.includes('mois')) return 1;
  return 2;
}

function getHourlyRate(sector: string): number {
  const s = sector.toLowerCase();
  if (s.includes('finance')) return 55;
  if (s.includes('marketing') || s.includes('communication')) return 45;
  if (s.includes('artisan') || s.includes('btp') || s.includes('indépendant')) return 35;
  if (s.includes('tech') || s.includes('saas')) return 50;
  return 43.5;
}

function getAutomationPotential(tools: string): number {
  const t = tools.toLowerCase();
  if (t.includes('excel') || t.includes('manuel')) return 85;
  if (t.includes('crm') || t.includes('erp')) return 65;
  if (t.includes('automatisation') || t.includes('zapier') || t.includes('make')) return 30;
  return 60;
}

interface DiagnosticData {
  task: string;
  frequency: string;
  sector: string;
  tools: string;
  expectedResult: string;
  constraints: string;
  priority: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagnosticData }: { diagnosticData: DiagnosticData } = await req.json();
    
    console.log('Analyzing diagnostic data:', diagnosticData);

    // Fetch SaaS data (with automatic fallback)
    const saasData = await fetchSaasFromAirtable();
    
    if (!saasData || !saasData.items || saasData.items.length === 0) {
      console.log('❌ No SaaS data available even with fallback');
      return new Response(JSON.stringify({
        error: 'No SaaS data available',
        message: 'Unable to fetch SaaS recommendations at this time'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`📊 Working with ${saasData.items.length} SaaS tools`);
    const availableIds = saasData.items.map((item: any) => item.id);
    console.log(`🆔 Available SaaS IDs: ${availableIds.join(', ')}`);

    // Calculate economic metrics
    const timePerTask = getTimePerTask(diagnosticData.task);
    const monthlyFreq = getMonthlyFrequency(diagnosticData.frequency);
    const hourlyRate = getHourlyRate(diagnosticData.sector);
    const automationPot = getAutomationPotential(diagnosticData.tools);
    
    const monthlyHours = timePerTask * monthlyFreq * (automationPot / 100);
    const monthlySavings = Math.max(0, monthlyHours * hourlyRate - 35); // -35€ average SaaS cost
    const annualSavings = monthlySavings * 12;

    const prompt = `Tu es un consultant expert en automatisation pour les PME et indépendants.

Ta mission est d'analyser les réponses du diagnostic utilisateur et de recommander des outils SaaS UNIQUEMENT parmi ceux listés dans la base Airtable fournie.

---

🎯 Réponses utilisateur :

Tâche : ${diagnosticData.task}
Fréquence : ${diagnosticData.frequency}
Secteur : ${diagnosticData.sector}
Outils actuels : ${diagnosticData.tools}
Résultat attendu : ${diagnosticData.expectedResult}
Contraintes : ${diagnosticData.constraints}
Priorité : ${diagnosticData.priority}/5

---

🧩 Voici les SaaS disponibles (format JSON) :

${JSON.stringify(saasData.items, null, 2)}

---

🎯 Règles strictes :

1. Ne recommander QUE des SaaS présents dans la base ci-dessus (par leur ID exact).
2. Ne PAS recommander un outil déjà cité dans "Outils actuels", sauf si c'est pour l'étendre ou le connecter via un autre outil.
3. Privilégier des outils complémentaires et éviter les redondances (pas deux CRM, ou deux outils no-code similaires).
4. Respecter les contraintes métier et techniques dans la sélection (ex. intégration ERP, hébergement, budget).
5. Diversifier les types de solutions proposées (structuration, automatisation, visualisation, communication...).
6. Chaque outil doit avoir une **raison précise et contextualisée**.
7. Si aucune solution pertinente n'est trouvée, dire "Aucun SaaS adapté trouvé".
8. Le résultat doit être au FORMAT JSON STRICT :

{
  "score": 78,
  "economiesHeures": ${Math.round(monthlyHours)},
  "economiesMensuelles": ${Math.round(monthlySavings)},
  "economiesAnnuelles": ${Math.round(annualSavings)},
  "analysis": "Analyse stratégique ici",
  "recommendations": [
    {
      "id": "recXXXXXX",
      "tool": "Nom du SaaS",
      "reason": "Justification du choix",
      "priority": 1,
      "score": 87
    },
    ...
  ]
}`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en automatisation pour PME. Tu analyses les besoins et recommandes UNIQUEMENT des SaaS de la liste fournie. Format de réponse: JSON uniquement, sans markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 800,
      }),
    });

    console.log('🤖 AI raw response:', await openAIResponse.clone().json());

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', openAIResponse.status, await openAIResponse.text());
      
      // Create intelligent fallback recommendations from available SaaS
      const intelligentFallback = saasData.items
        .filter((saas: any) => saas.automation >= 70) // High automation
        .sort((a: any, b: any) => (b.automation || 0) - (a.automation || 0)) // Sort by automation desc
        .slice(0, 3) // Take top 3
        .map((saas: any, index: number) => ({
          id: saas.id,
          tool: saas.name,
          reason: `${saas.name} automatise efficacement les processus répétitifs avec ${saas.automation}% d'automatisation.`,
          priority: index + 1,
          score: Math.max(75, saas.automation || 75),
          saasData: saas
        }));

      console.log(`🔄 Created ${intelligentFallback.length} intelligent fallback recommendations`);

      return new Response(JSON.stringify({
        score: 75,
        economiesHeures: 10,
        economiesMensuelles: 210, // 10h × 21€
        economiesAnnuelles: 2520, // 210€ × 12 mois
        analysis: "Solutions d'automatisation identifiées basées sur votre profil. Ces outils offrent un potentiel d'automatisation élevé.",
        recommendations: intelligentFallback
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiResult = await openAIResponse.json();
    const content = aiResult.choices[0].message.content;
    
    console.log('🔍 AI content preview:', content.substring(0, 200));

    let aiRecommendations;
    try {
      aiRecommendations = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Use intelligent fallback
      const intelligentFallback = saasData.items
        .filter((saas: any) => saas.automation >= 70)
        .sort((a: any, b: any) => (b.automation || 0) - (a.automation || 0))
        .slice(0, 3)
        .map((saas: any, index: number) => ({
          id: saas.id,
          tool: saas.name,
          reason: `${saas.name} offre ${saas.automation}% d'automatisation pour optimiser vos processus.`,
          priority: index + 1,
          score: Math.max(75, saas.automation || 75),
          saasData: saas
        }));

      return new Response(JSON.stringify({
        score: 75,
        economiesHeures: 10,
        economiesMensuelles: 210,
        economiesAnnuelles: 2520,
        analysis: "Recommendations générées automatiquement basées sur l'automatisation disponible.",
        recommendations: intelligentFallback
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ AI Response parsed successfully. Recommendations found:', aiRecommendations.recommendations?.length || 0);

    // Validate recommendations and enrich with SaaS data
    const validRecommendations = [];
    const invalidIds = [];

    for (const rec of aiRecommendations.recommendations || []) {
      const saasItem = saasData.items.find((s: any) => s.id === rec.id);
      if (saasItem) {
        validRecommendations.push({
          ...rec,
          saasData: saasItem
        });
      } else {
        invalidIds.push(rec.id);
        console.warn(`Invalid SaaS recommendation with ID ${rec.id} - not found in Airtable`);
      }
    }

    console.log(`🔍 Validation Results: ${validRecommendations.length}/${aiRecommendations.recommendations?.length || 0} recommendations are valid`);

    if (validRecommendations.length === 0) {
      console.log('⚠️ FALLBACK: IA n\'a trouvé aucun SaaS valide. Recherche d\'alternatives...');
      
      // Create intelligent fallback based on diagnostic data
      const intelligentFallback = saasData.items
        .filter((saas: any) => saas.automation >= 70)
        .sort((a: any, b: any) => (b.automation || 0) - (a.automation || 0))
        .slice(0, 3)
        .map((saas: any, index: number) => ({
          id: saas.id,
          tool: saas.name,
          reason: `${saas.name} automatise ${saas.automation}% des processus similaires à votre besoin.`,
          priority: index + 1,
          score: Math.max(75, saas.automation || 75),
          saasData: saas
        }));

      console.log(`✅ FALLBACK: ${intelligentFallback.length} recommandations générées automatiquement`);
      
      return new Response(JSON.stringify({
        ...aiRecommendations,
        recommendations: intelligentFallback
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return the enhanced recommendations
    return new Response(JSON.stringify({
      ...aiRecommendations,
      recommendations: validRecommendations
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in get-ai-recommendations function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate recommendations', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});