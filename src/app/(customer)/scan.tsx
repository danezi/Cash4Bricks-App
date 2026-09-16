import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { getApi } from '@/api';
import { useCollection } from '@/features/submission/CollectionContext';
import { findBySetNumber } from '@/features/submission/collectionLogic';
import { ScanScreen, type ScannedCode } from '@/features/scan/ScanScreen';
import { ScanResultScreen, type ConfirmedItem } from '@/features/scan/ScanResultScreen';

export default function Scan() {
  const router = useRouter();
  const collection = useCollection();
  const [ean, setEan] = useState<string | null>(null);

  function handleConfirm(item: ConfirmedItem) {
    const existing = findBySetNumber(collection.items, item.setNumber);

    if (existing) {
      Alert.alert('Dieses Set befindet sich bereits in deiner Liste', 'Stückzahl erhöhen?', [
        { text: 'Abbrechen', style: 'cancel', onPress: () => setEan(null) },
        {
          text: 'Ja, erhöhen',
          onPress: () => {
            collection.incrementQty(existing.id);
            setEan(null);
            router.push('/list');
          },
        },
      ]);
      return;
    }

    collection.addItem(item);
    setEan(null);
    router.push('/list');
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
