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

    const prompt = `Tu es un expert en automatisation de processus pour les PME et indépendants.

Ta mission est d'analyser les réponses du diagnostic ci-dessous et de recommander uniquement des outils SaaS **parmi la base fournie**, jamais d'autres.

---

Réponses utilisateur :

Tâche : ${diagnosticData.task}
Fréquence : ${diagnosticData.frequency}
Secteur : ${diagnosticData.sector}
Outils actuels : ${diagnosticData.tools}
Résultat attendu : ${diagnosticData.expectedResult}
Contraintes : ${diagnosticData.constraints}
Priorité : ${diagnosticData.priority}/5

---

Voici les SaaS disponibles (format JSON) :

${JSON.stringify(allSaas, null, 2)}

---

Règles :
1. Choisis 3 à 5 outils SaaS maximum parmi cette base
2. Chaque outil doit être **pertinent avec la tâche décrite**
3. Si aucun outil ne correspond, ne propose rien
4. Retourne les outils sous le format suivant :

Inclure un champ score représentant le potentiel d'automatisation (sur 100)

Ne pas inventer d'outils, ne pas inclure Power BI, Google Data Studio, etc.

Tu réponds uniquement avec un objet JSON contenant :
- recommendations: tableau des outils comme ci-dessus
- score: note globale d'automatisation estimée sur 100
- economiesHeures: estimation du temps économisé / mois (heures)
- economiesMensuelles: économies nettes estimées (€ / mois)
- economiesAnnuelles: économies nettes estimées (€ / an)
- analysis: résumé d'analyse stratégique (texte court, 2 phrases max)

FORMAT DE RÉPONSE JSON OBLIGATOIRE:
{
  "score": 75,
  "economiesHeures": 8,
  "economiesMensuelles": 220,
  "economiesAnnuelles": 2640,
  "analysis": "La tâche décrite est fortement automatisable. Les outils recommandés permettent un gain de productivité rapide.",
  "recommendations": [
    {
      "id": "rec123456",
      "tool": "Nom du SaaS",
      "reason": "Pourquoi ce SaaS est recommandé",
      "priority": 1,
      "score": 88
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-1106-preview',
        messages: [
          { role: 'system', content: 'Tu es un expert consultant en automatisation SaaS chez Solutio. Réponds uniquement en JSON valide avec les noms exacts des SaaS fournis. Garantis minimum 3 recommandations pertinentes.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
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
        throw new Error(`Recommended SaaS ${rec.tool} (${rec.id}) not found in database`);
      }
      
      console.log(`Successfully matched SaaS ${rec.tool} with ID ${rec.id}`);
      
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