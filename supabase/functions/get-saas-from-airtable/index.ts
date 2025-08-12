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
    params.set('pageSize', '100');
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
