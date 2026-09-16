import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { BarcodeMatch, CatalogSet } from '@/domain';
import { ScanResultScreen } from '@/features/scan/ScanResultScreen';

const SET: CatalogSet = {
  setNumber: '75355',
  name: 'X-Wing Starfighter',
  year: 2023,
  theme: 'Star Wars',
  parts: 1949,
  imageUrl: null,
};

const FERRARI_SET: CatalogSet = {
  setNumber: '42143',
  name: 'Ferrari Daytona SP3',
  year: 2022,
  theme: 'Technic',
  parts: 3778,
  imageUrl: null,
};

function setup(match: BarcodeMatch) {
  const resolveBarcode = jest.fn().mockResolvedValue(match);
  const confirmBarcode = jest.fn().mockResolvedValue(undefined);
  const searchSets = jest.fn().mockResolvedValue([]);
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  return { resolveBarcode, confirmBarcode, searchSets, onConfirm, onCancel };
}

describe('ScanResultScreen – bestätigter Treffer', () => {
  it('zeigt das Set und meldet die Bestätigung ohne confirmBarcode aufzurufen', async () => {
    const deps = setup({ kind: 'confirmed', set: SET });
    await render(
      <ScanResultScreen
        ean="5702017155821"
        resolveBarcode={deps.resolveBarcode}
        confirmBarcode={deps.confirmBarcode}
        searchSets={deps.searchSets}
        onConfirm={deps.onConfirm}
        onCancel={deps.onCancel}
      />,
    );

    await waitFor(() => expect(screen.getByText('X-Wing Starfighter')).toBeOnTheScreen());
    await fireEvent.press(screen.getByText('Zur Liste hinzufügen'));

    expect(deps.confirmBarcode).not.toHaveBeenCalled();
    expect(deps.onConfirm).toHaveBeenCalledWith({
      setNumber: '75355',
      setName: 'X-Wing Starfighter',
      source: 'scan',
    });
  });
});

