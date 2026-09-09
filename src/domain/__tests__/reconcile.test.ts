import { estimatedTotal, finalTotal, missingItems, round2 } from '@/domain/reconcile';
import type { Adjustment, SubmissionItem } from '@/domain/types';

function item(over: Partial<SubmissionItem>): SubmissionItem {
  return {
    id: 'i',
    setNumber: '00000',
    setName: 'Test',
    qty: 1,
    qtyReceived: 0,
    source: 'scan',
    lineStatus: 'requested',
    priceEstimated: 10,
    priceFinal: null,
    ...over,
  };
}

describe('estimatedTotal', () => {
  it('summiert Preis × Menge über alle nicht-fehlenden Positionen', () => {
    const items = [item({ priceEstimated: 10, qty: 2 }), item({ priceEstimated: 5, qty: 3 })];
    expect(estimatedTotal(items)).toBe(35);
  });

  it('ignoriert als fehlend markierte Positionen', () => {
    const items = [
      item({ priceEstimated: 10, qty: 1 }),
      item({ priceEstimated: 99, qty: 1, lineStatus: 'missing' }),
    ];
    expect(estimatedTotal(items)).toBe(10);
  });
});

describe('finalTotal', () => {
  it('rechnet erhaltene Menge zum Endpreis plus Anpassungen', () => {
    const items = [
      item({ lineStatus: 'received', qty: 2, qtyReceived: 2, priceFinal: 20 }),
      item({ lineStatus: 'extra', qty: 1, qtyReceived: 1, priceFinal: 8 }),
      item({ lineStatus: 'missing', qty: 1, qtyReceived: 0, priceEstimated: 50 }),
    ];
    const adjustments: Adjustment[] = [
      { id: 'a1', amount: 20, reason: 'Fahrtkosten', createdAt: 'x' },
      { id: 'a2', amount: -15, reason: 'beschädigte Verpackung', createdAt: 'x' },
    ];
    // 2*20 + 1*8 + (20 - 15) = 53
    expect(finalTotal(items, adjustments)).toBe(53);
  });

  it('fällt auf den Schätzpreis zurück, wenn kein Endpreis gesetzt ist', () => {
    const items = [
      item({
        lineStatus: 'received',
        qty: 1,
        qtyReceived: 1,
        priceEstimated: 12,
        priceFinal: null,
      }),
    ];
    expect(finalTotal(items, [])).toBe(12);
  });
});

describe('missingItems', () => {
  it('erfasst fehlende und unvollständig gelieferte Positionen', () => {
    const items = [
      item({ lineStatus: 'received', qty: 1, qtyReceived: 1 }),
      item({ lineStatus: 'missing', qty: 1, qtyReceived: 0 }),
      item({ lineStatus: 'received', qty: 3, qtyReceived: 2 }),
    ];
    expect(missingItems(items)).toHaveLength(2);
  });
});

describe('round2', () => {
  it('rundet auf zwei Nachkommastellen', () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(19.999)).toBe(20);
  });
});
