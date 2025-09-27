import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { page_name, goal, audience, target_keywords } = await req.json();

    console.log('Generating SEO content for:', { page_name, goal, audience, target_keywords });

    if (!page_name || !goal || !audience || !target_keywords) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: page_name, goal, audience, target_keywords' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are an expert SEO strategist and SaaS copywriter.
You will generate optimized metadata and content for Solutio (https://solutio.work), a SaaS comparison and automation platform dedicated to SMEs, freelancers, and startups.
The output must always be in **valid JSON format** with no explanations.

## INPUT (from user):
- Page name: ${page_name}
- Goal: ${goal}
- Audience: ${audience}
- Target keywords: ${Array.isArray(target_keywords) ? target_keywords.join(', ') : target_keywords}

## OUTPUT (JSON):

{
  "slug": "SEO-friendly URL in kebab-case, short and clear. Example: /comparateur-saas",
  "seo_title": "Max 60 characters. Must include at least one target keyword and one user benefit.",
  "meta_description": "Max 160 characters. Compelling summary including target keyword + user benefit + clear call-to-action.",
  "h1": "Main headline for the page. Clear, keyword-rich, human-readable, and engaging.",
  "intro_text": "100–150 words. Natural SEO copywriting that explains the page value for the target audience. Must include at least 2–3 of the target keywords, but remain fluid and engaging.",
  "cta": "One short Call-to-Action phrase. Example: 'Start your free diagnostic' or 'Compare SaaS tools now'.",
  "seo_keywords": ["3–5 exact target keywords used within the copy, in lowercase"]
}

## RULES:
- Respect all character limits strictly for seo_title and meta_description.
- Always write in a professional, clear, and benefit-driven tone.
- Do NOT output any explanations, comments, or text outside the JSON.
- Each JSON key must always be present, even if empty.
- Use natural, human-first language while ensuring keywords are integrated.
- Write in French for French keywords, English for English keywords.

Generate the SEO content now:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert SEO content generator. You always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Generated content:', generatedContent);

    // Parse and validate the JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    const requiredFields = ['slug', 'seo_title', 'meta_description', 'h1', 'intro_text', 'cta', 'seo_keywords'];
    for (const field of requiredFields) {
      if (!parsedContent[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate character limits
    if (parsedContent.seo_title.length > 60) {
      console.warn('SEO title exceeds 60 characters');
    }
    
    if (parsedContent.meta_description.length > 160) {
      console.warn('Meta description exceeds 160 characters');
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-seo-content function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});