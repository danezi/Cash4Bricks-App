import type { CatalogSet } from '@/domain';

/**
 * Testdaten für den Mock-Adapter. Nicht produktiv — plausible, aber erfundene Werte.
 * Deckt bewusst die Sonderfälle der Barcode-Auflösung ab (Mehrfach-EAN, unbekannt,
 * niedrige Confidence).
 */

export const CATALOG_SETS: CatalogSet[] = [
  {
    setNumber: '75355',
    name: 'X-Wing Starfighter',
    year: 2023,
    theme: 'Star Wars',
    parts: 1949,
    imageUrl: null,
  },
  {
    setNumber: '75192',
    name: 'Millennium Falcon',
    year: 2017,
    theme: 'Star Wars',
    parts: 7541,
    imageUrl: null,
  },
  {
    setNumber: '75331',
    name: 'The Razor Crest',
    year: 2022,
    theme: 'Star Wars',
    parts: 6187,
    imageUrl: null,
  },
  {
    setNumber: '75290',
    name: 'Mos Eisley Cantina',
    year: 2020,
    theme: 'Star Wars',
    parts: 3187,
    imageUrl: null,
  },
  {
    setNumber: '42143',
    name: 'Ferrari Daytona SP3',
    year: 2022,
    theme: 'Technic',
    parts: 3778,
    imageUrl: null,
  },
  {
    setNumber: '42115',
    name: 'Lamborghini Sián FKP 37',
    year: 2020,
    theme: 'Technic',
    parts: 3696,
    imageUrl: null,
  },
  {
    setNumber: '42131',
    name: 'App-Controlled Cat D11 Bulldozer',
    year: 2021,
    theme: 'Technic',
    parts: 3854,
    imageUrl: null,
  },
  {
    setNumber: '10260',
    name: 'Downtown Diner',
    year: 2018,
    theme: 'Creator Expert',
    parts: 2480,
    imageUrl: null,
  },
  {
    setNumber: '10270',
    name: 'Bookshop',
    year: 2020,
    theme: 'Creator Expert',
    parts: 2504,
    imageUrl: null,
  },
  {
    setNumber: '10255',
    name: 'Assembly Square',
    year: 2017,
    theme: 'Creator Expert',
    parts: 4002,
    imageUrl: null,
  },
  {
    setNumber: '10297',
    name: 'Boutique Hotel',
    year: 2022,
    theme: 'Creator Expert',
    parts: 3066,
    imageUrl: null,
  },
  {
    setNumber: '71043',
    name: 'Hogwarts Castle',
    year: 2018,
    theme: 'Harry Potter',
    parts: 6020,
    imageUrl: null,
  },
  {
    setNumber: '76417',
    name: 'Gringotts Wizarding Bank',
    year: 2023,
    theme: 'Harry Potter',
    parts: 4801,
    imageUrl: null,
  },
  {
    setNumber: '75955',
    name: 'Hogwarts Express',
    year: 2018,
    theme: 'Harry Potter',
    parts: 801,
    imageUrl: null,
  },
  {
    setNumber: '21318',
    name: 'Tree House',
    year: 2019,
    theme: 'Ideas',
    parts: 3036,
    imageUrl: null,
  },
  {
    setNumber: '21322',
    name: 'Pirates of Barracuda Bay',
    year: 2020,
    theme: 'Ideas',
    parts: 2545,
    imageUrl: null,
  },
  {
    setNumber: '21309',
    name: 'NASA Apollo Saturn V',
    year: 2017,
    theme: 'Ideas',
    parts: 1969,
    imageUrl: null,
  },
  {
    setNumber: '10220',
    name: 'Volkswagen T1 Camper Van',
    year: 2011,
    theme: 'Creator Expert',
    parts: 1334,
    imageUrl: null,
  },
  {
    setNumber: '10280',
    name: 'Flower Bouquet',
    year: 2021,
    theme: 'Botanical',
    parts: 756,
    imageUrl: null,
  },
  {
    setNumber: '92176',
    name: 'NASA Apollo Saturn V',
    year: 2020,
    theme: 'Ideas',
    parts: 1969,
    imageUrl: null,
  },
];

/**
 * EAN → Setnummer. `confidence < 1` löst in der App die Rückfrage „Ist das dein Set?“ aus.
 * `confirmed` markiert bereits bestätigte Zuordnungen.
 */
export interface BarcodeFixture {
  ean: string;
  setNumber: string;
  confidence: number;
  confirmed: boolean;
}

export const BARCODES: BarcodeFixture[] = [
  { ean: '5702017155821', setNumber: '75355', confidence: 1, confirmed: true },
  { ean: '5702016371543', setNumber: '75192', confidence: 1, confirmed: true },
  { ean: '5702017153261', setNumber: '75331', confidence: 1, confirmed: true },
  { ean: '5702016914412', setNumber: '75290', confidence: 1, confirmed: true },
  { ean: '5702017156889', setNumber: '42143', confidence: 1, confirmed: true },
  { ean: '5702016616333', setNumber: '42115', confidence: 1, confirmed: true },
  { ean: '5702016914894', setNumber: '10270', confidence: 1, confirmed: true },
  { ean: '5702016368497', setNumber: '10255', confidence: 1, confirmed: true },
  { ean: '5702016367393', setNumber: '71043', confidence: 1, confirmed: true },
  { ean: '5702017413038', setNumber: '76417', confidence: 1, confirmed: true },
  // Mehrfach-EAN: dasselbe Set unter zwei Handelscodes (verschiedene Regionen/Auflagen)
  { ean: '0673419281485', setNumber: '75192', confidence: 1, confirmed: true },
  { ean: '4013073751928', setNumber: '75192', confidence: 0.9, confirmed: false },
  // Niedrige Confidence: Treffer plausibel, aber unbestätigt -> Rückfrage in der App
  { ean: '5702016909999', setNumber: '10260', confidence: 0.55, confirmed: false },
  { ean: '9999999999999', setNumber: '21309', confidence: 0.4, confirmed: false },
  // '0000000000000' und alle übrigen EANs sind bewusst unbekannt.
];

/** Deterministischer, plausibler Ankauf-Schätzpreis je Set (in Euro). */
export function estimatePrice(setNumber: string): number {
  const digits = setNumber.replace(/\D/g, '');
  const seed = [...digits].reduce((acc, ch) => acc + Number(ch), 0);
  return 25 + (seed % 20) * 5; // 25 … 120 €
}
