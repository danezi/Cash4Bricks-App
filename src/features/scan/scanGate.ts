/**
 * Reine Sperr-Logik gegen Mehrfachauslösung: `onBarcodeScanned` feuert wiederholt,
 * solange ein Code im Bild steht. Kein I/O, kein Timer — vollständig testbar.
 */

const SCAN_COOLDOWN_MS = 1500;

export interface ScanGateState {
  /** Zeitstempel (ms) des letzten akzeptierten Scans, oder `null`. */
  lastAcceptedAt: number | null;
}

export function createScanGate(): ScanGateState {
  return { lastAcceptedAt: null };
}

/**
 * Darf ein Scan zum Zeitpunkt `now` akzeptiert werden? Verändert `gate` bei
 * Annahme (setzt `lastAcceptedAt`). Reine Funktion bis auf diese eine Mutation.
 */
export function acceptScan(
  gate: ScanGateState,
  now: number,
  cooldownMs = SCAN_COOLDOWN_MS,
): boolean {
  if (gate.lastAcceptedAt !== null && now - gate.lastAcceptedAt < cooldownMs) {
    return false;
  }
  gate.lastAcceptedAt = now;
  return true;
}
