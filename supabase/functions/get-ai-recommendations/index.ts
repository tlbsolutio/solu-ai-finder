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

Ta mission est d'analyser les réponses du diagnostic ci-dessous et de recommander OBLIGATOIREMENT des outils SaaS **parmi la base fournie uniquement**.

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

IMPORTANT: Voici les SaaS disponibles - TU DOIS ABSOLUMENT CHOISIR PARMI EUX :

${saasListForAI}

---

RÈGLES STRICTES :
1. OBLIGATOIRE: MINIMUM 2 outils SaaS parmi cette base (IMPÉRATIF)
2. Maximum 5 outils
3. Utilise UNIQUEMENT les ID (rec...) fournis ci-dessus - JAMAIS d'invention
4. Si correspondance imparfaite, choisis quand même 2 outils les PLUS PROCHES
5. JAMAIS d'outils externes (Power BI, Google Data Studio, Monday.com, etc.)
6. Privilégie les SaaS avec un % d'automatisation élevé
7. GARANTIE: Tu DOIS toujours retourner exactement 2-5 recommandations

CALCUL DES ÉCONOMIES :
- Salaire brut moyen français : 21€/heure
- Calcul : économiesHeures × 21 = économiesMensuelles
- Calcul : économiesMensuelles × 12 = économiesAnnuelles

EXEMPLES DE CORRESPONDANCES FLEXIBLES :
- "CRM" → Recherche "contact", "client", "vente" dans les descriptions
- "Facturation" → Recherche "facture", "comptabilité", "finance"
- "Gestion projet" → Recherche "projet", "tâche", "équipe"
- "Rapports" → Recherche outils avec "analyse", "reporting", "data"

Tu réponds uniquement avec un objet JSON contenant :
- recommendations: tableau des outils (MINIMUM 2, même si correspondance imparfaite)
- score: note globale d'automatisation estimée sur 100  
- economiesHeures: estimation du temps économisé / mois (heures)
- economiesMensuelles: économies nettes estimées (€ / mois) = economiesHeures × 21
- economiesAnnuelles: économies nettes estimées (€ / an) = economiesMensuelles × 12
- analysis: résumé d'analyse stratégique (texte court, 2 phrases max)

FORMAT DE RÉPONSE JSON OBLIGATOIRE:
{
  "score": 75,
  "economiesHeures": 8,
  "economiesMensuelles": 168,
  "economiesAnnuelles": 2016,
  "analysis": "La tâche décrite est automatisable. Les outils recommandés permettent un gain de productivité.",
  "recommendations": [
    {
      "id": "rec123456",
      "tool": "Nom du SaaS",
      "reason": "Pourquoi ce SaaS est recommandé pour cette tâche",
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
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: `Tu es un expert consultant en automatisation SaaS chez Solutio. RÈGLES CRITIQUES:
1. Tu DOIS absolument choisir uniquement parmi les SaaS présents dans la base fournie (avec ID rec...)
2. N'invente JAMAIS de SaaS qui n'existe pas dans la liste
3. MINIMUM 2 recommandations OBLIGATOIRES (même avec correspondance imparfaite)
4. Si correspondance parfaite impossible, choisis les outils les plus proches par catégorie/usage
5. Réponds exclusivement en JSON valide, sans texte autour ni formatage markdown` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('🤖 AI raw response:', data);
    console.log('🔍 AI content preview:', data.choices[0].message.content.substring(0, 200));

    let aiResponse;
    try {
      const responseContent = data.choices[0].message.content.trim();
      
      // Clean the response if it has markdown formatting
      const cleanContent = responseContent.replace(/```json\n?|\n?```/g, '').trim();
      
      aiResponse = JSON.parse(cleanContent);
      
      console.log(`✅ AI Response parsed successfully. Recommendations found: ${aiResponse.recommendations?.length || 0}`);
      
      // Validate that recommendations only use SaaS from our database
      const validRecommendations = aiResponse.recommendations?.filter(rec => {
        const foundSaaS = allSaas.find(s => s.id === rec.id);
        if (!foundSaaS) {
          console.warn(`Invalid SaaS recommendation with ID ${rec.id} - not found in Airtable`);
          return false;
        }
        return true;
      }) || [];
      
      console.log(`🔍 Validation Results: ${validRecommendations.length}/${aiResponse.recommendations?.length || 0} recommendations are valid`);
      
      if (validRecommendations.length === 0) {
        console.warn('⚠️ FALLBACK: IA n\'a trouvé aucun SaaS valide. Recherche d\'alternatives...');
        
        // Fallback intelligent : chercher les 2 SaaS les plus populaires dans des catégories liées
        const fallbackSaas = [];
        const taskLower = diagnosticData.task.toLowerCase();
        
        // Correspondances par mots-clés vers catégories
        if (taskLower.includes('crm') || taskLower.includes('client') || taskLower.includes('contact')) {
          const crmSaas = allSaas.filter(s => s.categories?.includes('CRM') || s.name?.toLowerCase().includes('crm')).slice(0, 2);
          fallbackSaas.push(...crmSaas);
        }
        if (taskLower.includes('facture') || taskLower.includes('comptabil') || taskLower.includes('finance')) {
          const financeSaas = allSaas.filter(s => s.categories?.includes('Comptabilité') || s.categories?.includes('Finance')).slice(0, 2);
          fallbackSaas.push(...financeSaas);
        }
        if (taskLower.includes('projet') || taskLower.includes('gestion') || taskLower.includes('tâche')) {
          const projectSaas = allSaas.filter(s => s.categories?.includes('Gestion de projet') || s.categories?.includes('Productivité')).slice(0, 2);
          fallbackSaas.push(...projectSaas);
        }
        
        // Si toujours aucun résultat, prendre les 2 premiers SaaS génériques
        if (fallbackSaas.length === 0) {
          fallbackSaas.push(...allSaas.slice(0, 2));
        }
        
        // Créer des recommandations de fallback
        const fallbackRecommendations = fallbackSaas.slice(0, 2).map((saas, index) => ({
          id: saas.id,
          tool: saas.name,
          reason: "Solution générique recommandée pour l'automatisation de tâches similaires",
          priority: index + 1,
          score: 60 + index * 5
        }));
        
        console.log(`✅ FALLBACK: ${fallbackRecommendations.length} recommandations générées automatiquement`);
        console.log('📋 Fallback recommendations:', fallbackRecommendations.map(r => `${r.tool} (${r.id})`));
        
        return new Response(JSON.stringify({
          score: 60,
          economiesHeures: 8,
          economiesMensuelles: 168, // 8h × 21€
          economiesAnnuelles: 2016, // 168€ × 12 mois
          analysis: "Solutions génériques identifiées. Un entretien avec nos experts permettrait d'affiner ces recommandations.",
          recommendations: fallbackRecommendations
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      aiResponse.recommendations = validRecommendations;
      console.log(`✅ Final AI Response: ${validRecommendations.length} valid recommendations confirmed`);
      
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
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return new Response(JSON.stringify({ 
      error: error.message,
      message: 'Service de recommandations temporairement indisponible. Veuillez réessayer dans quelques minutes.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});