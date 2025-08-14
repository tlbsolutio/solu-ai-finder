import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val === null || val === undefined) return [] as T[];
  return [val as T];
}

function pick<T = any>(fields: Record<string, any>, keys: string[]): T | undefined {
  for (const k of keys) {
    if (fields[k] !== undefined && fields[k] !== null && fields[k] !== "") {
      return fields[k] as T;
    }
  }
  return undefined;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const isGet = req.method === 'GET';

    let baseId = url.searchParams.get('baseId') || '';
    let table = url.searchParams.get('table') || '';
    let view = url.searchParams.get('view') || '';
    let path = url.searchParams.get('path') || '';
    let uiUrl = url.searchParams.get('uiUrl') || '';

    if (!isGet) {
      const body = await req.json().catch(() => ({}));
      baseId = body.baseId || baseId;
      table = body.table || table;
      view = body.view || view;
      path = body.path || path;
      uiUrl = body.uiUrl || uiUrl;
    }

    // If a UI URL is provided, parse base/table/view IDs from it
    if (!baseId && uiUrl) {
      try {
        const parts = new URL(uiUrl).pathname.split('/').filter(Boolean);
        // Expecting: /app.../tbl.../viw...
        const appPart = parts.find(p => p.startsWith('app'));
        const tblPart = parts.find(p => p.startsWith('tbl'));
        const viwPart = parts.find(p => p.startsWith('viw'));
        if (appPart) baseId = appPart;
        if (tblPart) table = tblPart;
        if (viwPart) view = viwPart;
      } catch (e) {
        console.warn('Failed to parse uiUrl:', e);
      }
    }

    // Fallback to secrets if still missing
    if (!baseId) {
      const envBase = Deno.env.get('AIRTABLE_BASE_ID') || '';
      const envTable = Deno.env.get('AIRTABLE_TABLE_ID') || '';
      const envView = Deno.env.get('AIRTABLE_VIEW_ID') || '';
      if (envBase) {
        baseId = envBase;
        if (!table) table = envTable;
        if (!view) view = envView;
      }
    }

    // Build Airtable endpoint path segment after baseId
    if (!baseId) {
      return new Response(JSON.stringify({ error: 'Missing Airtable baseId. Provide uiUrl or configure AIRTABLE_BASE_ID.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tableSegment = path || table;
    if (!tableSegment) {
      return new Response(JSON.stringify({ error: 'Missing Airtable table. Provide uiUrl, table/path parameter, or configure AIRTABLE_TABLE_ID.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const params = new URLSearchParams();
    params.set('pageSize', '50');
    if (view) params.set('view', view);

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableSegment)}?${params.toString()}`;

    // Resolve API key from secrets (support both conventional and legacy names)
    const apiKey = Deno.env.get('AIRTABLE_API_KEY') || Deno.env.get('Airtable API') || '';
    if (!apiKey) {
      console.error('Missing Airtable API key (AIRTABLE_API_KEY).');
      return new Response(
        JSON.stringify({
          error: 'Missing Airtable API key',
          details: 'Configure AIRTABLE_API_KEY (Personal Access Token) in Supabase secrets with data.records:read scope and access to the base.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Airtable request', {
      baseId,
      table: tableSegment,
      view,
      hasKey: true,
      keyLen: apiKey.length,
    });

    const airtableResp = await fetch(airtableUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!airtableResp.ok) {
      const errText = await airtableResp.text();
      console.error('Airtable error:', airtableResp.status, errText);
      if (airtableResp.status === 401) {
        return new Response(
          JSON.stringify({
            error: 'Airtable authentication failed',
            details: 'Invalid or insufficient token. Ensure AIRTABLE_API_KEY has data.records:read scope and access to the base.',
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(JSON.stringify({ error: 'Failed to fetch from Airtable', details: errText }), {
        status: airtableResp.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const airtableData = await airtableResp.json();
    const records = airtableData.records || [];

    // Extract all SaaS record IDs for batch pricing fetch
    const saasIds = records.map((r: any) => r.id);
    
    // Fetch ALL pricing records from tbl5qcovjk1Id7Hj5 that link to any of these SaaS
    const fetchAllPricingPlans = async () => {
      if (saasIds.length === 0) return [];
      
      try {
        // Build filterByFormula to match ANY SaaS in the "SaaS lié" field
        const filterFormula = `OR(${saasIds.map(id => `SEARCH("${id}", ARRAYJOIN({SaaS lié}))`).join(',')})`;
        
        const pricingParams = new URLSearchParams();
        pricingParams.set('view', 'viwxJnfTzP1MqTcXu');
        pricingParams.set('filterByFormula', filterFormula);
        pricingParams.set('pageSize', '100');
        
        // Only fetch necessary fields
        ['Nom du plan', 'Prix', 'Fonctionnalités incluses', 'Populaire', 'SaaS lié'].forEach(field => {
          pricingParams.append('fields[]', field);
        });
        
        const pricingUrl = `https://api.airtable.com/v0/${baseId}/tbl5qcovjk1Id7Hj5?${pricingParams.toString()}`;
        
        console.log('Fetching pricing plans with formula:', filterFormula);
        
        const pricingResp = await fetch(pricingUrl, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!pricingResp.ok) {
          console.warn('Failed to fetch pricing data:', pricingResp.status, await pricingResp.text());
          return [];
        }
        
        const pricingData = await pricingResp.json();
        console.log(`Fetched ${pricingData.records?.length || 0} pricing records from tbl5qcovjk1Id7Hj5`);
        
        return pricingData.records || [];
      } catch (error) {
        console.warn('Error fetching pricing records:', error);
        return [];
      }
    };

    const allPricingRecords = await fetchAllPricingPlans();
    
    // Group pricing records by SaaS ID
    const pricingBySaasId = new Map<string, any[]>();
    allPricingRecords.forEach((pr: any) => {
      const fields = pr.fields || {};
      const linkedSaasIds = toArray<string>(fields['SaaS lié'] || []);
      
      linkedSaasIds.forEach(saasId => {
        if (!pricingBySaasId.has(saasId)) {
          pricingBySaasId.set(saasId, []);
        }
        pricingBySaasId.get(saasId)!.push(pr);
      });
    });

    console.log(`Processed pricing for ${pricingBySaasId.size} SaaS items with ${allPricingRecords.length} total plans`);

    const mapped = records.map((r: any) => {
      const f = r.fields || {};
      const name = pick<string>(f, ['Nom', 'name', 'Name', 'Titre', 'Title']) || '';
      const tagline = pick<string>(f, ['Tagline', 'tagline', 'Slogan']) || '';
      const description = pick<string>(f, ['Description', 'description', 'Desc']) || '';
      const categories = toArray<string>(pick<string | string[]>(f, ['Catégorie', 'category', 'Categorie', 'Category']) || []);
      const targets = toArray<string>(pick<string | string[]>(f, ['Cibles', 'targets', 'Targets']) || []);
      const score = Number(pick<number | string>(f, ['Note', 'score', 'Rating']) || 0);
      const automation = Number(pick<number | string>(f, ['Automatisation (%)', 'automation', 'Automatisation', 'Automation']) || 0);
      const ease = Number(pick<number | string>(f, ['Facilité (/100)', 'Facilité', 'ease', 'Facilite', 'Ease']) || 0);
      const priceText = pick<string>(f, ['Prix affiché', 'price', 'Prix', 'Tarif', 'Pricing']) || '';
      const features = toArray<string>(pick<string | string[]>(f, ['Fonctionnalités principales', 'features', 'Fonctionnalités', 'Fonctionnalites', 'Features']) || []);
      const useCases = toArray<string>(pick<string | string[]>(f, ['Cas d\'usage', 'use_cases', 'Cas usage', 'Use cases']) || []);
      const pros = toArray<string>(pick<string | string[]>(f, ['Avantages', 'pros', 'Advantages']) || []);
      const cons = toArray<string>(pick<string | string[]>(f, ['Inconvénients', 'cons', 'Inconvenients', 'Disadvantages']) || []);
      const website = pick<string>(f, ['Site web', 'website', 'Website', 'URL']) || '';
      const affiliate = pick<string>(f, ['Lien d\'affiliation', 'affiliate_link', 'Affiliate']) || '';
      const trialUrl = pick<string>(f, ['Bouton Essayer gratuitement', 'free_trial_link', 'Try Free', 'Free Trial']) || '';

      // Logo: prioritize URL, then attachment
      let logoUrl = pick<string>(f, ['Logo (URL ou attachement)', 'image', 'Image', 'Logo', 'logo', 'Image URL']) || '';
      if (!logoUrl) {
        const att = pick<any[]>(f, ['Logo (URL ou attachement)', 'Logo', 'Image', 'Attachments', 'Attachment']);
        if (Array.isArray(att) && att.length > 0 && att[0]?.url) {
          logoUrl = att[0].url;
        }
      }

      // Get pricing plans linked to this SaaS
      const linkedPricingRecords = pricingBySaasId.get(r.id) || [];
      const pricingLinked = linkedPricingRecords.map((pr: any) => {
        const pf = pr.fields || {};
        return {
          id: pr.id,
          plan: pf['Nom du plan'] || '',
          price: pf['Prix'] || '',
          included: toArray<string>(pf['Fonctionnalités incluses'] || []),
          popular: Boolean(pf['Populaire'] || false),
        };
      });

      return {
        id: r.id,
        name,
        tagline,
        description,
        categories,
        targets,
        score,
        automation,
        ease,
        priceText,
        features,
        useCases,
        pros,
        cons,
        logoUrl,
        website,
        trialUrl,
        affiliate,
        pricingLinked,
      };
    });

    return new Response(JSON.stringify({ items: mapped }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('get-saas-from-airtable error:', e);
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
