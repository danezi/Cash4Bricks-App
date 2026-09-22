import type {
  AdjustmentInput,
  BarcodeMatch,
  CatalogSet,
  ReceiptId,
  Session,
  SubmissionDetail,
  SubmissionId,
  SubmissionInput,
  SubmissionSummary,
  ReconcileResult,
} from '@/domain';

/**
 * Die Verträge, die der Fachkern besitzt (Dependency Inversion) und die außen von
 * Adaptern (`mock`, `supabase`) implementiert werden. Bewusst in kleine, rollenreine
 * Schnittstellen getrennt (Interface Segregation) — ein Screen hängt nur an dem Port,
 * den er wirklich nutzt.
 */

export interface CatalogPort {
  /** Freitextsuche über Setname oder -nummer. */
  searchSets(query: string): Promise<CatalogSet[]>;
  /** EAN auflösen: bestätigt → wahrscheinlich (mit Confidence) → unbekannt. */
  resolveBarcode(ean: string): Promise<BarcodeMatch>;
  /** Bestätigten Treffer zurückschreiben (selbstlernender Barcode-Index). */
  confirmBarcode(ean: string, setNumber: string): Promise<void>;
}

export interface SubmissionPort {
  createSubmission(input: SubmissionInput): Promise<SubmissionId>;
  listSubmissions(): Promise<SubmissionSummary[]>;
  getSubmission(id: SubmissionId): Promise<SubmissionDetail>;
}

export interface GoodsReceiptPort {
  /** Ein gescanntes Set gegen die Einreichung abgleichen. */
  scan(id: SubmissionId, ean: string): Promise<ReconcileResult>;
  /** Manuelle Betrags-Anpassung mit Pflicht-Begründung (append-only). */
  addAdjustment(id: SubmissionId, input: AdjustmentInput): Promise<void>;
  /** Finale Liste bestätigen, Beleg erzeugen, Status weiterschalten. */
  closeDeal(id: SubmissionId): Promise<ReceiptId>;
}

export interface AuthPort {
  requestOtp(email: string): Promise<void>;
  verifyOtp(email: string, code: string): Promise<Session>;
  currentSession(): Session | null;
  signOut(): Promise<void>;
}

export interface NotificationPort {
  sendSubmissionReceived(id: SubmissionId): Promise<void>;
  sendDealClosed(id: SubmissionId): Promise<void>;
}

/** Gebündelter Zugriff auf alle Ports. Screens holen sich hieraus nur, was sie brauchen. */
export interface Api {
  catalog: CatalogPort;
  submissions: SubmissionPort;
  goodsReceipt: GoodsReceiptPort;
  auth: AuthPort;
  notifications: NotificationPort;
}
