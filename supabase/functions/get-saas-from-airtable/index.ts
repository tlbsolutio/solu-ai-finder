import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// In-memory cache with TTL
interface CacheEntry {
  data: any;
  timestamp: number;
  etag: string;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Performance metrics
const metrics = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  avgResponseTime: 0,
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

// Generate ETag from data
function generateETag(data: any): string {
  const hash = new TextEncoder().encode(JSON.stringify(data));
  return Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

// Check if cache entry is valid
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

// Robust pagination function to get ALL records
async function getAllRecords(baseUrl: string, apiKey: string, maxRecords = 1000): Promise<any[]> {
  const allRecords: any[] = [];
  let offset: string | undefined = undefined;
  let pageCount = 0;
  const maxPages = Math.ceil(maxRecords / 100); // Safety limit

  console.log(`🚀 Starting pagination to fetch ALL records (max ${maxRecords})`);
  
  while (pageCount < maxPages) {
    const params = new URLSearchParams();
    params.set('pageSize', '100'); // Maximum allowed by Airtable
    if (offset) params.set('offset', offset);
    
    const url = `${baseUrl}?${params.toString()}`;
    console.log(`📄 Fetching page ${pageCount + 1}, offset: ${offset || 'none'}`);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Page ${pageCount + 1} failed:`, response.status, await response.text());
      break;
    }

    const data = await response.json();
    const records = data.records || [];
    allRecords.push(...records);
    
    console.log(`✅ Page ${pageCount + 1}: +${records.length} records (total: ${allRecords.length})`);
    
    // Check if there are more pages
    offset = data.offset;
    if (!offset) {
      console.log(`🏁 Pagination complete: ${allRecords.length} total records`);
      break;
    }
    
    pageCount++;
  }

  return allRecords;
}

serve(async (req) => {
  const startTime = performance.now();
  metrics.totalRequests++;

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

    // Create cache key
    const cacheKey = `saas-${baseId}-${tableSegment}-${view}`;
    
    // Check cache first
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && isCacheValid(cachedEntry)) {
      metrics.cacheHits++;
      console.log(`💨 Cache HIT for ${cacheKey} (age: ${(Date.now() - cachedEntry.timestamp) / 1000}s)`);
      
      const responseTime = performance.now() - startTime;
      metrics.avgResponseTime = (metrics.avgResponseTime + responseTime) / 2;
      
      return new Response(JSON.stringify(cachedEntry.data), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'ETag': cachedEntry.etag,
          'Cache-Control': 'public, max-age=300',
          'X-Cache': 'HIT',
          'X-Response-Time': `${responseTime.toFixed(2)}ms`
        },
      });
    }
    
    metrics.cacheMisses++;
    console.log(`💾 Cache MISS for ${cacheKey}`);

    const airtableBaseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableSegment)}`;
    if (view) {
      const viewParam = new URLSearchParams();
      viewParam.set('view', view);
      const fullUrl = `${airtableBaseUrl}?${viewParam.toString()}`;
      console.log(`🎯 Base URL with view: ${fullUrl}`);
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

    console.log('🔄 Starting parallel data fetch:', {
      baseId,
      table: tableSegment,
      view,
      hasKey: true,
      keyLen: apiKey.length,
    });

    // PARALLEL FETCH: SaaS + Pricing data simultaneously
    const [saasRecords, pricingRecords] = await Promise.all([
      // Fetch ALL SaaS records with robust pagination
      (async () => {
        let url = airtableBaseUrl;
        if (view) {
          const params = new URLSearchParams();
          params.set('view', view);
          url = `${airtableBaseUrl}?${params.toString()}`;
        }
        
        console.log('📊 Fetching SaaS records...');
        return await getAllRecords(url, apiKey);
      })(),
      
      // Fetch ALL pricing records in parallel
      (async () => {
        try {
          console.log('💰 Fetching pricing records...');
          const pricingBaseUrl = `https://api.airtable.com/v0/${baseId}/tbl5qcovjk1Id7Hj5`;
          const params = new URLSearchParams();
          params.set('view', 'viwxJnfTzP1MqTcXu');
          const pricingUrl = `${pricingBaseUrl}?${params.toString()}`;
          
          return await getAllRecords(pricingUrl, apiKey);
        } catch (error) {
          console.warn('⚠️ Pricing fetch failed:', error);
          return [];
        }
      })()
    ]);

    console.log(`✅ Parallel fetch complete: ${saasRecords.length} SaaS + ${pricingRecords.length} pricing records`);

    // Extract all SaaS record IDs for linking with pricing
    const saasIds = saasRecords.map((r: any) => r.id);
    console.log(`🔗 Processing ${saasIds.length} SaaS records for pricing linkage`);
    
    // Group pricing records by SaaS ID using optimized mapping
    const pricingBySaasId = new Map<string, any[]>();
    pricingRecords.forEach((pr: any) => {
      const fields = pr.fields || {};
      
      // Try multiple possible field names for the SaaS link
      const linkedSaasIds = toArray<string>(
        pick<string | string[]>(fields, ['SaaS lié', 'Saas lié', 'SaaS liés', 'Saas liés', 'SaaS', 'Saas']) || []
      );
      
      linkedSaasIds.forEach(saasId => {
        if (!pricingBySaasId.has(saasId)) {
          pricingBySaasId.set(saasId, []);
        }
        pricingBySaasId.get(saasId)!.push(pr);
      });
    });

    console.log(`🎯 Pricing linkage: ${pricingBySaasId.size} SaaS items have pricing plans (${pricingRecords.length} total plans)`);

    // Transform SaaS records with linked pricing data
    const mapped = saasRecords.map((r: any) => {
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
      }).sort((a, b) => {
        // Sort by popular first, then by price (convert price strings to numbers for sorting)
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        
        // Extract numbers from price strings for comparison
        const priceA = parseFloat(a.price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        const priceB = parseFloat(b.price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        
        return priceA - priceB;
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

    // Create response data
    const responseData = { items: mapped };
    const etag = generateETag(responseData);
    
    // Cache the result
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
      etag,
    });

    // Clean old cache entries (simple cleanup)
    if (cache.size > 100) {
      const oldestKeys = Array.from(cache.keys()).slice(0, 10);
      oldestKeys.forEach(key => cache.delete(key));
    }

    const responseTime = performance.now() - startTime;
    metrics.avgResponseTime = (metrics.avgResponseTime + responseTime) / 2;

    console.log(`🎉 Response ready: ${mapped.length} SaaS items (${responseTime.toFixed(2)}ms)`);
    console.log(`📊 Cache stats: ${metrics.cacheHits} hits, ${metrics.cacheMisses} misses, ${metrics.totalRequests} total requests`);

    return new Response(JSON.stringify(responseData), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'ETag': etag,
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'MISS',
        'X-Response-Time': `${responseTime.toFixed(2)}ms`,
        'X-Total-Records': mapped.length.toString(),
        'Content-Encoding': 'gzip', // Browser will handle compression
      },
    });
  } catch (e) {
    console.error('get-saas-from-airtable error:', e);
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
