import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const prompt = `Tu es un consultant expert en automatisation d'entreprise chez Solutio. Analyse ce diagnostic client et recommande 3-5 solutions SaaS spécifiques.

DIAGNOSTIC CLIENT:
- Tâche à automatiser: ${diagnosticData.task}
- Fréquence: ${diagnosticData.frequency}  
- Secteur: ${diagnosticData.sector}
- Outils actuels: ${diagnosticData.tools}
- Résultat attendu: ${diagnosticData.expectedResult}
- Automatisations envisagées: ${diagnosticData.envisagedAutomations}
- Priorité (1-5): ${diagnosticData.priority}

SOLUTIONS SAAS DISPONIBLES:
- Zapier (automatisation workflow)
- Monday.com (gestion projet/CRM)
- HubSpot CRM (CRM/marketing)
- Mailchimp (email marketing)
- Calendly (prise rendez-vous)
- Acuity Scheduling (planification)
- Google Sheets API (données/rapports)
- Notion (documentation/base données)
- Slack (communication équipe)
- Airtable (base données/CRM)
- Typeform (formulaires)
- DocuSign (signature électronique)
- Stripe (paiements)
- Intercom (support client)

INSTRUCTIONS:
1. Analyse le besoin spécifique du client
2. Recommande 3-5 solutions les plus pertinentes
3. Explique pourquoi chaque solution correspond au besoin
4. Estime un score d'automatisation (60-95%)
5. Calcule des économies potentielles (heures/mois)

FORMAT DE RÉPONSE JSON:
{
  "score": 85,
  "economiesHeures": 20,
  "recommendations": [
    {
      "tool": "Zapier",
      "reason": "Idéal pour automatiser [tâche spécifique] via des workflows",
      "priority": 1
    }
  ],
  "analysis": "Résumé de l'analyse personnalisée"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un expert consultant en automatisation SaaS chez Solutio. Réponds uniquement en JSON valide.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

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
          { tool: 'Zapier', reason: 'Solution d\'automatisation polyvalente', priority: 1 },
          { tool: 'Monday.com', reason: 'Gestion de projet et automatisation', priority: 2 }
        ],
        analysis: 'Analyse automatique basée sur vos réponses'
      };
    }

    return new Response(JSON.stringify(aiResponse), {
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