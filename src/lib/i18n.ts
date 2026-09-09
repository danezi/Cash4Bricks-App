/**
 * Minimales i18n. Nur Deutsch im MVP (OP-09), aber alle sichtbaren Strings laufen
 * über `t(...)`, damit weitere Sprachen später ohne Codeänderung möglich sind.
 */

export const de = {
  common: {
    retry: 'Erneut versuchen',
    loading: 'Wird geladen …',
    error: 'Etwas ist schiefgelaufen',
  },
  status: {
    submitted: 'Eingereicht',
    under_review: 'In Prüfung',
    offer_sent: 'Angebot gesendet',
    accepted: 'Angenommen',
    received: 'Ware erhalten',
    payment_initiated: 'Auszahlung veranlasst',
    paid: 'Ausgezahlt',
  },
  scan: {
    hint: 'Barcode des LEGO-Sets in den Rahmen halten',
  },
  empty: {
    submissions: 'Noch keine Sammlung eingereicht',
  },
} as const;

type Dict = typeof de;
type NestedKeys<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${NestedKeys<T[K]>}`;
}[keyof T & string];

export type MessageKey = NestedKeys<Dict>;

const messages: Record<string, Dict> = { de };
let locale: keyof typeof messages = 'de';

export function setLocale(next: keyof typeof messages): void {
  locale = next;
}

/** Löst einen Punkt-Pfad wie `status.offer_sent` auf. */
export function t(key: MessageKey): string {
  const parts = key.split('.');
  let node: unknown = messages[locale];
  for (const part of parts) {
    if (typeof node === 'object' && node !== null && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof node === 'string' ? node : key;
}
