/**
 * Edge Function catalog-sync (AP-1.2): spiegelt Rebrickables öffentlichen
 * Bulk-CSV-Export (sets.csv.gz, themes.csv.gz — kein API-Key nötig, siehe
 * README) nach `public.catalog_sets`. Läuft laut Plan wöchentlich per Cron
 * (M1-018, noch einzurichten), ist hier aber als normale HTTP-Function
 * gebaut, damit sie sich auch manuell testweise aufrufen lässt.
 *
 * SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY stellt Supabase jeder Edge Function
 * automatisch bereit — hier muss nichts zusätzlich gesetzt werden. Einziges
 * eigenes Secret: CATALOG_SYNC_TOKEN (per `supabase secrets set`), verhindert,
 * dass Dritte mit dem öffentlichen anon-Key den Sync auslösen.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parse } from 'jsr:@std/csv/parse';

import {
  mapAllToCatalogSets,
  type RebrickableSetRow,
  type RebrickableThemeRow,
} from './mapping.ts';

const SETS_URL = 'https://cdn.rebrickable.com/media/downloads/sets.csv.gz';
const THEMES_URL = 'https://cdn.rebrickable.com/media/downloads/themes.csv.gz';
const BATCH_SIZE = 500;

async function fetchAndDecompressCsv(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Download fehlgeschlagen (${response.status}): ${url}`);
  }
  const decompressed = response.body.pipeThrough(new DecompressionStream('gzip'));
  return await new Response(decompressed).text();
}

Deno.serve(async (req) => {
  const syncToken = Deno.env.get('CATALOG_SYNC_TOKEN');
  const authHeader = req.headers.get('Authorization');
  if (!syncToken || authHeader !== `Bearer ${syncToken}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const [themesCsv, setsCsv] = await Promise.all([
      fetchAndDecompressCsv(THEMES_URL),
      fetchAndDecompressCsv(SETS_URL),
    ]);

    const themeRows = parse(themesCsv, {
      skipFirstRow: true,
      columns: ['id', 'name', 'parent_id'],
    }) as RebrickableThemeRow[];

    const setRows = parse(setsCsv, {
      skipFirstRow: true,
      columns: ['set_num', 'name', 'year', 'theme_id', 'num_parts', 'img_url'],
    }) as RebrickableSetRow[];

    const catalogRows = mapAllToCatalogSets(setRows, themeRows);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    let upserted = 0;
    for (let i = 0; i < catalogRows.length; i += BATCH_SIZE) {
      const batch = catalogRows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('catalog_sets')
        .upsert(batch, { onConflict: 'set_number' });
      if (error) {
        throw new Error(`Batch ab Zeile ${i}: ${error.message}`);
      }
      upserted += batch.length;
    }

    return new Response(JSON.stringify({ rebrickableRows: setRows.length, upserted }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
