import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Fetch SaaS data from Airtable
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
      console.warn('Failed to fetch SaaS data:', response.status);
      return [];
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.items?.length || 0} SaaS items from Airtable`);
    return data.items || [];
  } catch (error) {
    console.warn('Error fetching SaaS data:', error);
    return [];
  }
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

    // Fetch all available SaaS from Airtable
    const allSaas = await fetchSaasFromAirtable();
    
    // Create a comprehensive list of available SaaS for the AI
    const saasListForAI = allSaas.map(s => 
      `- ${s.name} (ID: ${s.id}): ${s.tagline || s.description} (Automation: ${s.automation}%, Ease: ${s.ease}%, Price: ${s.priceText})`
    ).join('\n');

    const prompt = `Tu es un consultant expert en automatisation d'entreprise chez Solutio. Analyse ce diagnostic client en profondeur et recommande UNIQUEMENT des solutions SaaS présentes dans ma base de données Airtable.

DIAGNOSTIC CLIENT:
- Tâche à automatiser: ${diagnosticData.task}
- Fréquence: ${diagnosticData.frequency}  
- Secteur et contraintes: ${diagnosticData.sector}
- Outils actuels: ${diagnosticData.tools}
- Résultat attendu: ${diagnosticData.expectedResult}
- Contraintes spécifiques: ${diagnosticData.constraints}
- Priorité (1-5): ${diagnosticData.priority}

CATALOGUE SAAS DISPONIBLE EXCLUSIVEMENT:
${saasListForAI}

INSTRUCTIONS CRITIQUES:
1. RÈGLE ABSOLUE: Recommande UNIQUEMENT parmi les SaaS listés ci-dessus avec leurs IDs exacts (recXXXX)
2. INTERDIT ABSOLU: Ne recommande JAMAIS Zapier, Monday.com, HubSpot, ou autres SaaS génériques s'ils ne sont pas dans la liste
3. Nombre de recommandations: EXACTEMENT 3-4 SaaS pertinents (qualité > quantité)
4. Calcul intelligent du temps économisé:
   - Analyse la tâche "${diagnosticData.task}" et la fréquence "${diagnosticData.frequency}"
   - Estime le temps actuel réaliste par tâche (ex: rapport = 8h, saisie données = 2h, emails = 1h)
   - Calcule le potentiel d'automatisation selon le SaaS (60-90% selon la solution)
   - Multiplie par la fréquence mensuelle réelle
5. Calcul ROI personnalisé:
   - Utilise un taux horaire de 45€/h (coût employé France)
   - Soustrait le coût réel du SaaS recommandé (utilise les prix Airtable)
   - Calcule le ROI annuel réaliste
6. Score d'automatisation intelligent (75-95%):
   - Secteur réglementé: -10 points
   - Tâches quotidiennes: +15 points
   - Outils manuels actuels: +20 points
   - Contraintes techniques: -5 points

EXEMPLE DE CALCUL:
Si tâche = "création rapports mensuels", fréquence = "mensuel", temps actuel = 8h
- Temps économisé avec un bon SaaS: 6h/mois (75% automatisation)
- Économies brutes: 6h × 45€ = 270€/mois
- Coût SaaS: 50€/mois
- Économies nettes: 220€/mois × 12 = 2640€/an
- ROI: 428%

FORMAT DE RÉPONSE JSON OBLIGATOIRE:
{
  "score": 85,
  "economiesHeures": 20,
  "economiesMensuelles": 1250,
  "economiesAnnuelles": 15000,
  "recommendations": [
    {
      "name": "Nom EXACT du SaaS depuis Airtable",
      "id": "ID Airtable EXACT (recXXXXX)",
      "reason": "Analyse détaillée de 120-150 mots expliquant la correspondance précise avec le besoin, calculs de temps économisé, avantages spécifiques pour ce secteur",
      "priority": 1,
      "automationScore": 85,
      "estimatedMonthlyCost": 45,
      "estimatedROI": "320%",
      "timesSavedPerMonth": 15
    }
  ],
  "analysis": "Analyse stratégique de consultant de 200+ mots sur l'automatisation dans ce contexte, obstacles potentiels, plan d'implémentation recommandé et justification du choix des SaaS"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: 'Tu es un expert consultant en automatisation SaaS chez Solutio. Réponds uniquement en JSON valide avec les noms exacts des SaaS fournis. Garantis minimum 3 recommandations pertinentes.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    let aiResponse;
    try {
      const responseContent = data.choices[0].message.content.trim();
      
      // Clean the response if it has markdown formatting
      const cleanContent = responseContent.replace(/```json\n?|\n?```/g, '').trim();
      
      aiResponse = JSON.parse(cleanContent);
      
      // Validate that recommendations only use SaaS from our database
      const validRecommendations = aiResponse.recommendations?.filter(rec => {
        const foundSaaS = allSaas.find(s => s.id === rec.id);
        if (!foundSaaS) {
          console.warn(`Invalid SaaS recommendation with ID ${rec.id} - not found in Airtable`);
          return false;
        }
        return true;
      }) || [];
      
      if (validRecommendations.length === 0) {
        throw new Error('No valid recommendations found - all recommended SaaS are missing from database');
      }
      
      aiResponse.recommendations = validRecommendations;
      console.log(`Validated ${validRecommendations.length} recommendations from AI`);
      
    } catch (e) {
      console.error('Failed to parse or validate AI response:', e);
      console.error('Original response:', data.choices[0].message.content);
      
      // If AI fails completely, return error instead of fallback
      throw new Error('AI recommendation service temporarily unavailable. Please try again.');
    }

    // Enrich recommendations with detailed SaaS data from Airtable
    const enrichedRecommendations = aiResponse.recommendations.map((rec: any) => {
      // Find SaaS data using the exact ID provided by AI
      const saasData = allSaas.find(s => s.id === rec.id);
      
      if (!saasData) {
        console.error(`Critical error: SaaS with ID ${rec.id} not found in database`);
        throw new Error(`Recommended SaaS ${rec.name} (${rec.id}) not found in database`);
      }
      
      console.log(`Successfully matched SaaS ${rec.name} with ID ${rec.id}`);
      
      return {
        ...rec,
        name: saasData.name, // Use exact name from database
        id: saasData.id,
        saasData: {
          name: saasData.name,
          tagline: saasData.tagline,
          description: saasData.description,
          logoUrl: saasData.logoUrl,
          categories: saasData.categories,
          pros: saasData.pros,
          cons: saasData.cons,
          features: saasData.features,
          automation: saasData.automation,
          ease: saasData.ease,
          score: saasData.score,
          website: saasData.website,
          trialUrl: saasData.trialUrl,
          affiliate: saasData.affiliate,
          pricingLinked: saasData.pricingLinked,
          priceText: saasData.priceText
        }
      };
    });

    const finalResponse = {
      ...aiResponse,
      recommendations: enrichedRecommendations
    };

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-ai-recommendations function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: 'Service de recommandations temporairement indisponible. Veuillez réessayer dans quelques minutes.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});