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

const BASE = 'appayjYdBAGkJak1e';
const SAAS_TABLE = 'tblzQQ7ivUGHqTBTF';
const SAAS_VIEW = 'viwjGA16J4vctsYXf';
const PRICING_TABLE = 'tbl5qcovjk1Id7Hj5';
const PRICING_VIEW = 'viwxJnfTzP1MqTcXu';

async function fetchSaasRecords() {
  const apiKey = Deno.env.get('AIRTABLE_API_KEY') || Deno.env.get('Airtable API') || '';
  if (!apiKey) {
    console.error('Missing Airtable API key');
    throw new Error('Missing Airtable API key');
  }

  const url = new URL(`https://api.airtable.com/v0/${BASE}/${SAAS_TABLE}`);
  url.searchParams.set('view', SAAS_VIEW);
  
  // Essential fields only to reduce payload and avoid 422 errors
  const essentialFields = [
    'Nom', 'Tagline', 'Description', 'Catégorie', 'Cibles', 'Note',
    'Automatisation (%)', 'Facilité (/100)', 'Prix affiché',
    'Fonctionnalités principales', 'Cas d\'usage', 'Avantages', 'Inconvénients',
    'Logo (URL ou attachement)', 'Site web', 'Bouton Essayer gratuitement', 'Lien d\'affiliation'
  ];
  
  essentialFields.forEach(field => url.searchParams.append('fields[]', field));
  url.searchParams.set('pageSize', '50');

  console.log('Fetching SaaS records from:', url.toString());

  try {
    const res = await fetch(url, { 
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`SaaS fetch failed: ${res.status} - ${errorText}`);
      throw new Error(`SaaS fetch failed: ${res.status} - ${errorText}`);
    }
    
    const json = await res.json();
    console.log(`Successfully fetched ${json.records?.length || 0} SaaS records`);
    return json.records || [];
  } catch (error) {
    console.error('Error fetching SaaS records:', error);
    throw error;
  }
}

async function fetchPricingForSaasIds(ids: string[]) {
  if (!ids?.length) {
    console.log('No SaaS IDs provided for pricing fetch');
    return [];
  }
  
  const apiKey = Deno.env.get('AIRTABLE_API_KEY') || Deno.env.get('Airtable API') || '';
  if (!apiKey) {
    console.error('Missing Airtable API key for pricing fetch');
    return [];
  }

  const or = `OR(${ids.map(id => `SEARCH("${id}", ARRAYJOIN({SaaS lié}))`).join(',')})`;
  const url = new URL(`https://api.airtable.com/v0/${BASE}/${PRICING_TABLE}`);
  url.searchParams.set('view', PRICING_VIEW);
  url.searchParams.set('filterByFormula', or);
  
  const pricingFields = ['Nom du plan', 'Prix', 'Fonctionnalités incluses', 'Populaire', 'SaaS lié'];
  pricingFields.forEach(field => url.searchParams.append('fields[]', field));
  url.searchParams.set('pageSize', '100');

  console.log('Fetching pricing records with formula:', or);

  try {
    const res = await fetch(url, { 
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`Pricing fetch failed: ${res.status} - ${errorText}`);
      return [];
    }
    
    const json = await res.json();
    console.log(`Successfully fetched ${json.records?.length || 0} pricing records`);
    return json.records || [];
  } catch (error) {
    console.error('Error fetching pricing records:', error);
    return [];
  }
}

function groupPricingBySaas(pricingRecords: any[]) {
  const map = new Map<string, any[]>();
  for (const r of pricingRecords) {
    const linked: string[] = r.fields['SaaS lié'] || [];
    const planObj = {
      id: r.id,
      plan: r.fields['Nom du plan'] ?? '',
      price: r.fields['Prix'] ?? '',
      included: toArray<string>(r.fields['Fonctionnalités incluses'] ?? []),
      popular: Boolean(r.fields['Populaire'])
    };
    for (const saasId of linked) {
      if (!map.has(saasId)) map.set(saasId, []);
      map.get(saasId)!.push(planObj);
    }
  }
  // Sort plans: popular first, then by price
  for (const [k, arr] of map) {
    arr.sort((a,b) => {
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      const na = parseFloat((a.price || '').replace(',', '.'));
      const nb = parseFloat((b.price || '').replace(',', '.'));
      const aNum = Number.isFinite(na) ? na : Number.POSITIVE_INFINITY;
      const bNum = Number.isFinite(nb) ? nb : Number.POSITIVE_INFINITY;
      return aNum - bNum;
    });
    map.set(k, arr);
  }
  return map;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const saasRecords = await fetchSaasRecords();
    const ids = saasRecords.map((r: any) => r.id);
    const pricingRecords = await fetchPricingForSaasIds(ids);
    const pricingMap = groupPricingBySaas(pricingRecords);

    console.log(`Fetched ${saasRecords.length} SaaS / ${pricingRecords.length} pricing records`);

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

      // Get pricing plans linked to this SaaS (already sorted by groupPricingBySaas)
      const pricingLinked = pricingMap.get(r.id) || [];

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