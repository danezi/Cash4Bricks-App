import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  addItem,
  changeQty,
  removeItem,
  totals,
  type CollectionItem,
  type CollectionTotals,
} from '@/features/submission/collectionLogic';

const STORAGE_KEY = 'cash4bricks.collection.v1';

let idSeq = 0;
function nextId(): string {
  idSeq += 1;
  return `item_${Date.now()}_${idSeq}`;
}

interface CollectionContextValue {
  items: CollectionItem[];
  totals: CollectionTotals;
  addItem: (input: {
    setNumber: string;
    setName: string;
    source: CollectionItem['source'];
  }) => void;
  incrementQty: (id: string) => void;
  decrementQty: (id: string) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const hydrated = useRef(false);

  // Einmalig aus AsyncStorage laden — überlebt App-Neustarts.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          setItems(JSON.parse(raw) as CollectionItem[]);
        }
      })
      .catch(() => {
        // Kein Speicher verfügbar (z. B. privater Modus) — Sammlung startet leer.
      })
      .finally(() => {
        hydrated.current = true;
      });
  }, []);

  // Bei jeder Änderung speichern, außer beim allerersten (leeren) Render vor dem Laden.
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {
      // Speichern ist ein Nice-to-have; ein Fehlschlag darf die Liste nicht blockieren.
    });
  }, [items]);

  const value = useMemo<CollectionContextValue>(
    () => ({
      items,
      totals: totals(items),
      addItem: (input) => setItems((prev) => addItem(prev, { ...input, id: nextId() })),
      incrementQty: (id) => setItems((prev) => changeQty(prev, id, 1)),
      decrementQty: (id) => setItems((prev) => changeQty(prev, id, -1)),
      removeItem: (id) => setItems((prev) => removeItem(prev, id)),
      clear: () => setItems([]),
    }),
    [items],
  );

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollection(): CollectionContextValue {
  const ctx = useContext(CollectionContext);
  if (!ctx) {
    throw new Error('useCollection muss innerhalb von <CollectionProvider> aufgerufen werden');
  }
  return ctx;
}
