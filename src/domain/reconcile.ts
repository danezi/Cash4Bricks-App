import type { Adjustment, SubmissionItem } from '@/domain/types';

/**
 * Reine Geld-Pfad-Funktionen. Kein I/O, keine Frameworks — vollständig testbar.
 */

/** Geschätzte Gesamtsumme: nur Positionen, die nicht als fehlend markiert sind. */
export function estimatedTotal(items: readonly SubmissionItem[]): number {
  return round2(
    items
      .filter((it) => it.lineStatus !== 'missing')
      .reduce((sum, it) => sum + (it.priceEstimated ?? 0) * it.qty, 0),
  );
}

/**
 * Finale Gesamtsumme nach Wareneingang:
 * Summe der tatsächlich erhaltenen Mengen zum Endpreis, plus alle Anpassungen.
 */
export function finalTotal(
  items: readonly SubmissionItem[],
  adjustments: readonly Adjustment[],
): number {
  const goods = items
    .filter((it) => it.lineStatus === 'received' || it.lineStatus === 'extra')
    .reduce((sum, it) => sum + (it.priceFinal ?? it.priceEstimated ?? 0) * it.qtyReceived, 0);
  const adj = adjustments.reduce((sum, a) => sum + a.amount, 0);
  return round2(goods + adj);
}

/** Positionen, die eingereicht, aber nicht (vollständig) geliefert wurden. */
export function missingItems(items: readonly SubmissionItem[]): SubmissionItem[] {
  return items.filter((it) => it.lineStatus === 'missing' || it.qtyReceived < it.qty);
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
