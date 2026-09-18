import { View } from 'react-native';

import {
  MIN_QTY,
  type CollectionItem,
  type CollectionTotals,
} from '@/features/submission/collectionLogic';
import { Button, Card, EmptyState, Screen, Text, useTheme } from '@/ui';

export interface CollectionListScreenProps {
  items: CollectionItem[];
  totals: CollectionTotals;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onAddMore: () => void;
  onRequestOffer: () => void;
}

/**
 * Sammlungsliste (AP-1.5): Mengen ändern, Positionen entfernen, weitere Sets
 * scannen, Angebot anfordern. Bekommt Liste + Summen + Aktionen als Props —
 * kennt weder `CollectionContext` noch `expo-router`.
 */
export function CollectionListScreen({
  items,
  totals,
  onIncrement,
  onDecrement,
  onRemove,
  onAddMore,
  onRequestOffer,
}: CollectionListScreenProps) {
  const { spacing } = useTheme();

  if (items.length === 0) {
    return (
      <Screen>
        <Card>
          <EmptyState
            title="Noch keine Sets gescannt"
            hint="Scanne dein erstes LEGO-Set, um es zur Sammlung hinzuzufügen."
          />
          <Button label="Jetzt scannen" onPress={onAddMore} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text tone="muted">
        {totals.setCount} {totals.setCount === 1 ? 'Set' : 'Sets'} · {totals.totalQty} Stück gesamt
      </Text>

      {items.map((item) => (
        <Card key={item.id}>
          <Text variant="bodyStrong">{item.setName}</Text>
          <Text tone="muted" variant="caption">
            {item.setNumber} · {item.source === 'manual' ? 'manuell erfasst' : 'gescannt'}
          </Text>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Button
                label="−"
                variant="secondary"
                disabled={item.qty <= MIN_QTY}
                onPress={() => onDecrement(item.id)}
              />
              <Text variant="bodyStrong">{item.qty}</Text>
              <Button label="+" variant="secondary" onPress={() => onIncrement(item.id)} />
            </View>
            <Button label="Entfernen" variant="ghost" onPress={() => onRemove(item.id)} />
          </View>
        </Card>
      ))}

      <Button label="Weiteres Set scannen" variant="secondary" onPress={onAddMore} />
      <Button label="Angebot anfordern" onPress={onRequestOffer} />
    </Screen>
  );
}
