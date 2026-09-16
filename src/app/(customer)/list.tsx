import { useRouter } from 'expo-router';

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
      onRequestOffer={() => router.push('/contact')}
    />
  );
}
