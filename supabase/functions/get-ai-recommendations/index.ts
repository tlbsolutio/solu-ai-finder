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
      `- ${s.name}: ${s.tagline || s.description} (Automation: ${s.automation}%, Ease: ${s.ease}%, Price: ${s.priceText})`
    ).join('\n');

    const prompt = `Tu es un consultant expert en automatisation d'entreprise chez Solutio. Analyse ce diagnostic client et recommande OBLIGATOIREMENT au moins 3 solutions SaaS pertinentes, idéalement 4-5 solutions.

DIAGNOSTIC CLIENT:
- Tâche à automatiser: ${diagnosticData.task}
- Fréquence: ${diagnosticData.frequency}  
- Secteur et contraintes: ${diagnosticData.sector}
- Outils actuels: ${diagnosticData.tools}
- Résultat attendu: ${diagnosticData.expectedResult}
- Contraintes spécifiques: ${diagnosticData.constraints}
- Priorité (1-5): ${diagnosticData.priority}

SOLUTIONS SAAS DISPONIBLES:
${saasListForAI}

INSTRUCTIONS CRITIQUES:
1. OBLIGATOIRE: Recommande EXACTEMENT 4-5 solutions SaaS pertinentes (jamais moins de 4)
2. Analyse experte du secteur "${diagnosticData.sector}" avec contraintes "${diagnosticData.constraints}"
3. Pour chaque SaaS recommandé:
   - Correspondance détaillée avec le besoin spécifique (120-180 mots d'analyse)
   - Scoring automatisation personnalisé basé sur la fréquence "${diagnosticData.frequency}" (75-95%)
   - Calcul ROI précis selon les tarifs réels Airtable du SaaS
4. Économies différenciées par SaaS selon secteur et taille d'entreprise
5. Analyse stratégique de consultant expert (250+ mots) sur les enjeux d'automatisation
6. CRITIQUE: Utilise uniquement les noms EXACTS des SaaS de la liste fournie
7. Évite les prix répétitifs - chaque SaaS doit avoir son propre calcul basé sur ses tarifs réels

SCORING PERSONNALISÉ:
- Secteur réglementé (finance, santé): -5 points facilité
- Tâches quotidiennes: +15 points automatisation  
- Outils Excel/manuels: +20 points potentiel
- PME (<50 employés): Privilégier solutions simples
- Grandes entreprises: Privilégier solutions enterprise

FORMAT DE RÉPONSE JSON OBLIGATOIRE:
{
  "score": 85,
  "economiesHeures": 20,
  "recommendations": [
    {
      "name": "Nom exact du SaaS",
      "reason": "Analyse détaillée de 100-150 mots expliquant pourquoi ce SaaS est parfait pour ce besoin spécifique, en tenant compte du secteur, de la fréquence et des contraintes",
      "priority": 1,
      "automationScore": 85,
      "estimatedMonthlyCost": 45,
      "estimatedROI": "300%"
    }
  ],
  "analysis": "Analyse stratégique approfondie de 200+ mots sur les enjeux d'automatisation dans ce secteur, les risques, opportunités et recommandations d'implémentation"
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
      aiResponse = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error('Failed to parse JSON response:', data.choices[0].message.content);
      // Fallback to basic recommendations - ensure minimum 3
      aiResponse = {
        score: 75,
        economiesHeures: 15,
        recommendations: [
          { name: 'Zapier', reason: 'Solution d\'automatisation polyvalente qui peut connecter vos outils existants et automatiser vos workflows répétitifs. Parfait pour commencer l\'automatisation sans compétences techniques.', priority: 1, automationScore: 80, estimatedMonthlyCost: 29, estimatedROI: '200%' },
          { name: 'Monday.com', reason: 'Plateforme de gestion de projet avec automatisations intégrées qui permet de centraliser vos tâches et de créer des workflows automatisés visuellement.', priority: 2, automationScore: 70, estimatedMonthlyCost: 39, estimatedROI: '150%' },
          { name: 'HubSpot', reason: 'CRM gratuit avec automatisations marketing et commerciales intégrées, idéal pour automatiser la gestion client et les suivis commerciaux.', priority: 3, automationScore: 75, estimatedMonthlyCost: 0, estimatedROI: '300%' }
        ],
        analysis: 'Analyse automatique basée sur vos réponses. Ces outils offrent un bon point de départ pour l\'automatisation de vos processus métier avec des interfaces intuitives et des intégrations robustes.'
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
      // Fallback recommendations - ensure minimum 3
      score: 70,
      economiesHeures: 10,
      recommendations: [
        { name: 'Zapier', reason: 'Solution d\'automatisation polyvalente recommandée pour votre contexte', priority: 1, automationScore: 75, estimatedMonthlyCost: 29, estimatedROI: '200%' },
        { name: 'Monday.com', reason: 'Plateforme de gestion avec automatisations adaptée à vos besoins', priority: 2, automationScore: 70, estimatedMonthlyCost: 39, estimatedROI: '150%' },
        { name: 'HubSpot', reason: 'CRM avec automatisations pour optimiser vos processus', priority: 3, automationScore: 75, estimatedMonthlyCost: 0, estimatedROI: '300%' }
      ],
      analysis: 'Analyse de base - erreur lors du traitement IA. Ces recommandations sont basées sur les meilleures pratiques d\'automatisation.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});