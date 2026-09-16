import {
  addItem,
  changeQty,
  findBySetNumber,
  removeItem,
  totals,
  type CollectionItem,
} from '@/features/submission/collectionLogic';

const XWING: CollectionItem = {
  id: 'i1',
  setNumber: '75355',
  setName: 'X-Wing Starfighter',
  qty: 2,
  source: 'scan',
};
const FERRARI: CollectionItem = {
  id: 'i2',
  setNumber: '42143',
  setName: 'Ferrari Daytona SP3',
  qty: 1,
  source: 'manual',
};

describe('findBySetNumber', () => {
  it('findet eine bestehende Position', () => {
    expect(findBySetNumber([XWING, FERRARI], '42143')).toBe(FERRARI);
  });

  it('liefert undefined, wenn die Setnummer nicht in der Liste ist', () => {
    expect(findBySetNumber([XWING], '99999')).toBeUndefined();
  });
});

describe('addItem', () => {
  it('haengt eine neue Position mit Menge 1 an', () => {
    const result = addItem([XWING], {
      id: 'i3',
      setNumber: '10270',
      setName: 'Bookshop',
      source: 'scan',
    });
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({
      id: 'i3',
      setNumber: '10270',
      setName: 'Bookshop',
      qty: 1,
      source: 'scan',
    });
  });
});

describe('changeQty', () => {
  it('erhoeht die Menge', () => {
    const result = changeQty([XWING], 'i1', 1);
    expect(result[0].qty).toBe(3);
  });

  it('verringert die Menge, aber nicht unter 1', () => {
    const result = changeQty([FERRARI], 'i2', -1);
    expect(result[0].qty).toBe(1);
    expect(changeQty(result, 'i2', -1)[0].qty).toBe(1);
  });

  it('laesst andere Positionen unveraendert', () => {
    const result = changeQty([XWING, FERRARI], 'i1', 1);
    expect(result[1]).toBe(FERRARI);
  });
});

describe('removeItem', () => {
  it('entfernt genau die passende Position', () => {
    expect(removeItem([XWING, FERRARI], 'i1')).toEqual([FERRARI]);
  });
});

describe('totals', () => {
  it('zaehlt Sets und Gesamtstueckzahl', () => {
    expect(totals([XWING, FERRARI])).toEqual({ setCount: 2, totalQty: 3 });
  });

  it('liefert Nullen fuer eine leere Liste', () => {
    expect(totals([])).toEqual({ setCount: 0, totalQty: 0 });
  });
});
