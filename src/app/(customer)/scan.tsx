import { Alert } from 'react-native';

import { getApi } from '@/api';
import { ScanScreen, type ScannedCode } from '@/features/scan/ScanScreen';

export default function Scan() {
  async function handleDetected({ data }: ScannedCode) {
    const match = await getApi().catalog.resolveBarcode(data);

    if (match.kind === 'unknown') {
      Alert.alert(
        'Nicht erkannt',
        `EAN ${data} ist nicht bekannt. Manuelle Eingabe + „Ist das dein Set?“ folgen in AP-1.4.`,
      );
      return;
    }

    const confidenceNote =
      match.kind === 'probable' ? ` · Confidence ${Math.round(match.confidence * 100)}%` : '';
    Alert.alert(
      match.kind === 'confirmed' ? 'Set erkannt' : 'Ist das dein Set?',
      `${match.set.name} (${match.set.setNumber})${confidenceNote}`,
    );
  }

  return <ScanScreen onDetected={handleDetected} />;
}
