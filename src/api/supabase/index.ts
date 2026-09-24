import type { CatalogSet } from '@/domain';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Api } from '@/api/types';

const SEARCH_LIMIT = 20;
const CATALOG_SET_COLUMNS = 'set_number, name, year, theme, parts, image_url';

interface CatalogSetDbRow {
  set_number: string;
  name: string;
  year: number | null;
  theme: string | null;
  parts: number | null;
  image_url: string | null;
}

function toCatalogSet(row: CatalogSetDbRow): CatalogSet {
  return {
    setNumber: row.set_number,
    name: row.name,
    year: row.year ?? 0,
    theme: row.theme ?? '',
    parts: row.parts ?? 0,
    imageUrl: row.image_url,
  };
}

/** Escaped ILIKE-Sonderzeichen, damit Nutzereingaben wie im Mock ein reiner
 * Teilstring-Vergleich bleiben (kein Wildcard-Verhalten über `%`/`_`). */
function escapeLikePattern(raw: string): string {
  return raw.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

async function searchSets(query: string): Promise<CatalogSet[]> {
  const q = query.trim();
  if (!q) {
    return [];
  }
  const client = getSupabaseClient();
  const pattern = `%${escapeLikePattern(q)}%`;

  // Zwei getrennte Abfragen statt eines `.or(...)`-Filterstrings: PostgRESTs
  // or-Syntax braucht eigenes Escaping für Kommas/Klammern im Wert — bei
  // Nutzereingaben unnötig fehleranfällig. Ergebnisse werden über
  // `set_number` dedupliziert (ein Treffer kann in beiden Abfragen stecken).
  const [byName, byNumber] = await Promise.all([
    client
      .from('catalog_sets')
      .select(CATALOG_SET_COLUMNS)
      .ilike('name', pattern)
      .limit(SEARCH_LIMIT),
    client
      .from('catalog_sets')
      .select(CATALOG_SET_COLUMNS)
      .ilike('set_number', pattern)
      .limit(SEARCH_LIMIT),
  ]);
  if (byName.error) {
    throw byName.error;
  }
  if (byNumber.error) {
    throw byNumber.error;
  }

  const merged = new Map<string, CatalogSetDbRow>();
  for (const row of [...(byName.data ?? []), ...(byNumber.data ?? [])] as CatalogSetDbRow[]) {
    merged.set(row.set_number, row);
  }
  return [...merged.values()].slice(0, SEARCH_LIMIT).map(toCatalogSet);
}

/**
 * Platzhalter für den echten Supabase-Adapter. Die Umschaltung existiert schon
 * (`EXPO_PUBLIC_API_MODE=supabase`). `catalog.searchSets` ist bereits real
 * implementiert (AP-1.2) — der Rest folgt ab M2 (Auth, dauerhafte Speicherung).
 * Bis dahin schlägt jeder andere Aufruf klar erkennbar fehl.
 */
export function createSupabaseApi(): Api {
  const notReady = (): never => {
    throw new Error(
      'Supabase-Adapter noch nicht implementiert. Bis dahin EXPO_PUBLIC_API_MODE=mock nutzen.',
    );
  };

  return {
    catalog: {
      searchSets,
      resolveBarcode: notReady,
      confirmBarcode: notReady,
    },
    submissions: {
      createSubmission: notReady,
      listSubmissions: notReady,
      getSubmission: notReady,
    },
    goodsReceipt: {
      scan: notReady,
      addAdjustment: notReady,
      closeDeal: notReady,
    },
    auth: {
      requestOtp: notReady,
      verifyOtp: notReady,
      currentSession: () => null,
      signOut: notReady,
    },
    notifications: {
      sendSubmissionReceived: notReady,
      sendDealClosed: notReady,
    },
  };
}
