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
  home: {
    tagline: 'Verkaufe deine ungeöffneten LEGO-Sets in wenigen Minuten.',
    scanTitle: 'LEGO scannen',
    scanSubtitle:
      'Verkaufe deine LEGO-Sammlung und erhalte innerhalb von 24 Stunden ein kostenloses Angebot.',
    scanCta: 'Scan starten',
    dashboardTitle: 'Mein Dashboard',
    dashboardSubtitle: 'Sieh deine Angebote, Verkäufe und bisherigen Auszahlungen.',
    dashboardCta: 'Anmelden',
    howItWorksTitle: 'So funktioniert es',
    howItWorksSubtitle: 'Kurze Erklärung des Ankaufprozesses.',
    howItWorksCta: 'Ablauf ansehen',
  },
  howItWorks: {
    subtitle: 'In sechs Schritten von der Sammlung zur Auszahlung.',
    step1Title: '1. Sets scannen',
    step1Body:
      'Öffne den Scanner und halte die Kamera auf den Barcode jedes LEGO-Sets. Wir erkennen das Set automatisch.',
    step2Title: '2. Menge angeben',
    step2Body:
      'Jedes Set landet mit Stückzahl in deiner Liste. Scanne weitere Sets oder ändere Mengen jederzeit.',
    step3Title: '3. Angebot anfordern',
    step3Body: 'Trage E-Mail und Telefonnummer ein und sende deine Liste ab.',
    step4Title: '4. Angebot erhalten',
    step4Body: 'Innerhalb von 24 Stunden meldet sich unser Team mit deinem persönlichen Angebot.',
    step5Title: '5. Sets einsenden',
    step5Body:
      'Bei Annahme schickst du deine Sammlung ein. Wir prüfen jedes Set beim Wareneingang.',
    step6Title: '6. Auszahlung',
    step6Body: 'Nach der Prüfung erhältst du deinen Beleg und die Auszahlung.',
    cta: 'Jetzt scannen',
  },
  scanStub: {
    title: 'Scanner folgt bald',
    hint: 'Der Barcode-Scanner wird im nächsten Schritt gebaut (AP-1.3).',
  },
  dashboardStub: {
    title: 'Dashboard folgt bald',
    hint: 'Anmeldung und Dashboard werden in einem späteren Schritt gebaut.',
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
