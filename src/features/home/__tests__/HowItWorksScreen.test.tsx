import { fireEvent, render, screen } from '@testing-library/react-native';

import { HowItWorksScreen } from '@/features/home/HowItWorksScreen';

describe('HowItWorksScreen', () => {
  it('zeigt alle sechs Schritte', async () => {
    await render(<HowItWorksScreen />);
    expect(screen.getByText('1. Sets scannen')).toBeOnTheScreen();
    expect(screen.getByText('6. Auszahlung')).toBeOnTheScreen();
  });

  it('zeigt den CTA nur, wenn onCtaPress übergeben wird', async () => {
    const onCtaPress = jest.fn();
    await render(<HowItWorksScreen onCtaPress={onCtaPress} />);
    await fireEvent.press(screen.getByText('Jetzt scannen'));
    expect(onCtaPress).toHaveBeenCalledTimes(1);
  });

  it('ohne onCtaPress erscheint kein Button', async () => {
    await render(<HowItWorksScreen />);
    expect(screen.queryByText('Jetzt scannen')).toBeNull();
  });
});
