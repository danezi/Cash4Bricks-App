import { fireEvent, render, screen } from '@testing-library/react-native';

import { CollectionListScreen } from '@/features/submission/CollectionListScreen';
import type { CollectionItem } from '@/features/submission/collectionLogic';

const ITEMS: CollectionItem[] = [
  { id: 'i1', setNumber: '75355', setName: 'X-Wing Starfighter', qty: 2, source: 'scan' },
  { id: 'i2', setNumber: '42143', setName: 'Ferrari Daytona SP3', qty: 1, source: 'manual' },
];

function setup(items: CollectionItem[]) {
  return {
    onIncrement: jest.fn(),
    onDecrement: jest.fn(),
    onRemove: jest.fn(),
    onAddMore: jest.fn(),
    onRequestOffer: jest.fn(),
    items,
    totals: { setCount: items.length, totalQty: items.reduce((s, i) => s + i.qty, 0) },
  };
}

describe('CollectionListScreen – leer', () => {
  it('zeigt den Leerzustand mit Scan-CTA', async () => {
    const props = setup([]);
    await render(<CollectionListScreen {...props} />);
    expect(screen.getByText('Noch keine Sets gescannt')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Jetzt scannen'));
    expect(props.onAddMore).toHaveBeenCalledTimes(1);
  });
});

describe('CollectionListScreen – mit Positionen', () => {
  it('zeigt Summen und beide Sets', async () => {
    await render(<CollectionListScreen {...setup(ITEMS)} />);
    expect(screen.getByText('2 Sets · 3 Stück gesamt')).toBeOnTheScreen();
    expect(screen.getByText('X-Wing Starfighter')).toBeOnTheScreen();
    expect(screen.getByText('Ferrari Daytona SP3')).toBeOnTheScreen();
  });

  it('meldet Mengenänderung und Entfernen mit der richtigen Item-ID', async () => {
    const props = setup(ITEMS);
    await render(<CollectionListScreen {...props} />);

    await fireEvent.press(screen.getAllByText('+')[0]);
    expect(props.onIncrement).toHaveBeenCalledWith('i1');

    // i1 hat qty 2, das Minus-Feld ist dort nicht gesperrt.
    await fireEvent.press(screen.getAllByText('−')[0]);
    expect(props.onDecrement).toHaveBeenCalledWith('i1');

    await fireEvent.press(screen.getAllByText('Entfernen')[1]);
    expect(props.onRemove).toHaveBeenCalledWith('i2');
  });

  it('sperrt die Mengen-Verringerung bei Stückzahl 1', async () => {
    const props = setup(ITEMS); // i2 hat qty 1
    await render(<CollectionListScreen {...props} />);

    await fireEvent.press(screen.getAllByText('−')[1]);
    expect(props.onDecrement).not.toHaveBeenCalled();
  });

  it('löst Angebot anfordern und weiteres Set scannen aus', async () => {
    const props = setup(ITEMS);
    await render(<CollectionListScreen {...props} />);

    await fireEvent.press(screen.getByText('Weiteres Set scannen'));
    expect(props.onAddMore).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByText('Angebot anfordern'));
    expect(props.onRequestOffer).toHaveBeenCalledTimes(1);
  });

  it('verwendet den Singular bei genau einem Set', async () => {
    await render(<CollectionListScreen {...setup([ITEMS[0]])} />);
    expect(screen.getByText('1 Set · 2 Stück gesamt')).toBeOnTheScreen();
  });
});
