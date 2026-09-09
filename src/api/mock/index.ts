import {
  adjustmentInputSchema,
  estimatedTotal,
  finalTotal,
  submissionInputSchema,
  type Adjustment,
  type BarcodeMatch,
  type ReceiptId,
  type Session,
  type SubmissionDetail,
  type SubmissionId,
  type SubmissionInput,
  type SubmissionItem,
  type SubmissionSummary,
} from '@/domain';
import type { Api } from '@/api/types';
import { BARCODES, CATALOG_SETS, estimatePrice, type BarcodeFixture } from '@/api/mock/fixtures';

const OTP_CODE = '000000';

interface MockSubmission extends Omit<SubmissionDetail, 'totalEstimated' | 'totalFinal'> {
  receiptId: ReceiptId | null;
}

/**
 * Vollständig in-memory. Deckt alle Ports ab und wird aus den Fixtures gespeist.
 * Verhalten ist bewusst deterministisch, damit Tests und Entwicklung stabil sind.
 */
export function createMockApi(): Api {
  const catalog = new Map(CATALOG_SETS.map((s) => [s.setNumber, s]));
  const barcodes: BarcodeFixture[] = BARCODES.map((b) => ({ ...b }));
  const submissions = new Map<SubmissionId, MockSubmission>();
  const otps = new Map<string, string>();
  let session: Session | null = null;
  let seq = 0;
  const nextId = (prefix: string): string => `${prefix}_${++seq}`;

  function resolveEan(ean: string): BarcodeMatch {
    const hit = barcodes.find((b) => b.ean === ean);
    const set = hit ? catalog.get(hit.setNumber) : undefined;
    if (!hit || !set) {
      return { kind: 'unknown', ean };
    }
    if (hit.confirmed) {
      return { kind: 'confirmed', set };
    }
    return { kind: 'probable', set, confidence: hit.confidence };
  }

  function detailOf(sub: MockSubmission): SubmissionDetail {
    const paidLike =
      sub.status === 'received' || sub.status === 'payment_initiated' || sub.status === 'paid';
    return {
      ...sub,
      totalEstimated: estimatedTotal(sub.items),
      totalFinal: paidLike ? finalTotal(sub.items, sub.adjustments) : null,
    };
  }

  function requireSubmission(id: SubmissionId): MockSubmission {
    const sub = submissions.get(id);
    if (!sub) {
      throw new Error(`Einreichung ${id} nicht gefunden`);
    }
    return sub;
  }

  seedExampleSubmission();

  return {
    catalog: {
      async searchSets(query) {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return CATALOG_SETS.filter(
          (s) => s.name.toLowerCase().includes(q) || s.setNumber.includes(q),
        ).slice(0, 20);
      },
      async resolveBarcode(ean) {
        return resolveEan(ean);
      },
      async confirmBarcode(ean, setNumber) {
        const existing = barcodes.find((b) => b.ean === ean);
        if (existing) {
          existing.setNumber = setNumber;
          existing.confidence = 1;
          existing.confirmed = true;
        } else {
          barcodes.push({ ean, setNumber, confidence: 1, confirmed: true });
        }
      },
    },

    submissions: {
      async createSubmission(input: SubmissionInput) {
        const parsed = submissionInputSchema.parse(input);
        const id = nextId('sub');
        const items: SubmissionItem[] = parsed.items.map((it) => ({
          id: nextId('item'),
          setNumber: it.setNumber,
          setName: it.setName,
          qty: it.qty,
          qtyReceived: 0,
          source: it.source,
          lineStatus: 'requested',
          priceEstimated: estimatePrice(it.setNumber),
          priceFinal: null,
        }));
        submissions.set(id, {
          id,
          status: 'submitted',
          contactEmail: parsed.contactEmail,
          contactPhone: parsed.contactPhone,
          items,
          adjustments: [],
          createdAt: new Date().toISOString(),
          receiptId: null,
        });
        return id;
      },
      async listSubmissions(): Promise<SubmissionSummary[]> {
        return [...submissions.values()]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((sub) => ({
            id: sub.id,
            status: sub.status,
            itemCount: sub.items.length,
            totalQty: sub.items.reduce((n, it) => n + it.qty, 0),
            totalEstimated: estimatedTotal(sub.items),
            createdAt: sub.createdAt,
          }));
      },
      async getSubmission(id) {
        return detailOf(requireSubmission(id));
      },
    },

    goodsReceipt: {
      async scan(id, ean) {
        const sub = requireSubmission(id);
        const match = resolveEan(ean);
        if (match.kind === 'unknown') {
          throw new Error(`Unbekannter Barcode: ${ean}`);
        }
        const { set } = match;
        if (sub.status !== 'received') {
          sub.status = 'received';
        }
        const item = sub.items.find((it) => it.setNumber === set.setNumber);
        if (item) {
          item.qtyReceived += 1;
          item.lineStatus = 'received';
          return {
            setNumber: set.setNumber,
            setName: set.name,
            lineStatus: 'received',
            qtyReceived: item.qtyReceived,
            qtyRequested: item.qty,
          };
        }
        const extra: SubmissionItem = {
          id: nextId('item'),
          setNumber: set.setNumber,
          setName: set.name,
          qty: 1,
          qtyReceived: 1,
          source: 'scan',
          lineStatus: 'extra',
          priceEstimated: estimatePrice(set.setNumber),
          priceFinal: null,
        };
        sub.items.push(extra);
        return {
          setNumber: set.setNumber,
          setName: set.name,
          lineStatus: 'extra',
          qtyReceived: 1,
          qtyRequested: 0,
        };
      },
      async addAdjustment(id, input) {
        const sub = requireSubmission(id);
        const parsed = adjustmentInputSchema.parse(input);
        const adjustment: Adjustment = {
          id: nextId('adj'),
          amount: parsed.amount,
          reason: parsed.reason,
          createdAt: new Date().toISOString(),
        };
        sub.adjustments.push(adjustment);
      },
      async closeDeal(id) {
        const sub = requireSubmission(id);
        for (const it of sub.items) {
          if (it.lineStatus === 'requested') {
            it.lineStatus = 'missing';
          }
          if (it.lineStatus === 'received' || it.lineStatus === 'extra') {
            it.priceFinal = it.priceEstimated;
          }
        }
        sub.status = 'paid';
        sub.receiptId = nextId('rcpt');
        return sub.receiptId;
      },
    },

    auth: {
      async requestOtp(email) {
        otps.set(email, OTP_CODE);
      },
      async verifyOtp(email, code) {
        if (code !== (otps.get(email) ?? OTP_CODE)) {
          throw new Error('Falscher Code');
        }
        otps.delete(email);
        session = {
          userId: nextId('user'),
          email,
          role: email.toLowerCase().startsWith('admin') ? 'admin' : 'customer',
        };
        return session;
      },
      currentSession() {
        return session;
      },
      async signOut() {
        session = null;
      },
    },

    notifications: {
      async sendSubmissionReceived() {
        /* im Mock ohne Wirkung */
      },
      async sendDealClosed() {
        /* im Mock ohne Wirkung */
      },
    },

    scanner: {
      isSupported() {
        return false;
      },
    },
  };

  function seedExampleSubmission(): void {
    const id = nextId('sub');
    const picks = ['75355', '42143', '10270'];
    const items: SubmissionItem[] = picks.map((setNumber, i) => {
      const set = catalog.get(setNumber)!;
      return {
        id: nextId('item'),
        setNumber,
        setName: set.name,
        qty: i === 0 ? 2 : 1,
        qtyReceived: 0,
        source: 'scan',
        lineStatus: 'requested',
        priceEstimated: estimatePrice(setNumber),
        priceFinal: null,
      };
    });
    submissions.set(id, {
      id,
      status: 'offer_sent',
      contactEmail: 'sammler@example.com',
      contactPhone: '+49 170 0000000',
      items,
      adjustments: [],
      createdAt: new Date('2026-09-01T10:00:00Z').toISOString(),
      receiptId: null,
    });
  }
}
