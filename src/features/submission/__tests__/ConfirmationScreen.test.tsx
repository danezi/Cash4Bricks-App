import { fireEvent, render, screen } from '@testing-library/react-native';

import { ConfirmationScreen } from '@/features/submission/ConfirmationScreen';

describe('ConfirmationScreen', () => {
  it('zeigt die Bestaetigung mit der Kontakt-E-Mail und meldet "Zurück" an den Aufrufer', async () => {
    const onDone = jest.fn();
    await render(<ConfirmationScreen contactEmail="kunde@beispiel.de" onDone={onDone} />);

    expect(screen.getByText('Vielen Dank!')).toBeOnTheScreen();
    expect(screen.getByText(/innerhalb von 24 Stunden/)).toBeOnTheScreen();
    expect(screen.getByText(/kunde@beispiel.de/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Zurück zur Startseite'));
    expect(onDone).toHaveBeenCalled();
  });
});
