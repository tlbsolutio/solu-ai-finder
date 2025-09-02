import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  envisagedAutomations: string;
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
      `- ${s.name}: ${s.tagline || s.description} (Automation: ${s.automation}%, Ease: ${s.ease}%)`
    ).join('\n');

    const prompt = `Tu es un consultant expert en automatisation d'entreprise chez Solutio. Analyse ce diagnostic client et recommande 3-5 solutions SaaS spécifiques parmi celles disponibles.

DIAGNOSTIC CLIENT:
- Tâche à automatiser: ${diagnosticData.task}
- Fréquence: ${diagnosticData.frequency}  
- Secteur: ${diagnosticData.sector}
- Outils actuels: ${diagnosticData.tools}
- Résultat attendu: ${diagnosticData.expectedResult}
- Automatisations envisagées: ${diagnosticData.envisagedAutomations}
- Priorité (1-5): ${diagnosticData.priority}

SOLUTIONS SAAS DISPONIBLES:
${saasListForAI}

INSTRUCTIONS:
1. Analyse le besoin spécifique du client
2. Recommande 3-5 solutions les PLUS pertinentes parmi celles disponibles
3. Explique pourquoi chaque solution correspond exactement au besoin
4. Estime un score d'automatisation réaliste (60-95%)
5. Calcule des économies potentielles (heures/mois)
6. IMPORTANT: Utilise uniquement les noms EXACTS des SaaS de la liste fournie

FORMAT DE RÉPONSE JSON:
{
  "score": 85,
  "economiesHeures": 20,
  "recommendations": [
    {
      "name": "Nom exact du SaaS de la liste",
      "reason": "Explication détaillée pourquoi ce SaaS répond au besoin spécifique",
      "priority": 1,
      "automationScore": 85
    }
  ],
  "analysis": "Analyse personnalisée détaillée du diagnostic"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: 'Tu es un expert consultant en automatisation SaaS chez Solutio. Réponds uniquement en JSON valide avec les noms exacts des SaaS fournis.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 1200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    let aiResponse;
    try {
      aiResponse = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error('Failed to parse JSON response:', data.choices[0].message.content);
      // Fallback to basic recommendations
      aiResponse = {
        score: 75,
        economiesHeures: 15,
        recommendations: [
          { name: 'Zapier', reason: 'Solution d\'automatisation polyvalente adaptée à votre besoin', priority: 1, automationScore: 80 },
          { name: 'Monday.com', reason: 'Plateforme de gestion complète avec automatisations', priority: 2, automationScore: 70 }
        ],
        analysis: 'Analyse automatique basée sur vos réponses'
      };
    }

    // Enrich recommendations with detailed SaaS data from Airtable
    const enrichedRecommendations = aiResponse.recommendations.map((rec: any) => {
      const saasData = allSaas.find(s => 
        s.name.toLowerCase() === rec.name.toLowerCase() ||
        s.name.toLowerCase().includes(rec.name.toLowerCase()) ||
        rec.name.toLowerCase().includes(s.name.toLowerCase())
      );
      
      if (saasData) {
        console.log(`Found SaaS data for ${rec.name}:`, saasData.name);
        return {
          ...rec,
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
      } else {
        console.warn(`No SaaS data found for ${rec.name}`);
        return rec;
      }
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
      // Fallback recommendations
      score: 70,
      economiesHeures: 10,
      recommendations: [
        { tool: 'Zapier', reason: 'Solution d\'automatisation recommandée', priority: 1 }
      ],
      analysis: 'Analyse de base - erreur lors du traitement IA'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});