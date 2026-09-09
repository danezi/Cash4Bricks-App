import { createMockApi } from '@/api/mock';
import type { Api } from '@/api/types';
import type { SubmissionInput } from '@/domain';

let api: Api;

beforeEach(() => {
  api = createMockApi();
});

const input: SubmissionInput = {
  contactEmail: 'test@example.com',
  contactPhone: '+49 170 1234567',
  items: [
    { setNumber: '75355', setName: 'X-Wing Starfighter', qty: 2, source: 'scan' },
    { setNumber: '42143', setName: 'Ferrari Daytona SP3', qty: 1, source: 'manual' },
  ],
};

describe('catalog.resolveBarcode', () => {
  it('liefert einen bestätigten Treffer', async () => {
    const match = await api.catalog.resolveBarcode('5702017155821');
    expect(match.kind).toBe('confirmed');
    if (match.kind === 'confirmed') expect(match.set.setNumber).toBe('75355');
  });

  it('liefert bei niedriger Confidence einen wahrscheinlichen Treffer', async () => {
    const match = await api.catalog.resolveBarcode('5702016909999');
    expect(match.kind).toBe('probable');
    if (match.kind === 'probable') expect(match.confidence).toBeLessThan(1);
  });

  it('liefert für einen unbekannten Code "unknown"', async () => {
    const match = await api.catalog.resolveBarcode('0000000000000');
    expect(match).toEqual({ kind: 'unknown', ean: '0000000000000' });
  });

  it('confirmBarcode macht aus einem wahrscheinlichen einen bestätigten Treffer', async () => {
    await api.catalog.confirmBarcode('5702016909999', '10260');
    const match = await api.catalog.resolveBarcode('5702016909999');
    expect(match.kind).toBe('confirmed');
  });
});

describe('submissions', () => {
  it('legt eine Einreichung an und gibt sie mit Schätzsumme zurück', async () => {
    const id = await api.submissions.createSubmission(input);
    const detail = await api.submissions.getSubmission(id);

    expect(detail.status).toBe('submitted');
    expect(detail.items).toHaveLength(2);
    expect(detail.items.every((it) => it.lineStatus === 'requested')).toBe(true);
    expect(detail.totalEstimated).toBeGreaterThan(0);
    expect(detail.totalFinal).toBeNull();
  });

  it('weist ungültige Eingaben ab', async () => {
    await expect(
      api.submissions.createSubmission({ ...input, contactEmail: 'keine-email' }),
    ).rejects.toThrow();
  });

  it('listet die Beispiel-Einreichung plus neue', async () => {
    const before = await api.submissions.listSubmissions();
    await api.submissions.createSubmission(input);
    const after = await api.submissions.listSubmissions();
    expect(after.length).toBe(before.length + 1);
  });
});

describe('goodsReceipt', () => {
  it('gleicht gescannte Sets ab: erhalten, zusätzlich, fehlend', async () => {
    const id = await api.submissions.createSubmission(input);

    const received = await api.goodsReceipt.scan(id, '5702017155821'); // 75355, in Liste
    expect(received.lineStatus).toBe('received');
    expect(received.qtyReceived).toBe(1);

    const extra = await api.goodsReceipt.scan(id, '5702016914894'); // 10270, nicht in Liste
    expect(extra.lineStatus).toBe('extra');

    const detail = await api.submissions.getSubmission(id);
    expect(detail.status).toBe('received');
    // 42143 wurde nie gescannt -> nach closeDeal fehlend
  });

  it('closeDeal setzt Endpreise, markiert Fehlendes und rechnet die Endsumme', async () => {
    const id = await api.submissions.createSubmission(input);
    await api.goodsReceipt.scan(id, '5702017155821'); // 75355 erhalten (1×)
    await api.goodsReceipt.addAdjustment(id, { amount: 20, reason: 'Fahrtkostenzuschuss' });

    const receiptId = await api.goodsReceipt.closeDeal(id);
    expect(receiptId).toMatch(/^rcpt_/);

    const detail = await api.submissions.getSubmission(id);
    expect(detail.status).toBe('paid');

    const xwing = detail.items.find((it) => it.setNumber === '75355')!;
    const ferrari = detail.items.find((it) => it.setNumber === '42143')!;
    expect(xwing.lineStatus).toBe('received');
    expect(xwing.priceFinal).toBe(xwing.priceEstimated);
    expect(ferrari.lineStatus).toBe('missing');

    // erhalten: 1 × Endpreis(75355) + Anpassung 20
    expect(detail.totalFinal).toBe((xwing.priceFinal ?? 0) * xwing.qtyReceived + 20);
  });

  it('addAdjustment ist additiv (append-only)', async () => {
    const id = await api.submissions.createSubmission(input);
    await api.goodsReceipt.addAdjustment(id, { amount: 5, reason: 'Bonus eins' });
    await api.goodsReceipt.addAdjustment(id, { amount: -3, reason: 'Abzug zwei' });
    const detail = await api.submissions.getSubmission(id);
    expect(detail.adjustments).toHaveLength(2);
  });

  it('lehnt einen unbekannten Barcode beim Wareneingang ab', async () => {
    const id = await api.submissions.createSubmission(input);
    await expect(api.goodsReceipt.scan(id, '0000000000000')).rejects.toThrow(/Unbekannt/i);
  });
});

describe('auth', () => {
  it('meldet nach OTP-Bestätigung an; admin@ ergibt die Admin-Rolle', async () => {
    await api.auth.requestOtp('admin@cash4bricks.com');
    const session = await api.auth.verifyOtp('admin@cash4bricks.com', '000000');
    expect(session.role).toBe('admin');
    expect(api.auth.currentSession()?.email).toBe('admin@cash4bricks.com');

    await api.auth.signOut();
    expect(api.auth.currentSession()).toBeNull();
  });

  it('weist einen falschen Code ab', async () => {
    await api.auth.requestOtp('kunde@example.com');
    await expect(api.auth.verifyOtp('kunde@example.com', '999999')).rejects.toThrow();
  });
});
