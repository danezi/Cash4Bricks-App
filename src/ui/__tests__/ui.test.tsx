import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { ScannerFrame } from '@/ui/ScannerFrame';
import { StatusBadge } from '@/ui/StatusBadge';

describe('Button', () => {
  it('meldet Druck und blockiert bei loading', async () => {
    const onPress = jest.fn();
    await render(<Button label="Senden" loading onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('löst onPress im Normalfall aus', async () => {
    const onPress = jest.fn();
    await render(<Button label="Senden" onPress={onPress} />);
    fireEvent.press(screen.getByText('Senden'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('StatusBadge', () => {
  it('zeigt das deutsche Label zum Status', async () => {
    await render(<StatusBadge status="offer_sent" />);
    expect(screen.getByText('Angebot gesendet')).toBeOnTheScreen();
  });
});

describe('Input', () => {
  it('zeigt den Fehlertext an', async () => {
    await render(<Input label="Telefon" value="" onChangeText={() => {}} error="Pflichtfeld" />);
    expect(screen.getByText('Pflichtfeld')).toBeOnTheScreen();
  });
});

describe('ScannerFrame', () => {
  it('zeigt den Standard-Hinweistext', async () => {
    await render(<ScannerFrame />);
    expect(screen.getByText('Barcode des LEGO-Sets in den Rahmen halten')).toBeOnTheScreen();
  });

  it('zeigt einen eigenen Hinweistext, wenn übergeben', async () => {
    await render(<ScannerFrame hint="Testhinweis" />);
    expect(screen.getByText('Testhinweis')).toBeOnTheScreen();
  });

  it('zeigt den Hinweistext immer in Weiß, unabhängig vom Farbschema', async () => {
    // Regression: der abgedunkelte Kamera-Rand ist fest schwarz, unabhängig vom
    // Theme — Text/Eckmarken müssen deshalb ebenso fest hell bleiben, statt
    // `colors.primaryText` zu nutzen (das im Dark Mode fast schwarz wird und auf
    // dem schwarzen Rand unsichtbar wäre).
    await render(<ScannerFrame />);
    expect(screen.getByText('Barcode des LEGO-Sets in den Rahmen halten')).toHaveStyle({
      color: '#FFFFFF',
    });
  });
});
