import {
  buildThemeNameMap,
  mapAllToCatalogSets,
  mapToCatalogSet,
  type RebrickableSetRow,
  type RebrickableThemeRow,
} from '../mapping';

const THEMES: RebrickableThemeRow[] = [
  { id: '171', name: 'Star Wars', parent_id: '' },
  { id: '1', name: 'Technic', parent_id: '' },
];

function setRow(over: Partial<RebrickableSetRow>): RebrickableSetRow {
  return {
    set_num: '75355-1',
    name: 'X-Wing Starfighter',
    year: '2023',
    theme_id: '171',
    num_parts: '1949',
    img_url: 'https://cdn.rebrickable.com/media/sets/75355-1.jpg',
    ...over,
  };
}

describe('buildThemeNameMap', () => {
  it('baut eine id -> name Zuordnung', () => {
    const map = buildThemeNameMap(THEMES);
    expect(map.get('171')).toBe('Star Wars');
    expect(map.get('1')).toBe('Technic');
  });
});

describe('mapToCatalogSet', () => {
  const themeNames = buildThemeNameMap(THEMES);

  it('bildet eine echte Set-Zeile korrekt ab (Setnummer ohne "-1"-Suffix)', () => {
    expect(mapToCatalogSet(setRow({}), themeNames)).toEqual({
      set_number: '75355',
      name: 'X-Wing Starfighter',
      year: 2023,
      theme: 'Star Wars',
      parts: 1949,
      image_url: 'https://cdn.rebrickable.com/media/sets/75355-1.jpg',
    });
  });

  it('ignoriert Zeilen, die keine Primärvariante sind ("-2", "-3", ...)', () => {
    expect(mapToCatalogSet(setRow({ set_num: '75355-2' }), themeNames)).toBeNull();
  });

  it('ignoriert Zeilen mit Sonder-IDs (kein reines Ziffernformat)', () => {
    expect(mapToCatalogSet(setRow({ set_num: '0003977811-1' }), themeNames)).toBeNull();
  });

  it('fällt bei unbekannter Theme-ID auf "Unbekannt" zurück', () => {
    const result = mapToCatalogSet(setRow({ theme_id: '999999' }), themeNames);
    expect(result?.theme).toBe('Unbekannt');
  });

  it('setzt image_url auf null, wenn die Rebrickable-Zeile keine URL hat', () => {
    const result = mapToCatalogSet(setRow({ img_url: '' }), themeNames);
    expect(result?.image_url).toBeNull();
  });
});

describe('mapAllToCatalogSets', () => {
  it('filtert und mappt eine Liste von Zeilen', () => {
    const rows: RebrickableSetRow[] = [
      setRow({}),
      setRow({ set_num: '42143-1', name: 'Ferrari Daytona SP3', theme_id: '1', num_parts: '3778' }),
      setRow({ set_num: '75355-2' }), // gefiltert
    ];

    const result = mapAllToCatalogSets(rows, THEMES);

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.set_number)).toEqual(['75355', '42143']);
  });
});
