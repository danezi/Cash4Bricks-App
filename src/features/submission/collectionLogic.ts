/**
 * Reine Logik für die Sammlungsliste (AP-1.5): Menge ändern, Position entfernen,
 * Duplikat-Erkennung, Summen. Kein I/O, kein Framework — vollständig testbar.
 * Persistenz (AsyncStorage) und Zustand liegen in `CollectionContext.tsx`.
 */

export interface CollectionItem {
  id: string;
  setNumber: string;
  setName: string;
  qty: number;
  source: 'scan' | 'manual';
}

export const MIN_QTY = 1;

/** Existiert schon eine Position mit dieser Setnummer? Für die Doppel-Scan-Rückfrage. */
export function findBySetNumber(
  items: readonly CollectionItem[],
  setNumber: string,
): CollectionItem | undefined {
  return items.find((it) => it.setNumber === setNumber);
}

/** Neue Position anhängen. Setzt keine Duplikat-Prüfung voraus — die trifft der Aufrufer. */
export function addItem(
  items: readonly CollectionItem[],
  input: { id: string; setNumber: string; setName: string; source: CollectionItem['source'] },
): CollectionItem[] {
  return [...items, { ...input, qty: MIN_QTY }];
}

/** Menge einer bestehenden Position um `delta` ändern (Untergrenze `MIN_QTY`). */
export function changeQty(
  items: readonly CollectionItem[],
  id: string,
  delta: number,
): CollectionItem[] {
  return items.map((it) => (it.id === id ? { ...it, qty: Math.max(MIN_QTY, it.qty + delta) } : it));
}

export function removeItem(items: readonly CollectionItem[], id: string): CollectionItem[] {
  return items.filter((it) => it.id !== id);
}

export interface CollectionTotals {
  setCount: number;
  totalQty: number;
}

export function totals(items: readonly CollectionItem[]): CollectionTotals {
  return {
    setCount: items.length,
    totalQty: items.reduce((sum, it) => sum + it.qty, 0),
  };
}
