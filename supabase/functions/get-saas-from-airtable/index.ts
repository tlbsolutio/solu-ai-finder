import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val === null || val === undefined) return [] as T[];
  
  // Handle comma-separated strings from Airtable
  if (typeof val === 'string') {
    return val
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0) as T[];
  }
  
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

    // Fetch all records with pagination
    const allRecords = [];
    let offset = '';
    let pageCount = 0;
    const MAX_PAGES = 10; // Safety limit to prevent infinite loops

    do {
      const params = new URLSearchParams();
      params.set('pageSize', '100'); // Maximum allowed by Airtable
      if (view) params.set('view', view);
      if (offset) params.set('offset', offset);

      const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableSegment)}?${params.toString()}`;

      console.log(`Fetching page ${pageCount + 1} from Airtable...`);

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
      const pageRecords = airtableData.records || [];
      
      allRecords.push(...pageRecords);
      offset = airtableData.offset || '';
      pageCount++;

      console.log(`Page ${pageCount}: fetched ${pageRecords.length} records, total so far: ${allRecords.length}`);
      
      // Safety check to prevent infinite loops
      if (pageCount >= MAX_PAGES) {
        console.warn(`Reached maximum page limit (${MAX_PAGES}), stopping pagination`);
        break;
      }
    } while (offset);

    console.log(`Pagination complete: ${allRecords.length} total SaaS records fetched in ${pageCount} pages`);
    const records = allRecords;

    // Extract all SaaS record IDs for batch pricing fetch
    const saasIds = records.map((r: any) => r.id);
    console.log(`Found ${records.length} SaaS records:`, saasIds);
    
    // Fetch ALL pricing records from tbl5qcovjk1Id7Hj5 that link to any of these SaaS
    const fetchAllPricingPlans = async () => {
      if (saasIds.length === 0) {
        console.log('No SaaS IDs found, skipping pricing fetch');
        return [];
      }
      
      try {
        // First, try to fetch ALL pricing records to debug field names
        const debugParams = new URLSearchParams();
        debugParams.set('view', 'viwxJnfTzP1MqTcXu');
        debugParams.set('pageSize', '5'); // Small sample for debugging
        
        const debugUrl = `https://api.airtable.com/v0/${baseId}/tbl5qcovjk1Id7Hj5?${debugParams.toString()}`;
        console.log('Debug: Fetching sample pricing records from:', debugUrl);
        
        const debugResp = await fetch(debugUrl, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (debugResp.ok) {
          const debugData = await debugResp.json();
          console.log('Debug: Sample pricing record fields:', 
            debugData.records?.[0] ? Object.keys(debugData.records[0].fields || {}) : 'No records found'
          );
          if (debugData.records?.[0]?.fields) {
            console.log('Debug: Full sample record:', JSON.stringify(debugData.records[0].fields, null, 2));
          }
        }
        
        // Now try multiple possible field names for the SaaS link
        const possibleLinkFields = ['SaaS lié', 'Saas lié', 'SaaS liés', 'Saas liés', 'SaaS', 'Saas'];
        
        for (const linkField of possibleLinkFields) {
          console.log(`Trying to fetch pricing with link field: "${linkField}"`);
          
          // Build filterByFormula to match ANY SaaS in the link field
          const filterFormula = `OR(${saasIds.map(id => `SEARCH("${id}", ARRAYJOIN({${linkField}}))`).join(',')})`;
          
          const pricingParams = new URLSearchParams();
          pricingParams.set('view', 'viwxJnfTzP1MqTcXu');
          pricingParams.set('filterByFormula', filterFormula);
          pricingParams.set('pageSize', '100');
          
          const pricingUrl = `https://api.airtable.com/v0/${baseId}/tbl5qcovjk1Id7Hj5?${pricingParams.toString()}`;
          
          console.log(`Fetching pricing plans with formula (${linkField}):`, filterFormula);
          
          const pricingResp = await fetch(pricingUrl, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!pricingResp.ok) {
            console.warn(`Failed to fetch pricing data with ${linkField}:`, pricingResp.status, await pricingResp.text());
            continue;
          }
          
          const pricingData = await pricingResp.json();
          const recordCount = pricingData.records?.length || 0;
          console.log(`Fetched ${recordCount} pricing records using "${linkField}" field`);
          
          if (recordCount > 0) {
            console.log('Success! Found pricing records with field:', linkField);
            return pricingData.records || [];
          }
        }
        
        // If no filtered results, try getting ALL records as fallback
        console.log('No filtered results found, trying to fetch ALL pricing records as fallback');
        const fallbackParams = new URLSearchParams();
        fallbackParams.set('view', 'viwxJnfTzP1MqTcXu');
        fallbackParams.set('pageSize', '100');
        
        const fallbackUrl = `https://api.airtable.com/v0/${baseId}/tbl5qcovjk1Id7Hj5?${fallbackParams.toString()}`;
        
        const fallbackResp = await fetch(fallbackUrl, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!fallbackResp.ok) {
          console.warn('Failed to fetch fallback pricing data:', fallbackResp.status, await fallbackResp.text());
          return [];
        }
        
        const fallbackData = await fallbackResp.json();
        console.log(`Fallback: Fetched ${fallbackData.records?.length || 0} total pricing records`);
        
        return fallbackData.records || [];
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
      
      // Try multiple possible field names for the SaaS link
      const linkedSaasIds = toArray<string>(
        pick<string | string[]>(fields, ['SaaS lié', 'Saas lié', 'SaaS liés', 'Saas liés', 'SaaS', 'Saas']) || []
      );
      
      console.log(`Processing pricing record ${pr.id} with linked SaaS IDs:`, linkedSaasIds);
      
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

      // Logo: prioritize URL, then attachment with better error handling
      let logoUrl = pick<string>(f, [
        'Logo (URL ou attachement)', 
        'Logo URL', 
        'logo_url',
        'image', 
        'Image', 
        'Logo', 
        'logo'
      ]) || '';
      
      if (!logoUrl) {
        const att = pick<any[]>(f, [
          'Logo (URL ou attachement)', 
          'Logo', 
          'Image', 
          'Attachments', 
          'Attachment',
          'logo',
          'images'
        ]);
        if (Array.isArray(att) && att.length > 0 && att[0]?.url) {
          logoUrl = att[0].url;
        }
      }
      
      console.log(`Logo for ${name} (${r.id}): ${logoUrl || 'No logo found'}`);
      
      // Ensure logo URL is valid and accessible
      if (logoUrl && !logoUrl.startsWith('http')) {
        logoUrl = '';
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
      }).sort((a, b) => {
        // Sort by popular first, then by price (convert price strings to numbers for sorting)
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        
        // Extract numbers from price strings for comparison
        const priceA = parseFloat(a.price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        const priceB = parseFloat(b.price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        
        return priceA - priceB;
      });
      
      console.log(`SaaS ${r.id} (${name}) has ${pricingLinked.length} pricing plans:`, 
        pricingLinked.map(p => `${p.plan}: ${p.price} ${p.popular ? '(Popular)' : ''}`));

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
