/**
 * Reine Abbildungslogik für den Rebrickable → catalog_sets Sync (AP-1.2).
 * Kein Deno-/Supabase-spezifischer Code hier — Netzwerk, CSV-Parsing und der
 * DB-Schreibvorgang leben in `index.ts`. Diese Datei ist bewusst so klein und
 * abhängigkeitsfrei gehalten, dass sie sich auch außerhalb von Deno (z. B. mit
 * `node`/`ts-node` gegen echte CSV-Ausschnitte) durchgehen lässt.
 */

export interface RebrickableSetRow {
  set_num: string;
  name: string;
  year: string;
  theme_id: string;
  num_parts: string;
  img_url: string;
}

export interface RebrickableThemeRow {
  id: string;
  name: string;
  parent_id: string;
}

export interface CatalogSetRow {
  set_number: string;
  name: string;
  year: number;
  theme: string;
  parts: number;
  image_url: string | null;
}

const SET_NUMBER_PATTERN = /^\d{1,6}$/;

export function buildThemeNameMap(themeRows: readonly RebrickableThemeRow[]): Map<string, string> {
  return new Map(themeRows.map((t) => [t.id, t.name]));
}

/**
 * Reduziert eine Rebrickable-Zeile auf unser `catalog_sets`-Schema.
 *
 * Rebrickables Bulk-Export führt neben echten LEGO-Sets auch Ersatzteile,
 * Schlüsselanhänger, Werbe-Sonderartikel usw. mit unüblichen `set_num`-Werten
 * (z. B. "0003977811-1"). Für den Ankauf sind nur reguläre Sets relevant —
 * deshalb: nur die Primärvariante ("-1"-Suffix) und nur reine Ziffern-
 * Setnummern (passend zu unserem Domain-Modell, z. B. "75355"). Alles andere
 * liefert `null` und wird beim Sync übersprungen.
 */
export function mapToCatalogSet(
  row: RebrickableSetRow,
  themeNames: ReadonlyMap<string, string>,
): CatalogSetRow | null {
  if (!row.set_num.endsWith('-1')) {
    return null;
  }
  const setNumber = row.set_num.slice(0, -2);
  if (!SET_NUMBER_PATTERN.test(setNumber)) {
    return null;
  }

  return {
    set_number: setNumber,
    name: row.name,
    year: Number(row.year) || 0,
    theme: themeNames.get(row.theme_id) ?? 'Unbekannt',
    parts: Number(row.num_parts) || 0,
    image_url: row.img_url || null,
  };
}

export function mapAllToCatalogSets(
  setRows: readonly RebrickableSetRow[],
  themeRows: readonly RebrickableThemeRow[],
): CatalogSetRow[] {
  const themeNames = buildThemeNameMap(themeRows);
  const result: CatalogSetRow[] = [];
  for (const row of setRows) {
    const mapped = mapToCatalogSet(row, themeNames);
    if (mapped) {
      result.push(mapped);
    }
  }
  return result;
}
