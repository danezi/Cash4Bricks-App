import { useState } from 'react';
import { Alert } from 'react-native';

import { getApi } from '@/api';
import { ScanScreen, type ScannedCode } from '@/features/scan/ScanScreen';
import { ScanResultScreen, type ConfirmedItem } from '@/features/scan/ScanResultScreen';

export default function Scan() {
  const [ean, setEan] = useState<string | null>(null);

  function handleConfirm(item: ConfirmedItem) {
    // Die echte Sammlungsliste kommt in AP-1.5. Bis dahin nur eine sichtbare
    // Bestätigung, damit sich der ganze Ablauf schon jetzt Ende-zu-Ende prüfen lässt.
    Alert.alert(
      'Zur Liste hinzugefügt',
      `${item.setName} (${item.setNumber}) — die echte Sammlungsliste folgt in AP-1.5.`,
    );
    setEan(null);
  }

  if (ean) {
    return (
      <ScanResultScreen
        ean={ean}
        resolveBarcode={(code) => getApi().catalog.resolveBarcode(code)}
        confirmBarcode={(code, setNumber) => getApi().catalog.confirmBarcode(code, setNumber)}
        onConfirm={handleConfirm}
        onCancel={() => setEan(null)}
      />
    );
  }

  return <ScanScreen onDetected={(code: ScannedCode) => setEan(code.data)} />;
}
