import { acceptScan, createScanGate } from '@/features/scan/scanGate';

describe('acceptScan', () => {
  it('akzeptiert den ersten Scan sofort', () => {
    const gate = createScanGate();
    expect(acceptScan(gate, 1000)).toBe(true);
  });

  it('lehnt einen weiteren Scan innerhalb der Sperrzeit ab', () => {
    const gate = createScanGate();
    acceptScan(gate, 1000, 1500);
    expect(acceptScan(gate, 1000 + 500, 1500)).toBe(false);
  });

  it('akzeptiert wieder, sobald die Sperrzeit abgelaufen ist', () => {
    const gate = createScanGate();
    acceptScan(gate, 1000, 1500);
    expect(acceptScan(gate, 1000 + 1500, 1500)).toBe(true);
  });

  it('aktualisiert lastAcceptedAt bei jedem akzeptierten Scan', () => {
    const gate = createScanGate();
    acceptScan(gate, 1000, 1500);
    acceptScan(gate, 3000, 1500);
    expect(gate.lastAcceptedAt).toBe(3000);
    expect(acceptScan(gate, 3200, 1500)).toBe(false);
  });
});