describe('ScanResultScreen – unsicherer Treffer', () => {
  it('fragt nach und schreibt bei Bestätigung den Barcode zurück', async () => {
    const deps = setup({ kind: 'probable', set: SET, confidence: 0.55 });
    await render(
      <ScanResultScreen
        ean="5702016909999"
        resolveBarcode={deps.resolveBarcode}
        confirmBarcode={deps.confirmBarcode}
        searchSets={deps.searchSets}
        onConfirm={deps.onConfirm}
        onCancel={deps.onCancel}
      />,
    );

    await waitFor(() => expect(screen.getByText('Ist das dein LEGO-Set?')).toBeOnTheScreen());
    expect(screen.getByText(/55%/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Ja, das ist es'));

    expect(deps.confirmBarcode).toHaveBeenCalledWith('5702016909999', '75355');
    expect(deps.onConfirm).toHaveBeenCalledWith({
      setNumber: '75355',
      setName: 'X-Wing Starfighter',
      source: 'scan',
    });
  });

  it('wechselt bei Ablehnung in die manuelle Eingabe', async () => {
    const deps = setup({ kind: 'probable', set: SET, confidence: 0.55 });
    await render(
      <ScanResultScreen
        ean="5702016909999"
        resolveBarcode={deps.resolveBarcode}
        confirmBarcode={deps.confirmBarcode}
        searchSets={deps.searchSets}
        onConfirm={deps.onConfirm}
        onCancel={deps.onCancel}
      />,
    );

    await waitFor(() => expect(screen.getByText('Ist das dein LEGO-Set?')).toBeOnTheScreen());
    await fireEvent.press(screen.getByText('Nein – manuell eingeben'));

    expect(screen.getByText('Set manuell hinzufügen')).toBeOnTheScreen();
  });
});

describe('ScanResultScreen – unbekannter Barcode', () => {
  it('zeigt direkt die manuelle Eingabe', async () => {
    const deps = setup({ kind: 'unknown', ean: '0000000000000' });
    await render(
      <ScanResultScreen
        ean="0000000000000"
        resolveBarcode={deps.resolveBarcode}
        confirmBarcode={deps.confirmBarcode}
        searchSets={deps.searchSets}
        onConfirm={deps.onConfirm}
        onCancel={deps.onCancel}
      />,
    );

    await waitFor(() => expect(screen.getByText('Set manuell hinzufügen')).toBeOnTheScreen());
    expect(screen.getByText(/nicht bekannt/)).toBeOnTheScreen();
  });

  it('Hinzufügen bleibt gesperrt, bis beide Felder ausgefüllt sind', async () => {
    const deps = setup({ kind: 'unknown', ean: '0000000000000' });
    await render(
      <ScanResultScreen
        ean="0000000000000"
        resolveBarcode={deps.resolveBarcode}
        confirmBarcode={deps.confirmBarcode}
        searchSets={deps.searchSets}
        onConfirm={deps.onConfirm}
        onCancel={deps.onCancel}
      />,
    );

    await waitFor(() => expect(screen.getByText('Set manuell hinzufügen')).toBeOnTheScreen());
    await fireEvent.press(screen.getByText('Hinzufügen'));
    expect(deps.onConfirm).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByLabelText('Setnummer'), '42143');
    await fireEvent.changeText(screen.getByLabelText('Bezeichnung'), 'Ferrari Daytona SP3');
    await fireEvent.press(screen.getByText('Hinzufügen'));

    expect(deps.onConfirm).toHaveBeenCalledWith({
      setNumber: '42143',
      setName: 'Ferrari Daytona SP3',
      source: 'manual',
    });
  });
});

describe('ScanResultScreen – Set-Suche in der manuellen Eingabe', () => {
  it('sucht erst ab 2 Zeichen und zeigt Treffer an', async () => {
    const deps = setup({ kind: 'unknown', ean: '0000000000000' });
    deps.searchSets.mockResolvedValue([FERRARI_SET]);
    await render(
      <ScanResultScreen
        ean="0000000000000"
        resolveBarcode={deps.resolveBarcode}
        confirmBarcode={deps.confirmBarcode}
        searchSets={deps.searchSets}
        onConfirm={deps.onConfirm}
        onCancel={deps.onCancel}
      />,
    );

    await waitFor(() => expect(screen.getByText('Set manuell hinzufügen')).toBeOnTheScreen());
    await fireEvent.changeText(screen.getByLabelText('Set suchen'), 'F');
    expect(deps.searchSets).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByLabelText('Set suchen'), 'Ferrari');
    await waitFor(() => expect(deps.searchSets).toHaveBeenCalledWith('Ferrari'));
    await waitFor(() => expect(screen.getByText('Ferrari Daytona SP3')).toBeOnTheScreen());
  });

  it('fügt einen Suchtreffer per Tippen direkt hinzu', async () => {
    const deps = setup({ kind: 'unknown', ean: '0000000000000' });
    deps.searchSets.mockResolvedValue([FERRARI_SET]);
    await render(
      <ScanResultScreen
        ean="0000000000000"
        resolveBarcode={deps.resolveBarcode}
        confirmBarcode={deps.confirmBarcode}
        searchSets={deps.searchSets}
        onConfirm={deps.onConfirm}
        onCancel={deps.onCancel}
      />,
    );

    await waitFor(() => expect(screen.getByText('Set manuell hinzufügen')).toBeOnTheScreen());
    await fireEvent.changeText(screen.getByLabelText('Set suchen'), 'Ferrari');
    await waitFor(() => expect(screen.getByText('Ferrari Daytona SP3')).toBeOnTheScreen());
    await fireEvent.press(screen.getByText('Ferrari Daytona SP3'));

    expect(deps.onConfirm).toHaveBeenCalledWith({
      setNumber: '42143',
      setName: 'Ferrari Daytona SP3',
      source: 'manual',
    });
  });

  it('zeigt einen Hinweis, wenn die Suche keine Treffer liefert', async () => {
    const deps = setup({ kind: 'unknown', ean: '0000000000000' });
    await render(
      <ScanResultScreen
        ean="0000000000000"
        resolveBarcode={deps.resolveBarcode}
        confirmBarcode={deps.confirmBarcode}
        searchSets={deps.searchSets}
        onConfirm={deps.onConfirm}
        onCancel={deps.onCancel}
      />,
    );

    await waitFor(() => expect(screen.getByText('Set manuell hinzufügen')).toBeOnTheScreen());
    await fireEvent.changeText(screen.getByLabelText('Set suchen'), 'xyz-nichts');
    await waitFor(() => expect(deps.searchSets).toHaveBeenCalledWith('xyz-nichts'));
    await waitFor(() => expect(screen.getByText(/Keine Treffer/)).toBeOnTheScreen());
  });
});
