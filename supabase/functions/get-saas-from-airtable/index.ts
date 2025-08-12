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

    if (!isGet) {
      const body = await req.json().catch(() => ({}));
      baseId = body.baseId || baseId;
      table = body.table || table;
      view = body.view || view;
      path = body.path || path;
    }

    if (!baseId) {
      return new Response(JSON.stringify({ error: 'Missing required parameter: baseId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build Airtable endpoint path segment after baseId
    // Order of precedence: explicit path -> table -> default example view name
    const tableOrView = path || table || 'Saas-Grid view';

    const params = new URLSearchParams();
    params.set('pageSize', '100');
    if (view) params.set('view', view);

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableOrView)}?${params.toString()}`;

    const airtableResp = await fetch(airtableUrl, {
      headers: {
        Authorization: `Bearer ${Deno.env.get('AIRTABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!airtableResp.ok) {
      const errText = await airtableResp.text();
      console.error('Airtable error:', airtableResp.status, errText);
      return new Response(JSON.stringify({ error: 'Failed to fetch from Airtable', details: errText }), {
        status: airtableResp.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const airtableData = await airtableResp.json();
    const records = airtableData.records || [];

    const mapped = records.map((r: any) => {
      const f = r.fields || {};
      const name = pick<string>(f, ['name', 'Nom', 'Name', 'Titre', 'Title']) || '';
      const description = pick<string>(f, ['description', 'Description', 'Desc']) || '';
      const category = pick<string>(f, ['category', 'Catégorie', 'Categorie', 'Category']) || '';
      const targets = toArray<string>(pick<string | string[]>(f, ['targets', 'Cibles', 'Targets']) || []);
      const score = Number(pick<number | string>(f, ['score', 'Note', 'Rating']) || 0);
      const automation = Number(pick<number | string>(f, ['automation', 'Automatisation', 'Automation']) || 0);
      const price = pick<string>(f, ['price', 'Prix', 'Tarif', 'Pricing']) || '';
      const features = toArray<string>(pick<string | string[]>(f, ['features', 'Fonctionnalités', 'Fonctionnalites', 'Features']) || []);

      // Image can be a direct URL or an attachment array
      let image = pick<string>(f, ['image', 'Image', 'Logo', 'logo', 'Image URL']) || '';
      if (!image) {
        const att = pick<any[]>(f, ['Logo', 'Image', 'Attachments', 'Attachment']);
        if (Array.isArray(att) && att.length > 0 && att[0]?.url) {
          image = att[0].url;
        }
      }

      return {
        id: r.id,
        name,
        description,
        category,
        targets,
        score,
        automation,
        price,
        features,
        image,
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
