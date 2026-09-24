import { createSupabaseApi } from '@/api/supabase';
import { getSupabaseClient } from '@/lib/supabaseClient';

jest.mock('@/lib/supabaseClient', () => ({
  getSupabaseClient: jest.fn(),
}));

const mockGetClient = getSupabaseClient as jest.Mock;

interface QueryResult {
  data: unknown[] | null;
  error: unknown;
}

function makeChain(result: QueryResult) {
  return { limit: jest.fn().mockResolvedValue(result) };
}

function createMockClient(opts: { byName?: QueryResult; byNumber?: QueryResult }) {
  const byName = opts.byName ?? { data: [], error: null };
  const byNumber = opts.byNumber ?? { data: [], error: null };

  const ilike = jest.fn((column: string) =>
    column === 'name' ? makeChain(byName) : makeChain(byNumber),
  );
  const select = jest.fn(() => ({ ilike }));
  const from = jest.fn(() => ({ select }));

  return { from, ilike, select };
}

const XWING_ROW = {
  set_number: '75355',
  name: 'X-Wing Starfighter',
  year: 2023,
  theme: 'Star Wars',
  parts: 1949,
  image_url: 'https://example.com/75355.jpg',
};

beforeEach(() => {
  mockGetClient.mockReset();
});

describe('supabase catalog.searchSets', () => {
  it('fragt bei leerer Eingabe gar nicht erst die Datenbank an', async () => {
    const client = createMockClient({});
    mockGetClient.mockReturnValue(client);

    const result = await createSupabaseApi().catalog.searchSets('   ');

    expect(result).toEqual([]);
    expect(client.from).not.toHaveBeenCalled();
  });

  it('bildet DB-Zeilen (snake_case) korrekt auf CatalogSet (camelCase) ab', async () => {
    const client = createMockClient({ byName: { data: [XWING_ROW], error: null } });
    mockGetClient.mockReturnValue(client);

    const result = await createSupabaseApi().catalog.searchSets('X-Wing');

    expect(result).toEqual([
      {
        setNumber: '75355',
        name: 'X-Wing Starfighter',
        year: 2023,
        theme: 'Star Wars',
        parts: 1949,
        imageUrl: 'https://example.com/75355.jpg',
      },
    ]);
  });

  it('dedupliziert Treffer, die in beiden Teilabfragen vorkommen', async () => {
    const client = createMockClient({
      byName: { data: [XWING_ROW], error: null },
      byNumber: { data: [XWING_ROW], error: null },
    });
    mockGetClient.mockReturnValue(client);

    const result = await createSupabaseApi().catalog.searchSets('75355');

    expect(result).toHaveLength(1);
  });

  it('escaped ILIKE-Sonderzeichen (%, _) in der Nutzereingabe', async () => {
    const client = createMockClient({});
    mockGetClient.mockReturnValue(client);

    await createSupabaseApi().catalog.searchSets('50%_off');

    expect(client.ilike).toHaveBeenCalledWith('name', '%50\\%\\_off%');
    expect(client.ilike).toHaveBeenCalledWith('set_number', '%50\\%\\_off%');
  });

  it('setzt Fallback-Werte für nullbare DB-Spalten ein', async () => {
    const client = createMockClient({
      byName: {
        data: [
          {
            set_number: '99999',
            name: 'Ohne Extras',
            year: null,
            theme: null,
            parts: null,
            image_url: null,
          },
        ],
        error: null,
      },
    });
    mockGetClient.mockReturnValue(client);

    const result = await createSupabaseApi().catalog.searchSets('Extras');

    expect(result[0]).toEqual({
      setNumber: '99999',
      name: 'Ohne Extras',
      year: 0,
      theme: '',
      parts: 0,
      imageUrl: null,
    });
  });

  it('wirft weiter, wenn eine der beiden Abfragen fehlschlägt', async () => {
    const client = createMockClient({
      byName: { data: null, error: new Error('DB down') },
    });
    mockGetClient.mockReturnValue(client);

    await expect(createSupabaseApi().catalog.searchSets('X-Wing')).rejects.toThrow('DB down');
  });
});
