import { useEffect, useState } from 'react';

import type { BarcodeMatch, CatalogSet } from '@/domain';
import { Button, Card, Input, ListRow, LoadingState, Screen, Text } from '@/ui';

export interface ConfirmedItem {
  setNumber: string;
  setName: string;
  source: 'scan' | 'manual';
}

export interface ScanResultScreenProps {
  ean: string;
  resolveBarcode: (ean: string) => Promise<BarcodeMatch>;
  confirmBarcode: (ean: string, setNumber: string) => Promise<void>;
  searchSets: (query: string) => Promise<CatalogSet[]>;
  onConfirm: (item: ConfirmedItem) => void;
  onCancel: () => void;
}

const SEARCH_MIN_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

type Mode = 'loading' | 'confirmed' | 'probable' | 'unknown' | 'manual';

/**
 * Ergebnis eines Scans auflösen (AP-1.4): bestätigter Treffer, unsicherer Treffer
 * mit Rückfrage, oder unbekannt → manuelle Eingabe. Kennt weder Kamera noch
 * `expo-router` noch den konkreten Adapter — Zugriffe kommen als Props herein,
 * dadurch ohne Mock/Kamera testbar.
 */
export function ScanResultScreen({
  ean,
  resolveBarcode,
  confirmBarcode,
  searchSets,
  onConfirm,
  onCancel,
}: ScanResultScreenProps) {
  const [mode, setMode] = useState<Mode>('loading');
  const [match, setMatch] = useState<BarcodeMatch | null>(null);
  const [manualNumber, setManualNumber] = useState('');
  const [manualName, setManualName] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogSet[]>([]);
  const [searching, setSearching] = useState(false);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (trimmedQuery.length < SEARCH_MIN_LENGTH) {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setSearching(true);
      searchSets(trimmedQuery).then((sets) => {
        if (cancelled) return;
        setResults(sets);
        setSearching(false);
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmedQuery, searchSets]);

  const showResults = trimmedQuery.length >= SEARCH_MIN_LENGTH ? results : [];
  const showSearching = trimmedQuery.length >= SEARCH_MIN_LENGTH && searching;
  const showNoResults =
    !showSearching && trimmedQuery.length >= SEARCH_MIN_LENGTH && showResults.length === 0;

  useEffect(() => {
    let cancelled = false;
    resolveBarcode(ean).then((result) => {
      if (cancelled) return;
      setMatch(result);
      setMode(result.kind === 'unknown' ? 'unknown' : result.kind);
    });
    return () => {
      cancelled = true;
    };
  }, [ean, resolveBarcode]);

  async function handleConfirmMatch() {
    if (!match || match.kind === 'unknown') return;
    if (match.kind === 'probable') {
      await confirmBarcode(ean, match.set.setNumber);
    }
    onConfirm({ setNumber: match.set.setNumber, setName: match.set.name, source: 'scan' });
  }

  function handleConfirmManual() {
    const setNumber = manualNumber.trim();
    const setName = manualName.trim();
    if (!setNumber || !setName) return;
    onConfirm({ setNumber, setName, source: 'manual' });
  }

  function handlePickSearchResult(set: CatalogSet) {
    onConfirm({ setNumber: set.setNumber, setName: set.name, source: 'manual' });
  }

  if (mode === 'loading') {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (mode === 'confirmed' && match?.kind === 'confirmed') {
    return (
      <Screen>
        <Text variant="title">Set erkannt</Text>
        <Card>
          <Text variant="heading">{match.set.name}</Text>
          <Text tone="muted">{match.set.setNumber}</Text>
        </Card>
        <Button label="Zur Liste hinzufügen" onPress={handleConfirmMatch} />
        <Button
          label="Falsches Set – manuell eingeben"
          variant="ghost"
          onPress={() => setMode('manual')}
        />
        <Button label="Erneut scannen" variant="ghost" onPress={onCancel} />
      </Screen>
    );
  }

  if (mode === 'probable' && match?.kind === 'probable') {
    return (
      <Screen>
        <Text variant="title">Ist das dein LEGO-Set?</Text>
        <Card>
          <Text variant="heading">{match.set.name}</Text>
          <Text tone="muted">
            {match.set.setNumber} · Wahrscheinlichkeit {Math.round(match.confidence * 100)}%
          </Text>
        </Card>
        <Button label="Ja, das ist es" onPress={handleConfirmMatch} />
        <Button
          label="Nein – manuell eingeben"
          variant="secondary"
          onPress={() => setMode('manual')}
        />
        <Button label="Erneut scannen" variant="ghost" onPress={onCancel} />
      </Screen>
    );
  }

  // unknown oder manuelle Eingabe angefordert
  return (
    <Screen>
      <Text variant="title">Set manuell hinzufügen</Text>
      {mode === 'unknown' ? (
        <Text tone="muted">
          Der Barcode {ean} ist uns nicht bekannt. Trag das Set von Hand ein.
        </Text>
      ) : null}

      <Input
        label="Set suchen"
        value={query}
        onChangeText={setQuery}
        placeholder="Name oder Setnummer"
      />
      {showSearching ? <Text tone="muted">Suche läuft…</Text> : null}
      {showResults.map((set) => (
        <ListRow
          key={set.setNumber}
          title={set.name}
          subtitle={set.setNumber}
          onPress={() => handlePickSearchResult(set)}
        />
      ))}
      {showNoResults ? (
        <Text tone="muted">Keine Treffer für „{trimmedQuery}“. Trag das Set von Hand ein:</Text>
      ) : null}

      <Input
        label="Setnummer"
        value={manualNumber}
        onChangeText={setManualNumber}
        placeholder="z. B. 75355"
        keyboardType="number-pad"
      />
      <Input
        label="Bezeichnung"
        value={manualName}
        onChangeText={setManualName}
        placeholder="z. B. X-Wing Starfighter"
      />
      <Button
        label="Hinzufügen"
        onPress={handleConfirmManual}
        disabled={!manualNumber.trim() || !manualName.trim()}
      />
      <Button label="Erneut scannen" variant="ghost" onPress={onCancel} />
    </Screen>
  );
}
