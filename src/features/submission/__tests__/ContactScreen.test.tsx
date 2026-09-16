import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ContactScreen } from '@/features/submission/ContactScreen';

function setup() {
  const onSubmit = jest.fn();
  return { onSubmit };
}

describe('ContactScreen', () => {
  it('zeigt beide Felder und den Absenden-Button', async () => {
    const deps = setup();
    await render(<ContactScreen setCount={2} totalQty={3} onSubmit={deps.onSubmit} />);

    expect(screen.getByLabelText('E-Mail-Adresse')).toBeOnTheScreen();
    expect(screen.getByLabelText('Telefonnummer')).toBeOnTheScreen();
    expect(screen.getByText('Angebot anfordern')).toBeOnTheScreen();
  });

  it('zeigt Validierungsfehler bei leerem Absenden und ruft onSubmit nicht auf', async () => {
    const deps = setup();
    await render(<ContactScreen setCount={2} totalQty={3} onSubmit={deps.onSubmit} />);

    await fireEvent.press(screen.getByText('Angebot anfordern'));

    await waitFor(() => expect(screen.getByText('Invalid email address')).toBeOnTheScreen());
    expect(deps.onSubmit).not.toHaveBeenCalled();
  });

  it('zeigt einen Fehler bei ungueltiger E-Mail', async () => {
    const deps = setup();
    await render(<ContactScreen setCount={2} totalQty={3} onSubmit={deps.onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('E-Mail-Adresse'), 'keine-email');
    await fireEvent.changeText(screen.getByLabelText('Telefonnummer'), '0151 2345678');
    await fireEvent.press(screen.getByText('Angebot anfordern'));

    await waitFor(() => expect(screen.getByText('Invalid email address')).toBeOnTheScreen());
    expect(deps.onSubmit).not.toHaveBeenCalled();
  });

  it('ruft onSubmit mit den erfassten Kontaktdaten auf', async () => {
    const deps = setup();
    await render(<ContactScreen setCount={2} totalQty={3} onSubmit={deps.onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText('E-Mail-Adresse'), 'kunde@beispiel.de');
    await fireEvent.changeText(screen.getByLabelText('Telefonnummer'), '0151 2345678');
    await fireEvent.press(screen.getByText('Angebot anfordern'));

    await waitFor(() =>
      expect(deps.onSubmit).toHaveBeenCalledWith({
        contactEmail: 'kunde@beispiel.de',
        contactPhone: '0151 2345678',
      }),
    );
  });
});
