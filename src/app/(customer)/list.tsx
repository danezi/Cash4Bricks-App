import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { CollectionListScreen } from '@/features/submission/CollectionListScreen';
import { useCollection } from '@/features/submission/CollectionContext';

export default function List() {
  const router = useRouter();
  const collection = useCollection();

  return (
    <CollectionListScreen
      items={collection.items}
      totals={collection.totals}
      onIncrement={collection.incrementQty}
      onDecrement={collection.decrementQty}
      onRemove={collection.removeItem}
      onAddMore={() => router.push('/scan')}
      onRequestOffer={() =>
        Alert.alert('Noch nicht verfügbar', 'Kontaktdaten + „Angebot anfordern“ folgen in AP-1.6.')
      }
    />
  );
}
